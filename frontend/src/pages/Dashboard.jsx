import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  Wallet, 
  AlertCircle,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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

  const metrics = [
    { label: 'Total Workers', value: s.totalWorkers, sub: 'Registered workforce', icon: Users, alert: false },
    { label: 'Active Workers', value: s.activeWorkers, sub: 'Ready for work', icon: UserCheck, alert: false },
    { label: "Today's Present", value: s.todayPresent, sub: 'Workers marked', icon: CalendarCheck, alert: false },
    { label: "Full Attendance", value: s.todayFull, sub: '9:00 AM - 6:00 PM (1.0)', icon: CalendarCheck, alert: false },
    { label: "Half Attendance", value: s.todayHalf, sub: '6:00 AM - 9:00 AM (0.5)', icon: Clock, alert: false },
    { label: "Total Units", value: (s.todayUnits || 0).toFixed(1), sub: 'Attendance units today', icon: Clock, alert: false },
    { label: "Today's Labour Exp.", value: `₹${s.todayLabourExpense}`, sub: 'Daily wage accrual', icon: Wallet, alert: false },
    { label: 'Total Outstanding', value: `₹${s.totalOutstandingPayable}`, sub: 'Payable to workers', icon: AlertCircle, alert: s.totalOutstandingPayable > 0 },
  ];

  const recentAttendance = data?.todayAttendanceTable || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 border border-surface-border rounded-sm">
        <div>
          <h2 className="text-lg font-bold text-navy tracking-tight">Today's Overview</h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/attendance"
            className="w-full sm:w-auto px-4 py-2 bg-navy hover:bg-navy-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm text-center transition-colors"
          >
            Mark Bulk Attendance
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`p-4 bg-white border rounded-sm transition-all ${
                m.alert
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between text-surface-secondary mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.alert ? 'text-status-danger' : 'text-navy'}`} />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-navy tracking-tight">{m.value}</div>
              <p className="text-[10px] text-surface-secondary mt-1 font-medium">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Split: Today's Attendance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Table */}
        <div className="lg:col-span-2 bg-white border border-surface-border rounded-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Today's Attendance</h3>
              <p className="text-xs text-surface-secondary">Live records saved for current date</p>
            </div>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-navy hover:underline inline-flex items-center gap-1"
            >
              Bulk Screen <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="py-10 text-center text-xs text-surface-secondary">
              No attendance marked yet for today. Click "Mark Bulk Attendance" to log today's workers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-bg text-surface-secondary uppercase font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-2 text-center">Full (1.0)</th>
                    <th className="py-2.5 px-2 text-center">Half (0.5)</th>
                    <th className="py-2.5 px-2 text-center">Units</th>
                    <th className="py-2.5 px-3 text-right">Today's Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {recentAttendance.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-bg/40">
                      <td className="py-2.5 px-3 font-medium text-navy">
                        {row.workerName} <span className="text-[10px] text-surface-secondary font-mono font-normal">({row.workerCustomId})</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {row.full ? (
                          <span className="inline-block w-4 h-4 bg-green-100 text-status-success font-bold text-[10px] rounded-sm leading-4">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {row.half ? (
                          <span className="inline-block w-4 h-4 bg-amber-100 text-status-amber font-bold text-[10px] rounded-sm leading-4">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-navy">
                        {row.units}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-navy">
                        {row.wage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-surface-border rounded-sm p-4 sm:p-5">
          <div className="mb-4 pb-2 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Recent Activity</h3>
            <p className="text-xs text-surface-secondary">Audit log of latest actions</p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-secondary">
              No recent notifications logged.
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="border-l-2 border-navy pl-3 py-0.5">
                  <p className="text-xs font-semibold text-navy">{act.title}</p>
                  <p className="text-xs text-surface-secondary mt-0.5">{act.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
