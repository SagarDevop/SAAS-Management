import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building, User, Phone, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InstallPwaPrompt from '../components/InstallPwaPrompt';

export default function Signup() {
  const navigate = useNavigate();
  const { registerWithOtp } = useAuth();

  // Step 1: Form details, Step 2: OTP verification
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Send OTP to Gmail via Brevo
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.businessName.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/send-signup-otp', formData);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || `Verification code sent to ${formData.email}`);
        setStep(2);
      } else {
        setError(res.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with Brevo email service.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP & Create Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-signup-otp', {
        email: formData.email,
        otp: otp.trim()
      });

      if (res.data?.success) {
        registerWithOtp(res.data.user, res.data.business, res.data.token);
        navigate('/dashboard');
      } else {
        setError(res.data?.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="w-full max-w-md mb-5 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-navy text-white rounded mb-2.5 shadow-sm">
          <Building className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-navy uppercase">
          KaamSetu <span className="text-xs font-normal opacity-70 tracking-normal capitalize block text-[#5E6C84]">कामसेतु • Labour & Attendance SaaS</span>
        </h1>
        <p className="text-xs text-surface-secondary mt-1">
          {step === 1 ? 'Start your fresh business workspace in seconds' : 'Verify your Gmail to complete setup'}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-surface-border p-6 shadow-sm rounded-sm">
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
          <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
            {/* Business / Company Name */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                Business / Contractor Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Royal Construction / Apex Painters"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
              </div>
            </div>

            {/* Owner Full Name */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Patel"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                Gmail / Email Address * (OTP will be sent here)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. yourname@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  className="w-full pl-9 pr-3 py-2 bg-surface-bg/50 border border-surface-border rounded-sm text-navy focus:outline-none focus:bg-white focus:border-navy"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-navy font-semibold mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-navy hover:bg-navy-800 text-white font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>{loading ? 'Sending OTP via Brevo...' : 'Get Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-surface-border rounded-sm text-center">
              <p className="text-[11px] text-surface-secondary">
                We sent a 6-digit verification code to:
              </p>
              <p className="font-bold text-navy text-xs mt-0.5">{formData.email}</p>
            </div>

            <div>
              <label className="block text-navy font-semibold mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative max-w-[200px] mx-auto">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3 py-2 text-center font-mono text-lg font-bold tracking-widest bg-surface-bg/50 border border-navy rounded-sm text-navy focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-navy hover:bg-navy-800 text-white font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying & Activating...' : 'Verify OTP & Activate Workspace'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-surface-secondary hover:text-navy text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email / Back</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-surface-border text-center">
          <p className="text-xs text-surface-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-navy font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-surface-secondary font-medium">
        &copy; {new Date().getFullYear()} KaamSetu • Multi-Tenant SaaS Platform
      </div>

      <InstallPwaPrompt />
    </div>
  );
}
