import mongoose from 'mongoose';
import { env } from './env';

/**
 * Opens a single, shared Mongoose connection for the whole app.
 * Mongoose maintains an internal connection pool, so we connect once at
 * startup and every model/query reuses that pool rather than opening a
 * new connection per request.
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.warn('⚠️  MongoDB disconnected');
});
