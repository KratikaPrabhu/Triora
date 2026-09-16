import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app';

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

export async function runAuthTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_db';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    process.stdout.write(`Connected to local MongoDB at ${mongoUri}\n`);
  } catch (err: any) {
    process.stdout.write(`Local MongoDB error (${err.message})...\n`);
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
  process.stdout.write(`Auth Test server running on port ${port}\n`);

  let authToken = '';
  const testUser = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'securepassword123'
  };

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
    // 1. Successful Signup
    const resSignup = await httpRequest({
      method: 'POST',
      path: '/api/auth/signup',
      body: testUser,
      port
    });
    assert(
      resSignup.statusCode === 201 &&
        resSignup.body.success === true &&
        resSignup.body.data.token &&
        resSignup.body.data.user.email === testUser.email &&
        !resSignup.body.data.user.passwordHash,
      '1. Successful Signup'
    );
    authToken = resSignup.body.data ? resSignup.body.data.token : '';

    // 2. Duplicate Signup
    const resDupSignup = await httpRequest({
      method: 'POST',
      path: '/api/auth/signup',
      body: testUser,
      port
    });
    assert(
      resDupSignup.statusCode === 409 &&
        resDupSignup.body.success === false &&
        resDupSignup.body.error.message.includes('already exists'),
      '2. Duplicate Signup rejection'
    );

    // 3. Invalid Signup Input
    const resInvalidSignup = await httpRequest({
      method: 'POST',
      path: '/api/auth/signup',
      body: { name: 'Short', email: 'invalid-email', password: '123' },
      port
    });
    assert(
      resInvalidSignup.statusCode === 400 && resInvalidSignup.body.success === false,
      '3. Invalid Signup input rejection'
    );

    // 4. Successful Login
    const resLogin = await httpRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testUser.email, password: testUser.password },
      port
    });
    assert(
      resLogin.statusCode === 200 &&
        resLogin.body.success === true &&
        resLogin.body.data.token &&
        resLogin.body.data.user.email === testUser.email &&
        !resLogin.body.data.user.passwordHash,
      '4. Successful Login'
    );

    // 5. Incorrect Password Login
    const resWrongPass = await httpRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testUser.email, password: 'wrongpassword' },
      port
    });
    assert(
      resWrongPass.statusCode === 401 &&
        resWrongPass.body.success === false &&
        resWrongPass.body.error.message.includes('Invalid email or password'),
      '5. Incorrect Password rejection'
    );

    // 6. Nonexistent User Login
    const resNonExistent = await httpRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'nobody@example.com', password: 'somepassword' },
      port
    });
    assert(
      resNonExistent.statusCode === 401 && resNonExistent.body.success === false,
      '6. Nonexistent User Login rejection'
    );

    // 7. Authenticated GET /api/auth/me
    const resMeAuth = await httpRequest({
      method: 'GET',
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${authToken}` },
      port
    });
    assert(
      resMeAuth.statusCode === 200 &&
        resMeAuth.body.success === true &&
        resMeAuth.body.data.user.email === testUser.email,
      '7. Authenticated GET /api/auth/me'
    );

    // 8. Unauthenticated GET /api/auth/me
    const resMeUnauth = await httpRequest({
      method: 'GET',
      path: '/api/auth/me',
      port
    });
    assert(
      resMeUnauth.statusCode === 401 && resMeUnauth.body.success === false,
      '8. Unauthenticated GET /api/auth/me rejection'
    );

    // 9. Profile Update (PATCH /api/auth/profile)
    const resUpdateProfile = await httpRequest({
      method: 'PATCH',
      path: '/api/auth/profile',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Jane Updated Doe',
        profile: { preferredLanguage: 'es', phone: '+1234567890' }
      },
      port
    });
    assert(
      resUpdateProfile.statusCode === 200 &&
        resUpdateProfile.body.success === true &&
        resUpdateProfile.body.data.user.name === 'Jane Updated Doe' &&
        resUpdateProfile.body.data.user.profile.preferredLanguage === 'es' &&
        resUpdateProfile.body.data.user.profile.phone === '+1234567890',
      '9. Profile Update (PATCH /api/auth/profile)'
    );

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- AUTH TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runAuthTests().then((success) => process.exit(success ? 0 : 1));
}
