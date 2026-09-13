import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying authentication..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires completed onboarding and user has not completed onboarding
  const isOnboardingComplete = user?.profile?.isOnboardingComplete ?? false;
  if (requireOnboarding && !isOnboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
