import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  Globe, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  HelpCircle,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../lib/banksData';
import { store } from '../lib/store';
import { UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
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

  // Forgot Password State
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');

  // Welcome Modal state upon successful registration (Requirement 1 & 3: Do NOT auto-login, show welcome message & account number)
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);
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
    setInfoMessage('');

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
        setRegisteredUser(result.user);
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
    setInfoMessage('');

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!recoveryIdentifier.trim()) {
      setErrorMessage('Please enter your registered email address or 10-digit account number.');
      return;
    }

    setLoading(true);
    try {
      const res = await store.recoverPassword(recoveryIdentifier);
      if (res.error || !res.success) {
        setErrorMessage(res.error || 'Unable to locate account for recovery.');
      } else {
        setInfoMessage(res.message || 'Password recovery instructions processed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Password recovery failed.');
    } finally {
      setLoading(false);
    }
  };


  const copyAccountNumber = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  // Welcome Screen when user registration completes
  // Requirement 1 & 3: Display welcome message with name & 10-digit account number, then redirect to login page (DO NOT auto-login).
  if (registeredUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-[#0A192F] border border-blue-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 text-white text-center">
          
          {/* Redesigned Emblem Brand Logo */}
          <div className="flex justify-center mb-3">
            <BrandLogo variant="stacked" size="md" showTagline={false} />
          </div>

          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3 border border-blue-400/40">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
            Registration Complete
          </span>

          <h3 className="text-2xl font-black text-white mt-3">
            Welcome to Barclay Online Bank!
          </h3>

          <p className="text-sm text-slate-300 mt-2">
            Welcome, <strong className="text-white">{registeredUser.fullName} {registeredUser.surname}</strong>. Your account has been securely registered in our system. Please take note of your account number below to sign in.
          </p>

          {/* Generated 10-Digit Account Number Card */}
          <div className="my-6 p-4 rounded-2xl bg-[#0F223D] border border-blue-500/30 shadow-inner text-left">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>YOUR UNIQUE 10-DIGIT ACCOUNT NUMBER</span>
              <span className="text-emerald-400 font-semibold">• Active & Verified</span>
            </div>
            
            <div className="flex items-center justify-between bg-[#0A192F] px-4 py-3 rounded-xl border border-blue-500/40">
              <span className="font-mono text-2xl font-black tracking-widest text-blue-400">
                {registeredUser.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => copyAccountNumber(registeredUser.accountNumber)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                {copiedAcc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Account Tier: </span>
                <span className="font-semibold text-blue-300">{registeredUser.tier}</span>
              </div>
              <div>
                <span className="text-slate-400">Opening Bonus: </span>
                <span className="font-semibold text-emerald-400">$1,000.00 USD</span>
              </div>
              <div>
                <span className="text-slate-400">Country: </span>
                <span className="font-medium text-white">{registeredUser.country}</span>
              </div>
              <div>
                <span className="text-slate-400">SWIFT Auth Code: </span>
                <span className="font-mono font-bold text-amber-300">{registeredUser.swiftVerificationCode}</span>
              </div>
            </div>
          </div>

          {/* Notice: Redirects to Sign In (Requirement 3: Do not automatically log users into accounts) */}
          <button
            onClick={() => {
              const acc = registeredUser.accountNumber;
              setRegisteredUser(null);
              setMode('login');
              setLoginIdentifier(acc);
              setInfoMessage(`Account ${acc} registered! Please enter your PIN or Password to log in.`);
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Login Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A192F] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header with Redesigned Brand Logo */}
        <div className="px-6 pt-5 pb-4 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="md" />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch buttons */}
        <div className="flex border-b border-[#1E293B] bg-[#071324]">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center tracking-wide transition-all border-b-2 ${
              mode === 'login'
                ? 'text-blue-400 border-blue-500 bg-[#0F223D]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); setInfoMessage(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center tracking-wide transition-all border-b-2 ${
              mode === 'register'
                ? 'text-blue-400 border-blue-500 bg-[#0F223D]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot'); setErrorMessage(''); setInfoMessage(''); }}
            className={`py-3 px-3 text-xs font-semibold text-center tracking-wide transition-all border-b-2 ${
              mode === 'forgot'
                ? 'text-blue-400 border-blue-500 bg-[#0F223D]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Recovery
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-blue-950/70 border border-blue-700 text-blue-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {mode === 'login' && (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  10-Digit Account Number or Registered Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 4829103847 or user@barclay.bank"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Secure PIN (4 Digits) or Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMessage(''); setInfoMessage(''); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginSecret}
                    onChange={(e) => setLoginSecret(e.target.value)}
                    placeholder="Enter your 4-digit PIN or password"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to My Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === 'register' && (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Robert"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Surname <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="e.g. Jenkins"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Country <span className="text-blue-400">*</span></span>
                  </span>
                  <span className="text-[10px] text-slate-400">30+ Countries Supported</span>
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-9"
                    required
                  >
                    {SUPPORTED_COUNTRIES.map(c => (
                      <option key={c.code} value={c.name} className="bg-[#0A192F] text-white">
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secure PIN (Exactly 4 Digits) <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 4819"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Used for quick transaction authorization & PIN login.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Must contain letters, numbers, and special character"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                <div className="mt-2 p-2.5 rounded-xl bg-[#071324] border border-[#1E293B] space-y-1 text-[10px]">
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
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {loading ? 'Registering & Generating Number...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            /* Forgot Password Recovery */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-xs text-slate-300">
                <p>Enter the email address or 10-digit account number associated with your Barclay Online Bank account. We will securely verify your account and issue temporary recovery credentials.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Email or 10-Digit Account Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="e.g. 4829103847 or alexander@barclay.bank"
                    className="w-full bg-[#0F223D] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Searching & Verifying...' : 'Recover Password'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
