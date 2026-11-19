import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Coins,
  Copy,
  Check,
  Building2,
  ArrowDownLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import {
  UserProfile,
  FinancialSettings,
  PaymentMethod,
  CardTokenSummary
} from '../types';
import { store } from '../lib/store';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
  onOpenDeposit: () => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onOpenDeposit
}) => {
  const [activeTab, setActiveTab] = useState<'banking' | 'cards' | 'gateways'>('banking');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Saved Banking & Payout Profile
  const [bankAccountName, setBankAccountName] = useState(`${currentUser.fullName} ${currentUser.surname}`);
  const [bankAccountNumber, setBankAccountNumber] = useState(currentUser.accountNumber);
  const [bankName, setBankName] = useState('Aegis Online Bank');
  const [swiftBicCode, setSwiftBicCode] = useState('AEGSGB2L');
  const [bankCountry, setBankCountry] = useState(currentUser.country);
  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>('Bank_Wire');
  const [btcPayoutAddress, setBtcPayoutAddress] = useState('');
  const [usdtPayoutAddress, setUsdtPayoutAddress] = useState('');
  const [tokenizedCards, setTokenizedCards] = useState<CardTokenSummary[]>([]);

  // Tokenized Card Form (PCI Safe — Last 4 + Expiry + Holder Name ONLY; zero CVV or raw 16-digit PAN)
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Amex' | 'Other'>('Visa');
  const [cardLast4, setCardLast4] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('11');
  const [expiryYear, setExpiryYear] = useState('2029');
  const [cardHolderName, setCardHolderName] = useState(`${currentUser.fullName} ${currentUser.surname}`);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const saved = store.getBankingInfo(currentUser.uid);
    if (saved) {
      setBankAccountName(saved.bankAccountName || `${currentUser.fullName} ${currentUser.surname}`);
      setBankAccountNumber(saved.bankAccountNumber || currentUser.accountNumber);
      setBankName(saved.bankName || 'Aegis Online Bank');
      setSwiftBicCode(saved.swiftBicCode || 'AEGSGB2L');
      setBankCountry(saved.bankCountry || currentUser.country);
      setPreferredMethod(saved.preferredMethod || 'Bank_Wire');
      setBtcPayoutAddress(saved.btcPayoutAddress || '');
      setUsdtPayoutAddress(saved.usdtPayoutAddress || '');
      setTokenizedCards(saved.tokenizedCards || []);
    } else {
      setBankAccountName(`${currentUser.fullName} ${currentUser.surname}`);
      setBankAccountNumber(currentUser.accountNumber);
      setBankCountry(currentUser.country);
    }
    setFeedback(null);
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const persistBankingProfile = async (cardsOverride?: CardTokenSummary[]) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await store.saveBankingPaymentInfo({
        uid: currentUser.uid,
        accountNumber: currentUser.accountNumber,
        bankAccountName,
        bankAccountNumber,
        bankName,
        swiftBicCode,
        bankCountry,
        preferredMethod,
        btcPayoutAddress,
        usdtPayoutAddress,
        tokenizedCards: cardsOverride ?? tokenizedCards
      });
      if (res.success) {
        setFeedback({ type: 'success', text: 'Banking & payment profile saved to Cloud Firestore.' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to save banking details.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddTokenizedCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLast4 = cardLast4.replace(/\D/g, '');
    if (cleanLast4.length !== 4) {
      setFeedback({ type: 'error', text: 'Enter exactly the last 4 digits of your card.' });
      return;
    }

    const newCard: CardTokenSummary = {
      id: `tok_card_${Date.now()}`,
      brand: cardBrand,
      last4: cleanLast4,
      expiryMonth,
      expiryYear,
      holderName: cardHolderName.trim() || `${currentUser.fullName} ${currentUser.surname}`,
      tokenRef: `tok_aegis_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString()
    };

    const nextCards = [newCard, ...tokenizedCards];
    setTokenizedCards(nextCards);
    setCardLast4('');
    await persistBankingProfile(nextCards);
  };

  const handleRemoveCard = async (id: string) => {
    const nextCards = tokenizedCards.filter((c) => c.id !== id);
    setTokenizedCards(nextCards);
    await persistBankingProfile(nextCards);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Banking & Payment Information</h3>
              <p className="text-xs text-slate-400">Saved payout banks, wallets & tokenized card summaries</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-[#002447] bg-[#000d1a]">
          <button
            type="button"
            onClick={() => { setActiveTab('banking'); setFeedback(null); }}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'banking' ? 'border-cyan-400 text-cyan-400 bg-[#001428]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Bank & Wallets
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('cards'); setFeedback(null); }}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'cards' ? 'border-cyan-400 text-cyan-400 bg-[#001428]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Saved Cards ({tokenizedCards.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('gateways'); setFeedback(null); }}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'gateways' ? 'border-cyan-400 text-cyan-400 bg-[#001428]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Deposit Treasury
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-700 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {activeTab === 'banking' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                persistBankingProfile();
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank Account Holder Name</label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Beneficiary Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank Account Number / IBAN</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={swiftBicCode}
                    onChange={(e) => setSwiftBicCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank Country</label>
                  <input
                    type="text"
                    value={bankCountry}
                    onChange={(e) => setBankCountry(e.target.value)}
                    className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Preferred Method</label>
                  <select
                    value={preferredMethod}
                    onChange={(e) => setPreferredMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Bank_Wire">Bank Wire / ACH</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="USDT_ERC20">Tether USDT (ERC-20)</option>
                    <option value="Card_Token">Tokenized Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Personal BTC Payout Wallet (Optional)</label>
                <input
                  type="text"
                  value={btcPayoutAddress}
                  onChange={(e) => setBtcPayoutAddress(e.target.value)}
                  placeholder="bc1q..."
                  className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Personal USDT ERC-20 Wallet (Optional)</label>
                <input
                  type="text"
                  value={usdtPayoutAddress}
                  onChange={(e) => setUsdtPayoutAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving to Firestore...' : 'Save Banking & Payout Details'}</span>
              </button>
            </form>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-800/60 text-[11px] text-blue-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  PCI-DSS Compliant Vault: Only tokenized references, card brand, masked last 4 digits, and expiration are stored. Full 16-digit PANs and CVV codes are never collected or stored.
                </span>
              </div>

              <form onSubmit={handleAddTokenizedCard} className="p-4 rounded-2xl bg-[#001428] border border-[#00284d] space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Add Tokenized Card Summary</span>
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Card Network</label>
                    <select
                      value={cardBrand}
                      onChange={(e) => setCardBrand(e.target.value as any)}
                      className="w-full bg-[#000d1a] border border-[#002f5e] rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">American Express</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Last 4 Digits Only *</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                      placeholder="4242"
                      className="w-full bg-[#000d1a] border border-[#002f5e] rounded-lg px-2.5 py-1.5 text-white font-mono"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Exp Month</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#000d1a] border border-[#002f5e] rounded-lg px-2.5 py-1.5 text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Exp Year</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#000d1a] border border-[#002f5e] rounded-lg px-2.5 py-1.5 text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Holder Name</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      className="w-full bg-[#000d1a] border border-[#002f5e] rounded-lg px-2.5 py-1.5 text-white"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save Tokenized Card Reference
                </button>
              </form>

              <div className="space-y-2">
                {tokenizedCards.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">No tokenized payment cards added yet.</p>
                ) : (
                  tokenizedCards.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#001428] border border-[#00284d] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">
                          {c.brand} •••• {c.last4}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Exp: {c.expiryMonth}/{c.expiryYear} • {c.holderName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(c.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60"
                        title="Remove card reference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'gateways' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Treasury Deposit Gateways</span>
                </h4>

                <div className="p-3.5 rounded-xl bg-[#001428] border border-[#00284d] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400">Bitcoin Network (BTC)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Live Treasury</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs text-slate-300 truncate bg-[#000d1a] p-2 rounded-lg flex-1 border border-[#001f3d]">
                      {settings.btcAddress}
                    </p>
                    <button
                      onClick={() => handleCopy(settings.btcAddress, 'btc')}
                      className="p-2 rounded-lg bg-[#001f3d] hover:bg-[#002f5c] text-cyan-300"
                    >
                      {copiedKey === 'btc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#001428] border border-[#00284d] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400">Tether USDT (ERC-20)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Ethereum Mainnet</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs text-slate-300 truncate bg-[#000d1a] p-2 rounded-lg flex-1 border border-[#001f3d]">
                      {settings.usdtAddress}
                    </p>
                    <button
                      onClick={() => handleCopy(settings.usdtAddress, 'usdt')}
                      className="p-2 rounded-lg bg-[#001f3d] hover:bg-[#002f5c] text-cyan-300"
                    >
                      {copiedKey === 'usdt' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#001428] border border-[#00284d] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{settings.clearingBankName || 'Aegis Clearing Bank (UK)'}</span>
                  </div>
                  <p className="text-slate-400 font-mono">IBAN: {settings.clearingBankAccountNumber || 'GB82 AEGS 2000 0084 9201 84'}</p>
                  <p className="text-slate-400 font-mono">SWIFT: {settings.clearingSwiftCode || 'AEGSGB2L'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Make a Deposit Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
