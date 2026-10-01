// Azure Text-To-Speech Service for Triora
import { getStoredToken } from './api';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

class TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private currentAbortController: AbortController | null = null;
  private isSpeakingState = false;
  private currentRequestId = 0;

  /**
   * Unlock audio playback context for mobile/browser autoplay policies on user interaction.
   */
  public unlockAudio(): void {
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audio.play().catch(() => {});
      console.log('[Triora TTS] Audio unlocked for browser playback');
    } catch (err) {
      console.warn('[Triora TTS] Audio unlock failed:', err);
    }
  }

  /**
   * Speak AI question aloud using Azure Speech TTS via backend API.
   */
  public async speak(
    text: string,
    languageCode = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    const trimmedText = text?.trim();

    if (!trimmedText) {
      console.warn('[Triora TTS] Empty text received. Skipping speech synthesis.');
      onEnd?.();
      return;
    }

    // Increment request ID to cancel/ignore previous stale speech calls
    const requestId = ++this.currentRequestId;

    // Stop any existing audio or pending fetch
    this.stopInternal();

    console.log('[Triora TTS] Requesting Azure TTS');
    console.log('[Triora TTS] Language:', languageCode);

    const abortController = new AbortController();
    this.currentAbortController = abortController;

    try {
      const baseUrl = getBaseUrl();
      const token = getStoredToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/tts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: trimmedText, languageCode }),
        signal: abortController.signal,
      });

      // Handle race condition: user stopped or requested new question while fetching
      if (requestId !== this.currentRequestId) {
        console.log('[Triora TTS] Request superseded by newer speech call.');
        return;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const message = errJson?.error?.message || `Azure Speech TTS error (Status ${response.status})`;
        console.error('[Triora TTS] Azure Speech TTS temporarily unavailable:', message);
        this.isSpeakingState = false;
        onEnd?.();
        return;
      }

      const audioBlob = await response.blob();

      if (requestId !== this.currentRequestId) {
        return;
      }

      const blobUrl = URL.createObjectURL(audioBlob);
      this.currentBlobUrl = blobUrl;

      const audio = new Audio(blobUrl);
      this.currentAudio = audio;

      return new Promise<void>((resolve) => {
        audio.onplay = () => {
          if (requestId !== this.currentRequestId) return;
          console.log('[Triora TTS] Playing Azure audio');
          console.log('[Triora TTS] Playback started');
          this.isSpeakingState = true;
          onStart?.();
        };

        audio.onended = () => {
          if (requestId === this.currentRequestId) {
            console.log('[Triora TTS] Playback finished');
            this.cleanupAudio();
            onEnd?.();
          }
          resolve();
        };

        audio.onerror = (e) => {
          console.error('[Triora TTS] Audio playback error:', e);
          if (requestId === this.currentRequestId) {
            this.cleanupAudio();
            onEnd?.();
          }
          resolve();
        };

        audio.play().catch((err) => {
          console.error('[Triora TTS] Audio autoplay play() failed:', err);
          if (requestId === this.currentRequestId) {
            this.cleanupAudio();
            onEnd?.();
          }
          resolve();
        });
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[Triora TTS] Azure TTS request cancelled');
        return;
      }

      console.error('[Triora TTS] Azure Speech TTS temporarily unavailable:', err?.message || err);
      this.isSpeakingState = false;
      onEnd?.();
    }
  }

  /**
   * Stop current speech and cancel pending requests.
   */
  public stop(): void {
    this.currentRequestId++;
    this.stopInternal();
    console.log('[Triora TTS] Speech stopped');
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  /**
   * Debug test voice.
   */
  public testVoice(): void {
    console.log('[Triora TTS] Testing Azure voice synthesis');
    this.speak('Hello. This is Triora powered by Azure Speech. Can you hear me?', 'en');
  }

  private stopInternal(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (_) {}
      this.currentAudio = null;
    }

    this.cleanupAudio();
  }

  private cleanupAudio(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.isSpeakingState = false;
  }
}

export const ttsService = new TTSService();