import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { reportService } from '../services/reportService';
import type { Report } from '../types/report';
import '../styles/report.css';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reportService.getReport(reportId);
      setIsLoading(false);

      if (res.success && res.data?.report) {
        setReport(res.data.report);
      } else {
        setError(res.error?.message || 'Your report is still being prepared or could not be loaded.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError('Unable to load summary report.');
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
    return <Loading fullScreen message="Loading reflection report..." />;
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Logo linkTo="/dashboard" />
          <div style={{ marginTop: '2rem' }}>
            <ErrorMessage
              message={error || 'Report not found.'}
              onRetry={() => id && fetchReport(id)}
            />
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/dashboard">
                <Button variant="primary">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(report.createdAt || report.generatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="report-page-bg">
      {/* Top Toolbar */}
      <header className="report-top-toolbar">
        <Logo linkTo="/dashboard" />

        <div className="report-toolbar-actions">
          <Button variant="outline" size="sm" icon={<Icon name="Printer" size={16} />} onClick={handlePrint}>
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Icon name={shareCopied ? 'Check' : 'Share2'} size={16} />}
            onClick={handleShare}
          >
            {shareCopied ? 'Link copied!' : 'Share with therapist'}
          </Button>

          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Document Layout */}
      <div className="report-document-container">
        {/* Header */}
        <div className="report-header-section">
          <p className="report-eyebrow">TRIORA REFLECTION SUMMARY</p>
          <h1 className="report-main-title">Reflection Summary</h1>
          <div className="report-meta-row">
            <span>Date: {formattedDate}</span>
            <span>•</span>
            <span>Private Intake Document</span>
          </div>
        </div>

        {/* Notice Disclaimer */}
        <div className="report-disclaimer-box">
          <Icon name="Info" size={18} color="var(--sage)" />
          <span>
            This summary was generated from your conversation. Review and edit it before sharing with your therapist.
          </span>
        </div>

        {/* Summary Overview */}
        <div className="report-section-block">
          <p className="report-section-label">IN YOUR WORDS</p>
          <h2 className="report-section-heading">Summary Overview</h2>
          <p className="report-body-text">{report.summary}</p>
        </div>

        {/* Key Themes */}
        {report.keyThemes && report.keyThemes.length > 0 && (
          <div className="report-section-block">
            <p className="report-section-label">WHAT FEELS MOST IMPORTANT</p>
            <h2 className="report-section-heading">Key Themes</h2>
            <ul className="statements-bullet-list">
              {report.keyThemes.map((theme, idx) => (
                <li key={idx} className="statement-bullet-item">
                  {theme}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Emotional Context */}
        {report.emotionalContext && (
          <div className="report-section-block">
            <p className="report-section-label">EMOTIONAL CONTEXT</p>
            <h2 className="report-section-heading">Emotional Themes</h2>
            <p className="report-body-text">{report.emotionalContext}</p>
            <div className="theme-tags-list">
              {report.concerns?.map((concern, idx) => (
                <span key={idx} className="theme-pill-tag">
                  {concern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Context & Patterns */}
        {report.conversationOverview && (
          <div className="report-section-block">
            <p className="report-section-label">CONTEXT AND PATTERNS</p>
            <h2 className="report-section-heading">Context & Background</h2>
            <p className="report-body-text">{report.conversationOverview}</p>
          </div>
        )}

        {/* Important Statements */}
        {report.importantStatements && report.importantStatements.length > 0 && (
          <div className="report-section-block">
            <p className="report-section-label">WHAT YOU HOPE TO GET FROM THERAPY</p>
            <h2 className="report-section-heading">Reflective Statements</h2>
            <ul className="statements-bullet-list">
              {report.importantStatements.map((stmt, idx) => (
                <li key={idx} className="statement-bullet-item">
                  "{stmt}"
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Note */}
        <div className="safety-notice-card">
          <strong style={{ color: 'var(--ink)' }}>Safety & Clinical Notice:</strong> This summary is a non-clinical preparation document generated from self-reported reflection. It is not a diagnostic assessment, psychological evaluation, or medical advice.
        </div>
      </div>
    </div>
  );
};
