import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearAuthError } from '../store/authSlice';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ErrorAlert from '../components/common/ErrorAlert';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { Mail, Lock, HeartHandshake, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { t } = useLanguage();

  const handleRedirectAfterAuth = (userObj: any) => {
    const isOnboardingComplete = userObj?.profile?.isOnboardingComplete ?? false;
    const from = (location.state as any)?.from?.pathname;

    if (!isOnboardingComplete) {
      navigate('/onboarding', { replace: true });
    } else if (from && from !== '/login' && from !== '/signup') {
      navigate(from, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearAuthError());

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    try {
      const userObj = await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      handleRedirectAfterAuth(userObj);
    } catch (err: any) {
      // Error handled by Redux auth state
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-inner">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.loginTitle || "Welcome back to Triora"}</h1>
            <p className="text-xs text-slate-400">
              Sign in to access your pre-therapy intake dashboard.
            </p>
          </div>

          {(validationError || error) && (
            <ErrorAlert
              title="Sign In Error"
              message={validationError || error || 'Login failed'}
              onRetry={() => {
                setValidationError(null);
                dispatch(clearAuthError());
              }}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.emailLabel || "Email Address"}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.passwordLabel || "Password"}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20 mt-2"
            >
              {loading ? 'Signing In...' : (t.signInBtn || 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton
            onSuccessRedirect={(userObj) => handleRedirectAfterAuth(userObj)}
            onErrorMsg={(msg) => setValidationError(msg)}
          />

          {/* Link to Signup */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-teal-400 hover:text-teal-300 underline">
              {t.dontAccount || "Sign up"}
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Pre-Therapy Intake System &bull; Secure Authentication</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
