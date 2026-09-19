import { GoogleGenAI } from '@google/genai';
import env from '../../config/env';

export const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY || 'MOCK_KEY'
});

export const modelName = env.GEMINI_MODEL || 'gemini-3.6-flash';
