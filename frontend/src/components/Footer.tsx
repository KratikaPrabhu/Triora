import React from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo linkTo="/" />
          <p>{t.footerSlogan || 'Voice-first preparation for a more human beginning to therapy.'}</p>
        </div>
        <div className="footer-links">
          <a href="#privacy" className="footer-link">{t.privacy}</a>
          <a href="#terms" className="footer-link">{t.terms || 'Terms'}</a>
          <a href="#contact" className="footer-link">{t.contact || 'Contact'}</a>
        </div>
      </div>
      <div className="footer-disclaimer">
        {t.footerDisclaimer || '© 2026 Triora. Triora is not a crisis service or a substitute for medical care.'}
      </div>
    </footer>
  );
};
