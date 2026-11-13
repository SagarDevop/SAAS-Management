import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit3, 
  Power,
  Phone,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import WorkerModal from '../components/WorkerModal';
import { ListSkeleton } from '../components/ui/Skeletons';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/workers', { params });
      if (res.data?.success) {
        setWorkers(res.data.workers);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [search, statusFilter]);

  const handleToggleStatus = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/workers/${id}/status`);
      if (res.data?.success) {
        setWorkers(prev =>
          prev.map(w => w._id === id ? { ...w, status: res.data.status } : w)
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (worker, e) => {
    e.stopPropagation();
    setEditingWorker(worker);
    setIsModalOpen(true);
  };

  const handleSaveWorker = () => {
    fetchWorkers();
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 border border-surface-border rounded-sm">
        <div>
          <h2 className="text-base font-bold text-navy uppercase tracking-wider">
            Worker Management
          </h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            Maintain daily workers, personal profiles, wage rates, and contact details
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-navy hover:bg-navy-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Worker</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 border border-surface-border rounded-sm flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-surface-secondary">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, ID, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:border-navy"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-surface-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 bg-surface-bg border border-surface-border rounded-sm text-navy focus:outline-none"
          >
            <option value="all">All Workers</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Worker List Cards / Desktop Table */}
      {loading && workers.length === 0 ? (
        <ListSkeleton />
      ) : workers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-surface-border rounded-sm space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-medium text-navy">No workers found</p>
          <p className="text-xs text-surface-secondary">Add your first worker to start logging attendance and managing wages.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-sm uppercase tracking-wider"
          >
            Add Worker
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {workers.map((worker) => {
            const isNegative = worker.walletBalance < 0;
            const isPositive = worker.walletBalance > 0;

            return (
              <div
                key={worker._id}
                className="bg-white border border-surface-border rounded-sm p-4 flex flex-col justify-between hover:border-navy/50 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-surface-border">
                    <div className="flex items-center gap-2.5">
                      {worker.profileImage ? (
                        <img
                          src={worker.profileImage}
                          alt={worker.name}
                          className="w-10 h-10 rounded-sm object-cover border border-surface-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-sm bg-navy text-white flex items-center justify-center font-bold text-xs uppercase">
                          {worker.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-navy">{worker.name}</h3>
                        <span className="text-[10px] text-surface-secondary font-mono">
                          {worker.workerId} • {worker.workerType}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${
                        worker.status === 'active'
                          ? 'bg-green-100 text-status-success'
                          : 'bg-red-100 text-status-danger'
                      }`}
                    >
                      {worker.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-surface-secondary mt-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mobile:</span>
                      </span>
                      <span className="font-medium text-navy">{worker.mobile}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Daily Wage:</span>
                      <span className="font-bold text-navy">₹{worker.dailyWage}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-surface-border/60">
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ledger Balance:</span>
                      </span>
                      <span
                        className={`font-bold ${
                          isNegative
                            ? 'text-status-danger'
                            : isPositive
                            ? 'text-status-success'
                            : 'text-navy'
                        }`}
                      >
                        {isNegative ? `-₹${Math.abs(worker.walletBalance)}` : `₹${worker.walletBalance}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between gap-1 text-xs">
                  <Link
                    to={`/workers/${worker._id}`}
                    className="inline-flex items-center gap-1 text-navy font-semibold hover:underline"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(worker, e)}
                      title="Edit Profile"
                      className="p-1.5 text-surface-secondary hover:text-navy hover:bg-surface-bg rounded-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleStatus(worker._id, e)}
                      title={worker.status === 'active' ? 'Deactivate' : 'Activate'}
                      className="p-1.5 text-surface-secondary hover:text-navy hover:bg-surface-bg rounded-sm"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Worker Creation / Edit Modal */}
      <WorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        worker={editingWorker}
        onSave={handleSaveWorker}
      />
    </div>
  );
}

