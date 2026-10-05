import mongoose from 'mongoose';
import env from './env';
import logger from './logger';

let isEventListenerAttached = false;

function attachMongoListeners() {
  if (isEventListenerAttached) return;
  isEventListenerAttached = true;

  mongoose.connection.on('connected', () => {
    logger.info(`[MongoDB] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`[MongoDB] Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('[MongoDB] Disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('[MongoDB] Reconnected');
  });
}

export const connectDB = async (): Promise<typeof mongoose> => {
  attachMongoListeners();
  logger.info('[MongoDB] Connecting...');

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    return conn;
  } catch (error: any) {
    logger.error(`[MongoDB] Error: ${error.message}`);
    throw error;
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
