import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { UserProfile, InvestmentPlan, UserInvestment } from '../types';
import { store } from '../lib/store';

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  plans: InvestmentPlan[];
  investments: UserInvestment[];
}

export const InvestmentsModal: React.FC<InvestmentsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  plans,
  investments
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'portfolio'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const activePlans = plans.filter((p) => p.active);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setFeedback(null);

    const num = parseFloat(amountInput);
    if (!num || num <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid investment amount.' });
      return;
    }

    setLoading(true);
    try {
      const res = await store.subscribeToInvestmentPlan(currentUser.uid, selectedPlan.id, num);
      if (res.error) {
        setFeedback({ type: 'error', text: res.error });
      } else {
        setFeedback({
          type: 'success',
          text: `Successfully allocated $${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${selectedPlan.name}!`
        });
        setAmountInput('');
        setSelectedPlan(null);
        setActiveTab('portfolio');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Investment Plans & Treasury Portfolio</h3>
              <p className="text-xs text-slate-400">
                Available Balance: <strong className="text-emerald-400 font-mono">${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </p>
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
        <div className="flex border-b border-[#002447] bg-[#000d1a] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'plans' ? 'border-cyan-400 text-cyan-400 bg-[#001428]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Available Plans ({activePlans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'portfolio' ? 'border-cyan-400 text-cyan-400 bg-[#001428]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            My Active & Past Investments ({investments.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
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

          {activeTab === 'plans' ? (
            <>
              {activePlans.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm font-bold text-white">No Active Investment Plans Available</p>
                  <p className="text-xs">Investment offerings configured by Tier 1 Treasury Administration will appear here immediately.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        selectedPlan?.id === plan.id
                          ? 'bg-[#002244] border-cyan-400 shadow-lg'
                          : 'bg-[#001428] border-[#00284d] hover:border-[#003d73]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black text-white">{plan.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800 inline-block mt-1">
                            {plan.riskLevel} Risk
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-400 font-mono">{plan.roiPercent}%</span>
                          <span className="text-[10px] text-slate-400 block">Target ROI</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{plan.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#000d1a] p-2.5 rounded-xl border border-[#002447]">
                        <div>
                          <span className="text-slate-400 block">Range:</span>
                          <span className="font-mono font-bold text-white">
                            ${plan.minAmount.toLocaleString()} – ${plan.maxAmount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Term:</span>
                          <span className="font-mono font-bold text-cyan-300">{plan.durationDays} Days</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setAmountInput(String(plan.minAmount));
                          setFeedback(null);
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all"
                      >
                        Allocate Funds to Plan
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedPlan && (
                <form
                  onSubmit={handleSubscribe}
                  className="p-4 rounded-2xl bg-[#00172e] border border-cyan-400/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      Confirm Allocation: {selectedPlan.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="any"
                      min={selectedPlan.minAmount}
                      max={Math.min(selectedPlan.maxAmount, currentUser.balance)}
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder={`Min $${selectedPlan.minAmount}`}
                      className="w-full bg-[#000d1a] border border-[#003866] rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  {parseFloat(amountInput) > 0 && (
                    <p className="text-xs text-emerald-300 font-mono">
                      Projected Payout at Maturity ({selectedPlan.durationDays}d):{' '}
                      <strong>
                        ${(parseFloat(amountInput) * (1 + selectedPlan.roiPercent / 100)).toLocaleString('en-US', {
                          minimumFractionDigits: 2
                        })}
                      </strong>
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Allocating in Firestore...' : 'Confirm & Lock Allocation'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {investments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  You have not allocated funds into any investment plans yet.
                </div>
              ) : (
                investments.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-[#001428] border border-[#00284d] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{inv.planName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : inv.status === 'Active'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Started: {new Date(inv.startDate).toLocaleDateString()} • Maturity:{' '}
                          {new Date(inv.maturityDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400">
                        Principal: <strong className="text-white">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                      </p>
                      <p className="text-sm font-black text-emerald-400">
                        Expected: ${inv.expectedReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })} (+{inv.roiPercent}%)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
