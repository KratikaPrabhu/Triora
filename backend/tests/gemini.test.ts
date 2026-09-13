import conversationEngine from '../src/services/gemini/conversationEngine';

export async function runGeminiTests(): Promise<boolean> {
  process.stdout.write('Starting Gemini Conversation Engine Tests...\n');

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
    // 1. Normal Conversation (MOCK_MODE=true)
    const resNormal = await conversationEngine.processConversation({
      language: 'English',
      history: [],
      latestMessage: 'I have been feeling overwhelmed by my work schedule recently.'
    });
    assert(
      typeof resNormal.reply === 'string' &&
        resNormal.reply.length > 0 &&
        resNormal.metadata.intent !== undefined &&
        resNormal.metadata.topic !== undefined &&
        resNormal.metadata.shouldContinue === true,
      '1. Normal conversation output (structured reply + metadata)'
    );

    // 2. Multilingual Requests (Hindi & Kannada)
    const resHindi = await conversationEngine.processConversation({
      language: 'Hindi',
      history: [],
      latestMessage: 'मुझे काम का बहुत तनाव हो रहा है।'
    });
    assert(
      typeof resHindi.reply === 'string' && resHindi.reply.length > 0,
      '2. Multilingual request handling (Hindi)'
    );

    const resKannada = await conversationEngine.processConversation({
      language: 'Kannada',
      history: [],
      latestMessage: 'ನನಗೆ ಕೆಲಸದ ಒತ್ತಡ ಹೆಚ್ಚಾಗಿದೆ.'
    });
    assert(
      typeof resKannada.reply === 'string' && resKannada.reply.length > 0,
      '2b. Multilingual request handling (Kannada)'
    );

    // 3. Empty User Message Rejection
    let emptyCaught = false;
    try {
      await conversationEngine.processConversation({
        language: 'English',
        history: [],
        latestMessage: '   '
      });
    } catch (e: any) {
      emptyCaught = e.message.includes('cannot be empty');
    }
    assert(emptyCaught, '3. Empty user message rejection');

    // 4. Verification that response does NOT contain diagnostic assertions
    const diagnosticCheck =
      resNormal.reply.toLowerCase().includes('you have depression') ||
      resNormal.reply.toLowerCase().includes('diagnosed with') ||
      resNormal.reply.toLowerCase().includes('take this medication');
    assert(!diagnosticCheck, '4. Non-diagnostic boundary verification (no medical conclusions or prescriptions)');

  } catch (err: any) {
    process.stderr.write(`Test execution error: ${err.stack}\n`);
    failedCount++;
  } finally {
    process.stdout.write(`\n--- GEMINI CONVERSATION ENGINE TEST SUMMARY ---\nPassed: ${passedCount}\nFailed: ${failedCount}\n`);
    return failedCount === 0;
  }
}

if (require.main === module) {
  runGeminiTests().then((success) => process.exit(success ? 0 : 1));
}
