import React from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  Check, 
  Trash2,
  Clock
} from 'lucide-react';
import { BankNotification } from '../types';
import { store } from '../lib/store';
import { BrandLogo } from './BrandLogo';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BankNotification[];
  userId: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  userId
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) store.markNotificationAsRead(n.id);
    });
  };

  const handleClearAll = () => {
    store.clearUserNotifications(userId);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'transaction':
        return <Clock className="w-4 h-4 text-cyan-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="sm" />
            <div>
              <h3 className="text-sm font-extrabold text-white">Account Notifications</h3>
              <p className="text-[10px] text-cyan-300">Real-time alerts, transfer statuses & compliance notices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-2 bg-[#001224] border-b border-[#00284d] flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Notifications: <strong className="text-white">{notifications.length}</strong></span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Mark all read
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={handleClearAll}
              className="text-rose-400 hover:text-rose-300 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>You have no notifications at this time.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => store.markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  notif.read
                    ? 'bg-[#00172e] border-[#002b52] opacity-80'
                    : 'bg-[#002244] border-cyan-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {getIcon(notif.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
