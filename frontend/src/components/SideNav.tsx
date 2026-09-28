import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { useAuth } from '../hooks/useAuth';

export const SideNav: React.FC = () => {
  const { user, logout } = useAuth();

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
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/dashboard#reflections"
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="Mic" size={18} />
            <span>Reflections</span>
          </NavLink>

          <NavLink
            to="/dashboard#reports"
            className={({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name="FileText" size={18} />
            <span>Reports</span>
          </NavLink>
        </nav>
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
