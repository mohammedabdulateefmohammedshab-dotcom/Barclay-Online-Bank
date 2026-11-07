import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Headphones, 
  Mail, 
  Check, 
  CheckCheck, 
  Clock, 
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { store } from '../lib/store';
import { UserProfile, ChatMessage, SupportConversation } from '../types';
import { BrandLogo } from './BrandLogo';

interface LiveChatWidgetProps {
  currentUser: UserProfile | null;
  onOpenAuth?: () => void;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [conversations, setConversations] = useState<SupportConversation[]>(store.getConversations());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setConversations(store.getConversations());
    });
    return unsub;
  }, []);

  const currentUserId = currentUser?.uid || 'guest_client';
  const currentConv = conversations.find(c => c.userId === currentUserId);
  const messages = currentConv?.messages || [];
  const unreadCount = currentConv?.unreadByUserCount || 0;

  // Mark messages as read when window is open
  useEffect(() => {
    if (isOpen && currentUser) {
      store.markConversationReadByUser(currentUser.uid);
    }
  }, [isOpen, currentUser, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser) {
      onOpenAuth?.();
      return;
    }

    store.sendChatMessage({
      userId: currentUser.uid,
      senderRole: 'user',
      message: inputText.trim(),
      senderName: `${currentUser.fullName} ${currentUser.surname}`
    });

    setInputText('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 cursor-pointer border border-cyan-400/30"
          title="Open Barclay 24/7 Live Support Chat"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span>Live Support</span>
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 h-[500px] bg-[#001428] border border-blue-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Top Bar */}
          <div className="p-4 bg-[#001020] border-b border-[#002b52] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#001020]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Barclay Live Desk</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">Institutional Customer Concierge</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002244] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Fast-Response Email Banner (Requirement 5) */}
          <div className="px-4 py-2 bg-gradient-to-r from-blue-950/60 to-[#00172e] border-b border-[#00284d] text-[10px] flex items-center justify-between text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>Fast-Response Direct Email:</span>
            </div>
            <a 
              href="mailto:newzelebarclaysupport@gmail.com" 
              className="text-emerald-400 font-mono font-bold hover:underline ml-1"
            >
              newzelebarclaysupport@gmail.com
            </a>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#001224]/50">
            {messages.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">How can we assist you today?</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto">
                    Type a message below to chat live with a Barclay Clearing & Support Specialist.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderRole === 'user';
                return (
                  <div 
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-0.5 px-1">
                      <span>{m.senderName}</span>
                      <span>•</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div 
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                          : 'bg-[#002244] border border-[#003866] text-slate-100 rounded-bl-none shadow'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#001020] border-t border-[#002b52] shrink-0">
            {currentUser ? (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your inquiry or wire question..."
                  className="flex-1 bg-[#001d38] border border-[#00335c] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="text-center py-1">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  Sign In to message live support
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
