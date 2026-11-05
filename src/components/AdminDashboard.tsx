import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Users, 
  TrendingUp, 
  Save, 
  Send, 
  FileText, 
  UserCheck, 
  Coins, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  Layers,
  ArrowRight,
  BellRing
} from 'lucide-react';
import { 
  UserProfile, 
  BankTransaction, 
  PaymentSubmission, 
  VerificationRequest, 
  FinancialSettings, 
  AccountTier 
} from '../types';
import { store } from '../lib/store';

interface AdminDashboardProps {
  users: UserProfile[];
  transactions: BankTransaction[];
  paymentSubmissions: PaymentSubmission[];
  verificationRequests: VerificationRequest[];
  settings: FinancialSettings;
  onViewReceipt: (tx: BankTransaction) => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  transactions,
  paymentSubmissions,
  verificationRequests,
  settings,
  onViewReceipt,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'transactions' | 'payments' | 'verifications' | 'settings' | 'broadcast'>('search');
  
  // Search state by 10-digit account number (Requirement 3)
  const [searchAccountInput, setSearchAccountInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(users[0] || null);
  
  // Deposit funds form state (Requirement 3)
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSenderName, setDepositSenderName] = useState('Barclays Clearing London');
  const [depositNote, setDepositNote] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');
  const [depositErrorMsg, setDepositErrorMsg] = useState('');

  // Financial Settings form state (Requirement 10)
  const [formData, setFormData] = useState<FinancialSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Direct Notification form state
  const [notifTargetAcc, setNotifTargetAcc] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');

  // Expand image preview in modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync formData with settings when settings change
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // Keep selected user in sync with updated list
  useEffect(() => {
    if (selectedUser) {
      const updated = users.find(u => u.uid === selectedUser.uid);
      if (updated) setSelectedUser(updated);
    }
  }, [users]);

  // Instant customer search by 10-digit account number (Requirement 3)
  const handleSearchCustomer = (input: string) => {
    setSearchAccountInput(input);
    const clean = input.trim();
    if (!clean) return;

    const found = users.find(u => 
      u.accountNumber === clean || 
      u.email.toLowerCase().includes(clean.toLowerCase()) ||
      `${u.fullName} ${u.surname}`.toLowerCase().includes(clean.toLowerCase())
    );

    if (found) {
      setSelectedUser(found);
    }
  };

  // Deposit funds handler (Requirement 3: "When the administrator makes a deposit and clicks Done, the exact deposited amount should appear in the user’s account balance, and the transaction should appear in their transaction history.")
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositErrorMsg('');
    setDepositSuccessMsg('');

    if (!selectedUser) {
      setDepositErrorMsg('Please search and select a customer account first.');
      return;
    }

    const num = parseFloat(depositAmount);
    if (!num || num <= 0) {
      setDepositErrorMsg('Please enter a valid deposit amount greater than zero.');
      return;
    }

    if (!depositSenderName.trim()) {
      setDepositErrorMsg('Please enter the remitter / sender name.');
      return;
    }

