import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-container">
        {/* Left Side: Logo & Editorial Quote */}
        <div className="login-left-section">
          <div className="login-logo-wrap">
            <Logo variant="dark" linkTo="/" size="xl" />
          </div>

          <div className="login-quote-box">
            <blockquote className="login-quote-text">
              “Sometimes the first step<br />
              isn’t having the answer.<br />
              It’s finding a safe place to begin.”
            </blockquote>
            <div className="login-quote-dash" />
            <p className="login-quote-subtext">Triora gives you that place.</p>
          </div>
        </div>

        {/* Right Side: Floating Login Card */}
        <div className="login-card">
          <h1 className="login-card-title">Continue your conversation.</h1>
          <p className="login-card-subtitle">Log in to access your sessions and reports.</p>

          {error && (
            <div className="login-error-wrapper">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Continue with Google */}
          <div className="login-google-container">
            <GoogleLoginButton
              onSuccess={(_, isNewUser) => {
                if (isNewUser) {
                  navigate('/onboarding');
                } else {
                  navigate('/dashboard');
                }
              }}
              onError={(msg) => setError(msg)}
            />
          </div>

          {/* Divider */}
          <div className="login-divider-row">
            <span className="login-divider-line" />
            <span className="login-divider-label">or use email</span>
            <span className="login-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form-body">
            {/* Email Address */}
            <div className="login-form-group">
              <label className="login-form-label" htmlFor="login-email">
                Email address
              </label>
              <div className="login-input-wrapper">
                <Icon name="Mail" size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="login-input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-form-group">
              <label className="login-form-label" htmlFor="login-password">
                Password
              </label>
              <div className="login-input-wrapper">
                <Icon name="Lock" size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'Eye' : 'EyeOff'} size={18} />
                </button>
              </div>
            </div>

            {/* Keep me signed in & Forgot Password */}
            <div className="login-aux-row">
              <label className="login-remember-label">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="login-checkbox-input"
                />
                <span>Keep me signed in</span>
              </label>

              <Link
                to="#"
                className="login-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link will be sent to your registered email address.');
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Log in Button */}
            <button
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Logging in...' : 'Log in'}</span>
              <span className="login-arrow-icon-circle">
                <Icon name="ArrowRight" size={15} />
              </span>
            </button>
          </form>

          {/* New to Triora Link */}
          <div className="login-card-footer">
            <span className="login-footer-text">New to Triora?</span>{' '}
            <Link to="/signup" className="login-signup-anchor">
              Create an account <span className="login-signup-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
