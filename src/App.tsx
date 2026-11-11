/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MarketAsset, Position, ClosedTrade, UserProfile, TerminalSettings } from './types/market';
import { INITIAL_ASSETS, INITIAL_POSITIONS, INITIAL_CLOSED_TRADES } from './data/mockData';
import { TopBar } from './components/TopBar';
import { MarketTickerBar } from './components/MarketTickerBar';
import { ChartAnalytics } from './components/ChartAnalytics';
import { OrderBookTape } from './components/OrderBookTape';
import { TradingTicket } from './components/TradingTicket';
import { PortfolioAnalytics } from './components/PortfolioAnalytics';
import { NewsSentimentFeed } from './components/NewsSentimentFeed';
import { NftMarketplaceView } from './components/NftMarketplaceView';
import { SecurityVaultModal } from './components/SecurityVaultModal';
import { AiAnalystModal } from './components/AiAnalystModal';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('terminal');
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [activeAsset, setActiveAsset] = useState<MarketAsset>(INITIAL_ASSETS[0]);
  const [selectedOrderBookPrice, setSelectedOrderBookPrice] = useState<number | null>(null);

  // Portfolio state
  const [cashBalance, setCashBalance] = useState<number>(64315.0);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(INITIAL_CLOSED_TRADES);

  // Security & Vault State
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [showVaultModal, setShowVaultModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // User Profile & Authentication State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aura_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'usr-001',
      name: 'Ezra Bosire',
      email: 'ezrahbosire1@gmail.com',
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
  });

  // Terminal Settings State
  const [settings, setSettings] = useState<TerminalSettings>(() => {
    const saved = localStorage.getItem('aura_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      defaultOrderType: 'MARKET',
      defaultLeverage: 100,
      maxSlippage: 0.3,
      oneClickTrading: false,
      audioCues: true,
      defaultTimeframe: '15m',
      defaultChartType: 'candles',
      showGridLines: true,
      twoFactorAuth: true,
      autoLockMinutes: 15,
      maskBalances: false,
      newsSoundAlerts: true,
      economicAlerts: true,
      pushNotifications: true,
      apiKey: 'aura_live_948204b7a19c48f29d821a',
    };
  });

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem('aura_user', JSON.stringify(updated));
  };

  const handleUpdateSettings = (updated: TerminalSettings) => {
    setSettings(updated);
    localStorage.setItem('aura_settings', JSON.stringify(updated));
  };

  const handleResetSettings = () => {
    const defaultSettings: TerminalSettings = {
      defaultOrderType: 'MARKET',
      defaultLeverage: 100,
      maxSlippage: 0.3,
      oneClickTrading: false,
      audioCues: true,
      defaultTimeframe: '15m',
      defaultChartType: 'candles',
      showGridLines: true,
      twoFactorAuth: true,
      autoLockMinutes: 15,
      maskBalances: false,
      newsSoundAlerts: true,
      economicAlerts: true,
      pushNotifications: true,
      apiKey: 'aura_live_948204b7a19c48f29d821a',
    };
    setSettings(defaultSettings);
    localStorage.setItem('aura_settings', JSON.stringify(defaultSettings));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('aura_user', JSON.stringify(loggedInUser));
  };

  // Asset filtering in terminal side-panel
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<'ALL' | 'FOREX' | 'STOCKS' | 'NFTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update active mark price in positions when asset ticks
  const handlePriceUpdate = useCallback((newPrice: number) => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.symbol === activeAsset.symbol) {
          const priceDiff = pos.side === 'BUY' ? newPrice - pos.entryPrice : pos.entryPrice - newPrice;
          let pnl = 0;

          if (pos.assetType === 'FOREX') {
            // standard lot = 100,000 units
            pnl = priceDiff * pos.size * 100000;
          } else if (pos.assetType === 'NFTS') {
            const rate = 3100; // approximate USD per ETH
            pnl = priceDiff * pos.size * rate;
          } else {
            pnl = priceDiff * pos.size;
          }

          const pnlPercentage = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;

          return {
            ...pos,
            markPrice: newPrice,
            pnl,
            pnlPercentage,
          };
        }
        return pos;
      })
    );
  }, [activeAsset.symbol]);

  // Execute trade from ticket or instant sweep
  const handleExecuteTrade = (newPos: Omit<Position, 'id' | 'pnl' | 'pnlPercentage' | 'timestamp'>) => {
    const id = `pos-${Date.now()}`;
    const position: Position = {
      ...newPos,
      id,
      pnl: 0,
      pnlPercentage: 0,
      timestamp: Date.now(),
    };

    setPositions((prev) => [position, ...prev]);
    setCashBalance((prev) => Math.max(0, prev - newPos.margin));
  };

  // Close an active position
  const handleClosePosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const closed: ClosedTrade = {
      id: `trade-${Date.now()}`,
      symbol: pos.symbol,
      assetType: pos.assetType,
      side: pos.side,
      size: pos.size,
      entryPrice: pos.entryPrice,
      exitPrice: pos.markPrice,
      realizedPnl: pos.pnl,
      openTime: pos.timestamp,
      closeTime: Date.now(),
      reason: 'Manual Close',
    };

    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    setClosedTrades((prev) => [closed, ...prev]);
    setCashBalance((prev) => prev + pos.margin + pos.pnl);
  };

  // Deposit funds
  const handleDepositFunds = (amount: number) => {
    setCashBalance((prev) => prev + amount);
  };

  // Reset portfolio to initial defaults
  const handleResetPortfolio = () => {
    setCashBalance(64315.0);
    setPositions(INITIAL_POSITIONS);
    setClosedTrades(INITIAL_CLOSED_TRADES);
  };

  // Restore state from exported backup
  const handleRestoreState = (state: { cashBalance: number; positions: Position[]; closedTrades: ClosedTrade[] }) => {
    setCashBalance(state.cashBalance);
    setPositions(state.positions);
    setClosedTrades(state.closedTrades);
  };

  // Select asset by symbol (used from news or ticker links)
  const handleSelectAssetBySymbol = (symbol: string) => {
    const found = assets.find((a) => a.symbol === symbol);
    if (found) {
      setActiveAsset(found);
      setActiveTab('terminal');
    }
  };

  // Filtered asset list for terminal sidebar
  const filteredAssets = assets.filter((a) => {
    if (assetCategoryFilter !== 'ALL' && a.category !== assetCategoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate total net worth
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalMarginUsed = positions.reduce((acc, p) => acc + p.margin, 0);
  const totalNetWorth = cashBalance + totalMarginUsed + totalUnrealizedPnl;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b12] text-slate-100 overflow-hidden font-sans">
      {/* Universal TopBar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalNetWorth={totalNetWorth}
        isMasked={isMasked}
        setIsMasked={setIsMasked}
        isVaultLocked={isVaultLocked}
        onOpenVault={() => setShowVaultModal(true)}
        onOpenAiAnalyst={() => setShowAiModal(true)}
        activeAssetSymbol={activeAsset.symbol}
        user={user}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Streaming Market Ticker Carousel */}
      <MarketTickerBar
        assets={assets}
        selectedSymbol={activeAsset.symbol}
        onSelectAsset={(asset) => {
          setActiveAsset(asset);
          if (activeTab !== 'terminal') setActiveTab('terminal');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto">
        {/* TAB 1: TERMINAL VIEW (Pro Trading Desk) */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-100px)] p-2 gap-2">
            {/* Left Column: Asset Watchlist Selector (240px) */}
            <aside className="w-full lg:w-64 bg-[#0a0f19] border border-slate-800 rounded-lg flex flex-col shrink-0 select-none max-h-[300px] lg:max-h-none overflow-hidden">
              <div className="p-2.5 border-b border-slate-800 bg-[#0d1424]">
                <input
                  type="text"
                  placeholder="Search assets / pairs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {/* Sector filter tabs */}
                <div className="flex items-center gap-1 mt-2 text-[10px] font-mono">
                  {(['ALL', 'FOREX', 'STOCKS', 'NFTS'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAssetCategoryFilter(cat)}
                      className={`flex-1 py-0.5 rounded transition-colors ${
                        assetCategoryFilter === cat
                          ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset list */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-1">
                {filteredAssets.map((asset) => {
                  const isSelected = asset.symbol === activeAsset.symbol;
                  const isUp = asset.change24h >= 0;
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => setActiveAsset(asset)}
                      className={`w-full flex items-center justify-between p-2 text-left rounded transition-colors ${
                        isSelected ? 'bg-slate-800 border-l-2 border-cyan-400' : 'hover:bg-slate-850'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-100">{asset.symbol}</span>
                          <span className="text-[10px] font-mono text-slate-500">{asset.category}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">
                          {asset.name}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs font-semibold text-slate-100 tabular-nums block">
                          {asset.category === 'FOREX'
                            ? asset.price.toFixed(asset.symbol.includes('JPY') ? 2 : 4)
                            : asset.category === 'NFTS'
                            ? `${asset.price.toFixed(2)} ${asset.currency || 'ETH'}`
                            : `$${asset.price.toFixed(2)}`}
                        </span>
                        <span
                          className={`text-[10px] tabular-nums font-semibold ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Center Column: Interactive Canvas Chart (Flexible) */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <div className="flex-1 min-h-[380px]">
                <ChartAnalytics asset={activeAsset} onPriceUpdate={handlePriceUpdate} />
              </div>

              {/* Bottom Quick Positions Ribbon */}
              <div className="h-44 bg-[#0a0f19] border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d1424] border-b border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">ACTIVE POSITIONS ({positions.length})</span>
                    <span className="text-slate-500">·</span>
                    <span className={totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      PnL: {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                  >
                    <span>Full Portfolio Desk</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {positions.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono">
                      No active positions open. Place an order via the ticket on the right.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#090d15] text-slate-500 text-[11px]">
                        <tr>
                          <th className="py-1 px-3">Symbol</th>
                          <th className="py-1 px-3">Side</th>
                          <th className="py-1 px-3 text-right">Size</th>
                          <th className="py-1 px-3 text-right">Entry</th>
                          <th className="py-1 px-3 text-right">Mark</th>
                          <th className="py-1 px-3 text-right">Margin</th>
                          <th className="py-1 px-3 text-right">Unrealized P&L</th>
                          <th className="py-1 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {positions.map((p) => {
                          const isUp = p.pnl >= 0;
                          return (
                            <tr key={p.id} className="hover:bg-slate-800/30">
                              <td className="py-1.5 px-3 font-semibold text-white">{p.symbol}</td>
                              <td className="py-1.5 px-3">
                                <span className={p.side === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {p.side} {p.leverage > 1 ? `(${p.leverage}x)` : ''}
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-right tabular-nums text-slate-300">{p.size}</td>
                              <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">{p.entryPrice.toFixed(2)}</td>
                              <td className="py-1.5 px-3 text-right tabular-nums text-slate-300">{p.markPrice.toFixed(2)}</td>
                              <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">${p.margin.toFixed(0)}</td>
                              <td className="py-1.5 px-3 text-right tabular-nums font-semibold">
                                <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                                  {isUp ? '+' : ''}${p.pnl.toFixed(2)} ({isUp ? '+' : ''}{p.pnlPercentage.toFixed(1)}%)
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-center">
                                <button
                                  onClick={() => handleClosePosition(p.id)}
                                  className="px-2 py-0.5 text-[10px] font-medium bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded"
                                >
                                  Close
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Book & Execution Dock (330px) */}
            <div className="w-full lg:w-80 flex flex-col gap-2 shrink-0">
              <div className="h-64">
                <OrderBookTape
                  asset={activeAsset}
                  onSelectPrice={(p) => setSelectedOrderBookPrice(p)}
                />
              </div>
              <div className="flex-1 min-h-[380px]">
                <TradingTicket
                  asset={activeAsset}
                  availableCash={cashBalance}
                  onExecuteTrade={handleExecuteTrade}
                  selectedPrice={selectedOrderBookPrice}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EQUITIES / STOCKS VIEW */}
        {activeTab === 'stocks' && (
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Global Equities & US Stocks Terminal
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  High-liquidity blue chips, mega-cap tech equities with valuation multiples, dividend yields & beta metrics.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1.5 rounded">
                NYSE / NASDAQ Real-Time Data Stream
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.filter((a) => a.category === 'STOCKS').map((stock) => {
                const isPositive = stock.change24h >= 0;
                return (
                  <div
                    key={stock.symbol}
                    className="p-5 bg-[#0d1424] border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-lg font-bold text-white">{stock.symbol}</span>
                        <h4 className="text-xs text-slate-400">{stock.name}</h4>
                      </div>
                      <span
                        className={`flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                          isPositive ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{stock.change24h.toFixed(2)}%
                      </span>
                    </div>

                    <div className="text-2xl font-bold font-mono text-white tabular-nums">
                      ${stock.price.toFixed(2)}
                    </div>

                    {/* Stock Multiples */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block">MKT CAP</span>
                        <span className="text-slate-200 font-semibold">{stock.marketCap}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">P/E RATIO</span>
                        <span className="text-slate-200 font-semibold">{stock.peRatio}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">BETA</span>
                        <span className="text-slate-200 font-semibold">{stock.beta}</span>
                      </div>
                    </div>

                    {/* Quick Trade / Open in Chart */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setActiveAsset(stock);
                          setActiveTab('terminal');
                        }}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs rounded transition-colors text-center"
                      >
                        Open In Terminal
                      </button>
                      <button
                        onClick={() => {
                          setActiveAsset(stock);
                          setShowAiModal(true);
                        }}
                        className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-xs"
                        title="AI Strategy"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: FOREX TRADING DESK */}
        {activeTab === 'forex' && (
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Institutional Forex Currency Exchange
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Interbank spreads, pip calculators, margin leverage up to 1:500, and institutional liquidity feeds.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded">
                  ECN Direct Market Access (0.8 Pip Spreads)
                </span>
              </div>
            </div>

            {/* Currency Pairs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.filter((a) => a.category === 'FOREX').map((pair) => {
                const isPositive = pair.change24h >= 0;
                const spreadPips = pair.spread || 1.0;
                const pipOffset = pair.symbol.includes('JPY') ? 0.01 : 0.0001;
                const bidPrice = pair.price - (spreadPips * pipOffset) / 2;
                const askPrice = pair.price + (spreadPips * pipOffset) / 2;

                return (
                  <div
                    key={pair.symbol}
                    className="p-5 bg-[#0d1424] border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-lg font-bold text-white">{pair.symbol}</span>
                        <h4 className="text-xs text-slate-400">{pair.name}</h4>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/60">
                        Spread: {spreadPips} pips
                      </span>
                    </div>

                    {/* Dual Rate Bid/Ask Execution Boxes */}
                    <div className="grid grid-cols-2 gap-2 text-center font-mono">
                      <button
                        onClick={() => {
                          setActiveAsset(pair);
                          setActiveTab('terminal');
                        }}
                        className="p-3 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/80 rounded-lg group transition-colors"
                      >
                        <span className="text-[10px] text-rose-400 uppercase font-bold block mb-1">
                          SELL / BID
                        </span>
                        <span className="text-base font-bold text-white tabular-nums">
                          {bidPrice.toFixed(pair.symbol.includes('JPY') ? 2 : 4)}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveAsset(pair);
                          setActiveTab('terminal');
                        }}
                        className="p-3 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/80 rounded-lg group transition-colors"
                      >
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                          BUY / ASK
                        </span>
                        <span className="text-base font-bold text-white tabular-nums">
                          {askPrice.toFixed(pair.symbol.includes('JPY') ? 2 : 4)}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <span>24h Range:</span>
                      <span className="text-slate-200">
                        {pair.low24h.toFixed(pair.symbol.includes('JPY') ? 2 : 4)} - {pair.high24h.toFixed(pair.symbol.includes('JPY') ? 2 : 4)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: NFTS MARKETPLACE & COLLECTIBLES */}
        {activeTab === 'nfts' && (
          <NftMarketplaceView
            nftAssets={assets.filter((a) => a.category === 'NFTS')}
            onSelectNft={(nft) => {
              setActiveAsset(nft);
              setActiveTab('terminal');
            }}
            onExecuteTrade={handleExecuteTrade}
            availableCash={cashBalance}
          />
        )}

        {/* TAB 5: NEWS TRADING & MACRO SENTIMENT */}
        {activeTab === 'news' && (
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full h-[calc(100vh-120px)]">
            <NewsSentimentFeed
              onSelectAssetBySymbol={handleSelectAssetBySymbol}
              onOpenAiAnalyst={() => setShowAiModal(true)}
              activeAsset={activeAsset}
            />
          </div>
        )}

        {/* TAB 6: MULTI-ASSET PORTFOLIO TRACKING */}
        {activeTab === 'portfolio' && (
          <PortfolioAnalytics
            cashBalance={cashBalance}
            positions={positions}
            closedTrades={closedTrades}
            isMasked={isMasked}
            onClosePosition={handleClosePosition}
            onDepositFunds={handleDepositFunds}
            onResetPortfolio={handleResetPortfolio}
            onOpenVault={() => setShowVaultModal(true)}
          />
        )}

        {/* TAB 7: TRADER PROFILE VIEW */}
        {activeTab === 'profile' && (
          user ? (
            <ProfileView
              user={user}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onOpenSettings={() => setActiveTab('settings')}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-12 bg-[#0d1424] border border-slate-800 rounded-xl space-y-4 font-mono">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-sans">Institutional Session Inactive</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authenticate with your corporate credentials to view audited performance history, KYC compliance records, and connected custody vaults.
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Sign In to Profile
              </button>
            </div>
          )
        )}

        {/* TAB 8: TERMINAL SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetDefaults={handleResetSettings}
          />
        )}
      </main>

      {/* Security Vault & PIN Lock Modal */}
      <SecurityVaultModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        isVaultLocked={isVaultLocked}
        onToggleVaultLock={(locked) => setIsVaultLocked(locked)}
        isMasked={isMasked}
        onToggleMask={() => setIsMasked((m) => !m)}
        positions={positions}
        closedTrades={closedTrades}
        cashBalance={cashBalance}
        onRestoreState={handleRestoreState}
      />

      {/* AI Market Analyst Modal */}
      <AiAnalystModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        asset={activeAsset}
        onApplyTradeSetup={(entry, sl, tp) => {
          setSelectedOrderBookPrice(entry);
          setActiveTab('terminal');
        }}
      />

      {/* Institutional Login & Registration Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultEmail={user?.email || 'ezrahbosire1@gmail.com'}
      />
    </div>
  );
}
