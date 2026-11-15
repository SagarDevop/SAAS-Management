import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import InstallPwaPrompt from '../components/InstallPwaPrompt';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const res = await login(identifier.trim(), password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="w-full max-w-sm mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-navy text-white rounded mb-3 shadow-sm">
          <Building className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-navy uppercase">
          KaamSetu <span className="text-xs font-normal opacity-70 tracking-normal capitalize block text-[#5E6C84]">कामसेतु • Labour & Attendance SaaS</span>
        </h1>
        <p className="text-xs text-surface-secondary mt-1 font-medium">
          Sign in to your business workspace
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white border border-surface-border p-6 shadow-sm rounded-sm">
        <div className="mb-5 pb-3 border-b border-surface-border">
          <h2 className="text-base font-semibold text-navy">Business Sign In</h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            Enter your registered Gmail and password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-status-danger text-status-danger text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy mb-1.5">
              Gmail / Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-secondary">
                <Mail className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                autoComplete="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. name@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-bg/50 border border-surface-border rounded-sm text-navy placeholder-surface-secondary/70 focus:outline-none focus:bg-white focus:border-navy transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-navy">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-navy hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-secondary">
                <Lock className="w-4 h-4 text-slate-400" />
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
              className="w-full py-2.5 px-4 bg-navy hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-border text-center space-y-2">
          <p className="text-xs text-surface-secondary">
            New Business / Contractor?{' '}
            <Link to="/signup" className="text-navy font-bold hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-surface-secondary font-medium">
        &copy; {new Date().getFullYear()} KaamSetu • Multi-Tenant SaaS
      </div>

      {/* 1-Tap PWA Install App Popup for first-time visitors */}
      <InstallPwaPrompt />
    </div>
  );
}
