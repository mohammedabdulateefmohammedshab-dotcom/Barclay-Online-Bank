import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Lock, 
  CreditCard, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Landmark, 
  Layers, 
  Users, 
  ChevronRight,
  Headphones
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../lib/languages';

interface HomePageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdminAuth: () => void;
  onOpenAbout: () => void;
  onOpenSupport: () => void;
  currentLang: SupportedLanguage;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAuth,
  onOpenAdminAuth,
  onOpenAbout,
  onOpenSupport,
  currentLang
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const currencyRates = [
    { pair: 'GBP / USD', rate: '1.2940', change: '+0.32%', up: true },
    { pair: 'EUR / USD', rate: '1.0825', change: '+0.15%', up: true },
    { pair: 'USD / CHF', rate: '0.8650', change: '-0.12%', up: false },
    { pair: 'USD / AED', rate: '3.6725', change: '0.00%', up: true },
    { pair: 'BTC / USD', rate: '88,450.00', change: '+4.85%', up: true },
    { pair: 'USDT / USD', rate: '1.0001', change: '+0.01%', up: true }
  ];

  return (
    <div className="min-h-screen bg-[#00172e] text-white">
      {/* Real-time FX & Crypto Rates Ticker */}
      <div className="bg-[#001224] border-b border-[#00284d] py-2 px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-xs">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Interbank Fixings:</span>
          </span>
          {currencyRates.map((c, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-slate-300">{c.pair}</span>
              <span className="font-mono font-bold text-white">{c.rate}</span>
              <span className={`text-[10px] font-semibold ${c.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {c.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Prominent Official Brand Logo Card */}
              <div className="inline-block bg-white/95 p-3 sm:p-4 rounded-2xl shadow-2xl border border-cyan-400/40">
                <img
                  src="/logo.png"
                  alt="Barclay Online Bank - Bank Smarter. Live Better."
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain select-none"
                />
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#002850] border border-[#003d73] text-cyan-300 text-xs font-semibold shadow-inner w-fit">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Premier International Digital Banking • 256-Bit TLS Security</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Global Banking, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400">
                  Precision Settlements.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Welcome to Barclay Online Bank. Experience frictionless international SWIFT transfers across 30+ sovereign territories, native Bitcoin & USDT ERC-20 payment gateways, and tiered multi-million custody limits.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <span>Open An Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-6 py-3.5 rounded-xl bg-[#00264d] hover:bg-[#003366] text-white border border-[#003d73] font-bold text-sm tracking-wide shadow-md transition-all"
                >
                  Sign In to Banking
                </button>

                <button
                  onClick={onOpenAdminAuth}
                  className="px-4 py-3.5 rounded-xl bg-[#001f3d] hover:bg-[#002b54] text-cyan-300 border border-[#003866] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              </div>

              {/* Trust Badges matching logo attributes: Secure | Fast | Global | Trusted */}
              <div className="pt-6 border-t border-[#002b52] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-[#002040] p-2 rounded-lg border border-[#002d57]">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white">Secure</span>
                </div>
                <div className="flex items-center gap-2 bg-[#002040] p-2 rounded-lg border border-[#002d57]">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white">Fast</span>
                </div>
                <div className="flex items-center gap-2 bg-[#002040] p-2 rounded-lg border border-[#002d57]">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white">Global</span>
                </div>
                <div className="flex items-center gap-2 bg-[#002040] p-2 rounded-lg border border-[#002d57]">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white">Trusted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-40"></div>

                <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#002447] via-[#001f3f] to-[#001428] border border-cyan-500/30 shadow-2xl space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-md border border-cyan-400/40">
                      <img
                        src="/logo.png"
                        alt="Barclay Online Bank"
                        className="h-8 w-auto object-contain select-none"
                      />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      TIER 2 VERIFIED
                    </span>
                  </div>

                  {/* EMV Chip & Contactless */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-300 to-amber-500 shadow-inner border border-amber-200/50 flex items-center justify-center">
                      <div className="w-7 h-5 border border-amber-700/40 rounded-sm"></div>
                    </div>
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>

                  {/* 10-Digit Account Number & Balance */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      PRIMARY ACCOUNT NUMBER
                    </span>
                    <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white mt-0.5">
                      4829 •••• •••• 1038
                    </p>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          AVAILABLE LIQUIDITY
                        </span>
                        <p className="font-mono text-2xl font-black text-cyan-300">
                          $128,450.00 <span className="text-xs text-slate-400">USD</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          DAILY LIMIT
                        </span>
                        <p className="font-mono text-xs font-bold text-emerald-400">
                          $50,000 / Day
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Name & Expiry */}
                  <div className="pt-3 border-t border-[#002f5e] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">CARDHOLDER</span>
                      <span className="font-bold text-white tracking-wider">VICTORIA STERLING</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">EXPIRES</span>
                      <span className="font-bold text-cyan-300">11/29</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Core Banking Pillars */}
      <section className="py-16 bg-[#001326] border-y border-[#00264d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              Institutional Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Built for Modern International Finance
            </h2>
            <p className="text-sm text-slate-400">
              Every feature requested by institutional customers: automated SWIFT routing, cryptocurrency gateways, and real-time ledger consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: International Transfers */}
            <div className="p-6 rounded-2xl bg-[#001c38] border border-[#003366] hover:border-cyan-500/50 transition-all space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                30+ Supported Countries & SWIFT
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamlessly dispatch transfers to the UK, US, Switzerland, UAE, Germany, France, Japan, and beyond. Real-time dynamic bank directory with secure 4-digit code authorization.
              </p>
              <div className="pt-2 text-xs font-semibold text-cyan-400 flex items-center gap-1">
                <span>Explore supported banks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Cryptocurrency Payments */}
            <div className="p-6 rounded-2xl bg-[#001c38] border border-[#003366] hover:border-amber-500/50 transition-all space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Bitcoin & USDT ERC-20 Gateways
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deposit through native Bitcoin or Ethereum USDT addresses. Real-time payment proof upload via "I Have Made the Payment" with instant administrative credit.
              </p>
              <div className="pt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span>View crypto addresses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Tiered KYC */}
            <div className="p-6 rounded-2xl bg-[#001c38] border border-[#003366] hover:border-emerald-500/50 transition-all space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Three-Tier Account Architecture
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tier 1 standard activation, Tier 2 facial biometric verification with $50,000 daily limits, and Tier 3 VIP Elite verification with $500,000 daily capacity.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span>Review tier requirements</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000e1c] border-t border-[#002244] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#001c38] pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md border border-cyan-400/40">
                <img
                  src="/logo.png"
                  alt="Barclay Online Bank"
                  className="h-10 w-auto object-contain select-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={onOpenAbout} className="hover:text-white transition-colors">{t.aboutUs}</button>
              <button onClick={onOpenSupport} className="hover:text-white transition-colors">{t.contactSupport}</button>
              <button onClick={onOpenAdminAuth} className="hover:text-white transition-colors">Admin Portal</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© 2026 Barclay Online Bank PLC. 1 Churchill Place, London E14 5HP, UK. All rights reserved.</p>
            <p className="text-cyan-400">FSCS & Sovereign Protection • 256-Bit SSL</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
