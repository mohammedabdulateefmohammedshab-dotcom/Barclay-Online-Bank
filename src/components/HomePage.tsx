import React from 'react';
import { 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Lock, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  CreditCard,
  Building,
  Headphones,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../lib/languages';
import { BrandLogo } from './BrandLogo';

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

  const services = [
    {
      icon: Globe,
      title: 'Global SWIFT Transfers',
      desc: 'Seamless domestic and international wire settlements across 30+ sovereign countries with secure 4-digit verification.',
      badge: '30+ Jurisdictions'
    },
    {
      icon: CreditCard,
      title: 'Barclay Platinum Cards',
      desc: 'Instant virtual and physical debit cards connected to authorized Visa issuing with contactless, ATM, and international limits.',
      badge: 'Visa Issuer Authorized'
    },
    {
      icon: Zap,
      title: 'Cryptocurrency Gateways',
      desc: 'Native Bitcoin & USDT ERC-20 payment gateways with fast proof-of-payment approval and instant liquidity crediting.',
      badge: 'Zero Slippage'
    },
    {
      icon: Layers,
      title: 'Tiered Custody Accounts',
      desc: 'Three-tier identity protection scaling up to $500,000 daily transaction limits with biometric KYC verification.',
      badge: 'Tier 1 to Tier 3'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* Real-time FX & Crypto Rates Ticker */}
      <div className="bg-[#071324] border-b border-[#14233D] py-2.5 px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-xs">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interbank Live Rates:</span>
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
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Redesigned Brand Logo */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Prominent Redesigned Logo (Clean Vector SVG, perfectly blended into #0A192F) */}
              <div className="py-2">
                <BrandLogo variant="horizontal" size="xl" showTagline={true} />
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F223D] border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-inner w-fit">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Premier International Online Banking • 256-Bit TLS Security</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Modern Online Banking, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-white">
                  Built for the Future.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Experience seamless personal and commercial banking with Barclay Online Bank. Manage your accounts, initiate domestic and SWIFT transfers across 30+ countries, activate Visa-authorized debit cards, and access real-time financial tracking.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-7 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-sm tracking-wide shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <span>Open An Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-7 py-4 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] text-white border border-[#1E3A5F] font-bold text-sm tracking-wide shadow-md transition-all"
                >
                  Sign In to Banking
                </button>

                <button
                  onClick={onOpenAbout}
                  className="px-5 py-4 rounded-xl bg-transparent hover:bg-[#0F223D] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Learn More</span>
                </button>
              </div>

              {/* Trust Badges matching logo attributes: Secure | Fast | Global | Trusted */}
              <div className="pt-6 border-t border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-[#0F223D] p-3 rounded-xl border border-[#1E3A5F]">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-white">Secure</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0F223D] p-3 rounded-xl border border-[#1E3A5F]">
                  <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-white">Fast</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0F223D] p-3 rounded-xl border border-[#1E3A5F]">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-white">Global</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0F223D] p-3 rounded-xl border border-[#1E3A5F]">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-white">Trusted</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Banking Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl blur-xl opacity-30"></div>

                <div className="relative p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F223D] via-[#0A192F] to-[#071324] border border-blue-500/40 shadow-2xl space-y-6">
                  {/* Card Header with Brand Logo */}
                  <div className="flex items-center justify-between">
                    <BrandLogo variant="horizontal" size="sm" />
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                      TIER 2 VERIFIED
                    </span>
                  </div>

                  {/* EMV Chip & Contactless */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-amber-300 to-amber-500 shadow-inner border border-amber-200/50 flex items-center justify-center">
                      <div className="w-8 h-6 border border-amber-800/40 rounded-sm"></div>
                    </div>
                    <Zap className="w-5 h-5 text-blue-400" />
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
                        <p className="font-mono text-2xl font-black text-blue-300">
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
                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">CARDHOLDER</span>
                      <span className="font-bold text-white tracking-wider">VICTORIA STERLING</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">EXPIRES</span>
                      <span className="font-bold text-blue-300">11/29</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#071324] border-y border-[#14233D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
              Institutional & Personal Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Complete Online Banking Ecosystem
            </h2>
            <p className="text-sm text-slate-400">
              Comprehensive financial features crafted with precision, from international SWIFT clearing to authorized card management and tiered custody.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] hover:border-blue-400 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400/80 block mb-1">
                        {srv.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {srv.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1E293B] flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Architecture & Compliance Section */}
      <section className="py-20 bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F223D] to-[#071324] border border-blue-500/30 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                  Bank-Grade Protection
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Protected by Rigorous 256-Bit Cryptography
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Every account opening generates a distinct 10-digit account number, protected with individual PINs, automated SWIFT verification codes, and real-time administrative reconciliation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Balance Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Instant Debit Card Controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>SWIFT Code Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Role-Based Admin Protection</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide text-center shadow-lg shadow-blue-500/25 transition-all"
                >
                  Create Your Account
                </button>
                <button
                  onClick={onOpenSupport}
                  className="w-full py-4 px-6 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] text-slate-200 border border-[#1E3A5F] text-xs font-semibold text-center transition-all"
                >
                  Contact 24/7 Support Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#071324] border-t border-[#14233D] py-14 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1E293B] pb-8">
            <BrandLogo variant="horizontal" size="md" />
            <div className="flex flex-wrap items-center gap-6">
              <button onClick={onOpenAbout} className="hover:text-white transition-colors">{t.aboutUs}</button>
              <button onClick={onOpenSupport} className="hover:text-white transition-colors">{t.contactSupport}</button>
              <button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">Client Sign In</button>
              <button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">Create Account</button>
              {/* Discreet, secure Administrative Access link per Requirement 4 */}
              <button 
                onClick={onOpenAdminAuth} 
                className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                title="Barclay Staff and Central Clearing Login"
              >
                <Lock className="w-3 h-3" />
                <span>Staff & Admin Portal</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2026 Barclay Online Bank PLC. 1 Churchill Place, London E14 5HP, UK. All rights reserved.</p>
            <p className="text-blue-400">FSCS Protected • Authorized & Regulated Banking</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
