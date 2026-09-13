import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Calendar } from 'lucide-react';

interface WelcomeBannerProps {
  name: string;
  sessionCount: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ name, sessionCount }) => {
  const { t } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/80 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Patient Intake Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t.welcomeBack || getGreeting()}, <span className="text-teal-400">{name}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed font-normal">
          Prepare for your next therapy appointment by completing a brief, open-ended spoken intake conversation.
        </p>

        <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-400 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>{sessionCount} Intake Session{sessionCount !== 1 ? 's' : ''} Completed</span>
          </div>
          <span>&bull;</span>
          <span>Encrypted & Confidential</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
