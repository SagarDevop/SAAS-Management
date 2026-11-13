import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Check, 
  Save, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X
} from 'lucide-react';
import api from '../services/api';
import AttendanceCalendarModal from '../components/AttendanceCalendarModal';
import { AttendanceSkeleton } from '../components/ui/Skeletons';
import { 
  getKolkataDateString, 
  formatReadableDate 
} from '../utils/dateTime';

export default function Attendance() {
  const todayStr = getKolkataDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [attendanceList, setAttendanceList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchAttendance = async (date) => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.get(`/attendance?date=${date}`);
      if (res.data?.success) {
        setAttendanceList(res.data.attendanceList);
        setOriginalList(JSON.parse(JSON.stringify(res.data.attendanceList)));
        setHasUnsavedChanges(false);
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

  // Stepper: Previous / Next day
  const handleStepDay = (days) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved attendance changes. Discard and switch date?")) {
        return;
      }
    }

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    dateObj.setUTCDate(dateObj.getUTCDate() + days);
    const newDateStr = dateObj.toISOString().split('T')[0];

    // Restrict future dates
    if (newDateStr > todayStr) {
      alert("Future dates cannot be selected for attendance.");
      return;
    }

    setSelectedDate(newDateStr);
  };

  const handleSelectDateFromCalendar = (date) => {
    setSelectedDate(date);
  };

  // Toggle individual worker slot
  const handleSetWorkerSlot = (workerId, slot) => {
    setHasUnsavedChanges(true);
    setAttendanceList(prev =>
      prev.map(item => {
        if (item.workerId === workerId) {
          let newFull = false;
          let newHalf = false;

          if (slot === 'full') {
            newFull = !item.fullAttendance;
            newHalf = false;
          } else if (slot === 'half') {
            newFull = false;
            newHalf = !item.halfAttendance;
          } else if (slot === 'both') {
            const alreadyBoth = item.fullAttendance && item.halfAttendance;
            newFull = !alreadyBoth;
            newHalf = !alreadyBoth;
          } else if (slot === 'absent') {
            newFull = false;
            newHalf = false;
          }

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

  // Bulk actions
  const handleMarkAllFull = () => {
    setHasUnsavedChanges(true);
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

  const handleClearAll = () => {
    setHasUnsavedChanges(true);
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

  // Live Summary metrics
  const fullCount = attendanceList.filter(w => w.fullAttendance && !w.halfAttendance).length;
  const halfCount = attendanceList.filter(w => !w.fullAttendance && w.halfAttendance).length;
  const bothCount = attendanceList.filter(w => w.fullAttendance && w.halfAttendance).length;
  const absentCount = attendanceList.filter(w => !w.fullAttendance && !w.halfAttendance).length;
  const totalUnits = attendanceList.reduce((acc, cur) => acc + (cur.attendanceUnits || 0), 0);
  const totalLabourExpense = attendanceList.reduce((acc, cur) => acc + (cur.earnedAmount || 0), 0);
  const presentCount = fullCount + halfCount + bothCount;

  // Final Save to backend
  const executeSave = async () => {
    setIsConfirmModalOpen(false);
    try {
      setSaving(true);
      setFeedback(null);

      const records = attendanceList.map(item => ({
        workerId: item.workerId,
        fullAttendance: item.fullAttendance,
        halfAttendance: item.halfAttendance,
        siteName: item.siteName || '',
        notes: item.notes || ''
      }));

      const res = await api.post('/attendance/bulk', {
        date: selectedDate,
        records
      });

      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: `Attendance for ${formatReadableDate(selectedDate)} saved successfully! Worker wallets updated.`
        });
        setHasUnsavedChanges(false);
        fetchAttendance(selectedDate);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save attendance records.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* 1. Header with Prominent Selected Date & Calendar Stepper */}
      <div className="bg-white p-4 sm:p-5 border border-surface-border rounded-sm shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-secondary tracking-wider block">
              Attendance Register
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-navy tracking-tight mt-0.5">
              Attendance for {formatReadableDate(selectedDate)}
            </h1>
          </div>

          {/* Stepper & Calendar Controls */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* Prev Day */}
            <button
              onClick={() => handleStepDay(-1)}
              className="p-2 border border-surface-border rounded-sm hover:bg-surface-bg text-navy transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Calendar Picker Button */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-surface-bg border border-surface-border hover:border-navy text-navy text-xs font-bold rounded-sm transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-navy" />
              <span>{selectedDate} (Pick Date)</span>
            </button>

            {/* Next Day */}
            <button
              onClick={() => handleStepDay(1)}
              disabled={selectedDate >= todayStr}
              className="p-2 border border-surface-border rounded-sm hover:bg-surface-bg text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Today Shortcut */}
            <button
              onClick={() => handleSelectDateFromCalendar(todayStr)}
              className="px-2.5 py-2 border border-navy/30 hover:border-navy text-navy text-xs font-bold rounded-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllFull}
              className="px-3 py-1.5 bg-surface-bg border border-surface-border hover:bg-navy hover:text-white text-navy text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
            >
              Mark All Full
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 border border-surface-border text-surface-secondary hover:bg-surface-bg text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
            >
              Clear All (Absent)
            </button>
          </div>

          {/* Save Attendance Button (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-xs font-semibold text-status-amber animate-pulse">
                • Unsaved changes
              </span>
            )}
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={saving || loading}
              className="px-5 py-2 bg-navy hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 border-l-4 text-xs font-semibold flex items-center gap-2 rounded-sm shadow-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 border-status-success text-status-success'
              : 'bg-red-50 border-status-danger text-status-danger'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Live Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3.5 border border-surface-border rounded-sm shadow-sm text-xs">
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-bold">Total Workers</span>
          <span className="text-base font-bold text-navy mt-0.5 block">{attendanceList.length}</span>
        </div>
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-bold">Present Today</span>
          <span className="text-base font-bold text-status-success mt-0.5 block">{presentCount}</span>
        </div>
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-bold">Attendance Units</span>
          <span className="text-base font-bold text-navy mt-0.5 block">{totalUnits.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-surface-secondary block text-[10px] uppercase font-bold">Total Labour Expense</span>
          <span className="text-base font-bold text-navy mt-0.5 block">₹{totalLabourExpense}</span>
        </div>
      </div>

      {/* 3. Mobile-First Worker Attendance Cards */}
      {loading && attendanceList.length === 0 ? (
        <AttendanceSkeleton />
      ) : attendanceList.length === 0 ? (
        <div className="p-12 text-center bg-white border border-surface-border rounded-sm space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-navy">No active workers found in database.</p>
          <p className="text-xs text-surface-secondary">Add active workers in the Workers section to record daily attendance.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {attendanceList.map((worker) => {
            const hasFull = worker.fullAttendance && !worker.halfAttendance;
            const hasHalf = !worker.fullAttendance && worker.halfAttendance;
            const hasBoth = worker.fullAttendance && worker.halfAttendance;
            const isAbsent = !worker.fullAttendance && !worker.halfAttendance;

            return (
              <div
                key={worker.workerId}
                className={`p-3.5 sm:p-4 bg-white border rounded-sm transition-all shadow-sm ${
                  isAbsent
                    ? 'border-surface-border'
                    : 'border-navy/40 bg-surface-bg/20'
                }`}
              >
                {/* Worker Top Row: Name, Daily Wage, ID */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-surface-border/60">
                  <div className="flex items-center gap-2.5">
                    {worker.profileImage ? (
                      <img
                        src={worker.profileImage}
                        alt={worker.name}
                        className="w-9 h-9 rounded-sm object-cover border border-surface-border shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-sm bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                        {worker.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-navy leading-tight">
                        {worker.name}
                      </h4>
                      <p className="text-[10px] text-surface-secondary font-mono mt-0.5">
                        {worker.workerCustomId} • Daily Rate: <strong className="text-navy">₹{worker.dailyWage}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Calculated Day Earning & Optional Site Name */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Site Name (Optional)"
                      value={worker.siteName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHasUnsavedChanges(true);
                        setAttendanceList(prev =>
                          prev.map(item => item.workerId === worker.workerId ? { ...item, siteName: val } : item)
                        );
                      }}
                      className="hidden sm:block text-[11px] p-1 bg-surface-bg border border-surface-border rounded-sm w-36 text-navy placeholder:text-slate-400 focus:outline-none focus:border-navy"
                    />

                    <div className="text-right">
                      <span className="text-[10px] text-surface-secondary block uppercase">Earned</span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-navy">
                        ₹{worker.earnedAmount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Touch-Friendly Attendance Option Buttons */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {/* Option 1: Full Day */}
                  <button
                    type="button"
                    onClick={() => handleSetWorkerSlot(worker.workerId, 'full')}
                    className={`py-2 px-1 text-center text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      hasFull
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white border-surface-border text-surface-secondary hover:border-slate-400'
                    }`}
                  >
                    Full (1.0)
                  </button>

                  {/* Option 2: Half Day */}
                  <button
                    type="button"
                    onClick={() => handleSetWorkerSlot(worker.workerId, 'half')}
                    className={`py-2 px-1 text-center text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      hasHalf
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white border-surface-border text-surface-secondary hover:border-slate-400'
                    }`}
                  >
                    Half (0.5)
                  </button>

                  {/* Option 3: Both */}
                  <button
                    type="button"
                    onClick={() => handleSetWorkerSlot(worker.workerId, 'both')}
                    className={`py-2 px-1 text-center text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      hasBoth
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-white border-surface-border text-surface-secondary hover:border-slate-400'
                    }`}
                  >
                    Both (1.5)
                  </button>

                  {/* Option 4: Absent */}
                  <button
                    type="button"
                    onClick={() => handleSetWorkerSlot(worker.workerId, 'absent')}
                    className={`py-2 px-1 text-center text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
                      isAbsent
                        ? 'bg-red-50 text-status-danger border-status-danger font-bold'
                        : 'bg-white border-surface-border text-slate-400 hover:text-navy'
                    }`}
                  >
                    Absent (0)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Sticky Mobile Save Bar */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 p-3 bg-white border-t border-surface-border shadow-lg z-20 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-surface-secondary block uppercase font-bold">
            Total Wage Expense
          </span>
          <span className="text-sm font-bold font-mono text-navy">
            ₹{totalLabourExpense} ({totalUnits.toFixed(1)} Units)
          </span>
        </div>

        <button
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={saving || loading}
          className="px-6 py-2.5 bg-navy hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-md transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {/* Calendar Modal */}
      <AttendanceCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDateFromCalendar}
      />

      {/* Pre-Save Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-surface-border w-full max-w-md rounded-sm shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                Confirm Attendance Submission
              </h3>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-surface-secondary hover:text-navy p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-surface-secondary">
              Review attendance breakdown before saving to worker wallets:
            </p>

            <div className="p-3 bg-surface-bg border border-surface-border rounded-sm space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-surface-secondary">Selected Date:</span>
                <span className="font-bold text-navy">{formatReadableDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-secondary">Total Workers:</span>
                <span className="font-bold text-navy">{attendanceList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-secondary">Full Attendance (1.0):</span>
                <span className="font-bold text-status-success">{fullCount} Workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-secondary">Half Attendance (0.5):</span>
                <span className="font-bold text-status-amber">{halfCount} Workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-secondary">Both Slots (1.5):</span>
                <span className="font-bold text-navy">{bothCount} Workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-secondary">Absent:</span>
                <span className="font-bold text-status-danger">{absentCount} Workers</span>
              </div>
              <div className="border-t border-surface-border pt-2 flex justify-between font-bold">
                <span className="text-navy">Total Labour Expense:</span>
                <span className="text-navy font-mono text-sm">₹{totalLabourExpense}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-surface-border text-navy rounded-sm hover:bg-surface-bg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="px-5 py-2 bg-navy hover:bg-navy-800 text-white text-xs font-bold rounded-sm uppercase tracking-wider"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
