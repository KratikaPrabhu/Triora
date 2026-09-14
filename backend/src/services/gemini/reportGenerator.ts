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

    // Helper function to build a dynamic report strictly from actual transcript messages
    const generateTranscriptBasedReport = (
      userMsgs: string[]
    ): GeneratedReportData => {
      if (userMsgs.length === 0) {
        return {
          summary: 'Patient completed an intake session. No specific patient statements were recorded.',
          keyThemes: ['General Intake'],
          concerns: ['Not discussed during this session'],
          emotionalContext: 'Patient engaged in the intake conversation.',
          importantStatements: [],
          conversationOverview: 'Structured intake session completed with 0 patient responses.'
        };
      }

      const combinedText = userMsgs.join(' ');
      const keyThemes: string[] = [];

      if (/study|studies|exam|school|college|academic|university/i.test(combinedText)) {
        keyThemes.push('Academic / Exam-Related Stress');
      }
      if (/work|job|boss|career|office/i.test(combinedText)) {
        keyThemes.push('Workplace Stress');
      }
      if (/family|parent|spouse|partner|relationship/i.test(combinedText)) {
        keyThemes.push('Interpersonal / Family Dynamics');
      }
      if (/sleep|insomnia|tired|fatigue/i.test(combinedText)) {
        keyThemes.push('Sleep / Fatigue');
      }
      if (keyThemes.length === 0) {
        keyThemes.push('Patient-Reported Concerns');
      }

      const cleanedMsgs = userMsgs.map((msg) =>
        msg.replace(/\b(uh|um|like)\b/gi, '').replace(/\s+/g, ' ').trim()
      );

      return {
        summary: `The patient reported experiencing concerns during intake: ${cleanedMsgs.join('. ')}`,
        keyThemes,
        concerns: cleanedMsgs.map((m) => `Patient reported: ${m}`),
        emotionalContext: 'Patient communicated openly about their current experience during the intake session.',
        importantStatements: cleanedMsgs.map((m) => `"${m}"`),
        conversationOverview: `Intake session completed with ${userMsgs.length} user response(s).`
      };
    };

    const userMessages = transcript
      .filter((m) => m.role === 'user' && m.text && !m.text.includes('No audible answer recorded.'))
      .map((m) => m.text.trim());

    // 1. Missing API key fallback check
    if (!env.GEMINI_API_KEY) {
      logger.info('GEMINI_API_KEY not set. Generating dynamic fallback intake report from transcript.');
      return generateTranscriptBasedReport(userMessages);
    }

    // 2. Gemini 2.5 Flash API execution with safe logging
    try {
      logger.info(`[Report] Provider: Gemini | Model: ${modelName} | Transcript messages: ${transcript.length}`);
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
        summary: parsed.summary || (userMessages.length > 0 ? `Patient reported: "${userMessages.join(' ')}"` : 'Summary of intake conversation.'),
        keyThemes: Array.isArray(parsed.keyThemes) && parsed.keyThemes.length > 0 ? parsed.keyThemes : ['General Intake'],
        concerns: Array.isArray(parsed.concerns) && parsed.concerns.length > 0 ? parsed.concerns : ['Not discussed during this session'],
        emotionalContext: parsed.emotionalContext || 'Patient communicated openly about concerns.',
        importantStatements: Array.isArray(parsed.importantStatements) ? parsed.importantStatements : userMessages.map(m => `"${m}"`),
        conversationOverview: parsed.conversationOverview || 'Intake conversation completed.'
      };
    } catch (err: any) {
      logger.error(`Gemini Report Generation Error: ${err.message}`);
      return generateTranscriptBasedReport(userMessages);
    }
  }
}

export default new ReportGenerator();
