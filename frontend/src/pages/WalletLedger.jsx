import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TransactionModal from '../components/TransactionModal';

export default function WalletLedger() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('all'); // all, negative (owes), positive (advance)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallet/summary');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleOpenTransaction = (workerId = '') => {
    setSelectedWorkerId(workerId);
    setIsModalOpen(true);
  };

  const summary = data?.summary || {
    totalOutstandingPayable: 0,
    totalAdvancesOutstanding: 0,
    totalWalletCount: 0
  };

  const workerLedgers = (data?.workerLedgers || []).filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.workerId.toLowerCase().includes(search.toLowerCase()) ||
      w.mobile.includes(search);

    if (!matchesSearch) return false;

    if (balanceFilter === 'payable') return w.walletBalance < 0;
    if (balanceFilter === 'advance') return w.walletBalance > 0;
    if (balanceFilter === 'settled') return w.walletBalance === 0;
    return true;
  });

  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="space-y-6">
      {/* Top Header & New Transaction Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 border border-surface-border rounded-sm">
        <div>
          <h2 className="text-base font-bold text-navy uppercase tracking-wider">
            Worker Wallet & Ledger
          </h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            Real-time ledger accounting: Advances, Bonuses, Payments, and Outstanding Payables
          </p>
        </div>
        <button
          onClick={() => handleOpenTransaction('')}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-navy hover:bg-navy-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Hero Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Outstanding Payable */}
        <div className="p-4 bg-white border border-red-200 bg-red-50/20 rounded-sm">
          <div className="flex items-center justify-between text-surface-secondary mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Outstanding Payable</span>
            <AlertCircle className="w-4 h-4 text-status-danger" />
          </div>
          <div className="text-2xl font-bold text-status-danger tracking-tight">
            ₹{summary.totalOutstandingPayable}
          </div>
          <p className="text-[10px] text-surface-secondary mt-1 font-medium">
            Accumulated labour earnings owed to workers
          </p>
        </div>

        {/* Total Advance Outstanding */}
        <div className="p-4 bg-white border border-green-200 bg-green-50/20 rounded-sm">
          <div className="flex items-center justify-between text-surface-secondary mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Advances Given</span>
            <ArrowUpRight className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-2xl font-bold text-status-success tracking-tight">
            ₹{summary.totalAdvancesOutstanding}
          </div>
          <p className="text-[10px] text-surface-secondary mt-1 font-medium">
            Advance balances currently held by workers
          </p>
        </div>

        {/* Net Business Position */}
        <div className="p-4 bg-white border border-surface-border rounded-sm">
          <div className="flex items-center justify-between text-surface-secondary mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net Position</span>
            <Wallet className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-navy tracking-tight">
            {summary.totalOutstandingPayable > summary.totalAdvancesOutstanding ? (
              <span className="text-status-danger">
                -₹{summary.totalOutstandingPayable - summary.totalAdvancesOutstanding}
              </span>
            ) : (
              <span className="text-status-success">
                +₹{summary.totalAdvancesOutstanding - summary.totalOutstandingPayable}
              </span>
            )}
          </div>
          <p className="text-[10px] text-surface-secondary mt-1 font-medium">
            Across {summary.totalWalletCount} registered worker wallets
          </p>
        </div>
      </div>

      {/* Filter and Worker Ledger Table */}
      <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5 space-y-4">
        {/* Search & Ledger Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-surface-border">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-surface-secondary">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search worker by name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 text-xs text-surface-secondary">
              <Filter className="w-3.5 h-3.5" />
              <span>Balance:</span>
            </div>
            <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              className="text-xs p-1.5 bg-surface-bg border border-surface-border rounded-sm text-navy focus:outline-none"
            >
              <option value="all">All Wallets</option>
              <option value="payable">Payable (Negative Balance)</option>
              <option value="advance">Advance (Positive Balance)</option>
              <option value="settled">Settled (₹0)</option>
            </select>
          </div>
        </div>

        {/* Worker Balance List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-navy">Loading ledger records...</div>
        ) : workerLedgers.length === 0 ? (
          <div className="p-8 text-center text-xs text-surface-secondary">No workers match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Worker Details</th>
                  <th className="py-2.5 px-3 text-right">Daily Wage</th>
                  <th className="py-2.5 px-3 text-right">Current Balance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {workerLedgers.map((w) => {
                  const isNeg = w.walletBalance < 0;
                  const isPos = w.walletBalance > 0;

                  return (
                    <tr key={w._id} className="hover:bg-surface-bg/40">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-navy">{w.name}</div>
                        <span className="text-[10px] text-surface-secondary font-mono">{w.workerId} • {w.mobile}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-navy">
                        ₹{w.dailyWage}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-sm font-mono">
                        <span className={isNeg ? 'text-status-danger' : isPos ? 'text-status-success' : 'text-navy'}>
                          {isNeg ? `-₹${Math.abs(w.walletBalance)}` : `₹${w.walletBalance}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-sm ${
                          isNeg
                            ? 'bg-red-50 text-status-danger'
                            : isPos
                            ? 'bg-green-50 text-status-success'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isNeg ? 'Payable' : isPos ? 'Advance' : 'Settled'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTransaction(w._id)}
                            className="px-2.5 py-1 bg-surface-bg hover:bg-navy hover:text-white border border-surface-border text-navy rounded-sm font-semibold transition-colors text-[11px]"
                          >
                            + Record Entry
                          </button>
                          <Link
                            to={`/workers/${w._id}`}
                            className="text-navy font-semibold hover:underline text-[11px]"
                          >
                            Statement
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Recent Audit Trail */}
      <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5">
        <div className="mb-4 pb-2 border-b border-surface-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Recent Financial Audit Log
            </h3>
            <p className="text-xs text-surface-secondary">Latest ledger movements across all workers</p>
          </div>
          <span className="text-xs text-surface-secondary">
            Last {recentTransactions.length} records
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-surface-secondary">
            No financial transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Worker</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-surface-bg/40">
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-navy">
                      {tx.workerId?.name || 'Worker'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-navy">
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

      {/* Transaction Recording Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workers={data?.workerLedgers || []}
        preselectedWorkerId={selectedWorkerId}
        onSuccess={fetchWallet}
      />
    </div>
  );
}

