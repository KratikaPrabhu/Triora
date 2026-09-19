import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { createNewSession } from '../../store/sessionSlice';
import { useLanguage } from '../../context/LanguageContext';
import { Mic, ArrowRight, Sparkles } from 'lucide-react';

interface StartSessionCardProps {
  preferredLanguage?: string;
}

export const StartSessionCard: React.FC<StartSessionCardProps> = () => {
  const { languageCode, t } = useLanguage();
  const [creating, setCreating] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleStartSession = async () => {
    setCreating(true);
    try {
      await dispatch(createNewSession(languageCode)).unwrap();
      navigate('/session');
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden group">
      {/* Background Teal Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/90 border border-teal-800/80 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-First AI Spoken Conversation</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Ready to share how you've been feeling?
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {t.heroSub}
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            onClick={handleStartSession}
            disabled={creating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-base rounded-2xl transition-all shadow-lg shadow-teal-500/20 group-hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-slate-950" />
            </div>
            <span>{creating ? 'Starting Session...' : (t.startConversationBtn || 'Start a new conversation')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartSessionCard;
