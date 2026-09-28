// Text-To-Speech Service for Triora

class TTSService {
  private isSpeakingState = false;

  /**
   * Call this ONLY from a real user interaction:
   * Start Reflection / Start Session button.
   */
  public unlockAudio(): void {
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis is not supported');
      return;
    }

    const synth = window.speechSynthesis;

    synth.cancel();
    synth.resume();

    console.log('🔊 Triora audio unlocked');
  }

  /**
   * Speak AI question aloud.
   */
  public speak(
    text: string,
    languageCode = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.error('❌ SpeechSynthesis is not supported');
        this.isSpeakingState = false;
        onEnd?.();
        resolve();
        return;
      }

      const trimmedText = text?.trim();

      if (!trimmedText) {
        console.warn('⚠️ TTS received empty text');
        resolve();
        return;
      }

      console.log('🔊 TTS requested:', trimmedText);

      const synth = window.speechSynthesis;

      // Stop previous speech
      synth.cancel();

      // Make sure synthesis is resumed
      synth.resume();

      
      this.isSpeakingState = true;

      const utterance = new SpeechSynthesisUtterance(trimmedText);

      utterance.lang = this.getBCP47Language(languageCode);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get available voices
      const voices = synth.getVoices();

      console.log(
        '🎤 Available voices:',
        voices.map((v) => `${v.name} (${v.lang})`)
      );

      const language = utterance.lang.split('-')[0];

      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase() ===
            utterance.lang.toLowerCase()
        ) ||
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(language)
        );

      if (preferredVoice) {
        utterance.voice = preferredVoice;

        console.log(
          '🎤 Selected voice:',
          preferredVoice.name,
          preferredVoice.lang
        );
      } else {
        console.warn(
          '⚠️ No matching voice found for',
          utterance.lang
        );
      }

      utterance.onstart = () => {
        console.log('🔊 TRIORA TTS STARTED');

        this.isSpeakingState = true;
        onStart?.();
      };

      utterance.onend = () => {
        console.log('🔊 TRIORA TTS FINISHED');

        this.isSpeakingState = false;
        onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error(
          '❌ TRIORA TTS ERROR:',
          event.error
        );

        this.isSpeakingState = false;
        onEnd?.();
        resolve();
      };

      synth.speak(utterance);

      console.log(
        '🔊 speechSynthesis.speak() called',
        {
          speaking: synth.speaking,
          pending: synth.pending,
          paused: synth.paused
        }
      );
    });
  }

  /**
   * Stop current speech.
   */
  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.isSpeakingState = false;

    console.log('🔇 Triora TTS stopped');
  }

  public isSpeaking(): boolean {
    if ('speechSynthesis' in window) {
      return (
        window.speechSynthesis.speaking ||
        this.isSpeakingState
      );
    }

    return this.isSpeakingState;
  }

  /**
   * Debug test.
   */
  public testVoice(): void {
    console.log('🧪 Testing Triora voice');

    this.speak(
      'Hello. This is Triora. Can you hear me?',
      'en'
    );
  }

  private getBCP47Language(code: string): string {
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN'
    };

    return (
      langMap[code.toLowerCase()] ||
      'en-US'
    );
  }
}

export const ttsService = new TTSService();