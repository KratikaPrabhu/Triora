import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, LANGUAGES, type LanguageCode } from '../context/LanguageContext';

export const SideNav: React.FC = () => {
  const { user, logout, updateOnboarding } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSelectLanguage = async (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);

    if (user) {
      await updateOnboarding({ preferredLanguage: code });
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const getInitials = (name?: string) => {
    if (!name) return 'T';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.profile?.preferredName || user?.name || 'User';

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo-area">
          <Logo linkTo="/dashboard" />
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="LayoutDashboard" size={18} />
            <span>{t.overview}</span>
          </NavLink>

          <NavLink
            to="/session"
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="Mic" size={18} />
            <span>{t.conversations}</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="FileText" size={18} />
            <span>{t.reports}</span>
          </NavLink>
        </nav>

        {/* Sidebar Language Dropdown */}
        <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
          <div className="language-selector-wrapper" ref={dropdownRef} style={{ width: '100%' }}>
            <button
              type="button"
              className="language-selector-btn"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Select language"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="Globe" size={16} />
                <span>{currentLangObj.native}</span>
              </div>
              <Icon name="ChevronDown" size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
              <div className="language-dropdown-menu" style={{ left: 0, right: 0, width: '100%' }}>
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
        </div>
      </div>

      <div className="sidebar-user-footer">
        <div className="user-info-row">
          <div className="user-avatar">{getInitials(displayName)}</div>
          <div className="user-details">
            <p>{displayName}</p>
            <p>Patient account</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="logout-btn"
          title="Log out"
          aria-label="Log out"
        >
          <Icon name="LogOut" size={18} />
        </button>
      </div>
    </aside>
  );
};

