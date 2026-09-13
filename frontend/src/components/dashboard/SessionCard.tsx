import React from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '../../types';
import { getLanguageByCode } from '../../config/languages';
import { Calendar, FileText, Clock, ChevronRight, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface SessionCardProps {
  session: Session;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const langObj = getLanguageByCode(session.language);
  const formattedDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusBadge = () => {
    switch (session.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 animate-pulse">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Ended Early</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Created</span>
          </span>
        );
    }
  };

  const messageCount = session.transcript?.length || 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/50 hover:shadow-lg transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {getStatusBadge()}
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <span>{langObj.flag}</span>
            <span>{langObj.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formattedDate}</span>
        </div>

        <p className="text-sm font-semibold text-slate-200 mt-2">
          {messageCount > 0 ? `${messageCount} Spoken Exchanges` : 'No spoken messages yet'}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        {session.status === 'completed' ? (
          <Link
            to={`/report/${session.id || session._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>View Summary Report</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to="/session"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <span>Resume Conversation</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
