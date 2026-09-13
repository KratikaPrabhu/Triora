import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-lg">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-300 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#090d16]/95 backdrop-blur-md z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
