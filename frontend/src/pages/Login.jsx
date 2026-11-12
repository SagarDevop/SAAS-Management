import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    const res = await login(username.trim(), password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="w-full max-w-sm mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-navy text-white rounded mb-3 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-navy uppercase">
          ShreeDev Paint Service
        </h1>
        <p className="text-xs text-surface-secondary mt-1 font-medium">
          Labour Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white border border-surface-border p-6 shadow-sm rounded-sm">
        <div className="mb-5 pb-3 border-b border-surface-border">
          <h2 className="text-base font-semibold text-navy">Owner Login</h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            Sign in to access daily attendance and labour records
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-status-danger text-status-danger text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-secondary">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-bg/50 border border-surface-border rounded-sm text-navy placeholder-surface-secondary/70 focus:outline-none focus:bg-white focus:border-navy transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-secondary">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-surface-bg/50 border border-surface-border rounded-sm text-navy placeholder-surface-secondary/70 focus:outline-none focus:bg-white focus:border-navy transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-secondary hover:text-navy focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-navy hover:bg-navy-800 text-white text-sm font-semibold rounded-sm transition-colors flex items-center justify-center shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-border text-center">
          <p className="text-[11px] text-surface-secondary">
            Authorized Personnel Only • Secure Access
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-surface-secondary font-medium">
        &copy; {new Date().getFullYear()} ShreeDev Paint Service
      </div>
    </div>
  );
}

