import React from 'react';
import { 
  X, 
  User, 
  Settings, 
  Clock, 
  Building2, 
  Sparkles, 
  Zap, 
  ArrowDownLeft, 
  ArrowDownRight, 
  CreditCard, 
  Headphones, 
  Lock, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface CustomerNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenProfile: () => void;
  onOpenAccountSettings: () => void;
  onOpenTransactionHistory: () => void;
  onOpenAccountInfo: () => void;
  onOpenTier2Upgrade: () => void;
  onOpenTier3Upgrade: () => void;
  onOpenDeposit: () => void;
  onOpenWithdrawalHistory: () => void;
  onOpenPaymentMethods: () => void;
  onOpenSupportCenter: () => void;
  onOpenSecuritySettings: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  onClick: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const CustomerNavDrawer: React.FC<CustomerNavDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenProfile,
  onOpenAccountSettings,
  onOpenTransactionHistory,
  onOpenAccountInfo,
  onOpenTier2Upgrade,
  onOpenTier3Upgrade,
  onOpenDeposit,
  onOpenWithdrawalHistory,
  onOpenPaymentMethods,
  onOpenSupportCenter,
  onOpenSecuritySettings,
  onLogout
}) => {
  const [copiedAcc, setCopiedAcc] = React.useState(false);

  if (!isOpen) return null;

  const copyAcc = () => {
    navigator.clipboard.writeText(currentUser.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Account & Identity',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          description: 'Personal details and verification status',
          icon: User,
          color: 'text-blue-400',
          onClick: onOpenProfile
        },
        {
          id: 'account_info',
          label: 'Account Information',
          description: 'IBAN, SWIFT code & routing details',
          icon: Building2,
          color: 'text-cyan-400',
          onClick: onOpenAccountInfo
        },
        {
          id: 'account_settings',
          label: 'Account Settings',
          description: 'Currency and interface preferences',
          icon: Settings,
          color: 'text-slate-300',
          onClick: onOpenAccountSettings
        }
      ]
    },
    {
      title: 'Transfers & Liquidity',
      items: [
        {
          id: 'deposit',
          label: 'Deposit Funds',
          description: 'Instant crypto & wire clearing',
          icon: ArrowDownLeft,
          color: 'text-emerald-400',
          onClick: onOpenDeposit
        },
        {
          id: 'payment_methods',
          label: 'Payment Methods',
          description: 'Platinum virtual card & crypto custody',
          icon: CreditCard,
          color: 'text-cyan-300',
          onClick: onOpenPaymentMethods
        },
        {
          id: 'tx_history',
          label: 'Transaction History',
          description: 'All past credits, transfers & receipts',
          icon: Clock,
          color: 'text-blue-400',
          onClick: onOpenTransactionHistory
        },
        {
          id: 'withdrawal_history',
          label: 'Withdrawal History',
          description: 'Outbound wire settlements & tracking',
          icon: ArrowDownRight,
          color: 'text-amber-400',
          onClick: onOpenWithdrawalHistory
        }
      ]
    },
    {
      title: 'Tier Limits & Upgrades',
      items: [
        {
          id: 'tier2',
          label: 'Tier 2 Upgrade',
          description: 'Increase daily limit to $50,000',
          icon: Sparkles,
          color: 'text-cyan-400',
          badge: currentUser.tier === 'Tier 1' ? 'Upgrade' : 'Active',
          onClick: onOpenTier2Upgrade
        },
        {
          id: 'tier3',
          label: 'Tier 3 Upgrade',
          description: 'Uncapped limits & institutional custody',
          icon: Zap,
          color: 'text-amber-400',
          badge: currentUser.tier === 'Tier 3' ? 'Active' : 'High Volume',
          onClick: onOpenTier3Upgrade
        }
      ]
    },
    {
      title: 'Security & Assistance',
      items: [
        {
          id: 'security',
          label: 'Security Settings',
          description: '4-digit PIN, passwords & authentication',
          icon: Lock,
          color: 'text-emerald-400',
          onClick: onOpenSecuritySettings
        },
        {
          id: 'support',
          label: 'Support Center',
          description: '24/7 Live Desk & official email concierge',
          icon: Headphones,
          color: 'text-cyan-400',
          onClick: onOpenSupportCenter
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#001020] border-l border-[#002b52] shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-300">
          
          {/* Top Header */}
          <div className="p-5 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <BrandLogo variant="horizontal" size="sm" />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#001a33] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Capsule */}
          <div className="p-5 bg-gradient-to-br from-[#00172e] to-[#001224] border-b border-[#002447] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 flex items-center justify-center font-black text-lg">
                  {currentUser.fullName.charAt(0)}{currentUser.surname.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{currentUser.fullName} {currentUser.surname}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {currentUser.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#000d1a] border border-[#002244] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Number</span>
                <span className="font-mono font-bold text-cyan-300 tracking-wider">{currentUser.accountNumber}</span>
              </div>
              <button
                onClick={copyAcc}
                className="px-2.5 py-1.5 rounded-lg bg-[#001e3d] hover:bg-[#002b54] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors text-[11px]"
              >
                {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 block">
                  {section.title}
                </span>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          item.onClick();
                        }}
                        className="w-full p-3 rounded-xl hover:bg-[#00172e] text-left transition-colors flex items-center justify-between group border border-transparent hover:border-[#00284d]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg bg-[#00172e] group-hover:bg-[#002040] flex items-center justify-center shrink-0 transition-colors border border-[#00284d]`}>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-cyan-300 border border-blue-800">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Logout Area */}
          <div className="p-4 bg-[#000d1a] border-t border-[#002447] shrink-0">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white border border-rose-800/60 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
