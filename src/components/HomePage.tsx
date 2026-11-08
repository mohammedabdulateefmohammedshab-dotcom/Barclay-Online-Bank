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
  Sparkles,
  Smartphone,
  Shield,
  ArrowUpRight,
  Eye,
  EyeOff,
  Clock,
  Send,
  Users,
  Mail
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../lib/languages';
import { BrandLogo } from './BrandLogo';

interface HomePageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdminAuth?: () => void;
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

  // The 6 specific service sections required by the user
  const sixServices = [
    {
      id: 'account-mgmt',
      number: '01',
      icon: Layers,
      title: 'Digital Account Management',
      tagline: 'Multi-Tiered Custody',
      desc: 'Automatic 10-digit account generation, instantaneous balance updates, transparent tiered limits, and biometric KYC verification scaling from Tier 1 to Tier 3.',
      accent: 'border-blue-500/30'
    },
    {
      id: 'transfers',
      number: '02',
      icon: Globe,
      title: 'Domestic & International Transfers',
      tagline: 'Global SWIFT Routing',
      desc: 'Fast domestic clearing and multi-currency international transfers across 30+ countries with automated 4-digit SWIFT verification security codes.',
      accent: 'border-emerald-500/30'
    },
    {
      id: 'virtual-cards',
      number: '03',
      icon: CreditCard,
      title: 'Virtual Card Management',
      tagline: 'Instant Card Issuance',
      desc: 'Create and control digital debit cards with immediate freeze/unfreeze toggles, granular spending limits, contactless support, and instant replacement issuance.',
      accent: 'border-blue-500/30'
    },
    {
      id: 'crypto-support',
      number: '04',
      icon: Zap,
      title: 'Cryptocurrency Payment Support',
      tagline: 'BTC & USDT Gateways',
      desc: 'Direct deposit support for Bitcoin and USDT (ERC-20). Seamless proof-of-payment receipts upload and automatic liquidity crediting to your primary account.',
      accent: 'border-emerald-500/30'
    },
    {
      id: 'security',
      number: '05',
      icon: ShieldCheck,
      title: 'Account Security',
      tagline: 'Enterprise Cryptography',
      desc: 'Protected by 256-bit TLS encryption, role-based access security, hardware two-factor authentication (2FA), and immutable real-time audit logging.',
      accent: 'border-blue-500/30'
    },
    {
      id: 'support',
      number: '06',
      icon: Headphones,
      title: 'Customer Support',
      tagline: '24/7 Global Help Desk',
      desc: 'Around-the-clock priority technical assistance, direct ticket dispatch, and live transaction resolution services. Direct Contact: newzelebarclaysupport@gmail.com',
      accent: 'border-emerald-500/30'
    }
  ];

  // Diverse customer stories with verified photography
  const customerStories = [
    {
      name: 'Amara Vance',
      role: 'Global Trade Director, Singapore',
      quote: 'Barclay Online Bank transformed our international payments. The instant 10-digit account and SWIFT verification codes make cross-border settlements painless.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      tag: 'Tier 3 Enterprise'
    },
    {
      name: 'Julian Montgomery',
      role: 'Fintech Founder & Angel Investor, London',
      quote: 'The virtual debit cards with instant freeze controls and the native crypto payment support provide the modern flexibility legacy banks simply cannot match.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      tag: 'Verified Client'
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Senior Clinical Consultant, Geneva',
      quote: 'Real-time transaction tracking without needing to log out and refresh has made managing multi-currency consulting contracts completely frictionless.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      tag: 'Tier 2 Premier'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* Real-time FX & Crypto Rates Ticker */}
      <div className="bg-[#071324] border-b border-[#14233D] py-2.5 px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-xs">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
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
        {/* Ambient atmospheric lighting with subtle lime-green and electric blue glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Brand Logo */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Prominent Approved Logo (Emblem with Bank Colonnade + Swoosh) */}
              <div className="py-2">
                <BrandLogo variant="horizontal" size="xl" showTagline={true} />
              </div>

              {/* Requirement: Header badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F223D] border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Premier Digital Financial Services</span>
              </div>

              {/* Requirement: Main headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Modern Online Banking, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-emerald-300">
                  Built for the Future.
                </span>
              </h1>

              {/* Requirement: Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Manage your financial activities through a secure, convenient and modern digital platform.
              </p>

              {/* Requirement: Main 3 buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-7 py-4 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-black text-sm tracking-wide shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <span>Open an Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-7 py-4 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] text-white border border-[#1E3A5F] hover:border-emerald-500/40 font-bold text-sm tracking-wide shadow-md transition-all"
                >
                  Sign In
                </button>

                <button
                  onClick={onOpenAbout}
                  className="px-5 py-4 rounded-xl bg-transparent hover:bg-[#0F223D] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Learn More</span>
                </button>
              </div>

              {/* Trust Badges matching approved logo: Secure | Fast | Global | Trusted */}
              <div className="pt-6 border-t border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-[#0F223D] p-3 rounded-xl border border-[#1E3A5F]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white">Trusted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Virtual Card Preview & Real Customers */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Virtual Debit Card Presentation */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-emerald-500/40 to-blue-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

                <div className="relative p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F223D] via-[#0A192F] to-[#071324] border border-blue-500/40 shadow-2xl space-y-6">
                  {/* Card Header with Brand Logo */}
                  <div className="flex items-center justify-between">
                    <BrandLogo variant="horizontal" size="sm" />
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>ACTIVE FINTECH CUSTODY</span>
                    </div>
                  </div>

                  {/* EMV Chip & Contactless Wave */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-amber-300 to-amber-500 shadow-inner border border-amber-200/50 flex items-center justify-center">
                      <div className="w-8 h-6 border border-amber-800/40 rounded-sm"></div>
                    </div>
                    <Zap className="w-5 h-5 text-emerald-400" />
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
                        <p className="font-mono text-2xl font-black text-white">
                          $128,450.00 <span className="text-xs text-emerald-400 font-bold">USD</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          TIER 2 LIMIT
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
                      <span className="text-[9px] text-slate-400 uppercase block font-sans">VALID THRU</span>
                      <span className="font-bold text-emerald-400">11/29</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Digital Customer Snapshot */}
              <div className="p-4 rounded-2xl bg-[#0F223D]/90 border border-[#1E3A5F] flex items-center gap-4 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" 
                  alt="Customer using mobile banking" 
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0" 
                />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Live Customer Settlement</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      SWIFT Verified
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    "Settled EUR 14,200 cross-border transfer to Zurich in 45 seconds."
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* The 6 Required Service Sections */}
      <section className="py-20 bg-[#071324] border-y border-[#14233D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Core Financial Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Six Comprehensive Banking Services
            </h2>
            <p className="text-sm text-slate-400">
              Engineered for seamless digital finance, rapid settlement, and enterprise-grade account control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sixServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={srv.id}
                  className={`p-7 rounded-2xl bg-[#0F223D] border ${srv.accent} hover:border-emerald-400 transition-all space-y-4 shadow-xl flex flex-col justify-between group hover:-translate-y-1`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 flex items-center justify-center transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-emerald-400 transition-colors">
                        {srv.number}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                        {srv.tagline}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {srv.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-emerald-300 transition-colors">
                    <button 
                      onClick={() => onOpenAuth('register')}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <span>Get started</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">256-Bit TLS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diverse Customer Showcase with Real Photography */}
      <section className="py-20 bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
              Trusted Worldwide
            </span>
            <h2 className="text-3xl font-black text-white">
              Empowering Global Financial Mobility
            </h2>
            <p className="text-sm text-slate-400">
              Discover how entrepreneurs, consultants, and individuals manage multi-currency funds with Barclay Online Bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerStories.map((cust, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-[#0F223D] border border-[#1E3A5F] space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={cust.avatar} 
                        alt={cust.name} 
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400/50"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{cust.name}</h4>
                        <p className="text-[11px] text-slate-400">{cust.role}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed pt-2 border-t border-[#1E293B]">
                    "{cust.quote}"
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {cust.tag}
                  </span>
                  <span className="text-emerald-400 font-bold">100% Verified Account</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Independent Fintech Service Disclosure & Security Callout */}
      <section className="py-16 bg-[#071324] border-t border-[#14233D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0F223D] via-[#0A192F] to-[#071324] border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Independent Fintech Regulatory Transparency
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Built on Integrity, Cryptographic Custody & Global Speed
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Barclay Online Bank is an independent digital financial technology platform offering secure multi-currency account management, internal transaction settlement, and custodial clearing gateways. We are not affiliated with Barclays PLC or Visa Inc. All digital debit cards and custody accounts are issued independently through Barclay Card Services.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Balance Synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>SWIFT Verification Authorization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Tier Biometric KYC Compliance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>24/7 Custody Help Desk</span>
                  </div>
                </div>

                {/* Direct Support Contact Info */}
                <div className="flex items-center gap-2 pt-2 text-xs">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">Customer Support:</span>
                  <a 
                    href="mailto:newzelebarclaysupport@gmail.com" 
                    className="font-mono text-emerald-300 hover:text-emerald-200 hover:underline font-semibold"
                  >
                    newzelebarclaysupport@gmail.com
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-600 hover:from-blue-400 hover:to-emerald-500 text-white font-bold text-sm tracking-wide text-center shadow-lg shadow-blue-500/25 transition-all"
                >
                  Create Your Account
                </button>
                <button
                  onClick={onOpenSupport}
                  className="w-full py-4 px-6 rounded-xl bg-[#0F223D] hover:bg-[#162C4E] text-slate-200 border border-[#1E3A5F] text-xs font-semibold text-center transition-all flex items-center justify-center gap-2"
                >
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <span>Contact 24/7 Support Desk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Strictly Clean - NO public admin buttons) */}
      <footer className="bg-[#071324] border-t border-[#14233D] py-14 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1E293B] pb-8">
            <BrandLogo variant="horizontal" size="md" />
            <div className="flex flex-wrap items-center gap-6">
              <button onClick={onOpenAbout} className="hover:text-white transition-colors">{t.aboutUs}</button>
              <button onClick={onOpenSupport} className="hover:text-white transition-colors">{t.contactSupport}</button>
              <button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">Client Sign In</button>
              <button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">Create Account</button>
            </div>
          </div>

          {/* Official Customer Support Banner in Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0F223D] border border-[#1E3A5F] text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Support Email:</span>
              <a 
                href="mailto:newzelebarclaysupport@gmail.com" 
                className="font-mono text-emerald-400 hover:underline font-semibold"
              >
                newzelebarclaysupport@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Canary Wharf, London, UK</span>
              <span>•</span>
              <span>24/7 International Desk</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2026 Barclay Online Bank. Independent Financial Technology & Digital Custody. All rights reserved.</p>
            <p className="text-emerald-400">256-Bit TLS Encryption • End-to-End Custody Protection</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
