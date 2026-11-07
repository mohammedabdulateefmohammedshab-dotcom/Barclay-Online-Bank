import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  Lock, 
  LayoutDashboard, 
  CreditCard,
  Headphones,
  Check,
  LogOut,
  Bell,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { UserProfile } from '../types';
import { LANGUAGES, SupportedLanguage, TRANSLATIONS } from '../lib/languages';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentUser: UserProfile | null;
  isAdminMode: boolean;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdminAuth: () => void;
  onLogout: () => void;
  onToggleAdminView: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  currentLang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  onOpenAbout: () => void;
  onOpenSupport: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdminMode,
  onOpenAuth,
  onOpenAdminAuth,
  onLogout,
  unreadNotificationsCount,
  onOpenNotifications,
  currentLang,
  onChangeLang,
  onOpenAbout,
  onOpenSupport,
  activeTab,
  onSelectTab
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleNavClick = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A192F]/95 backdrop-blur-md text-white border-b border-[#1E293B] shadow-xl">
      {/* Top security bar */}
      <div className="bg-[#071324] px-4 py-1.5 text-xs text-slate-300 flex justify-between items-center border-b border-[#14233D]">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold tracking-wide text-white">Barclay Online Banking</span>
            <span className="hidden md:inline text-slate-400">| 256-Bit TLS End-to-End Encryption</span>
            <span className="hidden lg:inline text-emerald-400 font-semibold">• Core Banking Real-Time Sync</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-[#0F223D] px-2.5 py-1 rounded-lg border border-[#1E3A5F] transition-colors"
                title="Change Language & Translation"
              >
                <span>{currentLangObj.flag}</span>
                <span className="font-medium hidden sm:inline">{currentLangObj.native}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute right-0 mt-1 w-44 bg-[#0A192F] border border-[#1E3A5F] rounded-xl shadow-2xl py-1 z-50 text-xs"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-[#1E293B]">
                    Select Language
                  </div>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLang(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[#0F223D] transition-colors ${
                        currentLang === lang.code ? 'text-blue-400 font-semibold bg-[#0F223D]' : 'text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={onOpenSupport}
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-blue-400 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              <span>24/7 Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - Native Scalable Vector, Seamless on #0A192F */}
        <div 
          className="cursor-pointer group flex items-center"
          onClick={() => handleNavClick('home')}
          title="Barclay Online Bank - Bank Smarter. Live Better."
        >
          <BrandLogo variant="horizontal" size="md" />
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200">
          <button 
            onClick={() => handleNavClick('home')}
            className={`hover:text-blue-400 transition-colors ${activeTab === 'home' && !isAdminMode ? 'text-blue-400 font-bold' : ''}`}
          >
            Home
          </button>
          
          {currentUser && (
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-blue-400 transition-colors flex items-center gap-1.5 ${activeTab === 'dashboard' && !isAdminMode ? 'text-blue-400 font-bold' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>User Dashboard</span>
            </button>
          )}

          <button 
            onClick={onOpenAbout}
            className="hover:text-blue-400 transition-colors"
          >
            {t.aboutUs}
          </button>

          <button 
            onClick={onOpenSupport}
            className="hover:text-blue-400 transition-colors"
          >
            {t.contactSupport}
          </button>
        </nav>

        {/* Right CTA / User State */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl bg-[#0F223D] text-slate-200 hover:text-white border border-[#1E3A5F] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-blue-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] px-3.5 py-1.5 rounded-xl text-left transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold text-xs flex items-center justify-center border border-blue-300/40">
                    {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold leading-tight text-white">{currentUser.fullName}</p>
                    <p className="text-[10px] text-blue-400 font-mono leading-tight">Acc: {currentUser.accountNumber.slice(0, 4)}••••</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 bg-[#0A192F] border border-[#1E3A5F] rounded-2xl shadow-2xl py-2 z-50 text-xs"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-[#1E293B]">
                      <p className="font-bold text-white text-sm">{currentUser.fullName} {currentUser.surname}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 font-bold text-[10px] border border-blue-800">
                          {currentUser.tier}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {currentUser.country}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#0F223D] text-slate-200 flex items-center gap-2.5"
                    >
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span>My Accounts & Cards</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenNotifications();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#0F223D] text-slate-200 flex items-center gap-2.5"
                    >
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span>Notifications ({unreadNotificationsCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSupport();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#0F223D] text-slate-200 flex items-center gap-2.5"
                    >
                      <Headphones className="w-4 h-4 text-blue-400" />
                      <span>24/7 Priority Support</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          onOpenAdminAuth();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#002244] text-cyan-300 flex items-center gap-2.5 border-t border-[#1E293B]"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold">Management Portal</span>
                      </button>
                    )}

                    <div className="border-t border-[#1E293B] my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-rose-950/40 text-rose-300 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-[#0F223D] hover:bg-[#162C4E] border border-[#1E3A5F] transition-all"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
              >
                {t.createAccount}
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#0F223D] border border-[#1E3A5F]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071324] border-b border-[#1E293B] px-4 py-4 space-y-3">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'home' ? 'bg-[#0F223D] text-blue-400' : 'text-slate-200'
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-[#0F223D] text-blue-400' : 'text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>User Dashboard</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { onOpenAdminAuth(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-cyan-300 hover:bg-[#002244] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Management Portal</span>
            </button>
          )}

          <button
            onClick={() => { onOpenAbout(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-200 hover:bg-[#0F223D]"
          >
            {t.aboutUs}
          </button>

          <button
            onClick={() => { onOpenSupport(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-200 hover:bg-[#0F223D]"
          >
            {t.contactSupport}
          </button>

          {!currentUser && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-[#0F223D] border border-[#1E3A5F] text-xs font-bold text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-center"
              >
                Open Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
