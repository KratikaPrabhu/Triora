import React from 'react';
import { Logo } from './Logo';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Loading reflection space...',
}) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        textAlign: 'center',
      }}
    >
      <Logo size="md" linkTo="" />
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--sage-light)',
          borderTopColor: 'var(--green)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '1.5rem 0 1rem',
        }}
      />
      <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--paper)',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
