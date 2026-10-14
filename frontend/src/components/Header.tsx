import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES, type LanguageCode } from '../context/LanguageContext';
import '../styles/landing.css';

export const Header: React.FC = () => {
  const { user, updateOnboarding } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track active section on scroll for button effect with jitter protection
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const howItWorksEl = document.getElementById('how-it-works');
      const privacyEl = document.getElementById('privacy');

      if (privacyEl) {
        const pRect = privacyEl.getBoundingClientRect();
        if (pRect.top <= 240 && pRect.bottom >= 120) {
          setActiveSection('privacy');
          return;
        }
      }

      if (howItWorksEl) {
        const hRect = howItWorksEl.getBoundingClientRect();
        if (hRect.top <= 240 && hRect.bottom >= 120) {
          setActiveSection('how-it-works');
          return;
        }
      }

      setActiveSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleSelectLanguage = async (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);

    if (user) {
      await updateOnboarding({ preferredLanguage: code });
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
      const targetScroll = Math.max(0, elementTop - navOffset);

      isScrollingRef.current = true;
      setActiveSection(id);

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 950);
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="landing-header-wrapper">
      <header className="landing-header">
        <Logo linkTo="/" size="md" />

        {/* Desktop Nav Actions: All 5 buttons aligned together in sequence */}
        <nav className="landing-nav-actions desktop-only-nav">
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className={`landing-nav-btn ${activeSection === 'how-it-works' ? 'active' : ''}`}
          >
            <span>How it works</span>
          </a>

          <a
            href="#privacy"
            onClick={(e) => scrollToSection(e, 'privacy')}
            className={`landing-nav-btn ${activeSection === 'privacy' ? 'active' : ''}`}
          >
            <span>Privacy</span>
          </a>

          {/* Language Selector Pill */}
          <div className="language-selector-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="landing-lang-btn"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Select language"
            >
              <Icon name="Globe" size={15} />
              <span>{currentLangObj.name}</span>
              <Icon name="ChevronDown" size={13} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
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
            <Link to="/dashboard" className="landing-get-started-btn">
              <span>Go to Dashboard</span>
              <Icon name="ArrowRight" size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-login-btn">
                Log in
              </Link>
              <Link to="/signup" className="landing-get-started-btn">
                <span>Get started</span>
                <Icon name="ArrowRight" size={14} />
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={22} color="#123b38" />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <a
            href="#how-it-works"
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToSection(e, 'how-it-works');
            }}
            className={`mobile-nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
          >
            How it works
          </a>
          <a
            href="#privacy"
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToSection(e, 'privacy');
            }}
            className={`mobile-nav-link ${activeSection === 'privacy' ? 'active' : ''}`}
          >
            Privacy
          </a>

          <div className="mobile-language-row">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#52796f' }}>Language:</span>
            <select
              value={language}
              onChange={(e) => handleSelectLanguage(e.target.value as LanguageCode)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                color: '#123b38',
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>

          <div className="mobile-nav-actions">
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="landing-get-started-btn" style={{ justifyContent: 'center' }}>
                <span>Go to Dashboard</span>
                <Icon name="ArrowRight" size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="landing-login-btn" style={{ justifyContent: 'center' }}>
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="landing-get-started-btn" style={{ justifyContent: 'center' }}>
                  <span>Get started</span>
                  <Icon name="ArrowRight" size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
