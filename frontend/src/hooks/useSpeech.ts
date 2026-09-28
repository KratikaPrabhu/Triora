import { useState, useEffect, useRef, useCallback } from 'react';

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

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const samplesRef = useRef<Array<{ time: number; frequency: number }>>([]);

  // Language mapping to speech recognition BCP-47 tags
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

  const startAudioAnalysis = useCallback(async () => {
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
    } catch (err: any) {
      console.warn('Microphone audio analysis failed:', err.message);
    }
  }, []);

  const startListening = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null, transcript: '', interimTranscript: '' }));

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((prev) => ({
        ...prev,
        error: 'Speech recognition is not supported in this browser. You can type your response instead.',
      }));
      await startAudioAnalysis();
      setState((prev) => ({ ...prev, isListening: true }));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLocaleForLanguage(languageCode);

      recognition.onstart = () => {
        setState((prev) => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk + ' ';
          } else {
            interimText += transcriptChunk;
          }
        }

        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript: interimText,
        }));
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setState((prev) => ({ ...prev, error: `Speech recognition error: ${event.error}` }));
        }
      };

      recognition.onend = () => {
        // Automatically restart if user hasn't explicitly stopped listening
        if (recognitionRef.current?.shouldContinue) {
          try {
            recognition.start();
          } catch {
            setState((prev) => ({ ...prev, isListening: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isListening: false }));
        }
      };

      recognitionRef.current = recognition;
      recognitionRef.current.shouldContinue = true;
      recognition.start();
      await startAudioAnalysis();
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: `Could not start speech recognition: ${err.message}`,
        isListening: false,
      }));
    }
  }, [getLocaleForLanguage, languageCode, startAudioAnalysis]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.shouldContinue = false;
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    stopAudioAnalysis();
    setState((prev) => ({ ...prev, isListening: false, volumeLevel: 0 }));
  }, [stopAudioAnalysis]);

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
