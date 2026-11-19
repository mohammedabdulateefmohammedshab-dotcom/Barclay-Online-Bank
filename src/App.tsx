import React, { useState, useEffect } from 'react';
import { store } from './lib/store';
import {
  UserProfile,
  BankTransaction,
  DepositRecord,
  WithdrawalRecord,
  PaymentSubmission,
  VerificationRequest,
  BankNotification,
  FinancialSettings,
  InvestmentPlan,
  UserInvestment,
  ReferralRecord,
  AdminRoleRecord,
  BankingPaymentInfo,
  AdminTier,
} from './types';
import { SupportedLanguage } from './lib/languages';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { DepositModal } from './components/DepositModal';
import { TransferModal } from './components/TransferModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { TierUpgradeModal } from './components/TierUpgradeModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SupportModal } from './components/SupportModal';
import { AboutModal } from './components/AboutModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { testConnection } from './lib/firebase';
import { BrandLogo } from './components/BrandLogo';

export default function App() {
  const [authReady, setAuthReady] = useState<boolean>(store.isAuthReady());
  const [users, setUsers] = useState<UserProfile[]>(store.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(store.getCurrentUser());
  const [adminTier, setAdminTier] = useState<AdminTier | null>(store.getCurrentAdminTier());
  const [admins, setAdmins] = useState<AdminRoleRecord[]>(store.getAdmins());
  const [transactions, setTransactions] = useState<BankTransaction[]>(store.getTransactions());
  const [deposits, setDeposits] = useState<DepositRecord[]>(store.getDeposits());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(store.getWithdrawals());
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>(
    store.getPaymentSubmissions()
  );
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(
    store.getVerificationRequests()
  );
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>(
    store.getInvestmentPlans()
  );
  const [investments, setInvestments] = useState<UserInvestment[]>(store.getInvestments());
  const [referrals, setReferrals] = useState<ReferralRecord[]>(store.getReferrals());
  const [bankingInfos, setBankingInfos] = useState<BankingPaymentInfo[]>(store.getAllBankingInfos());
  const [notifications, setNotifications] = useState<BankNotification[]>(store.getNotifications());
  const [settings, setSettings] = useState<FinancialSettings>(store.getSettings());

  // Navigation & View Mode: Persistent across page refreshes
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('aegis_active_tab') : null;
    if (saved === 'dashboard') return 'dashboard';
    const initUser = store.getCurrentUser();
    return initUser ? 'dashboard' : 'home';
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAdmin = sessionStorage.getItem('aegis_management_active') === 'true';
      return savedAdmin && store.isCurrentUserAdmin();
    }
    return false;
  });

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<BankTransaction | null>(null);

  // Subscribe to real-time store & Firebase Auth persistence updates
  useEffect(() => {
    testConnection();
    const syncState = () => {
      const ready = store.isAuthReady();
      const u = store.getCurrentUser();
      const tier = store.getCurrentAdminTier();
      const hasAdminAccess = store.isCurrentUserAdmin() || u?.role === 'admin';

      setAuthReady(ready);
      setUsers(store.getUsers());
      setCurrentUser(u);
      setAdminTier(tier);
      setAdmins(store.getAdmins());
      setTransactions(store.getTransactions());
      setDeposits(store.getDeposits());
      setWithdrawals(store.getWithdrawals());
      setPaymentSubmissions(store.getPaymentSubmissions());
      setVerificationRequests(store.getVerificationRequests());
      setInvestmentPlans(store.getInvestmentPlans());
      setInvestments(store.getInvestments());
      setReferrals(store.getReferrals());
      setBankingInfos(store.getAllBankingInfos());
      setNotifications(store.getNotifications());
      setSettings(store.getSettings());

      if (ready && !u) {
        setIsAdminMode(false);
        sessionStorage.removeItem('aegis_management_active');
      } else if (u && hasAdminAccess) {
        if (sessionStorage.getItem('aegis_management_active') === 'true' || !sessionStorage.getItem('aegis_active_tab')) {
          setIsAdminMode(true);
          sessionStorage.setItem('aegis_management_active', 'true');
        }
      } else if (u && !hasAdminAccess) {
        setIsAdminMode(false);
        sessionStorage.removeItem('aegis_management_active');
        if (sessionStorage.getItem('aegis_active_tab') !== 'home') {
          setActiveTab('dashboard');
          sessionStorage.setItem('aegis_active_tab', 'dashboard');
        }
      }
    };

    syncState();
    const unsubscribe = store.subscribe(syncState);
    return unsubscribe;
  }, []);

  // Route listener for direct admin route hash
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      if (
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#portal' ||
        window.location.search.includes('admin=true')
      ) {
        const u = store.getCurrentUser();
        if (u && (store.isCurrentUserAdmin() || u.role === 'admin')) {
          setIsAdminMode(true);
          sessionStorage.setItem('aegis_management_active', 'true');
        } else {
          setAuthInitialMode('login');
          setAuthModalOpen(true);
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  const userTransactions = currentUser
    ? transactions.filter((t) => t.userId === currentUser.uid)
    : [];
  const userDeposits = currentUser
    ? deposits.filter((d) => d.userId === currentUser.uid)
    : [];
  const userWithdrawals = currentUser
    ? withdrawals.filter((w) => w.userId === currentUser.uid)
    : [];
  const userInvestments = currentUser
    ? investments.filter((i) => i.userId === currentUser.uid)
    : [];
  const userReferrals = currentUser
    ? referrals.filter(
        (r) => r.referrerUid === currentUser.uid || r.referredUid === currentUser.uid
      )
    : [];
  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.uid)
    : [];

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('aegis_active_tab');
    sessionStorage.removeItem('aegis_management_active');
    await store.logoutUser();
    setCurrentUser(null);
    setAdminTier(null);
    setActiveTab('home');
    setIsAdminMode(false);
  };

  const handleTransferCreated = (tx: BankTransaction) => {
    setSelectedReceiptTx(tx);
  };

  const handleWithdrawalCreated = (tx: BankTransaction) => {
    setSelectedReceiptTx(tx);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-white flex flex-col items-center justify-center gap-4">
        <BrandLogo variant="emblem" size="md" theme="dark" />
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          Restoring Secure Session...
        </p>
      </div>
    );
  }

  const canAccessAdmin = Boolean(
    currentUser && (store.isCurrentUserAdmin() || currentUser.role === 'admin')
  );

  return (
    <div className="min-h-screen bg-[#0b0d13] font-sans antialiased text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Universal Header */}
      <Header
        currentUser={currentUser}
        isAdminMode={isAdminMode && canAccessAdmin}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onToggleAdminView={() => {
          if (!canAccessAdmin) return;
          setIsAdminMode(true);
          sessionStorage.setItem('aegis_management_active', 'true');
        }}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenSupport={() => setSupportModalOpen(true)}
        activeTab={isAdminMode && canAccessAdmin ? 'admin' : activeTab}
        onSelectTab={(tab) => {
          setIsAdminMode(false);
          sessionStorage.removeItem('aegis_management_active');
          setActiveTab(tab as 'home' | 'dashboard');
          sessionStorage.setItem('aegis_active_tab', tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdminMode && canAccessAdmin ? (
          <AdminDashboard
            users={users}
            transactions={transactions}
            deposits={deposits}
            withdrawals={withdrawals}
            paymentSubmissions={paymentSubmissions}
            verificationRequests={verificationRequests}
            investmentPlans={investmentPlans}
            investments={investments}
            referrals={referrals}
            admins={admins}
            bankingInfos={bankingInfos}
            adminTier={adminTier || currentUser?.adminTier || 'tier1'}
            settings={settings}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            onExitAdmin={() => {
              sessionStorage.removeItem('aegis_management_active');
              setIsAdminMode(false);
              setActiveTab(currentUser ? 'dashboard' : 'home');
              sessionStorage.setItem('aegis_active_tab', currentUser ? 'dashboard' : 'home');
            }}
          />
        ) : currentUser && activeTab === 'dashboard' ? (
          <UserDashboard
            currentUser={currentUser}
            transactions={userTransactions}
            deposits={userDeposits}
            withdrawals={userWithdrawals}
            investmentPlans={investmentPlans}
            investments={userInvestments}
            referrals={userReferrals}
            settings={settings}
            onOpenDeposit={() => setDepositModalOpen(true)}
            onOpenTransfer={() => setTransferModalOpen(true)}
            onOpenWithdrawal={() => setWithdrawalModalOpen(true)}
            onOpenTierUpgrade={() => setTierModalOpen(true)}
            onOpenReceipt={(tx) => setSelectedReceiptTx(tx)}
            onOpenNotifications={() => setNotificationsModalOpen(true)}
            onOpenSupport={() => setSupportModalOpen(true)}
            onLogout={handleLogout}
          />
        ) : (
          <HomePage
            onOpenAuth={handleOpenAuth}
            onOpenAbout={() => setAboutModalOpen(true)}
            onOpenSupport={() => setSupportModalOpen(true)}
            currentLang={currentLang}
          />
        )}
      </main>

      {/* Unified User & Admin Login / Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={(user) => {
          store.setCurrentUserId(user.uid);
          setCurrentUser(user);
          if (store.isCurrentUserAdmin() || user.role === 'admin') {
            setIsAdminMode(true);
            sessionStorage.setItem('aegis_management_active', 'true');
            sessionStorage.removeItem('aegis_active_tab');
          } else {
            setIsAdminMode(false);
            sessionStorage.removeItem('aegis_management_active');
            setActiveTab('dashboard');
            sessionStorage.setItem('aegis_active_tab', 'dashboard');
          }
        }}
      />

      {currentUser && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            currentUser={currentUser}
            settings={settings}
          />

          <TransferModal
            isOpen={transferModalOpen}
            onClose={() => setTransferModalOpen(false)}
            currentUser={currentUser}
            settings={settings}
            onTransferSuccess={handleTransferCreated}
          />

          <WithdrawalModal
            isOpen={withdrawalModalOpen}
            onClose={() => setWithdrawalModalOpen(false)}
            currentUser={currentUser}
            settings={settings}
            onWithdrawalSubmitted={handleWithdrawalCreated}
          />

          <TierUpgradeModal
            isOpen={tierModalOpen}
            onClose={() => setTierModalOpen(false)}
            currentUser={currentUser}
            settings={settings}
          />

          <NotificationsModal
            isOpen={notificationsModalOpen}
            onClose={() => setNotificationsModalOpen(false)}
            notifications={userNotifications}
            userId={currentUser.uid}
          />
        </>
      )}

      {/* Receipts */}
      <TransactionReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      {/* Support Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        userName={currentUser ? `${currentUser.fullName} ${currentUser.surname}` : undefined}
        accountNumber={currentUser?.accountNumber}
      />

      {/* About Modal */}
      <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />

      {/* Live Support Chat (outside Admin Portal) */}
      {!(isAdminMode && canAccessAdmin) && (
        <LiveChatWidget
          currentUser={currentUser}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      )}
    </div>
  );
}
