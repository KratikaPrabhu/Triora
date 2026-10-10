import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any, isNewUser?: boolean) => void;
  onError?: (errorMessage: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { googleLogin } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not configured in .env');
      return;
    }

    const handleCredentialResponse = async (response: any) => {
      if (!response || !response.credential) {
        const msg = "Google sign-in couldn't be completed. Please try again.";
        setErrorText(msg);
        if (onError) onError(msg);
        return;
      }

      try {
        const res = await googleLogin(response.credential);
        if (res.success && res.user) {
          if (onSuccess) onSuccess(res.user, res.isNewUser);
        } else {
          const msg = "Google sign-in couldn't be completed. Please try again.";
          setErrorText(msg);
          if (onError) onError(msg);
        }
      } catch (err) {
        const msg = "Google sign-in couldn't be completed. Please try again.";
        setErrorText(msg);
        if (onError) onError(msg);
      }
    };

    const initializeGsi = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          // Render official Google Identity Services button
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 380,
          });
        } catch (err) {
          console.warn('Google Identity Services render error:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      script.onerror = () => {
        console.warn('Google GSI script failed to load.');
      };
      document.body.appendChild(script);
    }
  }, [clientId, googleLogin, onSuccess, onError]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Official Google Identity Services Rendered Container */}
      <div ref={buttonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '44px' }} />

      {errorText && (
        <p style={{ color: '#c53030', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
          {errorText}
        </p>
      )}
    </div>
  );
};
