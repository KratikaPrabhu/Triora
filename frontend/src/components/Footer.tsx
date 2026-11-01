import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="landing-footer">
      {/* Soft background waves */}
      <div className="footer-bg-waves" aria-hidden="true">
        <svg
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="footer-wave-svg"
        >
          <path
            d="M0 160 C320 80, 640 240, 960 140 C1200 60, 1360 170, 1440 190 L1440 320 L0 320 Z"
            fill="#eaf4fb"
            fillOpacity="0.75"
          />
          <path
            d="M0 210 C280 140, 580 280, 900 200 C1160 120, 1340 230, 1440 240 L1440 320 L0 320 Z"
            fill="#ddedf8"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      <div className="footer-container">
        {/* Top Section: 4 Columns with vertical divider borders */}
        <div className="footer-top-grid">
          {/* Column 1: Brand & Feature list */}
          <div className="footer-col-brand">
            <div className="footer-brand-logo-wrap">
              <Logo linkTo="/" />
            </div>
            <p className="footer-brand-slogan">
              Voice-first preparation for a<br />
              more human beginning to<br />
              therapy.
            </p>

            <div className="footer-brand-divider" />

            {/* 2x2 Feature Tags without icons, matching image */}
            <div className="footer-features-grid">
              <span className="footer-feature-item">Private by design</span>
              <span className="footer-feature-item">Voice-first</span>
              <span className="footer-feature-item">Multilingual support</span>
              <span className="footer-feature-item">A calmer first step</span>
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
                  Pricing
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
                  Blog
                </span>
              </li>
              <li><a href="#for-therapists" className="footer-nav-link">For Therapists</a></li>
              <li>
                <span className="footer-nav-link disabled-link">
                  Research
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
                  Careers
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


