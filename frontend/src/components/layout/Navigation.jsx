import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Wallet, 
  BarChart3, 
  Bell, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Bulk Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Workers', path: '/workers', icon: Users },
  { name: 'Wallet Ledger', path: '/wallet', icon: Wallet },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy text-white min-h-screen border-r border-navy-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-navy-800 gap-3">
        <div className="w-8 h-8 rounded bg-white text-navy flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5 text-navy" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold tracking-tight uppercase truncate">
            ShreeDev Paint
          </h1>
          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">
            Labour Management
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-200 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-navy-800">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Owner'}</p>
            <p className="text-[10px] text-slate-300 truncate">Admin Access</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-navy-800 rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const MobileHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="md:hidden h-14 bg-navy text-white px-4 flex items-center justify-between border-b border-navy-800 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-white text-navy flex items-center justify-center font-bold">
          <ShieldCheck className="w-4 h-4 text-navy" />
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-tight">ShreeDev Paint</h1>
          <p className="text-[9px] text-slate-300 uppercase tracking-wider">Labour SaaS</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <NavLink
          to="/notifications"
          className="p-2 text-slate-200 hover:text-white rounded-sm"
        >
          <Bell className="w-4 h-4" />
        </NavLink>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 text-slate-200 hover:text-white rounded-sm"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav = () => {
  const bottomItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Workers', path: '/workers', icon: Users },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border z-30 flex items-center justify-around h-14 px-1 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive
                  ? 'text-navy font-bold border-t-2 border-navy'
                  : 'text-surface-secondary hover:text-navy font-medium'
              }`
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

