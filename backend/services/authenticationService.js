import pool from "../config/database.js";
import { verifyPassword } from "./passwordService.js";

export async function authenticationCredentials(email, password) {
  const [rows] = await pool.execute(`
    SELECT
      employeeAccountId,
      email,
      passwordHash,
      accountStatus,
      role
    FROM employeeAccount
    WHERE email = ?
    LIMIT 1
  `,[email]);

  if (rows.length === 0) { return null; }

  const employee = rows[0];

  if (employee.accountStatus !=="active") { return null;}

  const passwordValid = verifyPassword(password, employee.passwordHash);
  if (!passwordValid) {return null;}

  delete employee.passwordHash;

  return employee;
}

import bcrypt from "bcrypt";
import pool from "../config/database.js";

const BCRYPT_SALT_ROUNDS = 12;


// GET EMPLOYEE BY ID
export async function getEmployeeById(employeeAccountId) {
  try {
    const [employees] = await pool.execute(`
      SELECT
        employeeAccountId,
        firstName,
        lastName,
        email,
        roleId,
        accountStatus
      FROM employeeAccount
      WHERE employeeAccountId = ?
        AND deletedAt IS NULL
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








