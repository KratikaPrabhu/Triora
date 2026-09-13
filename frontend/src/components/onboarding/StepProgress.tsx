import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Background & Goals' },
    { num: 3, label: 'Preferences & Terms' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : isCurrent
                    ? 'bg-slate-900 text-teal-400 border-2 border-teal-500 shadow-md ring-4 ring-teal-500/20'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : step.num}
              </div>
              <span
                className={`text-xs font-semibold mt-2 ${
                  isCurrent ? 'text-teal-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
