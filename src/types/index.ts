export type AccountTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'crypto_payment' | 'tier_upgrade';

export type TransactionStatus = 'Pending' | 'Completed' | 'Reversed' | 'Cancelled';

export type PaymentMethod = 'BTC' | 'USDT_ERC20' | 'Bank_Wire';

export type PaymentSubmissionStatus = 'Pending' | 'Approved' | 'Cancelled';

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
  cardNumber: string; // 16 digits
  cvv: string; // 3 digits
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

export interface UserProfile {
  uid: string;
  accountNumber: string; // Exactly 10 digits
  fullName: string;
  surname: string;
  email: string;
  country: string;
  pin: string; // 4 digits
  passwordHash?: string;
  balance: number;
  currency: string;
  tier: AccountTier;
  status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  swiftVerificationCode?: string; // 4-digit code
  swiftVerified?: boolean;
  card?: CardDetails;
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
  mediaUrl: string; // Base64 data URI or image URL
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

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: 'ADMIN_LOGIN' | 'DEPOSIT_CREDITED' | 'TRANSACTION_APPROVED' | 'TRANSACTION_REVERSED' | 'PAYMENT_PROOF_APPROVED' | 'PAYMENT_PROOF_CANCELLED' | 'TIER_UPGRADE_APPROVED' | 'TIER_UPGRADE_REJECTED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_REACTIVATED' | 'SETTINGS_UPDATED' | 'NOTIFICATION_DISPATCHED';
  targetAccount?: string;
  details: string;
  timestamp: string;
}

