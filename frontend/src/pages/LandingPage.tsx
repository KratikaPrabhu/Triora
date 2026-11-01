import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Icon } from '../components/Icon';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      {/* Sticky Header placed at container level so it stays sticky during whole-page scroll */}
      <Header />

      {/* Shared Ambient Curved Wave Canopy running continuously through the whole page */}
      <div className="landing-ambient-canvas" aria-hidden="true">
        <svg
          viewBox="0 0 1440 2800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="landing-ambient-svg"
        >
          {/* Continuous organic gentle waves spanning from Hero through How-It-Works to Privacy */}
          <path
            d="M0 220 C240 120, 520 300, 880 180 C1160 80, 1340 190, 1440 210 L1440 820 C1300 740, 1100 860, 800 760 C480 660, 220 810, 0 740 Z"
            fill="#edf5fa"
            fillOpacity="0.75"
          />
          <path
            d="M0 340 C320 230, 680 430, 1020 290 C1260 190, 1380 310, 1440 330 L1440 960 C1280 880, 1040 1020, 720 900 C400 780, 160 930, 0 880 Z"
            fill="#e2eff8"
            fillOpacity="0.45"
          />
          <path
            d="M0 980 C260 880, 560 1060, 920 940 C1180 840, 1360 970, 1440 990 L1440 1820 C1280 1720, 1020 1880, 680 1760 C380 1650, 160 1790, 0 1730 Z"
            fill="#edf5fa"
            fillOpacity="0.65"
          />
          <path
            d="M0 1120 C320 1000, 640 1180, 980 1060 C1220 960, 1380 1090, 1440 1110 L1440 1960 C1260 1860, 960 2020, 620 1900 C320 1780, 140 1920, 0 1880 Z"
            fill="#e2eff8"
            fillOpacity="0.4"
          />
          <path
            d="M0 1850 C280 1740, 580 1930, 920 1810 C1180 1710, 1340 1840, 1440 1860 L1440 2800 L0 2800 Z"
            fill="#edf5fa"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      {/* Hero First Section */}
      <div className="landing-top-hero-wrapper">
        <section className="landing-hero-section">
          <div className="landing-hero-container">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="landing-hero-left">
              <span className="landing-hero-eyebrow">A CALMER FIRST STEP</span>

              <h1 className="landing-hero-title">
                Find the words<br />
                before therapy.
              </h1>

              <p className="landing-hero-desc">
                A private, voice-first conversation that helps you understand what you’re feeling — and gives your therapist a clearer place to begin.
              </p>

              <div className="landing-hero-cta-row">
                <Link to="/signup" className="landing-hero-primary-btn">
                  <span>Start a conversation</span>
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="landing-hero-trust-row">
                <span>Private & secure</span>
                <span className="landing-hero-trust-divider">|</span>
                <span>No judgement, ever</span>
              </div>
            </div>

            {/* Right Column: High-Res Hero Image */}
            <div className="landing-hero-right">
              <div className="landing-hero-image-frame">
                <img
                  src="/images/hero-therapy-room.jpg"
                  alt="A calm room with books, plant and blue armchair"
                  className="landing-hero-photo"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="hiw-section">
        <div className="hiw-inner">
          {/* Eyebrow */}
          <p className="hiw-eyebrow">HOW IT WORKS</p>

          {/* Main Headline */}
          <h2 className="hiw-headline">
            Three gentle steps.<br />
            <span className="hiw-headline-italic">One clearer beginning.</span>
          </h2>

          {/* Sub-description */}
          <p className="hiw-subtext">
            A simple, private, and supportive process to help you open up, understand yourself, and move forward.
          </p>

          {/* Three Step Cards */}
          <div className="hiw-cards-row">
            {/* Card 01 */}
            <div className="hiw-card">
              <div className="hiw-card-top">
                <span className="hiw-step-num">01</span>
                <span className="hiw-step-line" />
              </div>
              <h3 className="hiw-card-title">Speak freely</h3>
              <p className="hiw-card-desc">
                Have an open-ended conversation in the language that feels most natural. There's no right or wrong answer.
              </p>
            </div>

            {/* Card 02 */}
            <div className="hiw-card">
              <div className="hiw-card-top">
                <span className="hiw-step-num">02</span>
                <span className="hiw-step-line" />
              </div>
              <h3 className="hiw-card-title">See the patterns</h3>
              <p className="hiw-card-desc">
                Triora organizes what you share into themes, context, and what matters most to you — so you can see things more clearly.
              </p>
            </div>

            {/* Card 03 */}
            <div className="hiw-card">
              <div className="hiw-card-top">
                <span className="hiw-step-num">03</span>
                <span className="hiw-step-line" />
              </div>
              <h3 className="hiw-card-title">Share on your terms</h3>
              <p className="hiw-card-desc">
                Review your summary first. Download it or share it with your therapist when you're ready. You stay in control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section matching Reference Mockup */}
      <section id="privacy" className="privacy-section-wrapper">
        <div className="privacy-container">
          {/* Top Row: Left Headline & Subtext, Right Cutout Window Image */}
          <div className="privacy-hero-row">
            <div className="privacy-left-content">
              <div className="privacy-eyebrow-row">
                <span className="privacy-eyebrow-line" />
                <span className="privacy-eyebrow-text">PRIVACY BY DESIGN</span>
              </div>

              <h2 className="privacy-main-title">
                Your story stays yours.<br />
                <span className="privacy-title-blue">Safe, private, always.</span>
              </h2>

              <p className="privacy-subtitle">
                Your conversations are encrypted. Nothing is shared without your action, and you can delete your data at any time.
              </p>
            </div>

            <div className="privacy-right-visual">
              <div className="privacy-image-frame">
                <img
                  src="/images/privacy-room.jpg"
                  alt="A peaceful room with sunlight and plants"
                  className="privacy-room-photo"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Privacy Cards Grid matching the uploaded reference */}
          <div className="privacy-cards-grid">
            {/* Card 01 */}
            <div className="privacy-card">
              <div className="privacy-card-top">
                <span className="privacy-card-step-num">01</span>
                <span className="privacy-card-step-line" />
              </div>
              <h3 className="privacy-card-title">Encrypted in transit and at rest</h3>
              <p className="privacy-card-desc">
                Industry-standard encryption guarantees that your private conversations remain strictly secure.
              </p>
            </div>

            {/* Card 02 */}
            <div className="privacy-card">
              <div className="privacy-card-top">
                <span className="privacy-card-step-num">02</span>
                <span className="privacy-card-step-line" />
              </div>
              <h3 className="privacy-card-title">Short-lived speech tokens</h3>
              <p className="privacy-card-desc">
                Audio processing uses temporary tokens that expire immediately after your conversation ends.
              </p>
            </div>

            {/* Card 03 */}
            <div className="privacy-card">
              <div className="privacy-card-top">
                <span className="privacy-card-step-num">03</span>
                <span className="privacy-card-step-line" />
              </div>
              <h3 className="privacy-card-title">Clear consent before sharing</h3>
              <p className="privacy-card-desc">
                Your summary is only accessible to you until you explicitly choose to export or send it to your therapist.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
