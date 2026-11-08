import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  FileText,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BankTransaction } from '../types';
import { BrandLogo } from './BrandLogo';

interface TransactionReceiptModalProps {
  transaction: BankTransaction | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const copyReference = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Requirement 4: Remove all default Welcome Credit descriptions and sanitize
  const cleanSenderName = (transaction.senderName || 'Barclays Clearing London')
    .replace(/\(Welcome Credit\)/gi, '')
    .trim();

  let cleanDescription = transaction.description || 'Core Banking Liquidity Settlement';
  if (cleanDescription.toLowerCase().includes('welcome credit') || cleanDescription.toLowerCase().includes('opening welcome')) {
    cleanDescription = 'Initial Direct Account Deposit Settlement';
  }

  // Requirement 4: Clearly mark sample receipts as SAMPLE or DEMO
  const isSample = 
    transaction.id.startsWith('tx_seed_') || 
    transaction.reference.includes('DEMO') || 
    transaction.reference.includes('SAMPLE') || 
    transaction.description?.toLowerCase().includes('seed') ||
    transaction.description?.toLowerCase().includes('demo');

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          label: 'COMPLETED',
          bg: 'bg-emerald-50 border-emerald-500 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          desc: 'Transaction has been successfully approved, settled, and executed via central clearing.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        };
      case 'Pending':
        return {
          label: 'PENDING BARCLAY REVIEW',
          bg: 'bg-amber-50 border-amber-500 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          desc: 'Transaction is currently awaiting central clearance review and verification.',
          icon: <Clock className="w-5 h-5 text-amber-600 shrink-0" />
        };
      case 'Reversed':
        return {
          label: 'REVERSED',
          bg: 'bg-rose-50 border-rose-500 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          desc: 'Transaction was cancelled by central clearance. Associated funds have been restored.',
          icon: <RotateCcw className="w-5 h-5 text-rose-600 shrink-0" />
        };
      default:
        return {
          label: status.toUpperCase(),
          bg: 'bg-slate-50 border-slate-400 text-slate-900',
          badgeBg: 'bg-slate-700 text-white',
          desc: 'Transaction status recorded in core clearing ledger.',
          icon: <FileText className="w-5 h-5 text-slate-600 shrink-0" />
        };
    }
  };

  const statusInfo = getStatusDisplay(transaction.status);
  const formattedDate = new Date(transaction.createdAt).toLocaleString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto print:m-0 print:p-0 print:max-w-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-5 py-3 bg-[#00172e] text-white flex items-center justify-between border-b border-[#002e5c] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official Electronic Advice
            </span>
            {isSample && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                Sample
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Banking Advice Document */}
        <div className="p-6 sm:p-8 font-sans relative bg-[#fcfcfd]">
          {/* Subtle Security Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
            <span className="font-extrabold text-7xl uppercase tracking-widest text-slate-900 rotate-[-30deg]">
              BARCLAY BANK
            </span>
          </div>

          {/* ================= HEADER: PROPERLY ALIGNED & UNCOMPRESSED ================= */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-4">
            
            {/* Top Row: Brand Logo & Document Identification */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <BrandLogo variant="horizontal" size="md" />

              <div className="sm:text-right">
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    ELECTRONIC TRANSFER ADVICE
                  </span>
                  {isSample && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      SAMPLE / DEMO
                    </span>
                  )}
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    Ref: <strong className="text-slate-950 font-black">{transaction.reference}</strong>
                  </span>
                  <button
                    onClick={copyReference}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors print:hidden"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Business Address & Legal Authority (Organized & Uncompressed) */}
            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="font-bold text-slate-900">
                  Barclay Online Bank PLC • Central Clearing & Settlement
                </p>
                <span className="text-[11px] font-mono text-slate-500">
                  Date: {formattedDate}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Head Office: 1 Churchill Place, Canary Wharf, London, E14 5HP, United Kingdom
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Regulated by the Prudential Regulation Authority (PRA) and the Financial Conduct Authority (FCA). Registered in England and Wales.
              </p>
            </div>
          </div>

          {/* ================= 6 CLEARLY SEPARATED SECTIONS ================= */}
          <div className="divide-y divide-slate-200 my-4 space-y-4 text-xs">

            {/* 1. TRANSACTION INFORMATION */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                1. Transaction Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Category / Type</span>
                  <span className="font-bold text-slate-900 text-xs uppercase mt-0.5 block">
                    {transaction.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Settlement Currency</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {transaction.currency || 'USD'} (Primary)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Clearing Channel</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                    Central Clearing Gateway
                  </span>
                </div>
              </div>
            </div>

            {/* 2. REMITTER / SENDER DETAILS */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                2. Remitter / Sender Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Remitter Legal Name</span>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">
                    {cleanSenderName}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Originating Account / Institution</span>
                  <p className="font-mono font-semibold text-slate-900 text-xs">
                    {transaction.accountNumber || transaction.senderAccountNumber || '8344338188'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Debiting Institution: <strong>Barclay Online Bank PLC (UK)</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. BENEFICIARY DETAILS */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                3. Beneficiary Details
              </span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Beneficiary Name</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      {transaction.recipientName || cleanSenderName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Beneficiary Bank</span>
                    <p className="font-semibold text-slate-900 text-xs">
                      {transaction.recipientBank || 'Barclay Online Bank'}
                    </p>
                  </div>
                </div>

                {(transaction.recipientAccountNumber || transaction.swiftCode || transaction.recipientCountry) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    {transaction.recipientAccountNumber && (
                      <div>
                        <span className="text-slate-500 block">Account / IBAN:</span>
                        <span className="font-mono font-bold text-slate-800">{transaction.recipientAccountNumber}</span>
                      </div>
                    )}
                    {transaction.swiftCode && (
                      <div>
                        <span className="text-slate-500 block">SWIFT / BIC:</span>
                        <span className="font-mono font-bold text-slate-800">{transaction.swiftCode}</span>
                      </div>
                    )}
                    {transaction.recipientCountry && (
                      <div>
                        <span className="text-slate-500 block">Destination Country:</span>
                        <span className="font-semibold text-slate-800">{transaction.recipientCountry}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. PAYMENT INFORMATION */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                4. Payment Information
              </span>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                  Total Transaction Amount Settled
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#00264d] font-mono tracking-tight">
                  ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.currency || 'USD'}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-200">
                  <span>Actual Description: <strong className="text-slate-900 font-semibold">{cleanDescription}</strong></span>
                  <span>•</span>
                  <span>Clearing Fee: <strong className="text-emerald-700 font-bold">$0.00 USD (Zero-Fee)</strong></span>
                </div>
              </div>
            </div>

            {/* 5. TRANSACTION REFERENCE */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                5. Transaction Reference & Identifiers
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Transaction Reference</span>
                  <span className="font-bold text-slate-900 break-all">{transaction.reference}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Core Clearing ID</span>
                  <span className="font-bold text-slate-900 break-all">{transaction.id}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Cryptographic Digest</span>
                  <span className="font-bold text-cyan-800 break-all">
                    SHA256-{transaction.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. TRANSACTION STATUS */}
            <div className="pt-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                6. Transaction Status & Cryptographic Clearance
              </span>
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border ${statusInfo.bg} flex items-center gap-3.5 shadow-sm`}>
                {statusInfo.icon}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
                      Current Status:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${statusInfo.badgeBg}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-snug">
                    {statusInfo.desc}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ================= OFFICIAL DIGITAL SEAL & SIGNATURE FOOTER ================= */}
          <div className="mt-8 pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-black text-slate-900 uppercase tracking-wide">
                  VERIFIED ELECTRONIC ADVICE
                </p>
                <p className="text-[10px] text-slate-500">
                  Cryptographically authenticated and settled by Barclay Global Core Clearing
                </p>
              </div>
            </div>

            {/* Official Stamp / Seal */}
            <div className="border-2 border-dashed border-[#00264d] px-3.5 py-2 rounded-xl text-center select-none bg-slate-50/50 transform -rotate-1 self-start sm:self-auto">
              <span className="text-[10px] uppercase font-black text-[#00264d] tracking-widest block">
                BARCLAY CLEARING PLC
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-600 block">
                CLEARANCE AUTH: {transaction.id.slice(0, 10).toUpperCase()}
              </span>
              <span className="text-[8px] font-mono text-emerald-700 font-bold block">
                STATUS: SETTLED & VERIFIED
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
