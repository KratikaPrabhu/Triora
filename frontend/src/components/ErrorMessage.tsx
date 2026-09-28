import React from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#fff5f5',
        border: '1px solid #feb2b2',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem 2rem',
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
      }}
    >
      <div
        style={{
          color: '#c53030',
          marginTop: '2px',
        }}
      >
        <Icon name="AlertCircle" size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ color: '#9b2c2c', margin: '0 0 0.35rem 0', fontSize: '1rem' }}>{title}</h4>
        <p style={{ color: '#742a2a', fontSize: '0.9rem', margin: 0 }}>{message}</p>
        {onRetry && (
          <div style={{ marginTop: '1rem' }}>
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
