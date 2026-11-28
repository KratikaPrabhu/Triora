import { GoogleGenAI } from '@google/genai';
import env from '../../config/env';

export const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY || 'MOCK_KEY'
});

export const modelName = 'gemini-3.5-flash';

// Fallback pool strictly uses gemini-3.5-flash
export const FALLBACK_MODELS = [
  'gemini-3.5-flash'
];

