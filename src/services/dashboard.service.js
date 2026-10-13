
import { pool } from "../database/pool.js";

export async function getDashboardStats() {
  const client = await pool.connect();

  try {
    const statsResult = await client.query(`
      SELECT
        COUNT(*)::int AS "totalEvents",
        COUNT(*) FILTER (
          WHERE status = 'published'
        )::int AS "publishedEvents"
      FROM events
    `);

    const registrationsResult = await client.query(`
      SELECT COUNT(*)::int AS "todayRegistrations"
      FROM registrations
      WHERE created_at >= CURRENT_DATE
        AND created_at < CURRENT_DATE + INTERVAL '1 day'
    `);

    const topEventsResult = await client.query(`
      SELECT
        e.id,
        e.title,
        e.status,
        e.max_participants AS "maxParticipants",
        COUNT(r.id) FILTER (
          WHERE r.status IN ('pending', 'confirmed')
        )::int AS "registrationsCount",
        ROUND(
          (
            COUNT(r.id) FILTER (
              WHERE r.status IN ('pending', 'confirmed')
            )::numeric
            / NULLIF(e.max_participants, 0)
          ) * 100,
          2
        ) AS "fillRate"
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      GROUP BY
        e.id,
        e.title,
        e.status,
        e.max_participants
      ORDER BY
        "fillRate" DESC NULLS LAST,
        "registrationsCount" DESC,
        e.title ASC
      LIMIT 5
    `);

    return {
      ...statsResult.rows[0],
      ...registrationsResult.rows[0],
      topEvents: topEventsResult.rows,
    };
  } finally {
    client.release();
  }
}
