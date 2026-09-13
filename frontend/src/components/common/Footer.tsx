import React from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-12 pb-8 border-t border-slate-900 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Triora</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Voice-first pre-therapy intake assistant helping patients express how they have been feeling before their initial mental health appointment.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pre-Therapy Intake Tool &bull; Not a Medical Diagnosis or Treatment Service</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-teal-400 transition-colors">Get Started</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Patient Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Legal & Safety</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400 hover:text-slate-200 cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-slate-400 hover:text-slate-200 cursor-pointer">Terms of Service</span></li>
              <li><span className="text-slate-400 hover:text-slate-200 cursor-pointer">Crisis Resources</span></li>
              <li><span className="text-slate-400 hover:text-slate-200 cursor-pointer">Support</span></li>
            </ul>
          </div>
        </div>

        {/* Crisis Notice & Copyright */}
        <div className="pt-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            &copy; {new Date().getFullYear()} Triora Intake Systems. All rights reserved. If you are experiencing an immediate mental health emergency, please call 988 or your local emergency services.
          </p>
          <p className="text-slate-600">Built for clinical pre-intake preparation</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
