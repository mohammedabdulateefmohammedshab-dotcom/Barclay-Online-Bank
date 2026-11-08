import React, { useState } from 'react';
import { X, Settings, Bell, DollarSign, Globe, Shield, CheckCircle2, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [currency, setCurrency] = useState('USD');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [wireAlerts, setWireAlerts] = useState(true);
  const [security2FA, setSecurity2FA] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-md bg-[#001020] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 bg-[#000d1a] border-b border-[#002447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Account Settings</h3>
              <p className="text-xs text-slate-400">Preferences, Currency & Notification Toggles</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#001e3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {saved && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Preferences saved and synchronized!</span>
            </div>
          )}

          {/* Currency Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Primary Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#001428] border border-[#002f5e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="USD">USD ($) — United States Dollar</option>
              <option value="GBP">GBP (£) — British Pound Sterling</option>
              <option value="EUR">EUR (€) — Euro</option>
            </select>
          </div>

          {/* Notifications Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#002447]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Communication & Security Alerts
            </span>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#001428] border border-[#00264d]">
              <div>
                <p className="text-xs font-bold text-white">Deposit & Settlement Notifications</p>
                <p className="text-[11px] text-slate-400">Instant alerts when funds are cleared</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 bg-[#000d1a] border-slate-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#001428] border border-[#00264d]">
              <div>
                <p className="text-xs font-bold text-white">Outbound Wire Confirmations</p>
                <p className="text-[11px] text-slate-400">Receive receipt on SWIFT dispatches</p>
              </div>
              <input
                type="checkbox"
                checked={wireAlerts}
                onChange={(e) => setWireAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 bg-[#000d1a] border-slate-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#001428] border border-[#00264d]">
              <div>
                <p className="text-xs font-bold text-white">High-Value Transaction Guards</p>
                <p className="text-[11px] text-slate-400">Automated fraud prevention threshold</p>
              </div>
              <input
                type="checkbox"
                checked={security2FA}
                onChange={(e) => setSecurity2FA(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 bg-[#000d1a] border-slate-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>

      </div>
    </div>
  );
};
