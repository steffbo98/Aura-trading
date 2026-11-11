import React, { useState, useEffect } from 'react';
import { MarketAsset, OrderBookEntry, TradeTapeItem } from '../types/market';

interface OrderBookTapeProps {
  asset: MarketAsset;
  onSelectPrice?: (price: number) => void;
}

export const OrderBookTape: React.FC<OrderBookTapeProps> = ({ asset, onSelectPrice }) => {
  const [view, setView] = useState<'book' | 'tape'>('book');
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [trades, setTrades] = useState<TradeTapeItem[]>([]);

  // Generate initial book around asset price
  useEffect(() => {
    const isForex = asset.category === 'FOREX';
    const pip = isForex ? (asset.symbol.includes('JPY') ? 0.01 : 0.0001) : asset.price * 0.001;

    const newBids: OrderBookEntry[] = [];
    const newAsks: OrderBookEntry[] = [];
    let bidTot = 0;
    let askTot = 0;

    for (let i = 1; i <= 8; i++) {
      const bPrice = asset.price - i * pip * (0.8 + Math.random() * 0.4);
      const bSize = isForex ? parseFloat((0.5 + Math.random() * 3).toFixed(2)) : Math.floor(20 + Math.random() * 200);
      bidTot += bSize;
      newBids.push({ price: bPrice, amount: bSize, total: bidTot });

      const aPrice = asset.price + i * pip * (0.8 + Math.random() * 0.4);
      const aSize = isForex ? parseFloat((0.5 + Math.random() * 3).toFixed(2)) : Math.floor(20 + Math.random() * 200);
      askTot += aSize;
      newAsks.push({ price: aPrice, amount: aSize, total: askTot });
    }

    setBids(newBids);
    setAsks(newAsks);

    // Initial trades
    const initialTrades: TradeTapeItem[] = [];
    for (let i = 0; i < 12; i++) {
      const now = new Date(Date.now() - i * 4000);
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      initialTrades.push({
        id: `t-${i}`,
        time: timeStr,
        price: asset.price + (Math.random() - 0.5) * pip * 2,
        size: isForex ? parseFloat((0.1 + Math.random() * 1.5).toFixed(2)) : Math.floor(10 + Math.random() * 100),
        side: Math.random() > 0.48 ? 'buy' : 'sell',
      });
    }
    setTrades(initialTrades);
  }, [asset.symbol]);

  // Stream live trade tape & update top of book
  useEffect(() => {
    const timer = setInterval(() => {
      const isForex = asset.category === 'FOREX';
      const pip = isForex ? (asset.symbol.includes('JPY') ? 0.01 : 0.0001) : asset.price * 0.0008;
      const isBuy = Math.random() > 0.48;
      const delta = (Math.random() - 0.48) * pip;
      const tradePrice = asset.price + delta;
      const tradeSize = isForex ? parseFloat((0.1 + Math.random() * 2.2).toFixed(2)) : Math.floor(5 + Math.random() * 120);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setTrades((prev) => [
        {
          id: `t-${Date.now()}`,
          time: timeStr,
          price: tradePrice,
          size: tradeSize,
          side: isBuy ? 'buy' : 'sell',
        },
        ...prev.slice(0, 24),
      ]);
    }, 1800);

    return () => clearInterval(timer);
  }, [asset]);

  const maxTotal = Math.max(
    bids.length ? bids[bids.length - 1].total : 1,
    asks.length ? asks[asks.length - 1].total : 1
  );

  const formatPrice = (p: number) => {
    if (asset.category === 'FOREX') return p.toFixed(asset.symbol.includes('JPY') ? 3 : 5);
    if (asset.category === 'NFTS') return p.toFixed(2);
    return p.toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f19] border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1424] px-3 py-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('book')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              view === 'book' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setView('tape')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              view === 'tape' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Tape
          </button>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Spread: {asset.spread ? `${asset.spread} pips` : '0.02%'}
        </span>
      </div>

      {view === 'book' ? (
        <div className="flex flex-col flex-1 p-2 text-[11px] font-mono overflow-y-auto">
          {/* Column Titles */}
          <div className="grid grid-cols-3 text-slate-400 pb-1.5 border-b border-slate-800/80 px-1">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sells, descending) */}
          <div className="flex flex-col-reverse gap-0.5 py-1">
            {asks.slice(0, 6).map((item, idx) => {
              const depthPct = Math.min(100, (item.total / maxTotal) * 100);
              return (
                <div
                  key={`ask-${idx}`}
                  onClick={() => onSelectPrice && onSelectPrice(item.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-slate-800/60 cursor-pointer rounded"
                >
                  <div
                    className="absolute inset-0 bg-rose-500/10 right-0 pointer-events-none"
                    style={{ width: `${depthPct}%`, marginLeft: 'auto' }}
                  />
                  <span className="text-rose-400 tabular-nums z-10">{formatPrice(item.price)}</span>
                  <span className="text-right text-slate-300 tabular-nums z-10">{item.amount}</span>
                  <span className="text-right text-slate-500 tabular-nums z-10">{item.total.toFixed(1)}</span>
                </div>
              );
            })}
          </div>

          {/* Middle Spread Banner */}
          <div className="flex items-center justify-between py-1.5 px-2 my-0.5 bg-slate-900 border-y border-slate-800/80 text-xs">
            <span className="font-bold text-slate-100 tabular-nums">
              {formatPrice(asset.price)}
            </span>
            <span className="text-slate-400 text-[10px]">
              Mid Market Rate
            </span>
          </div>

          {/* Bids (Buys, ascending) */}
          <div className="flex flex-col gap-0.5 py-1">
            {bids.slice(0, 6).map((item, idx) => {
              const depthPct = Math.min(100, (item.total / maxTotal) * 100);
              return (
                <div
                  key={`bid-${idx}`}
                  onClick={() => onSelectPrice && onSelectPrice(item.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-slate-800/60 cursor-pointer rounded"
                >
                  <div
                    className="absolute inset-0 bg-emerald-500/10 right-0 pointer-events-none"
                    style={{ width: `${depthPct}%`, marginLeft: 'auto' }}
                  />
                  <span className="text-emerald-400 tabular-nums z-10">{formatPrice(item.price)}</span>
                  <span className="text-right text-slate-300 tabular-nums z-10">{item.amount}</span>
                  <span className="text-right text-slate-500 tabular-nums z-10">{item.total.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Live Tape Execution Feed */
        <div className="flex flex-col flex-1 p-2 text-[11px] font-mono overflow-y-auto">
          <div className="grid grid-cols-4 text-slate-400 pb-1.5 border-b border-slate-800/80 px-1">
            <span>Time</span>
            <span className="text-right">Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Side</span>
          </div>
          <div className="flex flex-col gap-1 py-1">
            {trades.map((t) => (
              <div key={t.id} className="grid grid-cols-4 py-0.5 px-1 hover:bg-slate-800/50 rounded">
                <span className="text-slate-500">{t.time}</span>
                <span className={`text-right tabular-nums ${t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPrice(t.price)}
                </span>
                <span className="text-right text-slate-300 tabular-nums">{t.size}</span>
                <span className={`text-right font-semibold ${t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.side.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
