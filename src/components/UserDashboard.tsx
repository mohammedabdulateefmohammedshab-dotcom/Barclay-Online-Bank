import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  FileText, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Headphones, 
  Settings, 
  Search, 
  Filter, 
  Lock, 
  TrendingUp, 
  Zap,
  Globe,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { UserProfile, BankTransaction, FinancialSettings } from '../types';
import { store } from '../lib/store';

interface UserDashboardProps {
  currentUser: UserProfile;
  transactions: BankTransaction[];
  settings: FinancialSettings;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
  onOpenWithdrawal: () => void;
  onOpenTierUpgrade: () => void;
  onOpenReceipt: (tx: BankTransaction) => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  transactions,
  settings,
  onOpenDeposit,
  onOpenTransfer,
  onOpenWithdrawal,
  onOpenTierUpgrade,
  onOpenReceipt,
  onOpenNotifications,
  onOpenSupport
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedSwift, setCopiedSwift] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit' | 'pending' | 'completed' | 'reversed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings Tab modal/state inside dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [newPin, setNewPin] = useState('');
  const [pinUpdateMsg, setPinUpdateMsg] = useState('');

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(currentUser.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const copySwiftCode = () => {
    navigator.clipboard.writeText(currentUser.swiftVerificationCode || '8492');
    setCopiedSwift(true);
    setTimeout(() => setCopiedSwift(false), 2000);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      setPinUpdateMsg('PIN must be exactly 4 numeric digits.');
      return;
    }
    currentUser.pin = newPin;
    currentUser.updatedAt = new Date().toISOString();
    setPinUpdateMsg('Secure PIN updated successfully!');
    setNewPin('');
    setTimeout(() => setPinUpdateMsg(''), 3000);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = tx.reference.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchSender = (tx.senderName || '').toLowerCase().includes(q);
      const matchRecip = (tx.recipientName || '').toLowerCase().includes(q);
      const matchBank = (tx.recipientBank || '').toLowerCase().includes(q);
      if (!matchRef && !matchDesc && !matchSender && !matchRecip && !matchBank) return false;
    }

    if (txFilter === 'credit') return tx.type === 'deposit' || tx.type === 'crypto_payment';
    if (txFilter === 'debit') return tx.type === 'transfer' || tx.type === 'withdrawal';
    if (txFilter === 'pending') return tx.status === 'Pending';
    if (txFilter === 'completed') return tx.status === 'Completed';
    if (txFilter === 'reversed') return tx.status === 'Reversed' || tx.status === 'Cancelled';
    return true;
  });

  const currentTierDailyLimit = currentUser.tier === 'Tier 1'
    ? settings.tier1DailyLimit
    : currentUser.tier === 'Tier 2'
    ? settings.tier2DailyLimit
    : settings.tier3DailyLimit;

  const currentTierMonthlyLimit = currentUser.tier === 'Tier 1'
    ? settings.tier1MonthlyLimit
    : currentUser.tier === 'Tier 2'
    ? settings.tier2MonthlyLimit
    : settings.tier3MonthlyLimit;

  return (
    <div className="min-h-screen bg-[#00172e] text-white pb-20">
      
      {/* Sub-header User Welcome Banner */}
      <div className="bg-[#001428] border-b border-[#00284d] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md border border-cyan-400/40 shrink-0">
              <img
                src="/logo.png"
                alt="Barclay Online Bank Logo"
                className="h-10 sm:h-12 w-auto object-contain select-none"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Welcome back, {currentUser.fullName} {currentUser.surname}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Active Client
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Barclay Online Banking Account • Registered Country: <strong className="text-white">{currentUser.country}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab(activeTab === 'overview' ? 'settings' : 'overview')}
              className="px-3.5 py-2 rounded-xl bg-[#002244] hover:bg-[#002f5c] border border-[#003d73] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>{activeTab === 'overview' ? 'Account Settings' : 'Back to Dashboard'}</span>
            </button>

            <button
              onClick={onOpenSupport}
              className="px-3.5 py-2 rounded-xl bg-[#002244] hover:bg-[#002f5c] border border-[#003d73] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Headphones className="w-4 h-4 text-cyan-400" />
              <span>Support Desk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {activeTab === 'settings' ? (
          /* Account Settings Section (Requirement 2) */
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#001f3d] border border-[#003866] shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#002d57] pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Account Security & Preferences</h3>
                  <p className="text-xs text-slate-400">Manage your secure credentials, PIN, and identity tier</p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Return to Overview
                </button>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00264d]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Legal Name</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.fullName} {currentUser.surname}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00264d]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Email</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">{currentUser.email}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00264d]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">10-Digit Account Number</span>
                  <span className="font-mono font-black text-cyan-300 text-sm mt-0.5 block">{currentUser.accountNumber}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00264d]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Account Tier</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-amber-400 text-sm">{currentUser.tier}</span>
                    <button
                      onClick={onOpenTierUpgrade}
                      className="text-[11px] text-cyan-400 font-semibold hover:underline"
                    >
                      Upgrade Tier
                    </button>
                  </div>
                </div>
              </div>

              {/* SWIFT Code & 4-Digit Verification Code */}
              <div className="p-4 rounded-xl bg-[#00162e] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">SWIFT 4-Digit Authorization Code</span>
                    <p className="text-[11px] text-slate-400">Required when dispatching international SWIFT wire transfers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-amber-300 bg-[#002244] px-3 py-1 rounded border border-[#003866]">
                      {currentUser.swiftVerificationCode || '8492'}
                    </span>
                    <button
                      onClick={copySwiftCode}
                      className="p-1.5 rounded bg-[#002b54] hover:bg-[#00386e] text-cyan-300 text-xs transition-colors"
                      title="Copy SWIFT Code"
                    >
                      {copiedSwift ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Update PIN */}
              <form onSubmit={handleUpdatePin} className="p-4 rounded-xl bg-[#001326] border border-[#00264d] space-y-3">
                <span className="text-xs font-bold text-white block">Update 4-Digit Secure PIN</span>
                {pinUpdateMsg && (
                  <p className={`text-xs ${pinUpdateMsg.includes('success') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pinUpdateMsg}
                  </p>
                )}
                <div className="flex gap-3">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter new 4-digit PIN"
                    className="flex-1 bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Save PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Dashboard Main Overview */
          <>
            {/* Top Row: Barclay Premier Card & Key Metric Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Virtual Barclay Debit Card */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#002850] via-[#001f3f] to-[#001224] border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-md border border-cyan-400/40">
                      <img
                        src="/logo.png"
                        alt="Barclay Online Bank"
                        className="h-8 w-auto object-contain select-none"
                      />
                    </div>

                    <button
                      onClick={onOpenTierUpgrade}
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                    >
                      {currentUser.tier} • Upgrade
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="w-11 h-8 rounded bg-gradient-to-tr from-amber-300 to-amber-500 shadow-inner border border-amber-200/50 flex items-center justify-center">
                      <div className="w-7 h-5 border border-amber-800/40 rounded-sm"></div>
                    </div>
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>

                  {/* 10-Digit Account Number (Requirement 2) */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        10-DIGIT ACCOUNT NUMBER
                      </span>
                      <button
                        onClick={copyAccountNumber}
                        className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {copiedAcc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white mt-0.5">
                      {currentUser.accountNumber.slice(0, 4)} {currentUser.accountNumber.slice(4, 8)} {currentUser.accountNumber.slice(8, 10)}
                    </p>
                  </div>

                  {/* Available Account Balance (Requirement 2) */}
                  <div className="pt-2 border-t border-[#002f5e]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        TOTAL AVAILABLE BALANCE
                      </span>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={showBalance ? 'Hide Balance' : 'Show Balance'}
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="font-mono text-3xl font-black text-cyan-300 mt-0.5 flex items-baseline gap-2">
                      {showBalance ? (
                        <>
                          <span>${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-xs font-semibold text-slate-400">USD</span>
                        </>
                      ) : (
                        <span>$••••••••</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-300 font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">CARDHOLDER</span>
                      <span className="font-bold text-white tracking-wider">{currentUser.fullName} {currentUser.surname}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">STATUS</span>
                      <span className="font-bold text-emerald-400 uppercase">ONLINE ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Limit Gauges */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                {/* 4 Primary Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Deposit Funds */}
                  <button
                    onClick={onOpenDeposit}
                    className="p-4 rounded-xl bg-[#001f3d] hover:bg-[#002850] border border-[#003866] hover:border-cyan-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Deposit Funds</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Crypto & Wire</p>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    onClick={onOpenTransfer}
                    className="p-4 rounded-xl bg-[#001f3d] hover:bg-[#002850] border border-[#003866] hover:border-cyan-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Send className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Bank Transfer</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">30+ Countries SWIFT</p>
                  </button>

                  {/* Withdrawal */}
                  <button
                    onClick={onOpenWithdrawal}
                    className="p-4 rounded-xl bg-[#001f3d] hover:bg-[#002850] border border-[#003866] hover:border-cyan-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Withdrawal</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Direct Payout</p>
                  </button>

                  {/* Upgrade Tier */}
                  <button
                    onClick={onOpenTierUpgrade}
                    className="p-4 rounded-xl bg-[#001f3d] hover:bg-[#002850] border border-[#003866] hover:border-amber-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Upgrade Tier</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Biometric KYC</p>
                  </button>
                </div>

                {/* Account Limits & Tiers Card (Requirement 7) */}
                <div className="p-5 rounded-2xl bg-[#001c38] border border-[#003366] shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-extrabold uppercase tracking-wide text-white">
                        {currentUser.tier} Custody Capacity
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      Auto-Synchronized with Central Bank Settings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Daily Limit */}
                    <div className="p-3 rounded-xl bg-[#001428] border border-[#002952]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Daily Transaction Limit:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ${currentTierDailyLimit.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#002447] overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full w-[20%]"></div>
                      </div>
                    </div>

                    {/* Monthly Limit */}
                    <div className="p-3 rounded-xl bg-[#001428] border border-[#002952]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Monthly Transaction Limit:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          ${currentTierMonthlyLimit.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#002447] overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[12%]"></div>
                      </div>
                    </div>
                  </div>

                  {currentUser.tier === 'Tier 1' && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#002447] border border-[#003866] text-xs">
                      <span className="text-slate-300">
                        Unlock $50,000 daily & $5,000,000 monthly limit with Tier 2 facial verification.
                      </span>
                      <button
                        onClick={onOpenTierUpgrade}
                        className="text-cyan-400 font-bold hover:underline shrink-0 ml-3"
                      >
                        Upgrade Now →
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Transaction History Section (Requirement 2 & 9) */}
            <div className="p-6 rounded-2xl bg-[#001c38] border border-[#003366] shadow-xl space-y-5">
              
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>Transaction History & Transfer Receipts</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any transaction record to generate and print its official Barclay Online Bank Transfer Advice
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reference, bank, name..."
                    className="w-full bg-[#001428] border border-[#002b52] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-[#00284d]">
                {(['all', 'credit', 'debit', 'pending', 'completed', 'reversed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTxFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      txFilter === tab
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                        : 'bg-[#002244] text-slate-300 hover:text-white hover:bg-[#002b54]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Transaction Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Party / Counterpart</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#002447]">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => {
                        const isCredit = tx.type === 'deposit' || tx.type === 'crypto_payment';
                        return (
                          <tr 
                            key={tx.id} 
                            onClick={() => onOpenReceipt(tx)}
                            className="hover:bg-[#002244] cursor-pointer transition-colors group"
                          >
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isCredit 
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                                  : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                              }`}>
                                {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {tx.type.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-3 px-3 font-mono font-bold text-white group-hover:text-cyan-300">
                              {tx.reference}
                            </td>

                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-200">
                                {isCredit ? (tx.senderName || 'Barclays Clearing') : (tx.recipientName || 'Beneficiary')}
                              </p>
                              {tx.recipientBank && (
                                <p className="text-[10px] text-slate-400">{tx.recipientBank}</p>
                              )}
                            </td>

                            <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                              {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                tx.status === 'Completed'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : tx.status === 'Pending'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                {tx.status}
                              </span>
                            </td>

                            <td className={`py-3 px-3 text-right font-mono font-black text-sm ${
                              isCredit ? 'text-emerald-400' : 'text-slate-100'
                            }`}>
                              {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenReceipt(tx);
                                }}
                                className="px-2.5 py-1 rounded bg-[#002a52] hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-semibold transition-colors shadow"
                              >
                                View Advice
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
