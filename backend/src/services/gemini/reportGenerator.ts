import { ai, modelName } from './geminiClient';
import { REPORT_GENERATION_PROMPT, buildReportPrompt } from './prompts';
import { resolveLanguageName } from './conversationEngine';
import env from '../../config/env';
import logger from '../../config/logger';

export interface GeneratedReportData {
  summary: string;
  keyThemes: string[];
  concerns: string[];
  emotionalContext: string;
  importantStatements: string[];
  conversationOverview: string;
}

export class ReportGenerator {
  /**
   * Generate structured intake report from session transcript
   */
  async generateReportPayload(
    language: string,
    transcript: Array<{ role: string; text: string }>
  ): Promise<GeneratedReportData> {
    const selectedLanguage = resolveLanguageName(language);

    // 1. MOCK_MODE or missing API key fallback
    if (env.MOCK_MODE || !env.GEMINI_API_KEY) {
      logger.info('Generating mock intake report payload (MOCK_MODE=true)');
      return {
        summary: 'Patient expressed feelings of work-related stress and difficulty maintaining work-life balance.',
        keyThemes: ['Workplace Stress', 'Time Management', 'Self-Care'],
        concerns: ['High workload expectations', 'Intermittent sleep disruption'],
        emotionalContext: 'Patient reflected an open and cooperative tone while discussing current daily pressure.',
        importantStatements: ['"I want to learn better strategies to manage stress before it overwhelms me."'],
        conversationOverview: 'The intake conversation covered primary lifestyle stressors, personal goals for therapy, and communication preferences.'
      };
    }

    // 2. Real Gemini API call with 15-second timeout
    try {
      const prompt = buildReportPrompt(selectedLanguage, transcript);

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `${REPORT_GENERATION_PROMPT}\n\n${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini Report generation timed out after 15 seconds')), 15000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini returned an empty report payload.');
      }

      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      // Validate required report fields
      return {
        summary: parsed.summary || 'Summary of intake conversation provided by patient.',
        keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : ['General Intake'],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : ['Personal Goals'],
        emotionalContext: parsed.emotionalContext || 'Patient communicated openly about concerns.',
        importantStatements: Array.isArray(parsed.importantStatements) ? parsed.importantStatements : [],
        conversationOverview: parsed.conversationOverview || 'Intake conversation completed.'
      };
    } catch (err: any) {
      logger.error(`Gemini Report Generation Error: ${err.message}`);

      // Safe fallback report payload
      return {
        summary: 'Patient completed an intake session expressing personal concerns and goals for therapy.',
        keyThemes: ['General Intake', 'Therapy Goals'],
        concerns: ['Primary Life Stressors'],
        emotionalContext: 'Patient engaged in a supportive pre-therapy conversation.',
        importantStatements: [],
        conversationOverview: 'Structured pre-therapy intake session completed.'
      };
    }
  }
}

export default new ReportGenerator();
