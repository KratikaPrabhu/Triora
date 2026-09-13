import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { fetchCurrentUser } from './store/authSlice';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';
import ReportPage from './pages/ReportPage';
import NotFoundPage from './components/common/NotFoundPage';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore user session on app startup
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <SessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute requireOnboarding={true}>
              <ReportPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch All */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
