import pool from "../config/database.js";

export async function createJobOrder(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {customerName, customerContactNumber, motorcycleName, motorcycleModel, repairDate, description, repairStatus} = request.validatedJobOrder;

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
      repairDate,
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

export async function readJobOrder() {
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