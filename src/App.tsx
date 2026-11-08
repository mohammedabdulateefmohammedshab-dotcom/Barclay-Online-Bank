import React, { useState, useEffect } from 'react';
import { store } from './lib/store';
import { 
  UserProfile, 
  BankTransaction, 
  PaymentSubmission, 
  VerificationRequest, 
  BankNotification, 
  FinancialSettings 
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

export default function App() {
  // Global Store State
  const [users, setUsers] = useState<UserProfile[]>(store.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(store.getCurrentUser());
  const [transactions, setTransactions] = useState<BankTransaction[]>(store.getTransactions());
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>(store.getPaymentSubmissions());
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(store.getVerificationRequests());
  const [notifications, setNotifications] = useState<BankNotification[]>(store.getNotifications());
  const [settings, setSettings] = useState<FinancialSettings>(store.getSettings());

  // Navigation & View Mode: Persistent across page refreshes per Requirement 3
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('barclay_active_tab') : null;
    if (saved === 'dashboard') return 'dashboard';
    const initUser = store.getCurrentUser();
    return initUser ? 'dashboard' : 'home';
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAdmin = sessionStorage.getItem('barclay_management_active') === 'true';
      const initUser = store.getCurrentUser();
      const isRoleAdmin = initUser?.role === 'admin' || initUser?.email === 'newzelebarclaysupport@gmail.com';
      return savedAdmin || isRoleAdmin;
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

  // Subscribe to real-time store updates
  useEffect(() => {
    testConnection(); // Probe connection
    const unsubscribe = store.subscribe(() => {
      setUsers(store.getUsers());
      const u = store.getCurrentUser();
      setCurrentUser(u);
      setTransactions(store.getTransactions());
      setPaymentSubmissions(store.getPaymentSubmissions());
      setVerificationRequests(store.getVerificationRequests());
      setNotifications(store.getNotifications());
      setSettings(store.getSettings());
      if (u && (u.role === 'admin' || u.email === 'newzelebarclaysupport@gmail.com')) {
        setIsAdminMode(true);
        sessionStorage.setItem('barclay_management_active', 'true');
      }
    });
    return unsubscribe;
  }, []);

  // Route listener: direct route to unified login or management if hash matches
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin' || hash === '#portal' || window.location.search.includes('admin=true')) {
        const u = store.getCurrentUser();
        if (u && (u.role === 'admin' || u.email === 'newzelebarclaysupport@gmail.com')) {
          setIsAdminMode(true);
          sessionStorage.setItem('barclay_management_active', 'true');
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

  // Filter current user's transactions and notifications
  const userTransactions = currentUser 
    ? transactions.filter(t => t.userId === currentUser.uid)
    : [];

  const userNotifications = currentUser
    ? notifications.filter(n => n.userId === currentUser.uid)
    : [];

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('barclay_active_tab');
    sessionStorage.removeItem('barclay_management_active');
    store.setCurrentUserId(null);
    setCurrentUser(null);
    setActiveTab('home');
    setIsAdminMode(false);
  };

  const handleTransferCreated = (tx: BankTransaction) => {
    setSelectedReceiptTx(tx);
  };

  const handleWithdrawalCreated = (tx: BankTransaction) => {
    setSelectedReceiptTx(tx);
  };

  return (
    <div className="min-h-screen bg-[#0A192F] font-sans antialiased text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* Universal Header */}
      <Header
        currentUser={currentUser}
        isAdminMode={isAdminMode}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onToggleAdminView={() => {
          setIsAdminMode(true);
          sessionStorage.setItem('barclay_management_active', 'true');
        }}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenSupport={() => setSupportModalOpen(true)}
        activeTab={isAdminMode ? 'admin' : activeTab}
        onSelectTab={(tab) => {
          setIsAdminMode(false);
          sessionStorage.removeItem('barclay_management_active');
          setActiveTab(tab as any);
          sessionStorage.setItem('barclay_active_tab', tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdminMode ? (
          /* Separate Secure Admin Dashboard (Requirement 3 & 4: Only authorized administrators) */
          <AdminDashboard
            users={users}
            transactions={transactions}
            paymentSubmissions={paymentSubmissions}
            verificationRequests={verificationRequests}
            settings={settings}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            onExitAdmin={() => {
              sessionStorage.removeItem('barclay_management_active');
              setIsAdminMode(false);
              setActiveTab('home');
            }}
          />
        ) : currentUser && activeTab === 'dashboard' ? (
          /* Registered User Dashboard (Requirement 2 & 5) */
          <UserDashboard
            currentUser={currentUser}
            transactions={userTransactions}
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
          /* Website Public Homepage (Requirement 1 & 2: First landing screen) */
          <HomePage
            onOpenAuth={handleOpenAuth}
            onOpenAbout={() => setAboutModalOpen(true)}
            onOpenSupport={() => setSupportModalOpen(true)}
            currentLang={currentLang}
          />
        )}
      </main>

      {/* User Login & Registration Modal - Unified for both Customers and Administrators */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={(user) => {
          store.setCurrentUserId(user.uid);
          setCurrentUser(user);
          if (user.role === 'admin' || user.email === 'newzelebarclaysupport@gmail.com') {
            setIsAdminMode(true);
            sessionStorage.setItem('barclay_management_active', 'true');
            sessionStorage.removeItem('barclay_active_tab');
          } else {
            setIsAdminMode(false);
            sessionStorage.removeItem('barclay_management_active');
            setActiveTab('dashboard');
            sessionStorage.setItem('barclay_active_tab', 'dashboard');
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

      {/* Receipts viewable by both customer and admin */}
      <TransactionReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      {/* Customer Support Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        userName={currentUser ? `${currentUser.fullName} ${currentUser.surname}` : undefined}
        accountNumber={currentUser?.accountNumber}
      />

      {/* About Us Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      {/* Floating 24/7 Live Support Chat (Only displayed outside admin dashboard) */}
      {!isAdminMode && (
        <LiveChatWidget
          currentUser={currentUser}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      )}
    </div>
  );
}
