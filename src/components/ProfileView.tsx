import React, { useState } from 'react';
import { UserProfile } from '../types/market';
import {
  User,
  ShieldCheck,
  Award,
  Wallet,
  Globe,
  Clock,
  Edit3,
  Check,
  TrendingUp,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onOpenSettings,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(user.name);
  const [title, setTitle] = useState<string>(user.title);
  const [bio, setBio] = useState<string>(user.bio);
  const [timezone, setTimezone] = useState<string>(user.timezone);
  const [baseCurrency, setBaseCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY'>(user.baseCurrency);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      title,
      bio,
      timezone,
      baseCurrency,
    });
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-[#0a0f19] text-slate-200 select-none max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Institutional Trader Profile & KYC Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your corporate identity, execution credentials, connected custody wallets & compliance status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
          >
            <span>Terminal Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile configuration saved and updated successfully.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-[#0d1424] border border-slate-800 rounded-xl">
        {/* Left: Avatar & KYC Badge */}
        <div className="lg:col-span-4 flex flex-col items-center text-center p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-lg">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">{user.title}</p>
            <span className="text-[11px] font-mono text-slate-400 block mt-1">{user.email}</span>
          </div>

          {/* Account Tier & Verification Badges */}
          <div className="w-full pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.kycStatus}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Tier:</span>
              <span className="text-white font-semibold">{user.accountTier}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Trader ID:</span>
              <span className="text-slate-300 font-bold">{user.tradingId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Member Since:</span>
              <span className="text-slate-300">{user.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Right: Bio & Profile Details / Edit Form */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Trader Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Trading Strategy & Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Trading Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
                    <option value="Europe/London (UTC+0)">Europe/London (UTC+0)</option>
                    <option value="Asia/Tokyo (UTC+9)">Asia/Tokyo (UTC+9)</option>
                    <option value="Europe/Frankfurt (UTC+1)">Europe/Frankfurt (UTC+1)</option>
                    <option value="Asia/Singapore (UTC+8)">Asia/Singapore (UTC+8)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Base Ledger Currency</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Trading Philosophy & Bio</span>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">{user.bio}</p>
              </div>

              {/* Regional & Timezone settings */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">OPERATING TIMEZONE</span>
                  <span className="text-slate-200 font-semibold">{user.timezone}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">BASE CURRENCY</span>
                  <span className="text-cyan-400 font-bold">{user.baseCurrency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantitative Performance Scoreboard */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Audited Institutional Trading Metrics</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">All-Time Live Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">TOTAL TRADES</span>
                <span className="text-base font-bold text-white tabular-nums">{user.totalTrades.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">WIN RATIO</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">{user.winRate}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PROFIT FACTOR</span>
                <span className="text-base font-bold text-cyan-400 tabular-nums">{user.profitFactor}x</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DAILY CEILING</span>
                <span className="text-base font-bold text-white tabular-nums">$5,000,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Custody Wallets & Brokerage Bridges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Web3 Wallets */}
        <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Connected Web3 Custody Wallets</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">2 Active</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {user.connectedWallets.map((w) => (
              <div
                key={w.address}
                className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg"
              >
                <div>
                  <span className="font-semibold text-white block">{w.label}</span>
                  <span className="text-slate-400 text-[11px]">{w.chain} · {w.address}</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-bold">Verified</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Broker Bridges */}
        <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Institutional Brokerage Bridges</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">Ultra-Low Latency</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <div>
                <span className="font-semibold text-white block">MetaTrader 5 FIX 4.4 Bridge</span>
                <span className="text-slate-400 text-[11px]">Direct Liquidity Feed · Latency: 8ms</span>
              </div>
              <span className="text-emerald-400 text-[11px] font-bold">Connected</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <div>
                <span className="font-semibold text-white block">Interactive Brokers Gateway</span>
                <span className="text-slate-400 text-[11px]">US Equities & Options Clearing</span>
              </div>
              <span className="text-emerald-400 text-[11px] font-bold">Linked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
