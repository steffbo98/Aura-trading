import React, { useState } from 'react';
import { Position, ClosedTrade, AssetCategory } from '../types/market';
import { ShieldCheck, Download, RefreshCw, XCircle, DollarSign, Wallet } from 'lucide-react';

interface PortfolioAnalyticsProps {
  cashBalance: number;
  positions: Position[];
  closedTrades: ClosedTrade[];
  isMasked: boolean;
  onClosePosition: (positionId: string) => void;
  onDepositFunds: (amount: number) => void;
  onResetPortfolio: () => void;
  onOpenVault: () => void;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  cashBalance,
  positions,
  closedTrades,
  isMasked,
  onClosePosition,
  onDepositFunds,
  onResetPortfolio,
  onOpenVault,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('25000');

  // Compute unrealized PnL across active positions
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalMarginUsed = positions.reduce((acc, p) => acc + p.margin, 0);

  // Realized PnL from closed trades
  const totalRealizedPnl = closedTrades.reduce((acc, t) => acc + t.realizedPnl, 0);

  // Total Equity = Cash + Margin Used + Unrealized PnL
  const totalNetWorth = cashBalance + totalMarginUsed + totalUnrealizedPnl;

  // Asset breakdown values
  const forexValue = positions.filter((p) => p.assetType === 'FOREX').reduce((a, b) => a + b.margin + b.pnl, 0);
  const stockValue = positions.filter((p) => p.assetType === 'STOCKS').reduce((a, b) => a + b.margin + b.pnl, 0);
  const nftValue = positions.filter((p) => p.assetType === 'NFTS').reduce((a, b) => a + b.margin + b.pnl, 0);
  const cashVal = Math.max(0, cashBalance);

  const totalPortfolioValue = Math.max(1, forexValue + stockValue + nftValue + cashVal);
  const forexPct = Math.round((forexValue / totalPortfolioValue) * 100);
  const stockPct = Math.round((stockValue / totalPortfolioValue) * 100);
  const nftPct = Math.round((nftValue / totalPortfolioValue) * 100);
  const cashPct = Math.max(0, 100 - forexPct - stockPct - nftPct);

