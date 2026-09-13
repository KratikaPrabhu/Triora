import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signupUser, clearAuthError } from '../store/authSlice';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ErrorAlert from '../components/common/ErrorAlert';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { User, Mail, Lock, HeartHandshake, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearAuthError());

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Password and Confirm Password do not match.');
      return;
    }

    try {
      await dispatch(signupUser({ name: name.trim(), email: email.trim(), password })).unwrap();
      navigate('/onboarding');
    } catch (err: any) {
      // Handled by Redux error state
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-inner">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.signupTitle || "Create your Triora account"}</h1>
            <p className="text-xs text-slate-400">
              Start your voice-first intake session before meeting your therapist.
            </p>
          </div>

          {(validationError || error) && (
            <ErrorAlert
              title="Registration Error"
              message={validationError || error || 'Signup failed'}
              onRetry={() => {
                setValidationError(null);
                dispatch(clearAuthError());
              }}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.nameLabel || "Full Name"} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.emailLabel || "Email Address"} <span className="text-rose-400">*</span>
              </label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.passwordLabel || "Password"} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20 mt-2"
            >
              {loading ? 'Creating Account...' : (t.createAccountBtn || 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          {/* Google Sign-In */}
          <GoogleSignInButton
            onSuccessRedirect={() => navigate('/onboarding')}
            onErrorMsg={(msg) => setValidationError(msg)}
          />

          {/* Link to Login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-400 hover:text-teal-300 underline">
              {t.alreadyAccount || "Sign in"}
            </Link>
          </div>

          {/* Safety Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Pre-Therapy Intake System &bull; Encrypted & Private</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupPage;
