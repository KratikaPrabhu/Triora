import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { useSpeech } from '../hooks/useSpeech';
import { useConversation } from '../hooks/useConversation';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import { sessionService } from '../services/sessionService';
import { ttsService } from '../services/ttsService';
import '../styles/session.css';

export const SessionPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionIdFromUrl = searchParams.get('id');

  const [sessionId, setSessionId] = useState<string | null>(sessionIdFromUrl);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [manualText, setManualText] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const hasSpokenInitialRef = React.useRef(false);

  // Initialize or fetch session if id not in URL
  useEffect(() => {
    if (!sessionIdFromUrl) {
      sessionService.createSession(language || 'en').then((res) => {
        if (res.success && res.data?._id) {
          setSessionId(res.data._id);
        } else {
          setErrorState("We couldn't initialize your conversation space right now.");
        }
      });
    }
  }, [sessionIdFromUrl, language]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    volumeLevel,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech(language || 'en');

  const {
    status: convStatus,
    messages,
    currentQuestion,
    sendMessage,
    speakCurrentQuestion,
  } = useConversation(sessionId, language || 'en');

  // Auto-play the first question when session becomes ready
  useEffect(() => {
    if (convStatus === 'WAITING_FOR_USER' && messages.length === 0 && !hasSpokenInitialRef.current) {
      hasSpokenInitialRef.current = true;
      speakCurrentQuestion(currentQuestion);
    }
  }, [convStatus, messages.length, currentQuestion, speakCurrentQuestion]);

  useEffect(() => {
    if (convStatus === 'completed' && !generatingReport) {
      handleCompleteSession();
    }
  }, [convStatus]);

  const handleMicClick = () => {
    ttsService.unlockAudio();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendResponse = async () => {
    const messageToSend = manualText.trim() || transcript.trim();
    if (!messageToSend || !sessionId) return;

    if (isListening) {
      stopListening();
    }

    try {
      await sendMessage(messageToSend);
      setManualText('');
      resetTranscript();
    } catch (err) {
      console.error('Failed to send answer:', err);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;

    if (isListening) {
      stopListening();
    }

    setGeneratingReport(true);
    setErrorState(null);

    try {
      const finishRes = await sessionService.respondToSession(sessionId, { status: 'completed' });

      if (!finishRes.success) {
        throw new Error(finishRes.error?.message || 'Failed to complete session');
      }

      const reportRes = await reportService.generateReport(sessionId);

      if (reportRes.success && reportRes.data?.report) {
        navigate(`/report/${reportRes.data.report._id}`);
      } else {
        throw new Error(reportRes.error?.message || 'Report generation failed.');
      }
    } catch (err: any) {
      setGeneratingReport(false);
      setErrorState(err.message || 'Unable to generate summary report.');
    }
  };

  if (generatingReport) {
    return <Loading fullScreen message={t.synthesizingSummary || 'Synthesizing...'} />;
  }

  // Get the last AI message as the prompt.
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const currentPrompt = assistantMessages.length > 0
    ? assistantMessages[assistantMessages.length - 1].text
    : currentQuestion;

  return (
    <div className="session-page-container">
      {/* Session Top Bar */}
      <header className="session-header">
        <Logo linkTo="/dashboard" />
        <div className="session-status-badge">
          <Icon name="Mic" size={14} />
          <span>Your turn • Realtime</span>
        </div>
          <Link to="/dashboard">
            <Button size="sm" variant="outline">{t.saveAndExit || 'Save & exit'}</Button>
          </Link>
      </header>

      {/* Main Content Area */}
      <main className="session-main-stage">
        {(speechError || errorState) && !((speechError || errorState)?.includes('Azure')) && (
          <div className="session-error-banner" style={{ position: 'absolute', top: '5rem', width: '100%', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <Icon name="AlertCircle" size={16} />
            <span>{speechError || errorState}</span>
          </div>
        )}

        <div className="session-content-grid">
          {/* Left Column */}
          <div className="session-col-left">
            <div className="session-timer-display">{formatTimer(timerSeconds)}</div>

            <div className="session-headline-box">
              <h1 className="session-main-question">"{currentPrompt}"</h1>
            </div>

            <button className="tap-hear-btn" onClick={() => {
              ttsService.unlockAudio();
              speakCurrentQuestion(currentPrompt);
            }} style={{ marginBottom: '1.5rem' }}>
              <Icon name="Volume2" size={16} /> {t.tapToHear || 'Tap to hear question'}
            </button>

            {/* Finish button */}
            <div className="session-finish-btn-row">
              <Button variant="primary" size="lg" onClick={handleCompleteSession}>
                {t.finishAndSummary || 'Finish & generate summary'}
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div className="session-col-right">
            {/* Primary Interaction Area: Big Orb Button */}
            <div className="mic-button-wrapper">
              <button
                type="button"
                className={`mic-circle-btn ${isListening ? 'listening' : ''}`}
                onClick={handleMicClick}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
              >
                <Icon name={isListening ? 'Square' : 'Mic'} size={42} color="var(--white)" />
              </button>
            </div>
            
            <p className="mic-status-label">
              <Icon name="Mic" size={16} color="var(--muted)" />
              {t.yourTurnTap || 'Your turn — tap to speak'}
            </p>
            <p className="mic-hint-text">
              {t.speakNaturally || "Speak naturally. There's no rush."}
            </p>

            {/* Waveform Visualizer */}
            <div className="waveform-canvas-box">
              <div className="waveform-bars-flex">
                {[30, 45, 20, 60, 80, 50, 70, 40, 90, 65, 35, 55, 75, 25, 45, 30, 50, 20].map((defaultHeight, idx) => {
                  const dynamicHeight = isListening
                    ? Math.max(10, Math.min(50, (volumeLevel * (idx % 3 + 1)) / 2))
                    : defaultHeight / 2;
                  return (
                    <div
                      key={idx}
                      className="live-bar"
                      style={{ height: `${dynamicHeight}px` }}
                    />
                  );
                })}
              </div>
            </div>

            <p className="simulated-disclaimer">
              {t.reflectiveActivity || 'Reflective activity · simulated visualization.'}<br />
              {t.visualTraceDisclaimer || 'The visual trace is simulated and is not a medical measurement.'}
            </p>

            {/* Live Transcript Display */}
            <div className="session-transcript-preview">
              <textarea
                value={
                  manualText
                    ? (interimTranscript ? `${manualText} ${interimTranscript}` : manualText)
                    : (transcript ? (interimTranscript ? `${transcript} ${interimTranscript}` : transcript) : interimTranscript)
                }
                onChange={(e) => setManualText(e.target.value)}
                placeholder={t.typePlaceholder || 'Or type your reflection here if you prefer not to speak...'}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: 'var(--ink)',
                }}
                rows={2}
              />
              {(manualText || transcript || interimTranscript) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Button size="sm" variant="primary" onClick={handleSendResponse} disabled={convStatus === 'PROCESSING'}>
                    {t.sendConversation}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
