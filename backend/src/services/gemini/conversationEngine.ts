import { ai, modelName } from './geminiClient';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import env from '../../config/env';
import logger from '../../config/logger';

export interface EngineInput {
  sessionId?: string;
  language: string;
  history: Array<{ role: string; text: string; timestamp?: Date }>;
  latestMessage: string;
}

export interface ConversationEngineOutput {
  reply: string;
  metadata: {
    intent: string;
    topic: string;
    shouldContinue: boolean;
  };
}

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

const MULTILINGUAL_MOCK_RESPONSES_POOL: Record<string, string[]> = {
  English: [
    "Have you noticed any changes in your sleep patterns or energy levels recently?",
    "How has this been affecting your concentration or ability to focus at work or daily tasks?",
    "What activities or coping strategies have you tried to manage these feelings?",
    "Have you been able to talk to friends, family, or a support system about how you're feeling?",
    "What is the primary thing you hope to get out of starting therapy at this time?"
  ],
  Hindi: [
    "क्या आपने हाल ही में अपनी नींद के पैटर्न या ऊर्जा के स्तर में कोई बदलाव देखा है?",
    "इसका आपके काम या दैनिक कार्यों पर ध्यान केंद्रित करने की क्षमता पर क्या प्रभाव पड़ रहा है?",
    "इन भावनाओं को प्रबंधित करने के लिए आपने किन गतिविधियों या तरीकों को अपनाया है?",
    "क्या आप दोस्तों, परिवार या किसी सहायता प्रणाली से अपनी भावनाओं के बारे में बात कर पाए हैं?",
    "इस समय थेरेपी शुरू करने से आप मुख्य रूप से क्या उम्मीद करते हैं?"
  ],
  Kannada: [
    "ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ನಿದ್ರೆ ಅಥವಾ ಶಕ್ತಿಯ ಮಟ್ಟದಲ್ಲಿ ಯಾವುದೇ ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿದ್ದೀರಾ?",
    "ಇದು ನಿಮ್ಮ ಕೆಲಸ ಅಥವಾ ದೈನಂದಿನ ಕೆಲಸಗಳ ಮೇಲೆ ಗಮನಹರಿಸುವ ಸಾಮರ್ಥ್ಯದ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತಿದೆ?",
    "ಈ ಭಾವನೆಗಳನ್ನು ನಿಭಾಯಿಸಲು ನೀವು ಯಾವ ಚಟುವಟಿಕೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿದ್ದೀರಿ?",
    "ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದರ ಕುರಿತು ಸ್ನೇಹಿತರು ಅಥವಾ ಕುಟುಂಬದವರೊಂದಿಗೆ ಮಾತನಾಡಲು ಸಾಧ್ಯವಾಗಿದೆಯೇ?",
    "ಈ ಸಮಯದಲ್ಲಿ ಥೆರಪಿ ಪ್ರಾರಂಭಿಸುವುದರಿಂದ ನೀವು ಮುಖ್ಯವಾಗಿ ಏನು ನಿರೀಕ್ಷಿಸುತ್ತೀರಿ?"
  ],
  Tamil: [
    "சமீபத்தில் உங்கள் தூக்கம் அல்லது ஆற்றல் மட்டத்தில் ஏதேனும் மாற்றங்களை கவனித்தீர்களா?",
    "இது உங்கள் வேலை அல்லது அன்றாட பணிகளில் கவனம் செலுத்தும் திறனை எவ்வாறு பாதிக்கிறது?",
    "இந்த உணர்வுகளை சமாளிக்க என்ன நடவடிக்கைகளை முயற்சி செய்துள்ளீர்கள்?",
    "நீங்கள் எவ்வாறு உணர்கிறீர்கள் என்பதைப் பற்றி நண்பர்கள் அல்லது குடும்பத்தினரிடம் பேச முடிந்ததா?",
    "இந்த நேரத்தில் சிகிச்சை தொடங்குவதன் மூலம் நீங்கள் முக்கியமாக என்ன எதிர்பார்க்கிறீர்கள்?"
  ],
  Telugu: [
    "ఇటీవల మీ నిద్ర లేదా శక్తి స్థాయిలలో ఏవైనా మార్పులను గమనించారా?",
    "ఇది మీ పని లేదా రోజువారీ పనులపై దృష్టి సారించే సామర్థ్యంపై ఎలా ప్రభావం చూపుతోంది?",
    "ఈ భావనలను నిర్వహించడానికి మీరు ఏ విధానాలను ప్రయత్నించారు?",
    "మీరు ఎలా భావిస్తున్నారో స్నేహితులు లేదా కుటుంబ సభ్యులతో మాట్లాడగలిగారా?",
    "ఈ సమయంలో థెరపీ ప్రారంభించడం ద్వారా మీరు ప్రధానంగా ఏమి ఆశిస్తున్నారు?"
  ]
};

function getDynamicMockReply(language: string, historyLength: number): string {
  const pool = MULTILINGUAL_MOCK_RESPONSES_POOL[language] || MULTILINGUAL_MOCK_RESPONSES_POOL.English;
  const idx = Math.floor(historyLength / 2) % pool.length;
  return pool[idx];
}

export class ConversationEngine {
  /**
   * Process patient input and history to generate intake response & metadata
   */
  async processConversation(input: EngineInput): Promise<ConversationEngineOutput> {
    const { language, history, latestMessage } = input;

    if (!latestMessage || !latestMessage.trim()) {
      throw new Error('User message cannot be empty.');
    }

    const selectedLanguage = resolveLanguageName(language);

    // 1. MOCK_MODE or missing API key fallback
    if (env.MOCK_MODE || !env.GEMINI_API_KEY) {
      logger.info(`Executing Gemini Conversation Engine in MOCK_MODE for language: ${selectedLanguage}`);
      const mockReply = getDynamicMockReply(selectedLanguage, history.length);
      return {
        reply: mockReply,
        metadata: {
          intent: 'sharing_intake_details',
          topic: 'general_wellbeing',
          shouldContinue: true
        }
      };
    }

    // 2. Real Gemini API execution with timeout handling
    try {
      const userPrompt = buildUserPrompt(selectedLanguage, history, latestMessage.trim());

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

      // 10-second timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 10 seconds')), 10000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini API returned an empty text payload.');
      }

      // Clean markdown JSON fences if present
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (!parsed.reply || typeof parsed.reply !== 'string') {
        throw new Error('Parsed Gemini response missing valid reply field.');
      }

      return {
        reply: parsed.reply,
        metadata: {
          intent: parsed.metadata?.intent || 'general_expression',
          topic: parsed.metadata?.topic || 'intake_discussion',
          shouldContinue: parsed.metadata?.shouldContinue !== false
        }
      };
    } catch (err: any) {
      logger.error(`Gemini Conversation Engine Error: ${err.message}`);
      
      // Return safe dynamic fallback intake response on error/timeout
      const fallbackReply = getDynamicMockReply(selectedLanguage, history.length);
      return {
        reply: fallbackReply,
        metadata: {
          intent: 'fallback_response',
          topic: 'general_wellbeing',
          shouldContinue: true
        }
      };
    }
  }
}

export default new ConversationEngine();
