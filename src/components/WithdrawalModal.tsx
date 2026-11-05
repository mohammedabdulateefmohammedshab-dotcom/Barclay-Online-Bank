import React, { useState } from 'react';
import { 
  X, 
  ArrowDownRight, 
  Building2, 
  KeyRound, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, FinancialSettings, BankTransaction } from '../types';
import { store } from '../lib/store';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
  onWithdrawalSubmitted: (transaction: BankTransaction) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onWithdrawalSubmitted
}) => {
  const [method, setMethod] = useState<'bank' | 'crypto'>('bank');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [pin, setPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > currentUser.balance) {
      setErrorMessage(`Insufficient funds. Available balance: $${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }

    if (pin !== currentUser.pin) {
      setErrorMessage('Invalid 4-digit Secure PIN entered.');
      return;
    }

    setLoading(true);
    try {
      const result = await store.initiateTransfer({
        userId: currentUser.uid,
        amount: numAmount,
        recipientName: beneficiaryName || `${currentUser.fullName} ${currentUser.surname}`,
        recipientAccountNumber: destination,
        recipientBank: method === 'bank' ? 'External Financial Institution' : 'Private Crypto Custody',
        recipientCountry: currentUser.country,
        swiftCode: 'EXTRWD22',
        verificationCode: currentUser.swiftVerificationCode || '8492',
        description: `Direct Account Withdrawal (${method === 'bank' ? 'Bank Account' : 'Crypto Wallet'})`
      });

      if (result.error || !result.transaction) {
        setErrorMessage(result.error || 'Failed to submit withdrawal.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onWithdrawalSubmitted(result.transaction!);
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 px-2 py-1 rounded-xl shadow-md border border-cyan-400/40">
              <img
                src="/logo.png"
                alt="Barclay Online Bank"
                className="h-8 w-auto object-contain select-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Online Banking Payouts
              </span>
              <h3 className="text-base font-extrabold text-white">Request Withdrawal</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Preview */}
        <div className="px-6 py-2.5 bg-[#001224] border-b border-[#00284d] flex items-center justify-between text-xs">
          <span className="text-slate-400">Available Balance:</span>
          <span className="font-bold text-emerald-400 font-mono">
            ${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </span>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/40">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-white">Withdrawal Request Queued</h4>
            <p className="text-xs text-slate-300">
              Your withdrawal has been registered as <strong>Pending</strong>. Per banking compliance regulations, funds will be released upon administrator clearance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Method Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-[#001326] p-1 rounded-xl border border-[#002d57]">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                  method === 'bank' ? 'bg-[#00264d] text-cyan-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bank Account (ACH / Wire)
              </button>
              <button
                type="button"
                onClick={() => setMethod('crypto')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                  method === 'crypto' ? 'bg-[#00264d] text-cyan-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Crypto Address (BTC / USDT)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Beneficiary Full Name *
              </label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder={`${currentUser.fullName} ${currentUser.surname}`}
                className="w-full bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {method === 'bank' ? 'Destination Account Number / IBAN *' : 'Destination Crypto Wallet Address *'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={method === 'bank' ? 'e.g. GB29 BARC ... or US Account #' : 'e.g. bc1q... or 0x...'}
                className="w-full bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Withdrawal Amount ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={currentUser.balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 font-semibold focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter Your 4-Digit Secure PIN *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Request...' : 'Submit Withdrawal for Processing'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
