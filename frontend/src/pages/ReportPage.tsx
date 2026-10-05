import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import type { Report } from '../types/report';
import '../styles/report.css';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

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
    return <Loading fullScreen message={t.synthesizingSummary} />;
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
                <Button variant="primary">{t.returnToDashboard}</Button>
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
            {t.print}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Icon name={shareCopied ? 'Check' : 'Share2'} size={16} />}
            onClick={handleShare}
          >
            {shareCopied ? t.linkCopied : t.shareWithTherapist}
          </Button>

          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              {t.goToDashboard}
            </Button>
          </Link>
        </div>
      </header>

      {/* Document Layout */}
      <div className="report-document-container">
        {/* Header */}
        <div className="report-header-section">
          <p className="report-eyebrow">TRIORA {(t.reportSummaryTitle || 'Conversation Summary').toUpperCase()}</p>
          <h1 className="report-main-title">{t.reportSummaryTitle || 'Conversation Summary'}</h1>
          <div className="report-meta-row">
            <span>Date: {formattedDate}</span>
            <span>•</span>
            <span>{t.privateIntakeDoc}</span>
          </div>
        </div>

        {/* Notice Disclaimer */}
        <div className="report-disclaimer-box">
          <Icon name="Info" size={18} color="var(--sage)" />
          <span>
            {t.reportNotice}
          </span>
        </div>

        {/* Summary Overview */}
        <div className="report-section-block">
          <p className="report-section-label">{t.inYourWords}</p>
          <h2 className="report-section-heading">{t.summaryOverview}</h2>
          <p className="report-body-text">{report.summary}</p>
        </div>

        {/* Key Themes & Insights */}
        {report.keyThemes && report.keyThemes.length > 0 && (
          <div className="report-section-block">
            <h2 className="report-section-heading">Key Themes & Context</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {report.keyThemes.map((theme: string, idx: number) => (
                <div key={idx} style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--ink)', fontWeight: 500 }}>• {theme}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items / Concerns */}
        {report.concerns && report.concerns.length > 0 && (
          <div className="report-section-block">
            <h2 className="report-section-heading">Points for Your Therapist</h2>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', color: 'var(--ink)' }}>
              {report.concerns.map((item: string, idx: number) => (
                <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notice */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>Safety & Clinical Notice:</strong> This summary is a non-clinical preparation document generated from self-reported input. It is not a diagnostic assessment, psychological evaluation, or medical advice.
        </div>
      </div>
    </div>
  );
};
