import React, { useEffect, useRef } from 'react';
import type { TranscriptMessage } from '../../types';
import { Sparkles, User, Volume2 } from 'lucide-react';

interface ConversationBubblesProps {
  messages: TranscriptMessage[];
  isAiProcessing: boolean;
  userName?: string;
}

export const ConversationBubbles: React.FC<ConversationBubblesProps> = ({
  messages,
  isAiProcessing,
  userName = 'You',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiProcessing]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-teal-400">
          <Volume2 className="w-7 h-7 animate-pulse" />
        </div>
        <div className="max-w-md space-y-1">
          <p className="text-base font-semibold text-slate-200">Start speaking to begin your intake conversation</p>
          <p className="text-xs text-slate-400">
            Triora will listen and guide you through an open-ended conversation about how you've been feeling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={index}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                isUser
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-teal-300 border border-slate-700'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {isUser ? userName : 'Triora AI'}
                </span>
                {msg.timestamp && (
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-700 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        );
      })}

      {isAiProcessing && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-teal-400 border border-slate-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700/80 rounded-tl-none text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Triora is synthesizing response...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationBubbles;
