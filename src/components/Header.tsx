import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Lock, 
  LayoutDashboard, 
  CreditCard,
  Headphones,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { LANGUAGES, SupportedLanguage, TRANSLATIONS } from '../lib/languages';

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
  onToggleAdminView,
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
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#001f3f] text-white border-b border-[#003366] shadow-lg">
      {/* Top security bar */}
      <div className="bg-[#001428] px-4 py-1.5 text-xs text-slate-300 flex justify-between items-center border-b border-[#002447]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium tracking-wide">Barclay Online Banking Portal</span>
          <span className="hidden md:inline text-slate-400">| 256-Bit TLS Military Grade Encryption</span>
          <span className="hidden lg:inline text-emerald-400 font-semibold">• Systems Online & Synchronized</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-[#002850] px-2.5 py-1 rounded border border-[#003d73] transition-colors"
              title="Change Language & Translation"
            >
              <span>{currentLangObj.flag}</span>
              <span className="font-medium">{currentLangObj.native}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-1 w-44 bg-[#001b33] border border-[#003d73] rounded shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-[#002b52]">
                  Select Language
                </div>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChangeLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[#002b52] transition-colors ${
                      currentLang === lang.code ? 'text-cyan-400 font-semibold bg-[#002242]' : 'text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.native}</span>
                    </span>
                    {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onOpenSupport}
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span>24/7 Helpline</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onSelectTab && onSelectTab('home')}
          title="Barclay Online Bank - Bank Smarter. Live Better."
        >
          <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-md border border-cyan-400/40 hover:border-cyan-300 transition-all flex items-center">
            <img
              src="/logo.png"
              alt="Barclay Online Bank Logo"
              className="h-9 sm:h-11 w-auto object-contain select-none transition-transform group-hover:scale-[1.02]"
            />
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-200">
          <button 
            onClick={() => onSelectTab ? onSelectTab('home') : {}}
            className={`hover:text-cyan-400 transition-colors ${activeTab === 'home' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            {t.aboutUs ? 'Home' : 'Home'}
          </button>
          
          {currentUser && (
            <button 
              onClick={() => onSelectTab && onSelectTab('dashboard')}
              className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'text-cyan-400 font-semibold' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>User Dashboard</span>
            </button>
          )}

          <button 
            onClick={onOpenAbout}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.aboutUs}
          </button>

          <button 
            onClick={onOpenSupport}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.contactSupport}
          </button>
        </nav>

        {/* Right CTA / User State */}
        <div className="flex items-center gap-3">
          {/* Admin Switcher / Mode indicator */}
          <button
            onClick={onToggleAdminView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide border transition-all ${
              isAdminMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 hover:bg-amber-400' 
                : 'bg-[#002d5a] text-cyan-300 border-[#004080] hover:bg-[#003870] hover:border-cyan-400'
            }`}
            title="Switch between Customer Online Banking and Barclay Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAdminMode ? 'Customer View' : 'Admin Portal'}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg bg-[#002850] text-slate-200 hover:text-white border border-[#003d73] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#002850] hover:bg-[#003566] border border-[#003d73] px-3 py-1.5 rounded-lg text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center border border-cyan-400">
                    {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-white">{currentUser.fullName}</p>
                    <p className="text-[10px] text-cyan-300 leading-tight">Acc: {currentUser.accountNumber.slice(0, 4)}••••</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-[#00172e] border border-[#003d73] rounded-lg shadow-2xl py-2 z-50 text-xs"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#002a4f]">
                      <p className="font-semibold text-white">{currentUser.fullName} {currentUser.surname}</p>
                      <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold text-[10px] border border-cyan-800">
                          {currentUser.tier}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {currentUser.country}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab && onSelectTab('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#002850] text-slate-200 flex items-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Accounts & Cards</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenNotifications();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#002850] text-slate-200 flex items-center gap-2"
                    >
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Notifications ({unreadNotificationsCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSupport();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#002850] text-slate-200 flex items-center gap-2"
                    >
                      <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                      <span>24/7 Priority Support</span>
                    </button>

                    <div className="border-t border-[#002a4f] my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-950/40 text-rose-300 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-[#002b54] hover:bg-[#00386e] border border-[#004080] transition-colors"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                {t.createAccount}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
