import { ai, modelName } from './geminiClient';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import env from '../../config/env';
import logger from '../../config/logger';

export interface EngineInput {
  sessionId?: string;
  language: string;
  history: Array<{ role: string; text: string; status?: string; timestamp?: Date }>;
  latestMessage: string;
}

export interface ConversationEngineOutput {
  action: 'ask' | 'complete';
  reply: string;
  reason?: string;
  metadata: {
    intent: string;
    topic: string;
    shouldContinue: boolean;
    questionNumber?: number;
    totalQuestions: number;
    sessionEnded: boolean;
  };
}

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 8;

const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: 'English',
  english: 'English',
  hi: 'Hindi',
  hindi: 'Hindi',
  kn: 'Kannada',
  kannada: 'Kannada',
  ta: 'Tamil',
  tamil: 'Tamil',
  te: 'Telugu',
  telugu: 'Telugu',
  ml: 'Malayalam',
  malayalam: 'Malayalam',
  mr: 'Marathi',
  marathi: 'Marathi',
  bn: 'Bengali',
  bengali: 'Bengali',
};

export function resolveLanguageName(codeOrName: string | undefined): string {
  if (!codeOrName) return 'English';
  const lower = codeOrName.toLowerCase().trim();
  return LANGUAGE_CODE_MAP[lower] || codeOrName;
}

