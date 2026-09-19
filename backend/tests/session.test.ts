import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/user.model';
import { generateToken } from '../src/utils/jwt.util';
import bcrypt from 'bcryptjs';

function httpRequest({ method, path, headers = {}, body = null, port }: any): Promise<{ statusCode: number; body: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders: Record<string, any> = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ statusCode: res.statusCode || 500, body: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode || 500, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

export async function runSessionTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_session_db';

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    }
    process.stdout.write(`Connected to MongoDB at ${mongoUri}\n`);
  } catch (err: any) {
    process.stdout.write(`MongoDB connection error: ${err.message}\n`);
  }

  if (mongoose.connection.db) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (_) {
      try {
        await mongoose.connection.db.collection('users').deleteMany({});
        await mongoose.connection.db.collection('sessions').deleteMany({});
        await mongoose.connection.db.collection('reports').deleteMany({});
      } catch (e) {}
    }
  }

  const server = app.listen(0);
  const port = (server.address() as any).port;
  process.stdout.write(`Session Test server running on port ${port}\n`);

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
    
    // Create User 1
    const user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const token1 = generateToken(user1);

    // Create User 2
    const user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const token2 = generateToken(user2);

    let createdSessionId = '';

    // 1. Create Session
    const resCreate = await httpRequest({
      method: 'POST',
      path: '/api/sessions',
      headers: { Authorization: `Bearer ${token1}` },
      body: { language: 'en', metadata: { device: 'web' } },
      port
    });
    assert(
      resCreate.statusCode === 201 &&
        resCreate.body.success === true &&
        resCreate.body.data.status === 'created' &&
        resCreate.body.data.userId.toString() === user1._id.toString(),
      '1. Create session (POST /api/sessions)'
    );
    createdSessionId = resCreate.body.data ? resCreate.body.data._id : '';

    // 2. List Sessions
    const resList = await httpRequest({
      method: 'GET',
      path: '/api/sessions',
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resList.statusCode === 200 &&
        resList.body.success === true &&
        Array.isArray(resList.body.data.sessions) &&
        resList.body.data.sessions.length === 1 &&
        resList.body.data.sessions[0]._id === createdSessionId,
      '2. List sessions for authenticated user (GET /api/sessions)'
    );

    // 3. Retrieve Own Session
    const resGetOwn = await httpRequest({
      method: 'GET',
      path: `/api/sessions/${createdSessionId}`,
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resGetOwn.statusCode === 200 &&
        resGetOwn.body.success === true &&
        resGetOwn.body.data.session._id === createdSessionId,
      '3. Retrieve own session (GET /api/sessions/:id)'
    );

    // 4. Attempt to Retrieve Another User's Session (Cross-User Isolation)
    const resGetOther = await httpRequest({
      method: 'GET',
      path: `/api/sessions/${createdSessionId}`,
      headers: { Authorization: `Bearer ${token2}` },
      port
    });
    assert(
      resGetOther.statusCode === 404 && resGetOther.body.success === false,
      "4. Cross-user isolation: User 2 cannot access User 1's session (404 Not Found)"
    );

    // 5. Update Session (Transition to Active & append transcript)
    const resUpdate = await httpRequest({
      method: 'PATCH',
      path: `/api/sessions/${createdSessionId}`,
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        status: 'active',
        transcript: [
          { role: 'user', text: 'Hello, I want to talk about stress.', timestamp: new Date().toISOString() },
          { role: 'assistant', text: 'Welcome to Triora. I am here to help.', timestamp: new Date().toISOString() }
        ]
      },
      port
    });
    assert(
      resUpdate.statusCode === 200 &&
        resUpdate.body.success === true &&
        resUpdate.body.data.session.status === 'active' &&
        resUpdate.body.data.session.transcript.length >= 2 &&
        resUpdate.body.data.session.startedAt !== null,
      '5. Update session status & transcript (PATCH /api/sessions/:id)'
    );

    // Complete session for state transition test
    await httpRequest({
      method: 'PATCH',
      path: `/api/sessions/${createdSessionId}`,
      headers: { Authorization: `Bearer ${token1}` },
      body: { status: 'completed' },
      port
    });

    // 6. Invalid Status Transition (completed -> active)
    const resInvalidTransition = await httpRequest({
      method: 'PATCH',
      path: `/api/sessions/${createdSessionId}`,
      headers: { Authorization: `Bearer ${token1}` },
      body: { status: 'active' },
      port
    });
    assert(
      resInvalidTransition.statusCode === 400 &&
        resInvalidTransition.body.success === false &&
        resInvalidTransition.body.error.message.includes('Invalid status transition'),
      '6. Invalid status transition rejection (completed -> active returns 400)'
    );

    // 7. Invalid Session ID Format
    const resInvalidId = await httpRequest({
      method: 'GET',
      path: '/api/sessions/invalid_object_id_string',
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resInvalidId.statusCode === 400 && resInvalidId.body.success === false,
      '7. Invalid session ID format rejection (400 Bad Request)'
    );

    // 8. Unauthenticated Request
    const resUnauth = await httpRequest({
      method: 'GET',
      path: '/api/sessions',
      port
    });
    assert(
      resUnauth.statusCode === 401 && resUnauth.body.success === false,
      '8. Unauthenticated request rejection (401 Unauthorized)'
    );

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- SESSION TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runSessionTests().then((success) => process.exit(success ? 0 : 1));
}
