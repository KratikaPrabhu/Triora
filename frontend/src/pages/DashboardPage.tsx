import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types/session';
import '../styles/dashboard.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      setError(res.error?.message || 'Unable to load your reflections.');
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

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const displayName = user?.profile?.preferredName || user?.name || 'User';

  return (
    <div className="dashboard-layout">
      <SideNav />

      <main className="dashboard-main">
        <div className="dashboard-header-top">
          <p className="dashboard-date">{formattedDate}</p>
          <h1 className="dashboard-greeting">
            {getGreetingTime()}, {displayName}.
          </h1>
          <p className="dashboard-subtext">Take a moment. There’s no rush here.</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        {/* Start Reflection Large Dark Green Card */}
        <section className="reflection-start-card">
          <div className="reflection-start-content">
            <p className="reflection-kicker">A PRIVATE SPACE TO REFLECT</p>
            <h2 className="reflection-title">What’s been on your mind?</h2>
            <p className="reflection-desc">
              Speak freely for 10–15 minutes. Triora will listen and help organize what you want your therapist to understand.
            </p>

            <div className="reflection-cta-row">
              <Button
                variant="white"
                size="lg"
                icon={<Icon name="Mic" size={20} color="var(--green)" />}
                onClick={handleStartReflection}
              >
                Start a reflection
              </Button>
              <div className="reflection-privacy-text">
                <Icon name="Lock" size={16} />
                <span>Nothing is shared without you</span>
              </div>
            </div>
          </div>

          <div className="reflection-visual-decoration">
            <div className="deco-bar" style={{ height: '40px' }} />
            <div className="deco-bar" style={{ height: '70px' }} />
            <div className="deco-bar" style={{ height: '50px' }} />
            <div className="deco-bar" style={{ height: '85px' }} />
            <div className="deco-bar" style={{ height: '30px' }} />
            <div className="deco-bar" style={{ height: '60px' }} />
          </div>
        </section>

        {/* Grid Layout */}
        <div className="dashboard-grid">
          {/* Recent Reflections */}
          <div className="dashboard-card-box" id="reflections">
            <div className="card-box-header">
              <h3 className="card-box-title">Recent reflections</h3>
              {sessions.length > 0 && (
                <span className="card-box-link">View all ({sessions.length})</span>
              )}
            </div>

            {isLoading ? (
              <Loading message="Fetching reflections..." />
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
                <Icon name="MicOff" size={32} color="var(--sage)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No reflections recorded yet</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  When you start a session, your private summaries will appear here.
                </p>
              </div>
            ) : (
              <div>
                {sessions.map((sess) => {
                  const sessDate = new Date(sess.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div key={sess._id} className="reflection-item-row">
                      <div className="reflection-item-info">
                        <p>Reflection • {sess.language?.toUpperCase() || 'EN'}</p>
                        <p>{sessDate} • Status: {sess.status}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="status-badge">
                          {sess.reportId || sess.status === 'completed' ? 'Report ready' : 'In progress'}
                        </span>
                        {(sess.reportId || sess.status === 'completed') && (
                          <Link to={`/report/${sess.reportId || sess._id}`}>
                            <Button size="sm" variant="outline" icon={<Icon name="FileText" size={14} />}>
                              View report
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

          {/* Sidebar / Appointment Card */}
          <div className="dashboard-card-box" id="reports">
            <div className="card-box-header">
              <h3 className="card-box-title" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                YOUR NEXT APPOINTMENT
              </h3>
            </div>

            <div className="appointment-empty-box">
              <Icon name="Calendar" size={32} color="var(--sage)" style={{ marginBottom: '0.75rem' }} />
              <p>No appointment added</p>
              <p>Add a date to keep your preparation in one place.</p>
              <Button size="sm" variant="outline" disabled title="Appointment feature coming soon">
                + Add appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Crisis Support Notice */}
        <div className="crisis-banner">
          <Icon name="HeartPulse" size={20} color="var(--sage)" />
          <span>
            Need immediate support? Triora isn’t a crisis service. If you are in emergency distress, please reach out to local crisis numbers or healthcare professionals immediately.
          </span>
        </div>
      </main>
    </div>
  );
};
