import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  runTransaction,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  UserProfile,
  BankTransaction,
  DepositRecord,
  WithdrawalRecord,
  PaymentSubmission,
  VerificationRequest,
  BankNotification,
  FinancialSettings,
  AccountTier,
  CardDetails,
  CardLimits,
  AdminAuditLog,
  AuditActionType,
  SwiftRequest,
  ChatMessage,
  SupportConversation,
  PaymentMethod,
  AdminTier,
  AdminRoleRecord,
  InvestmentPlan,
  UserInvestment,
  ReferralRecord,
  BankingPaymentInfo,
  CardTokenSummary,
} from '../types';

export const PRIMARY_SUPER_ADMIN_EMAILS = [
  'newzelebarclaysupport@gmail.com',
  'mohammedabdulateefmohammedshab@gmail.com',
];

export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  verificationFee: 50,
  tier2UpgradeFee: 500,
  tier3UpgradeFee: 5000,
  tier1DailyLimit: 10000,
  tier1MonthlyLimit: 100000,
  tier2DailyLimit: 50000,
  tier2MonthlyLimit: 5000000,
  tier3DailyLimit: 500000,
  tier3MonthlyLimit: 50000000,
  btcAddress: 'bc1qrc3ldwp9jrrtmlcua4czjnnkz49m6uahetuqgx',
  usdtAddress: '0x71C8705a3B344100B4180F494E662b2C8eF46C6E',
  clearingBankName: 'Aegis Clearing Bank (UK)',
  clearingBankAccountName: 'Aegis Global Clearing Treasury',
  clearingBankAccountNumber: 'GB82 AEGS 2000 0084 9201 84',
  clearingSwiftCode: 'AEGSGB2L',
  clearingCountry: 'United Kingdom',
  referralBonusAmount: 100,
  supportEmail: 'newzelebarclaysupport@gmail.com',
  requireSwiftCode: true,
  updatedAt: new Date().toISOString(),
};

export function generate4DigitCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

class AegisStore {
  private users: UserProfile[] = [];
  private admins: AdminRoleRecord[] = [];
  private transactions: BankTransaction[] = [];
  private deposits: DepositRecord[] = [];
  private withdrawals: WithdrawalRecord[] = [];
  private paymentSubmissions: PaymentSubmission[] = [];
  private verificationRequests: VerificationRequest[] = [];
  private investmentPlans: InvestmentPlan[] = [];
  private investments: UserInvestment[] = [];
  private referrals: ReferralRecord[] = [];
  private bankingProfiles: BankingPaymentInfo[] = [];
  private notifications: BankNotification[] = [];
  private auditLogs: AdminAuditLog[] = [];
  private swiftRequests: SwiftRequest[] = [];
  private chatConversations: SupportConversation[] = [];
  private settings: FinancialSettings = DEFAULT_FINANCIAL_SETTINGS;

  private currentUserId: string | null = null;
  private currentAdminTier: AdminTier | null = null;
  private currentAdminRecord: AdminRoleRecord | null = null;
  private authReady = false;
  private registrationInProgress = false;
  private activeUnsubscribes: Unsubscribe[] = [];
  private publicUnsubscribes: Unsubscribe[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initStore();
  }

