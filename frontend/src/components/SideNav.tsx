import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

export const SideNav: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <>
      {/* Mobile Top App Bar */}
      <header className="mobile-app-header">
        <Logo linkTo="/dashboard" />
        <button
          onClick={() => navigate('/profile')}
          className="mobile-avatar-btn"
          aria-label="View profile"
        >
          <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
            {getInitials(displayName)}
          </div>
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top-group">
          {/* Proper Logo Header with card styling and subtle border */}
          <header className="sidebar-header-card">
            <Logo linkTo="/dashboard" />
          </header>

          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }: { isActive: boolean }) => `sidebar-btn-item ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-btn-icon-box">
                <Icon name="LayoutDashboard" size={18} />
              </div>
              <span className="sidebar-btn-label">{t.overview || 'Dashboard'}</span>
              <div className="sidebar-btn-indicator" />
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }: { isActive: boolean }) => `sidebar-btn-item ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-btn-icon-box">
                <Icon name="FileText" size={18} />
              </div>
              <span className="sidebar-btn-label">{t.reports || 'Reports'}</span>
              <div className="sidebar-btn-indicator" />
            </NavLink>
          </nav>
        </div>

        {/* Botanical Foliage Decor in Sidebar */}
        <div className="sidebar-botanical-wrapper">
          <img
            src="/images/triora-botanical.png"
            alt=""
            aria-hidden="true"
            className="sidebar-botanical-img"
          />
        </div>

        {/* Bottom Pinned User Profile & Logout */}
        <div className="sidebar-user-footer" ref={menuRef}>
          {isMenuOpen && (
            <div className="sidebar-user-popup">
              <button
                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                className="sidebar-user-popup-item"
              >
                <Icon name="User" size={16} /> View Profile
              </button>
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="sidebar-user-popup-item logout"
              >
                <Icon name="LogOut" size={16} /> Log Out
              </button>
            </div>
          )}

          <div className="user-info-row" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="user-avatar">{getInitials(displayName)}</div>
            <div className="user-details">
              <p className="user-name">{displayName}</p>
              <p className="user-sub">Patient account</p>
            </div>
          </div>

          <button
            onClick={() => { logout(); }}
            className="logout-direct-btn"
            title="Log Out"
            aria-label="Log Out"
          >
            <Icon name="LogOut" size={17} />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }: { isActive: boolean }) => `mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon name="LayoutDashboard" size={20} />
          <span>{t.overview}</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }: { isActive: boolean }) => `mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon name="FileText" size={20} />
          <span>{t.reports}</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }: { isActive: boolean }) => `mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon name="User" size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
};

