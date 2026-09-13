import http from 'http';
import WebSocket from 'ws';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/user.model';
import Session from '../src/models/session.model';
import { generateToken } from '../src/utils/jwt.util';
import { initConversationWebSocket } from '../src/websocket/conversation.ws';
import bcrypt from 'bcryptjs';

export async function runWebSocketTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_ws_db';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    process.stdout.write(`Connected to local MongoDB at ${mongoUri}\n`);
  } catch (err: any) {
    process.stdout.write(`Local MongoDB connection error: ${err.message}\n`);
  }

  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }

  const server = http.createServer(app);
  initConversationWebSocket(server);

  await new Promise<void>((res) => server.listen(0, () => res()));
  const port = (server.address() as any).port;
  process.stdout.write(`WebSocket Test server running on port ${port}\n`);

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      process.stdout.write(`✅ PASS: ${message}\n`);
      passedCount++;
    } else {
      process.stderr.write(`❌ FAIL: ${message}\n`);
      failedCount++;
    }
  }

  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create User 1 & Token
    const user1 = await User.create({
      name: 'WS Patient One',
      email: 'wspatient1@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const token1 = generateToken(user1);

    // Create User 2 & Token
    const user2 = await User.create({
      name: 'WS Patient Two',
      email: 'wspatient2@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const token2 = generateToken(user2);

    // Create Session for User 1
    const session1 = await Session.create({
      userId: user1._id,
      status: 'created',
      language: 'English',
      transcript: []
    });

    // 1. Unauthenticated Connection Rejection
    const unauthRejected = await new Promise<boolean>((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/conversation`);
      ws.on('unexpected-response', (_req, res) => {
        resolve(res.statusCode === 401);
      });
      ws.on('error', () => {
        resolve(true);
      });
      ws.on('open', () => {
        ws.close();
        resolve(false);
      });
    });
    assert(unauthRejected, '1. Unauthenticated connection rejection (401 Unauthorized)');

    // 2. Authenticated Connection
    const ws1 = new WebSocket(`ws://127.0.0.1:${port}/ws/conversation?token=${token1}`);
    const connected1 = await new Promise<boolean>((resolve) => {
      ws1.on('open', () => resolve(true));
      ws1.on('error', () => resolve(false));
    });
    assert(connected1, '2. Authenticated WebSocket connection established');

    // 3. Start Session Flow
    const startMsgPromise = new Promise<any>((resolve) => {
      ws1.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
    ws1.send(JSON.stringify({ type: 'start_session', sessionId: session1._id.toString() }));
    const startRes = await startMsgPromise;
    assert(
      startRes.type === 'session_started' &&
        startRes.sessionId === session1._id.toString() &&
        startRes.status === 'active',
      '3. start_session event handling (session_started)'
    );

    // 4. Send Valid User Message Flow
    const userMessagePromise = new Promise<any[]>((resolve) => {
      const messages: any[] = [];
      const handler = (data: Buffer) => {
        const parsed = JSON.parse(data.toString());
        messages.push(parsed);
        if (messages.length === 2) {
          ws1.removeListener('message', handler);
          resolve(messages);
        }
      };
      ws1.on('message', handler);
    });

    ws1.send(
      JSON.stringify({
        type: 'user_message',
        sessionId: session1._id.toString(),
        text: 'I have been feeling stressed about my work workload.'
      })
    );

    const receivedEvents = await userMessagePromise;
    assert(
      receivedEvents[0].type === 'processing' &&
        receivedEvents[1].type === 'assistant_message' &&
        receivedEvents[1].sessionId === session1._id.toString() &&
        typeof receivedEvents[1].text === 'string' &&
        receivedEvents[1].text.length > 0,
      '4. Valid user_message processing & assistant_message response'
    );

    // 5. Cross-User Unauthorized Session Access Attempt (User 2 socket trying to message User 1 session)
    const ws2 = new WebSocket(`ws://127.0.0.1:${port}/ws/conversation?token=${token2}`);
    await new Promise<void>((resolve) => ws2.on('open', resolve));

    const crossUserErrorPromise = new Promise<any>((resolve) => {
      ws2.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
    ws2.send(
      JSON.stringify({
        type: 'user_message',
        sessionId: session1._id.toString(),
        text: 'Unauthorized attempt to message User 1 session.'
      })
    );

    const crossUserRes = await crossUserErrorPromise;
    assert(
      crossUserRes.type === 'error' && crossUserRes.message.includes('Session not found or access denied'),
      "5. Cross-user isolation: User 2 cannot post message to User 1's session"
    );
    ws2.close();

    // 6. Invalid JSON Message Handling
    const invalidJsonPromise = new Promise<any>((resolve) => {
      ws1.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
    ws1.send('THIS IS NOT VALID JSON STRING');
    const invalidJsonRes = await invalidJsonPromise;
    assert(
      invalidJsonRes.type === 'error' && invalidJsonRes.message.includes('Invalid JSON'),
      '6. Invalid JSON message rejection'
    );

    // 7. End Session Flow
    const endSessionPromise = new Promise<any>((resolve) => {
      ws1.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
    ws1.send(JSON.stringify({ type: 'end_session', sessionId: session1._id.toString() }));
    const endSessionRes = await endSessionPromise;
    assert(
      endSessionRes.type === 'session_completed' && endSessionRes.status === 'completed',
      '7. end_session completion flow (session_completed)'
    );

    // Check DB status update
    const updatedSession = await Session.findById(session1._id);
    assert(
      updatedSession?.status === 'completed' && (updatedSession?.transcript.length || 0) >= 2,
      '7b. Verified session status updated to completed in MongoDB'
    );

    ws1.close();

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- WEBSOCKET TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runWebSocketTests().then((success) => process.exit(success ? 0 : 1));
}
