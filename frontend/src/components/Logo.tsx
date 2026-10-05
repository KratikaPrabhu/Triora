import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface LogoProps {
  variant?: 'dark' | 'light' | 'green';
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  linkTo = '/',
  className = '',
}) => {
  const { t } = useLanguage();

  const getScale = () => {
    switch (size) {
      case 'sm': return { markHeight: 20, fontSize: '1.15rem' };
      case 'lg': return { markHeight: 32, fontSize: '1.75rem' };
      default: return { markHeight: 26, fontSize: '1.4rem' };
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'light': return { text: '#ffffff', mark1: '#dbe7df', mark2: '#5f8377', mark3: '#e6b486' };
      case 'green': return { text: '#315f50', mark1: '#315f50', mark2: '#5f8377', mark3: '#e6b486' };
      default: return { text: '#24332e', mark1: '#315f50', mark2: '#5f8377', mark3: '#e6b486' };
    }
  };

  const dimensions = getScale();
  const colors = getColors();

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        userSelect: 'none',
      }}
      className={className}
    >
      <svg
        height={dimensions.markHeight}
        viewBox="0 0 36 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6 28C8.5 28 10 21 10 14C10 7 8.5 4 6 4C3.5 4 2 7 2 14C2 21 3.5 28 6 28Z"
          fill={colors.mark1}
        />
        <path
          d="M18 30C20.5 30 22 22 22 13C22 4 20.5 2 18 2C15.5 2 14 4 14 13C14 22 15.5 30 18 30Z"
          fill={colors.mark2}
        />
        <path
          d="M30 27C32 27 33.5 21 33.5 15C33.5 9 32 6 30 6C28 6 26.5 9 26.5 15C26.5 21 28 27 30 27Z"
          fill={colors.mark3}
        />
      </svg>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: dimensions.fontSize,
          color: colors.text,
          letterSpacing: '-0.03em',
        }}
      >
        {t.logoName || 'triora'}
      </span>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
};
