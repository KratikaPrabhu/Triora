import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/onboarding.css';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

export const OnboardingPage: React.FC = () => {
  const { user, updateOnboarding } = useAuth();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.profile?.preferredName) {
        setPreferredName(user.profile.preferredName);
      } else if (user.name) {
        setPreferredName(user.name);
      }
      if (user.profile?.dateOfBirth) {
        try {
          const dob = new Date(user.profile.dateOfBirth);
          if (!isNaN(dob.getTime())) {
            setDateOfBirth(dob.toISOString().split('T')[0]);
          }
        } catch (e) {}
      }
      if ((user.profile as any)?.gender) {
        setGender((user.profile as any).gender);
      }
      if (user.profile?.preferredLanguage) {
        setSelectedLanguage(user.profile.preferredLanguage);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!preferredName.trim()) {
        setError('Please enter your preferred name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!consentAcknowledged) {
        setError('Please acknowledge the boundaries and consent before proceeding.');
        return;
      }

      setIsSubmitting(true);
      setLanguage(selectedLanguage as any);
      const payload: any = {
        preferredName: preferredName.trim(),
        preferredLanguage: selectedLanguage,
        gender: gender.trim(),
        consentAcknowledged: true,
        termsAccepted: true,
        currentStep: 3,
        isOnboardingComplete: true,
      };
      if (dateOfBirth) {
        payload.dateOfBirth = new Date(dateOfBirth).toISOString();
      }
      const res = await updateOnboarding(payload);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Could not complete onboarding.');
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="onboarding-page-bg">
      {/* Background Soft Organic Waves */}
      <div className="onboarding-waves-bg" aria-hidden="true">
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="onboarding-wave-svg"
        >
          <path
            d="M0 240 C360 120, 680 340, 1040 220 C1260 150, 1380 230, 1440 250 L1440 900 L0 900 Z"
            fill="#eaf3fa"
            fillOpacity="0.85"
          />
          <path
            d="M0 310 C300 220, 600 420, 960 290 C1200 200, 1360 310, 1440 320 L1440 900 L0 900 Z"
            fill="#dbeaf7"
            fillOpacity="0.55"
          />
          <path
            d="M0 400 C380 330, 720 450, 1100 360 C1280 310, 1390 380, 1440 390 L1440 900 L0 900 Z"
            fill="#d0e4f5"
            fillOpacity="0.4"
          />
        </svg>
      </div>

      {/* Top Navigation: Logo, Stepper, and Save & Exit */}
      <header className="onboarding-top-nav">
        <div className="onboarding-nav-logo">
          <Logo variant="dark" linkTo="/" size="md" />
        </div>

        {/* Stepper with horizontally aligned circles & connecting lines */}
        <div className="onboarding-stepper">
          {/* Step 1: About you */}
          <div className="onboarding-step-unit">
            <div
              className={`onboarding-step-circle ${
                step === 1 ? 'active' : step > 1 ? 'completed' : 'upcoming'
              }`}
            >
              {step > 1 ? <Icon name="Check" size={15} color="#ffffff" /> : '1'}
            </div>
            <span
              className={`onboarding-step-label ${
                step === 1 ? 'active' : step > 1 ? 'completed' : 'upcoming'
              }`}
            >
              About you
            </span>
          </div>

          <div className={`onboarding-stepper-line ${step > 1 ? 'completed' : ''}`} />

          {/* Step 2: Your experience */}
          <div className="onboarding-step-unit">
            <div
              className={`onboarding-step-circle ${
                step === 2 ? 'active' : step > 2 ? 'completed' : 'upcoming'
              }`}
            >
              {step > 2 ? <Icon name="Check" size={15} color="#ffffff" /> : '2'}
            </div>
            <span
              className={`onboarding-step-label ${
                step === 2 ? 'active' : step > 2 ? 'completed' : 'upcoming'
              }`}
            >
              Your experience
            </span>
          </div>

          <div className={`onboarding-stepper-line ${step > 2 ? 'completed' : ''}`} />

          {/* Step 3: Preferences */}
          <div className="onboarding-step-unit">
            <div
              className={`onboarding-step-circle ${
                step === 3 ? 'active' : 'upcoming'
              }`}
            >
              3
            </div>
            <span
              className={`onboarding-step-label ${
                step === 3 ? 'active' : 'upcoming'
              }`}
            >
              Preferences
            </span>
          </div>
        </div>

        {/* Save & Exit Button */}
        <div className="onboarding-save-exit-wrap">
          <Link to="/dashboard" className="onboarding-save-exit-btn">
            <Icon name="LogOut" size={16} className="onboarding-exit-icon" />
            <span>Save & exit</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="onboarding-container">
        {/* Left Side: Editorial Typography & Feature Pill Cards */}
        <div className="onboarding-left-section">
          <span className="onboarding-eyebrow">STEP {step} OF 3</span>
          <h1 className="onboarding-main-title">
            {step === 1 && "Let's get to know you."}
            {step === 2 && "Speak in your comfort."}
            {step === 3 && "Safe & mindful care."}
          </h1>
          <p className="onboarding-subtitle-desc">
            {step === 1 &&
              "This helps us personalize your experience and create a more meaningful conversation for you."}
            {step === 2 &&
              "Choose the language you express yourself best in. You can change this before every conversation."}
            {step === 3 &&
              "Understanding boundaries ensures Triora is the right supportive preparation tool for you."}
          </p>

          {/* Value Prop Cards */}
          <div className="onboarding-features-list">
            <div className="onboarding-feature-item">
              <div className="onboarding-feature-icon-box">
                <Icon name="Shield" size={20} />
              </div>
              <div>
                <h3 className="onboarding-feature-title">Private & secure</h3>
                <p className="onboarding-feature-desc">Your information stays confidential.</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <div className="onboarding-feature-icon-box">
                <Icon name="HeartHandshake" size={20} />
              </div>
              <div>
                <h3 className="onboarding-feature-title">A more personalized experience</h3>
                <p className="onboarding-feature-desc">Helps us understand your needs better.</p>
              </div>
            </div>

            <div className="onboarding-feature-item">
              <div className="onboarding-feature-icon-box">
                <Icon name="Users" size={20} />
              </div>
              <div>
                <h3 className="onboarding-feature-title">Take your time</h3>
                <p className="onboarding-feature-desc">There's no rush. You can always save and continue later.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Floating Card */}
        <div className="onboarding-card">
          {error && (
            <div style={{ marginBottom: '1.25rem' }}>
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="onboarding-form">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <h2 className="onboarding-card-title">Tell us a bit about your self.</h2>
                <p className="onboarding-card-subtitle">
                  We use this information to personalize your experience.
                </p>

                {/* Preferred Name */}
                <div className="onboarding-form-group">
                  <label className="onboarding-form-label" htmlFor="onboarding-name">
                    <span>Preferred name</span>
                    <span className="onboarding-required-star">*</span>
                  </label>
                  <div className="onboarding-input-box">
                    <Icon name="User" size={18} className="onboarding-input-icon" />
                    <input
                      id="onboarding-name"
                      type="text"
                      className="onboarding-input-field"
                      placeholder="e.g. Alex"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="onboarding-form-group">
                  <label className="onboarding-form-label" htmlFor="onboarding-dob">
                    <span>Date of Birth</span>
                    <span className="onboarding-required-star">*</span>
                  </label>
                  <div className="onboarding-input-box">
                    <Icon name="Calendar" size={18} className="onboarding-input-icon" />
                    <input
                      id="onboarding-dob"
                      type="date"
                      className="onboarding-input-field onboarding-dob-input"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="onboarding-form-group">
                  <label className="onboarding-form-label" htmlFor="onboarding-gender">
                    <span>Gender</span>
                    <span className="onboarding-required-star">*</span>
                  </label>
                  <div className="onboarding-select-box">
                    <Icon name="User" size={18} className="onboarding-input-icon" />
                    <select
                      id="onboarding-gender"
                      className="onboarding-select-field"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="other">Other</option>
                    </select>
                    <Icon name="ChevronDown" size={16} className="onboarding-select-chevron" />
                  </div>
                </div>

                {/* Submit Row: Right-aligned Continue Button */}
                <div className="onboarding-btn-row single">
                  <button type="submit" className="onboarding-continue-button">
                    <span>Continue</span>
                    <span className="onboarding-arrow-circle">
                      <Icon name="ArrowRight" size={14} color="#ffffff" />
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Language Preference */}
            {step === 2 && (
              <>
                <h2 className="onboarding-card-title">Which language feels most comfortable?</h2>
                <p className="onboarding-card-subtitle">
                  You can change this before every conversation.
                </p>

                <div className="onboarding-lang-grid">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                      <div
                        key={lang.code}
                        className={`onboarding-lang-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedLanguage(lang.code)}
                      >
                        <div>
                          <span style={{ fontSize: '1rem', color: isSelected ? '#0b66c2' : '#0a192f', fontWeight: isSelected ? 700 : 500 }}>
                            {lang.native}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: '0.45rem' }}>
                            ({lang.name})
                          </span>
                        </div>
                        {isSelected && <Icon name="Check" size={18} color="#0b66c2" />}
                      </div>
                    );
                  })}
                </div>

                <div className="onboarding-btn-row double">
                  <button type="button" onClick={handleBack} className="onboarding-back-button">
                    <Icon name="ArrowLeft" size={16} />
                    <span>Back</span>
                  </button>
                  <button type="submit" className="onboarding-continue-button">
                    <span>Continue</span>
                    <span className="onboarding-arrow-circle">
                      <Icon name="ArrowRight" size={14} color="#ffffff" />
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Boundaries & Consent */}
            {step === 3 && (
              <>
                <h2 className="onboarding-card-title">A few important boundaries.</h2>
                <p className="onboarding-card-subtitle">
                  Understanding how Triora works with you.
                </p>

                <div className="onboarding-boundary-box">
                  <div className="onboarding-boundary-title">
                    <Icon name="Shield" size={19} color="#0b66c2" />
                    <span>Triora helps you prepare—it does not diagnose.</span>
                  </div>
                  <p className="onboarding-boundary-desc">
                    Your summary may help a therapist understand your experience, but it isn’t medical advice or emergency support.
                  </p>
                </div>

                <label className="onboarding-consent-card">
                  <input
                    type="checkbox"
                    className="onboarding-consent-checkbox"
                    checked={consentAcknowledged}
                    onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.92rem', color: '#0a192f', lineHeight: 1.45 }}>
                    I understand that Triora is a private preparation tool, not a clinical assessment or crisis hotline.
                  </span>
                </label>

                <div className="onboarding-emergency-box">
                  <strong style={{ color: '#0a192f' }}>Emergency Notice:</strong> If you are in distress or experiencing a crisis, please reach out to professional emergency services or national crisis hotlines immediately.
                </div>

                <div className="onboarding-btn-row double">
                  <button type="button" onClick={handleBack} className="onboarding-back-button">
                    <Icon name="ArrowLeft" size={16} />
                    <span>Back</span>
                  </button>
                  <button type="submit" className="onboarding-continue-button" disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Entering space...' : 'Complete & enter space'}</span>
                    <span className="onboarding-arrow-circle">
                      <Icon name="ArrowRight" size={14} color="#ffffff" />
                    </span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
