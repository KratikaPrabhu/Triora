import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/user.model';
import Session from '../src/models/session.model';
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

export async function runReportTests(): Promise<boolean> {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_test_report_db';

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
  process.stdout.write(`Report Test server running on port ${port}\n`);

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
      name: 'Report Patient One',
      email: 'report1@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const token1 = generateToken(user1);

    // Create User 2 & Token
    const user2 = await User.create({
      name: 'Report Patient Two',
      email: 'report2@example.com',
      passwordHash,
      authProvider: 'local'
    });
    const token2 = generateToken(user2);

    // Create Incomplete Session (status: 'active') for User 1
    const activeSession = await Session.create({
      userId: user1._id,
      status: 'active',
      language: 'English',
      transcript: [{ role: 'user', text: 'I feel stressed', timestamp: new Date() }]
    });

    // Create Completed Session (status: 'completed') for User 1
    const completedSession = await Session.create({
      userId: user1._id,
      status: 'completed',
      language: 'English',
      transcript: [
        { role: 'user', text: 'I am struggling with work-life balance.', timestamp: new Date() },
        { role: 'assistant', text: 'Thank you for sharing. Could you elaborate on your workload?', timestamp: new Date() },
        { role: 'user', text: 'I work 60 hours a week and feel exhausted.', timestamp: new Date() }
      ]
    });

    // 1. Completed Session Requirement Rejection (Attempting report generation on active session)
    const resIncompleteReq = await httpRequest({
      method: 'POST',
      path: `/api/report/generate/${activeSession._id}`,
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resIncompleteReq.statusCode === 400 &&
        resIncompleteReq.body.success === false &&
        resIncompleteReq.body.error.message.includes('completed sessions'),
      '1. Completed session requirement check (incomplete session returns 400 Bad Request)'
    );

    // 2. Report Generation for Completed Session (MOCK_MODE)
    const resGen = await httpRequest({
      method: 'POST',
      path: `/api/report/generate/${completedSession._id}`,
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resGen.statusCode === 201 &&
        resGen.body.success === true &&
        resGen.body.data.report &&
        resGen.body.data.report.sessionId === completedSession._id.toString() &&
        Array.isArray(resGen.body.data.report.keyThemes) &&
        resGen.body.data.report.summary.length > 0,
      '2. Successful report generation for completed session (MOCK_MODE)'
    );
    const generatedReportId = resGen.body.data.report._id;

    // 3. Retrieve Own Generated Report (GET /api/report/:id)
    const resGetOwn = await httpRequest({
      method: 'GET',
      path: `/api/report/${generatedReportId}`,
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resGetOwn.statusCode === 200 &&
        resGetOwn.body.success === true &&
        resGetOwn.body.data.report._id === generatedReportId,
      '3. Retrieve own report (GET /api/report/:id)'
    );

    // 4. Unauthorized Report Access (User 2 accessing User 1's report)
    const resUnauthGet = await httpRequest({
      method: 'GET',
      path: `/api/report/${generatedReportId}`,
      headers: { Authorization: `Bearer ${token2}` },
      port
    });
    assert(
      resUnauthGet.statusCode === 404 && resUnauthGet.body.success === false,
      "4. Cross-user isolation: User 2 cannot access User 1's report (404 Not Found)"
    );

    // 5. Invalid Report ID Format
    const resInvalidId = await httpRequest({
      method: 'GET',
      path: '/api/report/invalid_report_id_format',
      headers: { Authorization: `Bearer ${token1}` },
      port
    });
    assert(
      resInvalidId.statusCode === 400 && resInvalidId.body.success === false,
      '5. Invalid report ID format rejection (400 Bad Request)'
    );

    // 6. Non-Diagnostic Boundary Verification
    const reportText = JSON.stringify(resGen.body.data.report).toLowerCase();
    const diagnosticCheck =
      reportText.includes('diagnosed with') ||
      reportText.includes('prescribe') ||
      reportText.includes('medical assessment');
    assert(
      diagnosticCheck === false,
      '6. Non-diagnostic boundary verification (no medical conclusions or treatment recommendations)'
    );

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.stdout.write(`\n--- REPORT TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runReportTests().then((success) => process.exit(success ? 0 : 1));
}
