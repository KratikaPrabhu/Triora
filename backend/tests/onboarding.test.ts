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

export async function runOnboardingTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_onboarding_db';

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
  process.stdout.write(`Onboarding Test server running on port ${port}\n`);

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
      name: 'Patient Test',
      email: 'patient@example.com',
      passwordHash,
      authProvider: 'local'
    });

    const authToken = generateToken(user);

    // 1. Retrieving initial empty/default onboarding state
    const resGetInitial = await httpRequest({
      method: 'GET',
      path: '/api/onboarding',
      headers: { Authorization: `Bearer ${authToken}` },
      port
    });
    assert(
      resGetInitial.statusCode === 200 &&
        resGetInitial.body.success === true &&
        resGetInitial.body.data.isOnboardingComplete === false &&
        resGetInitial.body.data.currentStep === 1,
      '1. Retrieving onboarding information (GET /api/onboarding)'
    );

    // 2. Partial Onboarding Update (Step 1 only)
    const resStep1 = await httpRequest({
      method: 'PATCH',
      path: '/api/onboarding',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        currentStep: 2,
        preferredName: 'Johnny',
        dateOfBirth: '1995-05-15',
        preferredLanguage: 'en'
      },
      port
    });
    assert(
      resStep1.statusCode === 200 &&
        resStep1.body.success === true &&
        resStep1.body.data.profile.preferredName === 'Johnny' &&
        resStep1.body.data.isOnboardingComplete === false &&
        resStep1.body.data.currentStep === 2,
      '2. Partial onboarding update (Step 1 -> isOnboardingComplete: false)'
    );

    // 3. Complete Onboarding Update (Step 2 & Step 3)
    const resComplete = await httpRequest({
      method: 'PATCH',
      path: '/api/onboarding',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        currentStep: 3,
        backgroundInfo: 'Experiencing mild work-related stress.',
        previousTherapyExperience: 'some',
        primaryGoals: ['stress_management', 'mindfulness'],
        communicationPreference: 'voice',
        consentAcknowledged: true,
        termsAccepted: true
      },
      port
    });
    assert(
      resComplete.statusCode === 200 &&
        resComplete.body.success === true &&
        resComplete.body.data.profile.backgroundInfo === 'Experiencing mild work-related stress.' &&
        resComplete.body.data.profile.previousTherapyExperience === 'some' &&
        resComplete.body.data.profile.consentAcknowledged === true &&
        resComplete.body.data.profile.termsAccepted === true &&
        resComplete.body.data.isOnboardingComplete === true,
      '3. Completed onboarding update (Steps 1-3 finished -> isOnboardingComplete: true)'
    );

    // 4. Invalid Field Validation
    const resInvalid = await httpRequest({
      method: 'PATCH',
      path: '/api/onboarding',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        dateOfBirth: 'not-a-valid-date-string'
      },
      port
    });
    assert(
      resInvalid.statusCode === 400 && resInvalid.body.success === false,
      '4. Invalid fields rejection (400 Bad Request)'
    );

    // 5. Unauthenticated Request Rejection
    const resUnauth = await httpRequest({
      method: 'GET',
      path: '/api/onboarding',
      port
    });
    assert(
      resUnauth.statusCode === 401 && resUnauth.body.success === false,
      '5. Unauthenticated request rejection (401 Unauthorized)'
    );

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- ONBOARDING TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runOnboardingTests().then((success) => process.exit(success ? 0 : 1));
}
