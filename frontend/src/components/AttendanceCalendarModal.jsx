import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import api from '../services/api';
import { getKolkataDateString } from '../utils/dateTime';

export default function AttendanceCalendarModal({ isOpen, onClose, selectedDate, onSelectDate }) {
  if (!isOpen) return null;

  const todayStr = getKolkataDateString();
  const [currentYear, setCurrentYear] = useState(() => parseInt(selectedDate.split('-')[0], 10));
  const [currentMonth, setCurrentMonth] = useState(() => parseInt(selectedDate.split('-')[1], 10)); // 1-12
  const [monthStatusMap, setMonthStatusMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Fetch monthly attendance indicators to show real saved dates
  useEffect(() => {
    const fetchMonthStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/monthly?year=${currentYear}&month=${currentMonth}`);
        if (res.data?.success) {
          // In monthly report, we have actual attendance logs
          // We can also query attendance dates directly
          const map = {};
          // Check report data
          if (res.data.workerBreakdown) {
            // Fetch raw dates for this month
            const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
            const prefix = `${currentYear}-${monthStr}`;
            // Mark days
            map[prefix] = true;
          }
          setMonthStatusMap(map);
        }
      } catch (err) {
        console.error('Failed to load month attendance map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthStatus();
  }, [currentYear, currentMonth]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDateClick = (day) => {
    const dStr = day < 10 ? `0${day}` : `${day}`;
    const mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const targetDate = `${currentYear}-${mStr}-${dStr}`;

    // Disable future dates
    if (targetDate > todayStr) {
      alert("Future dates cannot be selected for attendance.");
      return;
    }

    onSelectDate(targetDate);
    onClose();
  };

  const handleTodayShortcut = () => {
    onSelectDate(todayStr);
    onClose();
  };

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-surface-border w-full max-w-sm rounded-sm shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider">Select Attendance Date</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigator */}
        <div className="p-3 bg-surface-bg border-b border-surface-border flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-1 border border-surface-border bg-white rounded-sm hover:bg-slate-100 text-navy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-navy uppercase tracking-wider">
            {monthNames[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 border border-surface-border bg-white rounded-sm hover:bg-slate-100 text-navy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-surface-secondary uppercase pb-2 border-b border-surface-border mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {blankDays.map(b => (
              <div key={`blank-${b}`} className="h-8" />
            ))}

            {dayNumbers.map(day => {
              const dStr = day < 10 ? `0${day}` : `${day}`;
              const mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
              const thisDateStr = `${currentYear}-${mStr}-${dStr}`;
              const isSelected = thisDateStr === selectedDate;
              const isToday = thisDateStr === todayStr;
              const isFuture = thisDateStr > todayStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleDateClick(day)}
                  className={`h-8 flex flex-col items-center justify-center text-xs font-semibold rounded-sm transition-colors relative ${
                    isSelected
                      ? 'bg-navy text-white font-bold'
                      : isToday
                      ? 'border border-navy text-navy bg-navy/5 font-bold'
                      : isFuture
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-navy hover:bg-surface-bg'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 bg-navy rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with Today Shortcut */}
        <div className="p-3 bg-surface-bg border-t border-surface-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-surface-secondary">
            Selected: <strong className="text-navy font-mono">{selectedDate}</strong>
          </span>
          <button
            onClick={handleTodayShortcut}
            className="px-3 py-1 bg-white border border-surface-border hover:bg-slate-100 text-navy font-bold text-[11px] uppercase tracking-wider rounded-sm"
          >
            Today Shortcut
          </button>
        </div>
      </div>
    </div>
  );
}

