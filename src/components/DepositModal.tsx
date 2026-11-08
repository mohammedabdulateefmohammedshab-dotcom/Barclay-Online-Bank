import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Upload, 
  ArrowRight, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode,
  FileText,
  DollarSign
} from 'lucide-react';
import { UserProfile, FinancialSettings } from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'wire'>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'USDT'>('BTC');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // "I Have Made the Payment" modal state
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofAmount, setProofAmount] = useState('');
  const [proofTxHash, setProofTxHash] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError('File is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProofImage(reader.result as string);
        setSubmitError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const numAmount = parseFloat(proofAmount);
    if (!numAmount || numAmount <= 0) {
      setSubmitError('Please enter a valid deposit amount.');
      return;
    }

    if (!proofTxHash.trim()) {
      setSubmitError('Please enter the transaction hash, reference, or sending wallet ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = selectedCrypto === 'BTC' ? 'BTC' : 'USDT_ERC20';
      const result = await store.submitPaymentProof({
        userId: currentUser.uid,
        method: activeTab === 'wire' ? 'Bank_Wire' : method,
        amount: numAmount,
        txHashOrRef: proofTxHash,
        proofImageUrl: proofImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
        notes: proofNotes
      });

      if (result.error) {
        setSubmitError(result.error);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowProofModal(false);
          setSubmitSuccess(false);
          setProofAmount('');
          setProofTxHash('');
          setProofImage('');
          setProofNotes('');
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit payment proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="sm" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Treasury & Crypto Gateways
              </span>
              <h3 className="text-base font-extrabold text-white">Deposit & Fund Account</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Crypto vs Wire */}
        <div className="flex border-b border-[#002b52] bg-[#001224]">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`flex-1 py-3 text-xs font-bold text-center tracking-wide border-b-2 transition-all ${
              activeTab === 'crypto'
                ? 'text-cyan-400 border-cyan-400 bg-[#001c38]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Cryptocurrency (Instant Gateways)
          </button>
          <button
            onClick={() => setActiveTab('wire')}
            className={`flex-1 py-3 text-xs font-bold text-center tracking-wide border-b-2 transition-all ${
              activeTab === 'wire'
                ? 'text-cyan-400 border-cyan-400 bg-[#001c38]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            International Wire / SWIFT
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'crypto' ? (
            /* Cryptocurrency Section (Requirement 5 & 6) */
            <div className="space-y-5">
              {/* Token Selector: Bitcoin vs USDT ERC-20 */}
              <div className="grid grid-cols-2 gap-3">
                {/* Bitcoin Card */}
                <button
                  type="button"
                  onClick={() => setSelectedCrypto('BTC')}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    selectedCrypto === 'BTC'
                      ? 'bg-[#00264d] border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-[#001c38] border-[#003366] hover:border-slate-500'
                  }`}
                >
                  {/* Bitcoin SVG Logo */}
                  <div className="w-10 h-10 rounded-full bg-[#F7931A] text-white flex items-center justify-center font-bold text-lg shadow shrink-0">
                    ₿
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Bitcoin</p>
                    <p className="text-[10px] text-amber-400 font-mono">BTC Network</p>
                  </div>
                </button>

                {/* USDT Card */}
                <button
                  type="button"
                  onClick={() => setSelectedCrypto('USDT')}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    selectedCrypto === 'USDT'
                      ? 'bg-[#00264d] border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-[#001c38] border-[#003366] hover:border-slate-500'
                  }`}
                >
                  {/* Tether USDT SVG Logo */}
                  <div className="w-10 h-10 rounded-full bg-[#26A17B] text-white flex items-center justify-center font-black text-sm shadow shrink-0">
                    ₮
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Tether USD</p>
                    <p className="text-[10px] text-emerald-400 font-mono">USDT (ERC-20)</p>
                  </div>
                </button>
              </div>

              {/* Display Wallet Address */}
              <div className="p-4 rounded-xl bg-[#001f3d] border border-[#003866] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    {selectedCrypto === 'BTC' ? 'Official Bitcoin Deposit Address' : 'Official USDT (ERC-20) Address'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-800">
                    Real-Time Live Sync
                  </span>
                </div>

                <div className="bg-[#001326] p-3 rounded-lg border border-[#002d57] flex flex-col gap-2">
                  <p className="font-mono text-xs text-cyan-300 break-all select-all font-semibold">
                    {selectedCrypto === 'BTC' ? settings.btcAddress : settings.usdtAddress}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-[#002447]">
                    <span className="text-[10px] text-slate-400">
                      Network: <strong className="text-white">{selectedCrypto === 'BTC' ? 'Bitcoin Native (SegWit)' : 'Ethereum ERC-20'}</strong>
                    </span>
                    <button
                      onClick={() => copyToClipboard(
                        selectedCrypto === 'BTC' ? settings.btcAddress : settings.usdtAddress,
                        selectedCrypto
                      )}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#003366] hover:bg-[#004080] text-cyan-300 text-xs font-medium transition-colors"
                    >
                      {copiedText === selectedCrypto ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === selectedCrypto ? 'Copied!' : 'Copy Address'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated QR Code Box */}
                <div className="flex items-center gap-4 bg-[#001830] p-3 rounded-lg border border-[#00284d]">
                  <div className="w-16 h-16 bg-white p-1 rounded-md flex items-center justify-center shrink-0">
                    {/* SVG QR Code Pattern */}
                    <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                      <path d="M2 2h8v8H2zm2 2v4h4V4zm10-2h8v8h-8zm2 2v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm14-2h4v2h-4zm-4 0h2v4h-2zm2 4h4v4h-4zm-2 2h2v2h-2zm6-4h2v6h-2z" />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <p className="font-semibold text-white">Scan with Mobile Wallet</p>
                    <p className="text-[11px] text-slate-400">Minimum deposit: 50 USD equivalent.</p>
                    <p className="text-[11px] text-slate-400">Credited automatically after approval by the authorized payment verification team.</p>
                  </div>
                </div>
              </div>

              {/* Requirement 6: "I Have Made the Payment" Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofModal(true)}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>I Have Made the Payment</span>
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Click after sending crypto to submit your transaction hash and receipt proof for rapid admin approval.
                </p>
              </div>
            </div>
          ) : (
            /* International Wire / SWIFT Section */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#001f3d] border border-[#003866] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                  <Building2 className="w-4 h-4" />
                  <span>Barclays Official Clearing Bank Coordinates</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#002d57]">
                    <span className="text-slate-400">Beneficiary Bank:</span>
                    <span className="font-semibold text-white">Barclays Bank PLC UK</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#002d57]">
                    <span className="text-slate-400">Headquarters Address:</span>
                    <span className="font-semibold text-white">1 Churchill Place, London E14 5HP, UK</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#002d57]">
                    <span className="text-slate-400">SWIFT / BIC Code:</span>
                    <span className="font-mono font-bold text-cyan-300">BARCGB22</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#002d57]">
                    <span className="text-slate-400">Sort Code:</span>
                    <span className="font-mono font-semibold text-white">20-00-00</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#002d57]">
                    <span className="text-slate-400">Your Target Account Number:</span>
                    <span className="font-mono font-bold text-cyan-400">{currentUser.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Mandatory Payment Reference:</span>
                    <span className="font-mono font-bold text-amber-300">BCB-{currentUser.accountNumber}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProofModal(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I Have Made the Wire Payment (Submit Receipt)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* "I Have Made the Payment" Modal (Requirement 6) */}
      {showProofModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#001933] border border-cyan-500/50 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#002c59]">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Payment Verification
                </span>
                <h4 className="text-base font-extrabold text-white">Submit Proof of Payment</h4>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/40">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h5 className="text-lg font-bold text-white">Proof Submitted Successfully!</h5>
                <p className="text-xs text-slate-300">
                  Your payment submission is now <strong>Pending</strong> in the Aegis Review queue. You will receive an instant notification once approved and credited.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="mt-4 space-y-3.5">
                {submitError && (
                  <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount Deposited (USD Equivalent) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={proofAmount}
                      onChange={(e) => setProofAmount(e.target.value)}
                      placeholder="e.g. 5000.00"
                      className="w-full bg-[#002244] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Transaction Hash / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={proofTxHash}
                    onChange={(e) => setProofTxHash(e.target.value)}
                    placeholder="e.g. 0x8f2a... or blockchain tx hash"
                    className="w-full bg-[#002244] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Upload Proof of Payment (Screenshot / Receipt Image)
                  </label>
                  <div className="border-2 border-dashed border-[#003866] rounded-xl p-3 text-center bg-[#001326] hover:border-cyan-400 transition-colors">
                    {proofImage ? (
                      <div className="relative">
                        <img 
                          src={proofImage} 
                          alt="Proof preview" 
                          className="max-h-28 mx-auto rounded object-contain border border-[#002b52]" 
                        />
                        <button
                          type="button"
                          onClick={() => setProofImage('')}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-900/80 text-rose-200 hover:bg-rose-800 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-300 font-medium">Click to upload transfer screenshot</span>
                        <p className="text-[10px] text-slate-400">PNG, JPG, or PDF up to 2MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="e.g. Deposited from Binance wallet"
                    className="w-full bg-[#002244] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting Proof...' : 'Submit Proof for Aegis Review'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
