import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  Wallet,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { generateMonthlyReportPDF } from '../utils/pdfGenerator';

export default function Reports() {
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Monthly Report
  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/monthly?year=${selectedYear}&month=${selectedMonth}`);
      if (res.data?.success) {
        setMonthlyData(res.data);
      }
    } catch (err) {
      console.error('Failed to load monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Yearly Report
  const fetchYearlyReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/yearly?year=${selectedYear}`);
      if (res.data?.success) {
        setYearlyData(res.data);
      }
    } catch (err) {
      console.error('Failed to load yearly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'monthly') {
      fetchMonthlyReport();
    } else {
      fetchYearlyReport();
    }
  }, [viewMode, selectedYear, selectedMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDownloadMonthlyPDF = () => {
    if (!monthlyData) return;
    const reportMonth = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    generateMonthlyReportPDF({
      businessName: 'ShreeDev Paint Service',
      reportMonth,
      summary: monthlyData.summary,
      workerBreakdown: monthlyData.workerBreakdown
    });
  };

  const mSummary = monthlyData?.summary || {};
  const ySummary = yearlyData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white p-4 sm:p-5 border border-surface-border rounded-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy uppercase tracking-wider">
            Reports & Statement Generation
          </h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            Labour expenses, attendance volumes, and professional PDF statements
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex border border-surface-border rounded-sm p-0.5 bg-surface-bg">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                viewMode === 'monthly' ? 'bg-navy text-white shadow-sm' : 'text-surface-secondary hover:text-navy'
              }`}
            >
              Monthly Report
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                viewMode === 'yearly' ? 'bg-navy text-white shadow-sm' : 'text-surface-secondary hover:text-navy'
              }`}
            >
              Yearly Analytics
            </button>
          </div>

          {viewMode === 'monthly' && (
            <button
              onClick={handleDownloadMonthlyPDF}
              disabled={loading || !monthlyData}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy hover:bg-navy-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls (Year & Month Selectors) */}
      <div className="bg-white p-3 border border-surface-border rounded-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-navy uppercase text-[10px] tracking-wider">Select Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-1.5 bg-surface-bg border border-surface-border rounded-sm text-navy font-semibold outline-none"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        {viewMode === 'monthly' && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy uppercase text-[10px] tracking-wider">Select Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-1.5 bg-surface-bg border border-surface-border rounded-sm text-navy font-semibold outline-none"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="ml-auto text-xs text-surface-secondary font-medium">
          Period: <strong className="text-navy">{viewMode === 'monthly' ? `${monthNames[selectedMonth - 1]} ${selectedYear}` : `${selectedYear} Calendar Year`}</strong>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-navy bg-white border border-surface-border">
          Generating report data from database records...
        </div>
      ) : viewMode === 'monthly' ? (
        /* Monthly Report View */
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Total Attendance Units</span>
              <div className="text-xl font-bold text-navy mt-1">{(mSummary.totalAttendanceUnits || 0).toFixed(1)}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Full: {mSummary.fullAttendanceUnits} • Half: {mSummary.halfAttendanceUnits}</p>
            </div>

            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Total Labour Earnings</span>
              <div className="text-xl font-bold text-navy mt-1">₹{mSummary.totalLabourEarnings || 0}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Wages accrued this month</p>
            </div>

            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Advances Given</span>
              <div className="text-xl font-bold text-status-success mt-1">₹{mSummary.totalAdvances || 0}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Disbursed in {monthNames[selectedMonth - 1]}</p>
            </div>

            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Payments Disbursed</span>
              <div className="text-xl font-bold text-navy mt-1">₹{mSummary.totalPayments || 0}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Total settlement payments</p>
            </div>
          </div>

          {/* Worker-wise Breakdown Table */}
          <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
              <div>
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                  Worker-wise Monthly Breakdown
                </h3>
                <p className="text-xs text-surface-secondary">
                  Attendance days and earned wages for {monthNames[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
            </div>

            {(monthlyData?.workerBreakdown || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-surface-secondary">
                No attendance or wage records found for this selected month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                    <tr>
                      <th className="py-2.5 px-3">Worker ID</th>
                      <th className="py-2.5 px-3">Worker Name</th>
                      <th className="py-2.5 px-3 text-center">Full (1.0)</th>
                      <th className="py-2.5 px-3 text-center">Half (0.5)</th>
                      <th className="py-2.5 px-3 text-center">Units</th>
                      <th className="py-2.5 px-3 text-right">Earned Wage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {monthlyData.workerBreakdown.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-bg/40">
                        <td className="py-2.5 px-3 font-mono text-surface-secondary">{row.workerCustomId || '-'}</td>
                        <td className="py-2.5 px-3 font-semibold text-navy">{row.name}</td>
                        <td className="py-2.5 px-3 text-center">{row.full}</td>
                        <td className="py-2.5 px-3 text-center">{row.half}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-navy">{row.units}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-navy">₹{row.earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Yearly Report View */
        <div className="space-y-6">
          {/* Yearly Hero Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Yearly Labour Expense</span>
              <div className="text-2xl font-bold text-navy mt-1">₹{ySummary.yearlyTotalLabour || 0}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Total accrued in {selectedYear}</p>
            </div>
            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Yearly Advances</span>
              <div className="text-2xl font-bold text-status-success mt-1">₹{ySummary.yearlyTotalAdvances || 0}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Total advances paid in {selectedYear}</p>
            </div>
            <div className="bg-white p-4 border border-surface-border rounded-sm">
              <span className="text-[10px] uppercase font-semibold text-surface-secondary block">Year-End Outstanding</span>
              <div className="text-2xl font-bold text-status-danger mt-1">₹{ySummary.yearEndOutstanding || 0}</div>
              <p className="text-[10px] text-surface-secondary mt-0.5">Current net worker payables</p>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white border border-surface-border rounded-sm p-5">
            <div className="mb-4 pb-2 border-b border-surface-border">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                Monthly Labour Expense Trend ({selectedYear})
              </h3>
              <p className="text-xs text-surface-secondary">Month-by-month financial labour expenditure</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData?.monthlyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#172B4D',
                      borderColor: '#172B4D',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      borderRadius: '2px'
                    }}
                  />
                  <Bar dataKey="labourExpense" fill="#172B4D" name="Labour Expense (₹)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="advances" fill="#16A34A" name="Advances (₹)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

