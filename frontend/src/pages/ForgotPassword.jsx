import React, { useState } from 'react';
import { Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import InstallPwaPrompt from '../components/InstallPwaPrompt';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your registered Gmail address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password-otp', { email: email.trim() });
      if (res.data?.success) {
        setSuccessMsg(res.data.message || `Password reset code sent to ${email}`);
        setStep(2);
      } else {
        setError(res.data?.message || 'Failed to send reset code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to find an account with this email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.data?.success) {
        alert('Password successfully reset! You can now sign in.');
        navigate('/login');
      } else {
        setError(res.data?.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
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
          {step === 1 ? 'Reset Your Account Password' : 'Enter OTP & Set New Password'}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white border border-surface-border p-6 shadow-sm rounded-sm">
        <div className="mb-5 pb-3 border-b border-surface-border">
          <h2 className="text-base font-semibold text-navy">
            {step === 1 ? 'Forgot Password' : 'Set New Password'}
          </h2>
          <p className="text-xs text-surface-secondary mt-0.5">
            {step === 1
              ? 'Enter your registered Gmail to receive a 6-digit reset code'
              : 'Enter the code sent to your Gmail and set a new password'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-status-danger text-status-danger text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-status-success text-status-success text-xs">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-navy font-semibold mb-1.5">
                Registered Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-navy hover:bg-navy-800 text-white font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
            <div className="p-2.5 bg-slate-50 border border-surface-border rounded-sm text-center">
              <span className="text-[11px] text-surface-secondary block">Code sent to:</span>
              <strong className="text-navy">{email}</strong>
            </div>

            {/* OTP */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                6-Digit Reset Code
              </label>
              <div className="relative max-w-[180px] mx-auto">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-center font-mono text-base font-bold tracking-widest bg-surface-bg/50 border border-navy rounded-sm text-navy focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-navy hover:bg-navy-800 text-white font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-1.5 text-surface-secondary hover:text-navy text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email / Back</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-surface-border text-center">
          <Link to="/login" className="text-xs text-navy font-bold hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-surface-secondary font-medium">
        &copy; {new Date().getFullYear()} KaamSetu • Multi-Tenant SaaS
      </div>

      <InstallPwaPrompt />
    </div>
  );
}
