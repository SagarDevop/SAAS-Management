import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function WorkerModal({ isOpen, onClose, worker, onSave }) {
  if (!isOpen) return null;

  const isEditing = !!worker;
  const [formData, setFormData] = useState({
    name: worker?.name || '',
    mobile: worker?.mobile || '',
    dailyWage: worker?.dailyWage || '',
    openingBalance: worker?.openingBalance || 0,
    workerType: worker?.workerType || 'Painter',
    address: worker?.address || '',
    bankAccount: worker?.bankDetails?.accountNumber || '',
    ifsc: worker?.bankDetails?.ifscCode || '',
    bankName: worker?.bankDetails?.bankName || '',
    profileImage: worker?.profileImage || '',
    aadhaarFront: worker?.aadhaarFront || '',
    aadhaarBack: worker?.aadhaarBack || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWhatsAppOption, setShowWhatsAppOption] = useState(false);
  const [createdWorker, setCreatedWorker] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('docType', fieldName);

    try {
      const res = await api.post('/media/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
      }
    } catch (err) {
      setError('File upload failed. Ensure image is under 5MB.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.mobile.trim() || !formData.dailyWage) {
      setError('Full Name, Mobile Number, and Daily Wage are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        dailyWage: Number(formData.dailyWage),
        openingBalance: Number(formData.openingBalance),
        workerType: formData.workerType,
        address: formData.address,
        profileImage: formData.profileImage,
        aadhaarFront: formData.aadhaarFront,
        aadhaarBack: formData.aadhaarBack,
        bankDetails: {
          accountNumber: formData.bankAccount,
          ifscCode: formData.ifsc,
          bankName: formData.bankName,
        }
      };

      let res;
      if (isEditing) {
        res = await api.put(`/workers/${worker._id}`, payload);
      } else {
        res = await api.post('/workers', payload);
      }

      if (res.data?.success) {
        if (!isEditing) {
          setCreatedWorker(res.data.worker);
          setShowWhatsAppOption(true);
        } else {
          onSave(res.data.worker);
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save worker.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRegistration = () => {
    if (createdWorker) {
      onSave(createdWorker);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-surface-border w-full max-w-2xl rounded-sm shadow-xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              {isEditing ? `Edit Worker (${worker.workerId})` : 'Register New Worker'}
            </h3>
            <p className="text-xs text-surface-secondary">
              {isEditing ? 'Update profile and document details' : 'Enter worker details. ID is generated automatically.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-surface-secondary hover:text-navy rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-status-danger text-status-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {showWhatsAppOption ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-status-success rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy">Registration Successful!</h4>
                <p className="text-surface-secondary mt-1">
                  Worker <strong>{createdWorker?.name}</strong> registered with ID <strong>{createdWorker?.workerId}</strong>.
                </p>
              </div>

              <div className="p-4 bg-surface-bg border border-surface-border rounded-sm text-left max-w-md mx-auto space-y-2">
                <span className="font-semibold text-navy">Welcome WhatsApp Message:</span>
                <p className="text-surface-secondary text-[11px] italic bg-white p-2.5 border border-surface-border rounded-sm">
                  "Welcome to ShreeDev Paint Service, {createdWorker?.name}. Your registration is complete with Worker ID: {createdWorker?.workerId}."
                </p>
                <p className="text-[10px] text-slate-500">
                  Note: Messaging will be dispatched once WhatsApp Business API is connected.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinishRegistration}
                  className="px-5 py-2.5 bg-navy text-white text-xs font-semibold rounded-sm uppercase tracking-wider hover:bg-navy-800"
                >
                  Done & View Workers
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mandatory Section */}
              <div className="p-3.5 bg-surface-bg/60 border border-surface-border rounded-sm space-y-3">
                <span className="font-bold text-navy uppercase tracking-wider text-[11px] block">
                  Mandatory Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-navy font-semibold mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-navy font-semibold mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-navy font-semibold mb-1">
                      Daily Wage (₹) *
                    </label>
                    <input
                      type="number"
                      name="dailyWage"
                      required
                      min="0"
                      value={formData.dailyWage}
                      onChange={handleChange}
                      placeholder="e.g. 600"
                      className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>
              </div>

              {/* General Profile Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy font-semibold mb-1">Worker Type</label>
                  <select
                    name="workerType"
                    value={formData.workerType}
                    onChange={handleChange}
                    className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
                  >
                    <option value="Painter">Painter</option>
                    <option value="Helper">Helper</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-navy font-semibold mb-1">
                      Opening Balance (₹)
                    </label>
                    <input
                      type="number"
                      name="openingBalance"
                      value={formData.openingBalance}
                      onChange={handleChange}
                      placeholder="0 (negative if owes worker, positive if advance)"
                      className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-navy font-semibold mb-1">Address / Notes</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address or local residence"
                  className="w-full p-2 bg-white border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              {/* Bank Details (Optional) */}
              <div className="p-3 bg-surface-bg/30 border border-surface-border rounded-sm space-y-2">
                <span className="font-semibold text-navy uppercase text-[10px] tracking-wider block">
                  Bank Details (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    placeholder="Account Number"
                    className="p-2 bg-white border border-surface-border rounded-sm text-navy"
                  />
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    placeholder="IFSC Code"
                    className="p-2 bg-white border border-surface-border rounded-sm text-navy"
                  />
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Bank Name"
                    className="p-2 bg-white border border-surface-border rounded-sm text-navy"
                  />
                </div>
              </div>

              {/* Photo & Aadhaar Uploads (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="border border-surface-border p-3 rounded-sm text-center">
                  <label className="block text-navy font-semibold mb-1">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profileImage')}
                    className="text-[10px] w-full text-slate-500"
                  />
                  {formData.profileImage && (
                    <span className="text-[10px] text-status-success font-medium block mt-1">Image Loaded ✓</span>
                  )}
                </div>

                <div className="border border-surface-border p-3 rounded-sm text-center">
                  <label className="block text-navy font-semibold mb-1">Aadhaar Front</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'aadhaarFront')}
                    className="text-[10px] w-full text-slate-500"
                  />
                  {formData.aadhaarFront && (
                    <span className="text-[10px] text-status-success font-medium block mt-1">Uploaded ✓</span>
                  )}
                </div>

                <div className="border border-surface-border p-3 rounded-sm text-center">
                  <label className="block text-navy font-semibold mb-1">Aadhaar Back</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'aadhaarBack')}
                    className="text-[10px] w-full text-slate-500"
                  />
                  {formData.aadhaarBack && (
                    <span className="text-[10px] text-status-success font-medium block mt-1">Uploaded ✓</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-2">
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
                  {loading ? 'Saving...' : isEditing ? 'Update Worker' : 'Register Worker'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

