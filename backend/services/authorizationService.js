import pool from "../config/database.js";

// GET TARGET EMPLOYEE AUTHORIZATION DATA
export async function getEmployeeAuthorizationData(employeeId) {
  try {
    const [employees] = await pool.execute(`
      SELECT
        employeeAccountId,
        role
      FROM employeeAccount
      WHERE employeeAccountId = ?
        AND deletedAt IS NULL
      LIMIT 1
    `, [employeeId]);

    if (employees.length === 0) {
      throw new Error("Employee not found.");
    }

    return employees[0];
  }
  catch (error) {
    console.error("Get Employee Authorization Service:", error);
    throw error;
  }
}
