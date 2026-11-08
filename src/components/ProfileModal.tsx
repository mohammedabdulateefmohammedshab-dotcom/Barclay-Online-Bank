import React, { useState } from 'react';
import { X, User, Mail, Globe, ShieldCheck, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Client Profile & Identity</h3>
              <p className="text-xs text-slate-400">Personal Banking Registration Record</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Avatar and Verification Badge */}
          <div className="p-4 rounded-2xl bg-[#00172e] border border-[#002b52] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg">
                {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm sm:text-base">{currentUser.fullName} {currentUser.surname}</h4>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">{currentUser.tier}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">First / Given Name</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.fullName}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Surname / Family Name</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.surname}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Primary Registered Email</span>
              <span className="font-mono text-cyan-300 font-medium text-xs mt-0.5 block truncate">{currentUser.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Country of Residence</span>
              <span className="font-medium text-white text-xs mt-0.5 block">{currentUser.country}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">10-Digit Account Number</span>
              <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">{currentUser.accountNumber}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001326] border border-[#002447]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Account Registration Date</span>
              <span className="font-mono text-slate-300 text-xs mt-0.5 block">
                {new Date(currentUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Compliance & Regulatory Notice */}
          <div className="p-4 rounded-2xl bg-[#00172e] border border-[#002b52] text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity Protection & KYC Compliance</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your profile is protected under strict zero-trust digital custody guidelines. To request changes to your primary legal name or registered country, contact the Barclay Support Center.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#002447] hover:bg-[#00315c] text-white font-bold text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
