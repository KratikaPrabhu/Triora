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
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo-area">
          <Logo linkTo="/dashboard" />
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="LayoutDashboard" size={18} />
            <span>{t.overview}</span>
          </NavLink>



          <NavLink
            to="/reports"
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="FileText" size={18} />
            <span>{t.reports}</span>
          </NavLink>
        </nav>

      </div>

      <div className="sidebar-user-footer" ref={menuRef} style={{ position: 'relative' }}>
        {isMenuOpen && (
          <div style={{ position: 'absolute', bottom: 'calc(100% + 0.5rem)', left: 0, right: 0, backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '0.5rem', boxShadow: 'var(--shadow-md)', zIndex: 50 }}>
            <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: '0.95rem', borderRadius: 'var(--radius-sm)' }}>
              <Icon name="User" size={16} /> View Profile
            </button>
            <button onClick={() => { logout(); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: '0.95rem', borderRadius: 'var(--radius-sm)' }}>
              <Icon name="LogOut" size={16} /> Log Out
            </button>
          </div>
        )}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div className="user-info-row" style={{ margin: 0 }}>
            <div className="user-avatar">{getInitials(displayName)}</div>
            <div className="user-details" style={{ textAlign: 'left' }}>
              <p>{displayName}</p>
              <p>Patient account</p>
            </div>
          </div>
          <Icon name="ChevronUp" size={16} color="var(--muted)" />
        </button>
      </div>
    </aside>
  );
};

