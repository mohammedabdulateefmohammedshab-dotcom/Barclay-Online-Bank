import React, { useState } from 'react';
import { X, CreditCard, Coins, Copy, Check, ShieldCheck, Zap, ArrowDownLeft } from 'lucide-react';
import { UserProfile, FinancialSettings } from '../types';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
  onOpenDeposit: () => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onOpenDeposit
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const card = currentUser.card;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Payment Methods & Gateways</h3>
              <p className="text-xs text-slate-400">Cards, clearing addresses & digital custody</p>
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
          
          {/* Card Summary Capsule */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#001e3d] to-[#001224] border border-[#003866] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Platinum Virtual Debit</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                {card?.status === 'active' ? 'Active' : 'Digital Issuer Ready'}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono">
              <p className="text-sm font-black tracking-widest text-white">
                •••• •••• •••• {card?.cardNumber ? card.cardNumber.slice(-4) : currentUser.accountNumber.slice(-4)}
              </p>
              <span className="text-xs text-cyan-300 font-bold">11/29</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#00284d]">
              <span>Cardholder: <strong className="text-white">{currentUser.fullName} {currentUser.surname}</strong></span>
              <span>Daily Limit: <strong className="text-emerald-400">$25,000</strong></span>
            </div>
          </div>

          {/* Cryptocurrency Gateway Addresses */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Deposit Gateways (Instant Clearing)</span>
            </h4>

            {/* Bitcoin */}
            <div className="p-3.5 rounded-xl bg-[#001428] border border-[#00284d] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">Bitcoin Network (BTC)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Automated Settlement</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs text-slate-300 truncate bg-[#000d1a] p-2 rounded-lg flex-1 border border-[#001f3d]">
                  {settings.btcAddress || 'bc1qrc3ldwp9jrrtmlcua4czjnnkz49m6uahetuqgx'}
                </p>
                <button
                  onClick={() => handleCopy(settings.btcAddress || 'bc1qrc3ldwp9jrrtmlcua4czjnnkz49m6uahetuqgx', 'btc')}
                  className="p-2 rounded-lg bg-[#001f3d] hover:bg-[#002f5c] text-cyan-300"
                >
                  {copiedKey === 'btc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tether USDT */}
            <div className="p-3.5 rounded-xl bg-[#001428] border border-[#00284d] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-400">Tether USDT (ERC-20)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Ethereum Mainnet</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs text-slate-300 truncate bg-[#000d1a] p-2 rounded-lg flex-1 border border-[#001f3d]">
                  {settings.usdtAddress || '0x71C80917208942918840A8bfa2C482aC95C642d9'}
                </p>
                <button
                  onClick={() => handleCopy(settings.usdtAddress || '0x71C80917208942918840A8bfa2C482aC95C642d9', 'usdt')}
                  className="p-2 rounded-lg bg-[#001f3d] hover:bg-[#002f5c] text-cyan-300"
                >
                  {copiedKey === 'usdt' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenDeposit();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Make a Deposit Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
