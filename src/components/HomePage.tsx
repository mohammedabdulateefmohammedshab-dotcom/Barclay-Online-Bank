import React, { useState } from 'react';
import {
  Check,
  Users,
  Wallet,
  HandCoins,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  PiggyBank,
  Landmark,
  Briefcase,
  Globe,
  Lock,
  Mail,
  Send,
  ChevronRight
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../lib/languages';
import { BrandLogo } from './BrandLogo';
import heroAdvisorImg from '../assets/images/hero_banking_advisor_1794834365759.jpg';
import hologramGlobeImg from '../assets/images/hologram_digital_globe_1794834365963.jpg';
import solutionDigitalImg from '../assets/images/solution_digital_interface_1794834366640.jpg';
import solutionWireImg from '../assets/images/solution_wire_transfer_1794834367020.jpg';
import footerSkyscrapersImg from '../assets/images/footer_skyscrapers_monochrome_1794834368465.jpg';

interface HomePageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdminAuth?: () => void;
  onOpenAbout: () => void;
  onOpenSupport: () => void;
  currentLang: SupportedLanguage;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAuth,
  onOpenAbout,
  onOpenSupport,
  currentLang
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Interactive Experience Tabs ('skills' | 'mission' | 'profile') matching video section 4
  const [activeExpTab, setActiveExpTab] = useState<'skills' | 'mission' | 'profile'>('skills');

  // Interactive Newsletter subscription state in cityscape footer
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'error' | 'subscribed'>('idle');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!cleaned || !cleaned.includes('@') || !cleaned.includes('.')) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('subscribed');
    setNewsletterEmail('');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const BlueCheckItem: React.FC<{ title?: string; text: string }> = ({ title, text }) => (
    <li className="flex items-start gap-3.5 text-sm leading-relaxed text-slate-300">
      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
        <Check className="w-3 h-3 stroke-[3]" />
      </span>
      <span>
        {title && <strong className="text-white font-semibold">{title} </strong>}
        {text}
      </span>
    </li>
  );

  const experienceContent = {
    skills: {
      headline: 'For us, responsible finance is the clearest path to lasting value for your wealth.',
      paragraphs: [
        'Aegis Online Bank operates with multi-jurisdictional clearing engineering, real-time database synchronization, and dedicated treasury specialists. Our technology delivers resilient liquidity, instant 10-digit account issuance, and rapid international settlement.',
        'We partner with individual account holders and institutional businesses alike to provide flexible accounts, virtual card management, and multi-tier verification scaled to your growth.'
      ]
    },
    mission: {
      headline: 'We Put People First.',
      paragraphs: [
        'The mission of Aegis Online Bank is to deliver accessible financial excellence that supports every individual, founder, and corporate enterprise through transparent pricing and strict integrity.',
        'Every transaction is recorded cleanly in real time with complete audit visibility, responsive client care, and direct support whenever your business crosses borders.'
      ]
    },
    profile: {
      headline: 'A Modern Global Financial Platform Built Around Security.',
      paragraphs: [
        'Founded to simplify international banking, Aegis Online Bank integrates automated account governance, global wire routing, and digital debit card controls under one cohesive platform.',
        'From day-one $0.00 onboarding accounts to Tier 3 high-volume global treasury limits, every customer manages funds with 256-bit cryptographic protection.'
      ]
    }
  }[activeExpTab];

  const progressMetrics = [
    { label: 'FinTech Innovation', value: 98 },
    { label: 'Network Data Protection', value: 86 },
    { label: 'Security & Custody', value: 95 }
  ];

  const actionSteps = [
    {
      icon: Users,
      title: 'CREATE AN ACCOUNT',
      desc: 'Quick and straightforward registration using your essential details. Receive a unique 10-digit Aegis account number to start managing funds seamlessly.'
    },
    {
      icon: Wallet,
      title: 'LINK FUNDING CHANNELS',
      desc: 'Fund your primary wallet effortlessly through verified international bank wire transfers or direct digital asset settlement gateways.'
    },
    {
      icon: HandCoins,
      title: 'SEND MONEY WORLDWIDE',
      desc: 'Feature-rich cross-border payment network spanning 30+ territories with fast routing and real-time balance synchronization.'
    },
    {
      icon: Lightbulb,
      title: 'EXPLORE PROPERTY & CREDIT FINANCING',
      desc: 'Planning a strategic property acquisition or commercial expansion? Connect with our financing specialists seven days a week.'
    }
  ];

  const keyStats = [
    { value: '9K+', label: 'Individual Clients' },
    { value: '1.2K+', label: 'Global Specialists' },
    { value: '$77M+', label: 'Settled Volume' },
    { value: '80', label: 'Supported Regions' }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d13] text-white">
      {/* ================= 1. HERO SECTION (Dark Editorial Backdrop + Gradient Pill CTA) ================= */}
      <section className="relative overflow-hidden min-h-[540px] lg:min-h-[600px] flex items-center">
        {/* Background Photography + Deep Obsidian Scrim */}
        <img
          src={heroAdvisorImg}
          alt="Aegis Online Bank specialist workspace"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d13]/85 via-[#0b0d13]/75 to-[#0b0d13]" />

        <div className="relative z-10 max-w-6xl mx-auto w-full px-5 sm:px-8 py-16 lg:py-24">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.15]">
              Welcome To Aegis Digital Banking!
            </h1>

            {/* Compact Inline Brand Lockup matching video */}
            <div className="flex items-center gap-2.5 text-slate-300 pt-1">
              <BrandLogo variant="emblem" size="xs" theme="dark" />
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-slate-300">
                AEGIS ONLINE BANK
              </span>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-slate-200 leading-relaxed">
              <p>
                Aegis Online Bank works around your schedule, delivering modern financial accounts and transfers that are faster, clearer, and accessible worldwide.
              </p>
              <p>
                Our global treasury and advisory team works closely with private clients and businesses using disciplined analytical systems to deliver reliable financial solutions.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. HOLOGRAPHIC GLOBE SHOWCASE + 4 BLUE CHECKMARKS ================= */}
      <section className="py-12 sm:py-16 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#12151f] shadow-2xl">
                <img
                  src={hologramGlobeImg}
                  alt="Holographic digital banking network"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-72 lg:h-80 object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <ul className="space-y-4">
                <BlueCheckItem text="Simple bill payments by direct transfer and standing order." />
                <BlueCheckItem text="Flexible liquidity and tiered daily transaction limits tailored to status." />
                <BlueCheckItem text="International coverage across major banking corridors." />
                <BlueCheckItem text="Borderless business accounts with real-time settlement." />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. WHO WE ARE ("WE ARE Aegis Bank") ================= */}
      <section id="who-we-are" className="py-12 sm:py-20 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-sm font-bold text-[#1d8cf8] block">Who We Are</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              WE ARE Aegis Bank
            </h2>
            <div className="flex items-center gap-2 pt-1">
              <BrandLogo variant="emblem" size="xs" theme="dark" />
              <span className="text-xs font-bold tracking-[0.16em] uppercase text-slate-300">
                AEGISBANK
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            A dedicated platform for individuals and enterprises seeking straightforward digital banking. Deposit funds through verified payment gateways or international wire transfer, manage virtual cards with ease, and scale accounts transparently with zero hidden complexity.
          </p>

          <ul className="space-y-4 pt-2 max-w-3xl">
            <BlueCheckItem
              title="Continuous Innovation –"
              text="We keep investing in modern real-time cloud ledgers and automated settlement rails."
            />
            <BlueCheckItem
              title="Effective Management –"
              text="We apply disciplined oversight, multi-tier verification, and instant audit transparency."
            />
            <BlueCheckItem
              title="Strategy & Planning –"
              text="We focus on resilient cross-border infrastructure designed for today’s digital economy."
            />
            <BlueCheckItem
              title="Intelligent Systems –"
              text="Automated fraud detection and instant account verification keep client custody secure around the clock."
            />
          </ul>

          <div className="pt-3">
            <button
              type="button"
              onClick={onOpenAbout}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Discover More
            </button>
          </div>
        </div>
      </section>

      {/* ================= 4. WHY CHOOSE US (Segmented Tabs + Progress Bars + Card Benefits) ================= */}
      <section className="py-12 sm:py-20 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="space-y-3">
            <span className="text-sm font-bold text-[#1d8cf8] block">Why choose us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
              We're ready to share our experience.
            </h2>
          </div>

          {/* Interactive Pill Segmented Tab Bar */}
          <div className="bg-[#151822] p-1.5 rounded-full inline-flex items-center gap-1 border border-white/[0.06] max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveExpTab('skills')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeExpTab === 'skills'
                  ? 'bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Our Skills
            </button>
            <button
              type="button"
              onClick={() => setActiveExpTab('mission')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeExpTab === 'mission'
                  ? 'bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Our Mission
            </button>
            <button
              type="button"
              onClick={() => setActiveExpTab('profile')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeExpTab === 'profile'
                  ? 'bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              We Put People First
            </button>
          </div>

          {/* Tab Copy + Animated Gradient Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-lg font-bold text-white">{experienceContent.headline}</h3>
              {experienceContent.paragraphs.map((para, idx) => (
                <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="lg:col-span-6 space-y-6 bg-[#12151f] p-6 sm:p-7 rounded-2xl border border-white/[0.06]">
              {progressMetrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-white">{metric.label}</span>
                    <span className="text-white font-mono tabular-nums">{metric.value}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#1e2230] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1d8cf8] via-[#4f46e5] to-[#8b5cf6] transition-all duration-500"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Card Benefits Bullets */}
          <div className="pt-2">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BlueCheckItem text="Available exclusively for registered Aegis customers—enjoy virtual debit cards, global travel flexibility, and transparent transaction tracking." />
              <BlueCheckItem text="Make instant online and contactless payments with digital card freeze controls and customizable spending limits." />
              <BlueCheckItem text="Use your virtual card across supported merchants worldwide with real-time ledger updates and verifiable electronic receipts." />
              <BlueCheckItem text="24/7 worldwide client support—reach our team anytime by email or live chat for urgent card or transfer assistance." />
            </ul>
          </div>
        </div>
      </section>

      {/* ================= 5. FOUR DARK FEATURE CARDS WITH GRADIENT ICONS ================= */}
      <section className="py-10 sm:py-16 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {actionSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  onClick={() => onOpenAuth('register')}
                  className="p-7 rounded-2xl bg-[#131620] hover:bg-[#171b27] border border-white/[0.06] hover:border-blue-500/30 transition-all space-y-4 cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1d8cf8]/20 to-[#7c3aed]/20 border border-blue-500/30 flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 6. WAYS WE CAN HELP + 4 CIRCULAR STAT MEDALLIONS ================= */}
      <section className="py-12 sm:py-20 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="max-w-2xl space-y-3">
            <span className="text-sm font-bold text-[#1d8cf8] block">Ways we can help</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Personal Banking with Aegis. Live your life. Love your bank.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              At Aegis Online Bank, we see a world of financial mobility—designed to help individuals and enterprises plan, transfer, and custody assets globally.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {keyStats.map((stat) => (
              <div
                key={stat.label}
                className="aspect-square rounded-full bg-[#12151f] border border-white/10 shadow-xl flex flex-col items-center justify-center p-4 text-center relative"
              >
                <div className="absolute inset-2 rounded-full border border-white/[0.04] pointer-events-none" />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1d8cf8] font-mono tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-300 font-medium mt-1.5 max-w-[110px] leading-snug">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. OUR SERVICES (Dark Cards with Large Gradient Circular Icons) ================= */}
      <section id="services-section" className="py-12 sm:py-20 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="max-w-2xl space-y-3">
            <span className="text-sm font-bold text-[#1d8cf8] block">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Personal & Commercial Banking Tailored To You.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-2xl bg-[#131620] border border-white/[0.06] space-y-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2176ff] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Personal Checking</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Flexible consumer digital accounts built for daily liquidity, starting cleanly at $0.00 balance with instant 10-digit account numbers and unlimited check-free transfers.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl bg-[#131620] border border-white/[0.06] space-y-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2176ff] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Personal Lending</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Structured secured and unsecured credit facilities tailored to personal cashflow goals with competitive schedules and straightforward qualification tiers.
              </p>
              <ul className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                <BlueCheckItem text="Auto & Mobility Financing options tailored to your budget." />
                <BlueCheckItem text="Home Equity & Improvement credit lines for property owners." />
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl bg-[#131620] border border-white/[0.06] space-y-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2176ff] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <PiggyBank className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Money Markets & Savings</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dedicated reserve accounts to organize savings by purpose, offering clean audit tracking, real-time balance visibility, and instant liquidity transfers.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-2xl bg-[#131620] border border-white/[0.06] space-y-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2176ff] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Landmark className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Business Banking</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Multi-currency corporate checking, treasury operations, and international contractor payouts built for modern companies, partnerships, and global studios.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-7 rounded-2xl bg-[#131620] border border-white/[0.06] space-y-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2176ff] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Commercial & Trade Lending</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Our commercial specialists customize working capital facilities, equipment lines, and acquisition financing with swift administrative decisions.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-7 rounded-2xl bg-[#131620] border border-white/[0.06] space-y-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2176ff] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Secure Custody & Storage</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Protected by multi-layered 256-bit TLS cryptography, role-based administrative gates, and offline cold custody infrastructure to prevent unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. GRADIENT TEAM / CONTACT BANNER (Blue-to-Purple) ================= */}
      <section className="bg-gradient-to-br from-[#1d8cf8] via-[#4f46e5] to-[#8b5cf6] py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl border border-white/30 bg-white/10 flex items-center justify-center text-white">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Interested in banking or working with our Team?
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
            Whether you are opening an enterprise treasury account or exploring partnership opportunities in digital banking and finance, our specialists are ready to connect.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenSupport}
              className="px-8 py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#3b42d6] font-bold text-sm transition-all cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* ================= 9. OUR SOLUTIONS (Image Cards with Overlapping Captions) ================= */}
      <section id="solutions-section" className="py-16 sm:py-24 bg-[#0b0d13]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="space-y-3">
            <span className="text-sm font-bold text-[#1d8cf8] block">Our Expert Team</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Our Solutions
            </h2>
            <div className="flex items-center gap-2 pt-1">
              <BrandLogo variant="emblem" size="xs" theme="dark" />
              <span className="text-xs font-bold tracking-[0.16em] uppercase text-slate-300">
                AEGISBANK
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
            {/* Solution 1: Dark Overlay Box */}
            <div className="relative pb-12">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={solutionDigitalImg}
                  alt="Business Online Banking interface"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover"
                />
              </div>
              <div className="relative mx-4 -mt-12 p-6 rounded-2xl bg-[#161924] border border-white/10 shadow-2xl text-center space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Business Online Banking</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Manage accounts, real-time balances, and virtual corporate cards directly through Aegis Business Online Banking.
                </p>
              </div>
            </div>

            {/* Solution 2: Blue-to-Purple Gradient Overlay Box */}
            <div className="relative pb-12">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={solutionWireImg}
                  alt="Remote Deposit Capture and Mobile Banking"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover"
                />
              </div>
              <div className="relative mx-4 -mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] shadow-2xl text-center space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Remote Deposit Capture</h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Submit verified deposit proofs and settlement receipts digitally with real-time verification team review.
                </p>
              </div>
            </div>

            {/* Solution 3: Blue-to-Purple Gradient Overlay Box */}
            <div className="relative pb-12">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={hologramGlobeImg}
                  alt="Payroll and Treasury Processing"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover"
                />
              </div>
              <div className="relative mx-4 -mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] shadow-2xl text-center space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Automated Treasury Settlement</h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Streamline global disbursements and multi-currency operational cashflow through automated clearing workflows.
                </p>
              </div>
            </div>

            {/* Solution 4: Blue-to-Purple Gradient Overlay Box */}
            <div className="relative pb-12">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={heroAdvisorImg}
                  alt="Wire Transfer Origination"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover"
                />
              </div>
              <div className="relative mx-4 -mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] shadow-2xl text-center space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Wire Transfer Origination</h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Initiate domestic and international SWIFT wire transfers with verifiable electronic advices and transparent statuses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 10. TAILORING & CHANNELS + FINANCING HIGHLIGHTS ================= */}
      <section className="py-12 sm:py-20 bg-[#0b0d13] border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16">
          {/* Block A */}
          <div className="max-w-3xl space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Introducing Aegis Tailoring and financing, Your way.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Our specialists support growing businesses and private account holders with bespoke banking structures across Europe, Asia, Africa, the Americas, and the Middle East.
            </p>
          </div>

          {/* Block B */}
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Bank where, when, and how you want.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              At Aegis Online Bank, we deliver more than a traditional account—giving you uninterrupted access to manage balances, virtual cards, and transfers from any browser or mobile device.
            </p>

            <ul className="space-y-4">
              <BlueCheckItem
                title="Aegis Mobile Experience –"
                text="Access your accounts, transaction history, and electronic advices smoothly from any mobile screen."
              />
              <BlueCheckItem
                title="Aegis E-Alert –"
                text="Real-time security and settlement notifications delivered instantaneously on every account update."
              />
              <BlueCheckItem
                title="Aegis-NET Portal –"
                text="24/7 uninterrupted online banking with dedicated customer and enterprise management controls."
              />
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Block C */}
          <div className="max-w-3xl space-y-5 pt-4 border-t border-white/[0.06]">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Global Business Continuity & Credit Facilities
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We provide structured solutions across retail, corporate, and private digital banking—designed with straightforward verification and real-time visibility so you can focus on long-term value creation.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 11. MONOCHROME SKYSCRAPER FOOTER WITH NEWSLETTER & QUICK LINKS ================= */}
      <footer className="relative overflow-hidden bg-[#08090d] border-t border-white/10">
        <img
          src={footerSkyscrapersImg}
          alt="Aegis financial district architecture"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d13]/90 via-[#0b0d13]/85 to-[#06070a]" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16 space-y-10">
          {/* Newsletter Row */}
          <div className="max-w-xl space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Get updates and latest offers from us.
            </h3>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex items-center bg-[#181b26] border border-white/10 rounded-full p-1.5 pl-5 shadow-inner"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                }}
                placeholder="Your email address"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                aria-label="Subscribe to updates"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2176ff] to-[#7c3aed] hover:opacity-95 text-white flex items-center justify-center shrink-0 cursor-pointer transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {newsletterStatus === 'error' && (
              <p className="text-xs text-rose-400">Please enter a valid email address.</p>
            )}
            {newsletterStatus === 'subscribed' && (
              <p className="text-xs text-emerald-400">Thank you. You are subscribed to Aegis Online Bank updates.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-4 border-t border-white/10">
            {/* Left Brand Summary */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <BrandLogo variant="emblem" size="sm" theme="dark" />
                <span className="text-lg font-extrabold tracking-tight uppercase text-white">
                  AEGISBANK
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                A modern platform for individuals and businesses who value clarity. Deposit funds, issue virtual debit cards, and execute verified wire transfers worldwide with fair, transparent pricing.
              </p>
              <div>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Discover More
                </button>
              </div>
            </div>

            {/* Right Quick Links */}
            <div className="md:col-span-6 space-y-4">
              <h4 className="text-base font-bold text-white">Quick Link</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm text-slate-300">
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>About Our Firm</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('services-section')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.services || 'Services'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('solutions-section')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Solutions</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSupport}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Us</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Register</span>
                </button>
                <a
                  href="mailto:newzelebarclaysupport@gmail.com"
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-left"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate">Support Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom Copyright */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>Aegis Online Bank © 2026. All Rights Reserved.</p>
            <a
              href="mailto:newzelebarclaysupport@gmail.com"
              className="text-slate-300 hover:text-white font-mono text-[11px]"
            >
              newzelebarclaysupport@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
