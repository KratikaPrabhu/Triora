const fs = require('fs');

const sessionCss = `/* SESSION PAGE STYLES */

.session-page-container {
  min-height: 100vh;
  background-color: var(--paper);
  display: flex;
  flex-direction: column;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  width: 100%;
}

.session-status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--green);
  background-color: var(--white);
  padding: 0.4rem 1rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--line);
}

.pulse-dot-active {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--green);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.session-main-stage {
  max-width: 800px;
  width: 100%;
  margin: 0 auto 4rem auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: center;
}

.session-timer-display {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  background-color: var(--white);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--line);
  display: inline-block;
}

.session-headline-box {
  margin-bottom: 1rem;
}

.session-main-question {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.35;
  margin-bottom: 1rem;
}

.tap-hear-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0 auto 3rem auto;
}

.tap-hear-btn:hover {
  color: var(--ink);
}

/* Big Mic Control */
.mic-button-wrapper {
  margin: 0 0 1rem 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mic-circle-btn {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background-color: var(--green);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(49, 95, 80, 0.25);
  transition: transform var(--transition-normal), background-color var(--transition-normal);
  position: relative;
  z-index: 2;
}

.mic-circle-btn:hover {
  transform: scale(1.05);
}

.mic-circle-btn.listening {
  background-color: var(--green-dark);
  animation: micPulse 1.8s infinite;
}

@keyframes micPulse {
  0% { box-shadow: 0 0 0 0 rgba(49, 95, 80, 0.4); }
  70% { box-shadow: 0 0 0 25px rgba(49, 95, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(49, 95, 80, 0); }
}

.mic-status-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mic-hint-text {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 0.5rem;
}

/* Waveform Canvas / Visualizer */
.waveform-canvas-box {
  width: 100%;
  max-width: 520px;
  height: 70px;
  background-color: var(--white);
  border: 1px solid var(--line);
  border-radius: 16px;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
}

.waveform-bars-flex {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.live-bar {
  width: 4px;
  background-color: var(--sage);
  border-radius: 2px;
  transition: height 100ms ease;
}

.simulated-disclaimer {
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 0.75rem;
  font-style: italic;
  line-height: 1.5;
}

/* Transcript preview box */
.session-transcript-preview {
  margin-top: 2rem;
  max-width: 600px;
  width: 100%;
  background-color: var(--white);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.session-finish-btn-row {
  margin-top: 2.5rem;
}
`;

const sessionTsx = `import React, { useState, useEffect } from 'react';
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
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
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
    sendMessage,
  } = useConversation(sessionId, language || 'en');

  const handleMicClick = () => {
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
        navigate(\`/report/\${reportRes.data.report._id}\`);
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
  const currentPrompt = messages.length > 0
    ? messages[messages.length - 1].text
    : t.sessionHeadline;

  return (
    <div className="session-page-container">
      {/* Session Top Bar */}
      <header className="session-header">
        <Logo linkTo="/dashboard" />
        <div className="session-status-badge">
          <Icon name="Mic" size={14} />
          <span>Your turn • Realtime</span>
        </div>
        <div>
          <Link to="/dashboard">
            <Button size="sm" variant="outline" style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Save & exit</Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="session-main-stage">
        {(speechError || errorState) && (
          <div className="session-error-banner">
            <Icon name="AlertCircle" size={16} />
            <span>{speechError || errorState}</span>
          </div>
        )}

        <div className="session-timer-display">{formatTimer(timerSeconds)}</div>

        <div className="session-headline-box">
          <h1 className="session-main-question">"{currentPrompt}"</h1>
        </div>

        <button className="tap-hear-btn">
          <Icon name="Volume2" size={16} /> Tap to hear question
        </button>

        {/* Primary Interaction Area: Big Orb Button */}
        <div className="mic-button-wrapper">
          <button
            type="button"
            className={\`mic-circle-btn \${isListening ? 'listening' : ''}\`}
            onClick={handleMicClick}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
          >
            <Icon name={isListening ? 'Square' : 'Mic'} size={42} color="var(--white)" />
          </button>
        </div>
        
        <p className="mic-status-label">
          <Icon name="Mic" size={16} color="var(--muted)" />
          Your turn — tap to speak
        </p>
        <p className="mic-hint-text">
          Speak naturally. There's no rush.
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
                  style={{ height: \`\${dynamicHeight}px\` }}
                />
              );
            })}
          </div>
        </div>

        <p className="simulated-disclaimer">
          Reflective activity · simulated visualization.<br />
          The visual trace is simulated and is not a medical measurement.
        </p>

        {/* Live Transcript Display */}
        <div className="session-transcript-preview">
          <textarea
            value={
              manualText
                ? (interimTranscript ? \`\${manualText} \${interimTranscript}\` : manualText)
                : (transcript ? (interimTranscript ? \`\${transcript} \${interimTranscript}\` : transcript) : interimTranscript)
            }
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Or type your reflection here if you prefer not to speak..."
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

        {/* Finish button */}
        <div className="session-finish-btn-row">
          <Button style={{ backgroundColor: 'var(--sage-light)', color: 'var(--green)', borderRadius: 'var(--radius-full)', fontWeight: 600 }} onClick={handleCompleteSession}>
            {t.finishAndSummary}
          </Button>
        </div>
      </main>
    </div>
  );
};
`;

fs.writeFileSync('src/styles/session.css', sessionCss);
fs.writeFileSync('src/pages/SessionPage.tsx', sessionTsx);
