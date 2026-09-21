import pool from "../config/database.js";

export async function createJobOrder(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {customerName, customerContactNumber, motorcycleName, motorcycleModel, repairDate, reportedProblem, repairStatus} = request.validatedJobOrder;

    let customerRecordId = request.verifiedCustomer?.customerRecordId;

    // Create customer if it does not exist
    if (!customerRecordId) {
      const [customerResult] = await connection.execute(`
        INSERT INTO customerRecord (
          customerName,
          contactNo
        )
        VALUES (?, ?)
      `, [customerName, customerContactNumber]);

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
        reportedProblem,
        repairStatus
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      request.employee.employeeAccountId,
      motorcycleRecordId,
      repairDate,
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
    throw error;
  }
  finally {
    connection.release();
  }
}