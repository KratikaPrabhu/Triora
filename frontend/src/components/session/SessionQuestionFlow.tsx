import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Volume2, ArrowRight, Sparkles, Mic, MicOff, Send, RefreshCw, SkipForward, AlertCircle } from 'lucide-react';

interface SessionQuestionFlowProps {
  currentQuestionIndex: number;
  totalQuestions?: number;
  currentQuestion: string;
  isSpeaking: boolean;
  isListening: boolean;
  isAiProcessing: boolean;
  isSilenceState?: boolean;
  onRepeatQuestion: () => void;
  onNextQuestion: () => void;
  onSkipQuestion?: () => void;
  onTryAgain?: () => void;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
  onCompleteSession: () => void;
}

export const SessionQuestionFlow: React.FC<SessionQuestionFlowProps> = ({
  currentQuestionIndex,
  currentQuestion,
  isSpeaking,
  isListening,
  isAiProcessing,
  isSilenceState = false,
  onRepeatQuestion,
  onNextQuestion,
  onSkipQuestion,
  onTryAgain,
  onToggleMic,
  onSendMessage,
  onCompleteSession,
}) => {
  const { t } = useLanguage();
  const [textInput, setTextInput] = useState('');
  const [nextDisabled, setNextDisabled] = useState(false);

  const handleNextClick = () => {
    if (nextDisabled || isAiProcessing) return;
    setNextDisabled(true);
    onNextQuestion();
    setTimeout(() => setNextDisabled(false), 600);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isAiProcessing) return;
    onSendMessage(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-6 no-print space-y-5">
      {/* Current Question & Action Buttons Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {t.questionPrefix || 'Question'} {currentQuestionIndex + 1}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          "{currentQuestion}"
        </h3>

        {/* Silence Notice Banner */}
        {isSilenceState && (
          <div className="bg-amber-950/50 border border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>I didn't catch anything. You can try speaking again or skip when ready.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onTryAgain}
                className="px-3 py-1.5 bg-amber-800/60 hover:bg-amber-700/60 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              {onSkipQuestion && (
                <button
                  type="button"
                  onClick={onSkipQuestion}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl flex items-center gap-1.5 text-slate-300 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions: [ 🔊 Repeat Question ] & [ Next → ] */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Repeat Question Button */}
          <button
            type="button"
            onClick={onRepeatQuestion}
            disabled={isSpeaking}
            aria-label="Repeat Current Question"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all shadow-sm"
          >
            <Volume2 className={`w-4 h-4 text-teal-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isSpeaking ? t.speakingState : t.repeatQuestionBtn}</span>
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNextClick}
            disabled={nextDisabled || isAiProcessing}
            aria-label={t.nextQuestionBtn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-md shadow-teal-500/20"
          >
            {isAiProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Preparing next question...</span>
              </>
            ) : (
              <>
                <span>{t.nextQuestionBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Voice Recognition & Text Input Fallback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle Mic Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onToggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 pulse-ring'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <div>
            <span className="text-xs font-bold text-slate-200 block">
              {isListening ? t.listeningState : t.pausedState}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {isAiProcessing ? t.speakingState : t.typeMessagePlaceholder}
            </span>
          </div>
        </div>

        {/* Complete Session Action */}
        <button
          type="button"
          onClick={onCompleteSession}
          className="w-full sm:w-auto text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 px-4 py-2.5 rounded-xl transition-all"
        >
          {t.finishSessionBtn}
        </button>
      </div>

      {/* Text Message Fallback Form */}
      <form onSubmit={handleTextSubmit} className="relative flex items-center">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t.typeMessagePlaceholder}
          disabled={isAiProcessing}
          className="w-full pl-4 pr-12 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!textInput.trim() || isAiProcessing}
          className="absolute right-2 p-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SessionQuestionFlow;
