import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { store } from '../lib/store';
import { UserProfile, CardDetails } from '../types';
import { BrandLogo } from './BrandLogo';

interface VirtualCardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCardGenerated: (card: CardDetails) => void;
}

export const VirtualCardGeneratorModal: React.FC<VirtualCardGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCardGenerated
}) => {
  const [elapsed, setElapsed] = useState(0); // 0 to 30 seconds
  const totalDuration = 30; // exactly 30 seconds per requirement

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= totalDuration) {
          clearInterval(interval);
          return totalDuration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // When timer hits 30 seconds, automatically issue card
  useEffect(() => {
    if (isOpen && elapsed >= totalDuration) {
      const issue = async () => {
        const result = await store.issueVirtualCard(currentUser.uid);
        if (result.success && result.card) {
          onCardGenerated(result.card);
        }
      };
      issue();
    }
  }, [elapsed, isOpen, currentUser.uid, onCardGenerated]);

  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  const remaining = Math.max(0, totalDuration - elapsed);

  // Status message based on elapsed time
  let currentStep = 'Initialising Barclay Card Network...';
  let stepNumber = 1;
  if (elapsed >= 24) {
    currentStep = 'Embossing cardholder credentials & minting Platinum Virtual Debit Card...';
    stepNumber = 4;
  } else if (elapsed >= 16) {
    currentStep = 'Registering digital token with Global Payment Gateway...';
    stepNumber = 3;
  } else if (elapsed >= 8) {
    currentStep = 'Provisioning 256-bit EMV cryptographic security keys & CVV...';
    stepNumber = 2;
  } else {
    currentStep = 'Allocating Barclay Global Clearing BIN (4552 1089)...';
    stepNumber = 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#001428] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white p-6 sm:p-8 text-center space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo variant="emblem" size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Barclay Card Services
            </span>
          </div>
          {elapsed >= totalDuration && (
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Shimmering Card Hologram Visual */}
        <div className="relative mx-auto w-56 h-34 rounded-2xl bg-gradient-to-tr from-[#0a1f3d] via-[#0d2d5a] to-[#124280] border border-cyan-400/50 shadow-2xl shadow-cyan-500/20 p-4 flex flex-col justify-between overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">Barclay Platinum</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 z-10">
            <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/40 shadow-inner" />
            <span className="font-mono text-xs text-white tracking-widest font-black">
              4552 •••• •••• ••••
            </span>
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-slate-300 z-10">
            <span className="uppercase">{currentUser.fullName} {currentUser.surname}</span>
            <span>EXP: ••/••</span>
          </div>
        </div>

        {/* Modal Title & Countdown */}
        <div>
          <h3 className="text-base font-black text-white">
            Processing & Generating Virtual Card...
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Allocating secure credentials on the Barclay Global Clearing Gateway.
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-cyan-400">{percentage}% COMPLETE</span>
            <span className="text-slate-400">{remaining}s remaining</span>
          </div>

          <div className="w-full h-2.5 bg-[#001f3f] rounded-full overflow-hidden p-0.5 border border-[#003866]">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-md shadow-cyan-500/50"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="p-3.5 rounded-xl bg-[#001d38] border border-[#00335c] text-left text-xs flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">
              Phase {stepNumber} of 4
            </span>
            <p className="text-white text-xs truncate mt-0.5 font-medium">{currentStep}</p>
          </div>
        </div>

        <p className="text-[10px] text-slate-500">
          Barclay 256-bit Hardware Security Module (HSM) • EMV Level 3 Certified
        </p>

      </div>
    </div>
  );
};
