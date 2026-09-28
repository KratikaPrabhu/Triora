import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { useSpeech } from '../hooks/useSpeech';
import { useConversation } from '../hooks/useConversation';
import { reportService } from '../services/reportService';
import { sessionService } from '../services/sessionService';
import { ttsService } from '../services/ttsService';
import '../styles/session.css';

export const SessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionIdFromUrl = searchParams.get('id');

  const [sessionId, setSessionId] = useState<string | null>(sessionIdFromUrl);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [manualText, setManualText] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Initialize or fetch session if id not in URL
  useEffect(() => {
    if (!sessionIdFromUrl) {
      sessionService.createSession('en').then((res) => {
        if (res.success && res.data?._id) {
          setSessionId(res.data._id);
        } else {
          setErrorState("We couldn't initialize your reflection space right now.");
        }
      });
    }
  }, [sessionIdFromUrl]);

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
    frequencySamples,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech('en');

  const {
    status: convStatus,
    setStatus: setConvStatus,
    currentQuestion,
    errorMessage: convError,
    isWebSocketActive,
    sendMessage,
    retryLastUtterance,
    finishSession,
    speakCurrentQuestion,
  } = useConversation(sessionId, 'en');

  // Sync transcript to input box as user speaks
  useEffect(() => {
    if (transcript) {
      setManualText(transcript);
    }
  }, [transcript]);

  // Update status when listening starts/stops
  useEffect(() => {
    if (isListening) {
      setConvStatus('LISTENING');
    } else if (convStatus === 'LISTENING') {
      setConvStatus('WAITING_FOR_USER');
    }
  }, [isListening, convStatus, setConvStatus]);

  // Handle session completion
  useEffect(() => {
    if (convStatus === 'completed' && sessionId && !generatingReport) {
      handleCompleteSession();
    }
  }, [convStatus, sessionId]);

  const handleToggleMic = () => {
    ttsService.unlockAudio();
    if (convStatus === 'AI_SPEAKING') {
      // Allow user to interrupt TTS
      ttsService.stop();
      startListening();
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Finalized user utterance handler - triggers ONE Gemini request
   */
  const handleSendResponse = async () => {
    const messageToSend = (manualText || transcript || interimTranscript).trim();
    if (!messageToSend) return;

    if (isListening) {
      stopListening();
    }

    const voiceMetricsPayload = {
      duration: timerSeconds,
      avgFrequency: volumeLevel,
      samples: frequencySamples,
    };

    await sendMessage(messageToSend, voiceMetricsPayload);

    resetTranscript();
    setManualText('');
  };

  const handleCompleteSession = async () => {
    if (!sessionId || generatingReport) return;
    setGeneratingReport(true);
    stopListening();
    ttsService.stop();

    try {
      await finishSession();
      const res = await reportService.generateReport(sessionId);
      setGeneratingReport(false);
      if (res.success && res.data?.report?._id) {
        navigate(`/report/${res.data.report._id}`);
      } else {
        navigate(`/report/${sessionId}`);
      }
    } catch (err: any) {
      setGeneratingReport(false);
      navigate(`/report/${sessionId}`);
    }
  };

  const activeError = errorState || convError || speechError;

  if (generatingReport) {
    return <Loading fullScreen message="Synthesizing your reflection into a structured report..." />;
  }

  const getAudioStatusBadge = () => {
    if (convStatus === 'AI_SPEAKING') {
      return (
        <div className="session-status-badge" style={{ backgroundColor: 'var(--soft-green)', color: 'var(--green)' }}>
          <Icon name="Volume2" size={16} />
          <span>Speaking...</span>
        </div>
      );
    }
    if (isListening) {
      return (
        <div className="session-status-badge" style={{ backgroundColor: '#fffaf0', color: '#dd6b20' }}>
          <span className="pulse-dot" style={{ backgroundColor: '#dd6b20' }} />
          <span>I’m listening…</span>
        </div>
      );
    }
    if (convStatus === 'PROCESSING') {
      return (
        <div className="session-status-badge">
          <Icon name="Loader" size={16} className="spin" />
          <span>Thinking...</span>
        </div>
      );
    }
    return (
      <div className="session-status-badge">
        <Icon name="Mic" size={16} />
        <span>Your turn</span>
      </div>
    );
  };

  return (
    <div className="session-page-container" onClick={() => ttsService.unlockAudio()}>
      {/* Header */}
      <header className="session-header">
        <Logo linkTo="/dashboard" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {getAudioStatusBadge()}
          {isWebSocketActive && (
            <span style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>
              • Realtime
            </span>
          )}
        </div>

        <Button size="sm" variant="outline" onClick={handleCompleteSession}>
          Save & exit
        </Button>
      </header>

      {/* Main Stage */}
      <main className="session-main-stage">
        {/* Clean Friendly Error State */}
        {activeError && (
          <div
            style={{
              backgroundColor: '#fff5f5',
              border: '1px solid #feb2b2',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem 2rem',
              maxWidth: '560px',
              margin: '0 auto 2rem',
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: '#9b2c2c', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong
            </h3>
            <p style={{ color: '#742a2a', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              We couldn't process your response right now. Please try again in a moment.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setErrorState(null);
                retryLastUtterance();
              }}
            >
              Try again
            </Button>
          </div>
        )}

        <div className="session-timer-display">{formatTimer(timerSeconds)}</div>

        {/* Prominent Current AI Question */}
        <div className="session-question-card">
          <h1 className="session-main-question">
            "{currentQuestion}"
          </h1>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Button
              size="sm"
              variant="ghost"
              icon={<Icon name="Volume2" size={16} />}
              onClick={() => speakCurrentQuestion(currentQuestion)}
            >
              Tap to hear question
            </Button>
          </div>
        </div>

        {/* Microphone Control */}
        <div className="mic-button-wrapper">
          <button
            className={`mic-circle-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggleMic}
            disabled={convStatus === 'PROCESSING'}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <Icon name={isListening ? 'Square' : 'Mic'} size={40} />
          </button>

          <p className="mic-status-label">
            {convStatus === 'AI_SPEAKING'
              ? '🔊 Triora is speaking...'
              : isListening
              ? '🎙️ I’m listening…'
              : convStatus === 'PROCESSING'
              ? '⏳ Thinking...'
              : '🎙️ Your turn — tap to speak'}
          </p>

          <p className="mic-hint-text">
            {isListening ? 'Tap when finished speaking' : 'Speak naturally. There’s no rush.'}
          </p>
        </div>

        {/* Waveform Visualizer */}
        <div className="waveform-canvas-box">
          <div className="waveform-bars-flex">
            {[30, 45, 20, 60, 80, 50, 70, 40, 90, 65, 35, 55, 75, 25, 45].map((defaultHeight, idx) => {
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
          Reflective activity · simulated visualization. <br />
          The visual trace is simulated and is not a medical measurement.
        </p>

        {/* Live Transcript Display (Interim transcript updates UI, NOT Gemini) */}
        <div className="session-transcript-preview">
          <textarea
            value={manualText || interimTranscript}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={
              isListening
                ? 'Your spoken words will appear here in real time...'
                : 'Or type your reflection here if you prefer not to speak...'
            }
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: 'var(--ink)',
            }}
            rows={2}
          />
          {(manualText || transcript) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button size="sm" variant="primary" onClick={handleSendResponse} disabled={convStatus === 'PROCESSING'}>
                Send reflection
              </Button>
            </div>
          )}
        </div>

        {/* Finish button */}
        <div className="session-finish-btn-row">
          <Button variant="secondary" onClick={handleCompleteSession}>
            Finish & generate summary
          </Button>
        </div>
      </main>
    </div>
  );
};
