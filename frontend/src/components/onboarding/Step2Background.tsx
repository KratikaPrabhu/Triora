import React from 'react';
import type { OnboardingData } from '../../types';
import { Target, FileText, History } from 'lucide-react';

interface Step2Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVAILABLE_GOALS = [
  'Managing Stress & Anxiety',
  'Improving Sleep Habits',
  'Workplace Burnout',
  'Relationship Communication',
  'Emotional Regulation',
  'Navigating Life Transitions',
  'General Well-being Intake',
];

export const Step2Background: React.FC<Step2Props> = ({ data, onChange, onNext, onBack }) => {
  const selectedGoals = data.primaryGoals || [];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      onChange(
        'primaryGoals',
        selectedGoals.filter((g) => g !== goal)
      );
    } else {
      onChange('primaryGoals', [...selectedGoals, goal]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">Step 2: Background & Intake Goals</h3>
        <p className="text-sm text-slate-400">Provide context to tailor your pre-therapy intake summary.</p>
      </div>

      <div className="space-y-5">
        {/* Background Information */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>What brings you to therapy at this time? (Optional)</span>
          </label>
          <textarea
            rows={3}
            value={data.backgroundInfo || ''}
            onChange={(e) => onChange('backgroundInfo', e.target.value)}
            placeholder="Share a brief overview of how you've been feeling recently..."
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 focus:bg-slate-900 outline-none transition-all resize-none placeholder:text-slate-500"
          />
        </div>

        {/* Previous Therapy Experience */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <History className="w-4 h-4 text-teal-400" />
            <span>Previous Therapy Experience</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'none', label: 'None' },
              { id: 'some', label: 'Some' },
              { id: 'extensive', label: 'Extensive' },
              { id: 'prefer_not_to_say', label: 'Prefer not to say' },
            ].map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => onChange('previousTherapyExperience', exp.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  data.previousTherapyExperience === exp.id
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200 ring-2 ring-teal-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goals */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-teal-400" />
            <span>Primary Focus Areas (Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {AVAILABLE_GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-teal-500 border-teal-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {goal}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all border border-slate-700"
        >
          &larr; Back
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20"
        >
          Continue to Step 3 &rarr;
        </button>
      </div>
    </form>
  );
};

export default Step2Background;