export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const FALLBACK_QUESTION_BANKS: Record<string, string[]> = {
  English: [
    "What has been on your mind lately?",
    "How have these feelings been affecting your daily routine or work?",
    "Have you noticed any changes in your sleep patterns or energy levels?",
    "When you feel overwhelmed, what usually helps or what have you tried?",
    "Do you have friends, family, or a support system you feel comfortable talking to?",
    "What is the primary goal you hope to achieve through therapy at this time?",
    "How long have you been experiencing these concerns?",
    "Is there anything specific that triggered these feelings recently?",
    "How are your stress levels when dealing with day-to-day tasks?",
    "What steps or activities help you feel more grounded?"
  ],
  Hindi: [
    "आजकल आपके मन में क्या चल रहा है?",
    "इन भावनाओं का आपकी दिनचर्या या काम पर क्या प्रभाव पड़ रहा है?",
    "क्या आपने अपनी नींद या ऊर्जा के स्तर में कोई बदलाव देखा है?",
    "जब आप परेशान महसूस करते हैं, तो आपको क्या मदद करता है या आपने क्या कोशिश की है?",
    "क्या आपके पास कोई दोस्त, परिवार या सपोर्ट सिस्टम है जिससे आप बात कर सकें?",
    "इस समय थेरेपी से आपकी मुख्य क्या अपेक्षाएं या लक्ष्य हैं?",
    "आप इन चिंताओं को कितने समय से महसूस कर रहे हैं?",
    "क्या हाल ही में किसी विशेष घटना ने इन भावनाओं को बढ़ाया है?",
    "दैनिक कार्यों से निपटते समय आपका तनाव स्तर कैसा रहता है?",
    "कौन से कदम या गतिविधियाँ आपको अधिक शांत महसूस कराने में मदद करती हैं?"
  ],
  Kannada: [
    "ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?",
    "ಈ ಭಾವನೆಗಳು ನಿಮ್ಮ ದೈನಂದಿನ ದಿನಚರಿ ಅಥವಾ ಕೆಲಸದ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರಿವೆ?",
    "ನಿಮ್ಮ ನಿದ್ರೆಯ ಮಾದರಿ ಅಥವಾ ಶಕ್ತಿಯ ಮಟ್ಟದಲ್ಲಿ ಯಾವುದೇ ಬದಲಾವಣೆಗಳನ್ನು ನೀವು ಗಮನಿಸಿದ್ದೀರಾ?",
    "ನೀವು ಆತಂಕಗೊಂಡಾಗ സാധാരണವಾಗಿ ಏನು ಸಹಾಯ ಮಾಡುತ್ತದೆ ಅಥವಾ ನೀವು ಏನು ಪ್ರಯತ್ನಿಸಿದ್ದೀರಿ?",
    "ನಿಮ್ಮ ಕಷ್ಟಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಸ್ನೇಹಿತರು, ಕುಟುಂಬ ಅಥವಾ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ ಇದೆಯೇ?",
    "ಈ ಸಮಯದಲ್ಲಿ ಥೆರಪಿಯ ಮೂಲಕ ನೀವು ಸಾಧಿಸಲು ಬಯಸುವ ಮುಖ್ಯ ಗುರಿ ಏನು?",
    "ನೀವು ಎಷ್ಟು ಸಮಯದಿಂದ ಈ ಕಳವಳಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
    "ಇತ್ತೀಚೆಗೆ ಈ ಭಾವನೆಗಳನ್ನು ಪ್ರಚೋದಿಸಿದ ನಿರ್ದಿಷ್ಟ ಘಟನೆ ಇದೆಯೇ?",
    "ದೈನಂದಿನ ಕೆಲಸಗಳನ್ನು ನಿರ್ವಹಿಸುವಾಗ ನಿಮ್ಮ ಒತ್ತಡದ ಮಟ್ಟ ಹೇಗಿರುತ್ತದೆ?",
    "ಯಾವ ಚಟುವಟಿಕೆಗಳು ನಿಮಗೆ ನೆಮ್ಮದಿ ನೀಡಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ?"
  ],
  Tamil: [
    "சமீபகாலமாக உங்கள் மனதில் என்ன ஓடிக்கொண்டிருக்கிறது?",
    "இந்த உணர்வுகள் உங்கள் அன்றாட வாழ்க்கை அல்லது வேலையை எவ்வாறு பாதித்துள்ளன?",
    "உங்கள் தூக்கம் அல்லது ஆற்றல் மட்டத்தில் ஏதேனும் மாற்றங்களை கவனித்துள்ளீர்களா?",
    "நீங்கள் மன அழுத்தமாக உணரும்போது, உங்களுக்கு என்ன உதவுகிறது அல்லது என்ன முயற்சி செய்துள்ளீர்கள்?",
    "உங்களிடம் பேசக்கூடிய நண்பர்கள், குடும்பத்தினர் அல்லது ஆதரவு அமைப்பு உள்ளதா?",
    "இந்த நேரத்தில் சிகிச்சை மூலம் நீங்கள் அடைய விரும்பும் முதன்மை இலக்கு என்ன?",
    "எவ்வளவு காலமாக இந்த கவலைகளை அனுபவித்து வருகிறீர்கள்?",
    "சமீபத்தில் இந்த உணர்வுகளைத் தூண்டிய குறிப்பிட்ட விஷயம் ஏதேனும் உள்ளதா?",
    "அன்றாடப் பணிகளைக் கையாளும் போது உங்கள் மன அழுத்த நிலை எவ்வாறு உள்ளது?",
    "எந்த நடவடிக்கைகள் உங்களுக்கு அமைதியைத் தர உதவுகின்றன?"
  ],
  Telugu: [
    "ఇటీవల మీ మనస్సులో ఏమి నడుస్తోంది?",
    "ఈ భావాలు మీ దినచర్య లేదా పనిపై ఎలాంటి ప్రభావం చూపుతున్నాయి?",
    "మీ నిద్ర లేదా శక్తి స్థాయిలలో ఏవైనా మార్పులను గమనించారా?",
    "మీరు ఒత్తిడికి గురైనప్పుడు, సాధారణంగా మీకు ఏమి సహాయపడుతుంది లేదా మీరు ఏమి ప్రయత్నించారు?",
    "మీరు మాట్లాడటానికి స్నేహితులు, కుటుంబం లేదా మద్దతు వ్యవస్థ ఉందా?",
    "ఈ సమయంలో థెరపీ ద్వారా మీరు సాధించాలనుకుంటున్న ముఖ్యమైన లక్ష్యం ఏమిటి?",
    "ఎంతకాలంగా మీరు ఈ ఆందోళనలను అనుభవిస్తున్నారు?",
    "ఇటీవల ఈ భావాలను రేకెత్తించిన నిర్దిష్ట సంఘటన ఏదైనా ఉందా?",
    "రోజువారీ పనులను నిర్వహించేటప్పుడు మీ ఒత్తిడి స్థాయి ఎలా ఉంటుంది?",
    "ఏ కార్యకలాపాలు మిమ్మల్ని ప్రశాంతంగా ఉంచడానికి సహాయపడతాయి?"
  ],
  Malayalam: [
    "അടുത്തിടെയായി നിങ്ങളുടെ മനസ്സിൽ എന്താണ് ഉള്ളത്?",
    "ഈ വികാരങ്ങൾ നിങ്ങളുടെ ദിനചര്യയെയോ ജോലിയെയോ എങ്ങനെ ബാധിച്ചിരിക്കുന്നു?",
    "നിങ്ങളുടെ ഉറക്കത്തിലോ ഊർജ്ജ നിലയിലോ എന്തെങ്കിലും മാറ്റങ്ങൾ ശ്രദ്ധിച്ചിട്ടുണ്ടോ?",
    "നിങ്ങൾക്ക് മാനസിക സമ്മർദ്ദം തോന്നുമ്പോൾ സാധാരണയായി എന്താണ് സഹായിക്കുന്നത് അല്ലെങ്കിൽ എന്താണ് ശ്രമിച്ചുനോക്കിയത്?",
    "നിങ്ങൾക്ക് തുറന്നു സംസാരിക്കാൻ സുഹൃത്തുക്കളോ കുടുംബമോ പിന്തുണ സംവിധാനമോ ഉണ്ടോ?",
    "ഈ സമയത്ത് തെറാപ്പിയിലൂടെ നിങ്ങൾ കൈവരിക്കാൻ ആഗ്രഹിക്കുന്ന പ്രധാന ലക്ഷ്യം എന്താണ്?",
    "എത്ര കാലമായി നിങ്ങൾ ഈ ആശങ്കകൾ അനുഭവിക്കുന്നു?",
    "അടുത്തിടെ ഈ വികാരങ്ങൾക്ക് കാരണമായ പ്രത്യേക എന്തെങ്കിലും സംഭവിച്ചിട്ടുണ്ടോ?",
    "ദൈനംദിന കാര്യങ്ങൾ ചെയ്യുമ്പോൾ നിങ്ങളുടെ സമ്മർദ്ദ നില എങ്ങനെയുണ്ട്?",
    "ശാന്തത കൈവരിക്കാൻ ഏതെല്ലാം കാര്യങ്ങളാണ് നിങ്ങളെ സഹായിക്കുന്നത്?"
  ],
  Marathi: [
    "सध्या तुमच्या मनात काय चालले आहे?",
    "या भावनांचा तुमच्या दैनंदिन दिनचर्येवर किंवा कामावर कसा परिणाम होत आहे?",
    "तुमच्या झोपेच्या पद्धतीत किंवा ऊर्जेच्या पातळीत काही बदल जाणवले आहेत का?",
    "जेव्हा तुम्हाला तणाव जाणवतो, तेव्हा सहसा कशाने मदत होते किंवा तुम्ही काय प्रयत्न केले आहेत?",
    "तुमच्याकडे बोलायला मित्र, कुटुंब किंवा आधार देणारी यंत्रणा आहे का?",
    "या वेळी थेरपीद्वारे तुमचे मुख्य ध्येय काय आहे?",
    "तुम्ही किती काळापासून या चिंता अनुभवत आहात?",
    "नुकतीच अशी कोणती विशिष्ट घटना घडली आहे ज्यामुळे या भावना वाढल्या?",
    "दैनंदिन कामे करताना तुमच्या तणावाची पातळी कशी असते?",
    "कोणत्या गोष्टी किंवा उपक्रम तुम्हाला अधिक शांत राहण्यास मदत करतात?"
  ],
  Bengali: [
    "সাম্প্রতিক সময়ে আপনার মনে কি চলছে?",
    "এই অনুভূতিগুলি আপনার দৈনন্দিন রুটিন বা কাজকে কীভাবে প্রভাবিত করছে?",
    "আপনি কি আপনার ঘুমের ধরণ বা শক্তির মাত্রায় কোনো পরিবর্তন লক্ষ্য করেছেন?",
    "যখন আপনি মানসিক চাপে থাকেন, তখন কী আপনাকে সাহায্য করে বা আপনি কী চেষ্টা করেছেন?",
    "কথা বলার জন্য আপনার কি কোনো বন্ধু, পরিবার বা সহায়ক ব্যবস্থা আছে?",
    "এই মুহূর্তে থেরাপির মাধ্যমে আপনার অর্জনের প্রধান লক্ষ্য কী?",
    "কত দিন ধরে আপনি এই উদ্বেগগুলি অনুভব করছেন?",
    "সম্প্রতি কি এমন কোনো ঘটনা ঘটেছে যা এই অনুভূতিগুলিকে বাড়িয়ে তুলেছে?",
    "দৈনন্দিন কাজ পরিচালনার সময় আপনার মানসিক চাপের মাত্রা কেমন থাকে?",
    "কোন পদক্ষেপ বা কাজগুলি আপনাকে আরও শান্ত অনুভব করতে সাহায্য করে?"
  ]
};

