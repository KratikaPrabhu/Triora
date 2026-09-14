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
}

export default new SpeechService();
