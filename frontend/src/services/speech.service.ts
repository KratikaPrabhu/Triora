import api from './api';
import type { SpeechTokenResponse } from '../types';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export const speechService = {
  async getSpeechToken(): Promise<SpeechTokenResponse> {
    const res = await api.get('/api/speech/token');
    return res.data.data;
  },

  createAzureRecognizer(tokenData: SpeechTokenResponse, locale = 'en-US'): SpeechSDK.SpeechRecognizer | null {
    try {
      if (!tokenData.token || tokenData.token.startsWith('mock-')) {
        return null;
      }
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
      speechConfig.speechRecognitionLanguage = locale;
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      return new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    } catch (err) {
      console.warn('Azure Speech SDK initialization skipped/fallback mode:', err);
      return null;
    }
  },
};

export default speechService;
