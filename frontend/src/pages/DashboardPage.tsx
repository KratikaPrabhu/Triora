import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types/session';
import '../styles/dashboard.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [graphMode, setGraphMode] = useState<'sessions' | 'messages'>('sessions');
  const [dateRange, setDateRange] = useState<'7' | '30'>('7');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setError(null);
    const res = await sessionService.getSessions();

    if (res.success && res.data?.sessions) {
      setSessions(res.data.sessions);
    } else {
      setError(res.error?.message || 'Unable to load your conversations.');
    }
  };

  const handleStartReflection = async () => {
    try {
      const preferredLang = language || user?.profile?.preferredLanguage || 'en';
      const res = await sessionService.createSession(preferredLang);
      if (res.success && res.data?._id) {
        navigate(`/session?id=${res.data._id}`);
      } else {
        setError(res.error?.message || 'Your session could not be started.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not initiate session.');
    }
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || 'Good morning';
    if (hour < 18) return t.goodAfternoon || 'Good afternoon';
    return t.goodEvening || 'Good evening';
  };

  const displayName = user?.profile?.preferredName || user?.name || 'User';

  // Compute metrics based on dateRange (7 days vs 30 days)
  const daysCount = parseInt(dateRange, 10);
  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [daysCount]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => new Date(s.createdAt) >= cutoffDate);
  }, [sessions, cutoffDate]);

  const totalSessionsCount = filteredSessions.length;
  const completedReportsCount = filteredSessions.filter(s => s.reportId || s.status === 'completed').length;
  const voiceMessagesCount = filteredSessions.reduce((acc, s) => {
    const userMsgs = (s.transcript || []).filter(m => m.role === 'user').length;
    return acc + userMsgs;
  }, 0);

  // Compute daily graph data for Sun -> Sat of current / last 7 days
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, []);

  const chartData = useMemo(() => {
    return last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.createdAt);
        return sDate >= date && sDate < nextDay;
      });

      let count = 0;
      if (graphMode === 'sessions') {
        count = daySessions.length;
      } else {
        count = daySessions.reduce((acc, s) => {
          return acc + (s.transcript || []).filter(m => m.role === 'user').length;
        }, 0);
      }

      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      };
    });
  }, [last7Days, sessions, graphMode]);

  const maxChartCount = Math.max(3, ...chartData.map(d => d.count));

  return (
    <div className="dashboard-layout dashboard-layout--fit">
      <SideNav />

      <main className="dashboard-main dashboard-main--fit">
        {/* Top Header Section with Greeting, Botanical accent, and Wellness Badge */}
        <header className="dash-header">
          <div className="dash-header-left">
            <div className="dash-greeting-line">
              <span className="dash-greeting-text">
                {getGreetingTime()}, <strong className="dash-user-name">{displayName}</strong>
              </span>
            </div>
            <p className="dash-supportive-sub">Take a moment. There’s no rush here.</p>
          </div>

          <div className="dash-header-right">
            {/* Wellness Badge */}
            <div className="wellness-badge">
              <span className="wellness-badge-text">You're doing great</span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="notification-bell-btn"
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                aria-label="View notifications"
                title="Notifications"
              >
                <Icon name="Bell" size={19} color="var(--forest-heading)" />
                <span className="notification-dot" />
              </button>

              {showNotificationPopup && (
                <div className="notification-popover">
                  <div className="popover-header">
                    <h4>Notifications</h4>
                    <button onClick={() => setShowNotificationPopup(false)} className="popover-close">✕</button>
                  </div>
                  <div className="popover-body">
                    <div className="popover-item">
                      <p className="popover-item-title">Welcome to Triora</p>
                      <p className="popover-item-time">A safe place to organize your thoughts before therapy.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        {/* 2x2 Dashboard Grid:
            Row 1: "What's been on your mind?" (left) + "Your well-being matters" (right)
            Row 2: "Activity Graph (Last 7 Days)" (left) + "Your Activity" (right)
        */}
        <div className="dash-2x2-grid">
          {/* Row 1, Col 1: Hero Conversation Card */}
          <section className="dash-hero-card">
            <div
              className="dash-hero-artwork"
              style={{
                backgroundImage: `url('/images/triora-hero-landscape.png')`
              }}
              aria-hidden="true"
            />

            <div className="dash-hero-content">
              <span className="dash-hero-eyebrow">A PRIVATE SPACE TO TALK</span>
              <h1 className="dash-hero-heading">What’s been on your mind?</h1>
              <p className="dash-hero-desc">
                Speak freely for 10–15 minutes. Triora will listen and help organize what you share with your therapist to understand.
              </p>

              <div className="dash-hero-cta-row">
                <button
                  type="button"
                  className="dash-hero-start-btn"
                  onClick={handleStartReflection}
                >
                  <Icon name="Mic" size={17} color="#FFFFFF" />
                  <span>Start conversation</span>
                </button>

                <div className="dash-hero-privacy">
                  <Icon name="Lock" size={14} color="var(--forest-heading)" />
                  <span>Nothing is shared</span>
                </div>
              </div>
            </div>
          </section>

          {/* Row 1, Col 2: Well-being Card */}
          <div className="dash-card dash-wellbeing-card">
            <div
              className="wellbeing-botanical-art"
              style={{
                backgroundImage: `url('/images/triora-botanical.png')`
              }}
              aria-hidden="true"
            />

            <div className="wellbeing-leaf-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19.5 4.5c-7 0-12 5-12 12 7 0 12-5 12-12z"
                  stroke="var(--forest-dark)"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 16.5L14 10"
                  stroke="var(--forest-dark)"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className="wellbeing-heading">Your well-being matters</h3>
            <p className="wellbeing-body">
              Your thoughts and feelings deserve to be heard. Take your time, one question at a time, and share what feels right for you.
            </p>

            <div className="wellbeing-divider" />

            <p className="wellbeing-handwritten">
              You are not alone
            </p>
          </div>

          {/* Row 2, Col 1: Activity Graph Card */}
          <section className="dash-card dash-graph-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <div className="dash-icon-box">
                  <Icon name="Mic" size={16} color="var(--forest-dark)" />
                </div>
                <h3 className="dash-card-title">Activity Graph (Last 7 Days)</h3>
              </div>

              {/* Segmented Controls */}
              <div className="segmented-control" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={graphMode === 'sessions'}
                  className={`segmented-btn ${graphMode === 'sessions' ? 'active' : ''}`}
                  onClick={() => setGraphMode('sessions')}
                >
                  Sessions
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={graphMode === 'messages'}
                  className={`segmented-btn ${graphMode === 'messages' ? 'active' : ''}`}
                  onClick={() => setGraphMode('messages')}
                >
                  Messages
                </button>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="chart-wrapper">
              <div className="chart-grid-lines" aria-hidden="true">
                <div className="chart-grid-line" />
                <div className="chart-grid-line" />
                <div className="chart-grid-line" />
              </div>

              <div className="chart-bars-row">
                {chartData.map((bar, idx) => {
                  const heightPercent = bar.count > 0 ? Math.min(100, Math.max(16, (bar.count / maxChartCount) * 100)) : 6;
                  return (
                    <div key={idx} className="chart-col">
                      <div className="chart-value-label">
                        {bar.count > 0 ? bar.count : ''}
                      </div>
                      <div className="chart-bar-slot">
                        <div
                          className={`chart-bar-fill ${bar.count > 0 ? 'filled' : 'empty'}`}
                          style={{ height: `${heightPercent}%` }}
                          title={`${bar.label}: ${bar.count} ${graphMode}`}
                        />
                      </div>
                      <div className="chart-x-label">{bar.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dash-card-footer">
              <Icon name="BarChart2" size={14} color="var(--text-muted)" />
              <span>
                {graphMode === 'sessions' ? 'Number of conversations taken' : 'Number of voice messages recorded'}
              </span>
            </div>
          </section>

          {/* Row 2, Col 2: Your Activity Card */}
          <div className="dash-card dash-activity-card">
            <div className="dash-card-header">
              <div className="dash-card-title-group">
                <Icon name="Calendar" size={17} color="var(--forest-dark)" />
                <h3 className="dash-card-title">Your Activity</h3>
              </div>

              {/* Date-range dropdown */}
              <div className="date-select-wrapper">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="date-select"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
                <Icon name="ChevronDown" size={13} color="var(--text-muted)" className="date-select-chevron" />
              </div>
            </div>

            {/* 3 Metric Rows */}
            <div className="metric-rows-list">
              <div className="metric-row">
                <div className="metric-row-icon pulse-icon">
                  <Icon name="Activity" size={17} color="var(--forest-dark)" />
                </div>
                <div className="metric-row-content">
                  <span className="metric-row-label">Total Sessions</span>
                  <span className="metric-row-val">{totalSessionsCount}</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-row-icon doc-icon">
                  <Icon name="FileText" size={17} color="var(--forest-dark)" />
                </div>
                <div className="metric-row-content">
                  <span className="metric-row-label">Completed Reports</span>
                  <span className="metric-row-val">{completedReportsCount}</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-row-icon msg-icon">
                  <Icon name="MessageSquare" size={17} color="var(--forest-dark)" />
                </div>
                <div className="metric-row-content">
                  <span className="metric-row-label">Voice Messages Sent</span>
                  <span className="metric-row-val">{voiceMessagesCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

