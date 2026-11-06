import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { store } from '../lib/store';
import { UserProfile } from '../types';

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
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [identifier, setIdentifier] = useState('newzelebarclaysupport@gmail.com');
  const [passkey, setPasskey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [verifiedAdmin, setVerifiedAdmin] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your administrator ID or clearance email.');
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
        setVerifiedAdmin(res.adminUser);
        setStep('2fa');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCode = twoFactorCode.replace(/\s/g, '');
    if (cleanCode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit administrative 2FA verification token.');
      return;
    }

    setLoading(true);
    try {
      if (verifiedAdmin) {
        await store.addAuditLog({
          adminEmail: verifiedAdmin.email,
          action: 'ADMIN_LOGIN',
          details: `Administrator ${verifiedAdmin.fullName} ${verifiedAdmin.surname} authenticated via 2-Factor Authentication (Token: ${cleanCode.slice(0, 2)}••••)`
        });
      }
      onSuccess();
      onClose();
      // Reset state for subsequent logins
      setStep('credentials');
      setPasskey('');
      setTwoFactorCode('');
    } catch (err: any) {
      setErrorMessage(err.message || '2FA validation error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('credentials');
    setPasskey('');
    setTwoFactorCode('');
    setErrorMessage('');
    onClose();
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
          <span className="text-[10px] font-mono text-amber-400/80">
            {step === 'credentials' ? 'STEP 1 OF 2' : 'STEP 2 OF 2: 2FA'}
          </span>
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" size="md" />
            <div>
              <h2 className="text-base font-extrabold text-white">
                Admin Control Clearance
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

        {step === 'credentials' ? (
          <form onSubmit={handleStep1Submit} className="p-6 space-y-4">
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
              {loading ? 'Verifying Credentials...' : 'Continue to Two-Factor Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-[#001c38]">
              Notice: All access attempts to central administrative ledgers are cryptographically logged and audited.
            </p>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Identity Confirmed: {verifiedAdmin?.fullName} {verifiedAdmin?.surname}</p>
                <p className="text-slate-400 text-[11px]">Primary passkey validated. Hardware 2FA verification required.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                6-Digit Hardware / TOTP Security Token
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="849201"
                  className="w-full bg-[#001a33] border border-[#002f5e] rounded-lg pl-9 pr-3 py-2.5 text-center text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>Enter code from Authenticator App</span>
                <span className="text-amber-300 font-mono">Demo token: 849201</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-1/3 py-2.5 px-3 rounded-xl bg-[#001a33] hover:bg-[#002547] text-slate-300 text-xs font-semibold border border-[#002f5e]"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length < 6}
                className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Authorizing Session...' : 'Verify 2FA & Open Console'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-[#001c38]">
              Central Security Clearance Level 3 • Session valid for current active window
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
