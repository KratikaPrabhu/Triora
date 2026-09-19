import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';
import { verifyToken } from '../utils/jwt.util';
import User from '../models/user.model';
import conversationService from '../services/conversation.service';
import sessionService from '../services/session.service';
import logger from '../config/logger';
import { IUserDocument } from '../types';

export interface AuthenticatedWebSocket extends WebSocket {
  user?: IUserDocument;
  isAlive?: boolean;
  messageCount?: number;
  lastResetTime?: number;
}

export function initConversationWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade requests for /ws/conversation
  server.on('upgrade', async (request, socket, head) => {
    const reqUrl = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);

    if (reqUrl.pathname !== '/ws/conversation') {
      return; // Let other handlers process if any
    }

    try {
      const token = reqUrl.searchParams.get('token') || request.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        logger.warn('WebSocket connection rejected: No authentication token provided.');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        logger.warn('WebSocket connection rejected: User not found.');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const client = ws as AuthenticatedWebSocket;
        client.user = user;
        client.isAlive = true;
        client.messageCount = 0;
        client.lastResetTime = Date.now();
        wss.emit('connection', client, request);
      });
    } catch (err: any) {
      logger.error(`WebSocket handshake authentication error: ${err.message}`);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  // Handle connected authenticated WebSocket clients
  wss.on('connection', (ws: AuthenticatedWebSocket) => {
    const user = ws.user!;
    logger.info(`WebSocket client connected: ${user.email} (${user._id})`);

    // Setup heartbeat ping/pong
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer | string) => {
      const now = Date.now();

      // Rate limiting: max 30 messages per minute
      if (!ws.lastResetTime || now - ws.lastResetTime > 60000) {
        ws.messageCount = 0;
        ws.lastResetTime = now;
      }

      ws.messageCount = (ws.messageCount || 0) + 1;
      if (ws.messageCount > 30) {
        sendEvent(ws, {
          type: 'error',
          message: 'Rate limit exceeded. Maximum 30 messages per minute allowed.',
          statusCode: 429
        });
        return;
      }

      // Payload size check: max 10KB
      const payloadString = data.toString();
      if (Buffer.byteLength(payloadString) > 10240) {
        sendEvent(ws, {
          type: 'error',
          message: 'Message payload size exceeds 10KB limit.',
          statusCode: 400
        });
        return;
      }

      // Safe JSON parsing
      let payload: any;
      try {
        payload = JSON.parse(payloadString);
      } catch (e) {
        sendEvent(ws, {
          type: 'error',
          message: 'Invalid JSON message format.',
          statusCode: 400
        });
        return;
      }

      const { type, sessionId, text } = payload;
      const userIdStr = user._id.toString();

      if (!type || typeof type !== 'string') {
        sendEvent(ws, {
          type: 'error',
          message: 'Message must contain a valid "type" field.',
          statusCode: 400
        });
        return;
      }

      try {
        switch (type) {
          case 'start_session': {
            logger.info(`[WS] Message received: start_session for session ${sessionId}`);
            if (!sessionId) {
              sendEvent(ws, { type: 'error', message: 'sessionId is required.', statusCode: 400 });
              return;
            }
            const session = await sessionService.getSessionById(userIdStr, sessionId);
            if (session.status === 'created') {
              await sessionService.updateSession(userIdStr, sessionId, { status: 'active' });
            }
            sendEvent(ws, {
              type: 'session_started',
              sessionId,
              status: 'active'
            });
            break;
          }

          case 'user_message': {
            logger.info(`[WS] Message received: user_message for session ${sessionId}`);
            const msgStatus = payload.status || 'answered';

            if (!sessionId) {
              sendEvent(ws, {
                type: 'error',
                message: 'sessionId is required.',
                statusCode: 400
              });
              return;
            }

            if (msgStatus === 'answered' && (!text || typeof text !== 'string' || !text.trim())) {
              sendEvent(ws, {
                type: 'error',
                message: 'Non-empty text string is required when status is answered.',
                statusCode: 400
              });
              return;
            }

            // Verify session ownership before emitting processing status
            await sessionService.getSessionById(userIdStr, sessionId);

            // Emit processing status
            logger.info(`[WS] Processing patient response for session ${sessionId}`);
            sendEvent(ws, { type: 'processing', sessionId });

            logger.info(`[WS] Gemini request started`);
            try {
              // Process message via conversation service
              const { aiResponse } = await conversationService.processSessionMessage({
                userId: userIdStr,
                sessionId,
                userMessage: text || '',
                status: msgStatus
              });

              if (aiResponse.action === 'complete') {
                await sessionService.updateSession(userIdStr, sessionId, { status: 'completed' });
                sendEvent(ws, {
                  type: 'session_completed',
                  sessionId,
                  status: 'completed',
                  reason: aiResponse.reason
                });
              } else {
                // Emit assistant response
                sendEvent(ws, {
                  type: 'assistant_message',
                  sessionId,
                  text: aiResponse.reply,
                  action: aiResponse.action,
                  metadata: aiResponse.metadata,
                  timestamp: new Date().toISOString()
                });
              }
            } catch (geminiErr: any) {
              logger.error(`[WS] Gemini request failed: ${geminiErr.message}`);
              logger.info(`[WS] Keeping session alive`);
              logger.info(`[WS] Sending error to client`);
              sendEvent(ws, {
                type: 'conversation_error',
                code: geminiErr.code || 'AI_TEMPORARILY_UNAVAILABLE',
                message: 'The AI service is temporarily unavailable. Please try again.'
              });
            }
            break;
          }


          case 'end_session': {
            logger.info(`[WS] Message received: end_session for session ${sessionId}`);
            if (!sessionId) {
              sendEvent(ws, { type: 'error', message: 'sessionId is required.', statusCode: 400 });
              return;
            }
            await sessionService.updateSession(userIdStr, sessionId, { status: 'completed' });
            sendEvent(ws, {
              type: 'session_completed',
              sessionId,
              status: 'completed'
            });
            break;
          }

          default:
            sendEvent(ws, {
              type: 'error',
              message: `Unknown message type: ${type}`,
              statusCode: 400
            });
        }
      } catch (err: any) {
        logger.error(`WebSocket handling error: ${err.message}`);
        const statusCode = err.statusCode || 500;
        const message = err.message || 'An error occurred processing your request.';
        sendEvent(ws, {
          type: 'error',
          message,
          statusCode
        });
      }

    });

    ws.on('close', () => {
      logger.info(`WebSocket client disconnected: ${user.email}`);
    });

    ws.on('error', (err) => {
      logger.error(`WebSocket client error (${user.email}): ${err.message}`);
    });
  });

  // Heartbeat ping interval to clean up stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((wsClient) => {
      const client = wsClient as AuthenticatedWebSocket;
      if (client.isAlive === false) {
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

function sendEvent(ws: WebSocket, payload: Record<string, any>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}
