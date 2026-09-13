import React from 'react';
import type { Report } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Heart, Sparkles, MessageSquare, AlertCircle, Bookmark } from 'lucide-react';

interface ReportSummaryProps {
  report: Report;
  patientName?: string;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ report, patientName = 'Patient' }) => {
  const { t } = useLanguage();

  const formattedDate = new Date(report.generatedAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 print-card">
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-white">{t.reportTitle || "Triora Pre-Therapy Intake Summary"}</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-teal-950 text-teal-300 rounded border border-teal-800">
              Confidential
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Prepared for clinical pre-appointment reference for {patientName}
          </p>
        </div>
        <div className="text-left sm:text-right text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Date Generated</p>
          <p>{formattedDate}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-950/30 border border-amber-800/40 p-4 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Clinical Pre-Intake Disclaimer</span>
          {t.reportDisclaimer || "This report is an AI-generated summary of self-reported conversation and does NOT constitute a medical diagnosis."}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h3>{t.summaryHeader || "Session Summary"}</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          {report.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <Bookmark className="w-4 h-4 text-teal-400" />
            <h4>{t.themesHeader || "Key Themes Discussed"}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.keyThemes && report.keyThemes.length > 0 ? (
              report.keyThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-teal-950/80 text-teal-300 text-xs font-semibold rounded-xl border border-teal-800/80"
                >
                  {theme}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No specific themes extracted</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h4>{t.concernsHeader || "Patient Concerns Expressed"}</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {report.concerns && report.concerns.length > 0 ? (
              report.concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-2 bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{concern}</span>
                </li>
              ))
            ) : (
              <span className="text-xs text-slate-400">No primary concerns noted</span>
            )}
          </ul>
        </div>
      </div>

      {report.emotionalContext && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <Heart className="w-4 h-4 text-teal-400" />
            <h4>Emotional Context & Tone</h4>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {report.emotionalContext}
          </p>
        </div>
      )}

      {report.importantStatements && report.importantStatements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <h4>Important Direct Statements</h4>
          </div>
          <div className="space-y-2">
            {report.importantStatements.map((stmt, i) => (
              <blockquote
                key={i}
                className="text-xs italic text-slate-200 border-l-3 border-teal-400 pl-3.5 py-1 bg-teal-950/30 rounded-r-lg"
              >
                "{stmt}"
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {report.conversationOverview && (
        <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Intake Conversation Structure Overview</p>
          <p className="leading-relaxed">{report.conversationOverview}</p>
        </div>
      )}
    </div>
  );
};

export default ReportSummary;
