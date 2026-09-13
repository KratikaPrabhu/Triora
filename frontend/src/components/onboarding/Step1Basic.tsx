import React from 'react';
import type { OnboardingData } from '../../types';
import { LANGUAGES } from '../../config/languages';
import { User, Calendar, Languages } from 'lucide-react';

interface Step1Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: any) => void;
  onNext: () => void;
}

export const Step1Basic: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.preferredName?.trim()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">Step 1: Basic Information</h3>
        <p className="text-sm text-slate-400">How should our intake assistant address you?</p>
      </div>

      <div className="space-y-4">
        {/* Preferred Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Preferred Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={data.preferredName || ''}
              onChange={(e) => onChange('preferredName', e.target.value)}
              placeholder="e.g. Jane or Alex"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Date of Birth</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Calendar className="w-5 h-5" />
            </div>
            <input
              type="date"
              value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Preferred Spoken Language <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Languages className="w-5 h-5" />
            </div>
            <select
              value={data.preferredLanguage || 'en'}
              onChange={(e) => onChange('preferredLanguage', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                  {lang.flag || '🌐'} {lang.nativeName} ({lang.englishName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={!data.preferredName?.trim()}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20"
        >
          Continue to Step 2 &rarr;
        </button>
      </div>
    </form>
  );
};

export default Step1Basic;
