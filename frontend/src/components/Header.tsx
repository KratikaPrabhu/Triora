import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';
import { Icon } from './Icon';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES, type LanguageCode } from '../context/LanguageContext';

export const Header: React.FC = () => {
  const { user, updateOnboarding } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['how-it-works', 'privacy'];
      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= 100) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectLanguage = async (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);

    if (user) {
      await updateOnboarding({ preferredLanguage: code });
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="landing-header-wrapper">
      <header className="landing-header">
      <Logo linkTo="/" />
      <nav className="landing-nav">
        <a href="#how-it-works">
          <Button variant={activeSection === 'how-it-works' ? 'secondary' : 'outline'}>{t.howItWorks}</Button>
        </a>
        <a href="#privacy">
          <Button variant={activeSection === 'privacy' ? 'secondary' : 'outline'}>{t.privacy}</Button>
        </a>

        <div className="language-selector-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="language-selector-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Select language"
          >
            <Icon name="Globe" size={16} />
            <span>{currentLangObj.native}</span>
            <Icon name="ChevronDown" size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
          </button>

          {isOpen && (
            <div className="language-dropdown-menu">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`language-dropdown-item ${language === lang.code ? 'active' : ''}`}
                  onClick={() => handleSelectLanguage(lang.code)}
                >
                  <span className="lang-native">{lang.native}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <Link to="/dashboard">
            <Button variant="primary">{t.goToDashboard}</Button>
          </Link>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline">{t.logIn}</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">{t.getStarted}</Button>
            </Link>
          </>
        )}
      </nav>
      </header>
    </div>
  );
};
