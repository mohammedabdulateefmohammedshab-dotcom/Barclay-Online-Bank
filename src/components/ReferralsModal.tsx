import React, { useState } from 'react';
import { X, Gift, Copy, Check, Users, CheckCircle2, Clock } from 'lucide-react';
import { UserProfile, ReferralRecord, FinancialSettings } from '../types';

interface ReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  referrals: ReferralRecord[];
  settings: FinancialSettings;
}

export const ReferralsModal: React.FC<ReferralsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  referrals,
  settings
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const refCode = currentUser.referralCode || `AEG-${currentUser.accountNumber.slice(-6)}`;
  const bonusAmount = settings.referralBonusAmount ?? 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarned = referrals
    .filter((r) => r.status === 'Credited')
    .reduce((sum, r) => sum + Number(r.rewardAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Referrals & Rewards Program</h3>
              <p className="text-xs text-slate-400">Invite clients and earn ${bonusAmount.toLocaleString()} per verified referral</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Referral Code Card */}
          <div className="p-4 rounded-2xl bg-[#00172e] border border-[#002b52] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Your Referral Code</span>
              <span className="text-emerald-400 font-mono font-bold">
                Total Credited: ${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#000d1a] px-4 py-3 rounded-xl border border-amber-500/30">
              <span className="font-mono text-xl font-black tracking-widest text-amber-300">{refCode}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              New customers can enter <strong className="text-white">{refCode}</strong> or your 10-digit account number during registration.
            </p>
          </div>

          {/* Referral History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Invited Accounts ({referrals.length})</span>
            </h4>

            {referrals.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs bg-[#001428] rounded-2xl border border-[#00264d]">
                No referrals recorded yet. Share your code to earn rewards.
              </div>
            ) : (
              referrals.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-[#001428] border border-[#00264d] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{r.referredName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Acc: {r.referredAccountNumber} • {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        r.status === 'Credited'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : r.status === 'Pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {r.status === 'Credited' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{r.status}</span>
                    </span>
                    <p className="font-mono font-bold text-emerald-400 mt-1">
                      +${Number(r.rewardAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
