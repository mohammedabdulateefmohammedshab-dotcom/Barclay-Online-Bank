import React, { useState } from 'react';
import { X, Building2, Copy, Check, ShieldCheck, Globe, Landmark } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const AccountInfoModal: React.FC<AccountInfoModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const iban = `GB29 BARC 2000 00${currentUser.accountNumber}`;
  const swiftBic = 'BARCGB22';
  const sortCode = '20-00-00';

  const bankingDetails = [
    { label: 'Beneficiary Legal Name', value: `${currentUser.fullName} ${currentUser.surname}`, key: 'name' },
    { label: '10-Digit Account Number', value: currentUser.accountNumber, key: 'acc' },
    { label: 'International Bank Account Number (IBAN)', value: iban, key: 'iban' },
    { label: 'SWIFT / BIC Clearing Code', value: swiftBic, key: 'swift' },
    { label: 'Sort Code / Branch Identifier', value: sortCode, key: 'sort' },
    { label: 'Domiciled Clearing Branch', value: '1 Churchill Place, Canary Wharf, London, E14 5HP, UK', key: 'branch' },
    { label: 'Primary Currency', value: 'USD (United States Dollar)', key: 'curr' },
    { label: 'Account Custody Tier', value: currentUser.tier, key: 'tier' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Official Account Information</h3>
              <p className="text-xs text-slate-400">International Wire & Routing Coordinates</p>
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
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-slate-300 leading-relaxed">
            Provide these credentials to remitters and employers for direct inbound deposits, wires, and SEPA/SWIFT clearing.
          </p>

          <div className="space-y-2.5">
            {bankingDetails.map((item) => (
              <div 
                key={item.key} 
                className="p-3.5 rounded-xl bg-[#001428] border border-[#00264d] flex items-center justify-between text-xs hover:border-[#003866] transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{item.label}</span>
                  <span className="font-mono text-white font-semibold text-xs sm:text-sm mt-0.5 block break-all">
                    {item.value}
                  </span>
                </div>

                {item.key !== 'branch' && (
                  <button
                    onClick={() => handleCopy(item.value, item.key)}
                    className="p-2 rounded-lg bg-[#001f3d] hover:bg-[#002d59] text-cyan-300 transition-colors shrink-0"
                    title={`Copy ${item.label}`}
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
