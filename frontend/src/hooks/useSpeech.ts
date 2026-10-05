import { useState, useEffect, useRef, useCallback } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { speechService } from '../services/speechService';

interface SpeechState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  volumeLevel: number;
  frequencySamples: Array<{ time: number; frequency: number }>;
}

export function useSpeech(languageCode = 'en') {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    volumeLevel: 0,
    frequencySamples: [],
  });

  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const samplesRef = useRef<Array<{ time: number; frequency: number }>>([]);

  // Language mapping to speech recognition BCP-47 tags according to requirement
  const getLocaleForLanguage = useCallback((code: string): string => {
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
    };
    return langMap[code] || 'en-US';
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const startAudioAnalysis = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      startTimeRef.current = Date.now();
      samplesRef.current = [];

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        let weightedFreqSum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
          weightedFreqSum += dataArray[i] * (i + 1) * 15;
        }

        const avg = sum / dataArray.length;
        const volume = Math.min(100, Math.round((avg / 128) * 100));
        const estimatedFreq = sum > 0 ? Math.round(weightedFreqSum / sum) : 0;

        const timeOffset = Math.round((Date.now() - startTimeRef.current) / 1000);
        samplesRef.current.push({ time: timeOffset, frequency: estimatedFreq });

        setState((prev) => ({
          ...prev,
          volumeLevel: volume,
          frequencySamples: [...samplesRef.current],
        }));

        animFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
      return stream;
    } catch (err: any) {
      console.warn('[STT] Microphone audio access error:', err.message || err);
      return null;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      console.log('[STT] Stopping recognition');
      try {
        recognizerRef.current.stopContinuousRecognitionAsync(
          () => {
            console.log('[STT] Recognition stopped');
            recognizerRef.current?.close();
            recognizerRef.current = null;
            setState((prev) => ({ ...prev, isListening: false, volumeLevel: 0 }));
          },
          (err) => {
            console.warn('[STT] Error stopping Azure recognizer:', err);
            recognizerRef.current = null;
            setState((prev) => ({ ...prev, isListening: false, volumeLevel: 0 }));
          }
        );
      } catch (err) {
        recognizerRef.current = null;
        setState((prev) => ({ ...prev, isListening: false, volumeLevel: 0 }));
      }
    } else {
      setState((prev) => ({ ...prev, isListening: false, volumeLevel: 0 }));
    }
    stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  const startListening = useCallback(async () => {
    console.log('[STT] Microphone button clicked');
    setState((prev) => ({ ...prev, error: null, interimTranscript: '' }));

    // Request microphone permission first
    console.log('[STT] Initializing Azure Speech');
    const stream = await startAudioAnalysis();
    if (!stream) {
      console.warn('[STT] Recognition canceled: Microphone access blocked');
      setState((prev) => ({
        ...prev,
        error: 'Microphone access is blocked. Please allow microphone access for Triora and try again.',
        isListening: false,
      }));
      return;
    }

    const locale = getLocaleForLanguage(languageCode);
    console.log(`[STT] Language: ${locale}`);

    try {
      // Retrieve Azure Speech token from backend endpoint
      const tokenRes = await speechService.getSpeechToken(languageCode);
      if (!tokenRes.success || !tokenRes.data?.token) {
        const errorCategory = tokenRes.error?.message || 'missing credentials';
        console.error(`[STT] Recognition canceled: AuthenticationFailure (${errorCategory})`);
        setState((prev) => ({
          ...prev,
          error: `Azure Speech STT error: Unable to fetch speech token (${errorCategory})`,
          isListening: false,
        }));
        stopAudioAnalysis();
        return;
      }

      const { token, region } = tokenRes.data;

      let speechConfig: SpeechSDK.SpeechConfig;
      if (token.startsWith('mock-azure-speech-token')) {
        console.warn('[STT] Recognition canceled: AuthenticationFailure (mock token returned, missing AZURE_SPEECH_KEY on backend)');
        setState((prev) => ({
          ...prev,
          error: 'Azure Speech credentials (AZURE_SPEECH_KEY) missing or unconfigured on backend environment.',
          isListening: false,
        }));
        stopAudioAnalysis();
        return;
      } else {
        speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region || 'centralindia');
      }

      speechConfig.speechRecognitionLanguage = locale;
      console.log(`[STT] speechConfig.speechRecognitionLanguage = ${speechConfig.speechRecognitionLanguage}`);

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      recognizer.recognizing = (_s, e) => {
        if (e.result && e.result.text) {
          console.log(`[STT] Recognizing: ${e.result.text}`);
          setState((prev) => ({
            ...prev,
            interimTranscript: e.result.text,
          }));
        }
      };

      recognizer.recognized = (_s, e) => {
        if (e.result && e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
          console.log(`[STT] Recognized: ${e.result.text}`);
          setState((prev) => ({
            ...prev,
            transcript: prev.transcript ? `${prev.transcript} ${e.result.text}` : e.result.text,
            interimTranscript: '',
          }));
        }
      };

      recognizer.canceled = (_s, e) => {
        console.warn(`[STT] Recognition canceled: ${e.reason} - ${e.errorDetails}`);
        let safeError = e.errorDetails || e.reason?.toString() || 'canceled';
        if (safeError.includes('401') || safeError.includes('403') || safeError.includes('Auth')) {
          safeError = 'AuthenticationFailure (401/403 invalid Azure Speech credentials)';
        }
        setState((prev) => ({
          ...prev,
          error: `Azure Speech error: ${safeError}`,
          isListening: false,
        }));
        stopListening();
      };

      recognizer.sessionStopped = () => {
        console.log('[STT] Recognition stopped');
        setState((prev) => ({ ...prev, isListening: false }));
        stopAudioAnalysis();
      };

      console.log('[STT] Starting recognition');
      recognizer.startContinuousRecognitionAsync(
        () => {
          setState((prev) => ({ ...prev, isListening: true, error: null }));
        },
        (err) => {
          console.error('[STT] Failed to start continuous recognition:', err);
          console.log(`[STT] Recognition canceled: ${err}`);
          setState((prev) => ({
            ...prev,
            error: `Could not start Azure speech recognition: ${err}`,
            isListening: false,
          }));
          stopAudioAnalysis();
        }
      );
    } catch (err: any) {
      console.error('[STT] Azure Speech SDK setup error:', err);
      console.log(`[STT] Recognition canceled: ${err.message || err}`);
      setState((prev) => ({
        ...prev,
        error: `Could not start Azure speech recognition: ${err.message || err}`,
        isListening: false,
      }));
      stopAudioAnalysis();
    }
  }, [getLocaleForLanguage, languageCode, startAudioAnalysis, stopAudioAnalysis, stopListening]);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      frequencySamples: [],
    }));
    samplesRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    error: state.error,
    volumeLevel: state.volumeLevel,
    frequencySamples: state.frequencySamples,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript: (text: string) => setState((prev) => ({ ...prev, transcript: text })),
  };
}
