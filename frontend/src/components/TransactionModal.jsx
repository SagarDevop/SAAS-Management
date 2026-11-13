import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowUpRight, Gift, CreditCard, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  workers = [], 
  preselectedWorkerId = '', 
  initialType = 'Advance Given',
  onSuccess 
}) {
  if (!isOpen) return null;

  const [workerId, setWorkerId] = useState(preselectedWorkerId || (workers[0]?._id || ''));
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [adjustmentDirection, setAdjustmentDirection] = useState('credit');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedWorkerId) setWorkerId(preselectedWorkerId);
    if (initialType) setType(initialType);
  }, [preselectedWorkerId, initialType, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!workerId || !amount || Number(amount) <= 0) {
      setError('Please select a worker and enter a valid positive amount.');
      return;
    }

    if (type === 'Other Adjustment' && !description.trim()) {
      setError('A mandatory description is required for custom adjustments.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/wallet/transaction', {
        workerId,
        type,
        amount: Number(amount),
        adjustmentDirection,
        description,
        date
      });

      if (res.data?.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction could not be recorded.');
    } finally {
      setLoading(false);
    }
  };

  // Distinct action badges
  const actionTabs = [
    { key: 'Advance Given', label: 'Give Advance', icon: ArrowUpRight, desc: 'Paisey diye (Advance kharcha)' },
    { key: 'Salary/Payment Given', label: 'Record Payment', icon: CreditCard, desc: 'Hisaab chukaya (Clear wages)' },
    { key: 'Bonus Given', label: 'Add Bonus', icon: Gift, desc: 'Inaam / Bonus diya' },
    { key: 'Other Adjustment', label: 'Adjustment', icon: SlidersHorizontal, desc: 'Custom debit/credit' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-surface-border w-full max-w-lg rounded-sm shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-bg/40">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Record Money / Hisab Entry
            </h3>
            <p className="text-xs text-surface-secondary mt-0.5">
              Select transaction type and enter amount for worker
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-surface-secondary hover:text-navy rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Selector Tabs (Separate clear buttons) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-3 bg-surface-bg border-b border-surface-border">
          {actionTabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = type === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setType(tab.key)}
                className={`p-2 flex flex-col items-center justify-center text-center rounded-sm transition-all border ${
                  isSelected
                    ? 'bg-navy text-white border-navy font-bold shadow-sm'
                    : 'bg-white border-surface-border text-surface-secondary hover:text-navy hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[11px] leading-tight font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-status-danger text-status-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Worker */}
          <div>
            <label className="block text-navy font-bold mb-1 uppercase tracking-wider text-[10px]">
              Select Worker *
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy text-xs"
            >
              <option value="">-- Choose Worker --</option>
              {workers.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.workerId}) — Daily Wage: ₹{w.dailyWage}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-navy font-bold mb-1 uppercase tracking-wider text-[10px]">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full p-2.5 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-navy font-bold mb-1 uppercase tracking-wider text-[10px]">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy text-xs"
              />
            </div>
          </div>

          {/* Direction if Other Adjustment */}
          {type === 'Other Adjustment' && (
            <div className="p-3 bg-surface-bg border border-surface-border rounded-sm space-y-1.5">
              <label className="block text-navy font-bold uppercase tracking-wider text-[10px]">
                Adjustment Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    value="credit"
                    checked={adjustmentDirection === 'credit'}
                    onChange={() => setAdjustmentDirection('credit')}
                  />
                  <span>Credit (+ Balance / Worker refund)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    value="debit"
                    checked={adjustmentDirection === 'debit'}
                    onChange={() => setAdjustmentDirection('debit')}
                  />
                  <span>Debit (- Balance / Penalty or cut)</span>
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-navy font-bold mb-1 uppercase tracking-wider text-[10px]">
              Note / Description {type === 'Other Adjustment' && '*'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Site cash advance, Weekly payment, Diwali bonus"
              className="w-full p-2.5 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-surface-border text-navy rounded-sm hover:bg-surface-bg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-navy hover:bg-navy-800 text-white font-bold rounded-sm uppercase tracking-wider disabled:opacity-60 text-xs shadow-sm"
            >
              {loading ? 'Recording...' : `Confirm ${type.split(' ')[0]}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
