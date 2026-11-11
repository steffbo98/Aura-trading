import React, { useState } from 'react';
import { UserProfile } from '../types/market';
import { ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2, Zap, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = 'ezrahbosire1@gmail.com',
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState<string>(defaultEmail);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [name, setName] = useState<string>('Ezra Bosire');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultUser: UserProfile = {
    id: 'usr-001',
    name: name.trim() || 'Ezra Bosire',
    email: email.trim() || 'ezrahbosire1@gmail.com',
    avatar: '/src/assets/images/trader_profile_avatar_1794384379938.jpg',
    title: 'Senior Quantitative Strategist & Portfolio Lead',
    accountTier: 'Tier 3 · Institutional DMA',
    kycStatus: 'Verified Level 2',
    tradingId: 'AURA-849204',
    memberSince: 'March 2024',
    bio: 'Multi-asset quantitative scalping and macro discretionary execution across G10 FX pairs, high-beta tech equities, and algorithmic digital collectibles.',
    timezone: 'America/New_York (UTC-5)',
    baseCurrency: 'USD',
    totalTrades: 1482,
    winRate: 73.4,
    profitFactor: 2.42,
    connectedWallets: [
      { address: '0x71C85B3D44A1829...4F9E', chain: 'Ethereum', label: 'Primary Cold Vault' },
      { address: '7xXb82Nq9sF...9B2K', chain: 'Solana', label: 'High-Freq Phantom' },
    ],
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Authentication verified. Welcome to AURA Terminal.');
      setTimeout(() => {
        onLoginSuccess(defaultUser);
        onClose();
        setSuccessMessage(null);
      }, 900);
    }, 700);
  };

  const handleDemoSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(defaultUser);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Institutional Authentication</h3>
              <span className="text-[11px] font-mono text-slate-400">Secure Direct Market Access Gateway</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-lg flex items-center gap-2 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <>
            {/* Quick Demo Instant Access */}
            <button
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-700/80 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant Institutional Trader Login (Demo)</span>
            </button>

            {/* Tab switch: Sign In vs Register */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`py-1.5 rounded transition-colors text-center ${
                  tab === 'signin' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Trader Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-1.5 rounded transition-colors text-center ${
                  tab === 'register' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register Account
              </button>
            </div>

            {/* Login / Register Form */}
            <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Corporate or Trader Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Access Passphrase</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                  />
                  <span>Remember Session</span>
                </label>
                <button type="button" className="text-cyan-400 hover:text-cyan-300">
                  Reset Credentials
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'signin' ? 'Authenticate Session' : 'Create Trader Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
