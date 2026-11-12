import React from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar, MobileHeader, MobileBottomNav } from './Navigation';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