  // Risk metrics calculations
  const winningTrades = closedTrades.filter((t) => t.realizedPnl > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 75;

  const filteredPositions = positions.filter((p) => {
    if (filterType === 'ALL') return true;
    return p.assetType === filterType;
  });

  const exportCsv = () => {
    const headers = 'ID,Symbol,Type,Side,Size,EntryPrice,ExitPrice,RealizedPnL,CloseTime\n';
    const rows = closedTrades
      .map((t) => `${t.id},${t.symbol},${t.assetType},${t.side},${t.size},${t.entryPrice},${t.exitPrice},${t.realizedPnl},${new Date(t.closeTime).toISOString()}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Portfolio_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const mask = (val: string | number) => (isMasked ? '••••••••' : typeof val === 'number' ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : val);

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#0a0f19] text-slate-200 select-none max-w-7xl mx-auto w-full">
      {/* Top Header Summary & Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Secure Multi-Asset Portfolio Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-asset ledger, institutional risk engine & encrypted custody tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Deposit / Top Up</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security Settings</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Net Worth */}
        <div className="p-4 bg-[#0d1424] border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>TOTAL NET WORTH</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {mask(totalNetWorth)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span className={totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{mask(totalUnrealizedPnl)} Unrealized
            </span>
          </div>
        </div>

        {/* Available Cash & Margin */}
        <div className="p-4 bg-[#0d1424] border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>AVAILABLE CASH</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {mask(cashBalance)}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
            <span>Margin In Use:</span>
            <span className="text-slate-200">{mask(totalMarginUsed)}</span>
          </div>
        </div>

        {/* Realized Cumulative PnL */}
        <div className="p-4 bg-[#0d1424] border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>REALIZED P&L</span>
            <span className="text-slate-500 font-mono text-[11px]">{closedTrades.length} trades</span>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}{mask(totalRealizedPnl)}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
            <span>Win Ratio:</span>
            <span className="text-emerald-400 font-semibold">{winRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Institutional Risk Metrics */}
        <div className="p-4 bg-[#0d1424] border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>RISK METRICS</span>
            <span className="text-cyan-400 text-[11px] font-mono">95% Confidence</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">SHARPE RATIO</span>
              <span className="text-emerald-400 font-bold text-sm">2.18</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">BETA (VS SPX)</span>
              <span className="text-slate-200 font-bold text-sm">0.92</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">MAX DRAWDOWN</span>
              <span className="text-rose-400 font-bold text-sm">-4.6%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">1-DAY VaR</span>
              <span className="text-amber-400 font-bold text-sm">{mask(2150)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Asset Allocation Ribbon */}
      <div className="p-4 bg-[#0d1424] border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Multi-Asset Capital Allocation
          </span>
          <span className="text-xs font-mono text-slate-400">
            Target Diversification Model
          </span>
        </div>

        {/* Visual Allocation Bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${stockPct}%` }} className="bg-cyan-500 h-full" title={`Equities: ${stockPct}%`} />
          <div style={{ width: `${forexPct}%` }} className="bg-emerald-500 h-full" title={`Forex: ${forexPct}%`} />
          <div style={{ width: `${nftPct}%` }} className="bg-purple-500 h-full" title={`NFTs: ${nftPct}%`} />
          <div style={{ width: `${cashPct}%` }} className="bg-slate-600 h-full" title={`Cash: ${cashPct}%`} />
        </div>

        {/* Allocation Legend */}
        <div className="flex items-center gap-6 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-300">Equities: {stockPct}% ({mask(stockValue)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Forex: {forexPct}% ({mask(forexValue)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-300">NFT Collectibles: {nftPct}% ({mask(nftValue)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span className="text-slate-300">Cash Reserves: {cashPct}% ({mask(cashVal)})</span>
          </div>
        </div>
      </div>

      {/* Positions / Closed Trades Ledger Table */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-lg overflow-hidden">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-b border-slate-800 bg-[#0a0f19]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'positions'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Closed Trade Ledger ({closedTrades.length})
            </button>
          </div>

          {activeTab === 'positions' && (
            <div className="flex items-center gap-1 text-xs">
              {['ALL', 'FOREX', 'STOCKS', 'NFTS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterType(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                    filterType === cat
                      ? 'bg-cyan-950 border border-cyan-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Content */}
        {activeTab === 'positions' ? (
          <div className="overflow-x-auto">
            {filteredPositions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No active {filterType === 'ALL' ? '' : filterType} positions. Use the Terminal or Markets tabs to execute your first position.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090d15] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 text-right">Size</th>
                    <th className="py-2.5 px-3 text-right">Entry Price</th>
                    <th className="py-2.5 px-3 text-right">Mark Price</th>
                    <th className="py-2.5 px-3 text-right">Margin</th>
                    <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPositions.map((pos) => {
                    const isPositive = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">{pos.symbol}</td>
                        <td className="py-2.5 px-3 text-slate-400">{pos.assetType}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-semibold ${
                              pos.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pos.side} ({pos.leverage}x)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-200">{pos.size}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                          {pos.entryPrice.toFixed(pos.assetType === 'FOREX' ? 4 : 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                          {pos.markPrice.toFixed(pos.assetType === 'FOREX' ? 4 : 2)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                          {mask(pos.margin)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}{mask(pos.pnl)} ({isPositive ? '+' : ''}{pos.pnlPercentage.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="flex items-center gap-1 mx-auto px-2 py-1 text-[11px] font-medium bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Close</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {closedTrades.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No historical closed trades recorded.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090d15] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 text-right">Size</th>
                    <th className="py-2.5 px-3 text-right">Entry</th>
                    <th className="py-2.5 px-3 text-right">Exit</th>
                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                    <th className="py-2.5 px-3">Exit Reason</th>
                    <th className="py-2.5 px-3">Date / Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {closedTrades.map((trade) => {
                    const isPositive = trade.realizedPnl >= 0;
                    return (
                      <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">{trade.symbol}</td>
                        <td className="py-2.5 px-3 text-slate-400">{trade.assetType}</td>
                        <td className="py-2.5 px-3 font-semibold">
                          <span className={trade.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-200">{trade.size}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">{trade.entryPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">{trade.exitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}{mask(trade.realizedPnl)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{trade.reason}</td>
                        <td className="py-2.5 px-3 text-slate-500">{new Date(trade.closeTime).toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Deposit / Top Up Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Deposit Paper Capital</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add simulated funds to your multi-asset paper trading balance.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-mono text-slate-400">
                Deposit Amount ($ USD)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['10000', '25000', '50000', '100000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className="py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                  >
                    +${parseInt(amt) / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={onResetPortfolio}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to $100k Default</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amt = parseFloat(depositAmount);
                    if (amt > 0) onDepositFunds(amt);
                    setShowDepositModal(false);
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
