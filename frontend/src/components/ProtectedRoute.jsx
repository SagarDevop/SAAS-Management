import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] px-4">
        <div className="bg-white border border-[#DFE1E6] rounded-sm p-6 sm:p-8 max-w-sm w-full shadow-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#172B4D]/10 rounded-sm">
            <Loader2 className="w-6 h-6 text-[#172B4D] animate-spin" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#172B4D] tracking-wide uppercase">
              ShreeDev Paint Service
            </h2>
            <p className="text-xs text-[#5E6C84] mt-1 font-medium">
              Connecting to secure server...
            </p>
          </div>
          <div className="w-full bg-[#EBECF0] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#172B4D] h-full w-2/3 animate-pulse rounded-full" />
          </div>
          <p className="text-[11px] text-[#5E6C84]/80">
            Please wait a moment while we load your workspace.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

