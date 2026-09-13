import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          The intake page you were looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
