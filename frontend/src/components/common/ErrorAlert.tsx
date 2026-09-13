import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  title = 'An Error Occurred',
}) => {
  return (
    <div className="rounded-2xl bg-rose-950/50 border border-rose-800/60 p-4 sm:p-5 text-rose-200 shadow-xl my-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-rose-900/60 rounded-xl text-rose-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
          <p className="text-sm text-rose-300/90 mt-0.5 leading-relaxed">{message}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
