import mongoose from "mongoose";
import { AppError } from "./errors.js";

const cache = globalThis._carenestMongoose || (globalThis._carenestMongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new AppError(503, "Database is not configured. Set MONGODB_URI.", "DB_NOT_CONFIGURED");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 10, serverSelectionTimeoutMS: 8000 });
  }
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw new AppError(503, "Could not reach the database.", "DB_UNAVAILABLE");
  }
  return cache.conn;
}
