import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  Headphones,
  Check,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { UserProfile, AdminRoleRecord } from '../types';
import { LANGUAGES, SupportedLanguage, TRANSLATIONS } from '../lib/languages';
import { BrandLogo } from './BrandLogo';
import { store } from '../lib/store';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeAdmin?: AdminRoleRecord | null;
  isAdminMode: boolean;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdminAuth?: () => void;
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
  activeAdmin,
  isAdminMode,
  onOpenAuth,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleNavClick = (tab: string, sectionId?: string) => {
    if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f17]/95 backdrop-blur-md text-white border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Mark & Wordmark (Single Line) */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
          title="Aegis Online Bank"
        >
          <BrandLogo variant="emblem" size="xs" theme="dark" />
          <span className="text-base sm:text-lg font-extrabold tracking-tight uppercase text-white">
            AEGISBANK
          </span>
        </button>

        {/* Zone 2: Clean Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'home' && !isAdminMode ? 'text-white font-semibold' : ''
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'dashboard' && !isAdminMode ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('home', 'services-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('home', 'solutions-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Solutions
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.aboutUs}
          </button>

          <button
            type="button"
            onClick={onOpenSupport}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.contactSupport}
          </button>
        </nav>

        {/* Zone 3: Primary Action / User Account Controls & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Compact Language Selector on Desktop */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#141824] border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
              title="Change Language"
            >
              <span>{currentLangObj.flag}</span>
              <span className="font-medium hidden lg:inline">{currentLangObj.native}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-44 bg-[#131620] border border-white/10 rounded-xl shadow-2xl py-1 z-50 text-xs"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onChangeLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/[0.06] transition-colors ${
                      currentLang === lang.code ? 'text-blue-400 font-semibold bg-white/[0.04]' : 'text-slate-200'
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

          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* Notification Bell */}
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg bg-[#141824] text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-blue-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#141824] hover:bg-[#1a1f2e] border border-white/10 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#2176ff] to-[#7c3aed] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {currentUser.photoUrl ? (
                      <img
                        src={currentUser.photoUrl}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
                      </>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold leading-tight text-white whitespace-nowrap">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono leading-tight whitespace-nowrap">
                      {currentUser.accountNumber.slice(0, 4)}••••
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-[#131620] border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-xs"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-white/[0.08]">
                      <p className="font-bold text-white text-sm">{currentUser.fullName} {currentUser.surname}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-blue-400 font-semibold">{currentUser.tier}</span>
                        <span>·</span>
                        <span>{currentUser.country}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-white/[0.06] text-slate-200 flex items-center gap-2.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span>My Accounts & Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenNotifications();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-white/[0.06] text-slate-200 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span>Notifications ({unreadNotificationsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenSupport();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-white/[0.06] text-slate-200 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Headphones className="w-4 h-4 text-blue-400" />
                      <span>24/7 Support</span>
                    </button>

                    {(currentUser.role === 'admin' || store.isCurrentUserAdmin()) && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleAdminView();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-white/[0.06] text-blue-300 flex items-center gap-2.5 border-t border-white/[0.08] cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold">Management Portal</span>
                      </button>
                    )}

                    <div className="border-t border-white/[0.08] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-rose-950/40 text-rose-300 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : activeAdmin ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleAdminView}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-xs font-bold text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Management Portal</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141824] hover:bg-rose-950/40 border border-white/10 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                title="Logout Administrator"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 shadow-md shadow-blue-600/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.login}
            </button>
          )}

          {/* Clean 3-Line Hamburger Menu Button (Matches Video Mobile Header) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e111a] border-t border-white/[0.08] px-5 py-5 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'home' ? 'bg-white/[0.06] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-white/[0.06] text-blue-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard</span>
            </button>
          )}

          {(currentUser?.role === 'admin' || activeAdmin || store.isCurrentUserAdmin()) && (
            <button
              type="button"
              onClick={() => {
                onToggleAdminView();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-blue-400 hover:bg-white/[0.06] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Management Portal</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('home', 'services-section')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06]"
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('home', 'solutions-section')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06]"
          >
            Solutions
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAbout();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06]"
          >
            {t.aboutUs}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenSupport();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06]"
          >
            {t.contactSupport}
          </button>

          {!currentUser && !activeAdmin && (
            <div className="pt-3 grid grid-cols-2 gap-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-4 rounded-full bg-[#161a26] border border-white/10 text-xs font-bold text-white text-center"
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-4 rounded-full bg-gradient-to-r from-[#2176ff] via-[#4f46e5] to-[#7c3aed] text-xs font-bold text-white text-center"
              >
                {t.createAccount}
              </button>
            </div>
          )}

          {!currentUser && activeAdmin && (
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-950/50 border border-rose-800/50 text-xs font-bold text-rose-300 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout} ({activeAdmin.email})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
