import api from './api';
import type { SpeechTokenResponse } from '../types';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

class SpeechService {
  private cachedTokenData: SpeechTokenResponse | null = null;
  private activeSynthesizer: SpeechSDK.SpeechSynthesizer | null = null;
  private currentSynthesisId: number = 0;

  /**
   * Fetch short-lived Azure Speech authorization token from backend
   */
  async getSpeechToken(langCode?: string): Promise<SpeechTokenResponse> {
    const params = langCode ? { language: langCode } : {};
    const res = await api.get('/api/speech/token', { params });
    const tokenData: SpeechTokenResponse = res.data.data;
    this.cachedTokenData = tokenData;
    console.log('[Speech] Azure speech token refreshed');
    return tokenData;
  }

  /**
   * Ensure a valid Azure Speech token is available, refreshing automatically if missing or expiring within 60 seconds
   */
  async ensureValidToken(langCode?: string): Promise<SpeechTokenResponse | null> {
    if (this.cachedTokenData && this.cachedTokenData.expiresAt) {
      const expiresTime = new Date(this.cachedTokenData.expiresAt).getTime();
      const now = Date.now();
      // If token is valid for at least another 60 seconds, reuse it
      if (expiresTime - now > 60000) {
        return this.cachedTokenData;
      }
    }
    try {
      return await this.getSpeechToken(langCode);
    } catch (e) {
      console.error('[Speech] Failed to fetch Azure speech token:', e);
      return null;
    }
  }

  /**
   * Create Azure Speech Recognizer for Speech-To-Text
   */
  createAzureRecognizer(tokenData: SpeechTokenResponse, locale = 'en-US'): SpeechSDK.SpeechRecognizer | null {
    try {
      if (!tokenData || !tokenData.token || tokenData.token.startsWith('mock-')) {
        return null;
      }
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
      speechConfig.speechRecognitionLanguage = locale;
      // Configure silence timeouts (in milliseconds) for continuous natural speech
      speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '15000');
      speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, '5000');
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      return new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    } catch (err) {
      console.warn('[Speech] Azure Speech SDK recognizer initialization error:', err);
      return null;
    }
  }

  /**
   * Cancel any active Azure TTS synthesis
   */
  cancelSynthesis() {
    if (this.activeSynthesizer) {
      try {
        this.activeSynthesizer.close();
      } catch (_) {}
      this.activeSynthesizer = null;
    }
  }

  /**
   * Synthesize text into speech using Azure Speech SDK strictly (no window.speechSynthesis fallback)
   */
  async synthesizeSpeech(
    text: string,
    tokenDataProvided: SpeechTokenResponse | null,
    voiceName?: string,
    langCode?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<SpeechSDK.SpeechSynthesizer | null> {
    if (!text) return null;

    // Stop previous active synthesis cleanly
    this.cancelSynthesis();

    // Ensure valid token (auto-refreshes if expired or about to expire)
    let tokenData = tokenDataProvided;
    if (!tokenData || !tokenData.expiresAt || new Date(tokenData.expiresAt).getTime() - Date.now() < 60000) {
      tokenData = await this.ensureValidToken(langCode);
    }

    if (!tokenData || !tokenData.token || tokenData.token.startsWith('mock-')) {
      console.warn('[Speech] Azure Speech SDK: Speech synthesis requires valid Azure Speech authorization token.');
      if (onEnd) onEnd();
      return null;
    }

    const selectedVoice = voiceName || tokenData.voice || 'en-US-AvaMultilingualNeural';

    console.log('[Azure TTS] Question received');
    console.log('[Azure TTS] Starting synthesis');
    console.log(`[Azure TTS] Voice: ${selectedVoice}`);

    const synthesisId = ++this.currentSynthesisId;

    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenData.token, tokenData.region);
      speechConfig.speechSynthesisVoiceName = selectedVoice;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
      this.activeSynthesizer = synthesizer;

      synthesizer.synthesisStarted = () => {
        console.log('[Azure TTS] Starting');
        console.log('[Azure TTS] Synthesis started');
        console.log('[Azure TTS] Audio playback started');
      };

      if (onStart) onStart();

      synthesizer.speakTextAsync(
        text,
        (result) => {
          // Verify this callback belongs to the current synthesis execution
          if (this.currentSynthesisId !== synthesisId) {
            try { synthesizer.close(); } catch (_) {}
            return;
          }

          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log('[Azure TTS] Synthesis completed');
            console.log('[Azure TTS] Playback started');
            console.log('[Azure TTS] Playback completed');
            if (onEnd) onEnd();
          } else {
            const cancellation = SpeechSDK.CancellationDetails.fromResult(result);
            const errorDetails = cancellation.errorDetails || result.errorDetails || 'Synthesis canceled or incomplete';
            console.error('[Azure TTS] Synthesis canceled');
            console.error(`[Azure TTS] Error reason: ${cancellation.reason}`);
            console.error(`[Azure TTS] Error details: ${errorDetails}`);
            if (onError) onError(new Error(errorDetails));
            if (onEnd) onEnd();
          }

          try { synthesizer.close(); } catch (_) {}
          if (this.activeSynthesizer === synthesizer) {
            this.activeSynthesizer = null;
          }
        },
        (err: any) => {
          if (this.currentSynthesisId !== synthesisId) {
            try { synthesizer.close(); } catch (_) {}
            return;
          }

          const safeError = err?.message || err || 'Synthesis runtime exception';
          console.error('[Azure TTS] Synthesis canceled');
          console.error(`[Azure TTS] Error reason: Runtime Exception`);
          console.error(`[Azure TTS] Error details: ${safeError}`);

          if (onError) onError(err);
          if (onEnd) onEnd();

          try { synthesizer.close(); } catch (_) {}
          if (this.activeSynthesizer === synthesizer) {
            this.activeSynthesizer = null;
          }
        }
      );

      return synthesizer;
    } catch (err: any) {
      const safeError = err?.message || err || 'Synthesizer initialization error';
      console.error('[Speech] Azure TTS failed');
      console.error(`[Speech] Error: ${safeError}`);

      if (onError) onError(err);
      if (onEnd) onEnd();
      return null;
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
