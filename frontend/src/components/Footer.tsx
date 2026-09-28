import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo linkTo="/" />
          <p>Voice-first preparation for a more human beginning to therapy.</p>
        </div>
        <div className="footer-links">
          <a href="#privacy" className="footer-link">Privacy</a>
          <a href="#terms" className="footer-link">Terms</a>
          <a href="#contact" className="footer-link">Contact</a>
        </div>
      </div>
      <div className="footer-disclaimer">
        © 2026 Triora. Triora is not a crisis service or a substitute for medical care.
      </div>
    </footer>
  );
};
