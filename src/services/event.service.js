
import { pool } from "../database/pool.js";

const eventFields = `
  id, title, description, location,
  event_date AS "eventDate",
  max_participants AS "maxParticipants",
  status,
  created_by AS "createdBy",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Build an ownership condition for staff.
// Admins can access all events.
function addOwnershipFilter(conditions, values, userId, userRole) {
  if (userRole !== "admin") {
    values.push(userId);
    conditions.push(`created_by = $${values.length}`);
  }
}

export async function getAllEvents({
  status,
  date,
  userId,
  userRole,
} = {}) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (date) {
    values.push(date);
    conditions.push(`
      event_date >= $${values.length}::date
      AND event_date < ($${values.length}::date + INTERVAL '1 day')
    `);
  }

  addOwnershipFilter(conditions, values, userId, userRole);

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT ${eventFields}
     FROM events
     ${whereClause}
     ORDER BY event_date ASC`,
    values
  );

  return result.rows;
}

export async function getEventById(id, userId, userRole) {
  const values = [id];
  let ownershipCondition = "";

  if (userRole !== "admin") {
    values.push(userId);
    ownershipCondition = `AND created_by = $${values.length}`;
  }

  const result = await pool.query(
    `SELECT ${eventFields}
     FROM events
     WHERE id = $1
     ${ownershipCondition}`,
    values
  );

  if (!result.rows[0]) {
    throw createError("Événement introuvable", 404);
  }

  return result.rows[0];
}

export async function createEvent(data, userId) {
  const {
    title,
    description,
    location,
    eventDate,
    maxParticipants,
    status = "draft",
  } = data;

  const result = await pool.query(
    `INSERT INTO events (
       title, description, location, event_date,
       max_participants, status, created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${eventFields}`,
    [
      title,
      description ?? null,
      location,
      eventDate,
      maxParticipants,
      status,
      userId,
    ]
  );

  return result.rows[0];
}

export async function updateEvent(
  id,
  data,
  userId,
  userRole
) {
  const allowedFields = {
    title: "title",
    description: "description",
    location: "location",
    eventDate: "event_date",
    maxParticipants: "max_participants",
    status: "status",
  };

  const entries = Object.entries(data).filter(
    ([key, value]) =>
      allowedFields[key] && value !== undefined
  );

  if (entries.length === 0) {
    throw createError("Aucune donnée à modifier", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const values = entries.map(([, value]) => value);
    const assignments = entries.map(
      ([key], index) => `${allowedFields[key]} = $${index + 1}`
    );

    values.push(id);
    let whereClause = `id = $${values.length}`;

    if (userRole !== "admin") {
      values.push(userId);
      whereClause += ` AND created_by = $${values.length}`;
    }

    const result = await client.query(
      `UPDATE events
       SET ${assignments.join(", ")},
           updated_at = NOW()
       WHERE ${whereClause}
       RETURNING ${eventFields}`,
      values
    );

    const event = result.rows[0];

    if (!event) {
      throw createError(
        "Événement introuvable ou accès non autorisé",
        404
      );
    }

    if (data.status === "cancelled") {
      await client.query(
        `UPDATE registrations
         SET status = 'cancelled'
         WHERE event_id = $1
           AND status <> 'cancelled'`,
        [id]
      );
    }

    await client.query("COMMIT");
    return event;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateEventStatus(
  id,
  status,
  userId,
  userRole
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const values = [status, id];
    let ownershipCondition = "";

    if (userRole !== "admin") {
      values.push(userId);
      ownershipCondition = `AND created_by = $${values.length}`;
    }

    const result = await client.query(
      `UPDATE events
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       ${ownershipCondition}
       RETURNING ${eventFields}`,
      values
    );

    const event = result.rows[0];

    if (!event) {
      throw createError(
        "Événement introuvable ou accès non autorisé",
        404
      );
    }

    if (status === "cancelled") {
      await client.query(
        `UPDATE registrations
         SET status = 'cancelled'
         WHERE event_id = $1
           AND status <> 'cancelled'`,
        [id]
      );
    }

    await client.query("COMMIT");
    return event;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
