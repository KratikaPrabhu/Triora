import React, { useState } from 'react';
import { Logo } from './Logo';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Icon } from './Icon';

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const currentLangName = LANGUAGES.find((l) => l.code === language)?.name || 'English';

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        {/* Top Section: 5 Columns (Brand + 3 Nav Columns + Newsletter Card) */}
        <div className="footer-top-grid">
          {/* Column 1: Brand & Feature Badges */}
          <div className="footer-col-brand">
            <div className="footer-brand-logo-wrap">
              <Logo linkTo="/" />
            </div>
            <p className="footer-brand-slogan">
              {t.footerSlogan || 'Voice-first preparation for a more human beginning to therapy.'}
            </p>

            {/* 2x2 Feature Value Pills */}
            <div className="footer-features-grid">
              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <Icon name="ShieldCheck" size={13} color="#1e563e" />
                </div>
                <span>Private by design</span>
              </div>

              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <Icon name="Mic" size={13} color="#1e563e" />
                </div>
                <span>Voice-first</span>
              </div>

              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <Icon name="Globe" size={13} color="#1e563e" />
                </div>
                <span>Multilingual support</span>
              </div>

              <div className="footer-feature-item">
                <div className="footer-feature-icon">
                  <Icon name="Heart" size={13} color="#1e563e" />
                </div>
                <span>A calmer first step</span>
              </div>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="footer-col-links">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-links-list">
              <li><a href="#how-it-works" className="footer-nav-link">How it works</a></li>
              <li><a href="#statement" className="footer-nav-link">Meet Triora</a></li>
              <li><a href="#multilingual" className="footer-nav-link">Languages</a></li>
              <li><a href="#privacy" className="footer-nav-link">Privacy</a></li>
              <li>
                <span className="footer-nav-link disabled-link">
                  Pricing <span className="coming-soon-tag">(Coming soon)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-col-links">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links-list">
              <li><a href="#help" className="footer-nav-link">Help Center</a></li>
              <li><a href="#faqs" className="footer-nav-link">FAQs</a></li>
              <li>
                <span className="footer-nav-link disabled-link">
                  Blog <span className="coming-soon-tag">(Coming soon)</span>
                </span>
              </li>
              <li><a href="#for-therapists" className="footer-nav-link">For Therapists</a></li>
              <li>
                <span className="footer-nav-link disabled-link">
                  Research <span className="coming-soon-tag">(Coming soon)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="footer-col-links">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about" className="footer-nav-link">About us</a></li>
              <li>
                <span className="footer-nav-link disabled-link">
                  Careers <span className="coming-soon-tag">(Coming soon)</span>
                </span>
              </li>
              <li><a href="#terms" className="footer-nav-link">Terms of Service</a></li>
              <li><a href="#privacy" className="footer-nav-link">Privacy Policy</a></li>
              <li><a href="#contact" className="footer-nav-link">Contact</a></li>
            </ul>
          </div>

          {/* Column 5: Stay in the loop Newsletter Card */}
          <div className="footer-newsletter-card">
            <h3 className="newsletter-card-title">Stay in the loop</h3>
            <p className="newsletter-card-subtitle">
              Get updates on new features, languages, and resources.
            </p>

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrapper">
                <Icon name="Mail" size={16} color="#7c9287" className="newsletter-mail-icon" />
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                  <Icon name="ArrowRight" size={15} color="#ffffff" />
                </button>
              </div>
              {subscribed && (
                <span className="newsletter-success-msg">✓ Thank you for subscribing!</span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Disclaimer | Social Links + Language Selector */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-left">
            <p className="footer-copyright">© 2026 Triora. All rights reserved.</p>
            <p className="footer-disclaimer-note">
              Triora is not a crisis service or a substitute for medical care.
            </p>
          </div>

          <div className="footer-bottom-right">
            {/* Social Icons */}
            <div className="footer-social-links">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-pill-btn" aria-label="X (formerly Twitter)">
                <span className="social-x-symbol">𝕏</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-pill-btn" aria-label="LinkedIn">
                <Icon name="Linkedin" size={14} color="#1b4937" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-pill-btn" aria-label="Instagram">
                <Icon name="Instagram" size={14} color="#1b4937" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-pill-btn" aria-label="YouTube">
                <Icon name="Youtube" size={14} color="#1b4937" />
              </a>
            </div>

            <div className="footer-divider-vert" aria-hidden="true" />

            {/* Language Selector Dropdown */}
            <div className="footer-lang-selector-wrapper">
              <button
                type="button"
                className="footer-lang-btn"
                onClick={() => setShowLangMenu(!showLangMenu)}
                aria-expanded={showLangMenu}
              >
                <Icon name="Globe" size={15} color="#1b4937" />
                <span>{currentLangName}</span>
                <Icon name="ChevronDown" size={14} color="#1b4937" />
              </button>

              {showLangMenu && (
                <div className="footer-lang-dropdown">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`footer-lang-opt ${language === lang.code ? 'opt-active' : ''}`}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                    >
                      <span className="lang-opt-native">{lang.native}</span>
                      <span className="lang-opt-name">({lang.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
