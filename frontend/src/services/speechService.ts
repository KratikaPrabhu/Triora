import { apiRequest } from './api';
import type { SpeechToken, ApiResponse } from '../types';

export const speechService = {
  async getSpeechToken(language = 'en'): Promise<ApiResponse<SpeechToken>> {
    return apiRequest<SpeechToken>(`/speech/token?language=${encodeURIComponent(language)}`);
  },
};
