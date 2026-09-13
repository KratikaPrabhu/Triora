import React from 'react';
import type { OnboardingData } from '../../types';
import { Mic, ShieldCheck, CheckSquare, MessageSquare } from 'lucide-react';

interface Step3Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: any) => void;
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}

export const Step3Preferences: React.FC<Step3Props> = ({
  data,
  onChange,
  onComplete,
  onBack,
  loading,
}) => {
  const isValid = data.consentAcknowledged && data.termsAccepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">Step 3: Preferences & Safety Consents</h3>
        <p className="text-sm text-slate-400">Acknowledge safety guidelines to finish setting up your account.</p>
      </div>

      <div className="space-y-5">
        {/* Preferred Mode of Intake */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-teal-400" />
            <span>Preferred Conversation Mode</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'voice', label: 'Voice Spoken', icon: Mic },
              { id: 'text', label: 'Text Spoken', icon: MessageSquare },
              { id: 'both', label: 'Voice & Text', icon: CheckSquare },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChange('communicationPreference', mode.id)}
                  className={`p-3 text-center rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    data.communicationPreference === mode.id
                      ? 'bg-teal-950/80 border-teal-500 text-teal-200 ring-2 ring-teal-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-semibold">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety & Medical Disclaimers */}
        <div className="rounded-2xl bg-amber-950/30 border border-amber-800/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Important Medical Notice & Privacy Acknowledgement</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Triora is an AI-powered spoken pre-therapy intake assistant designed solely to help you summarize how you are feeling before meeting your therapist. Triora is NOT a licensed medical professional, does not provide medical diagnoses, and is not a substitute for crisis intervention.
          </p>

          <div className="space-y-2 pt-2 border-t border-amber-800/40">
            {/* Consent Acknowledged */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
              <input
                type="checkbox"
                checked={data.consentAcknowledged || false}
                onChange={(e) => onChange('consentAcknowledged', e.target.checked)}
                className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-950 focus:ring-teal-500"
              />
              <span>
                I understand that Triora is a pre-therapy intake tool and does not provide clinical diagnosis or emergency medical care.
              </span>
            </label>

            {/* Terms Accepted */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
              <input
                type="checkbox"
                checked={data.termsAccepted || false}
                onChange={(e) => onChange('termsAccepted', e.target.checked)}
                className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-950 focus:ring-teal-500"
              />
              <span>I accept the Privacy Policy and Terms of Use for Triora intake processing.</span>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all border border-slate-700"
        >
          &larr; Back
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
        >
          {loading ? 'Completing Setup...' : 'Complete Onboarding & Go to Dashboard 🎉'}
        </button>
      </div>
    </form>
  );
};

export default Step3Preferences;
