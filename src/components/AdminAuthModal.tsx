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
  const [identifier, setIdentifier] = useState('admin@barclay.bank');
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your administrator ID or official clearance email.');
      return;
    }

    if (!passkey.trim()) {
      setErrorMessage('Please enter your administrative passkey or PIN.');
      return;
    }

    setLoading(true);
    try {
      const res = await store.verifyAdminLogin(identifier, passkey);
      if (res.error || !res.adminUser) {
        setErrorMessage(res.error || 'Access Denied: Invalid administrator credentials.');
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#001020] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Security Warning Stripe */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold tracking-wider uppercase text-[11px]">Restricted Security Gateway</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/80">AUTHORITY ONLY</span>
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" size="md" />
            <div>
              <h2 className="text-base font-extrabold text-white">
                Admin Control Clearance
              </h2>
              <p className="text-[11px] text-slate-400">Barclay Central Clearing & Settlement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Identification / Registered Email
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@barclay.bank"
                className="w-full bg-[#001a33] border border-[#002f5e] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Security Passkey or Master PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter security clearance passkey"
                className="w-full bg-[#001a33] border border-[#002f5e] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Authorized credentials: <span className="font-mono text-cyan-300">admin@barclay.bank</span> (Passkey: <span className="font-mono text-amber-300">Admin@1234#</span>)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying Clearance...' : 'Authenticate & Enter Admin Console'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-[#001c38]">
            Notice: All access attempts to central administrative ledgers are cryptographically logged and audited.
          </p>
        </form>
      </div>
    </div>
  );
};
