import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { useSpeech } from '../hooks/useSpeech';
import { useConversation } from '../hooks/useConversation';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import { sessionService } from '../services/sessionService';
import { ttsService } from '../services/ttsService';
import { GSRMonitoringCard } from '../components/GSRMonitoring/GSRMonitoringCard';
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
  const hasSpokenInitialRef = useRef(false);

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
    } else {
      sessionService.getSessionById(sessionIdFromUrl).then((res) => {
        if (res.success && res.data?.session) {
          const sess = res.data.session;
          if (sess.startedAt) {
            const elapsed = Math.max(0, Math.round((Date.now() - new Date(sess.startedAt).getTime()) / 1000));
            setTimerSeconds(elapsed);
          } else if (sess.duration && sess.duration > 0) {
            setTimerSeconds(sess.duration);
          }
        }
      });
    }
  }, [sessionIdFromUrl, language]);

  // Session elapsed timer
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
      const finishRes = await sessionService.respondToSession(sessionId, {
        status: 'completed',
        durationSeconds: timerSeconds
      });

      if (!finishRes.success) {
        throw new Error(finishRes.error?.message || 'Failed to complete session');
      }

      const reportRes = await reportService.generateReport(sessionId, {
        durationSeconds: timerSeconds
      });

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
    return <Loading fullScreen message={t.synthesizingSummary || 'Synthesizing your summary report...'} />;
  }

  // Get the last AI message as the prompt, with clean fallback
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const rawPrompt = assistantMessages.length > 0
    ? assistantMessages[assistantMessages.length - 1].text
    : currentQuestion;
  const currentPrompt = rawPrompt.replace(/^["“”']|["“”']$/g, '');

  return (
    <div className="session-page-container">
      {/* Session Top Navigation Bar */}
      <header className="session-navbar-wrapper">
        <nav className="session-navbar" aria-label="Session Navigation">
          {/* Logo on Left */}
          <div className="session-nav-left">
            <Logo linkTo="/dashboard" />
          </div>

          {/* Center Realtime Status Badge */}
          <div className="session-nav-center">
            <div className="session-status-badge">
              <span className="session-realtime-dot" />
              <span>Your turn · Realtime</span>
            </div>
          </div>

          {/* Save & Exit Button on Right */}
          <div className="session-nav-right">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button type="button" className="session-save-exit-btn">
                <span>{t.saveAndExit || 'Save & exit'}</span>
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="session-main-stage">
        <div className="session-main-container">
          {/* Error notification if any */}
          {(speechError || errorState) && !((speechError || errorState)?.includes('Azure')) && (
            <div className="session-error-banner">
              <Icon name="AlertCircle" size={16} />
              <span>{speechError || errorState}</span>
            </div>
          )}

        <div className="session-content-grid">
          {/* Left Column: Timer, Question, Interaction Card */}
          <div className="session-col-left">
            {/* Timer Badge */}
            <div className="session-timer-pill">
              <span>{formatTimer(timerSeconds)}</span>
            </div>

            {/* AI Question Headline */}
            <h1 className="session-question-text">
              {currentPrompt || (
                <>
                  Take your time. What made you consider speaking with a therapist now?
                </>
              )}
            </h1>

            <p className="session-question-subdesc">
              Share your thoughts in your own words. There’s no right or wrong answer.
            </p>

            {/* Conversation Voice / Text Interaction Card */}
            <div className="session-interaction-card">
              {/* Big Circular Mic Button with Soft Glowing Halo */}
              <div className="session-mic-orb-container">
                <div className={`session-mic-halo ${isListening ? 'listening' : ''}`} />
                <button
                  type="button"
                  className={`session-mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={handleMicClick}
                  aria-label={isListening ? 'Stop recording' : 'Start recording'}
                  title="Tap to speak"
                >
                  <Icon name={isListening ? 'Square' : 'Mic'} size={32} color="#FFFFFF" />
                </button>
              </div>

              {/* Status title & subtitle */}
              <h3 className="session-mic-title">
                {isListening ? 'Listening... tap to pause' : (t.yourTurnTap || 'Your turn — tap to speak')}
              </h3>
              <p className="session-mic-subtitle">
                {t.speakNaturally || "Speak naturally. There’s no right answer."}
              </p>

              {/* Waveform Visualizer Pill (Clickable Mic trigger) */}
              <div
                className={`session-waveform-pill ${isListening ? 'listening' : ''}`}
                onClick={handleMicClick}
                role="button"
                tabIndex={0}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
                title="Tap to speak"
              >
                <div className="session-waveform-bars">
                  {[6, 8, 12, 16, 22, 28, 20, 32, 38, 26, 36, 40, 30, 26, 34, 24, 18, 14, 10, 8, 6].map((baseHeight, idx) => {
                    const dynamicHeight = isListening
                      ? Math.max(6, Math.min(42, (volumeLevel * ((idx % 4) + 1) * 1.5) + (baseHeight * 0.35)))
                      : baseHeight;
                    return (
                      <div
                        key={idx}
                        className="session-wave-bar"
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer subtext under waveform */}
              <p className="session-disclaimer-text">
                {t.reflectiveActivity || 'Reflective activity · simulated visualization.'}<br />
                {t.visualTraceDisclaimer || 'The visual trace is simulated and is not a medical measurement.'}
              </p>

              {/* Text Reflection Input Area */}
              <div className="session-text-box">
                <div className="session-text-input-row">
                  <textarea
                    value={
                      manualText
                        ? (interimTranscript ? `${manualText} ${interimTranscript}` : manualText)
                        : (transcript ? (interimTranscript ? `${transcript} ${interimTranscript}` : transcript) : interimTranscript)
                    }
                    onChange={(e) => setManualText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendResponse();
                      }
                    }}
                    placeholder={t.typePlaceholder || 'Or type your thoughts here if you prefer not to speak...'}
                    className="session-textarea"
                    rows={1}
                  />
                  {(manualText || transcript || interimTranscript) && (
                    <button
                      type="button"
                      className="session-send-btn"
                      onClick={handleSendResponse}
                      disabled={convStatus === 'PROCESSING'}
                    >
                      <Icon name="ArrowRight" size={14} color="#FFFFFF" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physiological Monitoring Card + Finish & Generate Summary Button */}
          <div className="session-col-right">
            <GSRMonitoringCard sessionId={sessionId} />

            {/* Full-width Finish & Generate Summary Button directly below the monitoring card */}
            <button
              type="button"
              className="session-finish-banner-btn"
              onClick={handleCompleteSession}
            >
              <span>{t.finishAndSummary || 'Finish & generate summary'}</span>
              <Icon name="ArrowRight" size={17} color="#FFFFFF" />
            </button>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
};