export function getFallbackQuestion(language: string, askedQuestions: string[]): string {
  const bank = FALLBACK_QUESTION_BANKS[language] || FALLBACK_QUESTION_BANKS.English;
  const normalizedAsked = new Set(askedQuestions.map(normalizeQuestion));

  for (const q of bank) {
    if (!normalizedAsked.has(normalizeQuestion(q))) {
      return q;
    }
  }

  return bank[bank.length - 1] || "What steps or activities help you feel more grounded?";
}

export class GeminiUnavailableError extends Error {
  public code: string;
  constructor(message: string) {
    super(message);
    this.name = 'GeminiUnavailableError';
    this.code = 'AI_TEMPORARILY_UNAVAILABLE';
  }
}

export class ConversationEngine {
  /**
   * Process patient input and history to generate dynamic intake question & metadata
   */
  async processConversation(input: EngineInput): Promise<ConversationEngineOutput> {
    const { language, history, latestMessage } = input;
    const selectedLanguage = resolveLanguageName(language);

    const lastHistoryMsg = history && history.length > 0 ? history[history.length - 1] : null;
    const isSkippedTurn = lastHistoryMsg && lastHistoryMsg.status === 'skipped';

    if ((!latestMessage || !latestMessage.trim()) && !isSkippedTurn) {
      throw new Error('User message cannot be empty.');
    }

    // Extract all previously asked assistant questions
    const askedQuestions = history
      .filter((m) => m.role === 'assistant' && m.text.trim())
      .map((m) => m.text.trim());

    const assistantCount = askedQuestions.length;

    // Strict 5-8 question boundary
    if (assistantCount >= MAX_QUESTIONS) {
      logger.info(`[Conversation] Reached MAX_QUESTIONS boundary (${MAX_QUESTIONS}). Completing session.`);
      return {
        action: 'complete',
        reply: 'Thank you for sharing. Your intake session is now complete.',
        reason: 'Completed 8 questions maximum.',
        metadata: {
          intent: 'session_complete',
          topic: 'intake_conclusion',
          shouldContinue: false,
          questionNumber: MAX_QUESTIONS,
          totalQuestions: MAX_QUESTIONS,
          sessionEnded: true
        }
      };
    }

    const nextQuestionNum = assistantCount + 1;
    logger.info(`[Conversation] Question number: ${nextQuestionNum}/${MAX_QUESTIONS}`);
    logger.info(`[Conversation] Patient response received`);

    // 1. MOCK_MODE or missing API key fallback
    if (env.MOCK_MODE || process.env.MOCK_MODE === 'true' || !env.GEMINI_API_KEY) {
      logger.info(`Executing Gemini Conversation Engine in fallback mode for language: ${selectedLanguage}`);
      const fallbackReply = getFallbackQuestion(selectedLanguage, askedQuestions);
      return {
        action: 'ask',
        reply: fallbackReply,
        reason: 'Fallback generated question',
        metadata: {
          intent: 'sharing_intake_details',
          topic: 'general_wellbeing',
          shouldContinue: true,
          questionNumber: nextQuestionNum,
          totalQuestions: MAX_QUESTIONS,
          sessionEnded: false
        }
      };
    }

    // 2. Real Gemini API execution with retries and exponential backoff
    const maxAttempts = 3;
    let lastError: any = null;

    logger.info(`[Gemini] Request started for Question ${nextQuestionNum}/${MAX_QUESTIONS}`);
    logger.info(`[Gemini] Conversation message count: ${history.length}`);
    logger.info(`[Gemini] Model: ${modelName}`);

    const userPrompt = buildUserPrompt(selectedLanguage, history, latestMessage ? latestMessage.trim() : '', askedQuestions);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.info(`[Gemini] Attempt: ${attempt}`);

        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents: [
            { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 10 seconds')), 10000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        logger.info(`[Gemini] Request completed`);
        logger.info(`[Gemini] Response received`);

        const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Gemini API returned an empty text payload.');
        }

        const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        let action: 'ask' | 'complete' = parsed.action === 'complete' && nextQuestionNum >= MIN_QUESTIONS ? 'complete' : 'ask';
        let reply: string = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';

        if (action === 'complete') {
          return {
            action: 'complete',
            reply: reply || 'Thank you for sharing. Your session is complete.',
            reason: parsed.reason || 'Gemini concluded intake session.',
            metadata: {
              intent: 'session_complete',
              topic: 'intake_conclusion',
              shouldContinue: false,
              questionNumber: nextQuestionNum,
              totalQuestions: MAX_QUESTIONS,
              sessionEnded: true
            }
          };
        }

        // Only generate fallback question if reply is missing or detected as duplicate question
        if (!reply) {
          reply = getFallbackQuestion(selectedLanguage, askedQuestions);
        } else {
          const normalizedGenerated = normalizeQuestion(reply);
          const normalizedAskedList = askedQuestions.map(normalizeQuestion);

          if (normalizedAskedList.includes(normalizedGenerated)) {
            logger.warn(`Duplicate question detected: "${reply}". Generating unique fallback question.`);
            reply = getFallbackQuestion(selectedLanguage, askedQuestions);
          }
        }

        return {
          action: 'ask',
          reply,
          reason: parsed.reason || 'Gemini dynamic intake step',
          metadata: {
            intent: parsed.metadata?.intent || 'general_expression',
            topic: parsed.metadata?.topic || 'intake_discussion',
            shouldContinue: true,
            questionNumber: nextQuestionNum,
            totalQuestions: MAX_QUESTIONS,
            sessionEnded: false
          }
        };
      } catch (err: any) {
        lastError = err;
        logger.error(`[Gemini] Attempt ${attempt} failed: ${err.message || err}`);

        if (attempt < maxAttempts) {
          const backoffDelay = Math.pow(2, attempt - 1) * 1000; // Attempt 1 -> 1s, Attempt 2 -> 2s
          logger.info(`[Gemini] Retrying in ${backoffDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    // All retries failed - DO NOT generate fake fallback question. Throw GeminiUnavailableError to keep session alive.
    logger.error(`[Gemini] All ${maxAttempts} attempts failed. Returning GeminiUnavailableError.`);
    throw new GeminiUnavailableError(
      lastError?.message || 'The AI service is temporarily unavailable. Please try again.'
    );
  }
}

export default new ConversationEngine();
