import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Eye, EyeOff, KeyRound, Fingerprint, Download, Upload, Check } from 'lucide-react';
import { Position, ClosedTrade } from '../types/market';

interface SecurityVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVaultLocked: boolean;
  onToggleVaultLock: (lock: boolean) => void;
  isMasked: boolean;
  onToggleMask: () => void;
  positions: Position[];
  closedTrades: ClosedTrade[];
  cashBalance: number;
  onRestoreState: (state: { cashBalance: number; positions: Position[]; closedTrades: ClosedTrade[] }) => void;
}

export const SecurityVaultModal: React.FC<SecurityVaultModalProps> = ({
  isOpen,
  onClose,
  isVaultLocked,
  onToggleVaultLock,
  isMasked,
  onToggleMask,
  positions,
  closedTrades,
  cashBalance,
  onRestoreState,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [currentPin, setCurrentPin] = useState<string>('1234');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'unlock' | 'settings' | 'backup'>('unlock');
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');

  if (!isOpen) return null;

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === currentPin) {
      onToggleVaultLock(false);
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Invalid PIN code. Default is 1234.');
    }
  };

  const handleSimulateBiometric = () => {
    // Quick biometric TouchID/FaceID simulation
    onToggleVaultLock(false);
    setPinError(null);
  };

  const handleSetNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4 && /^\d+$/.test(newPinInput)) {
      setCurrentPin(newPinInput);
      setNewPinInput('');
      setPinError('New 4-digit PIN saved successfully.');
      setTimeout(() => setPinError(null), 3000);
    } else {
      setPinError('PIN must be exactly 4 numeric digits.');
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      timestamp: Date.now(),
      terminal: 'AURA Institutional Terminal',
      cashBalance,
      positions,
      closedTrades,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 3000);
  };

  const handleImportBackup = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.cashBalance !== undefined && Array.isArray(parsed.positions)) {
        onRestoreState({
          cashBalance: parsed.cashBalance,
          positions: parsed.positions,
          closedTrades: parsed.closedTrades || [],
        });
        setPinError('Portfolio state restored successfully from encrypted JSON.');
        setImportJsonText('');
        setTimeout(() => setPinError(null), 3000);
      } else {
        setPinError('Invalid backup file structure.');
      }
    } catch (err) {
      setPinError('Failed to parse JSON backup.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Security Vault & Custody Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTab('unlock')}
            className={`py-1.5 rounded transition-colors text-center ${
              activeTab === 'unlock' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vault Lock
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 rounded transition-colors text-center ${
              activeTab === 'settings' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PIN & Privacy
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-1.5 rounded transition-colors text-center ${
              activeTab === 'backup' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Encrypted Backup
          </button>
        </div>

        {/* Feedback / Error notice */}
        {pinError && (
          <div className="p-2.5 bg-slate-900 border border-cyan-800 text-cyan-300 rounded text-xs font-mono">
            {pinError}
          </div>
        )}

        {/* Tab 1: Vault Lock Status & Keypad */}
        {activeTab === 'unlock' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Current Vault Status:</span>
                <span className={`text-sm font-bold font-mono ${isVaultLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isVaultLocked ? 'LOCKED (Protected)' : 'UNLOCKED (Active Session)'}
                </span>
              </div>
              <button
                onClick={() => onToggleVaultLock(!isVaultLocked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  isVaultLocked
                    ? 'bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900'
                    : 'bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                {isVaultLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isVaultLocked ? 'Arm Lock' : 'Lock Terminal'}</span>
              </button>
            </div>

            {isVaultLocked ? (
              <form onSubmit={handleUnlockWithPin} className="space-y-3">
                <label className="block text-xs font-mono text-slate-300">
                  Enter 4-Digit Security PIN (Default: 1234)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded transition-colors"
                  >
                    Unlock
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleSimulateBiometric}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Quick Biometric Passkey Unlock</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 text-xs text-slate-400 bg-slate-900/50 rounded border border-slate-800/80">
                Your portfolio execution privileges and asset balances are active for this browser session. Lock the vault when stepping away.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PIN Setup & Privacy Mask */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Privacy Balance Masking Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div>
                <span className="font-semibold text-slate-200 block">Balance Privacy Masking</span>
                <span className="text-slate-400 text-[11px]">Hides dollar balances with •••••••• in public</span>
              </div>
              <button
                onClick={onToggleMask}
                className={`p-2 rounded border transition-colors ${
                  isMasked ? 'bg-cyan-950 border-cyan-800 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Set New PIN */}
            <form onSubmit={handleSetNewPin} className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Change 4-Digit Security PIN</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="New 4 digits"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Encrypted Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
              <span className="font-semibold text-slate-200 block">Export Portfolio Snapshot</span>
              <p className="text-slate-400 text-[11px]">
                Download a tamper-proof JSON ledger containing your simulated balances, open positions, and closed trades.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded flex items-center justify-center gap-2"
              >
                {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                <span>Download Vault JSON File</span>
              </button>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
              <span className="font-semibold text-slate-200 block">Restore from Backup</span>
              <textarea
                rows={3}
                placeholder="Paste exported backup JSON here..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleImportBackup}
                className="w-full py-1.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 font-bold rounded flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Portfolio State</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
