import React from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { Icon } from './Icon';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        {/* Top Section: 4 Columns (Brand & Pills, Product, Resources, Company) */}
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
        </div>

        {/* Bottom Bar: Copyright & Disclaimer */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">© 2026 Triora. All rights reserved.</p>
          <p className="footer-disclaimer-note">
            Triora is not a crisis service or a substitute for medical care.
          </p>
        </div>
      </div>
    </footer>
  );
};

