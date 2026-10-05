import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { sessionService } from '../services/sessionService';
import { useLanguage } from '../context/LanguageContext';
import type { Session } from '../types/session';
import '../styles/dashboard.css';

export const ReportsListPage: React.FC = () => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    const res = await sessionService.getSessions();
    setIsLoading(false);

    if (res.success && res.data?.sessions) {
      setSessions(res.data.sessions);
    } else {
      setError(res.error?.message || 'Unable to load your reports.');
    }
  };

  return (
    <div className="dashboard-layout">
      <SideNav />

      <main className="dashboard-main">
        <div className="dashboard-header-top">
          <h1 className="dashboard-greeting">{t.reports}</h1>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        <div className="dashboard-card-box" id="reports" style={{ marginTop: '2rem' }}>
          <div className="card-box-header">
            <h3 className="card-box-title" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t.recentConversations}
            </h3>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
              <Loading />
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-state-box">
              <Icon name="FileText" size={24} color="var(--sage)" style={{ marginBottom: '1rem' }} />
              <p>{t.noConversationsYet}</p>
              <p>{t.whenYouStartSession}</p>
            </div>
          ) : (
            <div className="reflection-list">
              {sessions.map((sess) => {
                const sessDate = new Date(sess.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div key={sess._id} className="reflection-item-row">
                    <div className="reflection-item-info">
                      <p>{t.conversations} • {sess.language?.toUpperCase() || 'EN'}</p>
                      <p>{sessDate} • Status: {sess.status}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="status-badge">
                        {sess.reportId || sess.status === 'completed' ? t.reportReady : t.inProgress}
                      </span>
                      {(sess.reportId || sess.status === 'completed') && (
                        <Link to={`/report/${sess.reportId || sess._id}`}>
                          <Button size="sm" variant="outline" icon={<Icon name="FileText" size={14} />}>
                            {t.viewReport}
                          </Button>
                        </Link>
                      )}
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
