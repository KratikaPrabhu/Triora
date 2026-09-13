import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import {
  Mic,
  FileText,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Activity,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-[#090d16] to-[#090d16]">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-lg shadow-teal-500/10">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Voice-First Pre-Therapy Intake Assistant</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                {t.heroHeadline || "Have a conversation about how you've been feeling before your first therapy appointment."}
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                {t.heroSub || "Triora guides you through an open-ended, spoken intake session in your preferred language—compiling your thoughts into a structured summary report for your therapist."}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base rounded-2xl transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02]"
                >
                  <span>{t.getStartedBtn || "Get Started"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-base rounded-2xl transition-all"
                >
                  {t.signInBtn || "Sign In"}
                </Link>
              </div>

              <p className="text-xs text-slate-400 pt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{t.privacyNotice || "Triora is a pre-therapy intake tool, not a diagnostic or medical treatment service."}</span>
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-16 sm:py-24 bg-slate-950 border-y border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">{t.processTitle || "Simple 3-Step Process"}</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How Triora Helps You Prepare
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 hover:border-teal-500/50 transition-all space-y-4 relative group shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Tell Your Story</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Speak naturally in your preferred language about what you're experiencing, stress factors, and goals.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 hover:border-teal-500/50 transition-all space-y-4 relative group shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Guided Conversation & Signal Stream</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Our empathetic AI intake assistant listens, asks clarifying questions, and displays live physiological state indicators.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 hover:border-teal-500/50 transition-all space-y-4 relative group shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Take Summary to Therapist</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Receive a structured, printable pre-therapy summary report to share with your licensed practitioner.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES */}
        <section className="py-16 sm:py-24 bg-[#090d16]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">Core Capabilities</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {t.benefitsTitle || "Designed for Patient Comfort & Peace of Mind"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-3 shadow-xl hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Voice-First Conversation</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No tedious typing. Speak freely at your own speed with active voice recognition.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-3 shadow-xl hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Multilingual Support</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Express emotions comfortably in 8 regional languages including Kannada, Hindi, Tamil, Telugu, and more.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-3 shadow-xl hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">AI-Generated Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Synthesizes key concerns, themes, and emotional statements into clinical pre-intake notes.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-3 shadow-xl hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Physiological Stream</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time autonomic signal graph and state indicator during spoken sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORTED LANGUAGES */}
        <section className="py-16 bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Speak in Your Native Language</h3>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Triora supports full voice intake in 8 Indian and global regional languages.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2 text-sm font-semibold text-slate-200 shadow-md"
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({lang.nativeName})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRIVACY & SAFETY BANNER */}
        <section className="py-12 bg-slate-950 border-t border-slate-800 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Pre-Therapy Intake Boundary</span>
              </div>
              <h3 className="text-xl font-bold">Important Notice to Patients</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Triora is designed exclusively as a pre-therapy intake tool to help you organize your thoughts prior to your first clinical session. Triora is not a replacement for a licensed therapist, does not provide medical diagnoses, and does not handle psychiatric emergencies.
              </p>
            </div>

            <Link
              to="/signup"
              className="shrink-0 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              Start Intake Preparation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
