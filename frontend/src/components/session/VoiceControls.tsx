import React, { useState } from 'react';
import { Mic, MicOff, Send, CheckCircle2 } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  isProcessing: boolean;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
  onCompleteSession: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isProcessing,
  onToggleMic,
  onSendMessage,
  onCompleteSession,
}) => {
  const [textInput, setTextInput] = useState('');

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    onSendMessage(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 no-print space-y-4">
      {/* Visual State & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* State Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 pulse-ring'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {isListening ? 'Microphone Active & Listening' : 'Microphone Muted / Paused'}
              </span>
              {isListening && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 bg-teal-400 rounded-full animate-wave-1" />
                  <span className="w-1.5 bg-teal-400 rounded-full animate-wave-2" />
                  <span className="w-1.5 bg-teal-400 rounded-full animate-wave-3" />
                  <span className="w-1.5 bg-teal-400 rounded-full animate-wave-4" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isProcessing ? 'AI processing response...' : 'Speak naturally or use text input below'}
            </p>
          </div>
        </div>

        {/* Complete Session Action */}
        <button
          onClick={onCompleteSession}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finish Session & Generate Summary</span>
        </button>
      </div>

      {/* Fallback Text Input */}
      <form onSubmit={handleTextSubmit} className="relative flex items-center">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or type a spoken message here..."
          disabled={isProcessing}
          className="w-full pl-4 pr-12 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!textInput.trim() || isProcessing}
          className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default VoiceControls;
