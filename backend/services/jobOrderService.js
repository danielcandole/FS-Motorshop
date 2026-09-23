import pool from "../config/database.js";

export async function createJobOrderData(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {customerName, customerContactNumber, motorcycleName, motorcycleModel, repairDate, description, repairStatus} = request.validatedJobOrder;
    const formattedRepairDate = repairDate.replace("T", " ") + ":00";
    // Find customer by contact number
    const [customers] = await connection.execute(`
      SELECT customerRecordId
      FROM customerRecord
      WHERE contactNo = ?
      LIMIT 1
    `, [customerContactNumber]);

    let customerRecordId;

    if (customers.length > 0) {
      customerRecordId = customers[0].customerRecordId;
    }
    else {
      // Create customer if they do not exist
      const [customerResult] = await connection.execute(`
        INSERT INTO customerRecord (
          customerName,
          contactNo
        )
        VALUES (?, ?)
      `, [
        customerName,
        customerContactNumber
      ]);

      customerRecordId = customerResult.insertId;
    }

    // Find motorcycle belonging to the customer
    const [motorcycles] = await connection.execute(`
      SELECT motorcycleRecordId
      FROM motorcycleRecord
      WHERE customerRecordId = ?
        AND motorcycleName = ?
        AND motorcycleModel <=> ?
      LIMIT 1
    `, [
      customerRecordId,
      motorcycleName,
      motorcycleModel || null
    ]);

    let motorcycleRecordId;

    if (motorcycles.length > 0) {
      motorcycleRecordId = motorcycles[0].motorcycleRecordId;
    }
    else {
      const [motorcycleResult] = await connection.execute(`
        INSERT INTO motorcycleRecord (
          customerRecordId,
          motorcycleName,
          motorcycleModel
        )
        VALUES (?, ?, ?)
      `, [
        customerRecordId,
        motorcycleName,
        motorcycleModel || null
      ]);

      motorcycleRecordId = motorcycleResult.insertId;
    }

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

    await connection.commit();

    return {
      jobOrderId: jobOrderResult.insertId,
      customerRecordId,
      motorcycleRecordId
    };
  }
  catch (error) {
    await connection.rollback();
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
        c.customerName,
        c.contactNo,
        m.motorcycleName,
        m.motorcycleModel,
        j.repairDate,
        j.description,
        j.repairStatus
      FROM jobOrder j
      INNER JOIN motorcycleRecord m
        ON j.motorcycleRecordId = m.motorcycleRecordId
      INNER JOIN customerRecord c
        ON m.customerRecordId = c.customerRecordId
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
      repairStatus
    } = request.validatedJobOrder;

    const formattedRepairDate = repairDate.replace("T", " ") + ":00";

    // Check whether the job order exists
    const [jobOrders] = await connection.execute(`
      SELECT jobOrderId
      FROM jobOrder
      WHERE jobOrderId = ?
      LIMIT 1
    `, [jobOrderId]);

    if (jobOrders.length === 0) {
      throw new Error("Job order not found.");
    }

    // Find customer using the new name and contact number
    const [customers] = await connection.execute(`
      SELECT customerRecordId
      FROM customerRecord
      WHERE customerName = ?
        AND contactNo = ?
      LIMIT 1
    `, [
      customerName,
      customerContactNumber
    ]);

    let customerRecordId;

    if (customers.length > 0) {
      // Use the existing matching customer
      customerRecordId = customers[0].customerRecordId;
    }
    else {
      // Create a new customer if no matching record exists
      const [customerResult] = await connection.execute(`
        INSERT INTO customerRecord (
          customerName,
          contactNo
        )
        VALUES (?, ?)
      `, [
        customerName,
        customerContactNumber
      ]);

      customerRecordId = customerResult.insertId;
    }

    // Find motorcycle belonging to the selected customer
    const [motorcycles] = await connection.execute(`
      SELECT motorcycleRecordId
      FROM motorcycleRecord
      WHERE customerRecordId = ?
        AND motorcycleName = ?
        AND motorcycleModel <=> ?
      LIMIT 1
    `, [
      customerRecordId,
      motorcycleName,
      motorcycleModel || null
    ]);

    let motorcycleRecordId;

    if (motorcycles.length > 0) {
      // Use the existing matching motorcycle
      motorcycleRecordId = motorcycles[0].motorcycleRecordId;
    }
    else {
      // Create a motorcycle under the selected customer
      const [motorcycleResult] = await connection.execute(`
        INSERT INTO motorcycleRecord (
          customerRecordId,
          motorcycleName,
          motorcycleModel
        )
        VALUES (?, ?, ?)
      `, [
        customerRecordId,
        motorcycleName,
        motorcycleModel || null
      ]);

      motorcycleRecordId = motorcycleResult.insertId;
    }

    // Update job order and associate it with the selected motorcycle
    await connection.execute(`
      UPDATE jobOrder
      SET
        motorcycleRecordId = ?,
        repairDate = ?,
        description = ?,
        repairStatus = ?
      WHERE jobOrderId = ?
    `, [
      motorcycleRecordId,
      formattedRepairDate,
      description || null,
      repairStatus,
      jobOrderId
    ]);

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
      DELETE FROM jobOrder
      WHERE jobOrderId = ?
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
