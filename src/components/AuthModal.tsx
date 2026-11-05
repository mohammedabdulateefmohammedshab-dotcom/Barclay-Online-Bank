import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  Globe, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../lib/banksData';
import { store } from '../lib/store';
import { UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or 10-digit Account Number
  const [loginSecret, setLoginSecret] = useState(''); // Password or 4-digit PIN

  // Welcome Modal state upon successful registration
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);
  const [copiedAcc, setCopiedAcc] = useState(false);

  if (!isOpen) return null;

  // Password validation: letters, numbers, and at least one special character (!, ?, ., :, /, $, &, or @)
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!?. :/$&@]/.test(password);
  const isPasswordValid = hasLetters && hasNumbers && hasSpecial && password.length >= 8;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !surname.trim()) {
      setErrorMessage('Please provide both your First Name and Surname.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setErrorMessage('Secure PIN must be exactly 4 numeric digits.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password must contain at least 8 characters, letters, numbers, and at least one special character (!, ?, ., :, /, $, &, @).');
      return;
    }

    setLoading(true);
    try {
      const result = await store.registerUser({
        fullName,
        surname,
        email,
        country,
        pin,
        password
      });

      if (result.error || !result.user) {
        setErrorMessage(result.error || 'Registration failed');
      } else {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setCreatedUser(result.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your 10-digit Account Number or registered Email.');
      return;
    }

    if (!loginSecret.trim()) {
      setErrorMessage('Please enter your Secure PIN or Password.');
      return;
    }

    setLoading(true);
    try {
      const result = await store.loginUser(loginIdentifier, loginSecret);
      if (result.error || !result.user) {
        setErrorMessage(result.error || 'Authentication failed');
      } else {
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (accNum: string, pinCode: string, name: string) => {
    setLoginIdentifier(accNum);
    setLoginSecret(pinCode);
    setErrorMessage('');
  };

  const copyAccountNumber = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  // Welcome Screen when user registration completes
  if (createdUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-[#00172e] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-white text-center">
          {/* Official Brand Logo */}
          <div className="inline-block bg-white/95 p-3 rounded-2xl shadow-xl border border-cyan-400/40 mb-4">
            <img
              src="/logo.png"
              alt="Barclay Online Bank Logo"
              className="h-12 sm:h-14 w-auto object-contain select-none"
            />
          </div>

          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3 border border-cyan-400/40">
            <Sparkles className="w-6 h-6 animate-bounce" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800">
            Welcome to Barclay Online Bank
          </span>

          <h3 className="text-2xl font-extrabold text-white mt-3">
            Account Created Successfully!
          </h3>

          <p className="text-sm text-slate-300 mt-2">
            Welcome, <strong className="text-white">{createdUser.fullName} {createdUser.surname}</strong>. Your personal online banking profile is now active and protected with 256-bit encryption.
          </p>

          {/* Generated 10-Digit Account Number Card */}
          <div className="my-6 p-4 rounded-xl bg-[#002244] border border-[#003d73] shadow-inner text-left">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>YOUR UNIQUE 10-DIGIT ACCOUNT NUMBER</span>
              <span className="text-emerald-400 font-semibold">• Active</span>
            </div>
            
            <div className="flex items-center justify-between bg-[#001428] px-4 py-3 rounded-lg border border-[#002b52]">
              <span className="font-mono text-2xl font-black tracking-widest text-cyan-300">
                {createdUser.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => copyAccountNumber(createdUser.accountNumber)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
              >
                {copiedAcc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Account Tier: </span>
                <span className="font-semibold text-cyan-400">{createdUser.tier}</span>
              </div>
              <div>
                <span className="text-slate-400">Initial Balance: </span>
                <span className="font-semibold text-emerald-400">$1,000.00 USD</span>
              </div>
              <div>
                <span className="text-slate-400">Country: </span>
                <span className="font-medium text-white">{createdUser.country}</span>
              </div>
              <div>
                <span className="text-slate-400">SWIFT Auth Code: </span>
                <span className="font-mono font-bold text-amber-300">{createdUser.swiftVerificationCode}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onSuccess(createdUser);
              onClose();
            }}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to My Banking Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#00172e] border border-[#003866] rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header with Brand Logo & Mode Toggle */}
        <div className="px-6 pt-5 pb-4 border-b border-[#00284d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-md border border-cyan-400/40">
              <img
                src="/logo.png"
                alt="Barclay Online Bank Logo"
                className="h-10 w-auto object-contain select-none"
              />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">
                {mode === 'login' ? 'Sign In to Banking' : 'Create Bank Account'}
              </h2>
              <p className="text-[10px] text-cyan-300 font-medium">Bank Smarter. Live Better.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002850] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch buttons */}
        <div className="flex border-b border-[#00284d] bg-[#001326]">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center tracking-wide transition-all border-b-2 ${
              mode === 'login'
                ? 'text-cyan-400 border-cyan-400 bg-[#001c38]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center tracking-wide transition-all border-b-2 ${
              mode === 'register'
                ? 'text-cyan-400 border-cyan-400 bg-[#001c38]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  10-Digit Account Number or Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 4829103847 or user@barclay.bank"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Secure PIN (4 Digits) or Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginSecret}
                    onChange={(e) => setLoginSecret(e.target.value)}
                    placeholder="Enter your 4-digit PIN or password"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to My Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo quick-fill accounts */}
              <div className="pt-4 border-t border-[#002b54]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  One-Click Demo Test Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('4829103847', '1234', 'Alexander')}
                    className="p-2 rounded bg-[#002447] hover:bg-[#00305a] border border-[#003866] text-left text-xs transition-colors"
                  >
                    <p className="font-semibold text-white">Alexander H.</p>
                    <p className="text-[10px] text-cyan-400">Acc: 4829103847 (PIN: 1234)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('9182736450', '9876', 'Victoria')}
                    className="p-2 rounded bg-[#002447] hover:bg-[#00305a] border border-[#003866] text-left text-xs transition-colors"
                  >
                    <p className="font-semibold text-white">Victoria S.</p>
                    <p className="text-[10px] text-cyan-400">Acc: 9182736450 (PIN: 9876)</p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Robert"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Surname <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="e.g. Jenkins"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Country <span className="text-cyan-400">*</span> (30+ Countries Supported)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  >
                    {SUPPORTED_COUNTRIES.map(c => (
                      <option key={c.code} value={c.name} className="bg-[#00172e] text-white">
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secure PIN (Exactly 4 Digits) <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 4819"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Used for swift transaction approvals & fast PIN login.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Must contain letters, numbers, and special character"
                    className="w-full bg-[#002040] border border-[#003866] rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Criteria Checklist per Requirement 1 */}
                <div className="mt-2 p-2 rounded bg-[#001326] border border-[#002447] space-y-1 text-[10px]">
                  <p className="font-semibold text-slate-400">Password Requirements:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span className={`flex items-center gap-1 ${hasLetters ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Letters (a-z, A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumbers ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Numbers (0-9)
                    </span>
                    <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Special (!?. :/$&@)
                    </span>
                    <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> At least 8 characters
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || pin.length !== 4}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {loading ? 'Creating Account & Generating Number...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
