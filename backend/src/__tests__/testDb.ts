import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Bump the in-memory MongoDB startup timeout — cold starts on Windows
// (especially in corporate-firewalled environments) can exceed the default 10s.
process.env.MONGOMS_INSTANCE_START_TIMEOUT = "120000";

let mongo: MongoMemoryServer | null = null;

export async function connectTestDB() {
  mongo = await MongoMemoryServer.create({
    instance: { storageEngine: "wiredTiger" },
  });
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  // Build all model indexes (text + 2dsphere) for the test database.
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  mongo = null;
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
