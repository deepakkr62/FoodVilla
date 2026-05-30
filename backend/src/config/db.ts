import mongoose from "mongoose";
import { env, isTest } from "./env";

export async function connectDB(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
  if (!isTest) {
    console.log(`[db] connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  }
  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
