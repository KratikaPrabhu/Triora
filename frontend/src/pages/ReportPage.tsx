import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import reportService from '../services/report.service';
import type { Report } from '../types';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ReportSummary from '../components/report/ReportSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { Printer, ArrowLeft } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    reportService
      .getReport(id)
      .then((data) => setReport(data))
      .catch((err: any) => setError(err.message || 'Unable to load report summary.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const patientName = user?.profile?.preferredName || user?.name || 'Patient';

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-teal-400" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              disabled={!report}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report for Therapist</span>
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Generating your summary report..." />
        ) : error ? (
          <ErrorAlert title="Unable to load report" message={error} onRetry={loadReport} />
        ) : report ? (
          <ReportSummary report={report} patientName={patientName} />
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default ReportPage;
