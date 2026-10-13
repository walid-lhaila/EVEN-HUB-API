
import "dotenv/config";
import bcrypt from "bcrypt";
import { pool } from "../pool.js";

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      TRUNCATE TABLE registrations, events, participants, users
      RESTART IDENTITY CASCADE
    `);

    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const staffPassword = await bcrypt.hash("Staff123!", 10);

    const adminResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ["Admin EventHub", "admin@eventhub.com", adminPassword, "admin"]
    );

    const staffResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ["Staff EventHub", "staff@eventhub.com", staffPassword, "staff"]
    );

    const adminId = adminResult.rows[0].id;
    const staffId = staffResult.rows[0].id;

    const eventData = [
      {
        title: "Tech Conference 2026",
        description: "Conférence autour des technologies modernes.",
        location: "Casablanca",
        days: 30,
        capacity: 8,
        status: "published",
        creator: adminId,
      },
      {
        title: "React Workshop",
        description: "Atelier pratique React et Vite.",
        location: "Rabat",
        days: 35,
        capacity: 7,
        status: "published",
        creator: staffId,
      },
      {
        title: "Node.js Meetup",
        description: "Rencontre autour de Node.js et Express.",
        location: "Marrakech",
        days: 40,
        capacity: 10,
        status: "published",
        creator: adminId,
      },
      {
        title: "PostgreSQL Training",
        description: "Formation sur PostgreSQL.",
        location: "Safi",
        days: 45,
        capacity: 20,
        status: "draft",
        creator: staffId,
      },
      {
        title: "Startup Networking",
        description: "Événement de networking.",
        location: "Tanger",
        days: 50,
        capacity: 15,
        status: "cancelled",
        creator: adminId,
      },
    ];

    const eventIds = [];

    for (const event of eventData) {
      const result = await client.query(
        `INSERT INTO events
          (title, description, location, event_date,
           max_participants, status, created_by)
         VALUES
          ($1, $2, $3, NOW() + ($4 * INTERVAL '1 day'),
           $5, $6, $7)
         RETURNING id`,
        [
          event.title,
          event.description,
          event.location,
          event.days,
          event.capacity,
          event.status,
          event.creator,
        ]
      );

      eventIds.push(result.rows[0].id);
    }

    const participantIds = [];

    for (let i = 1; i <= 10; i++) {
      const result = await client.query(
        `INSERT INTO participants (full_name, email, phone)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          `Participant ${i}`,
          `participant${i}@example.com`,
          `+2126000000${String(i).padStart(2, "0")}`,
        ]
      );

      participantIds.push(result.rows[0].id);
    }


    const registrationPlan = [
      { eventIndex: 0, participantIndexes: [0, 1, 2, 3, 4, 5, 6, 7] },
      { eventIndex: 1, participantIndexes: [0, 1, 2, 3, 4, 5, 8] },
      { eventIndex: 2, participantIndexes: [0, 1, 2, 7, 9] },
    ];

    let registrationCount = 0;

    for (const plan of registrationPlan) {
      for (const participantIndex of plan.participantIndexes) {
        const status =
          registrationCount % 3 === 0 ? "pending" : "confirmed";

        await client.query(
          `INSERT INTO registrations (event_id, participant_id, status)
           VALUES ($1, $2, $3)`,
          [
            eventIds[plan.eventIndex],
            participantIds[participantIndex],
            status,
          ]
        );

        registrationCount++;
      }
    }

    await client.query("COMMIT");

    console.log("Seed completed successfully!");
    console.log("Users: 2");
    console.log("Events: 5");
    console.log("Participants: 10");
    console.log(`Registrations: ${registrationCount}`);
    console.log("Admin: admin@eventhub.com / Admin123!");
    console.log("Staff: staff@eventhub.com / Staff123!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
