import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="landing-header">
      <Logo linkTo="/" />
      <nav className="landing-nav">
        <a href="#how-it-works" className="landing-nav-link">How it works</a>
        <a href="#privacy" className="landing-nav-link">Privacy</a>
        {user ? (
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link to="/login" className="landing-nav-link">Log in</Link>
            <Link to="/signup">
              <Button variant="primary">Get started</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
