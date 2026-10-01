import https from 'https';
import env from '../config/env';
import logger from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import { languageFor, recognitionLocales } from '../config/languages';

export interface SpeechTokenResponse {
  token: string;
  region: string;
  voice: string;
  locale: string;
  recognitionLocales: string[];
  expiresAt: string;
}

export class SpeechService {
  /**
   * Fetch short-lived Azure Speech authorization token with language configuration
   */
  async getSpeechToken(langCode?: string): Promise<SpeechTokenResponse> {
    const region = env.AZURE_SPEECH_REGION || 'eastus';
    const langObj = languageFor(langCode);
    const voice = langObj.voice;
    const locale = langObj.locale;
    const recLocales = recognitionLocales(langCode || 'en');

    // Issue Azure Speech authorization token when subscription key is present
    if (!env.AZURE_SPEECH_KEY) {
      logger.warn(`AZURE_SPEECH_KEY not set. Returning fallback mock token for language '${langObj.code}'`);
      return {
        token: `mock-azure-speech-token-${Date.now()}`,
        region,
        voice,
        locale,
        recognitionLocales: recLocales,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      };
    }

    // Production Azure Speech token request
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: `${region}.api.cognitive.microsoft.com`,
        path: '/sts/v1.0/issueToken',
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
          'Content-Length': '0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200 && data) {
            resolve({
              token: data.trim(),
              region,
              voice,
              locale,
              recognitionLocales: recLocales,
              expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            });
          } else {
            logger.error(`Azure Speech Services token endpoint returned status code ${res.statusCode}`);
            const error: AppError = new Error('Failed to retrieve speech authorization token from Azure Speech Services.');
            error.statusCode = 502;
            reject(error);
          }
        });
      });

      req.on('error', (err) => {
        logger.error(`Azure Speech Services connection failed: ${err.message}`);
        const error: AppError = new Error('Azure Speech Services is currently unreachable.');
        error.statusCode = 503;
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Generate Azure Speech Text-to-Speech audio buffer for given text and language
   */
  async generateTTS(text: string, langCode?: string): Promise<Buffer> {
    const region = env.AZURE_SPEECH_REGION || 'centralindia';
    const langObj = languageFor(langCode);
    const voice = langObj.voice;
    const locale = langObj.locale;

    logger.info(`[Azure TTS] Request received`);
    logger.info(`[Azure TTS] Language: ${langObj.code}`);
    logger.info(`[Azure TTS] Voice: ${voice}`);
    logger.info(`[Azure TTS] Generating audio`);

    if (!env.AZURE_SPEECH_KEY) {
      logger.error('[Azure TTS] AZURE_SPEECH_KEY is not configured on server.');
      const error: AppError = new Error('Azure Speech TTS temporarily unavailable.');
      error.statusCode = 503;
      throw error;
    }

    const escapedText = escapeXml(text);
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${locale}'><voice name='${voice}'>${escapedText}</voice></speak>`;
    const ssmlBuffer = Buffer.from(ssml, 'utf-8');

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: `${region}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'TrioraBackend/1.0',
          'Content-Length': ssmlBuffer.length.toString()
        }
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            const audioBuffer = Buffer.concat(chunks);
            logger.info(`[Azure TTS] Audio generated successfully (${audioBuffer.length} bytes)`);
            resolve(audioBuffer);
          } else {
            logger.error(`[Azure TTS] Endpoint returned status code ${res.statusCode}`);
            const error: AppError = new Error('Azure Speech TTS temporarily unavailable.');
            error.statusCode = 503;
            reject(error);
          }
        });
      });

      req.on('error', (err) => {
        logger.error(`[Azure TTS] Connection error: ${err.message}`);
        const error: AppError = new Error('Azure Speech TTS temporarily unavailable.');
        error.statusCode = 503;
        reject(error);
      });

      req.write(ssmlBuffer);
      req.end();
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default new SpeechService();
