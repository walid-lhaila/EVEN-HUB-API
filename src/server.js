
import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./database/pool.js";

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL connected successfully");

    const server = app.listen(env.port, () => {
      console.log(
        `EventHub API running on http://localhost:${env.port}`
      );
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    await pool.end();
    process.exit(1);
  }
}

startServer();
