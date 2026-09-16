import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setWsStatus,
  setAiProcessing,
  addTranscriptMessage,
  updateCurrentSessionStatus,
  setTranscript,
} from '../store/sessionSlice';
import sessionService from '../services/session.service';
import speechService from '../services/speech.service';
import reportService from '../services/report.service';
import { useLanguage } from '../context/LanguageContext';
import { recognitionLocales } from '../config/languages';
import type { WSServerMessage, WSClientMessage } from '../types';
import SessionHeader from '../components/session/SessionHeader';
import ConversationBubbles from '../components/session/ConversationBubbles';
import SessionQuestionFlow from '../components/session/SessionQuestionFlow';
import HandHeatmap from '../components/session/HandHeatmap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { Sparkles, CheckCircle2 } from 'lucide-react';

// Explicit State Machine States
type SessionState =
  | 'IDLE'
  | 'QUESTION_DISPLAYED'
  | 'LISTENING'
  | 'ANSWERING'
  | 'PROCESSING_ANSWER'
  | 'GENERATING_NEXT_QUESTION'
  | 'SESSION_COMPLETE';

interface ActiveQuestion {
  id: string; // Stable unique ID e.g. "q1", "q2"
  text: string;
  index: number;
}

export const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSession, transcript, isAiProcessing } = useAppSelector((state) => state.session);
  const { user } = useAppSelector((state) => state.auth);
  const { language, languageCode, questions: initialQuestions } = useLanguage();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [, setSessionState] = useState<SessionState>('IDLE');
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [, setAskedQuestionIds] = useState<Set<string>>(new Set());
  const [askedQuestionTexts, setAskedQuestionTexts] = useState<string[]>([]);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [azureTokenData, setAzureTokenData] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const recognizerRef = useRef<any>(null);
  const activeReqIdRef = useRef<string | null>(null);
  const isInitializingSessionRef = useRef<boolean>(false);

  // Retrieve Azure speech token for session
  const fetchSpeechToken = useCallback(async () => {
    try {
      const data = await speechService.getSpeechToken(languageCode);
      setAzureTokenData(data);
      return data;
    } catch (e) {
      console.warn('[Speech] Token notice:', e);
      return null;
    }
  }, [languageCode]);

  // Speech Recognition: ONLY appends to currentAnswer transcript. NEVER generates questions.
  const stopSpeechRecognition = useCallback(() => {
    if (recognizerRef.current) {
      try {
        if (recognizerRef.current.stopContinuousRecognitionAsync) {
          recognizerRef.current.stopContinuousRecognitionAsync();
        } else if (recognizerRef.current.close) {
          recognizerRef.current.close();
        } else if (recognizerRef.current.stop) {
          recognizerRef.current.stop();
        }
      } catch (e) {
        console.warn('[Speech] Error stopping recognizer:', e);
      }
      recognizerRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startSpeechRecognition = useCallback(async () => {
    stopSpeechRecognition();
    try {
      const speechToken = await speechService.ensureValidToken(languageCode);
      const locales = recognitionLocales(languageCode);

      const recognizer = speechToken
        ? speechService.createAzureRecognizer(speechToken, locales[0] || language.locale)
        : null;

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.recognized = (_: any, event: any) => {
          if (event.result && event.result.text) {
            const recognized = event.result.text.trim();
            setCurrentAnswer((prev) => (prev ? `${prev} ${recognized}` : recognized));
            setSessionState('ANSWERING');
          }
        };
        recognizer.startContinuousRecognitionAsync(
          () => setIsListening(true),
          (err: any) => console.warn('[Speech] Azure STT notice:', err)
        );
      } else {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = false;
          rec.lang = language.locale;
          rec.onresult = (event: any) => {
            const last = event.results.length - 1;
            if (event.results[last].isFinal || !event.results[last].isFinal) {
              const text = event.results[last][0].transcript;
              if (text) {
                setCurrentAnswer((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
                setSessionState('ANSWERING');
              }
            }
          };
          rec.onend = () => setIsListening(false);
          rec.start();
          recognizerRef.current = rec;
          setIsListening(true);
        } else {
          setIsListening(true);
        }
      }
    } catch (err) {
      console.warn('[Speech] Speech recognition notice:', err);
      setIsListening(true);
    }
  }, [languageCode, language, stopSpeechRecognition]);

  // Text-To-Speech Synthesis helper (Azure Speech SDK strictly)
  const speakText = useCallback(
    async (text: string) => {
      if (!text) return;

      // Prevent AI voice from being transcribed as patient speech
      stopSpeechRecognition();
      setIsSpeaking(true);

      const tokenData = azureTokenData || (await fetchSpeechToken());

      await speechService.synthesizeSpeech(
        text,
        tokenData,
        tokenData?.voice || language.voice,
        languageCode,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          // Enable mic recognition after AI finishes speaking
          startSpeechRecognition();
        },
        (err) => {
          console.warn('[Speech] Azure Speech Services TTS Notice:', err?.message || err);
          setIsSpeaking(false);
          // Allow mic recognition if synthesis failed
          startSpeechRecognition();
        }
      );
    },
    [azureTokenData, fetchSpeechToken, language, languageCode, stopSpeechRecognition, startSpeechRecognition]
  );

  // Keep speakText ref updated to avoid closing & reopening WebSocket connection
  const speakTextRef = useRef(speakText);
  useEffect(() => {
    speakTextRef.current = speakText;
  }, [speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      speechService.cancelSynthesis();
    };
  }, [stopSpeechRecognition]);

  // 1. Single initialization of intake session
  useEffect(() => {
    if (isInitializingSessionRef.current) return;
    isInitializingSessionRef.current = true;

    const initSession = async () => {
      setInitializing(true);
      setErrorMsg(null);
      try {
        let activeSess = currentSession;
        if (!activeSess || activeSess.status === 'completed') {
          activeSess = await sessionService.createSession(languageCode);
        }
        const sId = activeSess.id || activeSess._id || null;
        setSessionId(sId);
        await fetchSpeechToken();

        // Initialize Question 1 exactly once
        const firstQText = initialQuestions[0] || 'How have you been feeling recently?';
        const firstQ: ActiveQuestion = {
          id: 'q1',
          text: firstQText,
          index: 0,
        };
        setActiveQuestion(firstQ);
        setAskedQuestionIds(new Set(['q1']));
        setAskedQuestionTexts([firstQText]);
        setSessionState('QUESTION_DISPLAYED');

        dispatch(setTranscript([]));
        dispatch(
          addTranscriptMessage({
            role: 'assistant',
            text: firstQText,
            timestamp: new Date().toISOString(),
          })
        );
        speakTextRef.current(firstQText);
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to create intake session');
      } finally {
        setInitializing(false);
      }
    };

    initSession();
  }, [user]);

  // 2. Connect WebSocket strictly when sessionId is ready
  useEffect(() => {
    if (!sessionId) return;

    const token = localStorage.getItem('triora_auth_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
    const host = apiBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${host}/ws/conversation?token=${encodeURIComponent(token || '')}`;

    dispatch(setWsStatus('connecting'));
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      dispatch(setWsStatus('connected'));
      const msg: WSClientMessage = { type: 'start_session', sessionId };
      ws.send(JSON.stringify(msg));
    };

    ws.onmessage = (event) => {
      try {
        const data: WSServerMessage = JSON.parse(event.data);
        if (data.type === 'session_started') {
          dispatch(updateCurrentSessionStatus('active'));
          dispatch(setAiProcessing(false));
        } else if (data.type === 'processing') {
          dispatch(setAiProcessing(true));
        } else if (data.type === 'assistant_message') {
          dispatch(setAiProcessing(false));
          setIsProcessingAnswer(false);

          const nextText = data.text;
          const nextIndex = activeQuestion ? activeQuestion.index + 1 : 1;
          const nextId = `q${nextIndex + 1}`;

          // Check if AI generated a duplicate question text
          if (askedQuestionTexts.includes(nextText.trim())) {
            console.warn('Duplicate question detected from AI. Displaying fallback context question.');
          }

          const newQ: ActiveQuestion = {
            id: nextId,
            text: nextText,
            index: nextIndex,
          };

          setActiveQuestion(newQ);
          setAskedQuestionIds((prev) => new Set(prev).add(nextId));
          setAskedQuestionTexts((prev) => [...prev, nextText]);
          setCurrentAnswer(''); // Reset answer transcript for the new question
          setSessionState('QUESTION_DISPLAYED');

          dispatch(
            addTranscriptMessage({
              role: 'assistant',
              text: nextText,
              timestamp: data.timestamp || new Date().toISOString(),
              metadata: data.metadata,
            })
          );
          speakTextRef.current(nextText);
        } else if (data.type === 'session_completed') {
          dispatch(setAiProcessing(false));
          setIsProcessingAnswer(false);
          dispatch(updateCurrentSessionStatus('completed'));
          setSessionState('SESSION_COMPLETE');
          setIsCompleted(true);
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    ws.onerror = () => dispatch(setWsStatus('error'));
    ws.onclose = () => dispatch(setWsStatus('disconnected'));

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId, dispatch]);

  const toggleMic = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Text message manual update
  const handleUpdateAnswerText = (text: string) => {
    setCurrentAnswer((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
    setSessionState('ANSWERING');
  };

  // REPEAT QUESTION ACTION
  const handleRepeatQuestion = () => {
    if (activeQuestion) {
      speakText(activeQuestion.text);
    }
  };

  // NEXT BUTTON IS THE EXPLICIT QUESTION TRANSITION
  const handleNextQuestion = useCallback(() => {
    if (isProcessingAnswer || isAiProcessing || !sessionId) return;

    // 1. Lock processing flag to prevent double clicks & race conditions
    setIsProcessingAnswer(true);
    setSessionState('PROCESSING_ANSWER');

    // 2. Stop active speech recognition & synthesis
    stopSpeechRecognition();
    speechService.cancelSynthesis();

    // 3. Freeze current answer transcript
    const finalAnswer = currentAnswer.trim() || 'No audible answer recorded.';

    // Clear current answer buffer for the next question
    setCurrentAnswer('');

    // 4. Append user answer to visual transcript bubble
    dispatch(
      addTranscriptMessage({
        role: 'user',
        text: finalAnswer,
        timestamp: new Date().toISOString(),
      })
    );

    // 5. Send Question + Answer + Context to backend via WebSocket for exactly ONE next question
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const reqId = `req_${Date.now()}`;
      activeReqIdRef.current = reqId;

      const payload: WSClientMessage = {
        type: 'user_message',
        sessionId,
        text: finalAnswer,
      };
      wsRef.current.send(JSON.stringify(payload));
      dispatch(setAiProcessing(true));
    } else {
      setIsProcessingAnswer(false);
      setSessionState('QUESTION_DISPLAYED');
    }
  }, [isProcessingAnswer, isAiProcessing, sessionId, currentAnswer, dispatch, stopSpeechRecognition]);

  // Complete & Clean Up Session
  const handleCompleteSession = async () => {
    if (!sessionId) return;
    stopSpeechRecognition();
    speechService.cancelSynthesis();
    setGeneratingReport(true);

    try {
      // Flush any pending user answer recorded before clicking Finish Session
      const activeAnswer = currentAnswer.trim();
      if (activeAnswer) {
        dispatch(
          addTranscriptMessage({
            role: 'user',
            text: activeAnswer,
            timestamp: new Date().toISOString(),
          })
        );
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'user_message',
              sessionId,
              text: activeAnswer,
            })
          );
        }
        setCurrentAnswer('');
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const payload: WSClientMessage = { type: 'end_session', sessionId };
        wsRef.current.send(JSON.stringify(payload));
      }

      await sessionService.updateSession(sessionId, { status: 'completed' });
      const report = await reportService.generateReport(sessionId);
      navigate(`/report/${report.id || report._id || sessionId}`, { replace: true });
    } catch (err) {
      console.warn('Report generation notice:', err);
      navigate(`/report/${sessionId}`, { replace: true });
    } finally {
      setGeneratingReport(false);
    }
  };

  if (initializing) {
    return <LoadingSpinner message="Initializing intake session..." fullScreen />;
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorAlert title="Session Error" message={errorMsg} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (generatingReport) {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center z-50">
        <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">Generating Your Summary</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Triora is compiling your intake conversation into a clinical summary report for your therapist...
        </p>
      </div>
    );
  }

  const activeIdx = activeQuestion ? activeQuestion.index : 0;
  const activeText = activeQuestion ? activeQuestion.text : initialQuestions[0];

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden font-sans text-slate-100">
      <SessionHeader
        status={currentSession?.status || 'active'}
        language={`${language.flag || '🌐'} ${language.nativeName} (${language.englishName})`}
        onLanguageChange={() => {}}
        onEndSession={handleCompleteSession}
      />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Conversation & Question Control Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/80">
          <ConversationBubbles
            messages={transcript}
            isAiProcessing={isAiProcessing || isProcessingAnswer}
            userName={user?.profile?.preferredName || user?.name || 'You'}
          />

          <SessionQuestionFlow
            currentQuestionIndex={activeIdx}
            totalQuestions={initialQuestions.length}
            currentQuestion={activeText}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isAiProcessing={isAiProcessing || isProcessingAnswer}
            onRepeatQuestion={handleRepeatQuestion}
            onNextQuestion={handleNextQuestion}
            onToggleMic={toggleMic}
            onSendMessage={handleUpdateAnswerText}
            onCompleteSession={handleCompleteSession}
          />
        </div>

        {/* Right Sidebar: Dynamic Heatmap & Voice Signal Visualizer */}
        <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/60 p-4 shrink-0 flex flex-col">
          <HandHeatmap sessionId={sessionId || undefined} isListening={isListening} />
        </aside>
      </main>

      {isCompleted && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 text-white">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Your conversation is complete.</h3>
            <p className="text-xs text-slate-400">
              Thank you for completing your intake session. Your summary report has been created for your therapist.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/report/${sessionId}`)}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md"
            >
              View Your Summary &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPage;
