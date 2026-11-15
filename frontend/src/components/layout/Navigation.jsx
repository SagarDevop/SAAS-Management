import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CalendarCheck, 
  Wallet, 
  BarChart3, 
  Bell, 
  LogOut,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Navigation Items for Contractor / SaaS Owner
const navigationItems = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Workers', path: '/workers', icon: Users },
  { name: 'Money / Hisab', path: '/wallet', icon: Wallet },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

export const DesktopSidebar = () => {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const businessDisplayName = business?.name || user?.businessName || 'KaamSetu';

  return (
    <aside className="hidden md:flex flex-col w-60 bg-navy text-white min-h-screen border-r border-navy-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-navy-800 gap-3">
        <div className="w-8 h-8 rounded bg-white text-navy flex items-center justify-center font-bold shrink-0">
          <Building className="w-4 h-4 text-navy" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold tracking-tight uppercase truncate" title={businessDisplayName}>
            {businessDisplayName}
          </h1>
          <p className="text-[10px] text-slate-300 tracking-wider font-medium">
            KaamSetu SaaS
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-800 text-white font-semibold shadow-inner'
                    : 'text-slate-300 hover:bg-navy-800/60 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded bg-navy-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Owner'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || user?.username || 'Owner'}</p>
            </div>
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
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();

  const businessDisplayName = business?.name || user?.businessName || 'KaamSetu';

  return (
    <header className="md:hidden bg-navy text-white h-14 px-4 flex items-center justify-between border-b border-navy-800 shrink-0 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="w-7 h-7 rounded bg-white text-navy flex items-center justify-center font-bold shrink-0">
          <Building className="w-3.5 h-3.5 text-navy" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-xs font-bold uppercase tracking-tight truncate max-w-[170px]" title={businessDisplayName}>
            {businessDisplayName}
          </h1>
          <p className="text-[9px] text-slate-300 uppercase tracking-wider">KaamSetu SaaS</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <NavLink
          to="/notifications"
          className="p-2 text-slate-200 hover:text-white rounded-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </NavLink>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 text-slate-200 hover:text-white rounded-sm cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border z-30 flex items-center justify-around h-14 px-1 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      {navigationItems.map((item) => {
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
