import React, { useState, useEffect, useMemo } from 'react';
import {
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
  UserCheck,
  Coins,
  Clock,
  Check,
  BellRing,
  MessageSquare,
  Mail,
  CheckCheck,
  RefreshCw,
  Gift,
  Building2,
  UserPlus,
  Plus,
  Power,
  Ban
} from 'lucide-react';
import {
  UserProfile,
  BankTransaction,
  DepositRecord,
  WithdrawalRecord,
  PaymentSubmission,
  VerificationRequest,
  InvestmentPlan,
  UserInvestment,
  ReferralRecord,
  AdminRoleRecord,
  BankingPaymentInfo,
  AdminTier,
  FinancialSettings,
  AccountTier,
  AdminAuditLog,
  SupportConversation
} from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

interface AdminDashboardProps {
  users: UserProfile[];
  transactions: BankTransaction[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  paymentSubmissions: PaymentSubmission[];
  verificationRequests: VerificationRequest[];
  investmentPlans: InvestmentPlan[];
  investments: UserInvestment[];
  referrals: ReferralRecord[];
  admins: AdminRoleRecord[];
  bankingInfos: BankingPaymentInfo[];
  adminTier: AdminTier | null;
  settings: FinancialSettings;
  onViewReceipt: (tx: BankTransaction) => void;
  onExitAdmin: () => void;
}

type AdminTab =
  | 'search'
  | 'payments'
  | 'transactions'
  | 'investments'
  | 'referrals'
  | 'verifications'
  | 'chats'
  | 'settings'
  | 'team'
  | 'broadcast'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  transactions,
  deposits,
  withdrawals,
  paymentSubmissions,
  verificationRequests,
  investmentPlans,
  investments,
  referrals,
  admins,
  bankingInfos,
  adminTier,
  settings,
  onViewReceipt,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('search');
  const currentAdmin = store.getCurrentUser();
  const isTier1 = adminTier === 'tier1';

