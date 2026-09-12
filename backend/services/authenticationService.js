import pool from "../config/database.js";
import { verifyPassword } from "./passwordService.js";

export async function authenticationCredentials(email, password) {
  const [rows] = await pool.execute(
    `
    SELECT
      email,
      passwordHash,
      accountStatus
    FROM employeeAccount
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  if (rows.length === 0) { return null; }

  const employee = rows[0];

  if (employee.accountStatus !=="active") { return null;}

  const passwordValid = verifyPassword(password, employee.passwordHash);
  if (!passwordValid) {return null;}

  delete employee.passwordHash;

  return employee;
}








