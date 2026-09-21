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

  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

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

  const transcriptRef = useRef<string>('');
  const partialTranscriptRef = useRef<string>('');

  // Keep transcriptRef synced with currentAnswer state
  const updateCurrentAnswer = useCallback((updater: string | ((prev: string) => string)) => {
    setCurrentAnswer((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      transcriptRef.current = next;
      return next;
    });
  }, []);

  // Speech Recognition: ONLY appends to currentAnswer transcript via transcriptRef.
  const stopSpeechRecognition = useCallback(() => {
    if (recognizerRef.current) {
      try {
        console.log('[STT] Recognition stopped');
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
    partialTranscriptRef.current = '';
    try {
      const speechToken = await speechService.ensureValidToken(languageCode);
      const locales = recognitionLocales(languageCode);

      const recognizer = speechToken
        ? speechService.createAzureRecognizer(speechToken, locales[0] || language.locale)
        : null;

      if (recognizer) {
        recognizerRef.current = recognizer;

        recognizer.sessionStarted = () => {
          console.log('[STT] Recognition started');
          setIsListening(true);
        };

        recognizer.sessionStopped = () => {
          console.log('[STT] Recognition stopped');
          setIsListening(false);
        };

        recognizer.recognizing = (_: any, event: any) => {
          if (event.result && event.result.text) {
            const partial = event.result.text.trim();
            console.log(`[STT] Recognizing partial: ${partial}`);
            if (partial) {
              partialTranscriptRef.current = partial;
            }
          }
        };

        recognizer.recognized = (_: any, event: any) => {
          if (event.result && event.result.text) {
            const recognizedSegment = event.result.text.trim();
            if (recognizedSegment) {
              console.log(`[STT] Recognized final: ${recognizedSegment}`);
              partialTranscriptRef.current = '';
              updateCurrentAnswer((prev) => (prev ? `${prev} ${recognizedSegment}` : recognizedSegment));
              setSessionState('ANSWERING');
            }
          }
        };

        recognizer.canceled = (_: any, event: any) => {
          console.warn(`[STT] Cancellation reason: ${event.reason}`);
          console.warn(`[STT] Cancellation details: ${event.errorDetails || 'None'}`);
          if (event.errorDetails) {
            console.error(`[STT] Error: ${event.errorDetails}`);
          }
          setIsListening(false);
        };

        recognizer.startContinuousRecognitionAsync(
          () => console.log('[STT] continuous recognition async initialized'),
          (err: any) => console.warn('[STT] Azure STT start notice:', err)
        );
      } else {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = language.locale;
          rec.onresult = (event: any) => {
            let finalChunk = '';
            let interimChunk = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalChunk += event.results[i][0].transcript;
              } else {
                interimChunk += event.results[i][0].transcript;
              }
            }
            if (finalChunk.trim()) {
              partialTranscriptRef.current = '';
              updateCurrentAnswer((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
              setSessionState('ANSWERING');
            } else if (interimChunk.trim()) {
              partialTranscriptRef.current = interimChunk.trim();
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
  }, [languageCode, language, stopSpeechRecognition, updateCurrentAnswer]);

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
          const qNum = data.metadata?.questionNumber;

          // Check if AI generated a duplicate question text
          if (askedQuestionTexts.includes(nextText.trim())) {
            console.warn('Duplicate question detected from AI. Displaying fallback context question.');
          }

          setActiveQuestion((prev) => {
            const nextIndex = typeof qNum === 'number' && qNum > 0 ? qNum - 1 : prev ? prev.index + 1 : 1;
            const nextId = `q${nextIndex + 1}`;
            setAskedQuestionIds((prevSet) => new Set(prevSet).add(nextId));
            return {
              id: nextId,
              text: nextText,
              index: nextIndex,
            };
          });

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
          stopSpeechRecognition();
          speechService.cancelSynthesis();
          setIsCompleted(true);
        } else if (data.type === 'conversation_error') {
          dispatch(setAiProcessing(false));
          setIsProcessingAnswer(false);
          setAiErrorMsg(data.message || 'The AI service is temporarily unavailable. Please try again.');
          setSessionState('QUESTION_DISPLAYED');
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

    setAiErrorMsg(null);

    // 1. Stop active speech recognition & synthesis first to flush final speech events
    stopSpeechRecognition();
    speechService.cancelSynthesis();

    // 2. Read final transcript directly from stable ref to avoid React state race condition
    let accumulated = (transcriptRef.current || currentAnswer).trim();
    if (partialTranscriptRef.current) {
      const partial = partialTranscriptRef.current.trim();
      if (partial && !accumulated.endsWith(partial)) {
        accumulated = accumulated ? `${accumulated} ${partial}`.trim() : partial;
      }
    }
    const rawAnswer = accumulated || 'No response recorded.';

    // 3. Lock processing flag to prevent double clicks
    setIsProcessingAnswer(true);
    setSessionState('PROCESSING_ANSWER');

    const finalAnswer = rawAnswer;

    // Reset local transcript state and refs ONLY after locking final answer
    setCurrentAnswer('');
    transcriptRef.current = '';
    partialTranscriptRef.current = '';

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
  }, [isProcessingAnswer, isAiProcessing, sessionId, currentAnswer, dispatch, stopSpeechRecognition, startSpeechRecognition]);

  // Complete & Clean Up Session / Generate Report Action
  const handleGenerateReport = async () => {
    if (!sessionId || generatingReport) return;

    stopSpeechRecognition();
    speechService.cancelSynthesis();
    setGeneratingReport(true);

    try {
      // Flush any active user answer buffer if not yet saved
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
      
      const targetReportId = report._id || report.id || sessionId;
      console.log(`[Report] Saved successfully. Navigating to /report/${targetReportId}`);
      navigate(`/report/${targetReportId}`, { replace: true });
    } catch (err: any) {
      console.error('[Report] Report generation failed:', err);
      setErrorMsg(err?.message || 'Report generation failed. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCompleteSession = () => {
    stopSpeechRecognition();
    speechService.cancelSynthesis();
    setIsCompleted(true);
    setSessionState('SESSION_COMPLETE');
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
          {aiErrorMsg && (
            <div className="bg-amber-900/40 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between text-amber-200 text-xs shrink-0 z-10">
              <span>{aiErrorMsg}</span>
              <button
                type="button"
                onClick={() => handleNextQuestion()}
                className="ml-3 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow-sm"
              >
                Retry
              </button>
            </div>
          )}
          <ConversationBubbles
            messages={transcript}
            isAiProcessing={isAiProcessing || isProcessingAnswer}
            userName={user?.profile?.preferredName || user?.name || 'You'}
          />

          <SessionQuestionFlow
            currentQuestionIndex={activeIdx}
            totalQuestions={8}
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
            <h3 className="text-xl font-bold">Session Completed</h3>
            <p className="text-xs text-slate-400">
              Thank you for sharing your responses. Your intake session is now complete.
            </p>
            <button
              type="button"
              disabled={generatingReport}
              onClick={handleGenerateReport}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {generatingReport ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPage;
