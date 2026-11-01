import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  linkTo?: string;
  className?: string;
  hideIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  linkTo = '/',
  className = '',
  hideIcon = false,
}) => {
  const getScale = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 28, fontSize: '1.25rem', gap: '0.6rem' };
      case 'lg':
        return { width: 44, height: 38, fontSize: '1.75rem', gap: '0.8rem' };
      case 'xl':
        return { width: 54, height: 46, fontSize: '2.3rem', gap: '0.95rem' };
      default:
        return { width: 38, height: 33, fontSize: '1.5rem', gap: '0.7rem' };
    }
  };

  const getColors = () => {
    if (variant === 'light') {
      return {
        text: '#ffffff',
        frontBubble: '#ffffff',
        backBubble: '#7ea7be',
        letterColor: '#28647e',
      };
    }
    // Default dark/light-bg variant
    return {
      text: '#1a3e5c',
      frontBubble: '#2d6a82',
      backBubble: '#9fc3d4',
      letterColor: '#ffffff',
    };
  };

  const dim = getScale();
  const colors = getColors();

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        userSelect: 'none',
      }}
      className={`triora-logo-wrap ${className}`}
    >
      {/* Exact Triora Logo Icon: Overlapping Speech Bubbles */}
      {!hideIcon && (
        <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 46 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        {/* Back speech bubble with tail pointing to lower right */}
        <path
          d="M 27 3 C 33.6 3 39 8.4 39 15 C 39 18.7 37.3 22 34.6 24.2 L 36.5 29 L 31.4 26.6 C 30 27 28.5 27.2 27 27.2 C 20.4 27.2 15 21.8 15 15 C 15 8.4 20.4 3 27 3 Z"
          fill={colors.backBubble}
          opacity={variant === 'light' ? 0.75 : 0.85}
        />

        {/* Front speech bubble with tail pointing to lower left */}
        <path
          d="M 17 5 C 24.7 5 31 11.3 31 19 C 31 26.7 24.7 33 17 33 C 14.6 33 12.3 32.4 10.3 31.3 L 4.5 34.8 L 6.2 29.2 C 4.2 26.5 3 23 3 19 C 3 11.3 9.3 5 17 5 Z"
          fill={colors.frontBubble}
        />

        {/* Upright bold serif 't' matching the reference logo */}
        <text
          x="17"
          y="23.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.letterColor}
          fontFamily="'Playfair Display', 'Lora', Georgia, 'Times New Roman', serif"
          fontWeight="800"
          fontSize="19.5"
          style={{ letterSpacing: '0' }}
        >
          t
        </text>
      </svg>
      )}

      {/* Typography: Distinctive Playfair Display serif wordmark */}
      <span
        style={{
          fontFamily: "'Playfair Display', 'Lora', Georgia, serif",
          fontWeight: 800,
          fontSize: dim.fontSize,
          color: colors.text,
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
        className="triora-logo-title"
      >
        triora
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {content}
      </Link>
    );
  }

  return content;
};
export default Logo;
