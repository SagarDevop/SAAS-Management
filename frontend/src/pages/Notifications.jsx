import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Filter, 
  MessageSquare, 
  CalendarCheck, 
  UserPlus, 
  Wallet,
  Clock
} from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;

      const res = await api.get('/notifications', { params });
      if (res.data?.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.success) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, readStatus: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/notifications/mark-all-read');
      if (res.data?.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, readStatus: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Worker Registration':
        return <UserPlus className="w-4 h-4 text-navy" />;
      case 'Full Attendance Marked':
      case 'Half Attendance Marked':
        return <CalendarCheck className="w-4 h-4 text-status-success" />;
      case 'Advance Added':
      case 'Bonus Added':
      case 'Payment Added':
      case 'Other Wallet Adjustment':
        return <Wallet className="w-4 h-4 text-status-amber" />;
      default:
        return <Bell className="w-4 h-4 text-navy" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 border border-surface-border rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-navy uppercase tracking-wider">
              Activity & Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-status-danger text-[10px] font-bold rounded-sm">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-surface-secondary mt-0.5">
            Audit logs, worker registrations, attendance alerts, and WhatsApp message statuses
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-bg border border-surface-border text-navy text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-slate-200 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 border border-surface-border rounded-sm flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-surface-secondary" />
          <span className="font-semibold text-navy uppercase text-[10px]">Filter by Event:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 bg-surface-bg border border-surface-border rounded-sm text-navy outline-none"
          >
            <option value="all">All Activities</option>
            <option value="Worker Registration">Worker Registrations</option>
            <option value="Full Attendance Marked">Attendance Logs</option>
            <option value="Advance Added">Advances</option>
            <option value="Payment Added">Payments</option>
            <option value="Bonus Added">Bonuses</option>
          </select>
        </div>

        <span className="text-[11px] text-surface-secondary">
          Showing {notifications.length} events
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-navy bg-white border border-surface-border">
          Loading activity stream...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white border border-surface-border rounded-sm space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-medium text-navy">No activity logs recorded yet</p>
          <p className="text-xs text-surface-secondary">New worker registrations, attendance entries, and ledger records will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => {
            const isUnread = !item.readStatus;

            return (
              <div
                key={item._id}
                onClick={() => isUnread && handleMarkAsRead(item._id)}
                className={`p-4 border rounded-sm transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  isUnread
                    ? 'bg-white border-navy/40 shadow-sm border-l-4 border-l-navy'
                    : 'bg-white/80 border-surface-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-sm bg-surface-bg border border-surface-border shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy">{item.title}</h4>
                      {isUnread && (
                        <span className="inline-block w-2 h-2 rounded-full bg-status-danger" />
                      )}
                    </div>
                    <p className="text-xs text-surface-secondary mt-0.5 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </span>
                      {item.deliveryChannel === 'whatsapp' && (
                        <span className="flex items-center gap-1 text-status-success font-medium">
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp ({item.deliveryStatus})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(item._id);
                    }}
                    title="Mark as read"
                    className="text-[10px] text-surface-secondary hover:text-navy uppercase font-semibold shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

