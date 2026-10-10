import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/auth.css';

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

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      if (!preferredName.trim()) {
        setError('Please enter a name so we know how to address you.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!consentAcknowledged) {
        setError('Please acknowledge the terms and consent before proceeding.');
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

  const progressPercent = (step / 3) * 100;

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Logo linkTo="" />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span className="onboarding-step-indicator">Step {step} of 3</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/dashboard" style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>
            Save & exit
          </Link>
        </div>
      </header>

      <div className="onboarding-progress-bar-track">
        <div
          className="onboarding-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <main className="onboarding-content-card">
        {error && <ErrorMessage message={error} />}

        {step === 1 && (
          <div>
            <p className="auth-kicker">LET’S GET TO KNOW YOU</p>
            <h1 className="auth-title">Tell us a bit about yourself.</h1>
            <p className="auth-subtitle">
              We use this information to personalize your experience.
            </p>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label" htmlFor="preferredName">Preferred name</label>
              <input
                id="preferredName"
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                className="form-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="auth-kicker">SPEAK NATURALLY</p>
            <h1 className="auth-title">Which language feels most comfortable?</h1>
            <p className="auth-subtitle">
              You can change this before every conversation.
            </p>

            <div className="language-grid">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    className={`language-card-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <div>
                      <span style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{lang.native}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>
                        ({lang.name})
                      </span>
                    </div>
                    {isSelected && <Icon name="Check" size={18} color="var(--green)" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="auth-kicker">BEFORE WE BEGIN</p>
            <h1 className="auth-title">A few important boundaries.</h1>

            <div className="boundary-notice-box">
              <div className="boundary-title">
                <Icon name="Shield" size={20} />
                <span>Triora helps you prepare—it does not diagnose.</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.6, marginTop: '0.5rem' }}>
                Your summary may help a therapist understand your experience, but it isn’t medical advice or emergency support.
              </p>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={(e) => setConsentAcknowledged(e.target.checked)}
              />
              <span>
                I understand that Triora is a private preparation tool, not a clinical assessment or crisis hotline.
              </span>
            </label>

            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--muted)',
                backgroundColor: 'var(--paper)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                marginTop: '1rem',
              }}
            >
              <strong style={{ color: 'var(--ink)' }}>Emergency Notice:</strong> If you are in distress or experiencing a crisis, please reach out to professional emergency services or national crisis hotlines immediately.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button variant="primary" onClick={handleNext} isLoading={isSubmitting}>
            {step === 3 ? 'Complete & enter space' : 'Continue'}
          </Button>
        </div>
      </main>
    </div>
  );
};
