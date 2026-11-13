import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Clock, 
  Wallet, 
  ArrowRight,
  UserPlus,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  getKolkataGreeting, 
  getKolkataLiveTime, 
  formatReadableDate, 
  getKolkataDateString 
} from '../utils/dateTime';
import WorkerModal from '../components/WorkerModal';
import TransactionModal from '../components/TransactionModal';
import { DashboardSkeleton } from '../components/ui/Skeletons';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(getKolkataLiveTime());
  const [todayDateString, setTodayDateString] = useState(getKolkataDateString());

  // Modal states for Quick Actions
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [workersList, setWorkersList] = useState([]);

  // Live Clock & Auto-date rollover at midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getKolkataLiveTime());
      const newDate = getKolkataDateString();
      if (newDate !== todayDateString) {
        setTodayDateString(newDate);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [todayDateString]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data?.success) {
        setData(res.data);
      }
      // Also fetch worker list for quick transaction modal
      const wRes = await api.get('/workers?status=active');
      if (wRes.data?.success) {
        setWorkersList(wRes.data.workers);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [todayDateString]);

  const s = data?.summary || {
    totalWorkers: 0,
    activeWorkers: 0,
    todayPresent: 0,
    todayFull: 0,
    todayHalf: 0,
    todayUnits: 0,
    todayLabourExpense: 0,
    totalOutstandingPayable: 0
  };

  // Simplified metrics designed for a non-technical contractor
  const summaryCards = [
    {
      title: "Total Registered Workers",
      value: s.totalWorkers,
      subtitle: "All workers in database",
      icon: Users,
      color: "text-navy",
      bg: "bg-white"
    },
    {
      title: "Active Workers",
      value: s.activeWorkers,
      subtitle: "Currently available to work",
      icon: UserCheck,
      color: "text-navy",
      bg: "bg-white"
    },
    {
      title: "Present Today",
      value: s.todayPresent,
      subtitle: "Marked on site today",
      icon: CalendarCheck,
      color: "text-status-success",
      bg: "bg-green-50/30"
    },
    {
      title: "Full Attendance",
      value: s.todayFull,
      subtitle: "Full Day (9 AM – 6 PM)",
      icon: CheckCircle2,
      color: "text-status-success",
      bg: "bg-white"
    },
    {
      title: "Half Attendance",
      value: s.todayHalf,
      subtitle: "Half Day (6 AM – 9 AM)",
      icon: Clock,
      color: "text-status-amber",
      bg: "bg-white"
    },
    {
      title: "Today's Labour Expense",
      value: `₹${s.todayLabourExpense}`,
      subtitle: "Total wages earned today",
      icon: Wallet,
      color: "text-navy",
      bg: "bg-white"
    },
    {
      title: "Money Remaining (Dena Hai)",
      value: `₹${s.totalOutstandingPayable}`,
      subtitle: "Pending wage liability to workers",
      icon: AlertCircle,
      color: "text-status-danger",
      bg: s.totalOutstandingPayable > 0 ? "bg-red-50/30" : "bg-white"
    }
  ];

  const recentAttendance = data?.todayAttendanceTable || [];
  const recentActivities = data?.recentActivities || [];

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Dynamic Greeting, Live Clock & Indian Date */}
      <div className="bg-white p-4 sm:p-6 border border-surface-border rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-navy bg-surface-bg px-2.5 py-1 rounded-sm border border-surface-border">
              {getKolkataGreeting()}, Owner
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy mt-1.5 tracking-tight">
            ShreeDev Paint Service
          </h1>
          <p className="text-xs text-surface-secondary mt-0.5">
            Daily Labour & Attendance Overview
          </p>
        </div>

        {/* Live Date & Time Display */}
        <div className="bg-surface-bg border border-surface-border p-3 rounded-sm flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-secondary block">Today's Date</span>
            <span className="font-bold text-navy text-sm">
              {formatReadableDate(todayDateString)}
            </span>
          </div>
          <div className="border-l border-surface-border pl-4">
            <span className="text-[10px] uppercase font-bold text-surface-secondary block">Live Time</span>
            <span className="font-mono font-bold text-navy text-sm">
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Prominent Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Action 1: Mark Today's Attendance */}
        <button
          onClick={() => navigate('/attendance')}
          className="flex items-center justify-between p-4 bg-navy hover:bg-navy-800 text-white rounded-sm transition-all shadow-sm group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-sm">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">1. Mark Attendance</span>
              <span className="text-[11px] text-slate-300">Hazri lagayein (Full/Half/Both)</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Action 2: Add New Worker */}
        <button
          onClick={() => setIsWorkerModalOpen(true)}
          className="flex items-center justify-between p-4 bg-white hover:bg-surface-bg border border-surface-border text-navy rounded-sm transition-all shadow-sm group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-bg rounded-sm border border-surface-border">
              <UserPlus className="w-5 h-5 text-navy" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">2. Add New Worker</span>
              <span className="text-[11px] text-surface-secondary">Naya mazdoor jodein</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-navy group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Action 3: Add Payment / Advance */}
        <button
          onClick={() => setIsTransactionModalOpen(true)}
          className="flex items-center justify-between p-4 bg-white hover:bg-surface-bg border border-surface-border text-navy rounded-sm transition-all shadow-sm group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-bg rounded-sm border border-surface-border">
              <PlusCircle className="w-5 h-5 text-status-success" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">3. Add Payment / Advance</span>
              <span className="text-[11px] text-surface-secondary">Advance ya hisaab chukayein</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-navy group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3. Daily Summary Cards Grid */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
          Daily Business Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {summaryCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className={`p-4 border border-surface-border rounded-sm ${c.bg} transition-all shadow-sm`}
              >
                <div className="flex items-center justify-between text-surface-secondary mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{c.title}</span>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className={`text-xl sm:text-2xl font-bold tracking-tight ${c.color}`}>
                  {c.value}
                </div>
                <p className="text-[10px] text-surface-secondary mt-1 font-medium">{c.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Split: Today's Attendance Preview & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Preview */}
        <div className="lg:col-span-2 bg-white border border-surface-border rounded-sm p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                Today's Attendance Preview
              </h3>
              <p className="text-xs text-surface-secondary">Workers recorded for {formatReadableDate(todayDateString)}</p>
            </div>
            <Link
              to="/attendance"
              className="text-xs font-bold text-navy hover:underline inline-flex items-center gap-1"
            >
              View Full Attendance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="py-12 text-center text-xs text-surface-secondary space-y-2">
              <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-navy">No attendance has been recorded for today yet.</p>
              <button
                onClick={() => navigate('/attendance')}
                className="mt-2 px-4 py-2 bg-navy text-white text-xs font-bold rounded-sm uppercase tracking-wider"
              >
                Mark Attendance Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2 text-center">Units</th>
                    <th className="py-2.5 px-3 text-right">Today's Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {recentAttendance.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-bg/40">
                      <td className="py-2.5 px-3 font-semibold text-navy">
                        {row.workerName} <span className="text-[10px] text-surface-secondary font-mono font-normal">({row.workerCustomId})</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {row.full && row.half ? (
                          <span className="px-1.5 py-0.5 bg-navy text-white text-[10px] font-bold rounded-sm">Both (1.5)</span>
                        ) : row.full ? (
                          <span className="px-1.5 py-0.5 bg-green-100 text-status-success text-[10px] font-bold rounded-sm">Full (1.0)</span>
                        ) : row.half ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-status-amber text-[10px] font-bold rounded-sm">Half (0.5)</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-red-100 text-status-danger text-[10px] font-bold rounded-sm">Absent</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-navy">
                        {row.units}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-navy font-mono">
                        {row.wage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5 shadow-sm">
          <div className="mb-4 pb-2 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Recent Activity</h3>
            <p className="text-xs text-surface-secondary">Latest actions & notifications</p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-secondary">
              No recent activity logs recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="border-l-2 border-navy pl-3 py-0.5">
                  <p className="text-xs font-semibold text-navy">{act.title}</p>
                  <p className="text-xs text-surface-secondary mt-0.5">{act.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(act.time).toLocaleDateString()} at {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Modal: Add Worker */}
      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        worker={null}
        onSave={() => fetchDashboard()}
      />

      {/* Quick Action Modal: Add Payment / Advance */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        workers={workersList}
        preselectedWorkerId=""
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
}
