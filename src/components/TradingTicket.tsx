import React, { useState } from 'react';
import { MarketAsset, Position } from '../types/market';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TradingTicketProps {
  asset: MarketAsset;
  availableCash: number;
  onExecuteTrade: (position: Omit<Position, 'id' | 'pnl' | 'pnlPercentage' | 'timestamp'>) => void;
  selectedPrice?: number | null;
}

export const TradingTicket: React.FC<TradingTicketProps> = ({
  asset,
  availableCash,
  onExecuteTrade,
  selectedPrice,
}) => {
  const isForex = asset.category === 'FOREX';
  const isNFT = asset.category === 'NFTS';

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>(
    selectedPrice ? selectedPrice.toString() : asset.price.toString()
  );
  const [size, setSize] = useState<string>(isForex ? '0.1' : isNFT ? '1' : '10');
  const [leverage, setLeverage] = useState<number>(isForex ? 100 : isNFT ? 1 : 2);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Update limit price if user clicks an orderbook price
  React.useEffect(() => {
    if (selectedPrice) {
      setLimitPrice(selectedPrice.toString());
      setOrderType('LIMIT');
    }
  }, [selectedPrice]);

  const numSize = parseFloat(size) || 0;
  const execPrice = orderType === 'MARKET' ? asset.price : parseFloat(limitPrice) || asset.price;

  // Notional value & required margin calculation
  let notionalValue = 0;
  let requiredMargin = 0;

  if (isForex) {
    // 1 standard lot = 100,000 base currency
    notionalValue = numSize * 100000 * execPrice;
    requiredMargin = notionalValue / leverage;
  } else if (isNFT) {
    // ETH / SOL converted to USD estimate (~$3100 for ETH, ~$210 for SOL)
    const rate = asset.currency === 'SOL' ? 210 : 3100;
    notionalValue = numSize * execPrice * rate;
    requiredMargin = notionalValue / leverage;
  } else {
    // Stocks
    notionalValue = numSize * execPrice;
    requiredMargin = notionalValue / leverage;
  }

  const estFees = Math.max(0.5, notionalValue * 0.0004);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSize <= 0) return;

    if (requiredMargin > availableCash) {
      setFeedback('Insufficient available cash for required margin.');
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    onExecuteTrade({
      symbol: asset.symbol,
      assetType: asset.category,
      side,
      size: numSize,
      entryPrice: execPrice,
      markPrice: asset.price,
      margin: requiredMargin,
      leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });

    setFeedback(`Executed ${side} ${numSize} ${asset.symbol} @ ${execPrice.toFixed(isForex ? 4 : 2)}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f19] border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1424] px-4 py-2.5 text-xs">
        <span className="font-semibold text-slate-200">Order Execution</span>
        <span className="font-mono text-slate-400">
          Avail: <strong className="text-emerald-400 font-semibold tabular-nums">${availableCash.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-3 gap-3 overflow-y-auto text-xs">
        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`flex items-center justify-center gap-1.5 py-1.5 font-semibold rounded-md transition-colors ${
              side === 'BUY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>BUY / LONG</span>
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`flex items-center justify-center gap-1.5 py-1.5 font-semibold rounded-md transition-colors ${
              side === 'SELL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>SELL / SHORT</span>
          </button>
        </div>

        {/* Order Type Segment */}
        <div className="flex items-center justify-between gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded">
          {(['MARKET', 'LIMIT', 'STOP'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`flex-1 py-1 text-center font-medium rounded transition-colors text-[11px] ${
                orderType === type
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Limit Price Input if not market */}
        {orderType !== 'MARKET' && (
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Order Limit Price
            </label>
            <input
              type="number"
              step="any"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Size Input with Quick Increments */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>{isForex ? 'Volume (Lots)' : isNFT ? 'Tokens' : 'Shares'}</span>
            <span className="text-slate-500">
              {isForex ? '1 Lot = 100k' : isNFT ? 'Collectibles' : 'Equities'}
            </span>
          </div>
          <input
            type="number"
            step={isForex ? '0.01' : '1'}
            min="0.01"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 mt-1.5">
            {(isForex ? ['0.01', '0.05', '0.1', '0.5', '1.0'] : isNFT ? ['1', '2', '3', '5'] : ['10', '25', '50', '100']).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSize(preset)}
                className="flex-1 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage Selector for Forex / CFDs */}
        {isForex && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Account Leverage</span>
              <span className="text-cyan-400 font-semibold">{leverage}x</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[10, 30, 100, 200, 500].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                    leverage === lev
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Risk Management: TP & SL */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          <div>
            <label className="block text-[10px] font-mono text-rose-400 mb-0.5">
              Stop Loss (Price)
            </label>
            <input
              type="number"
              step="any"
              placeholder="Optional"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-emerald-400 mb-0.5">
              Take Profit (Price)
            </label>
            <input
              type="number"
              step="any"
              placeholder="Optional"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="p-2 bg-slate-900/80 border border-slate-800 rounded text-[11px] font-mono space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Notional Value:</span>
            <span className="text-slate-200 tabular-nums">${notionalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Margin Required:</span>
            <span className="text-cyan-400 font-semibold tabular-nums">${requiredMargin.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Estimated Fees:</span>
            <span className="text-slate-400 tabular-nums">${estFees.toFixed(2)}</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="flex items-center gap-1.5 p-2 bg-cyan-950/70 border border-cyan-800 text-cyan-300 rounded text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Submit Execution Button */}
        <button
          type="submit"
          className={`w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 mt-auto ${
            side === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              : 'bg-rose-500 hover:bg-rose-400 text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Execute {side} Order</span>
        </button>
      </form>
    </div>
  );
};
