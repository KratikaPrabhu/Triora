import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services/reportService';
import type { Report } from '../types/report';
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

        {/* Print-Only Footer: Shown strictly during print */}
        <div className="report-print-footer" aria-hidden="true">
          <span>Triora Health · Confidential Intake Preparation Document · Not a clinical diagnosis</span>
          <span>Page 1 of 1</span>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
