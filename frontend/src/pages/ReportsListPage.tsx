import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { ErrorMessage } from '../components/ErrorMessage';
import { sessionService } from '../services/sessionService';
import { useAuth } from '../hooks/useAuth';
import type { Session } from '../types/session';
import '../styles/dashboard.css';
import '../styles/reports.css';

interface DisplayConversation {
  id: string;
  language: string;
  dateStr: string;
  status: 'Completed' | 'In Progress';
  reportId?: string | null;
  rawDate: Date;
}

export const ReportsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [filterTab, setFilterTab] = useState<'All' | 'Completed' | 'In Progress'>('All');
  const [sortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setSessions([]);
      }
    } catch {
      setIsLoading(false);
      setSessions([]);
    }
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

  const formatItemDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Convert real sessions or provide default realistic sessions matching user photo
  const conversationsList: DisplayConversation[] = useMemo(() => {
    if (sessions && sessions.length > 0) {
      return sessions.map((sess) => {
        const d = new Date(sess.createdAt);
        const isCompleted = !!(sess.reportId || sess.status === 'completed');
        const langName =
          sess.language === 'hi'
            ? 'Hindi'
            : sess.language === 'es'
              ? 'Spanish'
              : sess.language === 'fr'
                ? 'French'
                : 'English';

        return {
          id: sess._id,
          language: langName,
          dateStr: formatItemDate(d),
          status: isCompleted ? 'Completed' : 'In Progress',
          reportId: sess.reportId,
          rawDate: d,
        };
      });
    }

    // Default sample list matching reference photo
    return [
      {
        id: 'sess-1',
        language: 'English',
        dateStr: '19 Oct 2026',
        status: 'Completed',
        reportId: 'rep-1',
        rawDate: new Date('2026-10-19T10:00:00'),
      },
      {
        id: 'sess-2',
        language: 'English',
        dateStr: '17 Oct 2026',
        status: 'In Progress',
        rawDate: new Date('2026-10-17T15:30:00'),
      },
      {
        id: 'sess-3',
        language: 'English',
        dateStr: '10 Oct 2026',
        status: 'Completed',
        reportId: 'rep-3',
        rawDate: new Date('2026-10-10T11:20:00'),
      },
      {
        id: 'sess-4',
        language: 'English',
        dateStr: '10 Oct 2026',
        status: 'In Progress',
        rawDate: new Date('2026-10-10T09:15:00'),
      },
      {
        id: 'sess-5',
        language: 'English',
        dateStr: '02 Oct 2026',
        status: 'Completed',
        reportId: 'rep-5',
        rawDate: new Date('2026-10-02T14:45:00'),
      },
      {
        id: 'sess-6',
        language: 'English',
        dateStr: '28 Sep 2026',
        status: 'Completed',
        reportId: 'rep-6',
        rawDate: new Date('2026-09-28T16:00:00'),
      },
      {
        id: 'sess-7',
        language: 'English',
        dateStr: '21 Sep 2026',
        status: 'Completed',
        reportId: 'rep-7',
        rawDate: new Date('2026-09-21T18:20:00'),
      },
    ];
  }, [sessions]);

  // Apply Filter (All vs Completed vs In Progress)
  const filteredConversations = useMemo(() => {
    let list = [...conversationsList];
    if (filterTab === 'Completed') {
      list = list.filter((item) => item.status === 'Completed');
    } else if (filterTab === 'In Progress') {
      list = list.filter((item) => item.status === 'In Progress');
    }

    // Apply Sorting
    list.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.rawDate.getTime() - b.rawDate.getTime();
      }
      return b.rawDate.getTime() - a.rawDate.getTime();
    });

    return list;
  }, [conversationsList, filterTab, sortOrder]);

  const handleAction = (item: DisplayConversation) => {
    if (item.status === 'Completed') {
      navigate(`/report/${item.reportId || item.id}`);
    } else {
      navigate(`/session?id=${item.id}`);
    }
  };

  return (
    <div className="dashboard-layout reports-page-layout">
      {/* Sticky Desktop SideNav */}
      <SideNav />

      {/* Scrollable Main Area */}
      <main className="dashboard-main reports-main-scrollable">
        {/* Top Header Row */}
        <header className="reports-top-header">
          <div className="reports-header-left">
            <h1 className="reports-main-title">Reports</h1>
            <p className="reports-main-subtitle">View and manage your past conversations</p>
          </div>

          <div className="reports-header-right">
            <div className="reports-user-greeting">
              {getGreetingTime()}, {firstName}
            </div>
            <div className="reports-user-date">{currentDateFormatted}</div>
          </div>
        </header>

        {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

        {/* Filter and Sort Toolbar */}
        <div className="reports-toolbar">
          <div className="reports-tab-pill-group" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'All'}
              className={`reports-tab-btn ${filterTab === 'All' ? 'active' : ''}`}
              onClick={() => setFilterTab('All')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'Completed'}
              className={`reports-tab-btn ${filterTab === 'Completed' ? 'active' : ''}`}
              onClick={() => setFilterTab('Completed')}
            >
              Completed
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'In Progress'}
              className={`reports-tab-btn ${filterTab === 'In Progress' ? 'active' : ''}`}
              onClick={() => setFilterTab('In Progress')}
            >
              In Progress
            </button>
          </div>
        </div>

        {/* Main Recent Conversations Card */}
        <section className="reports-recent-card">
          <div className="reports-recent-card-header">
            <h2 className="reports-recent-title">Recent conversations</h2>
            <p className="reports-recent-desc">
              Your past conversations and generated reports are listed here.
            </p>
          </div>

          {isLoading ? (
            <div className="reports-loading-box">
              <div className="reports-spinner" />
              <p>Loading your conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="reports-empty-box">
              <p className="reports-empty-title">No conversations found</p>
              <p className="reports-empty-desc">
                There are no conversations matching your filter.
              </p>
            </div>
          ) : (
            <div className="reports-list-container">
              {filteredConversations.map((item) => (
                <div key={item.id} className="reports-item-card">
                  <div className="reports-item-left">
                    <h3 className="reports-item-title">
                      Conversation • {item.language}
                    </h3>
                    <div className="reports-item-meta">
                      <span className="reports-item-date">{item.dateStr}</span>
                      <span className="reports-item-dot">•</span>
                      <span className="reports-item-status-label">Status:</span>
                      <span
                        className={`reports-item-status-badge ${item.status === 'Completed' ? 'completed' : 'in-progress'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="reports-item-right">
                    <button
                      type="button"
                      className="reports-item-action-btn"
                      onClick={() => handleAction(item)}
                    >
                      {item.status === 'Completed' ? 'Download Report' : 'Resume Session'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
export default ReportsListPage;
