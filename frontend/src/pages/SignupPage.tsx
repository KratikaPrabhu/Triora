import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await signup(name, email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-left-banner">
        <Logo variant="light" linkTo="/" />
        <div className="auth-quote-wrapper">
          <p className="auth-quote">
            "Your story doesn’t need to be perfectly ordered. You just need a quiet place to speak."
          </p>
          <p className="auth-quote-sub">Triora listens without judgement.</p>
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
          <p className="auth-kicker">CREATE YOUR ACCOUNT</p>
          <h1 className="auth-title">A quieter way to begin.</h1>
          <p className="auth-subtitle">
            Your space is private. We’ll only ask for what helps personalize your experience.
          </p>

          {error && <ErrorMessage message={error} />}

          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleLoginButton
              onSuccess={() => navigate('/onboarding')}
              onError={(msg) => setError(msg)}
            />
          </div>

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Create a secure password"
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
              Create account
            </Button>
          </form>

          <p className="auth-bottom-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
