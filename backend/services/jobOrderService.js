import pool from "../config/database.js";

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
      reportedProblem,
      repairStatus
    } = request.validatedJobOrder;

    const formattedRepairDate = repairDate.replace("T", " ") + ":00";

    // Create customer
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

    const customerRecordId = customerResult.insertId;

    // Create motorcycle under the new customer
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

    const motorcycleRecordId = motorcycleResult.insertId;

    // Create job order
    const [jobOrderResult] = await connection.execute(`
      INSERT INTO jobOrder (
        employeeAccountId,
        motorcycleRecordId,
        repairDate,
        reportedProblem,
        repairStatus
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      request.employee.employeeAccountId,
      motorcycleRecordId,
      formattedRepairDate,
      reportedProblem || null,
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
        j.reportedProblem,
        j.repairStatus
      FROM jobOrder AS j
      INNER JOIN motorcycleRecord AS m
        ON j.motorcycleRecordId = m.motorcycleRecordId
      INNER JOIN customerRecord AS c
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
      customerRecordId,
      motorcycleName,
      motorcycleModel,
      repairDate,
      reportedProblem,
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

    // Check whether the customer exists
    const [customers] = await connection.execute(`
      SELECT customerRecordId
      FROM customerRecord
      WHERE customerRecordId = ?
      LIMIT 1
    `, [customerRecordId]);

    if (customers.length === 0) {
      throw new Error("Customer not found.");
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
      // Create motorcycle under the selected customer
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

    // Update job order
    await connection.execute(`
      UPDATE jobOrder
      SET
        motorcycleRecordId = ?,
        repairDate = ?,
        reportedProblem = ?,
        repairStatus = ?
      WHERE jobOrderId = ?
    `, [
      motorcycleRecordId,
      formattedRepairDate,
      reportedProblem || null,
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