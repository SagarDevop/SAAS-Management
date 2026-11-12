import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function TransactionModal({ isOpen, onClose, workers = [], preselectedWorkerId, onSuccess }) {
  if (!isOpen) return null;

  const [workerId, setWorkerId] = useState(preselectedWorkerId || (workers[0]?._id || ''));
  const [type, setType] = useState('Advance Given');
  const [amount, setAmount] = useState('');
  const [adjustmentDirection, setAdjustmentDirection] = useState('credit');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!workerId || !amount || Number(amount) <= 0) {
      setError('Please select a worker and enter a valid positive amount.');
      return;
    }

    if (type === 'Other Adjustment' && !description.trim()) {
      setError('A mandatory description is required for Other Adjustment.');
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

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-surface-border w-full max-w-md rounded-sm shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Record Financial Transaction
            </h3>
            <p className="text-xs text-surface-secondary">
              Update worker ledger (Advance, Bonus, Payment, Adjustment)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-surface-secondary hover:text-navy rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
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
            <label className="block text-navy font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Select Worker *
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              required
              className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
            >
              <option value="">-- Choose Worker --</option>
              {workers.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.workerId})
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-navy font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Transaction Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
            >
              <option value="Advance Given">Advance Given (+ Balance)</option>
              <option value="Salary/Payment Given">Salary/Payment Given (+ Balance)</option>
              <option value="Bonus Given">Bonus Given (- Balance, business liability)</option>
              <option value="Other Adjustment">Other Adjustment (Custom)</option>
            </select>
          </div>

          {/* Direction if Other Adjustment */}
          {type === 'Other Adjustment' && (
            <div>
              <label className="block text-navy font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Adjustment Direction *
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
                  <span>Credit (+ Balance, e.g. worker refund)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="direction"
                    value="debit"
                    checked={adjustmentDirection === 'debit'}
                    onChange={() => setAdjustmentDirection('debit')}
                  />
                  <span>Debit (- Balance, e.g. penalty or addition)</span>
                </label>
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-navy font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy font-semibold"
              />
            </div>

            <div>
              <label className="block text-navy font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-navy font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Description {type === 'Other Adjustment' && '*'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Site advance, Diwali bonus, Weekly payment"
              className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
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
              className="px-5 py-2 bg-navy hover:bg-navy-800 text-white font-semibold rounded-sm uppercase tracking-wider disabled:opacity-60"
            >
              {loading ? 'Recording...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

