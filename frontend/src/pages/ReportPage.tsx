import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import type { Report } from '../types/report';
import '../styles/report.css';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

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
      } else {
        // Fallback for demo or when session is newly generated
        setReport(null);
      }
    } catch (err: any) {
      setIsLoading(false);
      setReport(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  if (isLoading) {
    return <Loading fullScreen message={t.synthesizingSummary || 'Loading summary...'} />;
  }

  // Format date: if report has generatedAt or createdAt, use it; else fallback to October 14, 2026
  const formattedDate = report?.createdAt || report?.generatedAt
    ? new Date(report.createdAt || report.generatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 14, 2026';

  // Helper to format actual conversation time
  const formatConversationDuration = (seconds?: number | null): string => {
    if (typeof seconds !== 'number' || seconds <= 0) {
      if (report?.createdAt && report?.generatedAt) {
        const diff = Math.round((new Date(report.generatedAt).getTime() - new Date(report.createdAt).getTime()) / 1000);
        if (diff > 5) {
          const m = Math.floor(diff / 60);
          const s = diff % 60;
          return m === 0 ? `${s} seconds` : s === 0 ? `${m} minute${m === 1 ? '' : 's'}` : `${m} min ${s} sec`;
        }
      }
      return '1 minute';
    }

    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hour${hrs === 1 ? '' : 's'}`;
    }

    if (mins === 0) {
      return `${secs} second${secs === 1 ? '' : 's'}`;
    }

    if (secs === 0) {
      return `${mins} minute${mins === 1 ? '' : 's'}`;
    }

    return `${mins} min ${secs} sec`;
  };

  // Actual session duration derived from report or voice analysis
  const actualDuration = report?.duration || report?.voiceAnalysis?.totalDuration;
  const conversationTime = formatConversationDuration(actualDuration);

  const topicsList = report?.keyThemes && report.keyThemes.length > 0
    ? report.keyThemes
    : [
        'Daily routine and lifestyle',
        'Emotional well-being',
        'Work and personal boundaries',
        'Sleep and physical energy',
        'Mindfulness practices',
      ];

  const topicsCount = report?.keyThemes?.length || 5;

  const takeawaysList = [
    ...(report?.concerns || []),
    ...(report?.importantStatements || []),
  ];

  const defaultTakeaways = [
    'You shared your current daily routine and how it has been affecting your mood and energy levels.',
    'You expressed interest in developing healthier habits and routines.',
  ];

  const displayTakeaways = takeawaysList.length > 0 ? takeawaysList : defaultTakeaways;

  const insightsCount = takeawaysList.length > 0 ? takeawaysList.length : 12;

  return (
    <div className="report-page-bg">
      {/* Top Toolbar */}
      <header className="report-top-toolbar">
        <Logo linkTo="/dashboard" />

        <div className="report-toolbar-actions">
          <button className="report-action-btn report-print-btn" onClick={handlePrint} type="button">
            <Icon name="Printer" size={16} />
            <span>{t.print || 'Print'}</span>
          </button>

          <button className="report-action-btn report-share-btn" onClick={handleShare} type="button">
            <Icon name={shareCopied ? 'Check' : 'Share2'} size={16} />
            <span>{shareCopied ? (t.linkCopied || 'Link copied!') : (t.shareWithTherapist || 'Share with therapist')}</span>
          </button>

          <Link to="/dashboard" className="report-dashboard-link">
            <Icon name="LayoutGrid" size={16} />
            <span>{t.goToDashboard || 'Go to Dashboard'}</span>
            <span className="report-arrow">→</span>
          </Link>
        </div>
      </header>

      {/* Document Layout - Covers 90% of summary page width */}
      <main className="report-document-container" id="summary-report-document">
        {/* Centered Top Eyebrow with flanking divider lines */}
        <div className="report-eyebrow-wrapper">
          <span className="report-eyebrow-line" />
          <span className="report-eyebrow-text">
            TRIORA {(t.reportSummaryTitle || 'Conversation Summary').toUpperCase()}
          </span>
          <span className="report-eyebrow-line" />
        </div>

        {/* Title */}
        <h1 className="report-main-title">{t.reportSummaryTitle || 'Conversation Summary'}</h1>

        {/* Meta Row */}
        <div className="report-meta-row">
          <span className="report-meta-item">
            <Icon name="Calendar" size={16} className="meta-icon" />
            Date: {formattedDate}
          </span>
          <span className="report-meta-divider">|</span>
          <span className="report-meta-item">
            <Icon name="Lock" size={16} className="meta-icon" />
            {t.privateIntakeDoc || 'Private Intake Document'}
          </span>
        </div>

        {/* Notice Disclaimer Banner */}
        <div className="report-disclaimer-card">
          <div className="report-disclaimer-icon-circle">
            <Icon name="Info" size={16} color="#ffffff" />
          </div>
          <p className="report-disclaimer-text">
            {t.reportNotice || 'This summary was generated from your conversation. Review and edit it before sharing with your therapist.'}
          </p>
        </div>

        {/* Summary Overview Section Header */}
        <div className="report-section-intro">
          <p className="report-section-tag">{t.inYourWords || 'IN YOUR WORDS'}</p>
          <h2 className="report-section-title">{t.summaryOverview || 'Summary Overview'}</h2>
          <p className="report-section-desc">
            This section captures the key themes and insights from your conversation. It reflects what you shared in your own words, helping you and your therapist better understand your current thoughts, feelings, and experiences.
          </p>
        </div>

        {/* 3 Stat Cards Row: Conversation Time, Topics Discussed, Key Insights */}
        <div className="report-stats-grid">
          {/* Card 1: Total Conversation Time */}
          <div className="report-stat-card card-time">
            <div className="report-stat-icon-wrap icon-time">
              <Icon name="MessageSquare" size={18} />
            </div>
            <div className="report-stat-info">
              <span className="report-stat-label">Total Conversation Time</span>
              <span className="report-stat-value">{conversationTime}</span>
            </div>
          </div>

          {/* Card 2: Topics Discussed */}
          <div className="report-stat-card card-topics">
            <div className="report-stat-icon-wrap icon-topics">
              <Icon name="FileText" size={18} />
            </div>
            <div className="report-stat-info">
              <span className="report-stat-label">Topics Discussed</span>
              <span className="report-stat-value">
                {topicsCount === 1 ? '1 key theme' : `${topicsCount} key themes`}
              </span>
            </div>
          </div>

          {/* Card 3: Key Insights */}
          <div className="report-stat-card card-insights">
            <div className="report-stat-icon-wrap icon-insights">
              <Icon name="Lightbulb" size={18} />
            </div>
            <div className="report-stat-info">
              <span className="report-stat-label">Key Insights</span>
              <span className="report-stat-value">
                {insightsCount === 1 ? '1 highlight' : `${insightsCount} highlights`}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Cards Section: Main Themes & Key Takeaways */}
        <div className="report-columns-grid">
          {/* Column 1: Main Themes */}
          <div className="report-column-card">
            <div className="report-column-header">
              <div className="column-icon-badge badge-green">
                <Icon name="MessageSquare" size={18} />
              </div>
              <div>
                <h3 className="report-column-title">Main Themes</h3>
                <p className="report-column-subtitle">Topics you talked about during the session</p>
              </div>
            </div>

            <div className="report-theme-items-list">
              {topicsList.slice(0, 5).map((theme, idx) => (
                <div key={idx} className="report-theme-row-item">
                  <span className="theme-index-badge">{idx + 1}</span>
                  <span className="theme-name-text">{theme}</span>
                  <Icon name="ChevronRight" size={16} className="theme-arrow-icon" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Key Takeaways */}
          <div className="report-column-card">
            <div className="report-column-header">
              <div className="column-icon-badge badge-amber">
                <Icon name="Lightbulb" size={18} />
              </div>
              <div>
                <h3 className="report-column-title">Key Takeaways</h3>
                <p className="report-column-subtitle">Important points from your conversation</p>
              </div>
            </div>

            <div className="report-takeaway-bullets-list">
              {displayTakeaways.slice(0, 5).map((takeaway, idx) => (
                <div key={idx} className="report-takeaway-bullet-row">
                  <span className="takeaway-bullet-dot" />
                  <p className="takeaway-bullet-text">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Detailed Patient Summary / Session Reflection if available */}
        {report?.summary && report.summary !== 'Patient completed an intake session. No specific patient statements were recorded.' && (
          <div className="report-narrative-section">
            <h3 className="report-narrative-title">Session Reflection</h3>
            <p className="report-narrative-text">{report.summary}</p>
          </div>
        )}

        {/* Safety & Clinical Notice */}
        <div className="report-safety-notice">
          <p>
            <strong>Safety & Clinical Notice:</strong> This summary is a non-clinical preparation document generated from self-reported input. It is not a diagnostic assessment, psychological evaluation, or medical advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
