import app from './app';
import env from './config/env';
import logger from './config/logger';
import { connectDB } from './config/db';
import { initConversationWebSocket } from './websocket/conversation.ws';

const PORT = env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });

  // Attach Real-Time Conversation WebSocket Server
  initConversationWebSocket(server);

  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
  });
}

startServer();

