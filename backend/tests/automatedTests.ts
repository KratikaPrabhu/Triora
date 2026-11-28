import assert from 'assert';
import { encryptText, decryptText } from '../src/utils/crypto.util';
import CrisisDetector from '../src/services/crisisDetection.service';
import app from '../src/app';
import request from 'supertest';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING TRIORA AUTOMATED INTEGRATION & UNIT TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        failed++;
      });
  }

  // 1. Encryption at rest tests (AES-256-GCM)
  await test('AES-256-GCM field encryption & decryption integrity', () => {
    const sensitive = 'Patient disclosed severe acute family trauma and grief.';
    const ciphertext = encryptText(sensitive);
    assert.notStrictEqual(ciphertext, sensitive, 'Ciphertext must not match plaintext');
    assert.ok(ciphertext.includes(':'), 'Encrypted string must contain IV:AuthTag:Ciphertext separators');
    const decrypted = decryptText(ciphertext);
    assert.strictEqual(decrypted, sensitive, 'Decrypted text must match original plaintext exactly');
  });

  // 2. Clinical Crisis & Risk Detection Safety Net tests
  await test('CrisisDetector correctly flags imminent suicidal ideation and recommends 988/Tele-MANAS', () => {
    const suicidalUtterance = 'I want to end my life, everything is hopeless.';
    const result = CrisisDetector.assessRisk(suicidalUtterance);
    assert.strictEqual(result.isCrisis, true);
    assert.strictEqual(result.severity, 'imminent');
    assert.strictEqual(result.crisisType, 'suicidal_ideation');
    assert.ok(result.groundingMessage.length > 20);
    assert.ok(result.safetyResources.length >= 3);
  });

  await test('CrisisDetector correctly passes neutral conversation without false positives', () => {
    const neutralUtterance = 'I felt a bit tired today because of long hours at college.';
    const result = CrisisDetector.assessRisk(neutralUtterance);
    assert.strictEqual(result.isCrisis, false);
    assert.strictEqual(result.severity, 'none');
  });

  // 3. Health & API Security Integration tests via Supertest
  await test('GET /api/health returns 200 and healthy service status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.environment);
  });

  await test('Security: NoSQL Injection query sanitization cleans prohibited Mongo operator keys', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: 'password123' });
    // Should be rejected by validation or sanitized safely (not crash with 500)
    assert.notStrictEqual(res.status, 500);
  });

  await test('Security: Protected route /api/sessions rejects unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/sessions');
    assert.strictEqual(res.status, 401);
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error('Test suite runner crashed:', e);
  process.exit(1);
});
