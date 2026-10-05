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
  process.env.MOCK_MODE = 'true';
  process.stdout.write('===========================================\n');
  process.stdout.write('   RUNNING TRIORA FULL BACKEND TEST SUITE  \n');
  process.stdout.write('===========================================\n\n');

  let allPassed = true;

  process.stdout.write('--- [1/10] Health Endpoint Test ---\n');
  const healthPassed = await runHealthTest();
  console.log(`[Result 1] Health: ${healthPassed}`);
  if (!healthPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [2/10] Authentication Test Suite ---\n');
  const authPassed = await runAuthTests();
  console.log(`[Result 2] Auth: ${authPassed}`);
  if (!authPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [3/10] Google OAuth Test Suite ---\n');
  const googlePassed = await runGoogleAuthTests();
  console.log(`[Result 3] Google: ${googlePassed}`);
  if (!googlePassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [4/10] Patient Onboarding Test Suite ---\n');
  const onboardingPassed = await runOnboardingTests();
  console.log(`[Result 4] Onboarding: ${onboardingPassed}`);
  if (!onboardingPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [5/10] Patient Session Management Test Suite ---\n');
  const sessionPassed = await runSessionTests();
  console.log(`[Result 5] Session: ${sessionPassed}`);
  if (!sessionPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [6/10] Azure Speech Token Test Suite ---\n');
  const speechPassed = await runSpeechTests();
  console.log(`[Result 6] Speech: ${speechPassed}`);
  if (!speechPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [7/10] Gemini Conversation Engine Test Suite ---\n');
  const geminiPassed = await runGeminiTests();
  console.log(`[Result 7] Gemini: ${geminiPassed}`);
  if (!geminiPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [8/10] Real-Time Conversation WebSocket Test Suite ---\n');
  const wsPassed = await runWebSocketTests();
  console.log(`[Result 8] WS: ${wsPassed}`);
  if (!wsPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [9/10] AI-Generated Session Reports Test Suite ---\n');
  const reportPassed = await runReportTests();
  console.log(`[Result 9] Report: ${reportPassed}`);
  if (!reportPassed) allPassed = false;
  process.stdout.write('\n');

  process.stdout.write('--- [10/10] Failures, Edge Cases & Heat-Map Test Suite ---\n');
  const failuresPassed = await runFailuresAndHeatmapTests();
  console.log(`[Result 10] Failures: ${failuresPassed}`);
  if (!failuresPassed) allPassed = false;
  process.stdout.write('\n');

  console.log('Results summary:', { healthPassed, authPassed, googlePassed, onboardingPassed, sessionPassed, speechPassed, geminiPassed, wsPassed, reportPassed, failuresPassed });
  const finalPass = Boolean(healthPassed && authPassed && googlePassed && onboardingPassed && sessionPassed && speechPassed && geminiPassed && wsPassed && reportPassed && failuresPassed);

  process.stdout.write('===========================================\n');
  if (finalPass) {
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
