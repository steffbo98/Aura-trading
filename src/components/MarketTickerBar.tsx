import React from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTickerBarProps {
  assets: MarketAsset[];
  selectedSymbol: string;
  onSelectAsset: (asset: MarketAsset) => void;
}

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({
  assets,
  selectedSymbol,
  onSelectAsset,
}) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-[#090d15] px-3 py-1.5 text-xs select-none no-scrollbar">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider shrink-0">
        <span>LIVE TICKS</span>
      </div>
      <div className="flex items-center gap-2 min-w-max">
        {assets.map((asset) => {
          const isSelected = asset.symbol === selectedSymbol;
          const isPositive = asset.change24h >= 0;
          return (
            <button
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded transition-colors ${
                isSelected
                  ? 'bg-slate-800 border border-cyan-800/60 text-white'
                  : 'hover:bg-slate-850 text-slate-300'
              }`}
            >
              <span className="font-semibold text-slate-200">{asset.symbol}</span>
              <span className="font-mono tabular-nums text-slate-100">
                {asset.category === 'FOREX'
                  ? asset.price.toFixed(asset.symbol.includes('JPY') ? 2 : 4)
                  : asset.category === 'NFTS'
                  ? `${asset.price.toFixed(2)} ${asset.currency || 'ETH'}`
                  : `$${asset.price.toFixed(2)}`}
              </span>
              <span
                className={`flex items-center gap-0.5 font-mono tabular-nums text-[11px] ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 shrink-0" />
                )}
                {isPositive ? '+' : ''}
                {asset.change24h.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
