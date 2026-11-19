export type AccountTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type AdminTier = 'tier1' | 'tier2';

export type AuthRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'crypto_payment'
  | 'tier_upgrade'
  | 'investment'
  | 'investment_payout'
  | 'referral_bonus';

export type TransactionStatus = 'Pending' | 'Completed' | 'Reversed' | 'Cancelled';

export type PaymentMethod = 'BTC' | 'USDT_ERC20' | 'Bank_Wire' | 'Card_Token';

export type PaymentSubmissionStatus = 'Pending' | 'Approved' | 'Cancelled';
export type DepositStatus = 'Pending' | 'Approved' | 'Cancelled';
export type WithdrawalStatus = 'Pending' | 'Approved' | 'Cancelled';

export type VerificationType = 'facial' | 'government_id';

export type VerificationStatus = 'Pending Review' | 'Approved' | 'Rejected';

export type CardStatus = 'active' | 'inactive' | 'frozen' | 'blocked';

export interface CardLimits {
  onlinePayments: boolean;
  internationalUsage: boolean;
  atmWithdrawals: boolean;
  contactless: boolean;
}

export interface CardDetails {
  id: string;
  cardNumber: string; // Masked or virtual card display reference
  cvv: string;
  expiryDate: string; // MM/YY
  cardholderName?: string;
  cardHolder?: string;
  cardType: string;
  brand?: string;
  status: CardStatus;
  spendingLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  onlineTransactions?: boolean;
  internationalTransactions?: boolean;
  atmWithdrawals?: boolean;
  contactless?: boolean;
  activationCode?: string;
  issuer?: string;
  issuerName?: string;
  issuedAt?: string;
  limits?: CardLimits;
}

export interface CardTokenSummary {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Other';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  tokenRef: string; // Gateway token reference — never raw PAN or CVV
  createdAt: string;
}

export interface BankingPaymentInfo {
  uid: string;
  accountNumber: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  swiftBicCode: string;
  bankCountry: string;
  preferredMethod: PaymentMethod;
  btcPayoutAddress?: string;
  usdtPayoutAddress?: string;
  tokenizedCards?: CardTokenSummary[];
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  accountNumber: string; // Exactly 10 digits
  username?: string;
  fullName: string;
  surname: string;
  email: string;
  country: string;
  pin: string; // 4 digits
  passwordHash?: string; // Kept optional for legacy compatibility; new auth uses Firebase Auth
  photoUrl?: string;
  balance: number;
  currency: string;
  tier: AccountTier;
  status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'admin';
  adminTier?: AdminTier;
  referralCode?: string;
  referredBy?: string;
  lastBalanceLockId?: string;
  lastBalanceLockType?: 'withdrawal' | 'investment';
  createdAt: string;
  updatedAt: string;
  swiftVerificationCode?: string; // 4-digit code
  swiftVerified?: boolean;
  card?: CardDetails;
}

export interface AdminRoleRecord {
  uid: string;
  email: string;
  username: string;
  fullName: string;
  tier: AdminTier; // 'tier1' (Super Admin) | 'tier2' (Operations Admin)
  status: 'active' | 'revoked';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  userId: string;
  accountNumber: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  senderName?: string;
  senderAccountNumber?: string;
  recipientName?: string;
  recipientAccountNumber?: string;
  recipientBank?: string;
  recipientCountry?: string;
  swiftCode?: string;
  reference: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  fee?: number;
  previousBalance?: number;
  balanceAfter?: number;
  linkedRecordId?: string;
  reason?: string;
}

