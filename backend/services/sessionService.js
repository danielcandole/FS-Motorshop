import crypto from "crypto";
import pool from "../config/database.js";

const SESSION_DURATION = 8 * 60 * 60 * 1000;

export async function createSession(employeeAccountId) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const csrfToken = crypto.randomBytes(32).toString("hex");
  const sessionTokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const csrfTokenHash = crypto.createHash("sha256").update(csrfToken).digest("hex");

  await pool.execute(`
    INSERT INTO employeeSession
    (employeeAccountId, sessionTokenHash, expiresAt, csrfTokenHash)
    VALUES (?, ?, ?, ?)  
  `,[employeeAccountId, sessionTokenHash, expiresAt, csrfTokenHash]);

  return {sessionToken, csrfToken};
}

export async function getSession(sessionToken) {
  const sessionTokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");

  const [rows] = await pool.execute(`
    SELECT
      employeeSessionId,
      employeeAccountId,
      expiresAt
    FROM employeeSession
    WHERE sessionTokenHash = ?
    LIMIT 1
    `,[sessionTokenHash]);

  if (rows.length === 0) { return null; }

  return rows[0];
}

export async function deleteSession(sessionToken) {
  const sessionTokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
  await pool.execute(`
    DELETE FROM employeeSession
    WHERE sessionTokenHash = ?
  `,[sessionTokenHash]);
}






