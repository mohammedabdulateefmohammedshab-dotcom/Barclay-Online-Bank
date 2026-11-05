import React from 'react';
import { X, Building2, ShieldCheck, Globe, Award, Landmark, Lock, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between bg-[#001428]">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-md border border-cyan-400/40">
              <img
                src="/logo.png"
                alt="Barclay Online Bank"
                className="h-9 w-auto object-contain select-none"
              />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">About Barclay Online Bank</h3>
              <p className="text-[10px] text-cyan-400">Canary Wharf, London • Established Excellence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-[#002244] border border-[#003d73] space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-cyan-400" />
              <span>A Legacy of Sovereign Security & Global Liquidity</span>
            </h4>
            <p>
              Barclay Online Bank is a premier international private and commercial digital banking institution. Headquartered at 1 Churchill Place, Canary Wharf, London, we combine the heritage of British high finance with next-generation automated cryptographic settlements.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#001c38] border border-[#002f5e] space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h5 className="font-bold text-white">256-Bit Cryptography</h5>
              <p className="text-[11px] text-slate-400">
                End-to-end multi-layer encryption protects every user session, SWIFT message, and account ledger mutation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001c38] border border-[#002f5e] space-y-1.5">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h5 className="font-bold text-white">Global SWIFT Clearing</h5>
              <p className="text-[11px] text-slate-400">
                Direct integration across 30+ sovereign territories and hundreds of verified commercial clearing banks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001c38] border border-[#002f5e] space-y-1.5">
              <Award className="w-5 h-5 text-amber-400" />
              <h5 className="font-bold text-white">Three-Tier KYC Structure</h5>
              <p className="text-[11px] text-slate-400">
                From Standard digital accounts to VIP Elite Private Client tiers with multi-million dollar daily allowances.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#001c38] border border-[#002f5e] space-y-1.5">
              <Lock className="w-5 h-5 text-purple-400" />
              <h5 className="font-bold text-white">Institutional Crypto Custody</h5>
              <p className="text-[11px] text-slate-400">
                Native Bitcoin and USDT ERC-20 payment gateways for high-velocity international settlements.
              </p>
            </div>
          </div>

          <div className="border-t border-[#002b52] pt-3 text-[11px] text-slate-400">
            <p>
              Barclay Online Bank PLC is authorized by the Prudential Regulation Authority and regulated by the Financial Conduct Authority. Registered in England & Wales. No. 1026167.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
