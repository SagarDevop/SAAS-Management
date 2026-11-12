import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Download, 
  CreditCard, 
  FileText
} from 'lucide-react';
import api from '../services/api';
import { generateWorkerStatementPDF } from '../utils/pdfGenerator';

export default function WorkerProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // summary, attendance, ledger

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workers/${id}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching worker profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-navy">Loading worker profile...</div>;
  }

  if (!data?.worker) {
    return (
      <div className="p-8 text-center bg-white border border-surface-border">
        <p className="text-sm font-semibold text-navy">Worker profile not found.</p>
        <Link to="/workers" className="text-xs text-navy underline mt-2 inline-block">
          Back to Workers List
        </Link>
      </div>
    );
  }

  const { worker, summary, attendances = [], transactions = [] } = data;
  const isNegative = worker.walletBalance < 0;
  const isPositive = worker.walletBalance > 0;

  const handleExportPDF = () => {
    generateWorkerStatementPDF({
      businessName: 'ShreeDev Paint Service',
      worker,
      summary,
      attendances,
      transactions,
      dateRange: 'All Available Records'
    });
  };

  return (
    <div className="space-y-5">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/workers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Worker Directory</span>
        </Link>

        <button
          onClick={handleExportPDF}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-navy-800 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Worker Statement (PDF)</span>
        </button>
      </div>

      {/* Top Profile Summary Card */}
      <div className="bg-white border border-surface-border rounded-sm p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between pb-5 border-b border-surface-border">
          <div className="flex items-center gap-4">
            {worker.profileImage ? (
              <img
                src={worker.profileImage}
                alt={worker.name}
                className="w-16 h-16 rounded-sm object-cover border border-surface-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-sm bg-navy text-white text-xl font-bold flex items-center justify-center uppercase">
                {worker.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-navy">{worker.name}</h1>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${
                  worker.status === 'active' ? 'bg-green-100 text-status-success' : 'bg-red-100 text-status-danger'
                }`}>
                  {worker.status}
                </span>
              </div>
              <p className="text-xs text-surface-secondary mt-0.5">
                Worker ID: <span className="font-mono font-semibold text-navy">{worker.workerId}</span> • {worker.workerType}
              </p>
              <p className="text-xs text-surface-secondary mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{worker.mobile}</span>
              </p>
            </div>
          </div>

          {/* Wallet Balance Hero Box */}
          <div className="w-full md:w-auto p-4 bg-surface-bg border border-surface-border rounded-sm text-left md:text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-secondary block">
              Current Ledger Balance
            </span>
            <div className={`text-2xl font-bold mt-1 ${
              isNegative ? 'text-status-danger' : isPositive ? 'text-status-success' : 'text-navy'
            }`}>
              {isNegative ? `-₹${Math.abs(worker.walletBalance)}` : `₹${worker.walletBalance}`}
            </div>
            <p className="text-[10px] text-surface-secondary mt-0.5 font-medium">
              {isNegative ? 'Business Owes Worker' : isPositive ? 'Advance Balance with Worker' : 'Settled Balance'}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[11px] text-surface-secondary font-medium">Daily Wage</span>
            <p className="text-base font-bold text-navy mt-0.5">₹{worker.dailyWage}</p>
          </div>
          <div>
            <span className="text-[11px] text-surface-secondary font-medium">Full Attendance</span>
            <p className="text-base font-bold text-navy mt-0.5">{summary?.totalFull || 0} Days</p>
          </div>
          <div>
            <span className="text-[11px] text-surface-secondary font-medium">Half Attendance</span>
            <p className="text-base font-bold text-navy mt-0.5">{summary?.totalHalf || 0} Slots</p>
          </div>
          <div>
            <span className="text-[11px] text-surface-secondary font-medium">Total Units Earned</span>
            <p className="text-base font-bold text-navy mt-0.5">{summary?.totalUnits || 0}</p>
          </div>
        </div>
      </div>

      {/* Profile Details Navigation Tabs */}
      <div className="flex border-b border-surface-border bg-white rounded-t-sm px-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'summary'
              ? 'border-navy text-navy'
              : 'border-transparent text-surface-secondary hover:text-navy'
          }`}
        >
          Personal & Bank Details
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'attendance'
              ? 'border-navy text-navy'
              : 'border-transparent text-surface-secondary hover:text-navy'
          }`}
        >
          Attendance History
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'ledger'
              ? 'border-navy text-navy'
              : 'border-transparent text-surface-secondary hover:text-navy'
          }`}
        >
          Wallet & Transactions
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-t-0 border-surface-border rounded-b-sm p-5">
        {activeTab === 'summary' && (
          <div className="space-y-6 text-xs">
            {/* Personal Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-navy uppercase tracking-wider text-xs border-b border-surface-border pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-surface-secondary block">Address:</span>
                  <span className="font-medium text-navy">{worker.address || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-surface-secondary block">Joining Date:</span>
                  <span className="font-medium text-navy">
                    {new Date(worker.joiningDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-surface-secondary block">Worker Role:</span>
                  <span className="font-medium text-navy">{worker.workerType}</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-navy uppercase tracking-wider text-xs border-b border-surface-border pb-2">
                Bank & Payment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-surface-secondary block">Bank Name:</span>
                  <span className="font-medium text-navy">
                    {worker.bankDetails?.bankName || 'Not Set'}
                  </span>
                </div>
                <div>
                  <span className="text-surface-secondary block">Account Number:</span>
                  <span className="font-medium text-navy font-mono">
                    {worker.bankDetails?.accountNumber || 'Not Set'}
                  </span>
                </div>
                <div>
                  <span className="text-surface-secondary block">IFSC Code:</span>
                  <span className="font-medium text-navy font-mono">
                    {worker.bankDetails?.ifscCode || 'Not Set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents Preview (Aadhaar) */}
            <div className="space-y-3">
              <h3 className="font-bold text-navy uppercase tracking-wider text-xs border-b border-surface-border pb-2">
                Documents (Sensitive / Protected)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-surface-border p-3 rounded-sm">
                  <span className="font-semibold text-navy block mb-2">Aadhaar Card Front</span>
                  {worker.aadhaarFront ? (
                    <img
                      src={worker.aadhaarFront}
                      alt="Aadhaar Front"
                      className="max-h-48 rounded-sm border border-surface-border object-contain"
                    />
                  ) : (
                    <p className="text-slate-400 italic">No Aadhaar front image uploaded.</p>
                  )}
                </div>

                <div className="border border-surface-border p-3 rounded-sm">
                  <span className="font-semibold text-navy block mb-2">Aadhaar Card Back</span>
                  {worker.aadhaarBack ? (
                    <img
                      src={worker.aadhaarBack}
                      alt="Aadhaar Back"
                      className="max-h-48 rounded-sm border border-surface-border object-contain"
                    />
                  ) : (
                    <p className="text-slate-400 italic">No Aadhaar back image uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Date-wise Attendance Records
              </h3>
              <span className="text-xs text-surface-secondary">
                Total Units Logged: <strong className="text-navy">{summary?.totalUnits || 0}</strong>
              </span>
            </div>

            {attendances.length === 0 ? (
              <p className="text-xs text-surface-secondary py-8 text-center">
                No attendance logs found for this worker yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Slot Status</th>
                      <th className="py-2.5 px-3 text-center">Units</th>
                      <th className="py-2.5 px-3 text-right">Daily Rate</th>
                      <th className="py-2.5 px-3 text-right">Earned Wage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {attendances.map((att) => (
                      <tr key={att._id} className="hover:bg-surface-bg/40">
                        <td className="py-2.5 px-3 font-medium text-navy">{att.date}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {att.fullAttendance && (
                              <span className="px-1.5 py-0.5 bg-green-50 text-status-success border border-green-200 rounded-sm font-semibold text-[10px]">
                                Full Day (1.0)
                              </span>
                            )}
                            {att.halfAttendance && (
                              <span className="px-1.5 py-0.5 bg-amber-50 text-status-amber border border-amber-200 rounded-sm font-semibold text-[10px]">
                                Half Day (0.5)
                              </span>
                            )}
                            {!att.fullAttendance && !att.halfAttendance && (
                              <span className="px-1.5 py-0.5 bg-red-50 text-status-danger border border-red-200 rounded-sm font-semibold text-[10px]">
                                Absent (0)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-navy">
                          {att.attendanceUnits}
                        </td>
                        <td className="py-2.5 px-3 text-right text-surface-secondary">
                          ₹{att.wageRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-navy">
                          ₹{att.earnedAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Financial Transaction Ledger
              </h3>
              <div className="text-xs">
                <span>Net Balance: </span>
                <strong className={isNegative ? 'text-status-danger' : 'text-status-success'}>
                  {isNegative ? `-₹${Math.abs(worker.walletBalance)}` : `₹${worker.walletBalance}`}
                </strong>
              </div>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-surface-secondary py-8 text-center">
                No ledger transactions recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-surface-bg/40">
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-navy">
                          {tx.type}
                        </td>
                        <td className="py-2.5 px-3 text-surface-secondary">
                          {tx.description}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          {tx.direction === 'credit' ? (
                            <span className="text-status-success">+₹{tx.amount}</span>
                          ) : (
                            <span className="text-status-danger">-₹{tx.amount}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-navy">
                          ₹{tx.balanceAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
