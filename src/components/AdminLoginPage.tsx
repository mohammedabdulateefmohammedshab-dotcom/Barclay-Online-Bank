import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { store } from '../lib/store';
import { AdminRoleRecord, UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface AdminLoginPageProps {
  initialView?: 'login' | 'setup';
  onSuccess: (adminRecord?: AdminRoleRecord | null, adminUser?: UserProfile | null) => void;
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  initialView = 'login',
  onSuccess,
  onBackToSite,
}) => {
  const [view, setView] = useState<'login' | 'setup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showResetPrompt, setShowResetPrompt] = useState(false);

  useEffect(() => {
    setView(initialView);
    setErrorMessage('');
    setInfoMessage('');
    setShowResetPrompt(false);
  }, [initialView]);

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!?. :/$&@#^*_\-+=]/.test(password);
  const isPasswordStrong = hasLetters && hasNumbers && hasSpecial && password.length >= 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your administrator email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await store.verifyAdminLogin(email.trim(), password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        onSuccess(res.adminRecord || null, res.adminUser || null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOneTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setShowResetPrompt(false);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your authorized administrator email address.');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMessage(
        'Password must be at least 8 characters and include letters, numbers, and a special character.'
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter to confirm.');
      return;
    }

    setLoading(true);
    try {
      const res = await store.setupOwnerAdminAccount({
        email: email.trim(),
        password,
      });

      if (res.code === 'EMAIL_EXISTS') {
        setShowResetPrompt(true);
        setErrorMessage(
          'This email already has an active Firebase Authentication account. Sign in on the Admin Login page with its existing password, or send a password reset email below.'
        );
      } else if (res.error) {
        setErrorMessage(res.error);
      } else if (res.adminRecord) {
        onSuccess(res.adminRecord, null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to complete one-time password setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setErrorMessage('');
    setInfoMessage('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your administrator email address first.');
      return;
    }
    setLoading(true);
    try {
      const res = await store.recoverPassword(email.trim());
      if (res.error || !res.success) {
        setErrorMessage(res.error || 'Could not dispatch password reset email.');
      } else {
        setInfoMessage(
          res.message ||
            'Password reset email sent. Use the link in your inbox to set a new password, then sign in.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Subtle Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo variant="horizontal" size="md" theme="dark" />
        </div>
        <button
          type="button"
          onClick={onBackToSite}
          className="px-4 py-2 rounded-xl bg-[#0e1526] hover:bg-[#15203a] border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Main Website</span>
        </button>
      </div>

      {/* Centered Clean Administrator Authentication Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-8">
        <div className="bg-[#0b1120] border border-cyan-500/25 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden">
          <div className="px-6 pt-6 pb-5 bg-[#070b15] border-b border-white/[0.08]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aegis Online Bank • Admin Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {view === 'login' ? 'Administrator Login' : 'One-Time Password Setup'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {view === 'login'
                ? 'Sign in with your authorized administrator credentials to access the Aegis Admin Portal.'
                : 'Create a one-time Firebase password for an uninitialized owner administrator email, or request a reset link.'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter administrator email address"
                      className="w-full bg-[#071122] border border-[#1a2944] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Administrator Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-[#071122] border border-[#1a2944] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/20 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'LOGIN'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setView('setup');
                      setErrorMessage('');
                      setInfoMessage('');
                      setShowResetPrompt(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Need one-time password setup or reset?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOneTimeSetup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter authorized owner email"
                      className="w-full bg-[#071122] border border-[#1a2944] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Administrator Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters with letters, numbers & symbol"
                      className="w-full bg-[#071122] border border-[#1a2944] rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Administrator Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter administrator password"
                    className="w-full bg-[#071122] border border-[#1a2944] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#071324] border border-[#1E293B] grid grid-cols-2 gap-1 text-[10px]">
                  <span className={`flex items-center gap-1 ${hasLetters ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Letters (a-z, A-Z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumbers ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Numbers (0-9)
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Special character
                  </span>
                  <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Minimum 8 chars
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordStrong || password !== confirmPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Complete One-Time Setup'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendResetEmail}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    showResetPrompt
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30'
                      : 'bg-[#0e172a] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  Send Password Reset Email Instead
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setErrorMessage('');
                      setInfoMessage('');
                      setShowResetPrompt(false);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    Back to Administrator Login
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Protected by Firebase Authentication & role-isolated access control.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="relative z-10 text-center text-[11px] text-slate-500 font-mono">
        Aegis Online Bank • Authorized Administrative Access
      </div>
    </div>
  );
};
