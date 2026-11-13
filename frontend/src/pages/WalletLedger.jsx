import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Search, 
  Filter, 
  CreditCard, 
  Gift, 
  History,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TransactionModal from '../components/TransactionModal';
import { ListSkeleton } from '../components/ui/Skeletons';

export default function WalletLedger() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('all'); // all, payable, advance, settled
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState('Advance Given');
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

  const handleOpenTransaction = (type = 'Advance Given', workerId = '') => {
    setModalInitialType(type);
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

  if (loading && !data) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Clear Quick Action Buttons */}
      <div className="bg-white p-4 sm:p-5 border border-surface-border rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-surface-secondary tracking-wider block">
            Financial Ledger
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-navy tracking-tight mt-0.5">
            Money / Hisab Management
          </h1>
          <p className="text-xs text-surface-secondary mt-0.5">
            Advances, payments, bonuses, and worker ledger balances
          </p>
        </div>

        {/* 3 Prominent Separate Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenTransaction('Advance Given')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-navy hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Give Advance</span>
          </button>

          <button
            onClick={() => handleOpenTransaction('Salary/Payment Given')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-surface-bg border border-surface-border text-navy text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-navy" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => handleOpenTransaction('Bonus Given')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-surface-bg border border-surface-border text-navy text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer"
          >
            <Gift className="w-4 h-4 text-status-amber" />
            <span>Add Bonus</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Money Remaining to Pay */}
        <div className="p-4 bg-white border border-red-200 bg-red-50/20 rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-surface-secondary mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Money Remaining (Dena Hai)</span>
            <AlertCircle className="w-4 h-4 text-status-danger" />
          </div>
          <div className="text-2xl font-bold text-status-danger tracking-tight font-mono">
            ₹{summary.totalOutstandingPayable}
          </div>
          <p className="text-[10px] text-surface-secondary mt-1 font-medium">
            Pending wages payable to workers
          </p>
        </div>

        {/* Total Advances Given */}
        <div className="p-4 bg-white border border-green-200 bg-green-50/20 rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-surface-secondary mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Advances Given</span>
            <ArrowUpRight className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-2xl font-bold text-status-success tracking-tight font-mono">
            ₹{summary.totalAdvancesOutstanding}
          </div>
          <p className="text-[10px] text-surface-secondary mt-1 font-medium">
            Advance balances currently with workers
          </p>
        </div>

        {/* Total Wallets Monitored */}
        <div className="p-4 bg-white border border-surface-border rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-surface-secondary mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Worker Wallets</span>
            <Wallet className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-navy tracking-tight">
            {summary.totalWalletCount}
          </div>
          <p className="text-[10px] text-surface-secondary mt-1 font-medium">
            Active and registered labour accounts
          </p>
        </div>
      </div>

      {/* 3. Worker Ledger Table with Search & Filter */}
      <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-surface-border">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-surface-secondary">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search worker by name, ID, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-surface-secondary uppercase text-[10px]">Filter:</span>
            <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              className="text-xs p-2 bg-surface-bg border border-surface-border rounded-sm text-navy font-semibold outline-none"
            >
              <option value="all">All Wallets</option>
              <option value="payable">Payable (Dena Hai - Negative)</option>
              <option value="advance">Advance (Worker Ke Paas - Positive)</option>
              <option value="settled">Settled (₹0)</option>
            </select>
          </div>
        </div>

        {loading && !data ? (
          <ListSkeleton />
        ) : workerLedgers.length === 0 ? (
          <div className="p-8 text-center text-xs text-surface-secondary">
            No worker records match your search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Worker Details</th>
                  <th className="py-2.5 px-3 text-right">Daily Wage</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {workerLedgers.map((w) => {
                  const isNeg = w.walletBalance < 0;
                  const isPos = w.walletBalance > 0;

                  return (
                    <tr key={w._id} className="hover:bg-surface-bg/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-navy">{w.name}</div>
                        <span className="text-[10px] text-surface-secondary font-mono">
                          {w.workerId} • {w.mobile}
                        </span>
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
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                          isNeg
                            ? 'bg-red-50 text-status-danger'
                            : isPos
                            ? 'bg-green-50 text-status-success'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isNeg ? 'Dena Hai' : isPos ? 'Advance' : 'Chukta'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTransaction('Advance Given', w._id)}
                            className="px-2.5 py-1 bg-surface-bg hover:bg-navy hover:text-white border border-surface-border text-navy rounded-sm font-bold text-[11px] transition-colors"
                          >
                            + Advance
                          </button>
                          <Link
                            to={`/workers/${w._id}`}
                            className="text-navy font-bold hover:underline text-[11px]"
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

      {/* 4. Recent Payment & Advance History */}
      <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5 shadow-sm">
        <div className="mb-4 pb-2 border-b border-surface-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-navy" />
              <span>Recent Payment & Advance History</span>
            </h3>
            <p className="text-xs text-surface-secondary">Audit log of latest money movements</p>
          </div>
          <span className="text-xs text-surface-secondary font-mono">
            Last {recentTransactions.length} entries
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-surface-secondary">
            No payment or advance history available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Worker</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Note</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-surface-bg/40">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-navy">
                      {tx.workerId?.name || 'Worker'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-navy">
                      {tx.type}
                    </td>
                    <td className="py-2.5 px-3 text-surface-secondary">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono">
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

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workers={data?.workerLedgers || []}
        preselectedWorkerId={selectedWorkerId}
        initialType={modalInitialType}
        onSuccess={fetchWallet}
      />
    </div>
  );
}
