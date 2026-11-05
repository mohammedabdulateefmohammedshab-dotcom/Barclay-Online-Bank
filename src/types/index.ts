export type AccountTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'crypto_payment' | 'tier_upgrade';

export type TransactionStatus = 'Pending' | 'Completed' | 'Reversed' | 'Cancelled';

export type PaymentMethod = 'BTC' | 'USDT_ERC20' | 'Bank_Wire';

export type PaymentSubmissionStatus = 'Pending' | 'Approved' | 'Cancelled';

export type VerificationType = 'facial' | 'government_id';

export type VerificationStatus = 'Pending Review' | 'Approved' | 'Rejected';

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
  updatedAt: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  banks: string[];
}