  private initStore() {
    this.subscribePublicCollections();

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (this.registrationInProgress) {
        return;
      }

      this.clearUserSubscriptions();

      if (!firebaseUser) {
        this.resetAuthenticatedCollections();
        this.currentUserId = null;
        this.currentAdminTier = null;
        this.currentAdminRecord = null;
        this.authReady = true;
        this.notify();
        return;
      }

      try {
        const { profile, adminRecord } = await this.ensureAuthenticatedUserSession(firebaseUser);
        this.currentUserId = profile?.uid || adminRecord?.uid || firebaseUser.uid;
        this.authReady = true;

        if (this.currentAdminTier) {
          this.subscribeAdminCollections();
        } else if (profile) {
          this.subscribeCustomerCollections(profile);
        }
        this.notify();
      } catch (err) {
        console.warn('Auth state sync error:', err);
        this.authReady = true;
        this.notify();
      }
    });
  }

  private resetAuthenticatedCollections() {
    this.users = [];
    this.admins = [];
    this.transactions = [];
    this.deposits = [];
    this.withdrawals = [];
    this.paymentSubmissions = [];
    this.verificationRequests = [];
    this.investments = [];
    this.referrals = [];
    this.bankingProfiles = [];
    this.notifications = [];
    this.auditLogs = [];
    this.swiftRequests = [];
    this.chatConversations = [];
  }

  private clearUserSubscriptions() {
    this.activeUnsubscribes.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // Ignore cleanup errors
      }
    });
    this.activeUnsubscribes = [];
  }

  private subscribePublicCollections() {
    // Public financial configuration
    const settingsUnsub = onSnapshot(
      doc(db, 'settings', 'financial'),
      (snapshot) => {
        if (snapshot.exists()) {
          this.settings = {
            ...DEFAULT_FINANCIAL_SETTINGS,
            ...(snapshot.data() as FinancialSettings),
          };
          this.notify();
        }
      },
      (err) => console.warn('Public settings listener:', err.message)
    );
    this.publicUnsubscribes.push(settingsUnsub);

    // Public active investment plans
    const plansUnsub = onSnapshot(
      collection(db, 'investment_plans'),
      (snapshot) => {
        const list: InvestmentPlan[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InvestmentPlan, 'id'>),
        }));
        this.investmentPlans = list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.notify();
      },
      (err) => console.warn('Investment plans listener:', err.message)
    );
    this.publicUnsubscribes.push(plansUnsub);
  }

  private async generateUniqueAccountNumberInFirestore(): Promise<string> {
    for (let attempt = 0; attempt < 40; attempt++) {
      const firstDigit = Math.floor(Math.random() * 6) + 4;
      const remaining = Math.floor(100000000 + Math.random() * 900000000).toString();
      const candidate = `${firstDigit}${remaining.slice(0, 9)}`;
      try {
        const existing = await getDoc(doc(db, 'account_numbers', candidate));
        if (!existing.exists()) {
          return candidate;
        }
      } catch {
        return candidate;
      }
    }
    return `${Math.floor(4 + Math.random() * 5)}${String(Date.now()).slice(-9)}`;
  }

  /**
   * Ensures an authenticated Firebase user has their admin tier and/or customer profile resolved.
   * Authorized administrators are kept in `admins/{uid}` and NEVER forced into a synthetic customer bank account.
   * Existing customer accounts, balances, and histories are preserved intact.
   */
  private async ensureAuthenticatedUserSession(
    firebaseUser: FirebaseAuthUser
  ): Promise<{ profile: UserProfile | null; adminRecord: AdminRoleRecord | null }> {
    const uid = firebaseUser.uid;
    const emailLower = (firebaseUser.email || '').trim().toLowerCase();
    const now = new Date().toISOString();

    // 1. Resolve admins/{uid}, bootstrapping Primary Super Admins if authorized
    let resolvedAdminTier: AdminTier | null = null;
    let adminRecord: AdminRoleRecord | null = null;
    try {
      const adminSnap = await getDoc(doc(db, 'admins', uid));
      if (adminSnap.exists()) {
        const adminData = adminSnap.data() as AdminRoleRecord;
        if (PRIMARY_SUPER_ADMIN_EMAILS.includes(emailLower)) {
          resolvedAdminTier = 'tier1';
          adminRecord = {
            ...adminData,
            uid: adminData.uid || uid,
            email: emailLower,
            tier: 'tier1',
            status: 'active',
          };
          if (adminData.tier !== 'tier1' || adminData.status !== 'active') {
            await setDoc(doc(db, 'admins', uid), { ...adminRecord, updatedAt: now }, { merge: true });
          }
        } else if (adminData.status === 'active') {
          resolvedAdminTier = adminData.tier === 'tier1' ? 'tier1' : 'tier2';
          adminRecord = { ...adminData, uid: adminData.uid || uid };
        }
      } else if (PRIMARY_SUPER_ADMIN_EMAILS.includes(emailLower)) {
        const superAdminRecord: AdminRoleRecord = {
          uid,
          email: emailLower,
          username: emailLower.split('@')[0],
          fullName: firebaseUser.displayName || 'Executive Owner Admin',
          tier: 'tier1',
          status: 'active',
          createdBy: 'system',
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'admins', uid), superAdminRecord);
        resolvedAdminTier = 'tier1';
        adminRecord = superAdminRecord;
      }
    } catch (e) {
      if (PRIMARY_SUPER_ADMIN_EMAILS.includes(emailLower)) {
        resolvedAdminTier = 'tier1';
        adminRecord = {
          uid,
          email: emailLower,
          username: emailLower.split('@')[0],
          fullName: firebaseUser.displayName || 'Executive Owner Admin',
          tier: 'tier1',
          status: 'active',
          createdBy: 'system',
          createdAt: now,
          updatedAt: now,
        };
      }
      console.warn('Admin role lookup notice:', e);
    }

    this.currentAdminTier = resolvedAdminTier;
    this.currentAdminRecord = adminRecord;

    // 2. Load users/{uid} if it exists
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    let profile: UserProfile | null = null;

    if (userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
    } else if (!resolvedAdminTier) {
      // Non-admin customer: check pre-auth legacy profile matching email
      try {
        const emailQ = query(
          collection(db, 'users'),
          where('email', '==', emailLower),
          limit(1)
        );
        const matchSnap = await getDocs(emailQ);
        if (!matchSnap.empty) {
          const legacyData = matchSnap.docs[0].data() as UserProfile;
          profile = {
            ...legacyData,
            uid,
            email: emailLower,
            role: legacyData.role || 'user',
            updatedAt: now,
          };
          await setDoc(userRef, profile);
          await setDoc(
            doc(db, 'account_numbers', profile.accountNumber),
            {
              uid,
              accountNumber: profile.accountNumber,
              email: emailLower,
              fullName: `${profile.fullName} ${profile.surname}`.trim(),
              createdAt: profile.createdAt || now,
            },
            { merge: true }
          );
        }
      } catch (e) {
        console.warn('Legacy user migration query note:', e);
      }
    }

    // Only create a new customer profile in `users` if this is a standard customer without an admin record
    if (!profile && !resolvedAdminTier) {
      const accountNumber = await this.generateUniqueAccountNumberInFirestore();
      const displayParts = (firebaseUser.displayName || emailLower.split('@')[0] || 'Client').split(' ');
      const firstName = displayParts[0] || 'Client';
      const lastName = displayParts.slice(1).join(' ') || 'Member';
      const username = emailLower.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '');

      profile = {
        uid,
        accountNumber,
        username,
        fullName: firstName,
        surname: lastName,
        email: emailLower,
        country: 'United Kingdom',
        pin: generate4DigitCode(),
        photoUrl: firebaseUser.photoURL || '',
        balance: 0,
        currency: 'USD',
        tier: 'Tier 1',
        status: 'active',
        role: 'user',
        referralCode: `AEG-${accountNumber.slice(-6)}`,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, profile);
      await setDoc(doc(db, 'account_numbers', accountNumber), {
        uid,
        accountNumber,
        email: emailLower,
        username: username.toLowerCase(),
        fullName: `${profile.fullName} ${profile.surname}`.trim(),
        createdAt: now,
      });
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid,
        email: emailLower,
        accountNumber,
        username: username.toLowerCase(),
      });
      await setDoc(doc(db, 'referral_codes', `AEG-${accountNumber.slice(-6)}`), {
        uid,
        accountNumber,
        email: emailLower,
        code: `AEG-${accountNumber.slice(-6)}`,
      });
    }

    if (profile) {
      const existingIdx = this.users.findIndex((u) => u.uid === profile!.uid);
      if (existingIdx >= 0) {
        this.users[existingIdx] = profile;
      } else {
        this.users.unshift(profile);
      }
    }

    return { profile, adminRecord };
  }

  private subscribeAdminCollections() {
    const watch = <T extends object>(
      colName: string,
      setter: (items: T[]) => void,
      sortField: string = 'createdAt'
    ) => {
      const unsub = onSnapshot(
        collection(db, colName),
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const raw = d.data() as Record<string, any>;
            if (colName === 'users' || colName === 'admins' || colName === 'banking_info') {
              return { ...raw, uid: raw.uid || d.id } as T;
            }
            return { ...raw, id: raw.id || d.id } as T;
          });
          items.sort((a: any, b: any) => {
            const ta = new Date(a[sortField] || a.updatedAt || 0).getTime();
            const tb = new Date(b[sortField] || b.updatedAt || 0).getTime();
            return tb - ta;
          });
          setter(items);
          this.notify();
        },
        (err) => console.warn(`Admin subscription (${colName}):`, err.message)
      );
      this.activeUnsubscribes.push(unsub);
    };

    watch<UserProfile>('users', (items) => {
      const map = new Map<string, UserProfile>();
      for (const u of items) {
        const key = u.uid || u.accountNumber || u.email.toLowerCase();
        map.set(key, u);
      }
      this.users = Array.from(map.values());
    });

    watch<AdminRoleRecord>('admins', (items) => {
      this.admins = items;
      const myUid = auth.currentUser?.uid;
      if (myUid) {
        const myAdmin = items.find((a) => a.uid === myUid && a.status === 'active');
        if (myAdmin) {
          this.currentAdminTier = myAdmin.tier;
        }
      }
    });

    watch<BankTransaction>('transactions', (items) => {
      this.transactions = items.filter(
        (t) =>
          t.description !== 'New Account Opening Welcome Credit' &&
          !t.senderName?.includes('(Welcome Credit)')
      );
    });
    watch<DepositRecord>('deposits', (items) => (this.deposits = items));
    watch<WithdrawalRecord>('withdrawals', (items) => (this.withdrawals = items));
    watch<PaymentSubmission>('payment_submissions', (items) => (this.paymentSubmissions = items));
    watch<VerificationRequest>('verification_requests', (items) => (this.verificationRequests = items));
    watch<UserInvestment>('investments', (items) => (this.investments = items));
    watch<ReferralRecord>('referrals', (items) => (this.referrals = items));
    watch<BankingPaymentInfo>('banking_info', (items) => (this.bankingProfiles = items), 'updatedAt');
    watch<BankNotification>('notifications', (items) => (this.notifications = items));
    watch<AdminAuditLog>('audit_logs', (items) => (this.auditLogs = items), 'timestamp');
    watch<SwiftRequest>('swift_requests', (items) => (this.swiftRequests = items));
    watch<SupportConversation>('chat_conversations', (items) => (this.chatConversations = items), 'lastMessageTime');
  }

  private subscribeCustomerCollections(profile: UserProfile) {
    const uid = profile.uid;

    // Customer's own user document
    this.activeUnsubscribes.push(
      onSnapshot(
        doc(db, 'users', uid),
        (snapshot) => {
          if (snapshot.exists()) {
            const updated = snapshot.data() as UserProfile;
            this.users = [updated];
            this.notify();
          }
        },
        (err) => console.warn('Customer profile snapshot:', err.message)
      )
    );

    // Customer's own banking profile
    this.activeUnsubscribes.push(
      onSnapshot(
        doc(db, 'banking_info', uid),
        (snapshot) => {
          if (snapshot.exists()) {
            this.bankingProfiles = [snapshot.data() as BankingPaymentInfo];
          } else {
            this.bankingProfiles = [];
          }
          this.notify();
        },
        (err) => console.warn('Banking info snapshot:', err.message)
      )
    );

    // Customer's own chat conversation
    this.activeUnsubscribes.push(
      onSnapshot(
        doc(db, 'chat_conversations', uid),
        (snapshot) => {
          if (snapshot.exists()) {
            this.chatConversations = [{ id: snapshot.id, ...(snapshot.data() as Omit<SupportConversation, 'id'>) }];
          } else {
            this.chatConversations = [];
          }
          this.notify();
        },
        (err) => console.warn('Chat snapshot:', err.message)
      )
    );

    const watchOwned = <T extends { id?: string }>(
      colName: string,
      field: string,
      setter: (items: T[]) => void,
      sortField: string = 'createdAt'
    ) => {
      const q = query(collection(db, colName), where(field, '==', uid));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({
            ...(d.data() as T),
            id: (d.data() as any).id || d.id,
          }));
          items.sort((a: any, b: any) => {
            const ta = new Date(a[sortField] || 0).getTime();
            const tb = new Date(b[sortField] || 0).getTime();
            return tb - ta;
          });
          setter(items);
          this.notify();
        },
        (err) => console.warn(`Customer query (${colName}):`, err.message)
      );
      this.activeUnsubscribes.push(unsub);
    };

    watchOwned<BankTransaction>('transactions', 'userId', (items) => {
      this.transactions = items.filter(
        (t) =>
          t.description !== 'New Account Opening Welcome Credit' &&
          !t.senderName?.includes('(Welcome Credit)')
      );
    });
    watchOwned<DepositRecord>('deposits', 'userId', (items) => (this.deposits = items));
    watchOwned<WithdrawalRecord>('withdrawals', 'userId', (items) => (this.withdrawals = items));
    watchOwned<PaymentSubmission>('payment_submissions', 'userId', (items) => (this.paymentSubmissions = items));
    watchOwned<VerificationRequest>('verification_requests', 'userId', (items) => (this.verificationRequests = items));
    watchOwned<UserInvestment>('investments', 'userId', (items) => (this.investments = items));
    watchOwned<ReferralRecord>('referrals', 'referrerUid', (items) => (this.referrals = items));
    watchOwned<BankNotification>('notifications', 'userId', (items) => (this.notifications = items));
    watchOwned<SwiftRequest>('swift_requests', 'userId', (items) => (this.swiftRequests = items));
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // ==================== READ GETTERS ====================
  public isAuthReady(): boolean {
    return this.authReady;
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public getAdmins(): AdminRoleRecord[] {
    return [...this.admins];
  }

  public getCurrentUser(): UserProfile | null {
    if (!this.currentUserId) return null;
    return this.users.find((u) => u.uid === this.currentUserId) || null;
  }

  public getCurrentAdminRecord(): AdminRoleRecord | null {
    return this.currentAdminRecord;
  }

  public getCurrentAdminTier(): AdminTier | null {
    return this.currentAdminTier;
  }

  public isCurrentUserAdmin(): boolean {
    return this.currentAdminTier === 'tier1' || this.currentAdminTier === 'tier2';
  }

  public isTier1Admin(): boolean {
    return this.currentAdminTier === 'tier1';
  }

  public getTransactions(userId?: string): BankTransaction[] {
    if (!userId) return [...this.transactions];
    return this.transactions.filter((t) => t.userId === userId);
  }

  public getDeposits(userId?: string): DepositRecord[] {
    if (!userId) return [...this.deposits];
    return this.deposits.filter((d) => d.userId === userId);
  }

  public getWithdrawals(userId?: string): WithdrawalRecord[] {
    if (!userId) return [...this.withdrawals];
    return this.withdrawals.filter((w) => w.userId === userId);
  }

  public getPaymentSubmissions(userId?: string): PaymentSubmission[] {
    if (!userId) return [...this.paymentSubmissions];
    return this.paymentSubmissions.filter((p) => p.userId === userId);
  }

  public getVerificationRequests(userId?: string): VerificationRequest[] {
    if (!userId) return [...this.verificationRequests];
    return this.verificationRequests.filter((v) => v.userId === userId);
  }

  public getInvestmentPlans(): InvestmentPlan[] {
    return [...this.investmentPlans];
  }

  public getInvestments(userId?: string): UserInvestment[] {
    if (!userId) return [...this.investments];
    return this.investments.filter((i) => i.userId === userId);
  }

  public getReferrals(userId?: string): ReferralRecord[] {
    if (!userId) return [...this.referrals];
    return this.referrals.filter((r) => r.referrerUid === userId || r.referredUid === userId);
  }

  public getBankingInfo(userId?: string): BankingPaymentInfo | null {
    const uid = userId || this.currentUserId;
    if (!uid) return null;
    return this.bankingProfiles.find((b) => b.uid === uid) || null;
  }

  public getAllBankingInfos(): BankingPaymentInfo[] {
    return [...this.bankingProfiles];
  }

  public getNotifications(userId?: string): BankNotification[] {
    if (!userId) return [...this.notifications];
    return this.notifications.filter((n) => n.userId === userId);
  }

  public getSettings(): FinancialSettings {
    return { ...this.settings };
  }

  public getAuditLogs(): AdminAuditLog[] {
    return [...this.auditLogs];
  }

  public getSwiftRequests(): SwiftRequest[] {
    return [...this.swiftRequests];
  }

  public getUserByAccountNumber(accNum: string): UserProfile | null {
    const clean = accNum.trim();
    return this.users.find((u) => u.accountNumber === clean) || null;
  }

  public getUserById(uid: string): UserProfile | null {
    return this.users.find((u) => u.uid === uid) || null;
  }

  public searchUsers(searchTerm: string): UserProfile[] {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [...this.users];
    return this.users.filter(
      (u) =>
        u.accountNumber.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        `${u.fullName} ${u.surname}`.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q)
    );
  }

  public setCurrentUserId(uid: string | null) {
    this.currentUserId = uid;
    this.notify();
  }

  public async logoutUser(): Promise<void> {
    this.clearUserSubscriptions();
    this.resetAuthenticatedCollections();
    this.currentUserId = null;
    this.currentAdminTier = null;
    this.currentAdminRecord = null;
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    this.notify();
  }

  // ==================== IMMUTABLE ADMIN ACTIVITY LOGS ====================
  private getActorMetadata() {
    const adminRec = this.currentAdminRecord;
    const currentUser = this.getCurrentUser();
    const firebaseUser = auth.currentUser;
    return {
      adminId: adminRec?.uid || firebaseUser?.uid || currentUser?.uid || 'system',
      adminEmail: adminRec?.email || firebaseUser?.email || currentUser?.email || 'system',
      adminUsername:
        adminRec?.username ||
        currentUser?.username ||
        (firebaseUser?.email ? firebaseUser.email.split('@')[0] : 'system'),
      adminTier: (adminRec?.tier || this.currentAdminTier || 'system') as AdminTier | 'system',
    };
  }

  public async addAuditLog(
    entry: Omit<AdminAuditLog, 'id' | 'timestamp' | 'adminEmail'> & { adminEmail?: string }
  ): Promise<AdminAuditLog> {
    const actor = this.getActorMetadata();
    const newLog: AdminAuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      adminId: entry.adminId || actor.adminId,
      adminUsername: entry.adminUsername || actor.adminUsername,
      adminEmail: entry.adminEmail || actor.adminEmail,
      adminTier: entry.adminTier || actor.adminTier,
      action: entry.action,
      affectedUserId: entry.affectedUserId,
      targetAccount: entry.targetAccount,
      transactionId: entry.transactionId,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      amount: entry.amount,
      reason: entry.reason,
      details: entry.details,
    };

    // Strip undefined fields before Firestore write
    const cleanLog = Object.fromEntries(
      Object.entries(newLog).filter(([, v]) => v !== undefined)
    ) as AdminAuditLog;

    this.auditLogs.unshift(cleanLog);
    this.notify();

    try {
      await setDoc(doc(db, 'audit_logs', cleanLog.id), cleanLog);
    } catch (e) {
      console.warn('Audit log write warning:', e);
    }
    return cleanLog;
  }

  // ==================== AUTHENTICATION & REGISTRATION ====================
  public async registerUser(payload: {
    username?: string;
    fullName: string;
    surname: string;
    email: string;
    country: string;
    pin: string;
    password: string;
    referralCode?: string;
  }): Promise<{ user: UserProfile; error?: string }> {
    const emailLower = payload.email.trim().toLowerCase();
    const usernameClean = (
      payload.username?.trim() || emailLower.split('@')[0]
    )
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '');

    if (!payload.password || payload.password.length < 8) {
      return { user: null as any, error: 'Password must be at least 8 characters long.' };
    }

    // Check username availability if provided
    if (usernameClean) {
      try {
        const usernameDoc = await getDoc(doc(db, 'usernames', usernameClean));
        if (usernameDoc.exists()) {
          return {
            user: null as any,
            error: 'This username is already taken. Please choose a different username.',
          };
        }
      } catch {
        // Proceed if lookup unavailable
      }
    }

    this.registrationInProgress = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailLower, payload.password);
      const finalUid = cred.user.uid;
      const now = new Date().toISOString();

      await updateProfile(cred.user, {
        displayName: `${payload.fullName.trim()} ${payload.surname.trim()}`,
      }).catch(() => {});

      const accountNumber = await this.generateUniqueAccountNumberInFirestore();
      const myReferralCode = `AEG-${accountNumber.slice(-6)}`;
      const isSuperAdminEmail = PRIMARY_SUPER_ADMIN_EMAILS.includes(emailLower);

      const newUser: UserProfile = {
        uid: finalUid,
        accountNumber,
        username: usernameClean,
        fullName: payload.fullName.trim(),
        surname: payload.surname.trim(),
        email: emailLower,
        country: payload.country,
        pin: payload.pin,
        photoUrl: '',
        balance: 0.0,
        currency: 'USD',
        tier: 'Tier 1',
        status: 'active',
        role: isSuperAdminEmail ? 'admin' : 'user',
        ...(isSuperAdminEmail ? { adminTier: 'tier1' as AdminTier } : {}),
        referralCode: myReferralCode,
        ...(payload.referralCode?.trim()
          ? { referredBy: payload.referralCode.trim().toUpperCase() }
          : {}),
        swiftVerified: false,
        createdAt: now,
        updatedAt: now,
      };

      const welcomeNotif: BankNotification = {
        id: `notif_${Date.now()}`,
        userId: finalUid,
        title: 'Account Registered Successfully',
        message: `Welcome, ${newUser.fullName} ${newUser.surname}. Your permanent 10-digit account number is ${accountNumber}. Your opening balance is $0.00 USD.`,
        type: 'success',
        read: false,
        createdAt: now,
      };

      const defaultBankingInfo: BankingPaymentInfo = {
        uid: finalUid,
        accountNumber,
        bankAccountName: `${newUser.fullName} ${newUser.surname}`,
        bankAccountNumber: accountNumber,
        bankName: 'Aegis Online Bank',
        swiftBicCode: 'AEGSGB2L',
        bankCountry: payload.country,
        preferredMethod: 'Bank_Wire',
        tokenizedCards: [],
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', finalUid), newUser);
      await setDoc(doc(db, 'account_numbers', accountNumber), {
        uid: finalUid,
        accountNumber,
        email: emailLower,
        username: usernameClean,
        fullName: `${newUser.fullName} ${newUser.surname}`,
        createdAt: now,
      });
      if (usernameClean) {
        await setDoc(doc(db, 'usernames', usernameClean), {
          uid: finalUid,
          email: emailLower,
          accountNumber,
          username: usernameClean,
        });
      }
      await setDoc(doc(db, 'referral_codes', myReferralCode), {
        uid: finalUid,
        accountNumber,
        email: emailLower,
        code: myReferralCode,
      });
      await setDoc(doc(db, 'banking_info', finalUid), defaultBankingInfo);
      await setDoc(doc(db, 'notifications', welcomeNotif.id), welcomeNotif);

      if (isSuperAdminEmail) {
        const superAdminDoc: AdminRoleRecord = {
          uid: finalUid,
          email: emailLower,
          username: usernameClean,
          fullName: `${newUser.fullName} ${newUser.surname}`,
          tier: 'tier1',
          status: 'active',
          createdBy: 'system',
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'admins', finalUid), superAdminDoc);
      }

      // Link referral record if a valid referral code or referrer account number was supplied
      if (payload.referralCode?.trim()) {
        await this.recordReferralSignup(newUser, payload.referralCode.trim());
      }

      // Sign out immediately after registration so user logs in intentionally via Sign In
      await signOut(auth);
      this.currentUserId = null;
      this.currentAdminTier = null;

      return { user: newUser };
    } catch (err: any) {
      let msg = err?.message || 'Registration failed.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please choose a stronger password.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      return { user: null as any, error: msg };
    } finally {
      this.registrationInProgress = false;
    }
  }

  private async recordReferralSignup(newUser: UserProfile, rawCode: string) {
    try {
      const clean = rawCode.trim().toUpperCase();
      let referrerAccountNum = '';
      if (/^\d{10}$/.test(clean)) {
        referrerAccountNum = clean;
      } else if (clean.startsWith('AEG-')) {
        const refCodeSnap = await getDoc(doc(db, 'referral_codes', clean));
        if (refCodeSnap.exists()) {
          const acc = refCodeSnap.data() as any;
          if (acc.uid !== newUser.uid) {
            const refRecord: ReferralRecord = {
              id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              referrerUid: acc.uid,
              referrerAccountNumber: acc.accountNumber,
              referrerEmail: acc.email,
              referredUid: newUser.uid,
              referredAccountNumber: newUser.accountNumber,
              referredEmail: newUser.email,
              referredName: `${newUser.fullName} ${newUser.surname}`,
              referralCode: clean,
              rewardAmount: this.settings.referralBonusAmount ?? 100,
              status: 'Pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'referrals', refRecord.id), refRecord);
            return;
          }
        }
        const suffix = clean.replace('AEG-', '');
        if (suffix.length === 10) referrerAccountNum = suffix;
      }

      if (referrerAccountNum) {
        const accSnap = await getDoc(doc(db, 'account_numbers', referrerAccountNum));
        if (accSnap.exists()) {
          const acc = accSnap.data() as any;
          if (acc.uid !== newUser.uid) {
            const refRecord: ReferralRecord = {
              id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              referrerUid: acc.uid,
              referrerAccountNumber: acc.accountNumber,
              referrerEmail: acc.email,
              referredUid: newUser.uid,
              referredAccountNumber: newUser.accountNumber,
              referredEmail: newUser.email,
              referredName: `${newUser.fullName} ${newUser.surname}`,
              referralCode: clean,
              rewardAmount: this.settings.referralBonusAmount ?? 100,
              status: 'Pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'referrals', refRecord.id), refRecord);
          }
        }
      }
    } catch (e) {
      console.warn('Referral linkage skipped:', e);
    }
  }

  private async createReferralDoc(referrer: UserProfile, referred: UserProfile, code: string) {
    if (referrer.uid === referred.uid) return;
    const refRecord: ReferralRecord = {
      id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      referrerUid: referrer.uid,
      referrerAccountNumber: referrer.accountNumber,
      referrerEmail: referrer.email,
      referredUid: referred.uid,
      referredAccountNumber: referred.accountNumber,
      referredEmail: referred.email,
      referredName: `${referred.fullName} ${referred.surname}`,
      referralCode: code,
      rewardAmount: this.settings.referralBonusAmount ?? 100,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'referrals', refRecord.id), refRecord);
  }

  /**
   * Resolve email from Email, 10-Digit Account Number, or Username before Firebase Auth signIn.
   */
  private async resolveEmailForIdentifier(identifier: string): Promise<string | null> {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }

    if (/^\d{10}$/.test(trimmed)) {
      const accSnap = await getDoc(doc(db, 'account_numbers', trimmed));
      if (accSnap.exists()) {
        return ((accSnap.data() as any).email || '').toLowerCase();
      }
    }

    const unameSnap = await getDoc(doc(db, 'usernames', trimmed.toLowerCase()));
    if (unameSnap.exists()) {
      return ((unameSnap.data() as any).email || '').toLowerCase();
    }

    return null;
  }

  public async loginUser(
    identifier: string,
    secret: string
  ): Promise<{ user: UserProfile | null; adminRecord?: AdminRoleRecord | null; error?: string }> {
    const trimmed = identifier.trim();
    const cleanSecret = secret.trim();

    if (!trimmed || !cleanSecret) {
      return { user: null, error: 'Please provide both your account identifier and password.' };
    }

    try {
      const resolvedEmail = await this.resolveEmailForIdentifier(trimmed);
      if (!resolvedEmail) {
        return {
          user: null,
          error:
            'No account found matching that email, username, or 10-digit account number.',
        };
      }

      const cred = await signInWithEmailAndPassword(auth, resolvedEmail, cleanSecret);
      const { profile, adminRecord } = await this.ensureAuthenticatedUserSession(cred.user);

      this.currentUserId = profile?.uid || adminRecord?.uid || cred.user.uid;
      this.authReady = true;
      this.clearUserSubscriptions();
      if (this.currentAdminTier) {
        this.subscribeAdminCollections();
        await this.addAuditLog({
          adminEmail: adminRecord?.email || cred.user.email || resolvedEmail,
          action: 'MANAGEMENT_LOGIN',
          details: `${this.currentAdminTier.toUpperCase()} administrator authenticated.`,
        });
      } else if (profile) {
        this.subscribeCustomerCollections(profile);
      }

      this.notify();
      return { user: profile, adminRecord };
    } catch (err: any) {
      let msg = 'Invalid credentials. Please verify your identifier and password.';
      if (err?.code === 'auth/operation-not-allowed') {
        msg =
          'Email/Password sign-in is disabled in Firebase Console for this project. Enable Authentication > Sign-in method > Email/Password in Firebase Console.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a moment or reset your password.';
      } else if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found'
      ) {
        msg =
          'Invalid email or password, or your administrator password has not been set up yet.';
      }
      return { user: null, error: msg };
    }
  }

  /**
   * Dedicated Administrator Portal login (supports pure executive admins with no customer bank account).
   */
  public async verifyAdminLogin(
    emailOrId: string,
    password: string
  ): Promise<{ adminRecord?: AdminRoleRecord | null; adminUser?: UserProfile | null; error?: string }> {
    const res = await this.loginUser(emailOrId, password);
    if (res.error) {
      return { error: res.error };
    }
    if (!this.isCurrentUserAdmin()) {
      await this.logoutUser();
      return {
        error: 'Access Denied: This login gateway is restricted exclusively to authorized Aegis administrators.',
      };
    }
    return {
      adminRecord: res.adminRecord || this.currentAdminRecord,
      adminUser: res.user,
    };
  }

  /**
   * Dedicated First-Time Owner Super Admin setup: creates Firebase Auth password credentials and
   * activates a separate Tier 1 Admin role in `admins/{uid}` WITHOUT creating any customer bank record.
   */
  public async setupOwnerAdminAccount(params: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<{ adminRecord?: AdminRoleRecord; error?: string; code?: string }> {
    const emailLower = params.email.trim().toLowerCase();
    if (!PRIMARY_SUPER_ADMIN_EMAILS.includes(emailLower)) {
      return {
        error: 'Access Denied: Only pre-authorized platform owner emails can initialize Tier 1 Super Admin credentials.',
      };
    }
    if (!params.password || params.password.length < 8) {
      return { error: 'Administrator password must be at least 8 characters long.' };
    }

    this.registrationInProgress = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailLower, params.password);
      const uid = cred.user.uid;
      const now = new Date().toISOString();
      const fullName = params.fullName?.trim() || 'Executive Owner Administrator';

      await updateProfile(cred.user, { displayName: fullName }).catch(() => {});

      const superAdminRecord: AdminRoleRecord = {
        uid,
        email: emailLower,
        username: emailLower.split('@')[0],
        fullName,
        tier: 'tier1',
        status: 'active',
        createdBy: 'system',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'admins', uid), superAdminRecord);

      this.currentAdminTier = 'tier1';
      this.currentAdminRecord = superAdminRecord;
      this.currentUserId = uid;
      this.authReady = true;
      this.clearUserSubscriptions();
      this.subscribeAdminCollections();

      await this.addAuditLog({
        adminId: uid,
        adminEmail: emailLower,
        adminUsername: superAdminRecord.username,
        adminTier: 'tier1',
        action: 'MANAGEMENT_LOGIN',
        details: 'Primary Tier 1 Super Administrator initialized executive credentials and signed in.',
      });

      this.notify();
      return { adminRecord: superAdminRecord };
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        return {
          error:
            'Email/Password authentication is disabled in Firebase Console for this project. Enable Authentication > Sign-in method > Email/Password in Firebase Console first.',
        };
      }
      if (err?.code === 'auth/email-already-in-use') {
        return {
          code: 'EMAIL_EXISTS',
          error:
            'Credentials already exist for this administrator email. Sign in with your password or use Reset Admin Password.',
        };
      }
      return { error: err?.message || 'Failed to initialize administrator credentials.' };
    } finally {
      this.registrationInProgress = false;
    }
  }

  /**
   * Sign into the Management Portal using Google Authentication (only succeeds for authorized admin emails/records).
   */
  public async loginWithGoogleAdmin(): Promise<{
    adminRecord?: AdminRoleRecord | null;
    adminUser?: UserProfile | null;
    error?: string;
  }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const { profile, adminRecord } = await this.ensureAuthenticatedUserSession(cred.user);

      if (!this.isCurrentUserAdmin()) {
        await this.logoutUser();
        return {
          error:
            'Access Denied: The selected Google account is not registered as an authorized Aegis administrator.',
        };
      }

      this.currentUserId = profile?.uid || adminRecord?.uid || cred.user.uid;
      this.authReady = true;
      this.clearUserSubscriptions();
      this.subscribeAdminCollections();

      await this.addAuditLog({
        adminEmail: adminRecord?.email || cred.user.email || 'admin',
        action: 'MANAGEMENT_LOGIN',
        details: `${this.currentAdminTier?.toUpperCase()} administrator signed in via Google SSO.`,
      });

      this.notify();
      return { adminRecord, adminUser: profile };
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        return { error: 'Google sign-in window was closed before completing authentication.' };
      }
      return { error: err?.message || 'Google administrator sign-in failed.' };
    }
  }

  public async recoverPassword(
    identifier: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const email = await this.resolveEmailForIdentifier(identifier);
      if (!email) {
        return {
          success: false,
          error: 'No registered account found matching this email, username, or account number.',
        };
      }
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: `A secure Firebase password reset email has been dispatched to ${email}. Check your inbox and spam folder to reset your password.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Unable to send password reset email.',
      };
    }
  }

  public async syncFromFirestoreNow(): Promise<{ count: number }> {
    if (!auth.currentUser) return { count: this.users.length };
    if (this.isCurrentUserAdmin()) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = snap.docs.map((d) => d.data() as UserProfile);
        this.users = list;
        this.notify();
        return { count: list.length };
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      }
    } else {
      const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (docSnap.exists()) {
        this.users = [docSnap.data() as UserProfile];
        this.notify();
      }
    }
    return { count: this.users.length };
  }

  // ==================== PROFILE & SECURITY UPDATES ====================
  public async updateUserProfile(
    uid: string,
    updates: {
      username?: string;
      fullName?: string;
      surname?: string;
      country?: string;
      photoUrl?: string;
      pin?: string;
      currency?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.getUserById(uid);
    if (!user) return { success: false, error: 'User profile not found.' };

    const now = new Date().toISOString();
    const cleanUpdates: Record<string, any> = { updatedAt: now };

    if (updates.username !== undefined) {
      const uname = updates.username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      if (uname.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters.' };
      }
      if (uname !== user.username) {
        const existing = await getDoc(doc(db, 'usernames', uname));
        if (existing.exists() && (existing.data() as any).uid !== uid) {
          return { success: false, error: 'That username is already in use.' };
        }
        await setDoc(doc(db, 'usernames', uname), {
          uid,
          email: user.email,
          accountNumber: user.accountNumber,
          username: uname,
        });
      }
      cleanUpdates.username = uname;
    }

    if (updates.fullName !== undefined) cleanUpdates.fullName = updates.fullName.trim();
    if (updates.surname !== undefined) cleanUpdates.surname = updates.surname.trim();
    if (updates.country !== undefined) cleanUpdates.country = updates.country;
    if (updates.photoUrl !== undefined) cleanUpdates.photoUrl = updates.photoUrl;
    if (updates.pin !== undefined) cleanUpdates.pin = updates.pin;
    if (updates.currency !== undefined) cleanUpdates.currency = updates.currency;

    try {
      await updateDoc(doc(db, 'users', uid), cleanUpdates);
      if (auth.currentUser && auth.currentUser.uid === uid && (updates.fullName || updates.photoUrl)) {
        await updateProfile(auth.currentUser, {
          displayName: `${updates.fullName || user.fullName} ${updates.surname || user.surname}`,
          ...(updates.photoUrl && updates.photoUrl.startsWith('http') ? { photoURL: updates.photoUrl } : {}),
        }).catch(() => {});
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update profile.' };
    }
  }

  public async updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!auth.currentUser) {
      return { success: false, error: 'You must be signed in to change your password.' };
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      const user = this.getCurrentUser();
      if (user) {
        await this.sendDirectNotification({
          accountNumber: user.accountNumber,
          title: 'Security Password Updated',
          message: 'Your Firebase Authentication login password has been updated.',
          type: 'security',
        });
      }
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        return {
          success: false,
          error: 'For your security, please sign out and sign back in before changing your password.',
        };
      }
      return { success: false, error: err?.message || 'Password update failed.' };
    }
  }

  // ==================== BANKING & PAYMENT INFORMATION ====================
  public async saveBankingPaymentInfo(
    info: Omit<BankingPaymentInfo, 'updatedAt'>
  ): Promise<{ success: boolean; error?: string }> {
    const now = new Date().toISOString();
    // Sanitize: ensure zero CVV or raw card digits can ever enter tokenizedCards
    const safeCards: CardTokenSummary[] = (info.tokenizedCards || []).map((c) => ({
      id: c.id,
      brand: c.brand,
      last4: String(c.last4).replace(/\D/g, '').slice(-4),
      expiryMonth: String(c.expiryMonth).slice(0, 2),
      expiryYear: String(c.expiryYear).slice(0, 4),
      holderName: c.holderName.trim(),
      tokenRef: c.tokenRef,
      createdAt: c.createdAt || now,
    }));

    const payload: BankingPaymentInfo = {
      uid: info.uid,
      accountNumber: info.accountNumber,
      bankAccountName: info.bankAccountName.trim(),
      bankAccountNumber: info.bankAccountNumber.trim(),
      bankName: info.bankName.trim(),
      swiftBicCode: info.swiftBicCode.trim().toUpperCase(),
      bankCountry: info.bankCountry.trim(),
      preferredMethod: info.preferredMethod,
      btcPayoutAddress: info.btcPayoutAddress?.trim() || '',
      usdtPayoutAddress: info.usdtPayoutAddress?.trim() || '',
      tokenizedCards: safeCards,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'banking_info', info.uid), payload, { merge: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to save banking details.' };
    }
  }

  // ==================== DEPOSITS (ATOMIC FIRESTORE TRANSACTIONS) ====================
  public async submitPaymentProof(params: {
    userId: string;
    method: PaymentMethod;
    amount: number;
    txHashOrRef: string;
    proofImageUrl?: string;
    notes?: string;
  }): Promise<{ submission?: PaymentSubmission; deposit?: DepositRecord; error?: string }> {
    const user = this.getUserById(params.userId);
    if (!user) return { error: 'User profile not found.' };
    if (params.amount <= 0 || isNaN(params.amount)) {
      return { error: 'Please enter a valid deposit amount.' };
    }

    const now = new Date().toISOString();
    const depId = `dep_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const walletAddress =
      params.method === 'BTC'
        ? this.settings.btcAddress
        : params.method === 'USDT_ERC20'
        ? this.settings.usdtAddress
        : this.settings.clearingBankAccountNumber || 'GB82 AEGS 2000 0084 9201 84';

    const depositRecord: DepositRecord = {
      id: depId,
      userId: user.uid,
      accountNumber: user.accountNumber,
      userFullName: `${user.fullName} ${user.surname}`,
      userEmail: user.email,
      method: params.method,
      amount: roundMoney(params.amount),
      currency: user.currency || 'USD',
      txHashOrRef: params.txHashOrRef.trim() || `REF-${Date.now().toString(16).toUpperCase()}`,
      walletAddress,
      proofImageUrl: params.proofImageUrl || '',
      notes: params.notes?.trim() || '',
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    const paymentSub: PaymentSubmission = {
      id: depId,
      userId: user.uid,
      accountNumber: user.accountNumber,
      userFullName: `${user.fullName} ${user.surname}`,
      userEmail: user.email,
      method: params.method,
      amount: depositRecord.amount,
      currency: depositRecord.currency,
      txHashOrRef: depositRecord.txHashOrRef,
      walletAddress,
      proofImageUrl: depositRecord.proofImageUrl,
      notes: depositRecord.notes,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    const notif: BankNotification = {
      id: `notif_${Date.now()}`,
      userId: user.uid,
      title: 'Deposit Request Submitted',
      message: `Your deposit of $${depositRecord.amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })} via ${params.method.replace('_', ' ')} is Pending verification. Funds will be credited once approved.`,
      type: 'info',
      read: false,
      relatedId: depId,
      createdAt: now,
    };

    try {
      await setDoc(doc(db, 'deposits', depId), depositRecord);
      await setDoc(doc(db, 'payment_submissions', depId), paymentSub);
      await setDoc(doc(db, 'notifications', notif.id), notif);
      return { submission: paymentSub, deposit: depositRecord };
    } catch (e: any) {
      return { error: e?.message || 'Failed to persist deposit submission.' };
    }
  }

  /**
   * Atomically approve a pending deposit or payment submission exactly once inside runTransaction.
   */
  public async adminApprovePaymentSubmission(
    subId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.adminApproveDeposit(subId, reason);
  }

  public async adminApproveDeposit(
    depositId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const actor = this.getActorMetadata();
    const now = new Date().toISOString();

    try {
      const result = await runTransaction(db, async (tx) => {
        const depRef = doc(db, 'deposits', depositId);
        const subRef = doc(db, 'payment_submissions', depositId);
        const [depSnap, subSnap] = await Promise.all([tx.get(depRef), tx.get(subRef)]);

        const sourceData = (depSnap.exists()
          ? depSnap.data()
          : subSnap.exists()
          ? subSnap.data()
          : null) as DepositRecord | PaymentSubmission | null;

        if (!sourceData) {
          throw new Error('Deposit submission not found.');
        }

        // Strict idempotency guard against duplicate credits / race conditions
        if (sourceData.status !== 'Pending') {
          throw new Error(`Deposit is already marked as ${sourceData.status} and cannot be credited twice.`);
        }

        const userRef = doc(db, 'users', sourceData.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('Target customer profile not found in Firestore.');
        }

        const userData = userSnap.data() as UserProfile;
        const previousBalance = Number(userData.balance || 0);
        const amount = roundMoney(Number(sourceData.amount));
        const newBalance = roundMoney(previousBalance + amount);

        const txId = `tx_dep_${Date.now()}`;
        const bankTx: BankTransaction = {
          id: txId,
          userId: userData.uid,
          accountNumber: userData.accountNumber,
          type: sourceData.method === 'Bank_Wire' ? 'deposit' : 'crypto_payment',
          amount,
          currency: sourceData.currency || 'USD',
          status: 'Completed',
          senderName: `${sourceData.method.replace('_', ' ')} Network Deposit`,
          recipientName: `${userData.fullName} ${userData.surname}`,
          reference: `AGS-DEP-${sourceData.txHashOrRef.slice(0, 8).toUpperCase()}`,
          description: `Approved Deposit (${sourceData.method})${sourceData.notes ? `: ${sourceData.notes}` : ''}`,
          previousBalance,
          balanceAfter: newBalance,
          linkedRecordId: depositId,
          createdAt: now,
          updatedAt: now,
        };

        const notifId = `notif_dep_${Date.now()}`;
        const notif: BankNotification = {
          id: notifId,
          userId: userData.uid,
          title: 'Deposit Approved & Credited',
          message: `Your deposit of $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} (${sourceData.method.replace('_', ' ')}) has been approved and credited to your balance.`,
          type: 'success',
          read: false,
          relatedId: depositId,
          createdAt: now,
        };

        tx.update(userRef, { balance: newBalance, updatedAt: now });
        if (depSnap.exists()) {
          tx.update(depRef, {
            status: 'Approved',
            processedBy: actor.adminEmail,
            processedAt: now,
            reason: reason || 'Verified and approved',
            updatedAt: now,
          });
        }
        if (subSnap.exists()) {
          tx.update(subRef, {
            status: 'Approved',
            processedBy: actor.adminEmail,
            processedAt: now,
            reason: reason || 'Verified and approved',
            updatedAt: now,
          });
        }
        tx.set(doc(db, 'transactions', txId), bankTx);
        tx.set(doc(db, 'notifications', notifId), notif);

        return { userData, amount, previousBalance, newBalance, txId };
      });

      await this.addAuditLog({
        action: 'DEPOSIT_APPROVED',
        affectedUserId: result.userData.uid,
        targetAccount: result.userData.accountNumber,
        transactionId: depositId,
        previousStatus: 'Pending',
        newStatus: 'Approved',
        amount: result.amount,
        reason: reason || 'Deposit verified and approved',
        details: `Approved deposit #${depositId} (+$${result.amount.toFixed(2)}). Balance: $${result.previousBalance.toFixed(2)} -> $${result.newBalance.toFixed(2)}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to approve deposit.' };
    }
  }

  public async adminCancelPaymentSubmission(
    subId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.adminCancelDeposit(subId, reason);
  }

  public async adminCancelDeposit(
    depositId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const actor = this.getActorMetadata();
    const now = new Date().toISOString();
    const cancelReason = reason?.trim() || 'Deposit verification declined by administration.';

    try {
      const res = await runTransaction(db, async (tx) => {
        const depRef = doc(db, 'deposits', depositId);
        const subRef = doc(db, 'payment_submissions', depositId);
        const [depSnap, subSnap] = await Promise.all([tx.get(depRef), tx.get(subRef)]);

        const sourceData = (depSnap.exists()
          ? depSnap.data()
          : subSnap.exists()
          ? subSnap.data()
          : null) as DepositRecord | PaymentSubmission | null;

        if (!sourceData) throw new Error('Deposit record not found.');
        if (sourceData.status !== 'Pending') {
          throw new Error(`Deposit is already ${sourceData.status} and cannot be cancelled.`);
        }

        if (depSnap.exists()) {
          tx.update(depRef, {
            status: 'Cancelled',
            processedBy: actor.adminEmail,
            processedAt: now,
            reason: cancelReason,
            updatedAt: now,
          });
        }
        if (subSnap.exists()) {
          tx.update(subRef, {
            status: 'Cancelled',
            processedBy: actor.adminEmail,
            processedAt: now,
            reason: cancelReason,
            updatedAt: now,
          });
        }

        const notifId = `notif_dep_can_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: sourceData.userId,
          title: 'Deposit Request Cancelled',
          message: `Your deposit request for $${Number(sourceData.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} was marked as Cancelled. Reason: ${cancelReason}. Your account balance remains unchanged.`,
          type: 'warning',
          read: false,
          relatedId: depositId,
          createdAt: now,
        });

        return { sourceData };
      });

      await this.addAuditLog({
        action: 'DEPOSIT_CANCELLED',
        affectedUserId: res.sourceData.userId,
        targetAccount: res.sourceData.accountNumber,
        transactionId: depositId,
        previousStatus: 'Pending',
        newStatus: 'Cancelled',
        amount: Number(res.sourceData.amount),
        reason: cancelReason,
        details: `Cancelled deposit #${depositId} ($${Number(res.sourceData.amount).toFixed(2)}). Balance unaffected.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to cancel deposit.' };
    }
  }

  /**
   * Direct Administrative Deposit Credit (Tier 1 / Authorized Admin) inside runTransaction.
   */
  public async adminDeposit(params: {
    accountNumber: string;
    amount: number;
    senderName: string;
    note?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const user = this.getUserByAccountNumber(params.accountNumber);
    if (!user) return { success: false, error: `Account ${params.accountNumber} not found.` };

    const amount = roundMoney(params.amount);
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: 'Please enter a valid deposit amount greater than zero.' };
    }

    const now = new Date().toISOString();
    const sender = params.senderName.trim() || 'Aegis Treasury Services';
    const actor = this.getActorMetadata();

    try {
      const result = await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Customer record not found.');

        const uData = userSnap.data() as UserProfile;
        const previousBalance = Number(uData.balance || 0);
        const newBalance = roundMoney(previousBalance + amount);

        const txId = `tx_dep_${Date.now()}`;
        const depId = `dep_adm_${Date.now()}`;

        const newTx: BankTransaction = {
          id: txId,
          userId: uData.uid,
          accountNumber: uData.accountNumber,
          type: 'deposit',
          amount,
          currency: uData.currency || 'USD',
          status: 'Completed',
          senderName: sender,
          recipientName: `${uData.fullName} ${uData.surname}`,
          reference: `AGS-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
          description: params.note?.trim() || `Administrative Deposit from ${sender}`,
          previousBalance,
          balanceAfter: newBalance,
          linkedRecordId: depId,
          createdAt: now,
          updatedAt: now,
        };

        const depositDoc: DepositRecord = {
          id: depId,
          userId: uData.uid,
          accountNumber: uData.accountNumber,
          userFullName: `${uData.fullName} ${uData.surname}`,
          userEmail: uData.email,
          method: 'Bank_Wire',
          amount,
          currency: uData.currency || 'USD',
          txHashOrRef: newTx.reference,
          walletAddress: sender,
          notes: newTx.description,
          status: 'Approved',
          processedBy: actor.adminEmail,
          processedAt: now,
          reason: 'Direct administrative custody credit',
          createdAt: now,
          updatedAt: now,
        };

        const notifId = `notif_${Date.now()}`;
        tx.update(userRef, { balance: newBalance, updatedAt: now });
        tx.set(doc(db, 'deposits', depId), depositDoc);
        tx.set(doc(db, 'transactions', txId), newTx);
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: uData.uid,
          title: `Deposit Credited: +$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          message: `Your account has been credited with $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} from ${sender}. Available balance: $${newBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}.`,
          type: 'transaction',
          read: false,
          relatedId: txId,
          createdAt: now,
        });

        return { uData, previousBalance, newBalance, txId };
      });

      await this.addAuditLog({
        action: 'DEPOSIT_CREDITED',
        affectedUserId: result.uData.uid,
        targetAccount: result.uData.accountNumber,
        transactionId: result.txId,
        previousStatus: 'N/A',
        newStatus: 'Completed',
        amount,
        reason: params.note?.trim() || `Direct custody credit from ${sender}`,
        details: `Direct deposit of $${amount.toFixed(2)} credited to ${result.uData.accountNumber}. Balance: $${result.previousBalance.toFixed(2)} -> $${result.newBalance.toFixed(2)}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Administrative deposit failed.' };
    }
  }

  // ==================== WITHDRAWALS (ATOMIC RESERVATION & REFUND ON CANCEL) ====================
  /**
   * Customer submits a withdrawal request: atomically reserves & deducts amount from balance
   * inside runTransaction and writes withdrawals/{id} + transactions/{txId} as Pending.
   */
  public async submitWithdrawal(params: {
    userId: string;
    method: 'bank' | 'crypto';
    amount: number;
    beneficiaryName: string;
    destination: string;
    bankName?: string;
    swiftCode?: string;
    country?: string;
    pin: string;
  }): Promise<{ withdrawal?: WithdrawalRecord; transaction?: BankTransaction; error?: string }> {
    const amount = roundMoney(params.amount);
    if (amount <= 0 || isNaN(amount)) {
      return { error: 'Please enter a valid withdrawal amount.' };
    }

    const now = new Date().toISOString();
    const wId = `wd_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const txId = `tx_wd_${Date.now()}`;

    try {
      const result = await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', params.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Customer account not found.');

        const uData = userSnap.data() as UserProfile;
        if (uData.status === 'suspended') {
          throw new Error('Your account has been suspended. Kindly contact support for more assistance.');
        }
        if (params.pin !== uData.pin) {
          throw new Error('Invalid 4-digit Secure PIN entered.');
        }

        const previousBalance = Number(uData.balance || 0);
        if (amount > previousBalance) {
          throw new Error(
            `Insufficient funds. Available balance: $${previousBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}.`
          );
        }

        const newBalance = roundMoney(previousBalance - amount);

        const withdrawalDoc: WithdrawalRecord = {
          id: wId,
          userId: uData.uid,
          accountNumber: uData.accountNumber,
          userFullName: `${uData.fullName} ${uData.surname}`,
          userEmail: uData.email,
          method: params.method,
          amount,
          currency: uData.currency || 'USD',
          beneficiaryName: params.beneficiaryName.trim() || `${uData.fullName} ${uData.surname}`,
          destination: params.destination.trim(),
          bankName:
            params.bankName?.trim() ||
            (params.method === 'bank' ? 'External Financial Institution' : 'Private Crypto Custody'),
          swiftCode: params.swiftCode?.trim().toUpperCase() || '',
          country: params.country || uData.country,
          status: 'Pending',
          balanceReserved: true,
          reservedAmount: amount,
          linkedTxId: txId,
          createdAt: now,
          updatedAt: now,
        };

        const txDoc: BankTransaction = {
          id: txId,
          userId: uData.uid,
          accountNumber: uData.accountNumber,
          type: 'withdrawal',
          amount,
          currency: uData.currency || 'USD',
          status: 'Pending',
          senderName: `${uData.fullName} ${uData.surname}`,
          senderAccountNumber: uData.accountNumber,
          recipientName: withdrawalDoc.beneficiaryName,
          recipientAccountNumber: withdrawalDoc.destination,
          recipientBank: withdrawalDoc.bankName,
          recipientCountry: withdrawalDoc.country,
          swiftCode: withdrawalDoc.swiftCode,
          reference: `AEG-WD-${Math.floor(100000 + Math.random() * 900000)}`,
          description: `Direct Withdrawal (${params.method === 'bank' ? 'Bank Account' : 'Crypto Wallet'})`,
          previousBalance,
          balanceAfter: newBalance,
          linkedRecordId: wId,
          createdAt: now,
          updatedAt: now,
        };

        const notifId = `notif_wd_${Date.now()}`;
        tx.set(doc(db, 'withdrawals', wId), withdrawalDoc);
        tx.set(doc(db, 'transactions', txId), txDoc);
        tx.update(userRef, {
          balance: newBalance,
          lastBalanceLockId: wId,
          lastBalanceLockType: 'withdrawal',
          updatedAt: now,
        });
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: uData.uid,
          title: 'Withdrawal Request Submitted (Pending)',
          message: `Your withdrawal of $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} has been queued as Pending. The reserved funds will be released upon approval or refunded if cancelled.`,
          type: 'transaction',
          read: false,
          relatedId: wId,
          createdAt: now,
        });

        return { withdrawalDoc, txDoc };
      });

      return { withdrawal: result.withdrawalDoc, transaction: result.txDoc };
    } catch (err: any) {
      return { error: err?.message || 'Withdrawal submission failed.' };
    }
  }

  public async adminApproveWithdrawal(
    withdrawalId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const actor = this.getActorMetadata();
    const now = new Date().toISOString();

    try {
      const result = await runTransaction(db, async (tx) => {
        const wdRef = doc(db, 'withdrawals', withdrawalId);
        const wdSnap = await tx.get(wdRef);
        if (!wdSnap.exists()) throw new Error('Withdrawal record not found.');

        const wd = wdSnap.data() as WithdrawalRecord;
        if (wd.status !== 'Pending') {
          throw new Error(`Withdrawal is already ${wd.status}.`);
        }

        const userRef = doc(db, 'users', wd.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('User record not found.');

        const userData = userSnap.data() as UserProfile;
        const amount = roundMoney(Number(wd.amount));

        // If balance was NOT reserved upon submission (legacy entry), deduct once now
        if (!wd.balanceReserved) {
          if (Number(userData.balance || 0) < amount) {
            throw new Error(`Customer has insufficient balance ($${userData.balance}) for this withdrawal.`);
          }
          tx.update(userRef, {
            balance: roundMoney(Number(userData.balance) - amount),
            updatedAt: now,
          });
        }

        tx.update(wdRef, {
          status: 'Approved',
          processedBy: actor.adminEmail,
          processedAt: now,
          reason: reason?.trim() || 'Withdrawal authorized and disbursed.',
          updatedAt: now,
        });

        if (wd.linkedTxId) {
          const linkedTxRef = doc(db, 'transactions', wd.linkedTxId);
          const linkedTxSnap = await tx.get(linkedTxRef);
          if (linkedTxSnap.exists()) {
            tx.update(linkedTxRef, {
              status: 'Completed',
              reason: reason?.trim() || 'Withdrawal approved',
              updatedAt: now,
            });
          }
        }

        const notifId = `notif_wd_app_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: wd.userId,
          title: 'Withdrawal Approved & Disbursed',
          message: `Your withdrawal request of $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} to ${wd.destination} has been approved and processed.`,
          type: 'success',
          read: false,
          relatedId: wd.id,
          createdAt: now,
        });

        return { wd, amount };
      });

      await this.addAuditLog({
        action: 'WITHDRAWAL_APPROVED',
        affectedUserId: result.wd.userId,
        targetAccount: result.wd.accountNumber,
        transactionId: result.wd.id,
        previousStatus: 'Pending',
        newStatus: 'Approved',
        amount: result.amount,
        reason: reason?.trim() || 'Withdrawal approved for payout',
        details: `Approved withdrawal #${result.wd.id} ($${result.amount.toFixed(2)}) for ${result.wd.accountNumber}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to approve withdrawal.' };
    }
  }

  public async adminCancelWithdrawal(
    withdrawalId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const actor = this.getActorMetadata();
    const now = new Date().toISOString();
    const cancelReason = reason?.trim() || 'Withdrawal cancelled; reserved balance returned.';

    try {
      const result = await runTransaction(db, async (tx) => {
        const wdRef = doc(db, 'withdrawals', withdrawalId);
        const wdSnap = await tx.get(wdRef);
        if (!wdSnap.exists()) throw new Error('Withdrawal record not found.');

        const wd = wdSnap.data() as WithdrawalRecord;
        if (wd.status !== 'Pending') {
          throw new Error(`Withdrawal is already ${wd.status}.`);
        }

        const userRef = doc(db, 'users', wd.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('User record not found.');

        const userData = userSnap.data() as UserProfile;
        const refundAmount = roundMoney(Number(wd.reservedAmount ?? wd.amount));
        const previousBalance = Number(userData.balance || 0);
        const restoredBalance = wd.balanceReserved
          ? roundMoney(previousBalance + refundAmount)
          : previousBalance;

        if (wd.balanceReserved) {
          tx.update(userRef, {
            balance: restoredBalance,
            updatedAt: now,
          });
        }

        tx.update(wdRef, {
          status: 'Cancelled',
          processedBy: actor.adminEmail,
          processedAt: now,
          reason: cancelReason,
          updatedAt: now,
        });

        if (wd.linkedTxId) {
          const linkedTxRef = doc(db, 'transactions', wd.linkedTxId);
          const linkedTxSnap = await tx.get(linkedTxRef);
          if (linkedTxSnap.exists()) {
            tx.update(linkedTxRef, {
              status: 'Reversed',
              reason: cancelReason,
              balanceAfter: restoredBalance,
              updatedAt: now,
            });
          }
        }

        const notifId = `notif_wd_can_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: wd.userId,
          title: 'Withdrawal Cancelled & Funds Refunded',
          message: `Your withdrawal of $${refundAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} was cancelled (${cancelReason}). The exact amount has been returned to your available balance ($${restoredBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}).`,
          type: 'warning',
          read: false,
          relatedId: wd.id,
          createdAt: now,
        });

        return { wd, refundAmount, previousBalance, restoredBalance };
      });

      await this.addAuditLog({
        action: 'WITHDRAWAL_CANCELLED',
        affectedUserId: result.wd.userId,
        targetAccount: result.wd.accountNumber,
        transactionId: result.wd.id,
        previousStatus: 'Pending',
        newStatus: 'Cancelled',
        amount: result.refundAmount,
        reason: cancelReason,
        details: `Cancelled withdrawal #${result.wd.id} and refunded $${result.refundAmount.toFixed(2)}. Balance: $${result.previousBalance.toFixed(2)} -> $${result.restoredBalance.toFixed(2)}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to cancel withdrawal.' };
    }
  }

  // ==================== TRANSFERS & TRANSACTIONS (ATOMIC) ====================
  public async initiateTransfer(params: {
    userId: string;
    amount: number;
    recipientName: string;
    recipientAccountNumber: string;
    recipientBank: string;
    recipientCountry: string;
    swiftCode: string;
    verificationCode: string;
    description?: string;
  }): Promise<{ transaction?: BankTransaction; error?: string }> {
    const user = this.users.find((u) => u.uid === params.userId);
    if (!user) return { error: 'User session not found.' };

    if (user.status === 'suspended') {
      return { error: 'Your account has been suspended. Kindly contact support for more assistance.' };
    }

    const amount = roundMoney(params.amount);
    if (amount <= 0 || isNaN(amount)) {
      return { error: 'Please enter a valid transfer amount.' };
    }

    if (amount > user.balance) {
      return {
        error: `Insufficient funds. Your available balance is $${user.balance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}.`,
      };
    }

    const dailyLimit =
      user.tier === 'Tier 1'
        ? this.settings.tier1DailyLimit
        : user.tier === 'Tier 2'
        ? this.settings.tier2DailyLimit
        : this.settings.tier3DailyLimit;

    if (amount > dailyLimit) {
      return {
        error: `Transfer amount exceeds your ${user.tier} daily limit of $${dailyLimit.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}.`,
      };
    }

    if (this.settings.requireSwiftCode) {
      if (!user.swiftVerificationCode || params.verificationCode.trim() !== user.swiftVerificationCode) {
        return { error: 'Invalid credentials. Kindly request for your Swift Code.' };
      }
    }

    const now = new Date().toISOString();
    const txId = `tx_tr_${Date.now()}`;
    const newTx: BankTransaction = {
      id: txId,
      userId: user.uid,
      accountNumber: user.accountNumber,
      type: 'transfer',
      amount,
      currency: user.currency || 'USD',
      status: 'Pending',
      senderName: `${user.fullName} ${user.surname}`,
      senderAccountNumber: user.accountNumber,
      recipientName: params.recipientName.trim(),
      recipientAccountNumber: params.recipientAccountNumber.trim(),
      recipientBank: params.recipientBank,
      recipientCountry: params.recipientCountry,
      swiftCode: params.swiftCode.trim().toUpperCase(),
      reference: `AEG-TX-${Math.floor(100000 + Math.random() * 900000)}`,
      description:
        params.description?.trim() ||
        `International Transfer to ${params.recipientName} (${params.recipientBank})`,
      createdAt: now,
      updatedAt: now,
      fee: 0,
    };

    const notif: BankNotification = {
      id: `notif_${Date.now()}`,
      userId: user.uid,
      title: 'Transfer Submitted (Pending Review)',
      message: `Your transfer of $${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })} to ${params.recipientName} has been submitted and is awaiting administrator clearance.`,
      type: 'transaction',
      read: false,
      relatedId: txId,
      createdAt: now,
    };

    try {
      await setDoc(doc(db, 'transactions', txId), newTx);
      await setDoc(doc(db, 'notifications', notif.id), notif);
      return { transaction: newTx };
    } catch (e: any) {
      return { error: e?.message || 'Failed to submit transfer.' };
    }
  }

  public async adminApproveTransaction(
    txId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    // Check if linked to a withdrawal record
    const linkedWd = this.withdrawals.find((w) => w.linkedTxId === txId);
    if (linkedWd) {
      return this.adminApproveWithdrawal(linkedWd.id, reason);
    }

    const now = new Date().toISOString();
    try {
      const result = await runTransaction(db, async (tx) => {
        const txRef = doc(db, 'transactions', txId);
        const txSnap = await tx.get(txRef);
        if (!txSnap.exists()) throw new Error('Transaction record not found.');

        const txData = txSnap.data() as BankTransaction;
        if (txData.status !== 'Pending') {
          throw new Error(`Transaction is already ${txData.status}.`);
        }

        const userRef = doc(db, 'users', txData.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Customer record not found.');

        const userData = userSnap.data() as UserProfile;
        const previousBalance = Number(userData.balance || 0);
        const amount = roundMoney(Number(txData.amount));
        let newBalance = previousBalance;

        if (txData.type === 'transfer' || txData.type === 'withdrawal') {
          if (previousBalance < amount) {
            throw new Error(`Customer has insufficient balance ($${previousBalance.toFixed(2)}) for this debit.`);
          }
          newBalance = roundMoney(previousBalance - amount);
        } else if (txData.type === 'deposit' || txData.type === 'crypto_payment') {
          newBalance = roundMoney(previousBalance + amount);
        }

        tx.update(userRef, { balance: newBalance, updatedAt: now });
        tx.update(txRef, {
          status: 'Completed',
          previousBalance,
          balanceAfter: newBalance,
          reason: reason || 'Approved by clearing desk',
          updatedAt: now,
        });

        const notifId = `notif_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: userData.uid,
          title: 'Transaction Approved & Completed',
          message: `Your ${txData.type} of $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} (Ref: ${txData.reference}) has been approved and completed.`,
          type: 'success',
          read: false,
          relatedId: txData.id,
          createdAt: now,
        });

        return { txData, userData, amount, previousBalance, newBalance };
      });

      await this.addAuditLog({
        action: 'TRANSACTION_APPROVED',
        affectedUserId: result.userData.uid,
        targetAccount: result.userData.accountNumber,
        transactionId: txId,
        previousStatus: 'Pending',
        newStatus: 'Completed',
        amount: result.amount,
        reason: reason || 'Cleared by administration',
        details: `Approved ${result.txData.type} ${result.txData.reference} ($${result.amount.toFixed(2)}). Balance: $${result.previousBalance.toFixed(2)} -> $${result.newBalance.toFixed(2)}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to approve transaction.' };
    }
  }

  public async adminCancelTransaction(
    txId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const linkedWd = this.withdrawals.find((w) => w.linkedTxId === txId);
    if (linkedWd) {
      return this.adminCancelWithdrawal(linkedWd.id, reason);
    }

    const now = new Date().toISOString();
    const cancelReason = reason?.trim() || 'Administrative review cancellation.';

    try {
      const result = await runTransaction(db, async (tx) => {
        const txRef = doc(db, 'transactions', txId);
        const txSnap = await tx.get(txRef);
        if (!txSnap.exists()) throw new Error('Transaction not found.');

        const txData = txSnap.data() as BankTransaction;
        if (txData.status === 'Reversed' || txData.status === 'Cancelled') {
          throw new Error(`Transaction is already ${txData.status}.`);
        }

        const userRef = doc(db, 'users', txData.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Customer record not found.');

        const userData = userSnap.data() as UserProfile;
        const previousBalance = Number(userData.balance || 0);
        const amount = roundMoney(Number(txData.amount));
        let restoredBalance = previousBalance;

        if (txData.status === 'Completed' && (txData.type === 'transfer' || txData.type === 'withdrawal')) {
          restoredBalance = roundMoney(previousBalance + amount);
        } else if (txData.status === 'Completed' && txData.type === 'deposit') {
          restoredBalance = Math.max(0, roundMoney(previousBalance - amount));
        }

        if (restoredBalance !== previousBalance) {
          tx.update(userRef, { balance: restoredBalance, updatedAt: now });
        }

        tx.update(txRef, {
          status: 'Reversed',
          balanceAfter: restoredBalance,
          reason: cancelReason,
          updatedAt: now,
        });

        const notifId = `notif_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: userData.uid,
          title: 'Transaction Cancelled & Reversed',
          message: `Transaction ${txData.reference} for $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} has been reversed. Reason: ${cancelReason}. Available balance: $${restoredBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}.`,
          type: 'warning',
          read: false,
          relatedId: txData.id,
          createdAt: now,
        });

        return { txData, userData, amount, previousStatus: txData.status, previousBalance, restoredBalance };
      });

      await this.addAuditLog({
        action: 'TRANSACTION_REVERSED',
        affectedUserId: result.userData.uid,
        targetAccount: result.userData.accountNumber,
        transactionId: txId,
        previousStatus: result.previousStatus,
        newStatus: 'Reversed',
        amount: result.amount,
        reason: cancelReason,
        details: `Reversed ${result.txData.reference} ($${result.amount.toFixed(2)}). Balance: $${result.previousBalance.toFixed(2)} -> $${result.restoredBalance.toFixed(2)}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reverse transaction.' };
    }
  }

  // ==================== INVESTMENTS (CUSTOMER + TIER 1 PLAN MANAGEMENT) ====================
  public async createInvestmentPlan(
    plan: Omit<InvestmentPlan, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isTier1Admin()) {
      return { success: false, error: 'Only Tier 1 Super Administrators can create investment plans.' };
    }

    const now = new Date().toISOString();
    const actor = this.getActorMetadata();
    const id = `plan_${Date.now()}`;
    const newPlan: InvestmentPlan = {
      ...plan,
      id,
      createdBy: actor.adminEmail,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'investment_plans', id), newPlan);
      await this.addAuditLog({
        action: 'INVESTMENT_PLAN_CREATED',
        transactionId: id,
        newStatus: plan.active ? 'Active' : 'Inactive',
        reason: `Created plan ${plan.name} (${plan.roiPercent}% ROI / ${plan.durationDays}d)`,
        details: `Tier 1 admin created investment plan "${plan.name}" ($${plan.minAmount}–$${plan.maxAmount}, ${plan.roiPercent}% ROI over ${plan.durationDays} days).`,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create investment plan.' };
    }
  }

  public async updateInvestmentPlan(
    planId: string,
    updates: Partial<InvestmentPlan>
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isTier1Admin()) {
      return { success: false, error: 'Only Tier 1 Super Administrators can modify investment plans.' };
    }

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'investment_plans', planId), {
        ...updates,
        updatedAt: now,
      });
      await this.addAuditLog({
        action: 'INVESTMENT_PLAN_UPDATED',
        transactionId: planId,
        reason: `Updated plan settings`,
        details: `Tier 1 admin updated investment plan #${planId}.`,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update investment plan.' };
    }
  }

  public async subscribeToInvestmentPlan(
    userId: string,
    planId: string,
    amountInput: number
  ): Promise<{ investment?: UserInvestment; error?: string }> {
    const amount = roundMoney(amountInput);
    if (amount <= 0 || isNaN(amount)) {
      return { error: 'Enter a valid investment amount.' };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const invId = `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const txId = `tx_inv_${Date.now()}`;

    try {
      const res = await runTransaction(db, async (tx) => {
        const [planSnap, userSnap] = await Promise.all([
          tx.get(doc(db, 'investment_plans', planId)),
          tx.get(doc(db, 'users', userId)),
        ]);

        if (!planSnap.exists()) throw new Error('Investment plan not found.');
        if (!userSnap.exists()) throw new Error('Customer account not found.');

        const plan = planSnap.data() as InvestmentPlan;
        const user = userSnap.data() as UserProfile;

        if (!plan.active) throw new Error('This investment plan is currently inactive.');
        if (user.status === 'suspended') throw new Error('Account suspended.');
        if (amount < plan.minAmount || amount > plan.maxAmount) {
          throw new Error(
            `Investment amount must be between $${plan.minAmount.toLocaleString()} and $${plan.maxAmount.toLocaleString()}.`
          );
        }

        const prevBal = Number(user.balance || 0);
        if (prevBal < amount) {
          throw new Error(`Insufficient balance ($${prevBal.toFixed(2)}) for this allocation.`);
        }

        const newBal = roundMoney(prevBal - amount);
        const expectedReturn = roundMoney(amount + amount * (plan.roiPercent / 100));
        const maturityDate = new Date(
          now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
        ).toISOString();

        const inv: UserInvestment = {
          id: invId,
          userId: user.uid,
          accountNumber: user.accountNumber,
          userEmail: user.email,
          userName: `${user.fullName} ${user.surname}`,
          planId: plan.id,
          planName: plan.name,
          amount,
          roiPercent: plan.roiPercent,
          expectedReturn,
          durationDays: plan.durationDays,
          status: 'Active',
          startDate: nowIso,
          maturityDate,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        const txDoc: BankTransaction = {
          id: txId,
          userId: user.uid,
          accountNumber: user.accountNumber,
          type: 'investment',
          amount,
          currency: user.currency || 'USD',
          status: 'Completed',
          senderName: `${user.fullName} ${user.surname}`,
          recipientName: `${plan.name} Vault`,
          reference: `AEG-INV-${Math.floor(100000 + Math.random() * 900000)}`,
          description: `Investment subscription: ${plan.name} (${plan.roiPercent}% ROI)`,
          previousBalance: prevBal,
          balanceAfter: newBal,
          linkedRecordId: invId,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        const notifId = `notif_inv_${Date.now()}`;
        tx.set(doc(db, 'investments', invId), inv);
        tx.set(doc(db, 'transactions', txId), txDoc);
        tx.update(doc(db, 'users', user.uid), {
          balance: newBal,
          lastBalanceLockId: invId,
          lastBalanceLockType: 'investment',
          updatedAt: nowIso,
        });
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: user.uid,
          title: `Investment Active: ${plan.name}`,
          message: `Allocated $${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} to ${plan.name}. Projected maturity payout: $${expectedReturn.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}.`,
          type: 'success',
          read: false,
          relatedId: invId,
          createdAt: nowIso,
        });

        return inv;
      });

      return { investment: res };
    } catch (err: any) {
      return { error: err?.message || 'Failed to subscribe to investment plan.' };
    }
  }

  public async adminSettleInvestment(
    investmentId: string,
    action: 'Complete' | 'Cancel',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const now = new Date().toISOString();
    try {
      const res = await runTransaction(db, async (tx) => {
        const invRef = doc(db, 'investments', investmentId);
        const invSnap = await tx.get(invRef);
        if (!invSnap.exists()) throw new Error('Investment record not found.');

        const inv = invSnap.data() as UserInvestment;
        if (inv.status !== 'Active') {
          throw new Error(`Investment is already ${inv.status}.`);
        }

        const userRef = doc(db, 'users', inv.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('User not found.');

        const user = userSnap.data() as UserProfile;
        const prevBal = Number(user.balance || 0);
        const payout = action === 'Complete' ? roundMoney(inv.expectedReturn) : roundMoney(inv.amount);
        const newBal = roundMoney(prevBal + payout);
        const newStatus = action === 'Complete' ? 'Completed' : 'Cancelled';

        const txId = `tx_inv_out_${Date.now()}`;
        tx.update(userRef, { balance: newBal, updatedAt: now });
        tx.update(invRef, { status: newStatus, settledAt: now, updatedAt: now });
        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: user.uid,
          accountNumber: user.accountNumber,
          type: 'investment_payout',
          amount: payout,
          currency: user.currency || 'USD',
          status: 'Completed',
          senderName: `${inv.planName} Treasury`,
          recipientName: `${user.fullName} ${user.surname}`,
          reference: `AEG-ROI-${Math.floor(100000 + Math.random() * 900000)}`,
          description:
            action === 'Complete'
              ? `Investment matured payout: ${inv.planName}`
              : `Investment principal refunded: ${inv.planName}`,
          previousBalance: prevBal,
          balanceAfter: newBal,
          linkedRecordId: inv.id,
          createdAt: now,
          updatedAt: now,
        });

        const notifId = `notif_inv_set_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: user.uid,
          title:
            action === 'Complete'
              ? `Investment Matured: +$${payout.toLocaleString()}`
              : 'Investment Cancelled & Principal Returned',
          message:
            action === 'Complete'
              ? `Your ${inv.planName} position has matured and $${payout.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })} has been credited to your balance.`
              : `Your ${inv.planName} position was cancelled and $${payout.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })} was refunded to your balance.`,
          type: 'success',
          read: false,
          relatedId: inv.id,
          createdAt: now,
        });

        return { inv, user, payout, newStatus };
      });

      await this.addAuditLog({
        action: 'INVESTMENT_SETTLED',
        affectedUserId: res.user.uid,
        targetAccount: res.user.accountNumber,
        transactionId: investmentId,
        previousStatus: 'Active',
        newStatus: res.newStatus,
        amount: res.payout,
        reason: reason || `Investment ${res.newStatus}`,
        details: `Settled investment #${investmentId} (${res.inv.planName}) as ${res.newStatus} with $${res.payout.toFixed(2)} credited.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to settle investment.' };
    }
  }

  // ==================== REFERRAL CREDITING ====================
  public async adminCreditReferral(
    referralId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const now = new Date().toISOString();
    try {
      const res = await runTransaction(db, async (tx) => {
        const refRef = doc(db, 'referrals', referralId);
        const refSnap = await tx.get(refRef);
        if (!refSnap.exists()) throw new Error('Referral record not found.');

        const ref = refSnap.data() as ReferralRecord;
        if (ref.status !== 'Pending') {
          throw new Error(`Referral bonus is already ${ref.status}.`);
        }

        const userRef = doc(db, 'users', ref.referrerUid);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Referrer profile not found.');

        const referrer = userSnap.data() as UserProfile;
        const reward = roundMoney(Number(ref.rewardAmount || 100));
        const prevBal = Number(referrer.balance || 0);
        const newBal = roundMoney(prevBal + reward);

        tx.update(userRef, { balance: newBal, updatedAt: now });
        tx.update(refRef, { status: 'Credited', updatedAt: now });

        const txId = `tx_ref_${Date.now()}`;
        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: referrer.uid,
          accountNumber: referrer.accountNumber,
          type: 'referral_bonus',
          amount: reward,
          currency: referrer.currency || 'USD',
          status: 'Completed',
          senderName: 'Aegis Referral Program',
          recipientName: `${referrer.fullName} ${referrer.surname}`,
          reference: `AEG-REF-${Math.floor(100000 + Math.random() * 900000)}`,
          description: `Referral reward for inviting ${ref.referredName}`,
          previousBalance: prevBal,
          balanceAfter: newBal,
          linkedRecordId: ref.id,
          createdAt: now,
          updatedAt: now,
        });

        const notifId = `notif_ref_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: referrer.uid,
          title: `Referral Bonus Credited: +$${reward.toFixed(2)}`,
          message: `You earned a $${reward.toFixed(2)} referral bonus for inviting ${ref.referredName}.`,
          type: 'success',
          read: false,
          relatedId: ref.id,
          createdAt: now,
        });

        return { ref, referrer, reward };
      });

      await this.addAuditLog({
        action: 'REFERRAL_REWARD_CREDITED',
        affectedUserId: res.referrer.uid,
        targetAccount: res.referrer.accountNumber,
        transactionId: referralId,
        previousStatus: 'Pending',
        newStatus: 'Credited',
        amount: res.reward,
        reason: reason || 'Referral bonus approved',
        details: `Credited $${res.reward.toFixed(2)} referral bonus to ${res.referrer.accountNumber}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to credit referral.' };
    }
  }

  // ==================== TWO-TIER ADMIN MANAGEMENT (TIER 1 ONLY) ====================
  public async createTier2Admin(params: {
    targetAccountOrEmail: string;
    reason?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.isTier1Admin()) {
      return {
        success: false,
        error: 'Access Denied: Only Tier 1 Super Administrators can appoint Tier 2 Administrators.',
      };
    }

    const q = params.targetAccountOrEmail.trim().toLowerCase();
    const targetUser = this.users.find(
      (u) => u.email.toLowerCase() === q || u.accountNumber === q
    );

    if (!targetUser) {
      return {
        success: false,
        error: 'Customer account not found. The target user must first register an account.',
      };
    }

    if (PRIMARY_SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return { success: false, error: 'Cannot downgrade a Primary Tier 1 Super Administrator.' };
    }

    const now = new Date().toISOString();
    const actor = this.getActorMetadata();
    const adminRec: AdminRoleRecord = {
      uid: targetUser.uid,
      email: targetUser.email,
      username: targetUser.username || targetUser.email.split('@')[0],
      fullName: `${targetUser.fullName} ${targetUser.surname}`,
      tier: 'tier2',
      status: 'active',
      createdBy: actor.adminEmail,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'admins', targetUser.uid), adminRec);
      await updateDoc(doc(db, 'users', targetUser.uid), {
        role: 'admin',
        adminTier: 'tier2',
        updatedAt: now,
      });

      await this.addAuditLog({
        action: 'ADMIN_TIER2_CREATED',
        affectedUserId: targetUser.uid,
        targetAccount: targetUser.accountNumber,
        previousStatus: targetUser.adminTier || 'user',
        newStatus: 'tier2',
        reason: params.reason || 'Appointed Tier 2 Operations Administrator',
        details: `Tier 1 Super Admin granted Tier 2 Operations Administrator privileges to ${targetUser.email}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create Tier 2 administrator.' };
    }
  }

  public async updateAdminStatus(
    adminUid: string,
    status: 'active' | 'revoked',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isTier1Admin()) {
      return {
        success: false,
        error: 'Access Denied: Only Tier 1 Super Administrators can modify administrator permissions.',
      };
    }

    const targetAdmin = this.admins.find((a) => a.uid === adminUid);
    if (!targetAdmin) return { success: false, error: 'Administrator record not found.' };

    if (
      targetAdmin.tier === 'tier1' ||
      PRIMARY_SUPER_ADMIN_EMAILS.includes(targetAdmin.email.toLowerCase())
    ) {
      return { success: false, error: 'Tier 1 Super Administrator privileges cannot be modified or revoked here.' };
    }

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'admins', adminUid), { status, updatedAt: now });
      await updateDoc(doc(db, 'users', adminUid), {
        role: status === 'active' ? 'admin' : 'user',
        adminTier: status === 'active' ? 'tier2' : null,
        updatedAt: now,
      }).catch(() => {});

      await this.addAuditLog({
        action: 'ADMIN_ACCESS_REVOKED',
        affectedUserId: adminUid,
        previousStatus: targetAdmin.status,
        newStatus: status,
        reason: reason || `Tier 2 admin status changed to ${status}`,
        details: `Tier 1 admin changed ${targetAdmin.email} (Tier 2) status from ${targetAdmin.status} to ${status}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update admin status.' };
    }
  }

  // ==================== ACCOUNT SUSPENSION & TIER VERIFICATION ====================
  public async adminToggleUserSuspension(
    accountNumber: string,
    reason?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }
    const user = this.getUserByAccountNumber(accountNumber);
    if (!user) return { success: false, error: `Customer account ${accountNumber} not found.` };

    const prevStatus = user.status;
    const newStatus = prevStatus === 'suspended' ? 'active' : 'suspended';
    const now = new Date().toISOString();
    const actionReason =
      reason?.trim() ||
      (newStatus === 'suspended'
        ? 'Administrative compliance restriction'
        : 'Administrative security clearance restored');

    try {
      await updateDoc(doc(db, 'users', user.uid), { status: newStatus, updatedAt: now });
      await setDoc(doc(db, 'notifications', `notif_status_${Date.now()}`), {
        id: `notif_status_${Date.now()}`,
        userId: user.uid,
        title: newStatus === 'suspended' ? 'Account Security Suspension' : 'Account Reactivated',
        message:
          newStatus === 'suspended'
            ? actionReason
            : 'Your account restrictions have been cleared. Full transaction access is restored.',
        type: newStatus === 'suspended' ? 'security' : 'success',
        read: false,
        createdAt: now,
      });

      await this.addAuditLog({
        action: newStatus === 'suspended' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_REACTIVATED',
        affectedUserId: user.uid,
        targetAccount: user.accountNumber,
        previousStatus: prevStatus,
        newStatus,
        reason: actionReason,
        details: `Account ${user.accountNumber} (${user.email}) status changed from ${prevStatus} to ${newStatus}.`,
      });

      return { success: true, user: { ...user, status: newStatus, updatedAt: now } };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update account status.' };
    }
  }

  public async toggleUserSuspension(
    userId: string,
    newStatus: 'active' | 'suspended'
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found.' };
    if (user.status === newStatus) return { success: true };
    return this.adminToggleUserSuspension(user.accountNumber);
  }

  public async submitTierUpgrade(params: {
    userId: string;
    targetTier: 'Tier 2' | 'Tier 3';
    verificationType: 'facial' | 'government_id';
    mediaUrl: string;
    documentType?: string;
    documentNumber?: string;
    notes?: string;
  }): Promise<{ request?: VerificationRequest; error?: string }> {
    const user = this.getUserById(params.userId);
    if (!user) return { error: 'User profile not found.' };

    const fee =
      params.targetTier === 'Tier 2'
        ? this.settings.tier2UpgradeFee
        : this.settings.tier3UpgradeFee;
    const now = new Date().toISOString();
    const reqId = `verif_${Date.now()}`;

    const newReq: VerificationRequest = {
      id: reqId,
      userId: user.uid,
      accountNumber: user.accountNumber,
      fullName: `${user.fullName} ${user.surname}`,
      targetTier: params.targetTier,
      verificationType: params.verificationType,
      documentType:
        params.documentType ||
        (params.verificationType === 'facial' ? 'Biometric Facial Photo' : 'Passport / Gov ID'),
      documentNumber:
        params.documentNumber || `ID-${Math.floor(1000000 + Math.random() * 9000000)}`,
      mediaUrl: params.mediaUrl,
      feePaid: fee,
      status: 'Pending Review',
      notes: params.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'verification_requests', reqId), newReq);
      await setDoc(doc(db, 'notifications', `notif_${Date.now()}`), {
        id: `notif_${Date.now()}`,
        userId: user.uid,
        title: `${params.targetTier} Verification Submitted`,
        message: `Your ${params.targetTier} verification submission is Pending Review by compliance.`,
        type: 'verification',
        read: false,
        relatedId: reqId,
        createdAt: now,
      });
      return { request: newReq };
    } catch (e: any) {
      return { error: e?.message || 'Verification submission failed.' };
    }
  }

  public async adminApproveTierUpgrade(
    requestId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const now = new Date().toISOString();
    try {
      const res = await runTransaction(db, async (tx) => {
        const reqRef = doc(db, 'verification_requests', requestId);
        const reqSnap = await tx.get(reqRef);
        if (!reqSnap.exists()) throw new Error('Verification request not found.');

        const req = reqSnap.data() as VerificationRequest;
        if (req.status !== 'Pending Review') {
          throw new Error(`Verification request is already ${req.status}.`);
        }

        const userRef = doc(db, 'users', req.userId);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('User not found.');
        const user = userSnap.data() as UserProfile;

        tx.update(reqRef, { status: 'Approved', updatedAt: now });
        tx.update(userRef, { tier: req.targetTier, updatedAt: now });
        const notifId = `notif_${Date.now()}`;
        tx.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: user.uid,
          title: `Account Upgraded to ${req.targetTier}`,
          message: `Your identity verification has been approved and your account upgraded to ${req.targetTier}.`,
          type: 'success',
          read: false,
          relatedId: req.id,
          createdAt: now,
        });

        return { req, prevTier: user.tier };
      });

      await this.addAuditLog({
        action: 'TIER_UPGRADE_APPROVED',
        affectedUserId: res.req.userId,
        targetAccount: res.req.accountNumber,
        transactionId: requestId,
        previousStatus: res.prevTier,
        newStatus: res.req.targetTier,
        reason: 'Biometric / KYC verification approved',
        details: `Upgraded ${res.req.accountNumber} from ${res.prevTier} to ${res.req.targetTier}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to approve verification.' };
    }
  }

  public async adminRejectTierUpgrade(
    requestId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }

    const req = this.verificationRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Verification request not found.' };

    const now = new Date().toISOString();
    const rejectReason = reason?.trim() || 'Document clarity verification failed.';

    try {
      await updateDoc(doc(db, 'verification_requests', requestId), {
        status: 'Rejected',
        notes: rejectReason,
        updatedAt: now,
      });
      await setDoc(doc(db, 'notifications', `notif_${Date.now()}`), {
        id: `notif_${Date.now()}`,
        userId: req.userId,
        title: `${req.targetTier} Verification Rejected`,
        message: `Your verification submission was declined. Reason: ${rejectReason}.`,
        type: 'warning',
        read: false,
        relatedId: req.id,
        createdAt: now,
      });

      await this.addAuditLog({
        action: 'TIER_UPGRADE_REJECTED',
        affectedUserId: req.userId,
        targetAccount: req.accountNumber,
        transactionId: requestId,
        previousStatus: req.status,
        newStatus: 'Rejected',
        reason: rejectReason,
        details: `Rejected ${req.targetTier} KYC request for ${req.accountNumber}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reject verification.' };
    }
  }

  public async adminSetUserTier(
    accountNumber: string,
    tier: AccountTier
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }
    const user = this.getUserByAccountNumber(accountNumber);
    if (!user) return { success: false, error: 'Account not found.' };

    const prevTier = user.tier;
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'users', user.uid), { tier, updatedAt: now });
      await setDoc(doc(db, 'notifications', `notif_${Date.now()}`), {
        id: `notif_${Date.now()}`,
        userId: user.uid,
        title: `Account Tier Updated to ${tier}`,
        message: `Your account tier has been updated to ${tier}.`,
        type: 'info',
        read: false,
        createdAt: now,
      });

      await this.addAuditLog({
        action: 'TIER_UPDATED',
        affectedUserId: user.uid,
        targetAccount: user.accountNumber,
        previousStatus: prevTier,
        newStatus: tier,
        reason: 'Manual tier adjustment',
        details: `Updated ${user.accountNumber} tier from ${prevTier} to ${tier}.`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update tier.' };
    }
  }

  // ==================== CRITICAL FINANCIAL SETTINGS (TIER 1 ONLY) ====================
  public async updateFinancialSettings(
    updated: Partial<FinancialSettings>
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isTier1Admin()) {
      return {
        success: false,
        error: 'Access Denied: Only Tier 1 Super Administrators can alter critical financial and banking settings.',
      };
    }

    const nextSettings: FinancialSettings = {
      ...this.settings,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'settings', 'financial'), nextSettings, { merge: true });
      await this.addAuditLog({
        action: 'SETTINGS_UPDATED',
        reason: 'Tier 1 updated global financial & banking parameters',
        details: 'Global limits, fees, crypto wallets, and clearing bank coordinates updated.',
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save financial settings.' };
    }
  }

  public async updateCryptoSettings(params: {
    btcAddress: string;
    usdtAddress: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.updateFinancialSettings({
      btcAddress: params.btcAddress.trim(),
      usdtAddress: params.usdtAddress.trim(),
    });
  }

  // ==================== NOTIFICATIONS ====================
  public async sendDirectNotification(params: {
    accountNumber: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'security';
  }): Promise<{ success: boolean; error?: string }> {
    const user = this.getUserByAccountNumber(params.accountNumber);
    if (!user) return { success: false, error: `Account ${params.accountNumber} not found.` };

    const notif: BankNotification = {
      id: `notif_${Date.now()}`,
      userId: user.uid,
      title: params.title.trim(),
      message: params.message.trim(),
      type: params.type || 'info',
      read: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
      if (this.isCurrentUserAdmin()) {
        await this.addAuditLog({
          action: 'NOTIFICATION_DISPATCHED',
          affectedUserId: user.uid,
          targetAccount: user.accountNumber,
          reason: notif.title,
          details: `Dispatched direct notification "${notif.title}" to ${user.accountNumber}.`,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to dispatch notification.' };
    }
  }

  public async markNotificationAsRead(notifId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (e) {
      console.warn('Mark notification read warning:', e);
    }
  }

  public async clearUserNotifications(userId: string) {
    const unread = this.notifications.filter((n) => n.userId === userId && !n.read);
    await Promise.all(
      unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {}))
    );
  }

  // ==================== SWIFT REQUESTS ====================
  public async submitSwiftRequest(params: {
    userId: string;
    paymentMethod: PaymentMethod;
    txHashOrRef: string;
    proofImageUrl?: string;
    adminNotes?: string;
  }): Promise<SwiftRequest> {
    const user = this.getUserById(params.userId);
    if (!user) throw new Error('User not found');

    const now = new Date().toISOString();
    const req: SwiftRequest = {
      id: `sw_${Date.now()}`,
      userId: user.uid,
      accountNumber: user.accountNumber,
      fullName: `${user.fullName} ${user.surname}`,
      email: user.email,
      amount: 2500.0,
      paymentMethod: params.paymentMethod,
      txHashOrRef: params.txHashOrRef,
      proofImageUrl: params.proofImageUrl || '',
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      adminNotes: params.adminNotes || '',
    };

    await setDoc(doc(db, 'swift_requests', req.id), req);
    return req;
  }

  public async approveSwiftRequest(
    requestId: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }
    const req = this.swiftRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const code = generate4DigitCode();
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'users', req.userId), {
        swiftVerificationCode: code,
        swiftVerified: true,
        updatedAt: now,
      });
      await updateDoc(doc(db, 'swift_requests', req.id), {
        status: 'Approved',
        assignedCode: code,
        updatedAt: now,
      });
      await setDoc(doc(db, 'notifications', `notif_swift_${Date.now()}`), {
        id: `notif_swift_${Date.now()}`,
        userId: req.userId,
        title: 'SWIFT Authorization Code Issued',
        message: `Your 4-digit transfer authorization code is ${code}.`,
        type: 'verification',
        read: false,
        createdAt: now,
      });

      await this.addAuditLog({
        action: 'SWIFT_CODE_APPROVED',
        affectedUserId: req.userId,
        targetAccount: req.accountNumber,
        transactionId: requestId,
        previousStatus: req.status,
        newStatus: 'Approved',
        reason: 'SWIFT clearance approved',
        details: `Issued 4-digit SWIFT authorization code to ${req.accountNumber}.`,
      });
      return { success: true, code };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to approve SWIFT request.' };
    }
  }

  public async rejectSwiftRequest(
    requestId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isCurrentUserAdmin()) {
      return { success: false, error: 'Administrator clearance required.' };
    }
    const req = this.swiftRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const now = new Date().toISOString();
    const rejectReason = reason || 'Verification declined.';
    try {
      await updateDoc(doc(db, 'swift_requests', req.id), {
        status: 'Rejected',
        adminNotes: rejectReason,
        updatedAt: now,
      });
      await this.addAuditLog({
        action: 'SWIFT_CODE_REJECTED',
        affectedUserId: req.userId,
        targetAccount: req.accountNumber,
        transactionId: requestId,
        previousStatus: req.status,
        newStatus: 'Rejected',
        reason: rejectReason,
        details: `Rejected SWIFT request for ${req.accountNumber}.`,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reject SWIFT request.' };
    }
  }

  // ==================== VIRTUAL CARD MANAGEMENT ====================
  public async issueVirtualCard(
    userId: string
  ): Promise<{ success: boolean; card?: CardDetails; error?: string }> {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found.' };

    const now = new Date().toISOString();
    const last4 = user.accountNumber.slice(-4);
    const cardNum = `4552${user.accountNumber.slice(0, 4)}0000${last4}`.slice(0, 16);
    const expMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const expYear = String((new Date().getFullYear() + 4) % 100).padStart(2, '0');

    const newCard: CardDetails = {
      id: `card_${Date.now()}`,
      cardNumber: cardNum,
      cardholderName: `${user.fullName} ${user.surname}`.toUpperCase(),
      cardHolder: `${user.fullName} ${user.surname}`.toUpperCase(),
      expiryDate: `${expMonth}/${expYear}`,
      cvv: '•••', // Strictly masked: never persist raw CVV
      cardType: 'Aegis Platinum Digital Debit',
      brand: 'aegis',
      status: 'active',
      spendingLimit: 250000,
      dailyLimit: 25000,
      monthlyLimit: 250000,
      onlineTransactions: true,
      internationalTransactions: true,
      atmWithdrawals: true,
      contactless: true,
      activationCode: user.pin,
      issuerName: 'Aegis Card Services & Global Clearing Gateway',
      issuedAt: now,
      limits: {
        onlinePayments: true,
        internationalUsage: true,
        atmWithdrawals: true,
        contactless: true,
      },
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), { card: newCard, updatedAt: now });
      await setDoc(doc(db, 'notifications', `notif_card_${Date.now()}`), {
        id: `notif_card_${Date.now()}`,
        userId: user.uid,
        title: 'Aegis Platinum Virtual Card Issued',
        message: `Your Aegis Platinum Digital Debit Card ending in ${last4} has been issued and activated.`,
        type: 'success',
        read: false,
        createdAt: now,
      });
      return { success: true, card: newCard };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Card issuance failed.' };
    }
  }

  public async activateCard(
    userId: string,
    activationCode: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.getUserById(userId);
    if (!user || !user.card) return { success: false, error: 'Card record not found.' };
    if (user.card.status === 'blocked') {
      return { success: false, error: 'This card is permanently blocked.' };
    }
    if (
      user.card.activationCode &&
      activationCode.trim() !== user.card.activationCode &&
      activationCode.trim() !== user.pin
    ) {
      return { success: false, error: 'Invalid activation authorization code.' };
    }
    const updatedCard = { ...user.card, status: 'active' as const };
    await updateDoc(doc(db, 'users', user.uid), {
      card: updatedCard,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  public async toggleCardFreeze(
    userId: string
  ): Promise<{ success: boolean; newStatus?: 'active' | 'frozen'; error?: string }> {
    const user = this.getUserById(userId);
    if (!user || !user.card) return { success: false, error: 'Card record not found.' };
    if (user.card.status === 'blocked') {
      return { success: false, error: 'Blocked cards cannot be unfrozen.' };
    }
    const newStatus = user.card.status === 'frozen' ? 'active' : 'frozen';
    await updateDoc(doc(db, 'users', user.uid), {
      card: { ...user.card, status: newStatus },
      updatedAt: new Date().toISOString(),
    });
    return { success: true, newStatus };
  }

  public async blockCard(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const user = this.getUserById(userId);
    if (!user || !user.card) return { success: false, error: 'Card record not found.' };
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'users', user.uid), {
      card: { ...user.card, status: 'blocked' as const },
      updatedAt: now,
    });
    await setDoc(doc(db, 'notifications', `notif_block_${Date.now()}`), {
      id: `notif_block_${Date.now()}`,
      userId: user.uid,
      title: 'Emergency Card Blocked',
      message: `Your card ending in ${user.card.cardNumber.slice(-4)} has been blocked. Reason: ${reason || 'Security alert'}.`,
      type: 'security',
      read: false,
      createdAt: now,
    });
    return { success: true };
  }

  public async requestReplacementCard(
    userId: string
  ): Promise<{ success: boolean; card?: CardDetails; error?: string }> {
    return this.issueVirtualCard(userId);
  }

  public async updateCardSettings(
    userId: string,
    limits: Partial<CardLimits>
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.getUserById(userId);
    if (!user || !user.card) return { success: false, error: 'Card not found.' };
    const nextLimits = {
      ...(user.card.limits || {
        onlinePayments: true,
        internationalUsage: true,
        atmWithdrawals: true,
        contactless: true,
      }),
      ...limits,
    };
    await updateDoc(doc(db, 'users', user.uid), {
      card: { ...user.card, limits: nextLimits },
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  // ==================== REAL-TIME SUPPORT CHAT ====================
  public getConversations(): SupportConversation[] {
    return [...this.chatConversations];
  }

  public getConversation(userId: string): SupportConversation | null {
    return this.chatConversations.find((c) => c.userId === userId) || null;
  }

  public getUnreadChatCountForAdmin(): number {
    return this.chatConversations.reduce((acc, c) => acc + (c.unreadByAdminCount || 0), 0);
  }

  public markConversationReadByAdmin(userId: string): void {
    const conv = this.chatConversations.find((c) => c.userId === userId);
    if (conv && conv.unreadByAdminCount > 0) {
      const updatedMsgs = conv.messages.map((m) =>
        m.senderRole === 'user' ? { ...m, read: true } : m
      );
      setDoc(
        doc(db, 'chat_conversations', conv.id),
        { unreadByAdminCount: 0, messages: updatedMsgs },
        { merge: true }
      ).catch(() => {});
    }
  }

  public markAllConversationsReadByAdmin(): void {
    this.chatConversations.forEach((conv) => {
      const updatedMsgs = conv.messages.map((m) =>
        m.senderRole === 'user' ? { ...m, read: true } : m
      );
      setDoc(
        doc(db, 'chat_conversations', conv.id),
        { unreadByAdminCount: 0, messages: updatedMsgs },
        { merge: true }
      ).catch(() => {});
    });
  }

  public markConversationReadByUser(userId: string): void {
    const conv = this.chatConversations.find((c) => c.userId === userId);
    if (conv && conv.unreadByUserCount > 0) {
      const updatedMsgs = conv.messages.map((m) =>
        m.senderRole === 'admin' ? { ...m, read: true } : m
      );
      setDoc(
        doc(db, 'chat_conversations', conv.id),
        { unreadByUserCount: 0, messages: updatedMsgs },
        { merge: true }
      ).catch(() => {});
    }
  }

  public sendChatMessage(params: {
    userId: string;
    senderRole: 'user' | 'admin';
    message: string;
    senderName?: string;
  }): ChatMessage {
    const user = this.getUserById(params.userId);
    const now = new Date().toISOString();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const existingConv = this.chatConversations.find((c) => c.userId === params.userId);
    const newMsg: ChatMessage = {
      id: msgId,
      chatId: params.userId,
      senderId: params.senderRole === 'user' ? params.userId : auth.currentUser?.uid || 'admin',
      senderRole: params.senderRole,
      senderName:
        params.senderRole === 'admin'
          ? 'Aegis Support Desk'
          : user
          ? `${user.fullName} ${user.surname}`
          : params.senderName || 'Client',
      message: params.message.trim(),
      timestamp: now,
      read: false,
    };

    const nextConv: SupportConversation = existingConv
      ? {
          ...existingConv,
          lastMessage: params.message.trim(),
          lastMessageTime: now,
          unreadByAdminCount:
            params.senderRole === 'user'
              ? (existingConv.unreadByAdminCount || 0) + 1
              : existingConv.unreadByAdminCount || 0,
          unreadByUserCount:
            params.senderRole === 'admin'
              ? (existingConv.unreadByUserCount || 0) + 1
              : existingConv.unreadByUserCount || 0,
          messages: [...existingConv.messages, newMsg],
        }
      : {
          id: params.userId,
          userId: params.userId,
          userName: user ? `${user.fullName} ${user.surname}` : params.senderName || 'Valued Client',
          userEmail: user?.email || '',
          userAccountNumber: user?.accountNumber || '',
          lastMessage: params.message.trim(),
          lastMessageTime: now,
          unreadByAdminCount: params.senderRole === 'user' ? 1 : 0,
          unreadByUserCount: params.senderRole === 'admin' ? 1 : 0,
          status: 'open',
          messages: [newMsg],
        };

    setDoc(doc(db, 'chat_conversations', nextConv.id), nextConv, { merge: true }).catch((e) =>
      console.warn('Firestore chat message write warning:', e)
    );

    return newMsg;
  }
}

export const store = new AegisStore();
