import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previousTherapy, setPreviousTherapy] = useState('');
  const [underProfessionalCare, setUnderProfessionalCare] = useState('');
  const [howDidYouHearAboutUs, setHowDidYouHearAboutUs] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await signup({
      name,
      email,
      password,
      phone,
      previousTherapy,
      underProfessionalCare,
      howDidYouHearAboutUs,
    });
    setIsSubmitting(false);

    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="signup-page-bg">
      <div className="signup-container">
        {/* Left Side: Stationary / Sticky Branding & Value Props */}
        <div className="signup-left-section">
          <div className="signup-logo-wrap">
            <Logo variant="dark" linkTo="/" size="xl" />
          </div>

          <div className="signup-brand-content">
            <p className="signup-eyebrow">A SAFER, CALMER YOU</p>
            <h1 className="signup-main-title">
              A quieter<br />
              way to begin.
            </h1>
            <p className="signup-subtitle-desc">
              Your thoughts, your feelings, your journey. Triora gives you a private and supportive space to share, so your therapist can understand you better.
            </p>

            {/* Feature List */}
            <div className="signup-features-list">
              <div className="signup-feature-item">
                <div className="signup-feature-icon-circle icon-circle-green">
                  <Icon name="Lock" size={18} />
                </div>
                <div>
                  <h3 className="signup-feature-title">Private & Secure</h3>
                  <p className="signup-feature-desc">Your information stays confidential.</p>
                </div>
              </div>

              <div className="signup-feature-item">
                <div className="signup-feature-icon-circle icon-circle-peach">
                  <Icon name="Heart" size={18} />
                </div>
                <div>
                  <h3 className="signup-feature-title">Built for Your Well-being</h3>
                  <p className="signup-feature-desc">Designed to support your mental health journey.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Scrollable Floating Signup Card */}
        <div className="signup-card">
          <Link to="/" className="signup-back-home-link">
            <Icon name="ArrowLeft" size={15} />
            <span>Back to home</span>
          </Link>

          <p className="signup-card-eyebrow">CREATE YOUR ACCOUNT</p>
          <h2 className="signup-card-title">Let's get started.</h2>
          <p className="signup-card-subtitle">
            Create an account to continue your conversation. It only takes a minute.
          </p>

          {error && (
            <div className="signup-error-wrap">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Continue with Google */}
          <div className="signup-google-wrap">
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
          <div className="signup-divider-row">
            <span className="signup-divider-line" />
            <span className="signup-divider-text">or create with email</span>
            <span className="signup-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name */}
            <div className="signup-form-group">
              <label className="signup-form-label" htmlFor="signup-name">
                Full name *
              </label>
              <div className="signup-input-box">
                <Icon name="User" size={17} className="signup-input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  className="signup-input-field"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="signup-form-grid-2">
              <div className="signup-form-group">
                <label className="signup-form-label" htmlFor="signup-email">
                  Email address *
                </label>
                <div className="signup-input-box">
                  <Icon name="Mail" size={17} className="signup-input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    className="signup-input-field"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="signup-form-group">
                <label className="signup-form-label" htmlFor="signup-phone">
                  Phone number (optional)
                </label>
                <div className="signup-input-box">
                  <Icon name="Phone" size={17} className="signup-input-icon" />
                  <input
                    id="signup-phone"
                    type="tel"
                    className="signup-input-field"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <p className="signup-field-helper">Optional, for important updates</p>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="signup-form-grid-2">
              <div className="signup-form-group">
                <label className="signup-form-label" htmlFor="signup-password">
                  Password *
                </label>
                <div className="signup-input-box">
                  <Icon name="Lock" size={17} className="signup-input-icon" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className="signup-input-field"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="signup-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'Eye' : 'EyeOff'} size={17} />
                  </button>
                </div>
              </div>

              <div className="signup-form-group">
                <label className="signup-form-label" htmlFor="signup-confirm-password">
                  Confirm password *
                </label>
                <div className="signup-input-box">
                  <Icon name="Lock" size={17} className="signup-input-icon" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="signup-input-field"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="signup-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showConfirmPassword ? 'Eye' : 'EyeOff'} size={17} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section Divider: Care History & Background */}
            <div className="signup-section-header">
              <Icon name="Heart" size={15} color="#52796f" />
              <span>CARE HISTORY & BACKGROUND (OPTIONAL)</span>
            </div>

            {/* Previous Therapy & Under Professional Care Grid */}
            <div className="signup-form-grid-2">
              <div className="signup-form-group">
                <label className="signup-form-label" htmlFor="signup-previousTherapy">
                  Previous therapy? (optional)
                </label>
                <div className="signup-select-box">
                  <Icon name="BookOpen" size={17} className="signup-input-icon" />
                  <select
                    id="signup-previousTherapy"
                    className="signup-select-field"
                    value={previousTherapy}
                    onChange={(e) => setPreviousTherapy(e.target.value)}
                  >
                    <option value="">Select experience</option>
                    <option value="none">Never attended before</option>
                    <option value="some">A few sessions in the past</option>
                    <option value="extensive">Extensive therapy experience</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <Icon name="ChevronDown" size={15} className="signup-select-chevron" />
                </div>
              </div>

              <div className="signup-form-group">
                <label className="signup-form-label" htmlFor="signup-underProfessionalCare">
                  Under professional care? (optional)
                </label>
                <div className="signup-select-box">
                  <Icon name="UserCheck" size={17} className="signup-input-icon" />
                  <select
                    id="signup-underProfessionalCare"
                    className="signup-select-field"
                    value={underProfessionalCare}
                    onChange={(e) => setUnderProfessionalCare(e.target.value)}
                  >
                    <option value="">Select current status</option>
                    <option value="yes">Currently under care</option>
                    <option value="no">Not currently</option>
                    <option value="previously">Was previously, but not now</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <Icon name="ChevronDown" size={15} className="signup-select-chevron" />
                </div>
              </div>
            </div>

            {/* How Did You Hear About Us */}
            <div className="signup-form-group">
              <label className="signup-form-label" htmlFor="signup-howDidYouHearAboutUs">
                How did you hear about us? (optional)
              </label>
              <div className="signup-select-box">
                <Icon name="Megaphone" size={17} className="signup-input-icon" />
                <select
                  id="signup-howDidYouHearAboutUs"
                  className="signup-select-field"
                  value={howDidYouHearAboutUs}
                  onChange={(e) => setHowDidYouHearAboutUs(e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="Doctor or Therapist Recommendation">Doctor or Therapist Recommendation</option>
                  <option value="Friend or Family">Friend or Family</option>
                  <option value="Social Media (Instagram, Twitter, etc.)">Social Media</option>
                  <option value="Search Engine (Google, Bing)">Search Engine</option>
                  <option value="Mental Health Forum / Community">Mental Health Forum / Community</option>
                  <option value="Article or News">Article or News</option>
                  <option value="Other">Other</option>
                </select>
                <Icon name="ChevronDown" size={15} className="signup-select-chevron" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="signup-submit-button"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
              <span className="signup-arrow-icon-circle">
                <Icon name="ArrowRight" size={15} />
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="signup-card-footer">
            <span className="signup-footer-text">Already have an account?</span>{' '}
            <Link to="/login" className="signup-login-anchor">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
