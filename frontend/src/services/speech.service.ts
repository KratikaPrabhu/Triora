import api from './api';
import type { SpeechTokenResponse } from '../types';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export const speechService = {
  async getSpeechToken(langCode?: string): Promise<SpeechTokenResponse> {
    const params = langCode ? { language: langCode } : {};
    const res = await api.get('/api/speech/token', { params });
    return res.data.data;
  },

  createAzureRecognizer(tokenData: SpeechTokenResponse, locale = 'en-US'): SpeechSDK.SpeechRecognizer | null {
    try {
      if (!tokenData || !tokenData.token || tokenData.token.startsWith('mock-')) {
        return null;
      }
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
      speechConfig.speechRecognitionLanguage = locale;
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      return new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    } catch (err) {
      console.warn('Azure Speech SDK recognizer initialization error:', err);
      return null;
    }
  },

  synthesizeSpeech(
    text: string,
    tokenData: SpeechTokenResponse | null,
    voiceName?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): SpeechSDK.SpeechSynthesizer | null {
    if (!text || !tokenData || !tokenData.token || tokenData.token.startsWith('mock-')) {
      console.warn('Azure Speech SDK: Speech synthesis requires valid Azure Speech authorization token.');
      if (onEnd) onEnd();
      return null;
    }

    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
      speechConfig.speechSynthesisVoiceName = voiceName || tokenData.voice || 'en-US-AvaMultilingualNeural';
      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

      if (onStart) onStart();

      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            if (onEnd) onEnd();
          } else {
            console.error('Azure TTS synthesis failed:', result.errorDetails);
            if (onError) onError(new Error(result.errorDetails));
            if (onEnd) onEnd();
          }
          synthesizer.close();
        },
        (err: any) => {
          console.error('Azure TTS synthesis error:', err);
          if (onError) onError(err);
          if (onEnd) onEnd();
          synthesizer.close();
        }
      );

      return synthesizer;
    } catch (err: any) {
      console.error('Azure Speech SDK synthesizer initialization error:', err);
      if (onError) onError(err);
      if (onEnd) onEnd();
      return null;
    }
  },
};

export default speechService;