    setDepositLoading(true);
    try {
      const result = await store.adminDeposit({
        accountNumber: selectedUser.accountNumber,
        amount: num,
        senderName: depositSenderName,
        note: depositNote
      });

      if (result.error || !result.success) {
        setDepositErrorMsg(result.error || 'Failed to deposit funds.');
      } else {
        setDepositSuccessMsg(`Successfully credited $${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} into Account ${selectedUser.accountNumber} (${selectedUser.fullName} ${selectedUser.surname})!`);
        setDepositAmount('');
        setDepositNote('');
      }
    } catch (err: any) {
      setDepositErrorMsg(err.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  // Transaction approval & reversal handlers
  const handleApproveTransaction = async (txId: string) => {
    await store.adminApproveTransaction(txId);
  };

  const handleCancelTransaction = async (txId: string) => {
    await store.adminCancelTransaction(txId, 'Administrative review cancellation. Funds returned.');
  };

  // Payment proof approval & rejection handlers
  const handleApprovePayment = async (subId: string) => {
    await store.adminApprovePaymentSubmission(subId);
  };

  const handleCancelPayment = async (subId: string) => {
    await store.adminCancelPaymentSubmission(subId);
  };

  // Tier KYC verification approval & rejection
  const handleApproveTier = async (reqId: string) => {
    await store.adminApproveTierUpgrade(reqId);
  };

  const handleRejectTier = async (reqId: string) => {
    await store.adminRejectTierUpgrade(reqId, 'Biometric quality check did not pass minimum clarity.');
  };

  // Change Tier Directly
  const handleChangeUserTier = async (tier: AccountTier) => {
    if (!selectedUser) return;
    await store.adminSetUserTier(selectedUser.accountNumber, tier);
  };

  // Save Financial Settings (Requirement 10)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await store.updateFinancialSettings(formData);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Send Direct Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTargetAcc || !notifTitle || !notifMessage) return;

    const res = await store.sendDirectNotification({
      accountNumber: notifTargetAcc,
      title: notifTitle,
      message: notifMessage
    });

    if (res.success) {
      setNotifSuccess('Notification dispatched in real-time to user!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSuccess(''), 3000);
    }
  };

  // Summary counts
  const pendingTransactions = transactions.filter(t => t.status === 'Pending');
  const pendingPayments = paymentSubmissions.filter(p => p.status === 'Pending');
  const pendingVerifications = verificationRequests.filter(v => v.status === 'Pending Review');
  const totalCustodyAssets = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  return (
    <div className="min-h-screen bg-[#001020] text-white pb-20">
      
      {/* Admin Top Command Bar */}
      <div className="bg-[#000a14] border-b border-[#002447] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md border border-cyan-400/40 shrink-0">
              <img
                src="/logo.png"
                alt="Barclay Online Bank Logo"
                className="h-10 sm:h-12 w-auto object-contain select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-wide">CENTRAL CLEARING</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Canary Wharf Administrative Portal • Real-Time Database Synchronized</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#002f5c] border border-[#003d73] text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Switch to Customer Banking View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Registered Customers</span>
            <p className="text-2xl font-black text-white mt-1 font-mono">{users.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Custody Assets</span>
            <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              ${totalCustodyAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pending Transfers / Wires</span>
            <p className={`text-2xl font-black mt-1 font-mono ${pendingTransactions.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
              {pendingTransactions.length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pending Payment Proofs</span>
            <p className={`text-2xl font-black mt-1 font-mono ${pendingPayments.length > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}>
              {pendingPayments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex border-b border-[#002b52] space-x-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Customer Search & Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'transactions'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Transfers & Withdrawals ({pendingTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'payments'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Crypto Proofs & Receipts ({pendingPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'verifications'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tier KYC Verifications ({pendingVerifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Financial Settings (Wallets & Limits)</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'broadcast'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Direct Notifications</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TAB 1: Search for Customers & Deposit Funds (Requirement 3) */}
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Search Box & Customer List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Customer Lookup (10-Digit Account Number)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search customer profiles using their unique 10-digit account number, name, or email
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={searchAccountInput}
                    onChange={(e) => handleSearchCustomer(e.target.value)}
                    placeholder="Enter 10-digit Account Number (e.g. 4829103847)..."
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Quick Selection List of Registered Users */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    All Registered Customer Accounts ({users.length}):
                  </span>
                  {users.map(u => (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setSearchAccountInput(u.accountNumber);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        selectedUser?.uid === u.uid
                          ? 'bg-[#00264d] border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-[#001326] border-[#002447] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{u.fullName} {u.surname}</span>
                        <span className="font-mono text-xs font-black text-cyan-300">{u.accountNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{u.country} • {u.tier}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Customer Dossier & Deposit Action Form (Requirement 3) */}
            <div className="lg:col-span-7 space-y-4">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* Customer Information Card (Requirement 3: "View customer names, registered email addresses, account balances, tiers") */}
                  <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
                    <div className="flex items-center justify-between border-b border-[#002447] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-400 flex items-center justify-center font-bold text-lg">
                          {selectedUser.fullName.charAt(0)}{selectedUser.surname.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">{selectedUser.fullName} {selectedUser.surname}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                              {selectedUser.tier}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{selectedUser.email}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">CURRENT ACCOUNT BALANCE</span>
                        <span className="font-mono text-2xl font-black text-emerald-400">
                          ${selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">10-Digit Account #</span>
                        <span className="font-mono font-bold text-cyan-300">{selectedUser.accountNumber}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Country</span>
                        <span className="font-semibold text-white">{selectedUser.country}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">SWIFT Auth Code</span>
                        <span className="font-mono font-bold text-amber-300">{selectedUser.swiftVerificationCode || '8492'}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">PIN Code</span>
                        <span className="font-mono font-bold text-white">{selectedUser.pin}</span>
                      </div>
                    </div>

                    {/* Change Tier Directly */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#002447] text-xs">
                      <span className="text-slate-400">Manual Tier Adjustment:</span>
                      <div className="flex gap-2">
                        {(['Tier 1', 'Tier 2', 'Tier 3'] as const).map(tier => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => handleChangeUserTier(tier)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                              selectedUser.tier === tier
                                ? 'bg-cyan-500 text-slate-950 shadow'
                                : 'bg-[#002040] text-slate-300 hover:text-white'
                            }`}
                          >
                            Set {tier}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Deposit Funds Form (Requirement 3: "Deposit funds into customer accounts. Enter the sender’s name when making a deposit. When the administrator makes a deposit and clicks Done, the exact deposited amount should appear in the user’s account balance, and the transaction should appear in their transaction history.") */}
                  <form onSubmit={handleDepositSubmit} className="p-6 rounded-2xl bg-[#00172e] border border-cyan-500/30 shadow-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-extrabold text-white">Deposit Funds into Customer Account</h4>
                        <p className="text-xs text-slate-400">
                          Target Account: <strong className="text-cyan-400">{selectedUser.accountNumber}</strong> ({selectedUser.fullName} {selectedUser.surname})
                        </p>
                      </div>
                    </div>

                    {depositSuccessMsg && (
                      <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{depositSuccessMsg}</span>
                      </div>
                    )}

                    {depositErrorMsg && (
                      <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{depositErrorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Exact Deposit Amount ($ USD) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="e.g. 50000.00"
                          className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                          required
                        />
                      </div>

                      {/* Requirement 3: Enter the sender's name when making a deposit */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Sender / Remitter Legal Name *
                        </label>
                        <input
                          type="text"
                          value={depositSenderName}
                          onChange={(e) => setDepositSenderName(e.target.value)}
                          placeholder="e.g. Barclays London Clearing or J.P. Morgan Chase"
                          className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Deposit Reference / Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={depositNote}
                        onChange={(e) => setDepositNote(e.target.value)}
                        placeholder="e.g. Sovereign Liquidity Allocation or Commercial Wire Settlement"
                        className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={depositLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{depositLoading ? 'Crediting Account...' : 'Done (Credit Customer Account)'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-[#00172e] rounded-2xl border border-[#002b52]">
                  <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm">Enter a 10-digit account number to view customer information and deposit funds.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Approve or Reject Transactions & Withdrawals (Requirement 3 & 9) */}
        {activeTab === 'transactions' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#002447] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Pending Transactions, Transfers & Withdrawals ({pendingTransactions.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Review and approve or reverse transfers. In accordance with bank requirements, transfer amounts are only debited upon approval.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Remitter Account</th>
                    <th className="py-3 px-3">Recipient & Bank</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#002447]">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-[#002244] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-white capitalize">{tx.type.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                        {tx.reference}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {tx.accountNumber}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-white">{tx.recipientName || tx.senderName}</p>
                        <p className="text-[10px] text-slate-400">{tx.recipientBank || tx.recipientCountry || 'Domestic'}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-white">
                        ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
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
                      <td className="py-3 px-3 text-right space-x-2">
                        {tx.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveTransaction(tx.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleCancelTransaction(tx.id)}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors shadow"
                            >
                              Reject / Reverse
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onViewReceipt(tx)}
                            className="px-2.5 py-1 rounded bg-[#002447] hover:bg-cyan-600 text-cyan-300 hover:text-white font-semibold text-[11px] transition-colors"
                          >
                            View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Review Submitted Payment Receipts (Requirement 6) */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#002447] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Payment Submissions & Crypto Receipts ("I Have Made the Payment")
                </h3>
                <p className="text-xs text-slate-400">
                  Review submitted proof images, transaction hashes, and execute Approve or Cancel with instant automated notification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentSubmissions.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                  No payment submissions currently in the queue.
                </div>
              ) : (
                paymentSubmissions.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl bg-[#001326] border border-[#00284d] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{sub.userFullName}</span>
                        <span className="font-mono text-xs text-cyan-400 block">Acc: {sub.accountNumber}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : sub.status === 'Pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#001020] p-2.5 rounded-lg border border-[#002447]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Method:</span>
                        <span className="font-bold text-amber-300">{sub.method.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Amount Claimed:</span>
                        <span className="font-mono font-black text-emerald-400">
                          ${sub.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Tx Hash / Reference:</span>
                      <p className="font-mono text-[11px] text-cyan-300 break-all bg-[#001020] p-1.5 rounded">
                        {sub.txHashOrRef}
                      </p>
                    </div>

                    {sub.proofImageUrl && (
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Attached Receipt Proof:</span>
                        <img
                          src={sub.proofImageUrl}
                          alt="Proof"
                          onClick={() => setPreviewImage(sub.proofImageUrl || null)}
                          className="h-28 w-full object-cover rounded-lg border border-[#002b52] cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}

                    {sub.notes && (
                      <p className="text-[11px] text-slate-300 italic">"{sub.notes}"</p>
                    )}

                    {sub.status === 'Pending' && (
                      <div className="pt-2 flex gap-2 border-t border-[#002447]">
                        <button
                          onClick={() => handleApprovePayment(sub.id)}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
                        >
                          Approve Payment & Credit Account
                        </button>
                        <button
                          onClick={() => handleCancelPayment(sub.id)}
                          className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
                        >
                          Cancel / Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Manage Customer Account Tiers (Requirement 7) */}
        {activeTab === 'verifications' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#002447] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Tier Verification Requests (Facial & Government ID)
                </h3>
                <p className="text-xs text-slate-400">
                  Tier 2 requires facial biometric review ($500 fee). Tier 3 requires government ID review ($5,000 fee).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verificationRequests.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                  No tier verification requests pending review.
                </div>
              ) : (
                verificationRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-xl bg-[#001326] border border-[#00284d] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{req.fullName}</span>
                        <span className="font-mono text-xs text-cyan-400 block">Acc: {req.accountNumber}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : req.status === 'Pending Review'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#001020] p-2.5 rounded-lg border border-[#002447]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Target Tier:</span>
                        <span className="font-bold text-cyan-300">{req.targetTier}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Document Type:</span>
                        <span className="font-medium text-white">{req.documentType}</span>
                      </div>
                    </div>

                    {req.mediaUrl && (
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Submitted Biometric / ID Image:</span>
                        <img
                          src={req.mediaUrl}
                          alt="Verification Document"
                          onClick={() => setPreviewImage(req.mediaUrl)}
                          className="h-32 w-full object-cover rounded-lg border border-[#002b52] cursor-pointer hover:opacity-90"
                        />
                      </div>
                    )}

                    {req.status === 'Pending Review' && (
                      <div className="pt-2 flex gap-2 border-t border-[#002447]">
                        <button
                          onClick={() => handleApproveTier(req.id)}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
                        >
                          Approve & Upgrade to {req.targetTier}
                        </button>
                        <button
                          onClick={() => handleRejectTier(req.id)}
                          className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Admin Financial Settings (Requirement 10) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#002447] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Admin Financial Settings (Cryptocurrency, Fees & Limits)
                </h3>
                <p className="text-xs text-slate-400">
                  Requirement 10: Whenever you change an amount or wallet address and click Save, the updated information automatically appears in the relevant sections of the website.
                </p>
              </div>

              {settingsSaved && (
                <div className="px-3 py-1 rounded bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800 flex items-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved & Live Synchronized!</span>
                </div>
              )}
            </div>

            {/* Cryptocurrency Addresses (Requirement 5 & 10) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Cryptocurrency Deposit Wallet Addresses
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bitcoin (BTC) Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={formData.btcAddress}
                    onChange={(e) => setFormData({ ...formData, btcAddress: e.target.value })}
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: bc1qrc3ldwp9jrrtmlcua4czjnnkz49m6uahetuqgx</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    USDT ERC-20 Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={formData.usdtAddress}
                    onChange={(e) => setFormData({ ...formData, usdtAddress: e.target.value })}
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Ethereum ERC-20 contract target</p>
                </div>
              </div>
            </div>

            {/* Fees Configuration */}
            <div className="space-y-4 pt-4 border-t border-[#002447]">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Upgrade Fees & Verification Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tier 2 Upgrade Fee ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tier2UpgradeFee}
                    onChange={(e) => setFormData({ ...formData, tier2UpgradeFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Initially configured at $500</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tier 3 Upgrade Fee ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tier3UpgradeFee}
                    onChange={(e) => setFormData({ ...formData, tier3UpgradeFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Initially configured at $5,000</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SWIFT 4-Digit Verification Fee ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.verificationFee}
                    onChange={(e) => setFormData({ ...formData, verificationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Daily and Monthly Limits Configuration */}
            <div className="space-y-4 pt-4 border-t border-[#002447]">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Tier Daily & Monthly Transaction Limits ($ USD)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tier 2 Limits */}
                <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00284d] space-y-3">
                  <span className="text-xs font-bold text-white block">Tier 2 Limits</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Daily Limit ($)</label>
                      <input
                        type="number"
                        value={formData.tier2DailyLimit}
                        onChange={(e) => setFormData({ ...formData, tier2DailyLimit: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Monthly Limit ($)</label>
                      <input
                        type="number"
                        value={formData.tier2MonthlyLimit}
                        onChange={(e) => setFormData({ ...formData, tier2MonthlyLimit: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Tier 3 Limits */}
                <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00284d] space-y-3">
                  <span className="text-xs font-bold text-white block">Tier 3 Limits</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Daily Limit ($)</label>
                      <input
                        type="number"
                        value={formData.tier3DailyLimit}
                        onChange={(e) => setFormData({ ...formData, tier3DailyLimit: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Monthly Limit ($)</label>
                      <input
                        type="number"
                        value={formData.tier3MonthlyLimit}
                        onChange={(e) => setFormData({ ...formData, tier3MonthlyLimit: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Financial Settings (Auto-Broadcast to All Users)</span>
            </button>
          </form>
        )}

        {/* TAB 6: Direct Notifications Dispatcher */}
        {activeTab === 'broadcast' && (
          <form onSubmit={handleSendNotification} className="max-w-xl mx-auto p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Send Individual Notification</h3>
              <p className="text-xs text-slate-400">
                Dispatch an immediate alert to any customer using their 10-digit account number
              </p>
            </div>

            {notifSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target 10-Digit Account Number *
              </label>
              <input
                type="text"
                value={notifTargetAcc}
                onChange={(e) => setNotifTargetAcc(e.target.value)}
                placeholder="e.g. 4829103847"
                className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notification Subject / Title *
              </label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Wire Settlement Confirmation or Security Update"
                className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Message Body *
              </label>
              <textarea
                rows={4}
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Enter formal notice text..."
                className="w-full bg-[#001020] border border-[#003866] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Notification</span>
            </button>
          </form>
        )}

      </div>

      {/* Expanded Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img src={previewImage} alt="Expanded preview" className="rounded-xl shadow-2xl object-contain max-h-[85vh]" />
            <p className="text-center text-xs text-slate-400 mt-2">Click anywhere to close preview</p>
          </div>
        </div>
      )}
    </div>
  );
};
