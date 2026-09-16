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

export async function runSpeechTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_speech_db';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    process.stdout.write(`Connected to local MongoDB at ${mongoUri}\n`);
  } catch (err: any) {
    process.stdout.write(`Local MongoDB connection error: ${err.message}\n`);
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
  process.stdout.write(`Speech Test server running on port ${port}\n`);

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
    const user = await User.create({
      name: 'Speech Test User',
      email: 'speechuser@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const authToken = generateToken(user);

    // 1. Authenticated Speech Token Request (MOCK_MODE)
    const resAuth = await httpRequest({
      method: 'GET',
      path: '/api/speech/token',
      headers: { Authorization: `Bearer ${authToken}` },
      port
    });
    assert(
      resAuth.statusCode === 200 &&
        resAuth.body.success === true &&
        resAuth.body.data.token &&
        resAuth.body.data.region &&
        resAuth.body.data.voice &&
        resAuth.body.data.expiresAt,
      '1. Authenticated request (returns token, region, voice, expiresAt)'
    );

    // 2. Security Check: Ensures secrets are NOT present in response
    const rawResponseBody = JSON.stringify(resAuth.body);
    const secretLeaked =
      rawResponseBody.includes(process.env.JWT_SECRET || 'SECRET_KEY_NOT_FOUND') ||
      rawResponseBody.includes(process.env.AZURE_SPEECH_KEY || 'AZURE_KEY_NOT_FOUND') ||
      rawResponseBody.includes(process.env.GEMINI_API_KEY || 'GEMINI_KEY_NOT_FOUND');
    assert(
      secretLeaked === false,
      '2. Security verification: AZURE_SPEECH_KEY / GEMINI_API_KEY / JWT_SECRET are never exposed'
    );

    // 3. Unauthenticated Speech Token Request
    const resUnauth = await httpRequest({
      method: 'GET',
      path: '/api/speech/token',
      port
    });
    assert(
      resUnauth.statusCode === 401 && resUnauth.body.success === false,
      '3. Unauthenticated request rejection (401 Unauthorized)'
    );

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- SPEECH TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runSpeechTests().then((success) => process.exit(success ? 0 : 1));
}
