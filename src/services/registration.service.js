
import { pool } from "../database/pool.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function handleDatabaseError(error) {
  if (error.code === "23505") {
    throw createError(
      "Ce participant est déjà inscrit à cet événement",
      409
    );
  }

  if (error.code === "23503") {
    throw createError("Événement ou participant introuvable", 404);
  }

  throw error;
}

const registrationFields = `
  r.id,
  r.event_id AS "eventId",
  r.participant_id AS "participantId",
  r.status,
  r.created_at AS "createdAt",
  e.title AS "eventTitle",
  p.full_name AS "participantName",
  p.email AS "participantEmail"
`;

// POST /api/registrations
export async function createRegistration(data) {
  const { eventId, participantId } = data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verrouiller l'événement pour contrôler la capacité
    // même si plusieurs inscriptions arrivent simultanément.
    const eventResult = await client.query(
      `SELECT id, status, max_participants
       FROM events
       WHERE id = $1
       FOR UPDATE`,
      [eventId]
    );

    if (eventResult.rowCount === 0) {
      throw createError("Événement introuvable", 404);
    }

    const event = eventResult.rows[0];

    if (event.status !== "published") {
      throw createError(
        "Les inscriptions nécessitent un événement publié",
        400
      );
    }

    const participantResult = await client.query(
      "SELECT id FROM participants WHERE id = $1",
      [participantId]
    );

    if (participantResult.rowCount === 0) {
      throw createError("Participant introuvable", 404);
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::int AS total
       FROM registrations
       WHERE event_id = $1
         AND status IN ('pending', 'confirmed')`,
      [eventId]
    );

    if (countResult.rows[0].total >= event.max_participants) {
      throw createError("Cet événement est complet", 409);
    }

    const result = await client.query(
      `INSERT INTO registrations (event_id, participant_id)
       VALUES ($1, $2)
       RETURNING
         id,
         event_id AS "eventId",
         participant_id AS "participantId",
         status,
         created_at AS "createdAt"`,
      [eventId, participantId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      throw createError(
        "Ce participant est déjà inscrit à cet événement",
        409
      );
    }

    if (error.code === "23503") {
      throw createError("Événement ou participant introuvable", 404);
    }

    throw error;
  } finally {
    client.release();
  }
}

// GET /api/registrations?eventId=&status=
export async function getRegistrations({ eventId, status } = {}) {
  const conditions = [];
  const values = [];

  if (eventId) {
    values.push(eventId);
    conditions.push(`r.event_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT ${registrationFields}
     FROM registrations r
     JOIN events e ON e.id = r.event_id
     JOIN participants p ON p.id = r.participant_id
     ${whereClause}
     ORDER BY r.created_at DESC`,
    values
  );

  return result.rows;
}

// PATCH /api/registrations/:id/status
export async function updateRegistrationStatus(id, status) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const registrationResult = await client.query(
      `SELECT id, event_id, status
       FROM registrations
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (registrationResult.rowCount === 0) {
      throw createError("Inscription introuvable", 404);
    }

    const registration = registrationResult.rows[0];

    const eventResult = await client.query(
      `SELECT id, status, max_participants
       FROM events
       WHERE id = $1
       FOR UPDATE`,
      [registration.event_id]
    );

    const event = eventResult.rows[0];

    if (status !== "cancelled") {
      if (event.status !== "published") {
        throw createError(
          "Impossible de réactiver une inscription sur un événement non publié",
          400
        );
      }

      const countResult = await client.query(
        `SELECT COUNT(*)::int AS total
         FROM registrations
         WHERE event_id = $1
           AND status IN ('pending', 'confirmed')
           AND id <> $2`,
        [event.id, id]
      );

      if (countResult.rows[0].total >= event.max_participants) {
        throw createError("Cet événement est complet", 409);
      }
    }

    const result = await client.query(
      `UPDATE registrations
       SET status = $1
       WHERE id = $2
       RETURNING
         id,
         event_id AS "eventId",
         participant_id AS "participantId",
         status,
         created_at AS "createdAt"`,
      [status, id]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
