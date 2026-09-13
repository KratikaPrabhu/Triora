import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/user.model';
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

export async function runGoogleAuthTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_google_db';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    process.stdout.write(`Connected to local MongoDB at ${mongoUri}\n`);
  } catch (err: any) {
    process.stdout.write(`Local MongoDB connection error: ${err.message}\n`);
  }

  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }

  const server = app.listen(0);
  const port = (server.address() as any).port;
  process.stdout.write(`Google Auth Test server running on port ${port}\n`);

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
    const existingLocalEmail = 'localuser@example.com';
    const passwordHash = await bcrypt.hash('localpass123', 10);
    await User.create({
      name: 'Local User',
      email: existingLocalEmail,
      passwordHash,
      authProvider: 'local'
    });

    // 1. Valid Google Auth Flow (New User)
    const newGoogleEmail = 'newgoogle@example.com';
    const newGoogleSub = '100000000000000000001';
    const resNewUser = await httpRequest({
      method: 'POST',
      path: '/api/auth/google',
      body: { idToken: `mock-google-token-${newGoogleEmail}-${newGoogleSub}` },
      port
    });
    assert(
      resNewUser.statusCode === 200 &&
        resNewUser.body.success === true &&
        resNewUser.body.data.token &&
        resNewUser.body.data.user.email === newGoogleEmail &&
        resNewUser.body.data.user.googleId === newGoogleSub &&
        resNewUser.body.data.user.authProvider === 'google',
      '1. Valid Google authentication flow (new user)'
    );

    // 2. Verified email matching existing local account (Linking)
    const resLinkedUser = await httpRequest({
      method: 'POST',
      path: '/api/auth/google',
      body: { idToken: `mock-google-token-${existingLocalEmail}-200000000000000000002` },
      port
    });
    assert(
      resLinkedUser.statusCode === 200 &&
        resLinkedUser.body.success === true &&
        resLinkedUser.body.data.user.email === existingLocalEmail &&
        resLinkedUser.body.data.user.googleId === '200000000000000000002',
      '2. Verified email matching existing local account (account linking)'
    );

    // 3. Existing Google User Login
    const resExistingGoogle = await httpRequest({
      method: 'POST',
      path: '/api/auth/google',
      body: { credential: `mock-google-token-${newGoogleEmail}-${newGoogleSub}` },
      port
    });
    assert(
      resExistingGoogle.statusCode === 200 &&
        resExistingGoogle.body.success === true &&
        resExistingGoogle.body.data.user.email === newGoogleEmail &&
        resExistingGoogle.body.data.user.googleId === newGoogleSub,
      '3. Existing Google user login'
    );

    // 4. Invalid Token
    const resInvalidToken = await httpRequest({
      method: 'POST',
      path: '/api/auth/google',
      body: { idToken: 'invalid_unverified_token_string_random' },
      port
    });
    assert(
      resInvalidToken.statusCode === 401 &&
        resInvalidToken.body.success === false &&
        resInvalidToken.body.error.message.includes('verification failed'),
      '4. Invalid / unverified Google credential rejection'
    );

    // 5. Malformed Request
    const resMalformed = await httpRequest({
      method: 'POST',
      path: '/api/auth/google',
      body: {},
      port
    });
    assert(
      resMalformed.statusCode === 400 && resMalformed.body.success === false,
      '5. Malformed request rejection (missing token/credential)'
    );

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- GOOGLE OAUTH TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runGoogleAuthTests().then((success) => process.exit(success ? 0 : 1));
}
