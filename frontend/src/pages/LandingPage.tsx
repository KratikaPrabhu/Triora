import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div>
          <span className="hero-eyebrow">A calmer first step</span>
          <h1 className="hero-title">
            Find the words <br />
            <span className="editorial-italic">before therapy.</span>
          </h1>
          <p className="hero-subtitle">
            A private, voice-first reflection that helps you understand what you’re feeling—and gives your therapist a clearer place to begin.
          </p>
          <div className="hero-ctas">
            <Link to="/signup">
              <Button size="lg" variant="primary">Start a private reflection</Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" icon={<Icon name="PlayCircle" size={20} />}>
                See how it works
              </Button>
            </a>
          </div>
          <div className="hero-trust-indicators">
            <div className="trust-item">
              <Icon name="ShieldCheck" size={16} color="var(--sage)" />
              <span>Encrypted & private</span>
            </div>
            <div className="trust-item">
              <Icon name="CheckCircle" size={16} color="var(--sage)" />
              <span>No diagnosis</span>
            </div>
            <div className="trust-item">
              <Icon name="Lock" size={16} color="var(--sage)" />
              <span>You control sharing</span>
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
                <span>Reflection in progress</span>
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
              "What has been feeling heaviest lately?"
            </div>

            <div className="hero-card-bottom">
              <div className="hero-mic-circle">
                <Icon name="Mic" size={20} />
              </div>
              <div className="hero-listening-text">
                <p>Listening</p>
                <p>Speak naturally. There’s no right answer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Statement Section */}
      <section className="statement-section">
        <p className="statement-kicker">Starting therapy can feel overwhelming.</p>
        <h2 className="statement-heading">
          Triora helps you arrive <br />
          <span className="editorial-italic">already understood.</span>
        </h2>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <p className="section-eyebrow">HOW IT WORKS</p>
        <h2 className="section-title">
          Three gentle steps. <br />
          <span className="editorial-italic">One clearer beginning.</span>
        </h2>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon-circle">
              <Icon name="Volume2" size={24} />
            </div>
            <h3 className="step-title">Speak freely</h3>
            <p className="step-desc">
              Have an open-ended voice conversation in the language that feels most natural.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon-circle">
              <Icon name="Sparkles" size={24} />
            </div>
            <h3 className="step-title">See the patterns</h3>
            <p className="step-desc">
              Triora organizes what you shared into themes, context, and what matters most to you.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon-circle">
              <Icon name="Share2" size={24} />
            </div>
            <h3 className="step-title">Share on your terms</h3>
            <p className="step-desc">
              Review your summary first. Download it or share it with your therapist when you’re ready.
            </p>
          </div>
        </div>
      </section>

      {/* Multilingual Section */}
      <section className="language-section">
        <div className="language-container">
          <div>
            <p className="section-eyebrow">MULTILINGUAL REFLECTION</p>
            <h2 className="section-title">
              Your language. <br />
              <span className="editorial-italic">Your pace. Your story.</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Expressing emotions is easier in the words closest to home. Triora supports eight Indian languages, with a patient listener that never rushes or interrupts.
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
        <p className="section-eyebrow">PRIVACY BY DESIGN</p>
        <h2 className="section-title">
          Your story stays yours.
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '600px' }}>
          Your reflections are encrypted. Nothing is shared without your action, and you can delete your data at any time.
        </p>

        <div className="privacy-grid">
          <div className="privacy-card">
            <div className="privacy-icon">
              <Icon name="Lock" size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Encrypted in transit and at rest</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Industry-standard encryption guarantees that your private reflections remain strictly secure.
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <Icon name="Key" size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Short-lived speech tokens</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Audio processing uses temporary tokens that expire immediately after your reflection ends.
            </p>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <Icon name="ShieldCheck" size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Clear consent before sharing</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Your summary is only accessible to you until you explicitly choose to export or send it to your therapist.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2 className="final-cta-heading">
          Take the first step <br />
          <span className="editorial-italic" style={{ color: 'var(--peach)' }}>in your own words.</span>
        </h2>
        <p className="final-cta-sub">About 10–15 minutes. Private by default.</p>
        <Link to="/signup">
          <Button variant="white" size="lg">Begin your reflection</Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
};
