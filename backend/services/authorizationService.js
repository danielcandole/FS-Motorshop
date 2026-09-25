import pool from "../config/database.js";

// GET TARGET EMPLOYEE AUTHORIZATION DATA
export async function getRoleTarget(targetId) {
  try {
    const [employees] = await pool.execute(`
      SELECT
        ea.employeeAccountId,
        ea.roleId,
        r.roleName
      FROM employeeAccount AS ea
      JOIN role AS r
        ON ea.roleId = r.roleId
      WHERE ea.employeeAccountId = ?
        AND ea.deletedAt IS NULL
      LIMIT 1
    `, [targetId]);

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

export async function hasPermission(employeeId, permissionName) {
  try {
    const [permissions] = await pool.execute(`
      SELECT
        p.permissionId
      FROM employeeAccount AS ea
      JOIN rolePermission AS rp
        ON ea.roleId = rp.roleId
      JOIN permission AS p
        ON rp.permissionId = p.permissionId
      WHERE ea.employeeAccountId = ?
        AND ea.deletedAt IS NULL
        AND p.permissionName = ?
      LIMIT 1
    `, [employeeId, permissionName]);

    return permissions.length > 0;
  }
  catch (error) {
    console.error("Has Permission Service:", error);
    throw error;
  }
}
