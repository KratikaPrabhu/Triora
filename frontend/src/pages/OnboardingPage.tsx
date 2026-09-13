import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserProfileState } from '../store/authSlice';
import onboardingService from '../services/onboarding.service';
import type { OnboardingData } from '../types';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import StepProgress from '../components/onboarding/StepProgress';
import Step1Basic from '../components/onboarding/Step1Basic';
import Step2Background from '../components/onboarding/Step2Background';
import Step3Preferences from '../components/onboarding/Step3Preferences';
import { Sparkles } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    preferredName: user?.profile?.preferredName || user?.name || '',
    dateOfBirth: user?.profile?.dateOfBirth ? String(user.profile.dateOfBirth) : '',
    preferredLanguage: user?.profile?.preferredLanguage || 'English',
    backgroundInfo: user?.profile?.backgroundInfo || '',
    previousTherapyExperience: user?.profile?.previousTherapyExperience || '',
    primaryGoals: user?.profile?.primaryGoals || [],
    communicationPreference: user?.profile?.communicationPreference || 'voice',
    consentAcknowledged: user?.profile?.consentAcknowledged || false,
    termsAccepted: user?.profile?.termsAccepted || false,
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onboardingService
      .getOnboarding()
      .then((res) => {
        if (res) {
          if (res.currentStep) setCurrentStep(res.currentStep);
          if (res.profile) {
            setFormData((prev) => ({
              ...prev,
              preferredName: res.profile.preferredName || prev.preferredName,
              dateOfBirth: res.profile.dateOfBirth ? String(res.profile.dateOfBirth) : prev.dateOfBirth,
              preferredLanguage: res.profile.preferredLanguage || prev.preferredLanguage,
              backgroundInfo: res.profile.backgroundInfo || prev.backgroundInfo,
              previousTherapyExperience: res.profile.previousTherapyExperience || prev.previousTherapyExperience,
              primaryGoals: res.profile.primaryGoals || prev.primaryGoals,
              communicationPreference: res.profile.communicationPreference || prev.communicationPreference,
              consentAcknowledged: res.profile.consentAcknowledged ?? prev.consentAcknowledged,
              termsAccepted: res.profile.termsAccepted ?? prev.termsAccepted,
            }));
          }
          if (res.isOnboardingComplete) {
            navigate('/dashboard', { replace: true });
          }
        }
      })
      .catch((err) => console.warn('Failed to load initial onboarding status:', err))
      .finally(() => setInitialLoading(false));
  }, [navigate]);

  const handleChange = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveStepProgress = async (nextStepNumber: number) => {
    setSaving(true);
    setError(null);
    try {
      const payload: OnboardingData & { currentStep: number } = {
        ...formData,
        currentStep: nextStepNumber,
      };
      const res = await onboardingService.updateOnboarding(payload);
      if (res.profile) {
        dispatch(updateUserProfileState(res.profile));
      }
      setCurrentStep(nextStepNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleStep1Next = () => saveStepProgress(2);
  const handleStep2Next = () => saveStepProgress(3);
  const handleStep2Back = () => setCurrentStep(1);
  const handleStep3Back = () => setCurrentStep(2);

  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        currentStep: 3,
        isOnboardingComplete: true,
      };
      const res = await onboardingService.updateOnboarding(payload as any);
      if (res.profile) {
        dispatch(updateUserProfileState({ ...res.profile, isOnboardingComplete: true }));
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner message="Loading your intake profile..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Intake Onboarding Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to Triora
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Please complete these 3 quick steps to personalize your pre-therapy voice intake experience.
            </p>
          </div>

          <StepProgress currentStep={currentStep} />

          {error && <ErrorAlert title="Save Error" message={error} />}

          <div className="pt-2">
            {currentStep === 1 && (
              <Step1Basic data={formData} onChange={handleChange} onNext={handleStep1Next} />
            )}

            {currentStep === 2 && (
              <Step2Background
                data={formData}
                onChange={handleChange}
                onNext={handleStep2Next}
                onBack={handleStep2Back}
              />
            )}

            {currentStep === 3 && (
              <Step3Preferences
                data={formData}
                onChange={handleChange}
                onComplete={handleComplete}
                onBack={handleStep3Back}
                loading={saving}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OnboardingPage;
