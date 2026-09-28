import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <Logo size="lg" linkTo="/" />
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '2rem 0 1rem',
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          color: 'var(--muted)',
          fontSize: '1.1rem',
          maxWidth: '480px',
          marginBottom: '2.5rem',
        }}
      >
        The page you are looking for doesn’t exist or has been moved to a quieter space.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Return home
        </Button>
      </Link>
    </div>
  );
};
