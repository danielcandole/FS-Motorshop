import pool from "../config/database.js";
import { deductInventoryStock } from "./inventoryItemService.js";
import { createStockTransaction } from "./stockTransactionService.js";

export async function createJobOrderData(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      customerName,
      customerContactNumber,
      motorcycleName,
      motorcycleModel,
      repairDate,
      description,
      repairStatus,
      serviceRecords,
      jobOrderItems
    } = request.validatedJobOrder;

    const formattedRepairDate = repairDate.replace("T", " ") + ":00";

    // Create customer
    const [customerResult] = await connection.execute(`
      INSERT INTO customerRecord (customerName, contactNo)
      VALUES (?, ?)
    `, [customerName, customerContactNumber]);

    const customerRecordId = customerResult.insertId;

    // Create motorcycle
    const [motorcycleResult] = await connection.execute(`
      INSERT INTO motorcycleRecord (customerRecordId, motorcycleName, motorcycleModel)
      VALUES (?, ?, ?)
    `, [customerRecordId, motorcycleName, motorcycleModel || null]);

    const motorcycleRecordId = motorcycleResult.insertId;

    // Create job order
    const [jobOrderResult] = await connection.execute(`
      INSERT INTO jobOrder (
        employeeAccountId,
        motorcycleRecordId,
        repairDate,
        description,
        repairStatus
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      request.employee.employeeAccountId,
      motorcycleRecordId,
      formattedRepairDate,
      description || null,
      repairStatus
    ]);

    const jobOrderId = jobOrderResult.insertId;

    // CREATE SERVICE RECORDS
    for (const service of serviceRecords) {
      const {serviceType, serviceDescription, laborCharge} = service;

      await connection.execute(`
        INSERT INTO serviceRecord (
          jobOrderId,
          serviceType,
          serviceDescription,
          laborCharge
        )
        VALUES (?, ?, ?, ?)
      `, [
        jobOrderId,
        serviceType,
        serviceDescription || null,
        laborCharge
      ]);
    }

    // Create job order items
    for (const item of jobOrderItems) {
      const {inventoryItemId, quantityUsed, unitPrice } = item;

      await deductInventoryStock(connection, inventoryItemId, quantityUsed);

      await connection.execute(`
        INSERT INTO jobOrderItem (
          jobOrderId,
          inventoryItemId,
          quantityUsed,
          unitPrice
        )
        VALUES (?, ?, ?, ?)
      `, [jobOrderId, inventoryItemId, quantityUsed, unitPrice]);
    }

    await connection.commit();

    return { jobOrderId, customerRecordId, motorcycleRecordId };
  }
  catch (error) {
    await connection.rollback();
    console.error("Create Job Order Service:", error);
    throw error;
  }
  finally {
    connection.release();
  }
}

export async function readJobOrderData() {
  try {
    const [jobOrders] = await pool.execute(`
      SELECT
        j.jobOrderId,
        c.customerRecordId,
        c.customerName,
        c.contactNo,
        m.motorcycleRecordId,
        m.motorcycleName,
        m.motorcycleModel,
        j.repairDate,
        j.description,
        j.repairStatus,

        ji.jobOrderItemId,
        ji.inventoryItemId,
        ii.itemName,
        ji.quantityUsed,
        ji.unitPrice,

        sr.serviceRecordId,
        sr.serviceType,
        sr.serviceDescription,
        sr.laborCharge

      FROM jobOrder AS j

      INNER JOIN motorcycleRecord AS m
        ON j.motorcycleRecordId = m.motorcycleRecordId

      INNER JOIN customerRecord AS c
        ON m.customerRecordId = c.customerRecordId

      LEFT JOIN jobOrderItem AS ji
        ON j.jobOrderId = ji.jobOrderId

      LEFT JOIN inventoryItem AS ii
        ON ji.inventoryItemId = ii.inventoryItemId

      LEFT JOIN serviceRecord AS sr
        ON j.jobOrderId = sr.jobOrderId

      WHERE j.deletedAt IS NULL

      ORDER BY j.jobOrderId DESC
    `);

    return jobOrders;
  }
  catch (error) {
    console.error("Read Job Order Service:", error);
    throw error;
  }
}

export async function updateJobOrderData(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const jobOrderId = request.jobOrderId;
    const {
      customerName,
      customerContactNumber,
      motorcycleName,
      motorcycleModel,
      repairDate,
      description,
      repairStatus,
      serviceRecords,
      jobOrderItems
    } = request.validatedJobOrder;

    const formattedRepairDate = repairDate.replace("T", " ") + ":00";

    // FIND ACTIVE JOB ORDER
    const [jobOrders] = await connection.execute(`
      SELECT j.jobOrderId, j.motorcycleRecordId, m.customerRecordId
      FROM jobOrder AS j
      INNER JOIN motorcycleRecord AS m
        ON j.motorcycleRecordId = m.motorcycleRecordId
      WHERE j.jobOrderId = ?
        AND j.deletedAt IS NULL
      LIMIT 1
    `, [jobOrderId]);

    if (jobOrders.length === 0) {
      throw new Error("Job order not found.");
    }

    const { customerRecordId, motorcycleRecordId } = jobOrders[0];

    // UPDATE CUSTOMER
    await connection.execute(`
      UPDATE customerRecord
      SET customerName = ?, contactNo = ?
      WHERE customerRecordId = ?
    `, [customerName, customerContactNumber, customerRecordId]);

    // UPDATE MOTORCYCLE
    await connection.execute(`
      UPDATE motorcycleRecord
      SET motorcycleName = ?, motorcycleModel = ?
      WHERE motorcycleRecordId = ?
        AND customerRecordId = ?
    `, [motorcycleName, motorcycleModel || null, motorcycleRecordId, customerRecordId]);

    // UPDATE JOB ORDER
    await connection.execute(`
      UPDATE jobOrder
      SET repairDate = ?, description = ?, repairStatus = ?
      WHERE jobOrderId = ?
        AND deletedAt IS NULL
    `, [formattedRepairDate, description || null, repairStatus, jobOrderId]);

    // UPDATE SERVICE RECORDS
    await connection.execute(`
      DELETE FROM serviceRecord
      WHERE jobOrderId = ?
    `, [jobOrderId]);

    for (const service of serviceRecords) {
      await connection.execute(`
        INSERT INTO serviceRecord (
          jobOrderId,
          serviceType,
          serviceDescription,
          laborCharge
        )
        VALUES (?, ?, ?, ?)
      `, [
        jobOrderId,
        service.serviceType,
        service.serviceDescription || null,
        service.laborCharge
      ]);
    }

    // GET EXISTING JOB ORDER ITEMS
    const [existingItems] = await connection.execute(`
      SELECT inventoryItemId, quantityUsed
      FROM jobOrderItem
      WHERE jobOrderId = ?
    `, [jobOrderId]);

    // CALCULATE OLD AND NEW QUANTITIES
    const oldQuantities = new Map();
    const newQuantities = new Map();

    for (const item of existingItems) {
      const id = item.inventoryItemId;
      oldQuantities.set(id, (oldQuantities.get(id) || 0) + item.quantityUsed);
    }

    for (const item of jobOrderItems) {
      const id = item.inventoryItemId;
      newQuantities.set(id, (newQuantities.get(id) || 0) + item.quantityUsed);
    }

    // ADJUST INVENTORY STOCK
    const inventoryItemIds = new Set([
      ...oldQuantities.keys(),
      ...newQuantities.keys()
    ]);

    for (const inventoryItemId of inventoryItemIds) {
      const oldQuantity = oldQuantities.get(inventoryItemId) || 0;
      const newQuantity = newQuantities.get(inventoryItemId) || 0;
      const difference = newQuantity - oldQuantity;

      if (difference > 0) {
        await deductInventoryStock(connection, inventoryItemId, difference);
      }
      else if (difference < 0) {
        const quantityReturned = Math.abs(difference);

        await connection.execute(`
          UPDATE inventoryItem
          SET quantity = quantity + ?
          WHERE inventoryItemId = ?
        `, [quantityReturned, inventoryItemId]);

        await createStockTransaction(
          connection,
          quantityReturned,
          "Stock In",
          { inventoryItemId }
        );
      }
    }

    // UPDATE JOB ORDER ITEMS
    await connection.execute(`
      DELETE FROM jobOrderItem
      WHERE jobOrderId = ?
    `, [jobOrderId]);

    for (const item of jobOrderItems) {
      await connection.execute(`
        INSERT INTO jobOrderItem (
          jobOrderId, inventoryItemId, quantityUsed, unitPrice
        )
        VALUES (?, ?, ?, ?)
      `, [
        jobOrderId,
        item.inventoryItemId,
        item.quantityUsed,
        item.unitPrice
      ]);
    }

    await connection.commit();

    return {
      jobOrderId,
      customerRecordId,
      motorcycleRecordId
    };
  }
  catch (error) {
    await connection.rollback();
    console.error("Update Job Order Service:", error);
    throw error;
  }
  finally {
    connection.release();
  }
}

export async function deleteJobOrderData(request) {
  try {
    const [result] = await pool.execute(`
      UPDATE jobOrder
      SET deletedAt = CURRENT_TIMESTAMP
      WHERE jobOrderId = ?
        AND deletedAt IS NULL
    `, [request.jobOrderId]);

    if (result.affectedRows === 0) {
      throw new Error("Job order not found.");
    }

    return {
      jobOrderId: request.jobOrderId
    };
  }
  catch (error) {
    console.error("Delete Job Order Service:", error);
    throw error;
  }
}