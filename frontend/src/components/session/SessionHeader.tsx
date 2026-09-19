import React from 'react';
import { HeartHandshake, LogOut, CheckCircle } from 'lucide-react';

interface SessionHeaderProps {
  status: 'created' | 'active' | 'completed' | 'failed';
  language: string;
  onLanguageChange?: (lang: string) => void;
  onEndSession: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  status,
  language,
  onEndSession,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-4 sm:px-6 text-white no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">Triora Session</span>
            <span className="text-xs text-slate-400 block">{language}</span>
            <span className="text-[10px] text-teal-400 font-semibold block uppercase tracking-wider">
              Spoken Intake Mode
            </span>
          </div>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          {status === 'active' ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Spoken Intake</span>
            </div>
          ) : status === 'completed' ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Session Completed</span>
            </div>
          ) : null}
        </div>

        {/* Exit/End Button */}
        <button
          onClick={onEndSession}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 px-3.5 py-1.5 rounded-xl transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Finish Session</span>
        </button>
      </div>
    </header>
  );
};

export default SessionHeader;
