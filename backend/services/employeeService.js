import bcrypt from "bcrypt";
import pool from "../config/database.js";
const BCRYPT_SALT_ROUNDS = 12;

// GET EMPLOYEE ROLES
export async function getEmployeeRole() {
  try {
    const [roles] = await pool.execute(`
      SELECT
        roleId,
        roleName
      FROM role
      ORDER BY roleId ASC
    `);

    return roles;
  }
  catch (error) {
    console.error("Get Employee Roles Service:", error);
    throw error;
  }
}

// GET EMPLOYEE BY ID
export async function getEmployeeById(employeeAccountId) {
  try {
    const [employees] = await pool.execute(`
      SELECT
        ea.employeeAccountId,
        ea.firstName,
        ea.lastName,
        ea.email,
        ea.roleId,
        r.roleName,
        ea.contactNumber,
        ea.address,
        ea.accountStatus
      FROM employeeAccount AS ea
      JOIN role AS r
        ON ea.roleId = r.roleId
      WHERE ea.employeeAccountId = ?
        AND ea.deletedAt IS NULL
      LIMIT 1
    `, [employeeAccountId]);

    if (employees.length === 0) {
      return null;
    }

    return employees[0];
  }
  catch (error) {
    console.error("Get Employee By ID Service:", error);
    throw error;
  }
}

// CREATE EMPLOYEE
export async function createEmployeeData(request) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      roleId,
      contactNumber,
      address
    } = request.validatedEmployee;

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const [result] = await pool.execute(`
      INSERT INTO employeeAccount (
        firstName,
        lastName,
        email,
        passwordHash,
        roleId,
        contactNumber,
        address,
        accountStatus,
        createdAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, NULL)
    `, [
      firstName,
      lastName,
      email,
      passwordHash,
      roleId,
      contactNumber,
      address
    ]);

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
      SELECT
        ea.employeeAccountId,
        ea.firstName,
        ea.lastName,
        ea.email,
        ea.roleId,
        r.roleName,
        ea.contactNumber,
        ea.address,
        ea.accountStatus,
        ea.createdAt
      FROM employeeAccount AS ea
      JOIN role AS r
        ON ea.roleId = r.roleId
      WHERE ea.deletedAt IS NULL
      ORDER BY ea.employeeAccountId DESC
    `);

    return employees;
  }
  catch (error) {
    console.error("Read Employee Service:", error);
    throw error;
  }
}

// UPDATE EMPLOYEE PASSWORD
export async function updateEmployeePassword(request) {
  try {
    const employeeAccountId = request.employeeId;
    const password = request.validatedEmployee.password;

    if (!password) {
      return {employeeAccountId};
    }

    const passwordHash = await bcrypt.hash(
      password,
      BCRYPT_SALT_ROUNDS
    );

    const [result] = await pool.execute(`
      UPDATE employeeAccount
      SET
        passwordHash = ?
      WHERE employeeAccountId = ?
        AND deletedAt IS NULL
    `, [
      passwordHash,
      employeeAccountId
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Employee not found.");
    }

    return {employeeAccountId};
  }
  catch (error) {
    console.error("Update Employee Password Service:", error);
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
      contactNumber,
      address
    } = request.validatedEmployee;

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

    await pool.execute(`
      UPDATE employeeAccount
      SET
        firstName = ?,
        lastName = ?,
        email = ?,
        contactNumber = ?,
        address = ?
      WHERE employeeAccountId = ?
        AND deletedAt IS NULL
    `, [
      firstName,
      lastName,
      email,
      contactNumber,
      address,
      employeeAccountId
    ]);

    return {employeeAccountId};
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

    return {employeeAccountId: request.employeeId};
  }
  catch (error) {
    console.error("Delete Employee Service:", error);
    throw error;
  }
}