import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedLang, setSelectedLang] = React.useState<string>('en');

  return (
    <div className="landing-container">
      {/* Top Hero Wrapper with Botanical Background */}
      <div className="hero-wrapper-bg">
        <Header />

        {/* Hero Section */}
        <section className="hero-section">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="hero-left-content">
            <div className="hero-eyebrow-pill">
              <span>A CALMER FIRST STEP</span>
            </div>

            <h1 className="hero-main-title">
              Find the words<br />
              <span className="hero-title-italic">before therapy.</span>
            </h1>

            <p className="hero-subtitle">
              A private, voice-first conversation that helps you understand what you’re feeling—and gives your therapist a clearer place to begin.
            </p>

            <div className="hero-ctas">
              <Link to="/signup" className="hero-btn-primary">
                <span>Start conversation</span>
                <Icon name="ArrowRight" size={17} />
              </Link>
              <a href="#how-it-works" className="hero-btn-secondary">
                <span className="hero-play-icon-circle">
                  <Icon name="Play" size={12} />
                </span>
                <span>See how it works</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="hero-trust-indicators">
              <div className="trust-item">
                <Icon name="Lock" size={16} color="#143d2f" />
                <span>Private & secure</span>
              </div>
              <span className="trust-divider">|</span>
              <div className="trust-item">
                <Icon name="ShieldCheck" size={17} color="#143d2f" />
                <span>No judgement, ever</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Floating Tablet Visual with 4 Floating Feature Badges */}
          <div className="hero-visual-wrapper">
            <div className="hero-tablet-stage">
              {/* Floating Badge 1: Top-Left (Speak naturally) */}
              <div className="hero-floating-badge badge-top-left">
                <div className="floating-badge-icon icon-circle-peach">
                  <Icon name="Heart" size={17} />
                </div>
                <div>
                  <h4 className="floating-badge-title">Speak naturally</h4>
                  <p className="floating-badge-desc">There’s no right answer.</p>
                </div>
              </div>

              {/* Floating Badge 2: Bottom-Left (See your patterns) */}
              <div className="hero-floating-badge badge-bottom-left">
                <div className="floating-badge-icon icon-circle-blue">
                  <Icon name="BarChart2" size={17} />
                </div>
                <div>
                  <h4 className="floating-badge-title">See your patterns</h4>
                  <p className="floating-badge-desc">Get a clear summary.</p>
                </div>
              </div>

              {/* Floating Badge 3: Top-Right (Share with your therapist) */}
              <div className="hero-floating-badge badge-top-right">
                <div className="floating-badge-icon icon-circle-purple">
                  <Icon name="Users" size={17} />
                </div>
                <div>
                  <h4 className="floating-badge-title">Share with your therapist</h4>
                  <p className="floating-badge-desc">On your own terms.</p>
                </div>
              </div>

              {/* Floating Badge 4: Bottom-Right (Take your time) */}
              <div className="hero-floating-badge badge-bottom-right">
                <div className="floating-badge-icon icon-circle-mint">
                  <Icon name="Clock" size={17} />
                </div>
                <div>
                  <h4 className="floating-badge-title">Take your time</h4>
                  <p className="floating-badge-desc">You can pause and continue later.</p>
                </div>
              </div>

              {/* Tablet Chassis Frame */}
              <div className="hero-tablet-device">
                {/* Device Status Bar */}
                <div className="hero-card-header">
                  <div className="hero-card-status">
                    <span className="pulse-dot" />
                    <span>Conversation in progress</span>
                  </div>
                  <span className="hero-card-timer">08:42</span>
                </div>

                {/* Central Waveform Visualizer */}
                <div className="hero-waveform-orb">
                  <div className="hero-waveform-bars">
                    <div className="wave-bar bar-1" />
                    <div className="wave-bar bar-2" />
                    <div className="wave-bar bar-3" />
                    <div className="wave-bar bar-4" />
                    <div className="wave-bar bar-5" />
                    <div className="wave-bar bar-6" />
                    <div className="wave-bar bar-7" />
                  </div>
                </div>

                {/* Therapist Question Bubble */}
                <div className="hero-card-question">
                  “What has been feeling heaviest lately?”
                </div>

                {/* Mic Bar */}
                <div className="hero-card-bottom-mic-row">
                  <div className="soundwave-lines left-lines">
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                  </div>

                  <div className="hero-mic-circle">
                    <Icon name="Mic" size={20} />
                  </div>

                  <div className="soundwave-lines right-lines">
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                    <span className="sw-bar" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Pillar Bottom Ribbon */}
        <div className="hero-feature-ribbon">
          <div className="ribbon-pillar-item">
            <div className="ribbon-icon-circle icon-circle-green">
              <Icon name="Lock" size={18} />
            </div>
            <div>
              <h4 className="ribbon-title">Your privacy, our priority</h4>
              <p className="ribbon-desc">Your conversations are encrypted and stay yours.</p>
            </div>
          </div>

          <div className="ribbon-pillar-item">
            <div className="ribbon-icon-circle icon-circle-peach">
              <Icon name="Heart" size={18} />
            </div>
            <div>
              <h4 className="ribbon-title">Built for your well-being</h4>
              <p className="ribbon-desc">Designed to support your mental health journey.</p>
            </div>
          </div>

          <div className="ribbon-pillar-item">
            <div className="ribbon-icon-circle icon-circle-blue">
              <Icon name="Users" size={18} />
            </div>
            <div>
              <h4 className="ribbon-title">A more meaningful conversation</h4>
              <p className="ribbon-desc">Your responses help your therapist understand you better.</p>
            </div>
          </div>

          <div className="ribbon-pillar-item">
            <div className="ribbon-icon-circle icon-circle-leaf">
              <Icon name="Sprout" size={18} />
            </div>
            <div>
              <h4 className="ribbon-title">Available in your language</h4>
              <p className="ribbon-desc">Triora supports 8+ Indian languages for a more natural experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section with Botanical Blended Background */}
      <section id="how-it-works" className="how-it-works-wrapper-bg">
        <div className="how-it-works-container">
          {/* Subtle Decorative Dot Matrix */}
          <div className="how-dot-matrix-accent" aria-hidden="true" />

          {/* Heading Block */}
          <div className="how-heading-block">
            <span className="how-eyebrow">HOW IT WORKS</span>
            <h2 className="how-main-title">
              Three gentle steps.<br />
              <span className="how-title-italic">One clearer beginning.</span>
            </h2>
            <p className="how-subtitle">
              A simple, private, and supportive process to help you open up, understand yourself, and move forward.
            </p>
          </div>

          {/* Cards Row with Flowing Connectors */}
          <div className="how-steps-stage">
            <div className="how-steps-grid">
              {/* Card 1: Speak freely */}
              <div className="how-card">
                <div className="how-card-num-pill num-pill-green">
                  <span>01</span>
                </div>

                <div className="how-card-visual visual-step-1">
                  {/* Subtle inner wave contour */}
                  <svg className="how-card1-backdrop-wave" viewBox="0 0 240 40" fill="none" aria-hidden="true">
                    <path d="M 0 32 C 60 32, 80 12, 120 12 C 160 12, 180 34, 240 22" stroke="rgba(164, 210, 186, 0.5)" strokeWidth="1.75" />
                  </svg>

                  {/* Left soundwave lines */}
                  <div className="how-wave-bars wave-left">
                    <span className="h-bar h-1" />
                    <span className="h-bar h-2" />
                    <span className="h-bar h-3" />
                    <span className="h-bar h-4" />
                    <span className="h-bar h-5" />
                  </div>

                  {/* Center Mic Orb with Sparkles */}
                  <div className="how-mic-orb-wrapper">
                    <div className="how-sparkle-rays" aria-hidden="true">
                      <span className="s-ray ray-left" />
                      <span className="s-ray ray-center" />
                      <span className="s-ray ray-right" />
                    </div>
                    <div className="how-mic-halo">
                      <div className="how-mic-circle">
                        <Icon name="Mic" size={22} color="#ffffff" />
                      </div>
                    </div>
                  </div>

                  {/* Right soundwave lines */}
                  <div className="how-wave-bars wave-right">
                    <span className="h-bar h-5" />
                    <span className="h-bar h-4" />
                    <span className="h-bar h-3" />
                    <span className="h-bar h-2" />
                    <span className="h-bar h-1" />
                  </div>
                </div>

                <h3 className="how-card-title">Speak freely</h3>
                <p className="how-card-desc">
                  Have an open-ended voice conversation in the language that feels most natural. There’s no right or wrong answer.
                </p>

                {/* Flow connector bridge to Card 2 */}
                <div className="how-card-connector-bridge bridge-to-card-2" aria-hidden="true">
                  <svg viewBox="0 0 64 36" fill="none" preserveAspectRatio="none" className="connector-wave-svg">
                    <circle cx="2" cy="18" r="3.5" fill="#143d2f" />
                    <path
                      d="M 2 18 C 18 2, 38 34, 62 18"
                      stroke="#1e543e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="62" cy="18" r="3.5" fill="#143d2f" />
                  </svg>
                </div>
              </div>

              {/* Card 2: See the patterns */}
              <div className="how-card">
                <div className="how-card-num-pill num-pill-peach">
                  <span>02</span>
                </div>

                <div className="how-card-visual visual-step-2">
                  <div className="how-patterns-mockup">
                    {/* Floating Sparkle Stars */}
                    <span className="how-star-sparkle star-1" aria-hidden="true">✦</span>
                    <span className="how-star-sparkle star-2" aria-hidden="true">✦</span>

                    {/* Stacked background summary cards */}
                    <div className="how-stacked-card stack-back-top">
                      <div className="mock-bar bar-long" />
                      <div className="mock-bar bar-short" />
                    </div>
                    <div className="how-stacked-card stack-back-bottom">
                      <div className="mock-bar bar-med" />
                      <div className="mock-bar bar-short" />
                    </div>

                    {/* Front Brain Focus Card */}
                    <div className="how-brain-focus-card">
                      <div className="how-brain-icon-box">
                        <Icon name="Brain" size={24} color="#1e563e" />
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="how-card-title">See the patterns</h3>
                <p className="how-card-desc">
                  Triora organizes what you share into themes, context, and what matters most to you—so you can see things more clearly.
                </p>

                {/* Flow connector bridge to Card 3 */}
                <div className="how-card-connector-bridge bridge-to-card-3" aria-hidden="true">
                  <svg viewBox="0 0 64 36" fill="none" preserveAspectRatio="none" className="connector-wave-svg">
                    <circle cx="2" cy="18" r="3.5" fill="#143d2f" />
                    <path
                      d="M 2 18 C 18 34, 38 2, 62 18"
                      stroke="#1e543e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="62" cy="18" r="3.5" fill="#143d2f" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Share on your terms */}
              <div className="how-card">
                <div className="how-card-num-pill num-pill-blue">
                  <span>03</span>
                </div>

                <div className="how-card-visual visual-step-3">
                  <div className="how-share-mockup">
                    {/* Document summary sheet */}
                    <div className="how-summary-sheet">
                      <div className="how-sheet-leaf-badge">
                        <Icon name="Leaf" size={13} color="#1b4d3e" />
                      </div>
                      <div className="how-sheet-lines">
                        <div className="sheet-line line-title" />
                        <div className="sheet-line line-full" />
                        <div className="sheet-line line-full" />
                        <div className="sheet-line line-half" />
                      </div>
                    </div>

                    {/* 3 Action Pill Tags */}
                    <div className="how-action-tags-list">
                      <div className="how-action-tag">
                        <Icon name="Download" size={12} color="#143d2f" />
                        <span>Download</span>
                      </div>
                      <div className="how-action-tag">
                        <Icon name="Users" size={12} color="#143d2f" />
                        <span>Share with therapist</span>
                      </div>
                      <div className="how-action-tag">
                        <Icon name="Lock" size={12} color="#143d2f" />
                        <span>Keep private</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="how-card-title">Share on your terms</h3>
                <p className="how-card-desc">
                  Review your summary first. Download it or share it with your therapist when you’re ready. You stay in control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Conversation Section with Blended Botanical Background */}
      <section className="multilingual-section-wrapper">
        <div className="multilingual-container">
          {/* Left Column: Headlines, Language Pills Grid & CTA */}
          <div className="multilingual-left-content">
            <div className="multilingual-eyebrow-pill">
              <span>{t.multilingualEyebrow || 'MULTILINGUAL CONVERSATION'}</span>
            </div>

            <h2 className="multilingual-main-title">
              {t.multilingualTitleLine1 || 'Your language.'}<br />
              <span className="multilingual-title-italic">
                {t.multilingualTitleLine2 || 'Your pace. Your story.'}
              </span>
            </h2>

            <p className="multilingual-description">
              {t.multilingualDesc ||
                'Expressing emotions is easier in the words closest to home. Triora supports eight Indian languages, with a patient listener that never rushes or interrupts.'}
            </p>

            {/* 8 Language Selector Pills (2 rows of 4) */}
            <div className="multilingual-pills-grid">
              {[
                { code: 'en', name: 'English', badge: null, badgeBg: '#eaf5ee', badgeColor: '#1e563e' },
                { code: 'hi', name: 'हिन्दी', badge: 'अ', badgeBg: '#fef2e6', badgeColor: '#ea580c' },
                { code: 'kn', name: 'ಕನ್ನಡ', badge: 'ಅ', badgeBg: '#e0f2fe', badgeColor: '#0284c7' },
                { code: 'ta', name: 'தமிழ்', badge: 'அ', badgeBg: '#fce7f3', badgeColor: '#db2777' },
                { code: 'te', name: 'తెలుగు', badge: 'అ', badgeBg: '#fef3c7', badgeColor: '#d97706' },
                { code: 'ml', name: 'മലയാളം', badge: 'അ', badgeBg: '#dcfce7', badgeColor: '#16a34a' },
                { code: 'mr', name: 'मराठी', badge: 'अ', badgeBg: '#ffedd5', badgeColor: '#ea580c' },
                { code: 'bn', name: 'বাংলা', badge: 'অ', badgeBg: '#ccfbf1', badgeColor: '#0d9488' },
              ].map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLang(lang.code)}
                    className={`multilingual-lang-pill ${isSelected ? 'pill-active' : ''}`}
                  >
                    {lang.badge ? (
                      <span
                        className="lang-pill-badge"
                        style={{ backgroundColor: lang.badgeBg, color: lang.badgeColor }}
                      >
                        {lang.badge}
                      </span>
                    ) : (
                      <span className="lang-pill-badge badge-globe">
                        <Icon name="Globe" size={13} color="#164030" />
                      </span>
                    )}
                    <span className="lang-pill-name">{lang.name}</span>
                  </button>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="multilingual-cta-row">
              <Link to="/signup" className="multilingual-cta-btn">
                <span>Start in your language</span>
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>

            {/* Footnote */}
            <p className="multilingual-footnote">More languages coming soon.</p>
          </div>

          {/* Right Column: 360° Orbiting Language Visualization */}
          <div className="multilingual-right-visual">
            <div className="orbit-stage">
              {/* Concentric rings & colored orbital dots SVG */}
              <svg className="orbit-rings-svg" viewBox="0 0 500 500" fill="none" aria-hidden="true">
                {/* Outer soft ambient ripple */}
                <circle cx="250" cy="250" r="220" fill="rgba(215, 246, 230, 0.28)" stroke="rgba(110, 185, 148, 0.5)" strokeWidth="1.25" />
                {/* Main dashed orbit track with soft tint */}
                <circle cx="250" cy="250" r="160" fill="rgba(195, 240, 218, 0.38)" stroke="#388e63" strokeWidth="2" strokeDasharray="5 7" />
                {/* Inner radiant ripple disc */}
                <circle cx="250" cy="250" r="95" fill="rgba(175, 235, 205, 0.55)" stroke="rgba(50, 150, 100, 0.65)" strokeWidth="1.5" />

                {/* Colored anchor dots on the dashed orbit track */}
                <circle cx="305" cy="98" r="4.5" fill="#ea580c" />
                <circle cx="385" cy="165" r="4.5" fill="#7c3aed" />
                <circle cx="408" cy="242" r="4.5" fill="#0284c7" />
                <circle cx="370" cy="335" r="4.5" fill="#dc2626" />
                <circle cx="270" cy="408" r="4.5" fill="#16a34a" />
                <circle cx="135" cy="355" r="4.5" fill="#db2777" />
                <circle cx="92" cy="250" r="4.5" fill="#d97706" />
                <circle cx="150" cy="138" r="4.5" fill="#1e563e" />
              </svg>

              {/* Center Mic Orb with Pulsing Halo */}
              <div className="orbit-center-wrapper">
                <div className="orbit-center-halo" />
                <div className="orbit-center-mic-btn">
                  <Icon name="Mic" size={28} color="#ffffff" />
                </div>
              </div>

              {/* 8 Orbiting Speech Capsules (around 360°) */}
              {/* 1. English (Top-Left) */}
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`orbit-speech-capsule capsule-en ${selectedLang === 'en' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-en">
                  <span className="ob-bar h-1" />
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-2" />
                  <span className="ob-bar h-4" />
                </div>
                <span className="orbit-capsule-text">English</span>
              </button>

              {/* 2. Hindi (Top) */}
              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`orbit-speech-capsule capsule-hi ${selectedLang === 'hi' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-hi">
                  <span className="ob-bar h-2" />
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-1" />
                </div>
                <span className="orbit-capsule-text">हिन्दी</span>
              </button>

              {/* 3. Tamil (Top-Right) */}
              <button
                type="button"
                onClick={() => setSelectedLang('ta')}
                className={`orbit-speech-capsule capsule-ta ${selectedLang === 'ta' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-ta">
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-1" />
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-2" />
                </div>
                <span className="orbit-capsule-text">தமிழ்</span>
              </button>

              {/* 4. Telugu (Mid-Right) */}
              <button
                type="button"
                onClick={() => setSelectedLang('te')}
                className={`orbit-speech-capsule capsule-te ${selectedLang === 'te' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-te">
                  <span className="ob-bar h-1" />
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-2" />
                  <span className="ob-bar h-3" />
                </div>
                <span className="orbit-capsule-text">తెలుగు</span>
              </button>

              {/* 5. Bengali (Bottom-Right) */}
              <button
                type="button"
                onClick={() => setSelectedLang('bn')}
                className={`orbit-speech-capsule capsule-bn ${selectedLang === 'bn' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-bn">
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-1" />
                  <span className="ob-bar h-2" />
                </div>
                <span className="orbit-capsule-text">বাংলা</span>
              </button>

              {/* 6. Marathi (Bottom) */}
              <button
                type="button"
                onClick={() => setSelectedLang('mr')}
                className={`orbit-speech-capsule capsule-mr ${selectedLang === 'mr' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-mr">
                  <span className="ob-bar h-2" />
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-1" />
                </div>
                <span className="orbit-capsule-text">मराठी</span>
              </button>

              {/* 7. Malayalam (Bottom-Left) */}
              <button
                type="button"
                onClick={() => setSelectedLang('ml')}
                className={`orbit-speech-capsule capsule-ml ${selectedLang === 'ml' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-ml">
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-2" />
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-1" />
                </div>
                <span className="orbit-capsule-text">മലയാളം</span>
              </button>

              {/* 8. Kannada (Mid-Left) */}
              <button
                type="button"
                onClick={() => setSelectedLang('kn')}
                className={`orbit-speech-capsule capsule-kn ${selectedLang === 'kn' ? 'orbit-active' : ''}`}
              >
                <div className="orbit-audio-bars bar-kn">
                  <span className="ob-bar h-1" />
                  <span className="ob-bar h-3" />
                  <span className="ob-bar h-4" />
                  <span className="ob-bar h-2" />
                </div>
                <span className="orbit-capsule-text">ಕನ್ನಡ</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section with Blended Botanical Background */}
      <section id="privacy" className="privacy-section-wrapper">
        <div className="privacy-container">
          {/* Top Row: Left Content + Right 3D Glass Shield Visual */}
          <div className="privacy-hero-row">
            {/* Left Content */}
            <div className="privacy-left-content">
              <div className="privacy-eyebrow-pill">
                <span>{t.privacyEyebrow || 'PRIVACY BY DESIGN'}</span>
              </div>

              <h2 className="privacy-main-title">
                {t.privacyTitle || 'Your story stays yours.'}<br />
                <span className="privacy-title-italic">Safe, private, always.</span>
              </h2>

              <p className="privacy-subtitle">
                {t.privacySubtitle ||
                  'Your conversations are encrypted. Nothing is shared without your action, and you can delete your data at any time.'}
              </p>
            </div>

            {/* Right Visual: 3D Translucent Glass Shield on Pedestal with Floating Badges */}
            <div className="privacy-right-visual">
              <div className="privacy-shield-stage">
                {/* Floating Badges */}
                <div className="privacy-float-badge badge-top-left">
                  <div className="float-badge-icon">
                    <Icon name="Lock" size={13} color="#143d2f" />
                  </div>
                  <span>Your data stays private</span>
                </div>

                <div className="privacy-float-badge badge-top-right">
                  <div className="float-badge-icon">
                    <Icon name="User" size={13} color="#143d2f" />
                  </div>
                  <span>You’re always in control</span>
                </div>

                <div className="privacy-float-badge badge-bottom-right">
                  <div className="float-badge-icon">
                    <Icon name="Trash2" size={13} color="#143d2f" />
                  </div>
                  <span>Delete anytime</span>
                </div>

                {/* Sparkling Stars */}
                <span className="privacy-sparkle-star star-tl" aria-hidden="true">✦</span>
                <span className="privacy-sparkle-star star-tr" aria-hidden="true">✦</span>

                {/* Botanical Foliage behind shield */}
                <div className="privacy-stage-foliage foliage-left" aria-hidden="true">
                  <svg viewBox="0 0 100 120" width="100" height="120" fill="none">
                    <path d="M 85 110 C 65 75, 40 45, 15 15" stroke="#3d7e5f" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 15 15 C 20 2, 45 5, 40 25 C 35 45, 10 30, 15 15 Z" fill="#2d6e4f" opacity="0.85" />
                    <path d="M 45 45 C 58 35, 78 45, 68 62 C 58 79, 38 60, 45 45 Z" fill="#3d7e5f" opacity="0.8" />
                    <path d="M 68 78 C 82 72, 95 85, 85 98 C 75 111, 60 90, 68 78 Z" fill="#4d926f" opacity="0.75" />
                  </svg>
                </div>

                {/* 3D Glass Shield Assembly */}
                <div className="privacy-shield-assembly">
                  <svg className="privacy-shield-svg" viewBox="0 0 200 240" fill="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="shieldGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
                        <stop offset="35%" stopColor="#d1f4e2" stopOpacity="0.65" />
                        <stop offset="75%" stopColor="#8ee0b9" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#48be8c" stopOpacity="0.75" />
                      </linearGradient>
                      <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#287d58" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 100 15 C 135 15, 175 25, 185 45 C 185 130, 145 195, 100 225 C 55 195, 15 130, 15 45 C 25 25, 65 15, 100 15 Z"
                      fill="url(#shieldGlassGrad)"
                      stroke="url(#shieldBorderGrad)"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M 100 32 C 128 32, 160 40, 168 56 C 168 122, 136 175, 100 200 C 64 175, 32 122, 32 56 C 40 40, 72 32, 100 32 Z"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.75)"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Emerald Padlock in Center of Shield */}
                  <div className="privacy-center-padlock">
                    <div className="padlock-shackle" />
                    <div className="padlock-body">
                      <div className="padlock-keyhole" />
                    </div>
                  </div>
                </div>

                {/* Double-step Podium Base */}
                <div className="privacy-podium-base">
                  <div className="podium-step-top" />
                  <div className="podium-step-bottom" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Privacy Cards Grid */}
          <div className="privacy-cards-grid">
            {/* Card 1: Encrypted in transit and at rest */}
            <div className="privacy-card">
              <div className="privacy-card-header">
                <div className="privacy-card-num-pill num-pill-green">
                  <span>01</span>
                </div>
              </div>

              <div className="privacy-card-body">
                <div className="privacy-card-text">
                  <h3 className="privacy-card-title">{t.privacyCard1Title || 'Encrypted in transit and at rest'}</h3>
                  <p className="privacy-card-desc">
                    {t.privacyCard1Desc ||
                      'Industry-standard encryption guarantees that your private conversations remain strictly secure.'}
                  </p>
                </div>

                <div className="privacy-card-visual visual-card-1">
                  <div className="card-lock-ripple">
                    <div className="ripple-circle c-1" />
                    <div className="ripple-circle c-2" />
                    <div className="card-lock-box">
                      <div className="card-lock-shackle" />
                      <div className="card-lock-body">
                        <div className="card-lock-hole" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Short-lived speech tokens */}
            <div className="privacy-card">
              <div className="privacy-card-header">
                <div className="privacy-card-num-pill num-pill-peach">
                  <span>02</span>
                </div>
              </div>

              <div className="privacy-card-body">
                <div className="privacy-card-text">
                  <h3 className="privacy-card-title">{t.privacyCard2Title || 'Short-lived speech tokens'}</h3>
                  <p className="privacy-card-desc">
                    {t.privacyCard2Desc ||
                      'Audio processing uses temporary tokens that expire immediately after your conversation ends.'}
                  </p>
                </div>

                <div className="privacy-card-visual visual-card-2">
                  <div className="card-token-graphic">
                    <div className="token-sheet">
                      <div className="token-soundwaves">
                        <span className="tw-bar tw-1" />
                        <span className="tw-bar tw-2" />
                        <span className="tw-bar tw-3" />
                        <span className="tw-bar tw-4" />
                      </div>
                      <div className="token-lines">
                        <div className="tl-bar" />
                        <div className="tl-bar short" />
                      </div>
                    </div>
                    <div className="token-clock-badge">
                      <Icon name="Clock" size={16} color="#d97706" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Clear consent before sharing */}
            <div className="privacy-card">
              <div className="privacy-card-header">
                <div className="privacy-card-num-pill num-pill-blue">
                  <span>03</span>
                </div>
              </div>

              <div className="privacy-card-body">
                <div className="privacy-card-text">
                  <h3 className="privacy-card-title">{t.privacyCard3Title || 'Clear consent before sharing'}</h3>
                  <p className="privacy-card-desc">
                    {t.privacyCard3Desc ||
                      'Your summary is only accessible to you until you explicitly choose to export or send it to your therapist.'}
                  </p>
                </div>

                <div className="privacy-card-visual visual-card-3">
                  <div className="card-consent-graphic">
                    <div className="consent-sheet-back">
                      <div className="cs-line" />
                      <div className="cs-line" />
                    </div>
                    <div className="consent-user-avatar">
                      <Icon name="User" size={24} color="#1e563e" />
                      <div className="consent-check-badge">
                        <Icon name="Check" size={10} color="#ffffff" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
