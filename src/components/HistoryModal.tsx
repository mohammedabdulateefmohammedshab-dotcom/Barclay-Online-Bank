import React, { useState } from 'react';
import { X, Clock, Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { BankTransaction } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: BankTransaction[];
  initialFilter?: 'all' | 'withdrawals';
  onViewReceipt: (tx: BankTransaction) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  initialFilter = 'all',
  onViewReceipt
}) => {
  const [filterType, setFilterType] = useState<'all' | 'credits' | 'debits' | 'withdrawals'>(
    initialFilter === 'withdrawals' ? 'withdrawals' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = transactions.filter((tx) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = tx.reference.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchSender = (tx.senderName || '').toLowerCase().includes(q);
      const matchRecip = (tx.recipientName || '').toLowerCase().includes(q);
      if (!matchRef && !matchDesc && !matchSender && !matchRecip) return false;
    }

    if (filterType === 'withdrawals') return tx.type === 'withdrawal';
    if (filterType === 'credits') return tx.type === 'deposit' || tx.type === 'crypto_payment';
    if (filterType === 'debits') return tx.type === 'transfer' || tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {filterType === 'withdrawals' ? 'Withdrawal History' : 'Transaction History & Ledgers'}
              </h3>
              <p className="text-xs text-slate-400">Complete immutable record of all custody operations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-[#001428] border-b border-[#002447] flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, recipient, remitter..."
              className="w-full bg-[#000d1a] border border-[#002f5e] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                filterType === 'all' ? 'bg-cyan-500 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterType('withdrawals')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                filterType === 'withdrawals' ? 'bg-amber-400 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
              }`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => setFilterType('credits')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                filterType === 'credits' ? 'bg-emerald-400 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setFilterType('debits')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                filterType === 'debits' ? 'bg-rose-400 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
              }`}
            >
              Debits
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-white">No transactions found</p>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or filter options.</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'crypto_payment';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#001428] border border-[#00264d] hover:border-[#003866] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-white truncate">
                          {isCredit ? (tx.senderName || 'Inbound Deposit') : (tx.recipientName || 'Outbound Wire')}
                        </p>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : tx.status === 'Pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        Ref: {tx.reference} • {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-mono font-black text-xs sm:text-sm ${
                      isCredit ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onViewReceipt(tx);
                      }}
                      className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 justify-end mt-0.5"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
