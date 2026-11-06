import React, { useState } from 'react';
import { 
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
  AlertCircle,
  Snowflake,
  ShieldAlert,
  Smartphone,
  RefreshCw,
  Sliders,
  CheckCircle,
  KeyRound
} from 'lucide-react';
import { UserProfile, BankTransaction, FinancialSettings, CardDetails, CardLimits } from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'history' | 'settings'>('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedSwift, setCopiedSwift] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  
  // Transaction search & filter
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit' | 'pending' | 'completed' | 'reversed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Card Management Action State
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [cardActionLoading, setCardActionLoading] = useState(false);
  const [cardActionMsg, setCardActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('Lost or Stolen Card');

  // Settings tab state
  const [newPin, setNewPin] = useState('');
  const [pinUpdateMsg, setPinUpdateMsg] = useState('');

  const card: CardDetails = currentUser.card || {
    id: `card_${currentUser.uid}`,
    cardNumber: `4532${currentUser.accountNumber.slice(0, 4)}82910384`.slice(0, 16),
    cardHolder: `${currentUser.fullName} ${currentUser.surname}`.toUpperCase(),
    expiryDate: '11/29',
    cvv: '849',
    cardType: 'debit',
    brand: 'visa',
    status: 'inactive',
    activationCode: currentUser.pin || '1234',
    issuerName: 'Barclay Card Services Ltd & Visa Europe Int.',
    dailyLimit: 2500,
    monthlyLimit: 25000,
    issuedAt: currentUser.createdAt,
    limits: {
      onlinePayments: true,
      internationalUsage: true,
      atmWithdrawals: true,
      contactless: true
    }
  };

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

  const copyCardNumber = () => {
    navigator.clipboard.writeText(card.cardNumber);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
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

  // Card Activation Handler
  const handleActivateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardActionMsg(null);
    setCardActionLoading(true);

    try {
      const res = await store.activateCard(currentUser.uid, activationCodeInput);
      if (!res.success) {
        setCardActionMsg({ type: 'error', text: res.error || 'Failed to activate card.' });
      } else {
        setCardActionMsg({ type: 'success', text: 'Card activated successfully with Visa Issuer clearance!' });
        setActivationModalOpen(false);
        setActivationCodeInput('');
      }
    } catch (err: any) {
      setCardActionMsg({ type: 'error', text: err.message || 'Activation error' });
    } finally {
      setCardActionLoading(false);
    }
  };

  // Freeze / Unfreeze Handler
  const handleToggleFreeze = async () => {
    setCardActionMsg(null);
    setCardActionLoading(true);
    try {
      const res = await store.toggleCardFreeze(currentUser.uid);
      if (!res.success) {
        setCardActionMsg({ type: 'error', text: res.error || 'Unable to update card status.' });
      } else {
        setCardActionMsg({
          type: 'success',
          text: res.newStatus === 'frozen' ? 'Card is now safely frozen.' : 'Card has been unfrozen.'
        });
      }
    } catch (err: any) {
      setCardActionMsg({ type: 'error', text: err.message || 'Action error' });
    } finally {
      setCardActionLoading(false);
    }
  };

  // Block Card Handler
  const handleBlockCard = async () => {
    setCardActionMsg(null);
    setCardActionLoading(true);
    try {
      const res = await store.blockCard(currentUser.uid, blockReason);
      if (!res.success) {
        setCardActionMsg({ type: 'error', text: res.error || 'Unable to block card.' });
      } else {
        setBlockConfirmOpen(false);
        setCardActionMsg({ type: 'success', text: 'Card blocked. Emergency replacement can now be requested.' });
      }
    } catch (err: any) {
      setCardActionMsg({ type: 'error', text: err.message || 'Action error' });
    } finally {
      setCardActionLoading(false);
    }
  };

  // Replacement Card Handler
  const handleRequestReplacement = async () => {
    setCardActionMsg(null);
    setCardActionLoading(true);
    try {
      const res = await store.requestReplacementCard(currentUser.uid);
      if (!res.success) {
        setCardActionMsg({ type: 'error', text: res.error || 'Unable to issue replacement card.' });
      } else {
        setCardActionMsg({ type: 'success', text: 'New replacement debit card generated! Please activate to begin.' });
      }
    } catch (err: any) {
      setCardActionMsg({ type: 'error', text: err.message || 'Action error' });
    } finally {
      setCardActionLoading(false);
    }
  };

  // Toggle Limit Handler
  const handleToggleLimitSetting = async (key: keyof CardLimits) => {
    const currentVal = card.limits ? card.limits[key] : true;
    await store.updateCardSettings(currentUser.uid, {
      [key]: !currentVal
    });
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

  // Format 16-digit card number with masks
  const formatCardNumber = (num: string, reveal: boolean) => {
    const clean = num.replace(/\s/g, '');
    if (reveal) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
    }
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-white pb-24">
      
      {/* Sub-header User Welcome Banner */}
      <div className="bg-[#071324] border-b border-[#14233D] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo variant="emblem" size="md" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Welcome, {currentUser.fullName} {currentUser.surname}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Account Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                10-Digit Account Number: <strong className="font-mono text-blue-400">{currentUser.accountNumber}</strong> • Registered: <span className="text-white">{currentUser.country}</span>
              </p>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#0F223D] text-slate-300 hover:text-white border border-[#1E3A5F]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'cards'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#0F223D] text-slate-300 hover:text-white border border-[#1E3A5F]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card Management</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#0F223D] text-slate-300 hover:text-white border border-[#1E3A5F]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#0F223D] text-slate-300 hover:text-white border border-[#1E3A5F]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={onOpenSupport}
              className="px-3.5 py-2 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] text-xs font-semibold flex items-center gap-1.5 text-blue-400 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Support</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Global Toast / Feedback */}
        {cardActionMsg && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            cardActionMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/60 border-rose-700 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {cardActionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{cardActionMsg.text}</span>
            </div>
            <button onClick={() => setCardActionMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* ================= TAB 1: CARD MANAGEMENT (Requirement 6) ================= */}
        {activeTab === 'cards' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <h2 className="text-2xl font-black text-white">Barclay Platinum Card Management</h2>
                <p className="text-xs text-slate-400">View, activate, freeze, and manage limits for your Visa-authorized card</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  card.status === 'active'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : card.status === 'frozen'
                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                    : card.status === 'blocked'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  Card Status: {card.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Virtual Card Visual Presentation */}
              <div className="lg:col-span-5 space-y-4">
                <div className={`relative p-7 sm:p-8 rounded-3xl border shadow-2xl transition-all duration-300 ${
                  card.status === 'frozen'
                    ? 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border-blue-400/50 grayscale-[40%]'
                    : card.status === 'blocked'
                    ? 'bg-gradient-to-br from-rose-950/40 via-[#0A192F] to-[#071324] border-rose-600/50'
                    : 'bg-gradient-to-br from-[#0F223D] via-[#0A192F] to-[#071324] border-blue-500/40 shadow-blue-950/50'
                }`}>
                  
                  {card.status === 'frozen' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-200 text-xs font-bold">
                      <Snowflake className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                      <span>CARD FROZEN</span>
                    </div>
                  )}

                  {card.status === 'blocked' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>PERMANENTLY BLOCKED</span>
                    </div>
                  )}

                  {/* Card Brand Header */}
                  <div className="flex items-center justify-between">
                    <BrandLogo variant="horizontal" size="sm" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                      PLATINUM DEBIT
                    </span>
                  </div>

                  {/* EMV Chip & Contactless Wave */}
                  <div className="flex items-center justify-between pt-6">
                    <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-amber-300 to-amber-500 shadow-inner border border-amber-200/50 flex items-center justify-center">
                      <div className="w-8 h-6 border border-amber-800/40 rounded-sm"></div>
                    </div>
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>

                  {/* 16-Digit Card Number */}
                  <div className="pt-6">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                      <span>CARD NUMBER</span>
                      <button
                        type="button"
                        onClick={() => setShowCardNumber(!showCardNumber)}
                        className="text-blue-400 hover:text-white flex items-center gap-1"
                      >
                        {showCardNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showCardNumber ? 'Hide' : 'Reveal'}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white">
                        {formatCardNumber(card.cardNumber, showCardNumber)}
                      </p>
                      <button
                        onClick={copyCardNumber}
                        className="p-1 rounded text-slate-400 hover:text-blue-300"
                        title="Copy Card Number"
                      >
                        {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Cardholder & Expiry & CVV */}
                  <div className="pt-6 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">CARDHOLDER</span>
                      <span className="font-bold text-white tracking-wider">{card.cardHolder}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">EXPIRES</span>
                      <span className="font-bold text-blue-300">{card.expiryDate}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">CVV</span>
                      <span className="font-bold text-white tracking-wider">
                        {showCardNumber ? card.cvv : '•••'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-sans font-black text-sm italic tracking-widest text-blue-400">
                        VISA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Issuer Validation Badge */}
                <div className="p-3.5 rounded-xl bg-[#0F223D] border border-[#1E3A5F] text-xs text-slate-300 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">{card.issuerName}</p>
                    <p className="text-[11px] text-slate-400">Authorized Visa Debit Network • EMVCo Certified</p>
                  </div>
                </div>
              </div>

              {/* Card Controls & Actions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Primary Card Action Buttons */}
                <div className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] space-y-5 shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Card Operations & Controls
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Action 1: Card Activation */}
                    {card.status === 'inactive' ? (
                      <button
                        onClick={() => setActivationModalOpen(true)}
                        disabled={cardActionLoading}
                        className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                      >
                        <KeyRound className="w-5 h-5" />
                        <span>Activate Card</span>
                        <span className="text-[10px] font-normal text-blue-100">Issuer Verification</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#071324] border border-emerald-800/40 text-center flex flex-col items-center justify-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">Card Activated</span>
                        <span className="text-[10px] text-slate-400">Ready for payments</span>
                      </div>
                    )}

                    {/* Action 2: Freeze / Unfreeze */}
                    <button
                      onClick={handleToggleFreeze}
                      disabled={cardActionLoading || card.status === 'blocked'}
                      className={`p-4 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                        card.status === 'frozen'
                          ? 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500'
                          : 'bg-[#071324] text-slate-200 border-[#1E3A5F] hover:bg-[#162C4E]'
                      } disabled:opacity-50`}
                    >
                      <Snowflake className="w-5 h-5 text-blue-300" />
                      <span>{card.status === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Temporary Lock</span>
                    </button>

                    {/* Action 3: Block or Replacement */}
                    {card.status === 'blocked' ? (
                      <button
                        onClick={handleRequestReplacement}
                        disabled={cardActionLoading}
                        className="p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Order New Card</span>
                        <span className="text-[10px] text-emerald-100 font-normal">Digital Replacement</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setBlockConfirmOpen(true)}
                        disabled={cardActionLoading}
                        className="p-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all"
                      >
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        <span>Block Card</span>
                        <span className="text-[10px] text-rose-400/80 font-normal">Lost or Compromised</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Spending Security Limits & Channels */}
                <div className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Channel Permissions & Safety Controls
                  </h3>

                  <div className="space-y-3">
                    {/* Online Payments */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                      <div>
                        <p className="text-xs font-bold text-white">Online E-Commerce Payments</p>
                        <p className="text-[11px] text-slate-400">Permit online merchant shopping and subscriptions</p>
                      </div>
                      <button
                        onClick={() => handleToggleLimitSetting('onlinePayments')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          card.limits?.onlinePayments ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          card.limits?.onlinePayments ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* International Usage */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                      <div>
                        <p className="text-xs font-bold text-white">Cross-Border & International Usage</p>
                        <p className="text-[11px] text-slate-400">Transactions processed in foreign currencies</p>
                      </div>
                      <button
                        onClick={() => handleToggleLimitSetting('internationalUsage')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          card.limits?.internationalUsage ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          card.limits?.internationalUsage ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* ATM Withdrawals */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                      <div>
                        <p className="text-xs font-bold text-white">ATM Cash Withdrawals</p>
                        <p className="text-[11px] text-slate-400">Cash access at global Visa/Plus network machines</p>
                      </div>
                      <button
                        onClick={() => handleToggleLimitSetting('atmWithdrawals')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          card.limits?.atmWithdrawals ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          card.limits?.atmWithdrawals ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Contactless */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                      <div>
                        <p className="text-xs font-bold text-white">Contactless (NFC) Tap & Pay</p>
                        <p className="text-[11px] text-slate-400">Quick in-store contactless pos terminals</p>
                      </div>
                      <button
                        onClick={() => handleToggleLimitSetting('contactless')}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          card.limits?.contactless ? 'bg-blue-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          card.limits?.contactless ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Card Activation Modal */}
            {activationModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="w-full max-w-md bg-[#0A192F] border border-blue-500/40 rounded-3xl p-6 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <h3 className="font-bold text-white text-base">Activate Barclay Platinum Card</h3>
                    <button onClick={() => setActivationModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>

                  <p className="text-xs text-slate-300">
                    To activate your card ending in <strong className="text-white">{card.cardNumber.slice(-4)}</strong>, please enter the authorization verification code sent with your card details or your secure 4-digit PIN.
                  </p>

                  <form onSubmit={handleActivateCard} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        4-Digit Activation Authorization Code / PIN
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={activationCodeInput}
                        onChange={(e) => setActivationCodeInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 4-digit code"
                        className="w-full bg-[#0F223D] border border-[#1E3A5F] rounded-xl px-3 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-blue-400"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Hint: Use your account PIN ({currentUser.pin || '1234'}).</p>
                    </div>

                    <button
                      type="submit"
                      disabled={cardActionLoading || activationCodeInput.length !== 4}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-50"
                    >
                      {cardActionLoading ? 'Connecting to Card Issuer...' : 'Confirm Card Activation'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Block Card Confirmation Modal */}
            {blockConfirmOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="w-full max-w-md bg-[#0A192F] border border-rose-600/40 rounded-3xl p-6 text-white space-y-4">
                  <div className="flex items-center gap-3 text-rose-400">
                    <ShieldAlert className="w-6 h-6" />
                    <h3 className="font-bold text-white text-base">Permanently Block This Card?</h3>
                  </div>

                  <p className="text-xs text-slate-300">
                    Blocking your card ending in <strong className="text-white">{card.cardNumber.slice(-4)}</strong> will immediately terminate all authorization on this card number. You can generate a free replacement card immediately afterward.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for blocking:</label>
                    <select
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full bg-[#0F223D] border border-[#1E3A5F] rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Lost or Stolen Card">Lost or Stolen Card</option>
                      <option value="Suspected Fraud / Compromised">Suspected Fraud / Compromised</option>
                      <option value="Card Damaged / Unusable">Card Damaged / Unusable</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBlockConfirmOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-[#0F223D] border border-[#1E3A5F] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBlockCard}
                      disabled={cardActionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                    >
                      {cardActionLoading ? 'Blocking...' : 'Confirm Block'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Row: Account Balance & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Virtual Barclay Debit Card Widget */}
              <div className="lg:col-span-5">
                <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F223D] via-[#0A192F] to-[#071324] border border-blue-500/40 shadow-2xl relative overflow-hidden space-y-6">
                  <div className="flex items-center justify-between">
                    <BrandLogo variant="horizontal" size="sm" />
                    <button
                      onClick={onOpenTierUpgrade}
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900 transition-colors"
                    >
                      {currentUser.tier} • Upgrade
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="w-11 h-8 rounded bg-gradient-to-tr from-amber-300 to-amber-500 shadow-inner border border-amber-200/50 flex items-center justify-center">
                      <div className="w-7 h-5 border border-amber-800/40 rounded-sm"></div>
                    </div>
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>

                  {/* 10-Digit Account Number */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        10-DIGIT ACCOUNT NUMBER
                      </span>
                      <button
                        onClick={copyAccountNumber}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {copiedAcc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white mt-0.5">
                      {currentUser.accountNumber.slice(0, 4)} {currentUser.accountNumber.slice(4, 8)} {currentUser.accountNumber.slice(8, 10)}
                    </p>
                  </div>

                  {/* Available Account Balance */}
                  <div className="pt-2 border-t border-[#1E293B]">
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

                    <div className="font-mono text-3xl font-black text-blue-300 mt-0.5 flex items-baseline gap-2">
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
                    <button
                      onClick={() => setActiveTab('cards')}
                      className="text-[10px] font-sans text-blue-400 hover:underline font-bold"
                    >
                      Manage Card →
                    </button>
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
                    className="p-4 rounded-2xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] hover:border-blue-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Deposit Funds</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Crypto & Wire</p>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    onClick={onOpenTransfer}
                    className="p-4 rounded-2xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] hover:border-blue-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Send className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Bank Transfer</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">30+ Countries SWIFT</p>
                  </button>

                  {/* Withdrawal */}
                  <button
                    onClick={onOpenWithdrawal}
                    className="p-4 rounded-2xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] hover:border-blue-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Withdrawal</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Direct Payout</p>
                  </button>

                  {/* Card Management Shortcut */}
                  <button
                    onClick={() => setActiveTab('cards')}
                    className="p-4 rounded-2xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] hover:border-blue-400 text-left transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300">Card Hub</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{card.status.toUpperCase()}</p>
                  </button>
                </div>

                {/* Account Limits & Tiers Card (Requirement 7) */}
                <div className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-extrabold uppercase tracking-wide text-white">
                        {currentUser.tier} Custody Capacity
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      Auto-Synchronized Real-Time
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Daily Limit */}
                    <div className="p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Daily Transaction Limit:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ${currentTierDailyLimit.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1E293B] overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[20%]"></div>
                      </div>
                    </div>

                    {/* Monthly Limit */}
                    <div className="p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Monthly Transaction Limit:</span>
                        <span className="font-mono font-bold text-blue-300">
                          ${currentTierMonthlyLimit.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1E293B] overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full w-[12%]"></div>
                      </div>
                    </div>
                  </div>

                  {currentUser.tier === 'Tier 1' && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#071324] border border-[#1E3A5F] text-xs">
                      <span className="text-slate-300">
                        Unlock $50,000 daily & $5,000,000 monthly limit with Tier 2 facial verification.
                      </span>
                      <button
                        onClick={onOpenTierUpgrade}
                        className="text-blue-400 font-bold hover:underline shrink-0 ml-3"
                      >
                        Upgrade Now →
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Quick 5 Recent Transactions */}
            <div className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Account Activity</h3>
                  <p className="text-xs text-slate-400">Live transaction ledger synced with central clearing</p>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-blue-400 hover:underline font-bold"
                >
                  View All Transactions ({transactions.length}) →
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No transaction history recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-[#1E293B]">
                  {transactions.slice(0, 5).map(tx => (
                    <div 
                      key={tx.id}
                      onClick={() => onOpenReceipt(tx)}
                      className="py-3.5 flex items-center justify-between hover:bg-[#162C4E] px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                          tx.type === 'deposit' || tx.type === 'crypto_payment'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'crypto_payment' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{tx.description || tx.reference}</p>
                          <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString()} • Ref: {tx.reference}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-mono text-sm font-bold ${
                          tx.type === 'deposit' || tx.type === 'crypto_payment' ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'crypto_payment' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`text-[10px] font-bold uppercase ${
                          tx.status === 'Completed' ? 'text-emerald-400' : tx.status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: TRANSACTION HISTORY (Requirement 2 & 9) ================= */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Full Transaction Ledger</h3>
                <p className="text-xs text-slate-400">Search by reference, counterparty, description, or status</p>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'credit', 'debit', 'pending', 'completed', 'reversed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      txFilter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#071324] text-slate-400 hover:text-white border border-[#14233D]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions by reference number, recipient, bank name..."
                className="w-full bg-[#071324] border border-[#1E3A5F] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Transaction Table / List */}
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No transactions match your current query or filters.
              </div>
            ) : (
              <div className="divide-y divide-[#1E293B]">
                {filteredTransactions.map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => onOpenReceipt(tx)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#162C4E] px-3 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        tx.type === 'deposit' || tx.type === 'crypto_payment'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'crypto_payment' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{tx.description || tx.reference}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()} • Ref: <span className="font-mono text-blue-400">{tx.reference}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <p className={`font-mono text-sm font-bold ${
                        tx.type === 'deposit' || tx.type === 'crypto_payment' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'crypto_payment' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : tx.status === 'Pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {tx.status}
                        </span>
                        <span className="text-[10px] text-blue-400 font-semibold hover:underline">Receipt →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: SETTINGS & SWIFT DETAILS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Account Security & Credentials</h3>
                  <p className="text-xs text-slate-400">Manage your secure credentials, PIN, and identity tier</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Legal Name</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.fullName} {currentUser.surname}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Email</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">{currentUser.email}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">10-Digit Account Number</span>
                  <span className="font-mono font-black text-blue-400 text-sm mt-0.5 block">{currentUser.accountNumber}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#071324] border border-[#14233D]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Account Tier</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-amber-400 text-sm">{currentUser.tier}</span>
                    <button
                      onClick={onOpenTierUpgrade}
                      className="text-[11px] text-blue-400 font-semibold hover:underline"
                    >
                      Upgrade Tier
                    </button>
                  </div>
                </div>
              </div>

              {/* SWIFT Code & 4-Digit Verification Code (Requirement 4) */}
              <div className="p-4 rounded-xl bg-[#071324] border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">SWIFT 4-Digit Authorization Code</span>
                    <p className="text-[11px] text-slate-400">Required when dispatching international SWIFT wire transfers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-amber-300 bg-[#0F223D] px-3 py-1 rounded-lg border border-[#1E3A5F]">
                      {currentUser.swiftVerificationCode || '8492'}
                    </span>
                    <button
                      onClick={copySwiftCode}
                      className="p-1.5 rounded-lg bg-[#0F223D] hover:bg-[#162C4E] text-blue-300 text-xs transition-colors"
                      title="Copy SWIFT Code"
                    >
                      {copiedSwift ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Update PIN */}
              <form onSubmit={handleUpdatePin} className="p-4 rounded-xl bg-[#071324] border border-[#14233D] space-y-3">
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
                    className="flex-1 bg-[#0F223D] border border-[#1E3A5F] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                  >
                    Save PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
