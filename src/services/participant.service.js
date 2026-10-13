
import { pool } from "../database/pool.js";

const participantFields = `
  id,
  full_name AS "fullName",
  email,
  phone,
  created_at AS "createdAt"
`;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function handleDatabaseError(error) {
  if (error.code === "23505") {
    throw createError("Cette adresse email existe déjà", 409);
  }

  throw error;
}

// POST /api/participants
export async function createParticipant(data) {
  const { fullName, email, phone } = data;

  try {
    const result = await pool.query(
      `INSERT INTO participants (full_name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING ${participantFields}`,
      [fullName, email, phone || null]
    );

    return result.rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
}

// GET /api/participants?search=
export async function getParticipants(search = "") {
  const result = await pool.query(
    `SELECT ${participantFields}
     FROM participants
     WHERE full_name ILIKE $1
        OR email ILIKE $1
     ORDER BY created_at DESC`,
    [`%${search}%`]
  );

  return result.rows;
}

// PUT /api/participants/:id
export async function updateParticipant(id, data) {
  const { fullName, email, phone } = data;

  try {
    const result = await pool.query(
      `UPDATE participants
       SET full_name = $1,
           email = $2,
           phone = $3
       WHERE id = $4
       RETURNING ${participantFields}`,
      [fullName, email, phone || null, id]
    );

    if (result.rowCount === 0) {
      throw createError("Participant introuvable", 404);
    }

    return result.rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
}
