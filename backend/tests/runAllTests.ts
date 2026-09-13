import { runHealthTest } from './health.test';
import { runAuthTests } from './auth.test';
import { runGoogleAuthTests } from './googleAuth.test';
import { runOnboardingTests } from './onboarding.test';
import { runSessionTests } from './session.test';
import { runSpeechTests } from './speech.test';
import { runGeminiTests } from './gemini.test';
import { runWebSocketTests } from './websocket.test';
import { runReportTests } from './report.test';
import { runFailuresAndHeatmapTests } from './failuresAndHeatmap.test';

async function runAll() {
  process.stdout.write('===========================================\n');
  process.stdout.write('   RUNNING TRIORA FULL BACKEND TEST SUITE  \n');
  process.stdout.write('===========================================\n\n');

  let allPassed = true;

  process.stdout.write('--- [1/10] Health Endpoint Test ---\n');
  const healthPassed = await runHealthTest();
  if (!healthPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [2/10] Authentication Test Suite ---\n');
  const authPassed = await runAuthTests();
  if (!authPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [3/10] Google OAuth Test Suite ---\n');
  const googlePassed = await runGoogleAuthTests();
  if (!googlePassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [4/10] Patient Onboarding Test Suite ---\n');
  const onboardingPassed = await runOnboardingTests();
  if (!onboardingPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [5/10] Patient Session Management Test Suite ---\n');
  const sessionPassed = await runSessionTests();
  if (!sessionPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [6/10] Azure Speech Token Test Suite ---\n');
  const speechPassed = await runSpeechTests();
  if (!speechPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [7/10] Gemini Conversation Engine Test Suite ---\n');
  const geminiPassed = await runGeminiTests();
  if (!geminiPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [8/10] Real-Time Conversation WebSocket Test Suite ---\n');
  const wsPassed = await runWebSocketTests();
  if (!wsPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [9/10] AI-Generated Session Reports Test Suite ---\n');
  const reportPassed = await runReportTests();
  if (!reportPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [10/10] Failures, Edge Cases & Heat-Map Test Suite ---\n');
  const failuresPassed = await runFailuresAndHeatmapTests();
  if (!failuresPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('===========================================\n');
  if (allPassed) {
    process.stdout.write('🎉 ALL TRIORA BACKEND TESTS PASSED (100%)\n');
    process.stdout.write('===========================================\n');
    process.exit(0);
  } else {
    process.stderr.write('❌ SOME TEST SUITES FAILED\n');
    process.stdout.write('===========================================\n');
    process.exit(1);
  }
}

runAll();
