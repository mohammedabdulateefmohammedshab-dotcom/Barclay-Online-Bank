import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  Mail
} from 'lucide-react';
import { store } from '../lib/store';
import { UserProfile, SupportConversation } from '../types';

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

  useEffect(() => {
    if (isOpen && currentUser) {
      store.markConversationReadByUser(currentUser.uid);
    }
  }, [isOpen, currentUser, messages.length]);

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
      {/* Floating Blue Circular Chat Bubble matching video bottom-right */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Aegis Live Support Chat"
          className="relative w-14 h-14 rounded-full bg-[#1a73e8] hover:bg-[#2563eb] text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6 fill-white text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-[#0b0d13]">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Dark Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 h-[480px] bg-[#131620] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
          {/* Top Bar */}
          <div className="p-4 bg-[#0d0f17] border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#2176ff] to-[#7c3aed] flex items-center justify-center text-white">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Aegis Live Desk</h4>
                <p className="text-[11px] text-slate-400">24/7 Client Support Concierge</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Support Email Banner */}
          <div className="px-4 py-2 bg-[#161a26] border-b border-white/[0.06] text-[10px] flex items-center justify-between text-slate-300 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Direct Desk:</span>
            </span>
            <a
              href="mailto:newzelebarclaysupport@gmail.com"
              className="text-blue-400 font-mono font-semibold hover:underline truncate ml-2"
            >
              newzelebarclaysupport@gmail.com
            </a>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#0b0d13]/60">
            {messages.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">How can we assist you today?</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto">
                    Send a message below to connect directly with an Aegis Online Bank specialist.
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
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5 px-1">
                      <span>{m.senderName}</span>
                      <span>·</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-[#2176ff] to-[#6366f1] text-white rounded-br-none'
                          : 'bg-[#191d2b] border border-white/10 text-slate-100 rounded-bl-none'
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
          <div className="p-3 bg-[#0d0f17] border-t border-white/[0.08] shrink-0">
            {currentUser ? (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#161a26] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-[#2176ff] to-[#7c3aed] text-white flex items-center justify-center transition-opacity disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="text-center py-1">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
                >
                  Sign In to chat with client support
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
