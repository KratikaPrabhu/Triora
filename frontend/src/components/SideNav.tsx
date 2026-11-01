import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
    if (!name) return 'KP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user?.name || user?.profile?.preferredName || 'Kratika Prabhu';
  const initials = getInitials(displayName);

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="mobile-app-header">
        <Logo linkTo="/dashboard" size="sm" />
        <button
          onClick={() => navigate('/profile')}
          className="mobile-avatar-btn"
          aria-label="View profile"
        >
          <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
            {initials}
          </div>
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top-group">
          {/* Dedicated Header for Triora Logo */}
          <header className="sidebar-logo-header">
            <Logo linkTo="/dashboard" size="md" />
          </header>

          {/* Navigation with Distinct Button Styling */}
          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }: { isActive: boolean }) =>
                `sidebar-btn-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-btn-text">{t.overview || 'Dashboard'}</span>
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }: { isActive: boolean }) =>
                `sidebar-btn-item ${isActive || location.pathname.startsWith('/report') ? 'active' : ''}`
              }
            >
              <span className="sidebar-btn-text">{t.reports || 'Reports'}</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Pinned User Profile & Logout */}
        <div className="sidebar-user-footer" ref={menuRef}>
          {isMenuOpen && (
            <div className="sidebar-user-popup">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsMenuOpen(false);
                }}
                className="sidebar-user-popup-item"
              >
                <Icon name="User" size={16} /> View Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="sidebar-user-popup-item logout"
              >
                <Icon name="LogOut" size={16} /> Log Out
              </button>
            </div>
          )}

          <div className="user-info-row" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <p className="user-name">{displayName}</p>
              <p className="user-sub">Patient account</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
            }}
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
          className={({ isActive }: { isActive: boolean }) =>
            `mobile-bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Icon name="LayoutDashboard" size={20} />
          <span>{t.overview}</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }: { isActive: boolean }) =>
            `mobile-bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Icon name="FileText" size={20} />
          <span>{t.reports}</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }: { isActive: boolean }) =>
            `mobile-bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Icon name="User" size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
};
export default SideNav;
