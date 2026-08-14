import mongoose from 'mongoose';
import { env } from './env.js';

let cached: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } = {
  conn: null,
  promise: null,
};

export async function connectDB(): Promise<mongoose.Connection> {
  // If connection already exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If promise is already pending, wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        dbName: 'library_system',
      })
      .then((mongoose) => {
        cached.conn = mongoose.connection;
        return cached.conn;
      });
  }

  const promise = cached.promise;
  cached.promise = null;

  return promise;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  cached.conn = null;
  cached.promise = null;
};

// Handle process exit gracefully
export const closeMongoDBConnection = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('📊 MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection', error);
  }
};