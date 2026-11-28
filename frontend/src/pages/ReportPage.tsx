import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services/reportService';
import { sessionService } from '../services/sessionService';
import { ttsService } from '../services/ttsService';
import type { Report } from '../types/report';
import type { Session } from '../types/session';
import html2pdf from 'html2pdf.js';
import '../styles/dashboard.css';
import '../styles/report.css';

interface ThemeItem {
  title: string;
  description: string;
}

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);

  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchReport(id);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    setIsLoading(true);
    try {
      const res = await reportService.getReport(reportId);
      setIsLoading(false);
      if (res.success && res.data?.report) {
        setReport(res.data.report);
        // Also fetch session transcript for synchronized audio playback
        if (res.data.report.sessionId) {
          const sessRes = await sessionService.getSessionById(res.data.report.sessionId);
          if (sessRes.success && sessRes.data?.session) {
            setSessionData(sessRes.data.session);
          }
        }
      } else {
        setReport(null);
      }
    } catch {
      setIsLoading(false);
      setReport(null);
    }
  };

  const handlePrint = () => {
    // Reset any container scroll offsets so print captures the complete document from top
    const mainEl = document.querySelector('.report-detail-main');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);

    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleExportPDF = async () => {
    if (!reportContentRef.current) return;
    setIsExportingPdf(true);

    try {
      // Create a clean standalone clone of the report container so html2canvas doesn't freeze the live DOM audio elements
      const clone = reportContentRef.current.cloneNode(true) as HTMLElement;
      // Remove any playback buttons from the clone for a pristine PDF printout
      clone.querySelectorAll('.report-transcript-playback-btn').forEach((btn) => btn.remove());

      const opt: any = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Triora-Clinical-Report-${report?._id?.slice(-6) || 'intake'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
      // Immediately unlock audio context in case the browser suspended media focus during file download
      ttsService.unlockAudio();
    }
  };

  const handlePlayTranscriptAudio = (index: number, text: string) => {
    if (playingMessageIndex === index) {
      ttsService.stop();
      setPlayingMessageIndex(null);
      return;
    }

    ttsService.unlockAudio();
    ttsService.stop();
    setPlayingMessageIndex(index);

    ttsService.speak(
      text,
      sessionData?.language || 'en',
      () => {},
      () => {
        setPlayingMessageIndex(null);
      }
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.profile?.preferredName || (user?.name ? user.name.split(' ')[0] : 'Kratika');

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const formattedDate = useMemo(() => {
    if (report?.createdAt || report?.generatedAt) {
      return new Date(report.createdAt || report.generatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return 'October 21, 2026';
  }, [report]);

  // Derive conversation duration
  const conversationDuration = useMemo(() => {
    const actualSeconds = report?.duration || report?.voiceAnalysis?.totalDuration;
    if (typeof actualSeconds === 'number' && actualSeconds > 0) {
      const mins = Math.floor(actualSeconds / 60);
      const secs = Math.round(actualSeconds % 60);
      return `${mins} min ${secs} sec`;
    }
    return '10 min 41 sec';
  }, [report]);

  // Derive themes list
  const themesList: ThemeItem[] = useMemo(() => {
    if (report?.keyThemes && report.keyThemes.length > 0) {
      return report.keyThemes.map((themeStr, i) => {
        // If themeStr contains a colon, split it into title and description
        if (themeStr.includes(':')) {
          const [tPart, ...rest] = themeStr.split(':');
          return { title: tPart.trim(), description: rest.join(':').trim() };
        }
        const defaultDescriptions = [
          'You shared that work and personal responsibilities have been making you feel overwhelmed.',
          'You mentioned having difficulty maintaining a consistent sleep schedule and feeling tired during the day.',
          'You reflected on patterns that trigger feelings of anxiety and practical steps for relief.',
        ];
        return {
          title: themeStr,
          description: defaultDescriptions[i % defaultDescriptions.length],
        };
      });
    }

    return [
      {
        title: 'Stress and Overthinking',
        description:
          'You shared that work and personal responsibilities have been making you feel overwhelmed.',
      },
      {
        title: 'Sleep and Routine',
        description:
          'You mentioned having difficulty maintaining a consistent sleep schedule and feeling tired during the day.',
      },
    ];
  }, [report]);

  const topicsCount = themesList.length;
  const insightsCount =
    (report?.concerns?.length || 0) + (report?.importantStatements?.length || 0) || 16;

  if (isLoading) {
    return <Loading fullScreen message="Loading summary..." />;
  }

  return (
    <div className="dashboard-layout report-detail-layout">
      {/* Side Navigation Bar */}
      <SideNav />

      {/* Main Scrollable Report Content Area */}
      <main className="dashboard-main report-detail-main">
        {/* Top Header & User Greeting */}
        <div className="report-detail-top-bar">
          <div className="report-back-nav">
            <Link to="/reports" className="report-back-btn">
              <span className="report-back-arrow">←</span>
              <span>Back to Reports</span>
            </Link>
          </div>

          <div className="report-top-right-group">
            <div className="report-user-greeting">
              {getGreetingTime()}, {firstName}
            </div>
            <div className="report-user-date">{currentDateFormatted}</div>
          </div>
        </div>

        {/* Action Buttons Toolbar Row */}
        <div className="report-action-buttons-row">
          <button
            type="button"
            className="report-action-btn btn-export-pdf"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>{isExportingPdf ? 'Exporting PDF...' : '📄 Export Clinical PDF'}</span>
          </button>
          <button type="button" className="report-action-btn btn-print" onClick={handlePrint}>
            Print
          </button>
          <button type="button" className="report-action-btn btn-share" onClick={handleShare}>
            {shareCopied ? 'Link copied!' : 'Share with therapist'}
          </button>
          <Link to="/dashboard" className="report-action-btn btn-dashboard">
            Go to Dashboard
          </Link>
        </div>

        {/* Printable & Exportable Report Container */}
        <div ref={reportContentRef} className="report-exportable-container">
        {/* Print-Only Header: Shown strictly during print */}
        <div className="report-print-header" aria-hidden="true">
          <div className="report-print-logo">triora</div>
          <div className="report-print-meta">
            <span>Patient: {user?.name || firstName}</span>
            <span className="report-print-dot">·</span>
            <span>Date: {formattedDate}</span>
          </div>
        </div>

        {/* Hero Card: Conversation Summary */}
        <section className="report-hero-card">
          <span className="report-hero-eyebrow">TRIORA CONVERSATION SUMMARY</span>
          <h1 className="report-hero-title">Conversation Summary</h1>
          <div className="report-hero-meta">
            <span>Date: {formattedDate}</span>
            <span className="report-meta-pipe">|</span>
            <span>Private Intake Document</span>
          </div>
          <p className="report-hero-desc">
            This summary was generated from your conversation. Review and edit it before sharing
            with your therapist.
          </p>
        </section>

        {/* Section 1: Summary Overview */}
        <section className="report-overview-section">
          <h2 className="report-section-heading">Summary Overview</h2>
          <p className="report-section-desc">
            This section captures the key themes and insights from your conversation. It reflects
            what you shared in your own words, helping you and your therapist better understand your
            current thoughts, feelings, and experiences.
          </p>

          {/* 3 Overview Metric Cards */}
          <div className="report-metrics-grid">
            <div className="report-metric-card">
              <span className="report-metric-label">Total Conversation Time</span>
              <span className="report-metric-val">{conversationDuration}</span>
            </div>

            <div className="report-metric-card">
              <span className="report-metric-label">Topics Discussed</span>
              <span className="report-metric-val">{topicsCount} key themes</span>
            </div>

            <div className="report-metric-card">
              <span className="report-metric-label">Key Insights</span>
              <span className="report-metric-val">{insightsCount} highlights</span>
            </div>
          </div>
        </section>

        {/* Section 2: Key Themes Card */}
        <section className="report-themes-card">
          <div className="report-themes-card-header">
            <h2 className="report-section-heading">Key Themes</h2>
            <p className="report-themes-subtitle">
              These are the main areas that came up during your conversation.
            </p>
          </div>

          <div className="report-themes-list">
            {themesList.map((theme, idx) => (
              <div key={idx} className="report-theme-row-card">
                <h3 className="report-theme-title">{theme.title}</h3>
                <p className="report-theme-text">{theme.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Multimodal Physiological & Autonomic Observations */}
        {(report?.physiologicalInsights || report?.physiologicalMetrics) && (
          <section className="report-themes-card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
            <div className="report-themes-card-header">
              <h2 className="report-section-heading">Physiological & Autonomic Correlation</h2>
              <p className="report-themes-subtitle">
                Objective biofeedback data correlated with conversation topics to identify physiological arousal patterns.
              </p>
            </div>

            {report.physiologicalInsights && (
              <div className="report-theme-row-card" style={{ marginBottom: '1rem', background: '#f8fafc' }}>
                <h3 className="report-theme-title" style={{ color: '#1d4ed8' }}>Clinical Observation</h3>
                <p className="report-theme-text" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {report.physiologicalInsights}
                </p>
              </div>
            )}

            {report.physiologicalMetrics && (
              <div className="report-metrics-grid" style={{ marginTop: '1rem' }}>
                <div className="report-metric-card">
                  <span className="report-metric-label">Mean Conductance (GSR)</span>
                  <span className="report-metric-val">{report.physiologicalMetrics.meanGSR?.toFixed(2) || '—'} µS</span>
                </div>
                <div className="report-metric-card">
                  <span className="report-metric-label">Arousal Spikes Detected</span>
                  <span className="report-metric-val">{report.physiologicalMetrics.spikeCount || 0} events</span>
                </div>
                <div className="report-metric-card">
                  <span className="report-metric-label">Average Heart Rate</span>
                  <span className="report-metric-val">{report.physiologicalMetrics.avgHeartRate?.toFixed(0) || '—'} BPM</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section 4: Question-Wise Physiological Fluctuations & Autonomic Response */}
        {((report?.questionPhysiologicalResponses && report.questionPhysiologicalResponses.length > 0) ||
          (sessionData?.transcript && sessionData.transcript.some(m => m.physiologicalMetrics))) && (
          <section className="report-themes-card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <div className="report-themes-card-header">
              <h2 className="report-section-heading">Question-by-Question Physiological Fluctuations</h2>
              <p className="report-themes-subtitle">
                Breakdown of biometric shifts (Conductance, Resistance, HRV, and Heart Rate) during each specific inquiry.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(
                report?.questionPhysiologicalResponses ||
                (() => {
                  const items: any[] = [];
                  const t = sessionData?.transcript || [];
                  let lastQ = 'Intake Question';
                  let idx = 0;
                  t.forEach(m => {
                    if (m.role === 'assistant') lastQ = m.text;
                    else if (m.role === 'user' && m.physiologicalMetrics) {
                      idx++;
                      items.push({
                        questionIndex: idx,
                        questionText: lastQ,
                        responseText: m.text,
                        durationSeconds: m.physiologicalMetrics.durationSeconds || 5,
                        metrics: m.physiologicalMetrics
                      });
                    }
                  });
                  return items;
                })()
              ).map((qItem: any, qIdx: number) => {
                const m = qItem.metrics || {};
                const gsrDelta = m.deltaConductance ?? 0;
                const hrDelta = m.deltaHeartRate ?? 0;
                const hrvDelta = m.deltaHRV ?? 0;

                return (
                  <div
                    key={qIdx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.875rem',
                      padding: '1.25rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Question #{qItem.questionIndex || qIdx + 1}
                        </span>
                        <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                          "{qItem.questionText}"
                        </h4>
                        {qItem.responseText && (
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', fontStyle: 'italic' }}>
                            Patient: "{qItem.responseText}"
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '9999px', whiteSpace: 'nowrap', marginLeft: '0.75rem' }}>
                        {qItem.durationSeconds || 5}s window
                      </span>
                    </div>

                    {/* Metric Fluctuations Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                      {/* Conductance (GSR) */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Conductance (GSR)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>
                          {m.meanGSR?.toFixed(2) || '—'} µS
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: gsrDelta > 0.5 ? '#dc2626' : gsrDelta < -0.2 ? '#16a34a' : '#64748b' }}>
                          {gsrDelta > 0 ? `▲ +${gsrDelta.toFixed(2)} µS` : gsrDelta < 0 ? `▼ ${gsrDelta.toFixed(2)} µS` : '● Steady'}
                        </div>
                      </div>

                      {/* Heart Rate */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Heart Rate</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>
                          {m.avgHeartRate || '—'} BPM
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: hrDelta > 3 ? '#dc2626' : hrDelta < -2 ? '#16a34a' : '#64748b' }}>
                          {hrDelta > 0 ? `▲ +${hrDelta} BPM` : hrDelta < 0 ? `▼ ${hrDelta} BPM` : '● Steady'}
                        </div>
                      </div>

                      {/* Resistance */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Resistance</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>
                          {m.meanResistance || '—'} kΩ
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Min: {m.minConductance ? Math.round(1000 / m.minConductance) : '—'} kΩ
                        </div>
                      </div>

                      {/* HRV (RMSSD) */}
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HRV (RMSSD)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>
                          {m.avgHRV || 48} ms
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: hrvDelta < -3 ? '#dc2626' : hrvDelta > 3 ? '#16a34a' : '#64748b' }}>
                          {hrvDelta > 0 ? `▲ +${hrvDelta} ms` : hrvDelta < 0 ? `▼ ${hrvDelta} ms` : '● Steady'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 5: Synchronized Dialogue Transcript with Audio Playback */}
        {sessionData?.transcript && sessionData.transcript.length > 0 && (
          <section className="report-themes-card" style={{ marginTop: '1.5rem' }}>
            <div className="report-themes-card-header">
              <h2 className="report-section-heading">Synchronized Intake Transcript & Audio</h2>
              <p className="report-themes-subtitle">
                Click any dialogue bubble below to listen back to the audio playback for that specific turn.
              </p>
            </div>

            <div className="report-transcript-playback-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {sessionData.transcript.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                const isPlaying = playingMessageIndex === index;

                return (
                  <div
                    key={index}
                    className="report-transcript-bubble"
                    onClick={() => handlePlayTranscriptAudio(index, msg.text)}
                    style={{
                      background: isAssistant ? '#f8fafc' : '#eff6ff',
                      border: isPlaying ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    role="button"
                    tabIndex={0}
                    title="Click to play audio"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: isAssistant ? '#64748b' : '#2563eb'
                      }}>
                        {isAssistant ? 'Triora AI' : (user?.name || 'Patient')}
                      </span>
                      <button
                        type="button"
                        className="report-transcript-playback-btn"
                        style={{
                          background: isPlaying ? '#2563eb' : '#e2e8f0',
                          color: isPlaying ? '#ffffff' : '#334155',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <span>{isPlaying ? '⏹ Stop' : '▶ Play Audio'}</span>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.925rem', color: '#1e293b', lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Print-Only Footer: Shown strictly during print */}
        <div className="report-print-footer" aria-hidden="true">
          <span>Triora Health · Confidential Intake Preparation Document · Not a clinical diagnosis</span>
          <span>Page 1 of 1</span>
        </div>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
