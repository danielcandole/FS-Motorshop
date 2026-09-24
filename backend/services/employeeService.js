import bcrypt from "bcrypt";
import pool from "../config/database.js";

const BCRYPT_SALT_ROUNDS = 12;


// CREATE EMPLOYEE
export async function createEmployeeData(request) {
  try {
    const {firstName, lastName, email, password, role, contactNumber, address, accountStatus} = request.validatedEmployee;

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const [result] = await pool.execute(`
      INSERT INTO employeeAccount (
        firstName, lastName, email, passwordHash, role, contactNumber, address, accountStatus, createdAt, deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, NULL)
    `, [firstName, lastName, email, passwordHash, role, contactNumber, address, accountStatus]
    );

    return {employeeAccountId: result.insertId};
  }
  catch (error) {
    console.error("Create Employee Service:", error);
    throw error;
  }
}


// READ EMPLOYEES
export async function readEmployeeData() {
  try {
    const [employees] = await pool.execute(`
      SELECT employeeAccountId, firstName, lastName, email, role, contactNumber, address, accountStatus, createdAt, deletedAt
      FROM employeeAccount
      WHERE deletedAt IS NULL
      ORDER BY employeeAccountId DESC
    `);
    return employees;
  }
  catch (error) {
    console.error("Read Employee Service:", error);
    throw error;
  }
}


// UPDATE EMPLOYEE
export async function updateEmployeeData(request) {
  try {
    const employeeAccountId = request.employeeId;

    const {
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      address,
      accountStatus
    } = request.validatedEmployee;

    // Verify that the target employee still exists
    // and has not been soft deleted.
    const [employees] = await pool.execute(`
      SELECT
        employeeAccountId
      FROM employeeAccount
      WHERE employeeAccountId = ?
        AND deletedAt IS NULL
      LIMIT 1
    `, [employeeAccountId]);

    if (employees.length === 0) {
      throw new Error("Employee not found.");
    }

    // Update employee without changing the password.
    if (password === undefined) {
      await pool.execute(`
        UPDATE employeeAccount
        SET
          firstName = ?,
          lastName = ?,
          email = ?,
          contactNumber = ?,
          address = ?,
          accountStatus = ?
        WHERE employeeAccountId = ?
          AND deletedAt IS NULL
      `, [
        firstName,
        lastName,
        email,
        contactNumber,
        address,
        accountStatus,
        employeeAccountId
      ]);
    }
    else {
      const passwordHash = await bcrypt.hash(
        password,
        BCRYPT_SALT_ROUNDS
      );

      await pool.execute(`
        UPDATE employeeAccount
        SET
          firstName = ?,
          lastName = ?,
          email = ?,
          passwordHash = ?,
          contactNumber = ?,
          address = ?,
          accountStatus = ?
        WHERE employeeAccountId = ?
          AND deletedAt IS NULL
      `, [
        firstName,
        lastName,
        email,
        passwordHash,
        contactNumber,
        address,
        accountStatus,
        employeeAccountId
      ]);
    }

    return {
      employeeAccountId
    };
  }
  catch (error) {
    console.error("Update Employee Service:", error);
    throw error;
  }
}


// DELETE EMPLOYEE
export async function deleteEmployeeData(request) {
  try {
    const [result] = await pool.execute(`
      UPDATE employeeAccount
      SET deletedAt = CURRENT_TIMESTAMP
      WHERE employeeAccountId = ?
        AND deletedAt IS NULL
    `, [request.employeeId]);

    if (result.affectedRows === 0) {
      throw new Error("Employee not found.");
    }

    return {
      employeeAccountId: request.employeeId
    };
  }
  catch (error) {
    console.error("Delete Employee Service:", error);
    throw error;
  }
}