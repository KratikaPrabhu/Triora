import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { sessionService } from '../services/sessionService';
import { useLanguage } from '../context/LanguageContext';
import type { Session } from '../types/session';
import '../styles/dashboard.css';
import '../styles/reports.css';

export const ReportsListPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await sessionService.getSessions();
      setIsLoading(false);
      if (res.success && res.data?.sessions) {
        setSessions(res.data.sessions);
      } else {
        setError(res.error?.message || 'Unable to load your reports.');
      }
    } catch {
      setIsLoading(false);
      setError('Unable to load your reports.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Compute summary metadata values
  const latestSession = sessions.length > 0 ? sessions[0] : null;
  const summaryDate = latestSession ? formatDate(latestSession.createdAt) : formatDate(new Date().toISOString());
  const summaryLang = latestSession?.language?.toUpperCase() || (language?.toUpperCase() || 'EN');
  const summaryStatus = latestSession?.status || 'active';

  return (
    <div className="dashboard-layout">
      {/* Exactly same fixed-height SideNav as Dashboard */}
      <SideNav />

      {/* Main Reports Area */}
      <main className="dashboard-main reports-page-main">
        {/* Top Header Section */}
        <header className="reports-top-bar">
          <div className="reports-header-left">
            <div className="reports-header-badge">
              <Icon name="FileText" size={26} color="#0B4D46" />
            </div>
            <div className="reports-header-text">
              <h1 className="reports-title">{t.reports || 'Reports'}</h1>
              <p className="reports-subtitle">View and manage your past conversations</p>
            </div>
          </div>

          <div className="reports-top-actions">
            {/* Wellness Badge matching Dashboard */}
            <div className="wellness-badge">
              <span className="wellness-badge-text">You're doing great</span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                title="Notifications"
              >
                <Icon name="Bell" size={19} color="var(--forest-heading)" />
                <span className="notification-dot" />
              </button>

              {showNotifications && (
                <div className="notification-popover">
                  <div className="popover-header">
                    <h4>Notifications</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="popover-close"
                      aria-label="Close notifications"
                    >
                      ✕
                    </button>
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

        {/* Error Notification if failed */}
        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        {/* Recent Conversations Card (Full Width covering blank space) */}
        <div className="reports-conversations-card" id="reports">
          <h2 className="reports-card-title">
            {t.recentConversations || 'Recent Conversations'}
          </h2>

          {/* Compact Metadata Summary Row */}
          <div className="reports-meta-summary-row">
            <div className="reports-meta-item">
              <Icon name="MessageSquare" size={15} color="#647C83" />
              <span>Conversations • {summaryLang}</span>
            </div>
            <span className="reports-meta-sep">|</span>
            <div className="reports-meta-item">
              <Icon name="Calendar" size={15} color="#647C83" />
              <span>{summaryDate}</span>
            </div>
            <span className="reports-meta-bullet">•</span>
            <div className="reports-meta-item">
              <span>
                Status: <strong className="reports-meta-status-text">{summaryStatus}</strong>
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="reports-loading-box">
              <div className="reports-loading-spinner" />
              <p className="reports-loading-text">Loading your conversations...</p>
            </div>
          ) : sessions.length === 0 ? (
            /* Empty State */
            <div className="reports-empty-box">
              <div className="reports-empty-icon">
                <Icon name="FileText" size={26} color="#0B4D46" />
              </div>
              <h3 className="reports-empty-title">
                {t.noConversationsYet || 'No conversations yet'}
              </h3>
              <p className="reports-empty-desc">
                {t.whenYouStartSession ||
                  'When you start a session, your conversations and clinical summaries will appear here.'}
              </p>
              <Link to="/session">
                <Button variant="primary" size="md" icon={<Icon name="Mic" size={16} />}>
                  Start a Conversation
                </Button>
              </Link>
            </div>
          ) : (
            /* Real Sessions List */
            <div className="reports-rows-list">
              {sessions.map((sess) => {
                const sessDate = formatDate(sess.createdAt);
                const langCode = sess.language?.toUpperCase() || 'EN';
                const hasReport = !!(sess.reportId || sess.status === 'completed');
                const targetReportUrl = `/report/${sess.reportId || sess._id}`;
                const targetSessionUrl = `/session?id=${sess._id}`;

                return (
                  <div key={sess._id} className="reports-row-card">
                    {/* Row Left: Avatar & Text */}
                    <div className="reports-row-left">
                      <div className="reports-row-avatar">
                        <Icon name="MessageSquare" size={18} color="#0B4D46" />
                      </div>
                      <div className="reports-row-text-group">
                        <span className="reports-row-title">
                          Conversation • {langCode}
                        </span>
                        <div className="reports-row-meta-line">
                          <span>{sessDate}</span>
                          <span>•</span>
                          <span>
                            Status:{' '}
                            <span className={`reports-status-indicator ${sess.status}`}>
                              {sess.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row Right: Resume Session OR Download PDF + Arrow */}
                    <div className="reports-row-right">
                      {hasReport ? (
                        /* Sessions with generated summary / completed: Download PDF */
                        <Link to={targetReportUrl} className="reports-action-link">
                          <button
                            type="button"
                            className="reports-download-btn"
                            aria-label={`Download PDF report for conversation in ${langCode}`}
                          >
                            <Icon name="FileText" size={14} color="#0B4D46" />
                            <span>Download PDF</span>
                          </button>
                        </Link>
                      ) : (
                        /* Sessions without summary / in progress: Resume Session */
                        <Link to={targetSessionUrl} className="reports-action-link">
                          <button
                            type="button"
                            className="reports-resume-btn"
                            aria-label={`Resume conversation in ${langCode}`}
                          >
                            <Icon name="Mic" size={14} color="#FFFFFF" />
                            <span>Resume Session</span>
                          </button>
                        </Link>
                      )}

                      <Link
                        to={hasReport ? targetReportUrl : targetSessionUrl}
                        className="reports-row-arrow-btn"
                        title={hasReport ? 'View Summary Report' : 'Resume Session'}
                        aria-label={`View conversation details from ${sessDate}`}
                      >
                        <Icon name="ArrowRight" size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
