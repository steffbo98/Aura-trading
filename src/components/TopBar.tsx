import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types/market';
import { Lock, Eye, EyeOff, ShieldCheck, Zap, User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalNetWorth: number;
  isMasked: boolean;
  setIsMasked: (masked: boolean | ((prev: boolean) => boolean)) => void;
  isVaultLocked: boolean;
  onOpenVault: () => void;
  onOpenAiAnalyst: () => void;
  activeAssetSymbol: string;
  user: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  totalNetWorth,
  isMasked,
  setIsMasked,
  isVaultLocked,
  onOpenVault,
  onOpenAiAnalyst,
  activeAssetSymbol,
  user,
  onOpenLogin,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'terminal', label: 'Terminal' },
    { id: 'stocks', label: 'Equities' },
    { id: 'forex', label: 'Forex' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'news', label: 'News & Macro' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  return (
    <header className="flex items-center justify-between gap-8 px-5 py-3 border-b border-slate-800 bg-[#0d131f] text-slate-200 shrink-0 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab('terminal')}
          className="text-left font-bold text-lg tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap"
        >
          AURA <span className="text-cyan-400 font-mono text-sm tracking-widest font-normal">TERMINAL</span>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions & User Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* AI Strategist Button */}
        <button
          onClick={onOpenAiAnalyst}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 rounded hover:bg-cyan-900/60 transition-colors whitespace-nowrap"
          title={`Generate AI Market Synthesis for ${activeAssetSymbol}`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">AI Strategist</span>
        </button>

        {/* Portfolio Net Worth pill & Privacy Mask Toggle */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono">
          <span className="text-slate-400">Vault:</span>
          <span className="font-semibold text-emerald-400 tabular-nums">
            {isMasked ? '••••••••' : `$${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
          <button
            onClick={() => setIsMasked((prev) => !prev)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            title={isMasked ? 'Reveal Balances' : 'Mask Balances'}
          >
            {isMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* User Account / Profile Menu */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full transition-colors text-xs"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400/80 shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium text-slate-200 hidden sm:inline truncate max-w-[100px]">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0d1424] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs font-mono">
                <div className="px-3.5 py-2 border-b border-slate-800/80">
                  <div className="font-bold text-white truncate font-sans text-xs">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="text-[10px] text-cyan-400 mt-1 font-bold">{user.accountTier}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Trader Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Terminal Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenVault();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800/60 transition-colors text-left"
                  >
                    {isVaultLocked ? (
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Security Vault {isVaultLocked ? '(Locked)' : ''}</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
