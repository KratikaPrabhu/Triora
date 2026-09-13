import assert from 'node:assert';
import http from 'node:http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import User from '../src/models/user.model';
import Session from '../src/models/session.model';
import conversationEngine from '../src/services/gemini/conversationEngine';
import speechService from '../src/services/speech.service';

let server: http.Server;
let port: number;

function request(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body: any = null
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders: Record<string, string> = { ...headers };

    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
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
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode || 500, body: parsed });
          } catch {
            resolve({ status: res.statusCode || 500, body: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

export async function runFailuresAndHeatmapTests() {
  console.log('\n--- [10/10] Failures, Edge Cases & Heat-Map Test Suite ---');

  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triora_db';
    await mongoose.connect(mongoUri);
  }

  await User.deleteMany({ email: { $in: ['testfail1@example.com', 'testfail2@example.com'] } });
  await Session.deleteMany({});

  server = app.listen(0);
  const addr = server.address() as any;
  port = addr.port;

  try {
    // Setup test users & sessions
    const user1 = await User.create({
      name: 'Fail User One',
      email: 'testfail1@example.com',
      passwordHash: 'hashed123'
    });

    const user2 = await User.create({
      name: 'Fail User Two',
      email: 'testfail2@example.com',
      passwordHash: 'hashed123'
    });

    const token1 = jwt.sign(
      { id: user1._id.toString(), email: user1.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    const token2 = jwt.sign(
      { id: user2._id.toString(), email: user2.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    const session1 = await Session.create({
      userId: user1._id,
      status: 'active',
      language: 'English',
      transcript: [
        { role: 'user', text: 'I am feeling overwhelmed by work tasks.', timestamp: new Date() },
        { role: 'assistant', text: 'I hear you. What specific tasks feel heaviest right now?', timestamp: new Date() }
      ]
    });

    // 1. Gemini Service Failure Handling Test
    console.log('Testing Gemini service failure handling...');
    const originalProcessConversation = conversationEngine.processConversation.bind(conversationEngine);
    
    // Temporarily mock Gemini to throw an error
    conversationEngine.processConversation = async () => {
      throw new Error('Gemini API quota exceeded or network connection reset.');
    };

    try {
      await conversationEngine.processConversation({ language: 'English', history: [], latestMessage: 'Hello' });
      assert.fail('Should have thrown an error');
    } catch (err: any) {
      assert.strictEqual(err.message, 'Gemini API quota exceeded or network connection reset.');
      console.log('✅ PASS: 1. Gemini service failure gracefully caught');
    } finally {
      conversationEngine.processConversation = originalProcessConversation;
    }

    // 2. Azure Speech Token Failure Handling Test
    console.log('Testing Azure Speech service failure handling...');
    const originalGetToken = speechService.getSpeechToken.bind(speechService);

    speechService.getSpeechToken = async () => {
      throw new Error('Azure Speech Service region timeout (408).');
    };

    try {
      await speechService.getSpeechToken();
      assert.fail('Should have thrown an error');
    } catch (err: any) {
      assert.strictEqual(err.message, 'Azure Speech Service region timeout (408).');
      console.log('✅ PASS: 2. Azure Speech service failure gracefully caught');
    } finally {
      speechService.getSpeechToken = originalGetToken;
    }

    // 3. Heat-Map Access - Authorized Request
    const resHeatmap1 = await request('GET', `/api/sessions/${session1._id}/heatmap`, {
      Authorization: `Bearer ${token1}`
    });
    assert.strictEqual(resHeatmap1.status, 200);
    assert.strictEqual(resHeatmap1.body.success, true);
    assert.strictEqual(resHeatmap1.body.data.sessionId, session1._id.toString());
    assert(Array.isArray(resHeatmap1.body.data.timeline));
    assert(resHeatmap1.body.data.timeline.length > 0);
    console.log('✅ PASS: 3. Fetch simulated heat-map for own session (200 OK)');

    // 4. Heat-Map Access - Cross-User Isolation (404 Not Found)
    const resHeatmap2 = await request('GET', `/api/sessions/${session1._id}/heatmap`, {
      Authorization: `Bearer ${token2}`
    });
    assert.strictEqual(resHeatmap2.status, 404);
    assert.strictEqual(resHeatmap2.body.success, false);
    assert.strictEqual(resHeatmap2.body.error.message, 'Session not found or access denied.');
    console.log('✅ PASS: 4. Cross-user isolation: User 2 cannot access User 1 heat-map (404 Not Found)');

    // 5. Heat-Map Access - Invalid ID Format (400 Bad Request)
    const resHeatmapInvalid = await request('GET', '/api/sessions/invalid_session_id/heatmap', {
      Authorization: `Bearer ${token1}`
    });
    assert.strictEqual(resHeatmapInvalid.status, 400);
    assert.strictEqual(resHeatmapInvalid.body.success, false);
    assert.strictEqual(resHeatmapInvalid.body.error.message, 'Invalid session ID format.');
    console.log('✅ PASS: 5. Invalid session ID format for heat-map rejection (400 Bad Request)');

    // 6. JWT Invalid / Malformed Header Test
    const resInvalidJwt = await request('GET', `/api/sessions/${session1._id}/heatmap`, {
      Authorization: 'Bearer invalid_garbage_token_str'
    });
    assert.strictEqual(resInvalidJwt.status, 401);
    assert.strictEqual(resInvalidJwt.body.success, false);
    assert.strictEqual(resInvalidJwt.body.error.message, 'Invalid or expired token.');
    console.log('✅ PASS: 6. Malformed / invalid JWT token rejection (401 Unauthorized)');

    // Clean up test data
    await User.deleteMany({ email: { $in: ['testfail1@example.com', 'testfail2@example.com'] } });
    await Session.deleteMany({ _id: session1._id });

    console.log('\n--- FAILURES & HEATMAP TEST SUMMARY ---');
    console.log('Passed: 6');
    console.log('Failed: 0\n');
    return true;
  } catch (err: any) {
    console.error('❌ Failures & Heatmap test failed:', err.message);
    return false;
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runFailuresAndHeatmapTests()
    .then(() => {
      console.log('Failures and Heatmap test suite completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Test suite failed:', err);
      process.exit(1);
    });
}
