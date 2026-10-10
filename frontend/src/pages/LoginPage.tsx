import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-split-container">
      <div className="auth-left-banner">
        <Logo variant="light" linkTo="/" />
        <div className="auth-quote-wrapper">
          <p className="auth-quote">
            "Sometimes the first step isn’t having the answer. It’s finding a safe place to begin."
          </p>
          <p className="auth-quote-sub">Triora gives you that place.</p>
        </div>
        <div className="auth-banner-footer">
          Private · Patient · In your language
        </div>
      </div>

      <div className="auth-right-panel">
        <Link to="/" className="auth-back-link">
          <Icon name="ArrowLeft" size={16} />
          <span>Back home</span>
        </Link>

        <div className="auth-form-container">
          <p className="auth-kicker">WELCOME BACK</p>
          <h1 className="auth-title">Continue your conversation.</h1>
          <p className="auth-subtitle">Log in to access your sessions and reports.</p>

          {error && <ErrorMessage message={error} />}

          <div style={{ marginBottom: '1.5rem' }}>
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

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              Log in
            </Button>
          </form>

          <p className="auth-bottom-text">
            New to Triora? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
