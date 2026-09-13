import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../config/languages';
import { HeartHandshake, User, LogOut, ChevronDown, Sparkles, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { languageCode, setLanguageCode, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const preferredName = user?.profile?.preferredName || user?.name || 'Patient';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20 group-hover:bg-teal-400 transition-colors">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Triora</span>
              <span className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase ml-1.5 px-1.5 py-0.5 bg-teal-950 border border-teal-800 rounded">
                Intake
              </span>
            </div>
          </Link>

          {/* Navigation & Language Picker */}
          <nav className="flex items-center gap-3 sm:gap-4">
            {/* Global Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200">
              <Globe className="w-4 h-4 text-teal-400 shrink-0" />
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                aria-label="Select Application Language"
                className="bg-transparent text-slate-200 font-semibold text-xs outline-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.flag || '🌐'} {lang.nativeName} ({lang.englishName})
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-slate-300 hover:text-teal-400 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {t.navDashboard}
                </Link>

                <Link
                  to="/session"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 px-4 py-2 rounded-xl shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.navStartConversation}</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 transition-all focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
                      {preferredName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate hidden md:inline">{preferredName}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/onboarding"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{t.navProfile}</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/40 transition-colors border-t border-slate-800"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>{t.navSignOut}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-teal-400 px-3 py-2 rounded-xl transition-colors"
                >
                  {t.navSignIn}
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 px-4 py-2 rounded-xl shadow-md transition-colors"
                >
                  {t.navGetStarted}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
