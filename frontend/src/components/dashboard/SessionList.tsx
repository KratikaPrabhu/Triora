import React from 'react';
import type { Session } from '../../types';
import SessionCard from './SessionCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { History, MessageSquareDashed } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  loading,
  error,
  onRetry,
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading your intake sessions..." />;
  }

  if (error) {
    return <ErrorAlert title="Unable to load sessions" message={error} onRetry={onRetry} />;
  }

  const sessionList = Array.isArray(sessions) ? sessions : [];

  if (sessionList.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <MessageSquareDashed className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No intake sessions yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          When you complete a voice intake conversation, your past session summaries and reports will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-400" />
          <h3 className="text-lg font-bold text-white">Previous Intake Sessions</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Showing {sessionList.length} session{sessionList.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessionList.map((session) => (
          <SessionCard key={session.id || session._id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default SessionList;
