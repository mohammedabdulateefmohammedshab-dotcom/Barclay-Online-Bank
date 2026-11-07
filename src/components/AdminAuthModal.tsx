import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { store } from '../lib/store';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [identifier, setIdentifier] = useState('newzelebarclaysupport@gmail.com');
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered management email address.');
      return;
    }

    if (!passkey.trim()) {
      setErrorMessage('Please enter your management account password.');
      return;
    }

    setLoading(true);
    try {
      // Authenticates with Firebase Authentication and verifies role permissions securely
      const res = await store.verifyAdminLogin(identifier, passkey);
      if (res.error || !res.adminUser) {
        setErrorMessage(res.error || 'Access Denied: Unrecognized management credentials or insufficient permissions.');
      } else {
        await store.addAuditLog({
          adminEmail: res.adminUser.email,
          action: 'MANAGEMENT_LOGIN',
          details: `Management access granted for ${res.adminUser.fullName} ${res.adminUser.surname} (${res.adminUser.email})`
        });
        sessionStorage.setItem('barclay_management_active', 'true');
        onSuccess();
        onClose();
        setPasskey('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Management authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasskey('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#001020] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Security Header Stripe */}
        <div className="bg-blue-950/60 border-b border-blue-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-cyan-300">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold tracking-wider uppercase text-[11px]">Management Portal Clearance</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80">
            SECURE ACCESS
          </span>
        </div>

        {/* Modal Title Bar */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" size="md" />
            <div>
              <h2 className="text-base font-extrabold text-white">
                Management Portal Login
              </h2>
              <p className="text-[11px] text-slate-400">Canary Wharf Administrative Gateway</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Direct Email and Password Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Registered Management Email Address *
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="newzelebarclaysupport@gmail.com"
                className="w-full bg-[#001a33] border border-[#002f5e] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Management Account Password *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter account password"
                className="w-full bg-[#001a33] border border-[#002f5e] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                required
                autoComplete="current-password"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Protected by Firebase Authentication and server-side role validation.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating with Firebase...' : 'Sign In to Management Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-[#001c38]">
            Notice: All management operations are securely recorded in the centralized audit ledger.
          </p>
        </form>
      </div>
    </div>
  );
};
