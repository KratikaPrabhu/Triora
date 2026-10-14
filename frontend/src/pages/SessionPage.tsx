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
              <Icon name="Mic" size={14} color="#0B4D46" />
              <span>Your turn · Realtime</span>
              <span className="session-realtime-dot" />
            </div>
          </div>

          {/* Save & Exit Button on Right */}
          <div className="session-nav-right">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button type="button" className="session-save-exit-btn">
                <Icon name="LogOut" size={15} color="#123F39" />
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
          {/* Left Column: Timer, Question, Hear question, Finish button */}
          <div className="session-col-left">
            {/* Timer Badge */}
            <div className="session-timer-pill">
              <Icon name="Clock" size={14} color="#123F39" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>

            {/* AI Question Headline */}
            <h1 className="session-question-text">
              {currentPrompt || 'Take your time. What made you consider speaking with a therapist now?'}
            </h1>

            {/* Tap to hear question audio button */}
            <button
              type="button"
              className="session-hear-btn"
              onClick={() => {
                ttsService.unlockAudio();
                speakCurrentQuestion(currentPrompt);
              }}
            >
              <div className="session-play-circle">
                <Icon name="Play" size={12} color="#FFFFFF" style={{ marginLeft: '2px' }} />
              </div>
              <span className="session-hear-label">{t.tapToHear || 'Tap to hear question'}</span>
              <div className="session-hear-wave-icon" aria-hidden="true">
                <span className="mini-wave-bar" style={{ height: '7px' }} />
                <span className="mini-wave-bar" style={{ height: '13px' }} />
                <span className="mini-wave-bar" style={{ height: '9px' }} />
                <span className="mini-wave-bar" style={{ height: '15px' }} />
                <span className="mini-wave-bar" style={{ height: '6px' }} />
              </div>
            </button>

            {/* Finish & generate summary button */}
            <button
              type="button"
              className="session-finish-pill-btn"
              onClick={handleCompleteSession}
            >
              <Icon name="FileText" size={17} color="#FFFFFF" />
              <span>{t.finishAndSummary || 'Finish & generate summary'}</span>
              <Icon name="ArrowRight" size={17} color="#FFFFFF" />
            </button>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="session-col-right">
            <div className="session-interaction-card">
              {/* Big Mic Button with Glowing Halo */}
              <div className="session-mic-orb-container">
                <div className={`session-mic-halo ${isListening ? 'listening' : ''}`} />
                <button
                  type="button"
                  className={`session-mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={handleMicClick}
                  aria-label={isListening ? 'Stop recording' : 'Start recording'}
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

              {/* Waveform Visualizer Pill */}
              <div className="session-waveform-pill" aria-hidden="true">
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

              {/* Disclaimer subtext */}
              <p className="session-disclaimer-text">
                {t.reflectiveActivity || 'Reflective activity · simulated visualization.'}<br />
                {t.visualTraceDisclaimer || 'The visual trace is simulated and is not a medical measurement.'}
              </p>

              {/* Text Reflection Input Area */}
              <div className="session-text-box">
                <div className="session-text-input-row">
                  <Icon name="MessageSquare" size={16} color="#7D928D" style={{ marginTop: '3px' }} />
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
                    rows={2}
                  />
                </div>

                {(manualText || transcript || interimTranscript) && (
                  <div className="session-send-row">
                    <button
                      type="button"
                      className="session-send-btn"
                      onClick={handleSendResponse}
                      disabled={convStatus === 'PROCESSING'}
                    >
                      <Icon name="Send" size={13} color="#FFFFFF" />
                      <span>{convStatus === 'PROCESSING' ? 'Processing...' : (t.sendConversation || 'Send')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
};