export interface DepositRecord {
  id: string;
  userId: string;
  accountNumber: string;
  userFullName: string;
  userEmail: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  txHashOrRef: string;
  walletAddress: string;
  proofImageUrl?: string;
  notes?: string;
  status: DepositStatus;
  processedBy?: string;
  processedAt?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  accountNumber: string;
  userFullName: string;
  userEmail: string;
  method: 'bank' | 'crypto';
  amount: number;
  currency: string;
  beneficiaryName: string;
  destination: string;
  bankName?: string;
  swiftCode?: string;
  country?: string;
  status: WithdrawalStatus;
  balanceReserved: boolean;
  reservedAmount: number;
  linkedTxId?: string;
  processedBy?: string;
  processedAt?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmission {
  id: string;
  userId: string;
  accountNumber: string;
  userFullName: string;
  userEmail?: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  txHashOrRef: string;
  walletAddress: string;
  proofImageUrl?: string;
  notes?: string;
  status: PaymentSubmissionStatus;
  processedBy?: string;
  processedAt?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  durationDays: number;
  riskLevel: 'Conservative' | 'Balanced' | 'Growth';
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInvestment {
  id: string;
  userId: string;
  accountNumber: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  roiPercent: number;
  expectedReturn: number;
  durationDays: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  startDate: string;
  maturityDate: string;
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerUid: string;
  referrerAccountNumber: string;
  referrerEmail: string;
  referredUid: string;
  referredAccountNumber: string;
  referredEmail: string;
  referredName: string;
  referralCode: string;
  rewardAmount: number;
  status: 'Pending' | 'Credited' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  accountNumber: string;
  fullName: string;
  targetTier: 'Tier 2' | 'Tier 3';
  verificationType: VerificationType;
  documentType?: string;
  documentNumber?: string;
  mediaUrl: string; // Firebase Storage download URL or fallback
  feePaid: number;
  status: VerificationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'transaction' | 'verification' | 'security';
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface FinancialSettings {
  verificationFee: number;
  tier2UpgradeFee: number;
  tier3UpgradeFee: number;
  tier1DailyLimit: number;
  tier1MonthlyLimit: number;
  tier2DailyLimit: number;
  tier2MonthlyLimit: number;
  tier3DailyLimit: number;
  tier3MonthlyLimit: number;
  btcAddress: string;
  usdtAddress: string;
  clearingBankName?: string;
  clearingBankAccountName?: string;
  clearingBankAccountNumber?: string;
  clearingSwiftCode?: string;
  clearingCountry?: string;
  referralBonusAmount?: number;
  requireSwiftCode: boolean;
  supportEmail?: string;
  updatedAt: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  banks: string[];
}

export type AuditActionType =
  | 'ADMIN_LOGIN'
  | 'MANAGEMENT_LOGIN'
  | 'DEPOSIT_CREDITED'
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_CANCELLED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_CANCELLED'
  | 'TRANSACTION_APPROVED'
  | 'TRANSACTION_REVERSED'
  | 'PAYMENT_PROOF_APPROVED'
  | 'PAYMENT_PROOF_CANCELLED'
  | 'TIER_UPGRADE_APPROVED'
  | 'TIER_UPGRADE_REJECTED'
  | 'TIER_UPDATED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REACTIVATED'
  | 'INVESTMENT_PLAN_CREATED'
  | 'INVESTMENT_PLAN_UPDATED'
  | 'INVESTMENT_SETTLED'
  | 'REFERRAL_REWARD_CREDITED'
  | 'ADMIN_TIER2_CREATED'
  | 'ADMIN_ACCESS_REVOKED'
  | 'SETTINGS_UPDATED'
  | 'NOTIFICATION_DISPATCHED'
  | 'SWIFT_CODE_APPROVED'
  | 'SWIFT_CODE_REJECTED'
  | 'SWIFT_CODE_REQUESTED'
  | 'CRYPTO_WALLET_UPDATED';

export interface AdminAuditLog {
  id: string;
  adminId?: string;
  adminUsername?: string;
  adminEmail: string;
  adminTier?: AdminTier | 'system';
  action: AuditActionType;
  affectedUserId?: string;
  targetAccount?: string;
  transactionId?: string;
  previousStatus?: string;
  newStatus?: string;
  amount?: number;
  reason?: string;
  details: string;
  timestamp: string;
}

export interface SwiftRequest {
  id: string;
  userId: string;
  accountNumber: string;
  fullName: string;
  email: string;
  amount: number;
  paymentMethod: PaymentMethod;
  txHashOrRef: string;
  proofImageUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  assignedCode?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAccountNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadByAdminCount: number;
  unreadByUserCount: number;
  status: 'open' | 'closed';
  messages: ChatMessage[];
}
