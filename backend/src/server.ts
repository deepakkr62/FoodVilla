import http from "http";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import mongoose from "mongoose";
import { seedDevData } from "./devSeed";
import { initSocketServer } from "./services/socketService";

async function start() {
  const app = createApp();
  const server = http.createServer(app);
  initSocketServer(server);

  try {
    if (env.USE_MEMORY_DB) {
      // In-memory dev mode — no external MongoDB required.
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      console.log("[startup] Booting in-memory MongoDB (this may take ~10s on first run)...");
      const mongo = await MongoMemoryServer.create({
        instance: { storageEngine: "wiredTiger" },
      });
      await mongoose.connect(mongo.getUri());
      await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
      console.log("[startup] In-memory MongoDB ready.");
      const { seeded, restaurantCount } = await seedDevData();
      console.log(
        seeded
          ? `[startup] Seeded ${restaurantCount} restaurants + demo accounts.`
          : `[startup] DB already has ${restaurantCount} restaurants — skipping seed.`,
      );
      console.log(
        "[startup] Demo logins: customer@demo.local · sushi-spot@demo.local (owner) · password: demo1234",
      );
    } else {
      await connectDB();
      await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
      // Idempotent: only seeds if the DB has no restaurants yet.
      const { seeded, restaurantCount } = await seedDevData();
      console.log(
        seeded
          ? `[startup] Seeded ${restaurantCount} demo restaurants + accounts into Atlas.`
          : `[startup] Atlas already has ${restaurantCount} restaurants — skipping seed.`,
      );
      if (seeded) {
        console.log(
          "[startup] Demo logins: customer@demo.local · sushi-spot@demo.local (owner) · password: demo1234",
        );
      }
    }
  } catch (err) {
    console.error("[startup] DB initialization failed:", err);
    console.error("[startup] Server will continue but DB-dependent routes will fail.");
  }

  server.listen(env.PORT, () => {
    console.log(`[startup] Food Villa API listening on http://localhost:${env.PORT}`);
    console.log(`[startup] Health check: http://localhost:${env.PORT}/api/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[shutdown] received ${signal}, closing gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("[startup] fatal:", err);
  process.exit(1);
});
