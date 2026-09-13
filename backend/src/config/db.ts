import mongoose from 'mongoose';
import env from './env';
import logger from './logger';

export const connectDB = async (): Promise<typeof mongoose | undefined> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    logger.error(`MongoDB connection error: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return undefined;
  }
};

export const getDBStatus = (): { state: string; isConnected: boolean } => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    isConnected: stateCode === 1
  };
};
