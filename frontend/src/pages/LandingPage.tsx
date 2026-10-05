import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="landing-container">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div>
          <span className="hero-eyebrow">{t.heroEyebrow}</span>
          <h1 className="hero-title">
            {t.heroTitleLine1} <br />
            <span className="editorial-italic">{t.heroTitleLine2}</span>
          </h1>
          <p className="hero-subtitle">
            {t.heroSubtitle}
          </p>
          <div className="hero-ctas">
            <Link to="/signup">
              <Button size="lg" variant="primary">{t.startConversation}</Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" icon={<Icon name="PlayCircle" size={20} />}>
                {t.seeHowItWorks}
              </Button>
            </a>
          </div>
          <div className="hero-trust-indicators">
            <div className="trust-item">
              <Icon name="ShieldCheck" size={16} color="var(--sage)" />
              <span>{t.encryptedAndPrivate}</span>
            </div>
            <div className="trust-item">
              <Icon name="CheckCircle" size={16} color="var(--sage)" />
              <span>{t.noDiagnosis}</span>
            </div>
            <div className="trust-item">
              <Icon name="Lock" size={16} color="var(--sage)" />
              <span>{t.youControlSharing}</span>
            </div>
          </div>
        </div>

        {/* Hero Desktop Visual */}
        <div className="hero-visual-wrapper">
          <div className="hero-orb-bg" />
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-card-status">
                <span className="pulse-dot" />
                <span>{t.conversationInProgress}</span>
              </div>
              <span className="hero-card-timer">08:42</span>
            </div>

            <div className="hero-waveform-sim">
              <div className="wave-bar" style={{ animationDelay: '0.1s' }} />
              <div className="wave-bar" style={{ animationDelay: '0.3s' }} />
              <div className="wave-bar" style={{ animationDelay: '0.5s' }} />
              <div className="wave-bar" style={{ animationDelay: '0.2s' }} />
              <div className="wave-bar" style={{ animationDelay: '0.4s' }} />
              <div className="wave-bar" style={{ animationDelay: '0.6s' }} />
              <div className="wave-bar" style={{ animationDelay: '0.15s' }} />
            </div>

            <div className="hero-card-question">
              {t.heroCardQuestion}
            </div>

            <div className="hero-card-bottom">
              <div className="hero-mic-circle">
                <Icon name="Mic" size={20} />
              </div>
              <div className="hero-listening-text">
                <p>{t.listening}</p>
                <p>{t.speakNaturally}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Statement Section */}
      <section className="statement-section">
        <p className="statement-kicker">{t.statementKicker}</p>
        <h2 className="statement-heading">
          {t.statementHeadingLine1} <br />
          <span className="editorial-italic">{t.statementHeadingLine2}</span>
        </h2>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <p className="section-eyebrow">{t.howItWorksEyebrow}</p>
        <h2 className="section-title">
          {t.howItWorksTitleLine1} <br />
          <span className="editorial-italic">{t.howItWorksTitleLine2}</span>
        </h2>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon-circle">
              <Icon name="Volume2" size={24} />
            </div>
            <h3 className="step-title">{t.step1Title}</h3>
            <p className="step-desc">
              {t.step1Desc}
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon-circle">
              <Icon name="Sparkles" size={24} />
            </div>
            <h3 className="step-title">{t.step2Title}</h3>
            <p className="step-desc">
              {t.step2Desc}
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon-circle">
              <Icon name="Share2" size={24} />
            </div>
            <h3 className="step-title">{t.step3Title}</h3>
            <p className="step-desc">
              {t.step3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Multilingual Section */}
      <section className="language-section">
        <div className="language-container">
          <div>
            <p className="section-eyebrow">{t.multilingualEyebrow}</p>
            <h2 className="section-title">
              {t.multilingualTitleLine1} <br />
              <span className="editorial-italic">{t.multilingualTitleLine2}</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              {t.multilingualDesc}
            </p>
            <div className="lang-tags">
              <span className="lang-tag">English</span>
              <span className="lang-tag">हिन्दी</span>
              <span className="lang-tag">ಕನ್ನಡ</span>
              <span className="lang-tag">தமிழ்</span>
              <span className="lang-tag">తెలుగు</span>
              <span className="lang-tag">മലയാളം</span>
              <span className="lang-tag">मराठी</span>
              <span className="lang-tag">বাংলা</span>
            </div>
          </div>

          <div className="ring-visualization">
            <div className="concentric-ring ring-1" />
            <div className="concentric-ring ring-2" />
            <div className="concentric-ring ring-3" />
            <div className="ring-center-mic">
              <Icon name="Mic" size={26} />
            </div>
            <span className="ring-word w-1">मन</span>
            <span className="ring-word w-2">ಮನಸ್ಸು</span>
            <span className="ring-word w-3">மனம்</span>
            <span className="ring-word w-4">mind</span>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="privacy-section">
        <p className="section-eyebrow">{t.privacyEyebrow}</p>
        <h2 className="section-title">
          {t.privacyTitle}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '600px' }}>
          {t.privacySubtitle}
        </p>

        <div className="privacy-grid">
          <div className="privacy-card">
            <div className="privacy-icon">
              <Icon name="Lock" size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.privacyCard1Title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {t.privacyCard1Desc}
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <Icon name="Key" size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.privacyCard2Title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {t.privacyCard2Desc}
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <Icon name="ShieldCheck" size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.privacyCard3Title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {t.privacyCard3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2 className="final-cta-heading">
          {t.finalCtaTitleLine1} <br />
          <span className="editorial-italic" style={{ color: 'var(--peach)' }}>{t.finalCtaTitleLine2}</span>
        </h2>
        <p className="final-cta-sub">{t.finalCtaSub}</p>
        <Link to="/signup">
          <Button variant="white" size="lg">{t.beginConversation}</Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
};
