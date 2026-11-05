import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Building2, 
  ShieldCheck, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { BankTransaction } from '../types';

interface TransactionReceiptModalProps {
  transaction: BankTransaction | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500',
          text: 'text-emerald-400',
          desc: 'Transaction has been successfully approved, settled, and executed via central clearing.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
      case 'Pending':
        return {
          label: 'Pending',
          bg: 'bg-amber-950/80',
          border: 'border-amber-500',
          text: 'text-amber-400',
          desc: 'Transaction is awaiting administrator review and validation. Amount will be deducted upon confirmation.',
          icon: <Clock className="w-5 h-5 text-amber-400" />
        };
      case 'Reversed':
        return {
          label: 'Reversed',
          bg: 'bg-rose-950/80',
          border: 'border-rose-500',
          text: 'text-rose-400',
          desc: 'Transaction was cancelled by administrator. Any deducted funds have been exactly restored to your account balance.',
          icon: <RotateCcw className="w-5 h-5 text-rose-400" />
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-900',
          border: 'border-slate-700',
          text: 'text-slate-300',
          desc: 'Transaction status updated.',
          icon: <FileText className="w-5 h-5 text-slate-400" />
        };
    }
  };

  const statusInfo = getStatusDisplay(transaction.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-[#00172e] text-white flex items-center justify-between border-b border-[#002e5c] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official Electronic Transfer Advice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Banking Advice Document */}
        <div className="p-8 font-sans relative bg-[#fdfdfd]">
          {/* Subtle Security Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="font-extrabold text-7xl uppercase tracking-widest text-slate-900 rotate-[-30deg]">
              BARCLAY BANK
            </span>
          </div>

          {/* Official Bank Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Barclay Online Bank"
                className="h-14 sm:h-16 w-auto object-contain select-none"
              />
              <div className="border-l border-slate-300 pl-4">
                <p className="text-xs text-slate-700 font-bold">
                  Head Office: 1 Churchill Place, Canary Wharf, London E14 5HP, UK
                </p>
                <p className="text-[10px] text-slate-500">
                  Regulated by the Prudential Regulation Authority & Financial Conduct Authority
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                ADVICE REFERENCE
              </span>
              <span className="font-mono text-sm font-black text-slate-900">
                {transaction.reference}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                {new Date(transaction.createdAt).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'medium' })}
              </p>
            </div>
          </div>

          {/* Transaction Status Ribbon (Requirement 9) */}
          <div className={`my-5 p-4 rounded-xl border ${statusInfo.border} ${statusInfo.bg} flex items-center gap-3.5 shadow-sm`}>
            {statusInfo.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-100">
                  Transaction Status:
                </span>
                <span className={`text-sm font-black uppercase tracking-wider ${statusInfo.text}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-snug">
                {statusInfo.desc}
              </p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center my-4">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Total Transaction Amount
            </span>
            <div className="text-3xl font-black text-[#00264d] mt-0.5 font-mono">
              ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency || 'USD'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Transaction Category: <strong className="uppercase text-slate-800">{transaction.type.replace('_', ' ')}</strong>
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 my-5 text-xs">
            {/* Sender Coordinates */}
            <div className="space-y-2 border-r border-slate-200 pr-4">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block border-b pb-1">
                Remitter / Sender Details
              </span>
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-bold text-slate-800">{transaction.senderName || 'Barclays Online Customer'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Account Number:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {transaction.accountNumber || transaction.senderAccountNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Debiting Institution:</span>
                <span className="font-medium text-slate-700">Barclay Online Bank PLC</span>
              </div>
            </div>

            {/* Recipient Coordinates */}
            <div className="space-y-2 pl-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block border-b pb-1">
                Beneficiary Details
              </span>
              <div>
                <span className="text-slate-500 block">Beneficiary Name:</span>
                <span className="font-bold text-slate-800">{transaction.recipientName || transaction.senderName || 'N/A'}</span>
              </div>
              {transaction.recipientBank && (
                <div>
                  <span className="text-slate-500 block">Beneficiary Bank:</span>
                  <span className="font-medium text-slate-800">{transaction.recipientBank}</span>
                </div>
              )}
              {transaction.recipientAccountNumber && (
                <div>
                  <span className="text-slate-500 block">Account / IBAN:</span>
                  <span className="font-mono font-semibold text-slate-800">{transaction.recipientAccountNumber}</span>
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
                  <span className="font-medium text-slate-800">{transaction.recipientCountry}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description / Remarks */}
          <div className="border-t border-slate-200 pt-3 text-xs">
            <span className="text-slate-500">Remarks / Description: </span>
            <span className="font-medium text-slate-800">{transaction.description || 'Barclay Online Banking Settlement'}</span>
          </div>

          {/* Official Stamp & Security Signature Footer */}
          <div className="mt-8 pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-900">VERIFIED ELECTRONIC ADVICE</p>
                <p className="text-[10px] text-slate-500">Cryptographically signed by Barclay Clearing System</p>
              </div>
            </div>

            {/* Simulated Stamp / Seal */}
            <div className="border-2 border-dashed border-[#00264d] px-3 py-1.5 rounded-lg text-center transform -rotate-2 select-none">
              <span className="text-[10px] uppercase font-black text-[#00264d] tracking-widest block">
                BARCLAY CLEARING
              </span>
              <span className="text-[8px] font-mono text-slate-500">
                AUTH: {transaction.id.slice(0, 10).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
