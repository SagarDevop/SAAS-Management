import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Check, 
  Save, 
  CheckSquare, 
  Square, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [attendanceList, setAttendanceList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchAttendance = async (date) => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.get(`/attendance?date=${date}`);
      if (res.data?.success) {
        setAttendanceList(res.data.attendanceList);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (days) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  // Toggle individual worker slot
  const handleToggleSlot = (workerId, slot) => {
    setAttendanceList(prev =>
      prev.map(item => {
        if (item.workerId === workerId) {
          const newFull = slot === 'full' ? !item.fullAttendance : item.fullAttendance;
          const newHalf = slot === 'half' ? !item.halfAttendance : item.halfAttendance;
          let units = 0;
          if (newFull) units += 1.0;
          if (newHalf) units += 0.5;
          const earned = Math.round(units * item.dailyWage);

          return {
            ...item,
            fullAttendance: newFull,
            halfAttendance: newHalf,
            attendanceUnits: units,
            earnedAmount: earned
          };
        }
        return item;
      })
    );
  };

  // Set all workers to Full attendance
  const handleMarkAllFull = () => {
    setAttendanceList(prev =>
      prev.map(item => ({
        ...item,
        fullAttendance: true,
        halfAttendance: false,
        attendanceUnits: 1.0,
        earnedAmount: item.dailyWage
      }))
    );
  };

  // Clear all to Absent
  const handleClearAll = () => {
    setAttendanceList(prev =>
      prev.map(item => ({
        ...item,
        fullAttendance: false,
        halfAttendance: false,
        attendanceUnits: 0,
        earnedAmount: 0
      }))
    );
  };

  // Save attendance
  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      const records = attendanceList.map(item => ({
        workerId: item.workerId,
        fullAttendance: item.fullAttendance,
        halfAttendance: item.halfAttendance,
        notes: item.notes || ''
      }));

      const res = await api.post('/attendance/bulk', {
        date: selectedDate,
        records
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Attendance for ${selectedDate} saved and worker wallets updated!` });
        fetchAttendance(selectedDate);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  // Compute live screen totals
  const liveTotalUnits = attendanceList.reduce((acc, cur) => acc + (cur.attendanceUnits || 0), 0);
  const liveTotalExpense = attendanceList.reduce((acc, cur) => acc + (cur.earnedAmount || 0), 0);
  const livePresentWorkers = attendanceList.filter(w => w.fullAttendance || w.halfAttendance).length;

  return (
    <div className="space-y-5">
      {/* Top Controls: Date Selector & Quick Actions */}
      <div className="bg-white p-4 border border-surface-border rounded-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 border border-surface-border rounded-sm hover:bg-surface-bg text-navy"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-surface-border rounded-sm bg-surface-bg/40">
            <Calendar className="w-4 h-4 text-surface-secondary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-navy bg-transparent outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 border border-surface-border rounded-sm hover:bg-surface-bg text-navy"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-[11px] font-semibold text-navy hover:underline px-2"
          >
            Today
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkAllFull}
            className="px-3 py-2 border border-surface-border text-navy hover:bg-surface-bg text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
          >
            Mark All Full
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 border border-surface-border text-surface-secondary hover:bg-surface-bg text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-navy hover:bg-navy-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 border-l-4 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 border-status-success text-status-success'
              : 'bg-red-50 border-status-danger text-status-danger'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Live Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 border border-surface-border rounded-sm text-xs">
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-semibold">Active Workers</span>
          <span className="text-base font-bold text-navy mt-0.5 block">{attendanceList.length}</span>
        </div>
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-semibold">Marked Present</span>
          <span className="text-base font-bold text-navy mt-0.5 block">{livePresentWorkers}</span>
        </div>
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-semibold">Attendance Units</span>
          <span className="text-base font-bold text-navy mt-0.5 block">{liveTotalUnits.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-semibold">Total Wage Expense</span>
          <span className="text-base font-bold text-navy mt-0.5 block">₹{liveTotalExpense}</span>
        </div>
      </div>

      {/* Bulk Attendance Worker List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-navy bg-white border border-surface-border">
          Loading worker attendance records...
        </div>
      ) : attendanceList.length === 0 ? (
        <div className="p-12 text-center text-xs text-surface-secondary bg-white border border-surface-border">
          No active workers registered. Please add workers in the Workers module first.
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceList.map((item) => {
            const hasFull = item.fullAttendance;
            const hasHalf = item.halfAttendance;
            const isAbsent = !hasFull && !hasHalf;

            return (
              <div
                key={item.workerId}
                className={`bg-white border rounded-sm p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isAbsent
                    ? 'border-surface-border'
                    : 'border-navy/40 shadow-sm'
                }`}
              >
                {/* Worker Info */}
                <div className="flex items-center gap-3">
                  {item.profileImage ? (
                    <img
                      src={item.profileImage}
                      alt={item.name}
                      className="w-10 h-10 rounded-sm object-cover border border-surface-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-navy leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-surface-secondary font-mono">
                      {item.workerCustomId} • Daily Wage: ₹{item.dailyWage}
                    </span>
                  </div>
                </div>

                {/* Touch-Friendly Attendance Slot Selectors */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Full Attendance Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleSlot(item.workerId, 'full')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      hasFull
                        ? 'bg-green-50 border-status-success text-status-success'
                        : 'bg-white border-surface-border text-surface-secondary hover:border-slate-400'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${hasFull ? 'opacity-100' : 'opacity-20'}`} />
                    <span>Full (1.0)</span>
                  </button>

                  {/* Half Attendance Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleSlot(item.workerId, 'half')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      hasHalf
                        ? 'bg-amber-50 border-status-amber text-status-amber'
                        : 'bg-white border-surface-border text-surface-secondary hover:border-slate-400'
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${hasHalf ? 'opacity-100' : 'opacity-20'}`} />
                    <span>Half (0.5)</span>
                  </button>

                  {/* Both Quick Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const willBeBoth = !(hasFull && hasHalf);
                      setAttendanceList(prev =>
                        prev.map(w => {
                          if (w.workerId === item.workerId) {
                            const u = willBeBoth ? 1.5 : 0;
                            return {
                              ...w,
                              fullAttendance: willBeBoth,
                              halfAttendance: willBeBoth,
                              attendanceUnits: u,
                              earnedAmount: Math.round(u * w.dailyWage)
                            };
                          }
                          return w;
                        })
                      );
                    }}
                    className={`px-2.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      hasFull && hasHalf
                        ? 'bg-navy text-white border-navy'
                        : 'bg-white border-surface-border text-surface-secondary hover:text-navy'
                    }`}
                  >
                    Both (1.5)
                  </button>
                </div>

                {/* Day Earnings Preview */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-0 border-surface-border text-xs">
                  <span className="text-surface-secondary text-[11px]">Today's Earning:</span>
                  <span className="font-bold text-navy text-sm font-mono">
                    ₹{item.earnedAmount || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Save Button on Mobile */}
      <div className="sm:hidden sticky bottom-16 left-0 right-0 pt-2 pb-1 bg-gradient-to-t from-surface-bg via-surface-bg to-transparent">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full py-3 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Records...' : 'Save Bulk Attendance'}</span>
        </button>
      </div>
    </div>
  );
}

