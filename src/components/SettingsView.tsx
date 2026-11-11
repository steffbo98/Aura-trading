import React, { useState } from 'react';
import { TerminalSettings } from '../types/market';
import {
  Sliders,
  Shield,
  Bell,
  LineChart,
  Key,
  Check,
  RotateCcw,
  Volume2,
  Lock,
  Smartphone,
  Copy,
} from 'lucide-react';

interface SettingsViewProps {
  settings: TerminalSettings;
  onUpdateSettings: (newSettings: TerminalSettings) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  const [activeCategory, setActiveCategory] = useState<'trading' | 'chart' | 'security' | 'alerts' | 'api'>('trading');
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const updateField = <K extends keyof TerminalSettings>(field: K, value: TerminalSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [field]: value,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = `aura_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    updateField('apiKey', newKey);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-[#0a0f19] text-slate-200 select-none max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Terminal Engine & Risk Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure order routing parameters, charting defaults, security policies, and institutional API keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded">
              <Check className="w-3.5 h-3.5" />
              <span>Settings Synced</span>
            </span>
          )}
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Category Nav + Settings Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Category Navigation (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-1 p-2 bg-[#0d1424] border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveCategory('trading')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeCategory === 'trading'
                ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/80'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Trading Execution & Margin</span>
          </button>

          <button
            onClick={() => setActiveCategory('chart')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeCategory === 'chart'
                ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/80'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <LineChart className="w-4 h-4 text-cyan-400" />
            <span>Chart & Analytics Defaults</span>
          </button>

          <button
            onClick={() => setActiveCategory('security')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeCategory === 'security'
                ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/80'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Security, 2FA & Privacy</span>
          </button>

          <button
            onClick={() => setActiveCategory('alerts')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeCategory === 'alerts'
                ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/80'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>News & Macro Audio Alerts</span>
          </button>

          <button
            onClick={() => setActiveCategory('api')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeCategory === 'api'
                ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/80'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Developer Keys & FIX Gateways</span>
          </button>
        </div>

        {/* Right Column: Settings Content Panels (8 cols) */}
        <div className="md:col-span-8 bg-[#0d1424] border border-slate-800 rounded-xl p-5 space-y-5">
          {/* Category 1: Trading Execution & Margin */}
          {activeCategory === 'trading' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Trading Engine Configuration</span>
              </h3>

              {/* Default Order Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Default Order Type</span>
                  <span className="text-slate-400 text-[11px]">Primary execution mode pre-selected in order ticket</span>
                </div>
                <div className="flex items-center gap-1">
                  {(['MARKET', 'LIMIT', 'STOP'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateField('defaultOrderType', t)}
                      className={`px-3 py-1 rounded transition-colors text-[11px] ${
                        settings.defaultOrderType === t
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Forex Leverage */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Default Forex Leverage</span>
                  <span className="text-slate-400 text-[11px]">Account purchasing multiplier for currency pairs</span>
                </div>
                <div className="flex items-center gap-1">
                  {[10, 30, 100, 200, 500].map((lev) => (
                    <button
                      key={lev}
                      onClick={() => updateField('defaultLeverage', lev)}
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                        settings.defaultLeverage === lev
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Slippage Tolerance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Slippage Tolerance</span>
                  <span className="text-slate-400 text-[11px]">Order auto-cancels if execution deviates beyond limit</span>
                </div>
                <div className="flex items-center gap-1">
                  {[0.1, 0.3, 0.5, 1.0].map((slip) => (
                    <button
                      key={slip}
                      onClick={() => updateField('maxSlippage', slip)}
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                        settings.maxSlippage === slip
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {slip}%
                    </button>
                  ))}
                </div>
              </div>

              {/* One-Click Fast Scalping Mode */}
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">One-Click Fast Scalping</span>
                  <span className="text-slate-400 text-[11px]">Bypasses secondary review dialogs for high-frequency order placement</span>
                </div>
                <button
                  onClick={() => updateField('oneClickTrading', !settings.oneClickTrading)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.oneClickTrading ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Audio Execution Cues */}
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-white block">Execution Audio Cues</span>
                    <span className="text-slate-400 text-[11px]">Chimes on successful trade fills, stop hits & order cancellations</span>
                  </div>
                </div>
                <button
                  onClick={() => updateField('audioCues', !settings.audioCues)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.audioCues ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>
          )}

          {/* Category 2: Chart & Analytics Defaults */}
          {activeCategory === 'chart' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <LineChart className="w-4 h-4 text-cyan-400" />
                <span>Chart & Visualization Preferences</span>
              </h3>

              {/* Default Timeframe */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Default Timeframe</span>
                  <span className="text-slate-400 text-[11px]">Initial candlestick aggregation interval upon loading terminal</span>
                </div>
                <div className="flex items-center gap-1">
                  {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => updateField('defaultTimeframe', tf)}
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                        settings.defaultTimeframe === tf
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Chart Rendering */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Default Chart Style</span>
                  <span className="text-slate-400 text-[11px]">Japanese Candlesticks, Smooth Area Line, or Heikin-Ashi</span>
                </div>
                <div className="flex items-center gap-1">
                  {(['candles', 'line', 'heikin'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateField('defaultChartType', mode)}
                      className={`px-3 py-1 rounded transition-colors text-[11px] uppercase ${
                        settings.defaultChartType === mode
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Background Gridlines */}
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Display Chart Gridlines</span>
                  <span className="text-slate-400 text-[11px]">Render subtle horizontal price and vertical time interval axes</span>
                </div>
                <button
                  onClick={() => updateField('showGridLines', !settings.showGridLines)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.showGridLines ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>
          )}

          {/* Category 3: Security, 2FA & Privacy */}
          {activeCategory === 'security' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Security & Access Controls</span>
              </h3>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">Hardware / TOTP 2-Factor Authentication</span>
                    <span className="text-slate-400 text-[11px]">Requires YubiKey or Authenticator code for large lot sizes & withdrawals</span>
                  </div>
                </div>
                <button
                  onClick={() => updateField('twoFactorAuth', !settings.twoFactorAuth)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.twoFactorAuth ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Auto-Lock Timer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-white block">Session Auto-Lock Timeout</span>
                    <span className="text-slate-400 text-[11px]">Automatically arms the PIN security vault after idle inactivity</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[5, 15, 30, 0].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateField('autoLockMinutes', mins)}
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                        settings.autoLockMinutes === mins
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mins === 0 ? 'Never' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Sessions List */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <span className="font-semibold text-white block">Authorized Active Sessions</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
                    <div>
                      <span className="text-slate-200 font-bold block">Chrome 131 · Linux x86_64</span>
                      <span className="text-emerald-400 text-[10px]">Current Active Session · IP 192.0.2.42</span>
                    </div>
                    <span className="text-slate-500">Active Now</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
                    <div>
                      <span className="text-slate-300 block">Safari Mobile · iOS 18 (iPhone 16 Pro)</span>
                      <span className="text-slate-500 text-[10px]">Authorized FaceID · 2 hours ago</span>
                    </div>
                    <button className="text-rose-400 hover:text-rose-300 text-[10px]">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category 4: News & Alerts */}
          {activeCategory === 'alerts' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>News & Macro Alerts</span>
              </h3>

              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Breaking News Sound Alerts</span>
                  <span className="text-slate-400 text-[11px]">Audible chime when high-impact breaking news is released</span>
                </div>
                <button
                  onClick={() => updateField('newsSoundAlerts', !settings.newsSoundAlerts)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.newsSoundAlerts ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Economic Release Countdown Notices</span>
                  <span className="text-slate-400 text-[11px]">Pre-alert warning 5 minutes before FOMC, CPI, and NFP announcements</span>
                </div>
                <button
                  onClick={() => updateField('economicAlerts', !settings.economicAlerts)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.economicAlerts ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div>
                  <span className="font-semibold text-white block">Take Profit / Stop Loss Push Notices</span>
                  <span className="text-slate-400 text-[11px]">System notifications when bracket orders are filled</span>
                </div>
                <button
                  onClick={() => updateField('pushNotifications', !settings.pushNotifications)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.pushNotifications ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>
          )}

          {/* Category 5: Developer Keys & FIX Gateways */}
          {activeCategory === 'api' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Institutional Developer & FIX Gateways</span>
              </h3>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
                <div>
                  <span className="font-semibold text-white block">Active Terminal REST & WebSocket API Key</span>
                  <span className="text-slate-400 text-[11px]">Used for programmatic order execution and market depth feeds</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={settings.apiKey}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono text-xs"
                  />
                  <button
                    onClick={handleCopyApiKey}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleRegenerateKey}
                    className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <span className="font-semibold text-white block">Institutional FIX 4.4 Bridge Target</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>SenderCompID: <strong className="text-slate-200">AURA_CORP_01</strong></div>
                  <div>TargetCompID: <strong className="text-slate-200">DMA_PRIMARY_G10</strong></div>
                  <div>HeartBtInt: <strong className="text-slate-200">30s</strong></div>
                  <div>SSL Encryption: <strong className="text-emerald-400">TLS 1.3 Active</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
