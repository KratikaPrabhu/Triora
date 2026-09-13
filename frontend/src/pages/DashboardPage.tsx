import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSessions } from '../store/sessionSlice';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StartSessionCard from '../components/dashboard/StartSessionCard';
import SessionList from '../components/dashboard/SessionList';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sessions, loading, error } = useAppSelector((state) => state.session);

  const loadSessions = () => {
    dispatch(fetchSessions());
  };

  useEffect(() => {
    loadSessions();
  }, [dispatch]);

  const name = user?.profile?.preferredName || user?.name || 'Patient';
  const preferredLanguage = user?.profile?.preferredLanguage || 'English';

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <WelcomeBanner name={name} sessionCount={sessions?.length || 0} />

        {/* Start New Session CTA */}
        <StartSessionCard preferredLanguage={preferredLanguage} />

        {/* Previous Sessions List */}
        <SessionList
          sessions={sessions}
          loading={loading}
          error={error}
          onRetry={loadSessions}
        />
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
