import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const getStyles = (): React.CSSProperties => {
    let bg = 'var(--green)';
    let color = 'var(--white)';
    let border = 'none';

    if (variant === 'secondary') {
      bg = 'var(--soft-green)';
      color = 'var(--green)';
      border = '1px solid var(--sage-light)';
    } else if (variant === 'outline') {
      bg = 'transparent';
      color = 'var(--ink)';
      border = '1px solid var(--line)';
    } else if (variant === 'white') {
      bg = 'var(--white)';
      color = 'var(--green)';
      border = '1px solid var(--line)';
    } else if (variant === 'ghost') {
      bg = 'transparent';
      color = 'var(--muted)';
    }

    let padding = '0.75rem 1.5rem';
    let fontSize = '0.95rem';

    if (size === 'sm') {
      padding = '0.5rem 1rem';
      fontSize = '0.85rem';
    } else if (size === 'lg') {
      padding = '1rem 2.25rem';
      fontSize = '1.05rem';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem',
      backgroundColor: bg,
      color: color,
      border: border,
      padding: padding,
      fontSize: fontSize,
      fontWeight: 600,
      borderRadius: 'var(--radius-full)',
      width: fullWidth ? '100%' : 'auto',
      transition: 'all var(--transition-fast)',
      opacity: disabled || isLoading ? 0.6 : 1,
      pointerEvents: disabled || isLoading ? 'none' : 'auto',
    };
  };

  return (
    <button style={getStyles()} disabled={disabled || isLoading} className={className} {...props}>
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
