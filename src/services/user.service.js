import { pool } from "../database/pool.js";

export async function findAllUsers() {
  const result = await pool.query(`
    SELECT
      id,
      full_name AS "fullName",
      email,
      role,
      created_at AS "createdAt"
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
}