  // Global action banner feedback
  const [actionBanner, setActionBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showBanner = (type: 'success' | 'error', message: string) => {
    setActionBanner({ type, message });
    setTimeout(() => setActionBanner(null), 5000);
  };

  // Search state
  const [searchAccountInput, setSearchAccountInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(users[0] || null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(store.getAuditLogs());
  const [auditFilter, setAuditFilter] = useState('');
  const [suspensionConfirm, setSuspensionConfirm] = useState(false);
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  // Queue filters & reason notes
  const [depositStatusFilter, setDepositStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Cancelled'>('All');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Cancelled'>('All');
  const [investmentStatusFilter, setInvestmentStatusFilter] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [decisionReasons, setDecisionReasons] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Support Chats state
  const [conversations, setConversations] = useState<SupportConversation[]>(store.getConversations());
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplySending, setAdminReplySending] = useState(false);

  // Direct deposit funds form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSenderName, setDepositSenderName] = useState('Aegis Clearing London');
  const [depositNote, setDepositNote] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');
  const [depositErrorMsg, setDepositErrorMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Investment Plan creation form (Tier 1 Only)
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanMin, setNewPlanMin] = useState('500');
  const [newPlanMax, setNewPlanMax] = useState('50000');
  const [newPlanRoi, setNewPlanRoi] = useState('12');
  const [newPlanDays, setNewPlanDays] = useState('30');
  const [newPlanRisk, setNewPlanRisk] = useState<'Conservative' | 'Balanced' | 'Growth'>('Balanced');
  const [planSaving, setPlanSaving] = useState(false);

  // Tier 2 Admin Appointment form (Tier 1 Only)
  const [tier2TargetInput, setTier2TargetInput] = useState('');
  const [tier2Reason, setTier2Reason] = useState('');
  const [teamSaving, setTeamSaving] = useState(false);

  // Financial Settings form state
  const [formData, setFormData] = useState<FinancialSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Direct Notification form state
  const [notifTargetAcc, setNotifTargetAcc] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');

  // Image preview lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (selectedUser) {
      const updated = users.find((u) => u.uid === selectedUser.uid);
      if (updated) setSelectedUser(updated);
    } else if (users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [users]);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAuditLogs(store.getAuditLogs());
      setConversations(store.getConversations());
    });
    return unsub;
  }, []);

  // Merged & deduplicated Deposit + Payment Submission queue
  const mergedDeposits = useMemo(() => {
    const map = new Map<string, DepositRecord | PaymentSubmission>();
    for (const sub of paymentSubmissions) {
      map.set(sub.id, sub);
    }
    for (const dep of deposits) {
      map.set(dep.id, dep);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [deposits, paymentSubmissions]);

  const filteredDeposits = useMemo(() => {
    if (depositStatusFilter === 'All') return mergedDeposits;
    return mergedDeposits.filter((d) => d.status === depositStatusFilter);
  }, [mergedDeposits, depositStatusFilter]);

  const filteredWithdrawals = useMemo(() => {
    if (withdrawalStatusFilter === 'All') return withdrawals;
    return withdrawals.filter((w) => w.status === withdrawalStatusFilter);
  }, [withdrawals, withdrawalStatusFilter]);

  const filteredInvestments = useMemo(() => {
    if (investmentStatusFilter === 'All') return investments;
    return investments.filter((i) => i.status === investmentStatusFilter);
  }, [investments, investmentStatusFilter]);

  // Search users by Account Number, Username, Email, or Full Name
  const filteredUsers = useMemo(() => {
    const clean = searchAccountInput.trim().toLowerCase();
    if (!clean) return users;
    return users.filter(
      (u) =>
        u.accountNumber.includes(clean) ||
        u.email.toLowerCase().includes(clean) ||
        (u.username || '').toLowerCase().includes(clean) ||
        `${u.fullName} ${u.surname}`.toLowerCase().includes(clean) ||
        u.country.toLowerCase().includes(clean)
    );
  }, [users, searchAccountInput]);

  const selectedBankingInfo = useMemo(() => {
    if (!selectedUser) return null;
    return bankingInfos.find((b) => b.uid === selectedUser.uid) || null;
  }, [bankingInfos, selectedUser]);

  const selectedUserInvestments = useMemo(() => {
    if (!selectedUser) return [];
    return investments.filter((i) => i.userId === selectedUser.uid);
  }, [investments, selectedUser]);

  const selectedUserDeposits = useMemo(() => {
    if (!selectedUser) return [];
    return mergedDeposits.filter((d) => d.userId === selectedUser.uid);
  }, [mergedDeposits, selectedUser]);

  const selectedUserWithdrawals = useMemo(() => {
    if (!selectedUser) return [];
    return withdrawals.filter((w) => w.userId === selectedUser.uid);
  }, [withdrawals, selectedUser]);

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const res = await store.syncFromFirestoreNow();
      showBanner('success', `Synchronized ${res.count} accounts from Firestore.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchCustomer = (input: string) => {
    setSearchAccountInput(input);
    setSuspensionConfirm(false);
    const clean = input.trim().toLowerCase();
    if (!clean) return;
    const found = users.find(
      (u) =>
        u.accountNumber === clean ||
        u.email.toLowerCase() === clean ||
        (u.username || '').toLowerCase() === clean ||
        u.accountNumber.includes(clean) ||
        u.email.toLowerCase().includes(clean) ||
        `${u.fullName} ${u.surname}`.toLowerCase().includes(clean)
    );
    if (found) {
      setSelectedUser(found);
    }
  };

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
        note: depositNote,
      });

      if (result.error || !result.success) {
        setDepositErrorMsg(result.error || 'Failed to deposit funds.');
      } else {
        setDepositSuccessMsg(
          `Successfully credited $${num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} into Account ${selectedUser.accountNumber} (${selectedUser.fullName} ${selectedUser.surname}).`
        );
        setDepositAmount('');
        setDepositNote('');
      }
    } catch (err: any) {
      setDepositErrorMsg(err.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleApproveDeposit = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await store.adminApproveDeposit(id, decisionReasons[id]);
      if (res.success) {
        showBanner('success', `Deposit #${id} approved and credited atomically.`);
      } else {
        showBanner('error', res.error || 'Could not approve deposit.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelDeposit = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await store.adminCancelDeposit(id, decisionReasons[id]);
      if (res.success) {
        showBanner('success', `Deposit #${id} marked as Cancelled without crediting balance.`);
      } else {
        showBanner('error', res.error || 'Could not cancel deposit.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await store.adminApproveWithdrawal(id, decisionReasons[id]);
      if (res.success) {
        showBanner('success', `Withdrawal #${id} authorized and marked Approved.`);
      } else {
        showBanner('error', res.error || 'Could not approve withdrawal.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelWithdrawal = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await store.adminCancelWithdrawal(id, decisionReasons[id]);
      if (res.success) {
        showBanner('success', `Withdrawal #${id} cancelled and exact reserved amount refunded to customer balance.`);
      } else {
        showBanner('error', res.error || 'Could not cancel withdrawal.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    setProcessingId(txId);
    try {
      const res = await store.adminApproveTransaction(txId);
      if (res.success) {
        showBanner('success', `Transaction ${txId} approved.`);
      } else {
        showBanner('error', res.error || 'Approval failed.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelTransaction = async (txId: string) => {
    setProcessingId(txId);
    try {
      const res = await store.adminCancelTransaction(txId, 'Administrative review cancellation. Funds returned.');
      if (res.success) {
        showBanner('success', `Transaction ${txId} reversed and funds restored.`);
      } else {
        showBanner('error', res.error || 'Reversal failed.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveTier = async (reqId: string) => {
    const res = await store.adminApproveTierUpgrade(reqId);
    if (res.success) showBanner('success', 'Customer tier verification approved.');
    else showBanner('error', res.error || 'Approval failed.');
  };

  const handleRejectTier = async (reqId: string) => {
    const res = await store.adminRejectTierUpgrade(reqId, 'Biometric quality check did not pass minimum clarity.');
    if (res.success) showBanner('success', 'Customer tier verification rejected.');
    else showBanner('error', res.error || 'Rejection failed.');
  };

  const handleChangeUserTier = async (tier: AccountTier) => {
    if (!selectedUser) return;
    const res = await store.adminSetUserTier(selectedUser.accountNumber, tier);
    if (res.success) showBanner('success', `Account ${selectedUser.accountNumber} updated to ${tier}.`);
    else showBanner('error', res.error || 'Tier update failed.');
  };

  const handleToggleSuspension = async () => {
    if (!selectedUser) return;
    const isSuspended = selectedUser.status === 'suspended';
    setSuspensionLoading(true);
    try {
      const res = await store.adminToggleUserSuspension(
        selectedUser.accountNumber,
        isSuspended ? 'Administrative security clearance restored' : 'Administrative compliance review'
      );
      if (res.success && res.user) {
        setSelectedUser({ ...res.user });
        setSuspensionConfirm(false);
        showBanner(
          'success',
          `Account ${selectedUser.accountNumber} is now ${res.user.status.toUpperCase()}.`
        );
      } else {
        showBanner('error', res.error || 'Failed to update account status.');
      }
    } finally {
      setSuspensionLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTier1) return;
    setPlanSaving(true);
    try {
      const res = await store.createInvestmentPlan({
        name: newPlanName.trim(),
        description: newPlanDesc.trim(),
        minAmount: parseFloat(newPlanMin) || 500,
        maxAmount: parseFloat(newPlanMax) || 50000,
        roiPercent: parseFloat(newPlanRoi) || 10,
        durationDays: parseInt(newPlanDays, 10) || 30,
        riskLevel: newPlanRisk,
        active: true,
      });
      if (res.success) {
        showBanner('success', `Investment plan "${newPlanName}" created.`);
        setNewPlanName('');
        setNewPlanDesc('');
      } else {
        showBanner('error', res.error || 'Failed to create investment plan.');
      }
    } finally {
      setPlanSaving(false);
    }
  };

  const handleTogglePlanActive = async (plan: InvestmentPlan) => {
    if (!isTier1) return;
    const res = await store.updateInvestmentPlan(plan.id, { active: !plan.active });
    if (res.success) {
      showBanner('success', `Plan "${plan.name}" is now ${!plan.active ? 'Active' : 'Paused'}.`);
    } else {
      showBanner('error', res.error || 'Failed to update investment plan.');
    }
  };

  const handleSettleInvestment = async (invId: string, action: 'Complete' | 'Cancel') => {
    setProcessingId(invId);
    try {
      const res = await store.adminSettleInvestment(invId, action, decisionReasons[invId]);
      if (res.success) {
        showBanner(
          'success',
          action === 'Complete'
            ? `Investment #${invId} settled with full ROI payout.`
            : `Investment #${invId} cancelled and principal refunded.`
        );
      } else {
        showBanner('error', res.error || 'Settlement failed.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreditReferral = async (referralId: string) => {
    setProcessingId(referralId);
    try {
      const res = await store.adminCreditReferral(referralId);
      if (res.success) {
        showBanner('success', 'Referral bonus credited to referrer balance.');
      } else {
        showBanner('error', res.error || 'Failed to credit referral.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateTier2Admin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTier1 || !tier2TargetInput.trim()) return;
    setTeamSaving(true);
    try {
      const res = await store.createTier2Admin({
        targetAccountOrEmail: tier2TargetInput.trim(),
        reason: tier2Reason.trim() || 'Operations Administrator Appointment',
      });
      if (res.success) {
        showBanner('success', `Appointed Tier 2 Operations Administrator for ${tier2TargetInput}.`);
        setTier2TargetInput('');
        setTier2Reason('');
      } else {
        showBanner('error', res.error || 'Could not appoint Tier 2 Administrator.');
      }
    } finally {
      setTeamSaving(false);
    }
  };

  const handleToggleAdminStatus = async (admin: AdminRoleRecord) => {
    if (!isTier1) return;
    const nextStatus = admin.status === 'active' ? 'revoked' : 'active';
    const res = await store.updateAdminStatus(
      admin.uid,
      nextStatus,
      nextStatus === 'revoked' ? 'Tier 2 access revoked by Tier 1 Super Admin' : 'Tier 2 access restored by Tier 1 Super Admin'
    );
    if (res.success) {
      showBanner('success', `${admin.email} access set to ${nextStatus.toUpperCase()}.`);
    } else {
      showBanner('error', res.error || 'Failed to update admin status.');
    }
  };

  const unreadChatCount = store.getUnreadChatCountForAdmin();

  const handleSelectChatUser = (userId: string) => {
    setSelectedChatUserId(userId);
    store.markConversationReadByAdmin(userId);
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserId || !adminReplyText.trim()) return;
    setAdminReplySending(true);
    try {
      store.sendChatMessage({
        userId: selectedChatUserId,
        senderRole: 'admin',
        message: adminReplyText.trim(),
      });
      setAdminReplyText('');
    } finally {
      setAdminReplySending(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTier1) {
      showBanner('error', 'Only Tier 1 Super Administrators can save financial & banking settings.');
      return;
    }
    const res = await store.updateFinancialSettings(formData);
    if (res.success) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } else {
      showBanner('error', res.error || 'Failed to save financial settings.');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTargetAcc || !notifTitle || !notifMessage) return;
    const res = await store.sendDirectNotification({
      accountNumber: notifTargetAcc,
      title: notifTitle,
      message: notifMessage,
    });
    if (res.success) {
      setNotifSuccess('Notification dispatched in real-time to customer!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSuccess(''), 3000);
    } else {
      showBanner('error', res.error || 'Failed to dispatch notification.');
    }
  };

  const pendingTransactions = transactions.filter((t) => t.status === 'Pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');
  const pendingDepositsCount = mergedDeposits.filter((d) => d.status === 'Pending').length;
  const pendingVerifications = verificationRequests.filter((v) => v.status === 'Pending Review');
  const activeInvestmentsCount = investments.filter((i) => i.status === 'Active').length;
  const pendingReferralsCount = referrals.filter((r) => r.status === 'Pending').length;
  const totalCustodyAssets = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  return (
    <div className="min-h-screen bg-[#001020] text-white pb-20">
      {/* Admin Top Command Bar */}
      <div className="bg-[#000a14] border-b border-[#002447] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo variant="horizontal" size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-white tracking-wide">CENTRAL CLEARING</h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    isTier1
                      ? 'bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  }`}
                >
                  {isTier1 ? 'TIER 1 SUPER ADMIN' : 'TIER 2 OPS ADMIN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Administrative Control System • Real-Time Firestore & Storage Synchronized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00172e] border border-[#002b52] text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Operator:</span>
              <span className="font-mono text-cyan-300 font-bold">
                {currentAdmin?.email || 'Authorized Admin'}
              </span>
            </div>

            <button
              type="button"
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#002f5c] border border-[#003d73] text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Exit Management Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      {actionBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              actionBanner.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/80 border-rose-700 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{actionBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionBanner(null)}
              className="text-slate-400 hover:text-white text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Registered Customers
            </span>
            <p className="text-2xl font-black text-white mt-1 font-mono">{users.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Total Custody Assets
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              ${totalCustodyAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Pending Deposits & Proofs
            </span>
            <p
              className={`text-2xl font-black mt-1 font-mono ${
                pendingDepositsCount > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {pendingDepositsCount}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#00172e] border border-[#002b52] shadow">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Pending Withdrawals / Wires
            </span>
            <p
              className={`text-2xl font-black mt-1 font-mono ${
                pendingWithdrawals.length + pendingTransactions.length > 0
                  ? 'text-amber-400 animate-pulse'
                  : 'text-slate-400'
              }`}
            >
              {pendingWithdrawals.length + pendingTransactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex border-b border-[#002b52] space-x-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Customers & Direct Credit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'payments'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Deposits & Proofs ({pendingDepositsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'transactions'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Withdrawals & Transfers ({pendingWithdrawals.length + pendingTransactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('investments')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'investments'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Investments ({activeInvestmentsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'referrals'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Referrals ({pendingReferralsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verifications')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'verifications'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>KYC Tiers ({pendingVerifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('chats');
              if (conversations.length > 0 && !selectedChatUserId) {
                handleSelectChatUser(conversations[0].userId);
              }
            }}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'chats'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Support ({unreadChatCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {isTier1 ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
            <span>Banking & Financial Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'team'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {isTier1 ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
            <span>Admin Team ({admins.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'broadcast'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'text-cyan-400 border-cyan-400 bg-[#00172e]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: Customer Search, Dossier & Direct Deposit */}
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Customer Lookup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search by 10-digit account number, @username, email, or name
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={searchAccountInput}
                    onChange={(e) => handleSearchCustomer(e.target.value)}
                    placeholder="Account #, @username, email, or name..."
                    className="w-full bg-[#001020] border border-[#003866] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {searchAccountInput.trim()
                        ? `Search Results (${filteredUsers.length} of ${users.length}):`
                        : `All Registered Customers (${users.length}):`}
                    </span>
                    <button
                      type="button"
                      onClick={handleForceSync}
                      disabled={isSyncing}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
                    </button>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#001020] border border-dashed border-[#002447] text-center text-xs text-slate-400">
                      No customer accounts found matching "{searchAccountInput}".
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.uid}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setSuspensionConfirm(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          selectedUser?.uid === u.uid
                            ? 'bg-[#00264d] border-cyan-400 shadow-md shadow-cyan-500/10'
                            : 'bg-[#001326] border-[#002447] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0 overflow-hidden">
                              {u.photoUrl ? (
                                <img src={u.photoUrl} alt={u.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  {u.fullName.charAt(0)}
                                  {u.surname.charAt(0)}
                                </>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white truncate block">
                                {u.fullName} {u.surname}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">
                                @{u.username || u.email.split('@')[0]} • {u.email}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-black text-cyan-300 shrink-0">
                            {u.accountNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1 border-t border-white/[0.05]">
                          <span>
                            {u.country} • {u.tier}{' '}
                            {u.status === 'suspended' && (
                              <span className="text-rose-400 font-bold">• SUSPENDED</span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              {selectedUser ? (
                <div className="space-y-5">
                  {/* Customer Profile Dossier */}
                  <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#002447] pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-400 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                          {selectedUser.photoUrl ? (
                            <img
                              src={selectedUser.photoUrl}
                              alt={selectedUser.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {selectedUser.fullName.charAt(0)}
                              {selectedUser.surname.charAt(0)}
                            </>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-white">
                              {selectedUser.fullName} {selectedUser.surname}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                              {selectedUser.tier}
                            </span>
                            {selectedUser.role === 'admin' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                                {selectedUser.adminTier || 'admin'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            @{selectedUser.username || selectedUser.email.split('@')[0]} • {selectedUser.email}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Referral Code: <span className="text-cyan-300">{selectedUser.referralCode || `AEG-${selectedUser.accountNumber.slice(-6)}`}</span>
                            {selectedUser.referredBy ? ` • Referred by: ${selectedUser.referredBy}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          AVAILABLE BALANCE
                        </span>
                        <span className="font-mono text-2xl font-black text-emerald-400">
                          ${selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                          {selectedUser.currency || 'USD'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Account #
                        </span>
                        <span className="font-mono font-bold text-cyan-300">
                          {selectedUser.accountNumber}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Country
                        </span>
                        <span className="font-semibold text-white">{selectedUser.country}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          SWIFT Auth Code
                        </span>
                        <span className="font-mono font-bold text-amber-300">
                          {selectedUser.swiftVerificationCode || 'Unassigned'}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#001020] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Registered
                        </span>
                        <span className="font-mono font-semibold text-white">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Customer Activity Counters */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#001326] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block">Deposits</span>
                        <span className="font-mono font-bold text-white">
                          {selectedUserDeposits.length} records
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#001326] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block">Withdrawals</span>
                        <span className="font-mono font-bold text-white">
                          {selectedUserWithdrawals.length} records
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#001326] border border-[#002447]">
                        <span className="text-[10px] text-slate-400 block">Investments</span>
                        <span className="font-mono font-bold text-white">
                          {selectedUserInvestments.length} positions
                        </span>
                      </div>
                    </div>

                    {/* Saved Banking & Payment Profile */}
                    <div className="p-3.5 rounded-xl bg-[#001020] border border-[#00284d] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Saved Banking & Payout Profile
                        </span>
                        {selectedBankingInfo && (
                          <span className="text-[10px] text-slate-400">
                            Preferred: {selectedBankingInfo.preferredMethod.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {selectedBankingInfo ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-500">Bank: </span>
                            <span className="font-semibold text-white">{selectedBankingInfo.bankName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Account / IBAN: </span>
                            <span className="font-mono text-cyan-300">{selectedBankingInfo.bankAccountNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">SWIFT/BIC: </span>
                            <span className="font-mono text-white">{selectedBankingInfo.swiftBicCode}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Saved Tokenized Cards: </span>
                            <span className="font-mono text-white">
                              {(selectedBankingInfo.tokenizedCards || []).length}
                            </span>
                          </div>
                          {selectedBankingInfo.btcPayoutAddress && (
                            <div className="sm:col-span-2 truncate">
                              <span className="text-slate-500">BTC Payout: </span>
                              <span className="font-mono text-amber-300">{selectedBankingInfo.btcPayoutAddress}</span>
                            </div>
                          )}
                          {selectedBankingInfo.usdtPayoutAddress && (
                            <div className="sm:col-span-2 truncate">
                              <span className="text-slate-500">USDT Payout: </span>
                              <span className="font-mono text-emerald-300">{selectedBankingInfo.usdtPayoutAddress}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Customer has not saved external bank/crypto payout coordinates yet.
                        </p>
                      )}
                    </div>

                    {/* Manual Tier Adjustment */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#002447] text-xs">
                      <span className="text-slate-400">Manual Tier Adjustment:</span>
                      <div className="flex gap-2">
                        {(['Tier 1', 'Tier 2', 'Tier 3'] as const).map((tier) => (
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

                    {/* Account Security Status & Inline Confirmation */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#002447] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Account Access:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            selectedUser.status === 'suspended'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {selectedUser.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </div>

                      {!suspensionConfirm ? (
                        <button
                          type="button"
                          onClick={() => setSuspensionConfirm(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                            selectedUser.status === 'suspended'
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              : 'bg-rose-600 hover:bg-rose-500 text-white'
                          }`}
                        >
                          {selectedUser.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-amber-300 font-semibold">
                            Confirm {selectedUser.status === 'suspended' ? 'reactivation' : 'suspension'}?
                          </span>
                          <button
                            type="button"
                            onClick={handleToggleSuspension}
                            disabled={suspensionLoading}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                          >
                            {suspensionLoading ? 'Saving...' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSuspensionConfirm(false)}
                            className="px-2.5 py-1 rounded-lg bg-[#002040] text-slate-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Administrative Deposit Form */}
                  <form
                    onSubmit={handleDepositSubmit}
                    className="p-6 rounded-2xl bg-[#00172e] border border-cyan-500/30 shadow-xl space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-extrabold text-white">
                          Direct Custody Deposit into Customer Account
                        </h4>
                        <p className="text-xs text-slate-400">
                          Target Account:{' '}
                          <strong className="text-cyan-400">{selectedUser.accountNumber}</strong> (
                          {selectedUser.fullName} {selectedUser.surname})
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
                          className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 font-mono font-bold focus:outline-none focus:border-cyan-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Sender / Remitter Legal Name *
                        </label>
                        <input
                          type="text"
                          value={depositSenderName}
                          onChange={(e) => setDepositSenderName(e.target.value)}
                          placeholder="e.g. Aegis Clearing London"
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
                        placeholder="e.g. Commercial Wire Settlement"
                        className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={depositLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>
                        {depositLoading ? 'Crediting Account...' : 'Done (Credit Customer Account)'}
                      </span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-[#00172e] rounded-2xl border border-[#002b52]">
                  <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm">
                    Select a customer account from the left panel to inspect their profile or credit funds.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Deposits & Payment Proofs Queue (Approve once / Cancel cleanly) */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#002447] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Deposit Requests & Crypto/Wire Proofs ({mergedDeposits.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Every deposit submission is protected inside an atomic transaction. Approving credits balance once; Cancelling marks Cancelled with zero credit and preserves the record.
                </p>
              </div>
              <div className="flex gap-1.5">
                {(['All', 'Pending', 'Approved', 'Cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setDepositStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      depositStatusFilter === status
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#001020] text-slate-400 hover:text-white border border-[#00284d]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDeposits.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                  No deposit submissions matching this filter.
                </div>
              ) : (
                filteredDeposits.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-[#001326] border border-[#00284d] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{sub.userFullName}</span>
                        <span className="font-mono text-xs text-cyan-400 block">
                          Acc: {sub.accountNumber} • {new Date(sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : sub.status === 'Pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
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
                          ${Number(sub.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Attached Receipt Proof:
                        </span>
                        <img
                          src={sub.proofImageUrl}
                          alt="Proof"
                          onClick={() => setPreviewImage(sub.proofImageUrl || null)}
                          className="h-28 w-full object-cover rounded-lg border border-[#002b52] cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}

                    {sub.reason && (
                      <p className="text-[11px] text-slate-300 bg-[#001020] p-2 rounded">
                        <span className="text-slate-500">Admin Note: </span>
                        {sub.reason}
                      </p>
                    )}

                    {sub.status === 'Pending' && (
                      <div className="pt-2 space-y-2 border-t border-[#002447]">
                        <input
                          type="text"
                          value={decisionReasons[sub.id] || ''}
                          onChange={(e) =>
                            setDecisionReasons({ ...decisionReasons, [sub.id]: e.target.value })
                          }
                          placeholder="Optional approval/cancellation reason for audit trail..."
                          className="w-full bg-[#001020] border border-[#003366] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={processingId === sub.id}
                            onClick={() => handleApproveDeposit(sub.id)}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors disabled:opacity-50"
                          >
                            {processingId === sub.id ? 'Processing...' : 'Approve & Credit Once'}
                          </button>
                          <button
                            type="button"
                            disabled={processingId === sub.id}
                            onClick={() => handleCancelDeposit(sub.id)}
                            className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors disabled:opacity-50"
                          >
                            Cancel Deposit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Withdrawals & Transfers */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Dedicated Withdrawal Queue with Balance Reservation & Refund-on-Cancel */}
            <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#002447] pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Withdrawal Requests ({withdrawals.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Funds are reserved upon customer submission. Approving finalizes payout; Cancelling refunds the exact amount atomically and preserves the Cancelled record.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {(['All', 'Pending', 'Approved', 'Cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setWithdrawalStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        withdrawalStatusFilter === status
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-[#001020] text-slate-400 hover:text-white border border-[#00284d]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {filteredWithdrawals.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No withdrawal requests found for this filter.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWithdrawals.map((wd) => (
                    <div
                      key={wd.id}
                      className="p-4 rounded-xl bg-[#001326] border border-[#00284d] space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white">{wd.userFullName}</span>
                          <span className="font-mono text-[11px] text-cyan-400 block">
                            Acc: {wd.accountNumber} • {new Date(wd.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            wd.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : wd.status === 'Pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {wd.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#001020] p-2.5 rounded-lg border border-[#002447]">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Channel:</span>
                          <span className="font-bold text-white uppercase">{wd.method}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Amount:</span>
                          <span className="font-mono font-black text-amber-300">
                            ${wd.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-400 block">
                            Beneficiary / Destination ({wd.bankName}):
                          </span>
                          <span className="font-mono text-[11px] text-cyan-300 break-all">
                            {wd.beneficiaryName} — {wd.destination}
                          </span>
                        </div>
                      </div>

                      {wd.reason && (
                        <p className="text-[11px] text-slate-300 bg-[#001020] p-2 rounded">
                          <span className="text-slate-500">Resolution Note: </span>
                          {wd.reason}
                        </p>
                      )}

                      {wd.status === 'Pending' && (
                        <div className="space-y-2 pt-2 border-t border-[#002447]">
                          <input
                            type="text"
                            value={decisionReasons[wd.id] || ''}
                            onChange={(e) =>
                              setDecisionReasons({ ...decisionReasons, [wd.id]: e.target.value })
                            }
                            placeholder="Optional payout / cancellation reason..."
                            className="w-full bg-[#001020] border border-[#003366] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={processingId === wd.id}
                              onClick={() => handleApproveWithdrawal(wd.id)}
                              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              {processingId === wd.id ? 'Processing...' : 'Approve Payout'}
                            </button>
                            <button
                              type="button"
                              disabled={processingId === wd.id}
                              onClick={() => handleCancelWithdrawal(wd.id)}
                              className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                            >
                              Cancel & Refund Balance
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transfers & Full Financial Ledger */}
            <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#002447] pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Wire Transfers & Transaction Ledger ({transactions.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review and approve or reverse wire transfers and ledger entries.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Account #</th>
                      <th className="py-3 px-3">Counterparty & Bank</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#002447]">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#002244] transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-white capitalize">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                          {tx.reference}
                        </td>
                        <td className="py-3 px-3 font-mono">{tx.accountNumber}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-white">
                            {tx.recipientName || tx.senderName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {tx.recipientBank || tx.recipientCountry || 'Aegis Clearing'}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-sm text-white">
                          ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              tx.status === 'Completed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : tx.status === 'Pending'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          {tx.status === 'Pending' ? (
                            <>
                              <button
                                type="button"
                                disabled={processingId === tx.id}
                                onClick={() => handleApproveTransaction(tx.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={processingId === tx.id}
                                onClick={() => handleCancelTransaction(tx.id)}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors shadow"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onViewReceipt(tx)}
                              className="px-2.5 py-1 rounded bg-[#002447] hover:bg-cyan-600 text-cyan-300 hover:text-white font-semibold text-[11px] transition-colors"
                            >
                              Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Investments & Plans (Plan Editing Locked to Tier 1) */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            {/* Customer Active Investments */}
            <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#002447] pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Customer Investment Positions ({investments.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Settle mature positions to credit ROI payouts or cancel active allocations to refund principal.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {(['All', 'Active', 'Completed', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setInvestmentStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        investmentStatusFilter === st
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-[#001020] text-slate-400 border border-[#00284d]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInvestments.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No investment records match this filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3 text-right">Principal</th>
                        <th className="py-2.5 px-3 text-right">Maturity Payout</th>
                        <th className="py-2.5 px-3">Maturity Date</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#002447]">
                      {filteredInvestments.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#002040]/50">
                          <td className="py-3 px-3">
                            <p className="font-bold text-white">{inv.userName}</p>
                            <p className="font-mono text-[10px] text-cyan-300">{inv.accountNumber}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-white">{inv.planName}</span>
                            <span className="block text-[10px] text-emerald-400">+{inv.roiPercent}% ROI</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            ${inv.expectedReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                            {new Date(inv.maturityDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                inv.status === 'Completed'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : inv.status === 'Active'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            {inv.status === 'Active' ? (
                              <>
                                <button
                                  type="button"
                                  disabled={processingId === inv.id}
                                  onClick={() => handleSettleInvestment(inv.id, 'Complete')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                                >
                                  Complete & Pay ROI
                                </button>
                                <button
                                  type="button"
                                  disabled={processingId === inv.id}
                                  onClick={() => handleSettleInvestment(inv.id, 'Cancel')}
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                                >
                                  Refund Principal
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-500">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Investment Plans Directory + Creation Form (Tier 1 Only) */}
            <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#002447] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Investment Plans Catalog ({investmentPlans.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tier 1 Super Administrators create and toggle available investment programs.
                  </p>
                </div>
                {!isTier1 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Read-Only for Tier 2
                  </span>
                )}
              </div>

              {isTier1 && (
                <form
                  onSubmit={handleCreatePlan}
                  className="p-4 rounded-xl bg-[#001020] border border-[#003366] space-y-3"
                >
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Launch New Investment Plan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input
                      type="text"
                      required
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      placeholder="Plan Name (e.g. Sovereign Yield Bond)"
                      className="bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white"
                    />
                    <select
                      value={newPlanRisk}
                      onChange={(e) => setNewPlanRisk(e.target.value as any)}
                      className="bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Conservative">Conservative</option>
                      <option value="Balanced">Balanced</option>
                      <option value="Growth">Growth</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={newPlanDesc}
                      onChange={(e) => setNewPlanDesc(e.target.value)}
                      placeholder="Brief plan description..."
                      className="bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white"
                    />
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Min Allocation ($)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newPlanMin}
                        onChange={(e) => setNewPlanMin(e.target.value)}
                        className="w-full bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Max Allocation ($)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newPlanMax}
                        onChange={(e) => setNewPlanMax(e.target.value)}
                        className="w-full bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">ROI (%)</label>
                        <input
                          type="number"
                          required
                          step="0.1"
                          value={newPlanRoi}
                          onChange={(e) => setNewPlanRoi(e.target.value)}
                          className="w-full bg-[#00172e] border border-[#003866] rounded-lg px-2.5 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Days</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={newPlanDays}
                          onChange={(e) => setNewPlanDays(e.target.value)}
                          className="w-full bg-[#00172e] border border-[#003866] rounded-lg px-2.5 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={planSaving}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                  >
                    {planSaving ? 'Publishing...' : 'Publish Investment Plan'}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investmentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl bg-[#001326] border border-[#00284d] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{plan.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            plan.active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {plan.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {plan.roiPercent}% ROI • {plan.durationDays} days • ${plan.minAmount.toLocaleString()} – ${plan.maxAmount.toLocaleString()}
                      </p>
                    </div>
                    {isTier1 && (
                      <button
                        type="button"
                        onClick={() => handleTogglePlanActive(plan)}
                        className="px-3 py-1.5 rounded-lg bg-[#002040] hover:bg-[#002e5c] border border-[#003866] text-xs font-bold text-cyan-300 shrink-0"
                      >
                        {plan.active ? 'Pause' : 'Activate'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Referrals & Bonus Crediting */}
        {activeTab === 'referrals' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="border-b border-[#002447] pb-4">
              <h3 className="text-base font-extrabold text-white">
                Customer Referral Program Records ({referrals.length})
              </h3>
              <p className="text-xs text-slate-400">
                Inspect invitee registrations linked by referral code and disburse referral bonuses atomically.
              </p>
            </div>

            {referrals.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">
                No referral signups recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-3">Referrer</th>
                      <th className="py-3 px-3">Invited Customer</th>
                      <th className="py-3 px-3">Code</th>
                      <th className="py-3 px-3 text-right">Reward</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#002447]">
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-[#002040]/50">
                        <td className="py-3 px-3">
                          <span className="font-mono text-cyan-300 font-bold block">
                            {ref.referrerAccountNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">{ref.referrerEmail}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{ref.referredName}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {ref.referredAccountNumber} • {ref.referredEmail}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-300">
                          {ref.referralCode}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                          ${ref.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ref.status === 'Credited'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : ref.status === 'Pending'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {ref.status === 'Pending' ? (
                            <button
                              type="button"
                              disabled={processingId === ref.id}
                              onClick={() => handleCreditReferral(ref.id)}
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              {processingId === ref.id ? 'Crediting...' : 'Credit Bonus'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">Disbursed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: KYC Tier Verifications */}
        {activeTab === 'verifications' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="border-b border-[#002447] pb-4">
              <h3 className="text-base font-extrabold text-white">
                Tier Verification Requests (Facial & Government ID)
              </h3>
              <p className="text-xs text-slate-400">
                Review biometric facial captures and government ID uploads stored in Firebase Storage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verificationRequests.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                  No tier verification requests pending review.
                </div>
              ) : (
                verificationRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#001326] border border-[#00284d] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{req.fullName}</span>
                        <span className="font-mono text-xs text-cyan-400 block">
                          Acc: {req.accountNumber}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : req.status === 'Pending Review'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
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
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Submitted Biometric / ID Image:
                        </span>
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
                          type="button"
                          onClick={() => handleApproveTier(req.id)}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
                        >
                          Approve & Upgrade to {req.targetTier}
                        </button>
                        <button
                          type="button"
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

        {/* TAB 7: Live Support Chats */}
        {activeTab === 'chats' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#002447] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Live Support Desks & Real-Time Inquiries
                  </h3>
                  {unreadChatCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-xs">
                      {unreadChatCount} Unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-xs">
                      All Caught Up (0)
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => store.markAllConversationsReadByAdmin()}
                className="px-3.5 py-2 rounded-xl bg-[#002244] hover:bg-[#002f5c] border border-[#003d73] text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-4 h-4 text-cyan-400" />
                <span>Mark All Read (0)</span>
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No active customer chat threads yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[560px]">
                <div className="lg:col-span-4 rounded-xl bg-[#001326] border border-[#00284d] flex flex-col overflow-hidden">
                  <div className="p-3 bg-[#001020] border-b border-[#00284d] text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Conversations ({conversations.length})</span>
                    <span className="text-[10px] text-cyan-400 font-mono">24/7 Desk</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[#002244]">
                    {conversations.map((conv) => {
                      const isSelected = (selectedChatUserId || conversations[0]?.userId) === conv.userId;
                      return (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => handleSelectChatUser(conv.userId)}
                          className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                            isSelected
                              ? 'bg-[#002244] border-l-4 border-cyan-400'
                              : 'hover:bg-[#001933] border-l-4 border-transparent'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                            {conv.userName?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-white truncate">
                                {conv.userName || 'Client'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {conv.lastMessageTime
                                  ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {conv.lastMessage}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  const activeConv =
                    conversations.find(
                      (c) => c.userId === (selectedChatUserId || conversations[0]?.userId)
                    ) || conversations[0];
                  if (!activeConv) return null;
                  return (
                    <div className="lg:col-span-8 rounded-xl bg-[#001326] border border-[#00284d] flex flex-col overflow-hidden">
                      <div className="p-3.5 bg-[#001020] border-b border-[#00284d] flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-white text-sm">{activeConv.userName}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {activeConv.userEmail} • Acc: {activeConv.userAccountNumber || 'N/A'}
                          </p>
                        </div>
                        <a
                          href={`mailto:${activeConv.userEmail}`}
                          className="px-2.5 py-1.5 rounded-lg bg-[#002040] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-[#003866]"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#000d1a]">
                        {activeConv.messages.map((msg) => {
                          const isAdm = msg.senderRole === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdm ? 'items-end' : 'items-start'}`}
                            >
                              <div className="text-[10px] text-slate-400 mb-1">
                                {msg.senderName} •{' '}
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div
                                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs ${
                                  isAdm
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                                    : 'bg-[#001e3d] text-slate-100 border border-[#003366] rounded-bl-none'
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form
                        onSubmit={handleSendAdminReply}
                        className="p-3 bg-[#001020] border-t border-[#00284d] flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={`Reply to ${activeConv.userName}...`}
                          className="flex-1 bg-[#00172e] border border-[#003366] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="submit"
                          disabled={!adminReplyText.trim() || adminReplySending}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </button>
                      </form>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: Banking & Financial Settings (Tier 1 Super Admin Only) */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#002447] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Critical Banking & Financial Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Restricted to Tier 1 Super Administrators. Updates publish immediately to deposit & transfer interfaces.
                </p>
              </div>
              {settingsSaved && (
                <div className="px-3 py-1 rounded bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved & Synchronized</span>
                </div>
              )}
            </div>

            {!isTier1 && (
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-200 text-xs flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold">Tier 1 Super Administrator Clearance Required</p>
                  <p className="text-amber-300/80">
                    Tier 2 Operations Administrators can inspect configuration in read-only mode but cannot alter wallet addresses, clearing bank details, limits, or fees.
                  </p>
                </div>
              </div>
            )}

            <fieldset disabled={!isTier1} className="space-y-6 disabled:opacity-75">
              {/* Clearing Treasury Bank Coordinates */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Treasury Clearing Bank Coordinates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Clearing Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.clearingBankName || ''}
                      onChange={(e) => setFormData({ ...formData, clearingBankName: e.target.value })}
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      value={formData.clearingBankAccountName || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, clearingBankAccountName: e.target.value })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      IBAN / Clearing Account #
                    </label>
                    <input
                      type="text"
                      value={formData.clearingBankAccountNumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, clearingBankAccountNumber: e.target.value })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      value={formData.clearingSwiftCode || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, clearingSwiftCode: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Clearing Country
                    </label>
                    <input
                      type="text"
                      value={formData.clearingCountry || ''}
                      onChange={(e) => setFormData({ ...formData, clearingCountry: e.target.value })}
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Default Referral Bonus ($ USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.referralBonusAmount ?? 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referralBonusAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Crypto Deposit Addresses */}
              <div className="space-y-3 pt-4 border-t border-[#002447]">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Cryptocurrency Deposit Wallets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bitcoin (BTC) Address *
                    </label>
                    <input
                      type="text"
                      value={formData.btcAddress}
                      onChange={(e) => setFormData({ ...formData, btcAddress: e.target.value })}
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      USDT ERC-20 Address *
                    </label>
                    <input
                      type="text"
                      value={formData.usdtAddress}
                      onChange={(e) => setFormData({ ...formData, usdtAddress: e.target.value })}
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Upgrade Fees & Tier Limits */}
              <div className="space-y-4 pt-4 border-t border-[#002447]">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Upgrade Fees & Tier Limits ($ USD)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tier 2 Upgrade Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tier2UpgradeFee}
                      onChange={(e) =>
                        setFormData({ ...formData, tier2UpgradeFee: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tier 3 Upgrade Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tier3UpgradeFee}
                      onChange={(e) =>
                        setFormData({ ...formData, tier3UpgradeFee: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      SWIFT Code Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.verificationFee}
                      onChange={(e) =>
                        setFormData({ ...formData, verificationFee: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#001020] border border-[#003866] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00284d] space-y-3">
                    <span className="text-xs font-bold text-white block">Tier 2 Limits</span>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={formData.tier2DailyLimit}
                        onChange={(e) =>
                          setFormData({ ...formData, tier2DailyLimit: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="number"
                        value={formData.tier2MonthlyLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tier2MonthlyLimit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#001326] border border-[#00284d] space-y-3">
                    <span className="text-xs font-bold text-white block">Tier 3 Limits</span>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={formData.tier3DailyLimit}
                        onChange={(e) =>
                          setFormData({ ...formData, tier3DailyLimit: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="number"
                        value={formData.tier3MonthlyLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tier3MonthlyLimit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#001020] border border-[#003866] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isTier1 && (
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Financial & Banking Settings</span>
                </button>
              )}
            </fieldset>
          </form>
        )}

        {/* TAB 9: Two-Tier Admin Management (Tier 1 Only) */}
        {activeTab === 'team' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-6">
            <div className="border-b border-[#002447] pb-4">
              <h3 className="text-base font-extrabold text-white">
                Two-Tier Administrator Governance
              </h3>
              <p className="text-xs text-slate-400">
                Tier 1 Super Administrators manage system settings, investment plans, and appoint/revoke Tier 2 Operations Administrators.
              </p>
            </div>

            {!isTier1 ? (
              <div className="p-8 rounded-xl bg-rose-950/30 border border-rose-800/50 text-center space-y-2">
                <Lock className="w-8 h-8 text-rose-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  Access Denied: Tier 1 Super Administrator Clearance Required
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Only primary Tier 1 Super Administrators can create, modify, or revoke administrator roles.
                </p>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleCreateTier2Admin}
                  className="p-4 rounded-xl bg-[#001020] border border-[#003366] space-y-3"
                >
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" /> Appoint Tier 2 Operations Administrator
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input
                      type="text"
                      required
                      value={tier2TargetInput}
                      onChange={(e) => setTier2TargetInput(e.target.value)}
                      placeholder="Registered Email or 10-Digit Account #"
                      className="bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white font-mono"
                    />
                    <input
                      type="text"
                      value={tier2Reason}
                      onChange={(e) => setTier2Reason(e.target.value)}
                      placeholder="Appointment reason / department"
                      className="bg-[#00172e] border border-[#003866] rounded-lg px-3 py-2 text-white"
                    />
                    <button
                      type="submit"
                      disabled={teamSaving}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider"
                    >
                      {teamSaving ? 'Appointing...' : 'Grant Tier 2 Access'}
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px]">
                        <th className="py-3 px-3">Administrator</th>
                        <th className="py-3 px-3">Email & Username</th>
                        <th className="py-3 px-3">Clearance Tier</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Appointed By</th>
                        <th className="py-3 px-3 text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#002447]">
                      {admins.map((adm) => (
                        <tr key={adm.uid} className="hover:bg-[#002040]/50">
                          <td className="py-3 px-3 font-bold text-white">{adm.fullName}</td>
                          <td className="py-3 px-3 font-mono text-cyan-300">
                            {adm.email} <span className="text-slate-500">(@{adm.username})</span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                adm.tier === 'tier1'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              }`}
                            >
                              {adm.tier === 'tier1' ? 'Tier 1 Super Admin' : 'Tier 2 Ops Admin'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                adm.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {adm.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{adm.createdBy}</td>
                          <td className="py-3 px-3 text-right">
                            {adm.tier === 'tier1' ? (
                              <span className="text-[11px] text-slate-500 italic">Protected</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleAdminStatus(adm)}
                                className={`px-3 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                                  adm.status === 'active'
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {adm.status === 'active' ? (
                                  <>
                                    <Ban className="w-3 h-3" /> Revoke
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-3 h-3" /> Restore
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 10: Direct Notifications Dispatcher */}
        {activeTab === 'broadcast' && (
          <form
            onSubmit={handleSendNotification}
            className="max-w-xl mx-auto p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl space-y-4"
          >
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
                placeholder="e.g. Wire Settlement Confirmation"
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

        {/* TAB 11: Immutable Admin Activity Logs */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-2xl bg-[#00172e] border border-[#002b52] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#002447]">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Immutable Admin Activity Log
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Append-only ledger recording every deposit/withdrawal decision, investment settlement, referral payout, tier change, and admin permission update.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  placeholder="Filter logs..."
                  className="w-full bg-[#001020] border border-[#003866] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#00284d] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Administrator</th>
                    <th className="py-3 px-3">Account / Ref</th>
                    <th className="py-3 px-3">Status Transition</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Reason & Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#002447]">
                  {auditLogs
                    .filter((l) => {
                      if (!auditFilter) return true;
                      const q = auditFilter.toLowerCase();
                      return (
                        l.action.toLowerCase().includes(q) ||
                        l.details.toLowerCase().includes(q) ||
                        (l.targetAccount && l.targetAccount.includes(q)) ||
                        (l.reason && l.reason.toLowerCase().includes(q)) ||
                        l.adminEmail.toLowerCase().includes(q)
                      );
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-[#002040]/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono bg-blue-950 text-blue-300 border border-blue-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-cyan-400">
                          {log.adminEmail}
                          {log.adminUsername && (
                            <span className="text-slate-500 block">
                              @{log.adminUsername} ({log.adminTier || 'admin'})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {log.targetAccount || '—'}
                          {log.transactionId && (
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {log.transactionId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {log.previousStatus || log.newStatus
                            ? `${log.previousStatus || '—'} → ${log.newStatus || '—'}`
                            : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {log.amount !== undefined
                            ? `$${Number(log.amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                              })}`
                            : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-xs">
                          {log.reason && <p className="font-semibold text-white">{log.reason}</p>}
                          <p className="text-slate-400 text-[11px]">{log.details}</p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Expanded preview"
              className="rounded-xl shadow-2xl object-contain max-h-[85vh]"
            />
            <p className="text-center text-xs text-slate-400 mt-2">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
