import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowDownRight,
  Send, 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Headphones, 
  Settings, 
  Search, 
  Filter, 
  Lock, 
  TrendingUp, 
  Zap,
  DollarSign,
  AlertCircle,
  Snowflake,
  ShieldAlert,
  RefreshCw,
  Sliders,
  CheckCircle,
  KeyRound,
  Mail,
  Menu,
  Bell,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UserProfile, BankTransaction, FinancialSettings, CardDetails, CardLimits } from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';
import { CustomerNavDrawer } from './CustomerNavDrawer';
import { ProfileModal } from './ProfileModal';
import { AccountInfoModal } from './AccountInfoModal';
import { SecuritySettingsModal } from './SecuritySettingsModal';
import { HistoryModal } from './HistoryModal';
import { PaymentMethodsModal } from './PaymentMethodsModal';
import { AccountSettingsModal } from './AccountSettingsModal';

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
  onLogout?: () => void;
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
  onOpenSupport,
  onLogout = () => {}
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  // Modals state triggered via hamburger menu or shortcuts
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [accountInfoModalOpen, setAccountInfoModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyInitialFilter, setHistoryInitialFilter] = useState<'all' | 'withdrawals'>('all');
  const [paymentMethodsModalOpen, setPaymentMethodsModalOpen] = useState(false);
  const [accountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false);

  // Card Controls Modal state
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [cardActionLoading, setCardActionLoading] = useState(false);
  const [cardActionMsg, setCardActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Transaction Search & Filter in recent ledger
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isCardIssued = !!currentUser.card;

  const card: CardDetails = currentUser.card || {
    id: `card_demo_${currentUser.uid}`,
    cardNumber: `4552${currentUser.accountNumber.slice(0, 4)}00000000`.slice(0, 16),
    cardHolder: `${currentUser.fullName} ${currentUser.surname}`.toUpperCase(),
    expiryDate: '11/29',
    cvv: '849',
    cardType: 'Barclay Platinum Digital Debit',
    brand: 'barclay',
    status: 'inactive',
    activationCode: currentUser.pin || '1234',
    issuerName: 'Barclay Card Services & Global Clearing Gateway',
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

  const copyCardNumber = () => {
    navigator.clipboard.writeText(card.cardNumber);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  // On-demand Genuine Card Issuance Handler per Requirement 3
  const handleIssueCard = async () => {
    setCardActionMsg(null);
    setCardActionLoading(true);
    try {
      const res = await store.issueVirtualCard(currentUser.uid);
      if (!res.success) {
        setCardActionMsg({ type: 'error', text: res.error || 'Failed to issue card.' });
      } else {
        setCardActionMsg({
          type: 'success',
          text: 'Barclay Platinum Digital Debit Card successfully issued and linked to your primary account!'
        });
      }
    } catch (err: any) {
      setCardActionMsg({ type: 'error', text: err.message || 'Issuance failed.' });
    } finally {
      setCardActionLoading(false);
    }
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
        setCardActionMsg({ type: 'success', text: 'Card activated successfully with Barclay Issuer clearance!' });
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

  // Format 16-digit card number with masks
  const formatCardNumber = (num: string, reveal: boolean) => {
    const clean = num.replace(/\s/g, '');
    if (reveal) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
    }
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  // Format 10-digit account number with spaces (e.g. 1000 0000 01)
  const formatAccountNumber = (acc: string) => {
    if (acc.length === 10) {
      return `${acc.slice(0, 4)} ${acc.slice(4, 8)} ${acc.slice(8, 10)}`;
    }
    return acc;
  };

  // Filter recent transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = tx.reference.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchSender = (tx.senderName || '').toLowerCase().includes(q);
      const matchRecip = (tx.recipientName || '').toLowerCase().includes(q);
      if (!matchRef && !matchDesc && !matchSender && !matchRecip) return false;
    }

    if (txFilter === 'credit') return tx.type === 'deposit' || tx.type === 'crypto_payment';
    if (txFilter === 'debit') return tx.type === 'transfer' || tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A192F] text-white pb-36 font-sans">
      
      {/* Redesigned Sub-header Welcome Section (Unnecessary button collection removed per Requirement 2) */}
      <div className="bg-[#071324] border-b border-[#14233D] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Welcome User Info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-black text-base sm:text-lg shrink-0">
              {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-white truncate">
                  Welcome, {currentUser.fullName} {currentUser.surname}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                  Account Verified
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                Account: <strong className="font-mono text-cyan-300 font-bold">{currentUser.accountNumber}</strong> • Registered: <span className="text-slate-200">{currentUser.country}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Notifications & Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenNotifications}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] text-slate-300 hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Main Hamburger Menu Button opening 12-item Navigation Drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>

        </div>
      </div>

      {/* Account Suspended Alert Banner */}
      {currentUser.status === 'suspended' && (
        <div className="bg-rose-950/90 border-b border-rose-600 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <strong className="text-white block font-bold text-sm">Account Temporarily Restricted</strong>
                <span>Your account has been suspended. Kindly contact support for more assistance.</span>
              </div>
            </div>
            <button
              onClick={onOpenSupport}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors shadow"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Card Action Feedback Toast */}
        {cardActionMsg && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            cardActionMsg.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/70 border-rose-700 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {cardActionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{cardActionMsg.text}</span>
            </div>
            <button onClick={() => setCardActionMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* ================= PRIMARY DASHBOARD ROW: ACCOUNT CARD + SHORTCUTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Account Balance & Primary Card (Redesigned per Requirement 2) */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#0c203b] via-[#081629] to-[#040c17] border border-blue-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Ambient Card Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Top Row: Brand & Tier Badge */}
            <div className="flex items-center justify-between relative z-10 gap-2">
              <BrandLogo variant="horizontal" size="sm" />
              
              <button
                onClick={onOpenTierUpgrade}
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900/80 text-cyan-300 border border-blue-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all shadow shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{currentUser.tier} • UPGRADE</span>
              </button>
            </div>

            {/* 10-Digit Account Number */}
            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                10-DIGIT ACCOUNT NUMBER
              </span>
              <div className="flex items-center gap-3">
                <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white">
                  {formatAccountNumber(currentUser.accountNumber)}
                </p>
                <button
                  onClick={copyAccountNumber}
                  className="px-2.5 py-1 rounded-lg bg-[#00172e] hover:bg-[#002244] text-slate-300 hover:text-cyan-300 border border-[#002b52] text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Copy Account Number"
                >
                  {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Total Available Balance */}
            <div className="space-y-1.5 relative z-10 pt-2 border-t border-[#142642]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>TOTAL AVAILABLE BALANCE</span>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showBalance ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {showBalance 
                    ? `$${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : '••••••••••'}
                </span>
                <span className="text-xs font-bold text-cyan-400 font-mono">USD</span>
              </div>
            </div>

            {/* Cardholder & 3 Organized Shortcuts (Full-width 3-column Grid, never clipped on mobile) */}
            <div className="pt-4 border-t border-[#142642] space-y-4 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">CARDHOLDER</span>
                  <span className="font-mono text-xs font-bold text-slate-200">{currentUser.fullName} {currentUser.surname}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">SETTLEMENT CURRENCY</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">{currentUser.currency || 'USD'} (Primary)</span>
                </div>
              </div>

              {/* 3 Important Shortcuts (Requirement 2) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="w-full py-2.5 px-1.5 sm:px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span className="truncate">Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenTransfer}
                  className="w-full py-2.5 px-1.5 sm:px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-3 h-3 stroke-[2.5] shrink-0" />
                  <span className="truncate">Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenWithdrawal}
                  className="w-full py-2.5 px-1.5 sm:px-3 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] text-slate-200 hover:text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Withdraw</span>
                </button>
              </div>
            </div>

          </div>

          {/* Redesigned Premium Virtual Debit Card Capsule (Requirement 3) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#001428] border border-[#00284d] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">Barclay Platinum Card</h3>
              </div>
              
              {/* Neatly Positioned Card Status Badge (Requirement 3) */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                !isCardIssued
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                  : card.status === 'active'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : card.status === 'frozen'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {!isCardIssued ? 'DEMO (UNISSUED)' : card.status.toUpperCase()}
              </span>
            </div>

            {/* Premium Dark-Mode Realistic Virtual Card Graphic (Requirement 3) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1f38] via-[#071324] to-[#02070f] border border-slate-700/60 space-y-4 shadow-2xl relative overflow-hidden group">
              {/* Metallic Sheen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-white/5 pointer-events-none" />

              {/* Card Top Row: Chip, Contactless Symbol, and Card Network Branding */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  {/* Realistic Metallic Gold EMV Chip */}
                  <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-600 border border-amber-300/80 p-0.5 shadow-md">
                    <div className="w-full h-full border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5">
                      <div className="border-r border-b border-amber-800/40" />
                      <div className="border-b border-amber-800/40" />
                      <div className="border-r border-amber-800/40" />
                      <div />
                    </div>
                  </div>

                  {/* Contactless Wave Icon */}
                  <div className="text-slate-400">
                    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 8a10 10 0 0 1 14 0" />
                      <path d="M8 11a6 6 0 0 1 8 0" />
                      <path d="M11 14a2 2 0 0 1 2 0" />
                    </svg>
                  </div>
                </div>

                {/* Authorized Network Branding */}
                <div className="text-right">
                  <span className="font-mono text-[10px] font-black tracking-widest text-cyan-300 block">
                    BARCLAYCARD
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    PLATINUM DEBIT
                  </span>
                </div>
              </div>

              {/* Masked Card Number with Reveal Toggle (Requirement 3: •••• •••• •••• 1234) */}
              <div className="relative z-10 pt-1">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-base sm:text-lg font-black tracking-widest text-white text-shadow-sm">
                    {!isCardIssued
                      ? '•••• •••• •••• 0000'
                      : formatCardNumber(card.cardNumber, showCardNumber)}
                  </p>
                  {isCardIssued && (
                    <button
                      type="button"
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="text-slate-400 hover:text-white p-1 transition-colors"
                      title={showCardNumber ? 'Mask card number' : 'Reveal card number'}
                    >
                      {showCardNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Cardholder, Expiry Date & CVV */}
              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#142642] relative z-10">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-sans">Cardholder</span>
                  <span className="text-slate-200 font-bold truncate max-w-[130px] block">
                    {card.cardHolder}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-sans">Expires</span>
                  <span className="text-cyan-300 font-bold">
                    {!isCardIssued ? '11/29' : card.expiryDate}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-sans">CVV</span>
                  <span className="text-white font-bold">
                    {!isCardIssued ? '•••' : (showCardNumber ? card.cvv : '•••')}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions: Genuine Issuance or Active Controls */}
            {!isCardIssued ? (
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleIssueCard}
                  disabled={cardActionLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{cardActionLoading ? 'Processing EMV Issuance...' : 'Request Genuine Virtual Card'}</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Simulated preview shown above. Card will be officially activated upon request.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {card.status === 'inactive' ? (
                  <button
                    onClick={() => setActivationModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center transition-colors shadow"
                  >
                    Activate Card
                  </button>
                ) : (
                  <button
                    onClick={handleToggleFreeze}
                    disabled={cardActionLoading}
                    className="py-2.5 px-3 rounded-xl bg-[#001f3d] hover:bg-[#002f5c] border border-[#003866] text-slate-200 hover:text-white font-semibold text-center transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{card.status === 'frozen' ? 'Unfreeze' : 'Freeze Card'}</span>
                  </button>
                )}

                <button
                  onClick={() => setPaymentMethodsModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-[#00172e] hover:bg-[#002040] border border-[#00284d] text-cyan-300 font-bold text-center transition-colors flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>Gateways</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ================= RECENT TRANSACTIONS LEDGER ================= */}
        <div className="p-6 rounded-3xl bg-[#001428] border border-[#00284d] shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#002447] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">Recent Transactions</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time custody movements and wire status</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setHistoryInitialFilter('all');
                  setHistoryModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#002040] hover:bg-[#002f5c] text-cyan-300 hover:text-white text-xs font-bold border border-[#003866] transition-colors flex items-center gap-1.5"
              >
                <span>Full History</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, beneficiary, or remitter..."
                className="w-full bg-[#000d1a] border border-[#002f5e] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs">
              <button
                onClick={() => setTxFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  txFilter === 'all' ? 'bg-cyan-500 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTxFilter('credit')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  txFilter === 'credit' ? 'bg-emerald-400 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => setTxFilter('debit')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  txFilter === 'debit' ? 'bg-rose-400 text-slate-950' : 'bg-[#001f3d] text-slate-300 hover:text-white'
                }`}
              >
                Debits
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No transactions recorded matching your search.
              </div>
            ) : (
              filteredTransactions.slice(0, 6).map((tx) => {
                const isCredit = tx.type === 'deposit' || tx.type === 'crypto_payment';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-[#000f21] border border-[#002244] hover:border-[#003866] transition-all flex items-center justify-between gap-3"
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
                            {isCredit ? (tx.senderName || 'Deposit Settlement') : (tx.recipientName || 'Outbound Wire')}
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
                        onClick={() => onOpenReceipt(tx)}
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

          {filteredTransactions.length > 6 && (
            <div className="pt-2 text-center border-t border-[#002447]">
              <button
                onClick={() => {
                  setHistoryInitialFilter('all');
                  setHistoryModalOpen(true);
                }}
                className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View all {filteredTransactions.length} transactions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ================= ALL 12 HAMBURGER MENU MODALS ================= */}

      {/* 1. Customer Navigation Drawer (Opening all 12 requested working pages) */}
      <CustomerNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={currentUser}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAccountSettings={() => setAccountSettingsModalOpen(true)}
        onOpenTransactionHistory={() => {
          setHistoryInitialFilter('all');
          setHistoryModalOpen(true);
        }}
        onOpenAccountInfo={() => setAccountInfoModalOpen(true)}
        onOpenTier2Upgrade={onOpenTierUpgrade}
        onOpenTier3Upgrade={onOpenTierUpgrade}
        onOpenDeposit={onOpenDeposit}
        onOpenWithdrawalHistory={() => {
          setHistoryInitialFilter('withdrawals');
          setHistoryModalOpen(true);
        }}
        onOpenPaymentMethods={() => setPaymentMethodsModalOpen(true)}
        onOpenSupportCenter={onOpenSupport}
        onOpenSecuritySettings={() => setSecurityModalOpen(true)}
        onLogout={onLogout}
      />

      {/* 2. Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 3. Account Information Modal */}
      <AccountInfoModal
        isOpen={accountInfoModalOpen}
        onClose={() => setAccountInfoModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 4. Security Settings Modal */}
      <SecuritySettingsModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 5. Transaction / Withdrawal History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        transactions={transactions}
        initialFilter={historyInitialFilter}
        onViewReceipt={onOpenReceipt}
      />

      {/* 6. Payment Methods Modal */}
      <PaymentMethodsModal
        isOpen={paymentMethodsModalOpen}
        onClose={() => setPaymentMethodsModalOpen(false)}
        currentUser={currentUser}
        settings={settings}
        onOpenDeposit={onOpenDeposit}
      />

      {/* 7. Account Settings Modal */}
      <AccountSettingsModal
        isOpen={accountSettingsModalOpen}
        onClose={() => setAccountSettingsModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Card Activation Modal */}
      {activationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#001020] border border-blue-500/40 rounded-3xl p-6 text-white space-y-4">
            <h3 className="font-extrabold text-sm text-white">Activate Platinum Debit Card</h3>
            <p className="text-xs text-slate-300">
              Enter your 4-digit card activation code or account PIN to enable digital and contactless payments.
            </p>
            <form onSubmit={handleActivateCard} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                value={activationCodeInput}
                onChange={(e) => setActivationCodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit code"
                className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-center font-mono text-sm tracking-widest text-white"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivationModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#00172e] text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cardActionLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow"
                >
                  {cardActionLoading ? 'Activating...' : 'Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
