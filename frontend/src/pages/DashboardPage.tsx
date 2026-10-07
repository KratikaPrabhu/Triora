import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Loading } from '../components/Loading';
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
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const displayName = user?.profile?.preferredName || user?.name || 'User';

  // Compute graph data (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = last7Days.map(date => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = sessions.filter(s => {
      const sDate = new Date(s.createdAt);
      return sDate >= date && sDate < nextDay;
    }).length;
    
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count
    };
  });

  const maxCount = Math.max(1, ...chartData.map(d => d.count));

  return (
    <div className="dashboard-layout">
      <SideNav />

      <main className="dashboard-main">
        <div className="dashboard-header-top">
          <p className="dashboard-date">{formattedDate}</p>
          <h1 className="dashboard-greeting">
            {getGreetingTime()}, {displayName}.
          </h1>
          <p className="dashboard-subtext">{t.takeAMoment}</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        {/* Start Conversation Large Dark Green Card */}
        <section className="reflection-start-card">
          <div className="reflection-start-content">
            <p className="reflection-kicker">{t.privateSpaceToTalk}</p>
            <h2 className="reflection-title">{t.whatsOnYourMind}</h2>
            <p className="reflection-desc">{t.speakFreely1015}</p>

            <div className="reflection-cta-row">
              <Button
                variant="white"
                size="lg"
                icon={<Icon name="Mic" size={20} color="var(--green)" />}
                onClick={handleStartReflection}
              >
                {t.startConversation}
              </Button>
              <div className="reflection-privacy-text">
                <Icon name="Lock" size={16} />
                <span>{t.nothingSharedWithoutYou}</span>
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
          {/* Activity Graph */}
          <div className="dashboard-card-box" id="graph">
            <div className="card-box-header">
              <h3 className="card-box-title" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Activity Graph (Last 7 Days)
              </h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '230px', marginTop: '2rem', padding: '0 1rem' }}>
              {chartData.map((data, i) => {
                const heightPercentage = Math.max(5, (data.count / maxCount) * 100);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', width: '12%', height: '100%' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--green, #2C5F4B)', minHeight: '1.2rem' }}>
                      {data.count > 0 ? data.count : ''}
                    </div>
                    <div 
                      style={{ 
                        width: '100%', 
                        maxWidth: '40px',
                        backgroundColor: data.count > 0 ? 'var(--green, #2C5F4B)' : 'var(--sage, #A3B8A8)', 
                        height: `${heightPercentage}%`, 
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                        opacity: data.count > 0 ? 1 : 0.3
                      }} 
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted, #6B7280)' }}>
                      {data.label}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ width: '100%', textAlign: 'center', marginTop: '1.5rem', marginBottom: '0.25rem', fontSize: '1rem', color: 'var(--ink, #1A1C1B)', fontWeight: 600, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Icon name="BarChart2" size={18} color="var(--green, #2C5F4B)" />
              Number of conversations taken
            </div>
          </div>

          {/* Statistics Card */}
          <div className="dashboard-card-box" id="statistics">
            <div className="card-box-header">
              <h3 className="card-box-title" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.yourActivity || 'Your Activity'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-light, #F8FAF9)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'var(--surface, #FFFFFF)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                    <Icon name="Activity" size={20} color="var(--green, #2C5F4B)" />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--ink, #1A1C1B)' }}>Total Sessions</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green, #2C5F4B)' }}>{sessions.length}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-light, #F8FAF9)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'var(--surface, #FFFFFF)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                    <Icon name="FileText" size={20} color="var(--green, #2C5F4B)" />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--ink, #1A1C1B)' }}>Completed Reports</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green, #2C5F4B)' }}>
                  {sessions.filter(s => s.status === 'completed' || s.reportId).length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-light, #F8FAF9)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'var(--surface, #FFFFFF)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                    <Icon name="MessageCircle" size={20} color="var(--green, #2C5F4B)" />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--ink, #1A1C1B)' }}>Voice Messages Sent</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green, #2C5F4B)' }}>
                  {sessions.reduce((acc, sess) => acc + (sess.transcript?.filter(m => m.role === 'user' && m.text?.trim()?.length > 0).length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
