import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types/session';
import '../styles/dashboard.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
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
    try {
      const res = await sessionService.getSessions();
      if (res.success && res.data?.sessions) {
        setSessions(res.data.sessions);
      } else if (res.error) {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }
  };

  const handleStartReflection = async () => {
    try {
      const preferredLang = user?.profile?.preferredLanguage || 'en';
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.profile?.preferredName || (user?.name ? user.name.split(' ')[0] : 'Krati');

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Compute metrics based on dateRange (7 days vs 30 days)
  const daysCount = parseInt(dateRange, 10);
  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [daysCount]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => new Date(s.createdAt) >= cutoffDate);
  }, [sessions, cutoffDate]);

  const rawSessionsCount = filteredSessions.length;
  const rawReportsCount = filteredSessions.filter(
    (s) => s.reportId || s.status === 'completed'
  ).length;
  const rawVoiceCount = filteredSessions.reduce((acc, s) => {
    const userMsgs = (s.transcript || []).filter((m) => m.role === 'user').length;
    return acc + userMsgs;
  }, 0);

  // If new user with 0 sessions, show reference counts (1 session, 0 reports, 1 voice message)
  const totalSessionsCount = sessions.length > 0 ? rawSessionsCount : 1;
  const completedReportsCount = sessions.length > 0 ? rawReportsCount : 0;
  const voiceMessagesCount = sessions.length > 0 ? rawVoiceCount : 1;

  // Compute 7 days for the chart
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, []);

  const chartData = useMemo(() => {
    const hasData = sessions.length > 0;
    const defaultDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (!hasData) {
      return defaultDays.map((day) => ({
        label: day,
        count: day === 'Thu' ? 1 : 0,
      }));
    }

    return last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate >= date && sDate < nextDay;
      });

      let count = 0;
      if (graphMode === 'sessions') {
        count = daySessions.length;
      } else {
        count = daySessions.reduce((acc, s) => {
          return acc + (s.transcript || []).filter((m) => m.role === 'user').length;
        }, 0);
      }

      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      };
    });
  }, [last7Days, sessions, graphMode]);

  const maxChartCount = Math.max(3, ...chartData.map((d) => d.count));

  // Compute Line Graph coordinates (SVG ViewBox 0 0 460 120)
  const svgWidth = 460;
  const svgHeight = 120;
  const padX = 26;
  const topPad = 26;
  const baselineY = 108;
  const heightRange = baselineY - topPad;

  const points = useMemo(() => {
    const stepX = (svgWidth - 2 * padX) / Math.max(1, chartData.length - 1);
    return chartData.map((d, i) => {
      const x = padX + i * stepX;
      const fraction = maxChartCount > 0 ? d.count / maxChartCount : 0;
      const y = baselineY - fraction * heightRange;
      return { x, y, count: d.count, label: d.label };
    });
  }, [chartData, maxChartCount, svgWidth, padX, baselineY, heightRange]);

  // Smooth spline curve generator
  const linePathD = useMemo(() => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    }
    return path;
  }, [points]);

  const areaPathD = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePathD} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [points, linePathD, baselineY]);

  return (
    <div className="dashboard-layout">
      <SideNav />

      <main className="dashboard-main">
        {/* Top Header Section with Greeting, Date, and Notification bell */}
        <header className="dash-header">
          <div className="dash-header-left">
            <h1 className="dash-header-title">
              {getGreetingTime()}, {firstName}
            </h1>
            <p className="dash-header-date">{formattedDate}</p>
          </div>

          <div className="dash-header-right">
            <div className="dash-notification-wrapper">
              <button
                type="button"
                className="dash-notification-btn"
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                aria-label="View notifications"
                title="Notifications"
              >
                <Icon name="Bell" size={19} color="#1a3342" />
              </button>

              {showNotificationPopup && (
                <div className="dash-notification-popover">
                  <div className="dash-popover-header">
                    <h4>Notifications</h4>
                    <button
                      onClick={() => setShowNotificationPopup(false)}
                      className="dash-popover-close"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="dash-popover-body">
                    <div className="dash-popover-item">
                      <p className="dash-popover-item-title">Welcome to Triora</p>
                      <p className="dash-popover-item-time">
                        A safe place to organize your thoughts before therapy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        {/* 2x2 Dashboard Grid */}
        <div className="dash-2x2-grid">
          {/* Card 1: Hero Conversation Card */}
          <section className="dash-hero-card">
            {/* Subtle background ambient wave */}
            <div className="dash-hero-wave-bg" aria-hidden="true">
              <svg viewBox="0 0 540 240" fill="none" preserveAspectRatio="none">
                <path d="M220 0 C320 80, 420 30, 540 100 L540 0 Z" fill="rgba(255,255,255,0.035)" />
                <path d="M140 240 C280 130, 400 180, 540 70 L540 240 Z" fill="rgba(255,255,255,0.045)" />
              </svg>
            </div>

            <div className="dash-hero-content">
              <span className="dash-hero-eyebrow">PRIVATE CONVERSATION</span>
              <h2 className="dash-hero-title">What’s been on your mind?</h2>
              <p className="dash-hero-desc">
                Talk for 10–15 minutes. Triora listens, then turns what you said into a short report
                you can review before it goes to your therapist.
              </p>

              {/* Guaranteed single line for CTA button, divider, and privacy note */}
              <div className="dash-hero-actions">
                <button
                  type="button"
                  className="dash-hero-start-btn"
                  onClick={handleStartReflection}
                >
                  <Icon name="Mic" size={16} color="#1d5c7a" />
                  <span>Start conversation</span>
                </button>

                <span className="dash-hero-divider" aria-hidden="true">|</span>

                <span className="dash-hero-note">Nothing is shared until you approve it.</span>
              </div>
            </div>

            <div className="dash-hero-plant-wrapper">
              <img
                src="/images/dashboard-plant.png"
                alt="Potted plant on books"
                className="dash-hero-plant-img"
              />
            </div>
          </section>

          {/* Card 2: Before you begin */}
          <section className="dash-card dash-guide-card">
            {/* Top-right gentle blue wave curve */}
            <div className="dash-guide-wave-bg" aria-hidden="true">
              <svg viewBox="0 0 160 120" fill="none" preserveAspectRatio="none">
                <path d="M0 0 C50 45, 110 30, 160 70 L160 0 Z" fill="#ebf4fb" />
              </svg>
            </div>

            <h2 className="dash-card-title">Before you begin</h2>
            <ol className="dash-guide-list">
              <li className="dash-guide-item">
                <span className="dash-guide-num">1</span>
                <span className="dash-guide-text">
                  Find somewhere quiet where you can speak openly.
                </span>
              </li>
              <li className="dash-guide-item">
                <span className="dash-guide-num">2</span>
                <span className="dash-guide-text">
                  Answer one question at a time. You can pause whenever you like.
                </span>
              </li>
              <li className="dash-guide-item">
                <span className="dash-guide-num">3</span>
                <span className="dash-guide-text">
                  Read your report, edit it, then choose whether to send it.
                </span>
              </li>
            </ol>
          </section>

          {/* Card 3: Conversations, last 7 days - Line Graph */}
          <section className="dash-card dash-chart-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Conversations, last 7 days</h2>

              <div className="dash-toggle-pill" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={graphMode === 'sessions'}
                  className={`dash-toggle-btn ${graphMode === 'sessions' ? 'active' : ''}`}
                  onClick={() => setGraphMode('sessions')}
                >
                  Sessions
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={graphMode === 'messages'}
                  className={`dash-toggle-btn ${graphMode === 'messages' ? 'active' : ''}`}
                  onClick={() => setGraphMode('messages')}
                >
                  Messages
                </button>
              </div>
            </div>

            <div className="dash-chart-wrapper">
              <div className="dash-chart-plot">
                {/* Horizontal reference grid lines */}
                <div className="dash-grid-row line-3">
                  <span className="dash-y-label">3</span>
                  <div className="dash-grid-rule" />
                </div>
                <div className="dash-grid-row line-2">
                  <span className="dash-y-label">2</span>
                  <div className="dash-grid-rule" />
                </div>
                <div className="dash-grid-row line-1">
                  <span className="dash-y-label">1</span>
                  <div className="dash-grid-rule" />
                </div>
                <div className="dash-grid-row line-0">
                  <span className="dash-y-label">0</span>
                  <div className="dash-grid-rule baseline" />
                </div>

                {/* SVG Line Graph Layer */}
                <div className="dash-chart-svg-layer">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="dash-chart-svg"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartTealArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#256b87" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#256b87" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Shaded Area under smooth bezier line */}
                    <path d={areaPathD} fill="url(#chartTealArea)" />

                    {/* Connecting Stroke Line */}
                    <path
                      d={linePathD}
                      fill="none"
                      stroke="#256b87"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Point Circular Nodes & Tooltip */}
                    {points.map((p, idx) => (
                      <g key={idx} className="dash-chart-node-group">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={p.count > 0 ? 5.5 : 4}
                          fill="#ffffff"
                          stroke="#256b87"
                          strokeWidth="2.5"
                          className="dash-chart-node-circle"
                        >
                          <title>{`${p.label}: ${p.count} ${graphMode}`}</title>
                        </circle>

                        {/* Tooltip bubble on node with count > 0 */}
                        {p.count > 0 && (
                          <g className="dash-chart-tooltip-group">
                            <rect
                              x={p.x - 34}
                              y={p.y - 34}
                              width="68"
                              height="22"
                              rx="5"
                              fill="#eaf4fb"
                            />
                            <polygon
                              points={`${p.x - 5},${p.y - 12} ${p.x + 5},${p.y - 12} ${p.x},${p.y - 7}`}
                              fill="#eaf4fb"
                            />
                            <text
                              x={p.x}
                              y={p.y - 19}
                              textAnchor="middle"
                              fill="#1b6ca8"
                              fontSize="11"
                              fontWeight="600"
                              fontFamily="var(--font-sans, sans-serif)"
                            >
                              {p.count} {graphMode === 'sessions' ? (p.count === 1 ? 'session' : 'sessions') : 'messages'}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* X-axis labels below the baseline */}
              <div className="dash-chart-x-row">
                <div className="dash-chart-x-spacer" />
                <div className="dash-chart-x-labels">
                  {chartData.map((bar, idx) => (
                    <span key={idx} className="dash-chart-x-label">
                      {bar.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Card 4: Your activity */}
          <section className="dash-card dash-activity-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Your activity</h2>

              <div className="dash-select-wrapper">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="dash-select"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
                <Icon
                  name="ChevronDown"
                  size={13}
                  color="#758793"
                  className="dash-select-chevron"
                />
              </div>
            </div>

            {/* 3 Horizontal Metric Cards Side-by-Side */}
            <div className="dash-activity-grid">
              {/* Card 1: Total sessions (Active bottom border) */}
              <div className="dash-activity-stat-card active">
                <div className="dash-activity-stat-icon">
                  <Icon name="Calendar" size={22} color="#1b6ca8" />
                </div>
                <div className="dash-activity-stat-val">{totalSessionsCount}</div>
                <div className="dash-activity-stat-label">Total sessions</div>
              </div>

              {/* Card 2: Completed reports */}
              <div className="dash-activity-stat-card">
                <div className="dash-activity-stat-icon">
                  <Icon name="FileText" size={22} color="#1b6ca8" />
                </div>
                <div className="dash-activity-stat-val">{completedReportsCount}</div>
                <div className="dash-activity-stat-label">Completed reports</div>
              </div>

              {/* Card 3: Voice messages sent */}
              <div className="dash-activity-stat-card">
                <div className="dash-activity-stat-icon">
                  <Icon name="AudioWaveform" size={22} color="#1b6ca8" />
                </div>
                <div className="dash-activity-stat-val">{voiceMessagesCount}</div>
                <div className="dash-activity-stat-label">Voice messages sent</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
export default DashboardPage;
