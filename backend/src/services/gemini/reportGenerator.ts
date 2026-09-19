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
    transcript: Array<{ role: string; text: string; status?: string }>
  ): Promise<GeneratedReportData> {
    const selectedLanguage = resolveLanguageName(language);

    // Filter to ONLY user messages that were genuinely answered
    const realUserMessages = transcript
      .filter(
        (m) =>
          m.role === 'user' &&
          m.text &&
          m.text.trim() &&
          m.status !== 'skipped' &&
          m.status !== 'silent' &&
          m.status !== 'recognition_error' &&
          !m.text.includes('No audible answer recorded.')
      )
      .map((m) => m.text.trim());

    // Filter full transcript for prompt to exclude empty/skipped items
    const filteredTranscript = transcript.filter(
      (m) =>
        m.text &&
        m.text.trim() &&
        m.status !== 'skipped' &&
        m.status !== 'silent' &&
        !m.text.includes('No audible answer recorded.')
    );

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

    // 1. Missing API key or MOCK_MODE fallback check
    if (env.MOCK_MODE || process.env.MOCK_MODE === 'true' || !env.GEMINI_API_KEY) {
      logger.info('MOCK_MODE active or GEMINI_API_KEY not set. Generating dynamic fallback intake report from transcript.');
      return generateTranscriptBasedReport(realUserMessages);
    }

    // 2. Gemini 2.5 Flash API execution with safe logging
    try {
      logger.info(`[Report] Provider: Gemini | Model: ${modelName} | Real user responses: ${realUserMessages.length}`);
      const prompt = buildReportPrompt(selectedLanguage, filteredTranscript);

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
        summary: parsed.summary || (realUserMessages.length > 0 ? `Patient reported: "${realUserMessages.join(' ')}"` : 'Summary of intake conversation.'),
        keyThemes: Array.isArray(parsed.keyThemes) && parsed.keyThemes.length > 0 ? parsed.keyThemes : ['General Intake'],
        concerns: Array.isArray(parsed.concerns) && parsed.concerns.length > 0 ? parsed.concerns : ['Not discussed during this session'],
        emotionalContext: parsed.emotionalContext || 'Patient communicated openly about concerns.',
        importantStatements: Array.isArray(parsed.importantStatements) ? parsed.importantStatements : realUserMessages.map(m => `"${m}"`),
        conversationOverview: parsed.conversationOverview || 'Intake conversation completed.'
      };
    } catch (err: any) {
      logger.error(`Gemini Report Generation Error: ${err.message}`);
      return generateTranscriptBasedReport(realUserMessages);
    }
  }
}

export default new ReportGenerator();
