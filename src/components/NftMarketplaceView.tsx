import React, { useState } from 'react';
import { MarketAsset, Position } from '../types/market';
import { Sparkles, ShoppingBag, Eye, TrendingUp, TrendingDown } from 'lucide-react';

interface NftMarketplaceViewProps {
  nftAssets: MarketAsset[];
  onSelectNft: (asset: MarketAsset) => void;
  onExecuteTrade: (position: Omit<Position, 'id' | 'pnl' | 'pnlPercentage' | 'timestamp'>) => void;
  availableCash: number;
}

export const NftMarketplaceView: React.FC<NftMarketplaceViewProps> = ({
  nftAssets,
  onSelectNft,
  onExecuteTrade,
  availableCash,
}) => {
  const [selectedNft, setSelectedNft] = useState<MarketAsset>(nftAssets[0]);
  const [showRarityModal, setShowRarityModal] = useState<boolean>(false);
  const [sweepCount, setSweepCount] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const traits = [
    { type: 'Archetype', value: 'Cyber Daimyo', rarity: '0.8%', score: 185 },
    { type: 'Weapon', value: 'Plasma Nodachi', rarity: '1.4%', score: 140 },
    { type: 'Chassis Armor', value: 'Quantum Damascus', rarity: '2.1%', score: 110 },
    { type: 'Aura Core', value: 'Bioluminescent Nova', rarity: '3.6%', score: 85 },
    { type: 'Background', value: 'Neo Shinjuku Abyss', rarity: '4.8%', score: 65 },
  ];

  const handleInstantBuy = (asset: MarketAsset, count: number = 1) => {
    const rate = asset.currency === 'SOL' ? 210 : 3100;
    const totalUsd = asset.price * count * rate;

    if (totalUsd > availableCash) {
      setFeedback('Insufficient available cash to sweep this NFT floor.');
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    onExecuteTrade({
      symbol: asset.symbol,
      assetType: 'NFTS',
      side: 'BUY',
      size: count,
      entryPrice: asset.price,
      markPrice: asset.price,
      margin: totalUsd,
      leverage: 1,
    });

    setFeedback(`Successfully swept ${count}x ${asset.name} at ${asset.price} ${asset.currency || 'ETH'}!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-[#0a0f19] text-slate-200 select-none max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Institutional NFT Collectibles & Floor Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time floor price depth, automated sweep execution & verifiable trait rarity scoring.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded text-xs font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Featured Collection Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 bg-[#0d1424] border border-slate-800 rounded-xl">
        {/* Left: Image showcase */}
        <div className="lg:col-span-5 relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 group">
          <img
            src={selectedNft.image}
            alt={selectedNft.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs font-mono text-cyan-300 border border-cyan-800">
            Genesis Mint #042
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded text-xs font-mono text-slate-200">
            Rank #14 / 10,000
          </div>
        </div>

        {/* Right: Analytics & Instant Sweep Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>Verified Smart Contract</span>
              <span aria-hidden="true">·</span>
              <span>ERC-721</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedNft.name}</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Algorithmic generative collectibles with utility across decentralized virtual reality environments, automated royalty distributions, and quantitative vault staking yields.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">FLOOR PRICE</span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                {selectedNft.price.toFixed(2)} {selectedNft.currency || 'ETH'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">24H VOLUME</span>
              <span className="text-lg font-bold text-white tabular-nums">
                {selectedNft.volume24h.toFixed(1)} {selectedNft.currency || 'ETH'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TOTAL OWNERS</span>
              <span className="text-lg font-bold text-slate-200 tabular-nums">
                {selectedNft.owners?.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">LISTED SUPPLY</span>
              <span className="text-lg font-bold text-slate-200 tabular-nums">
                {selectedNft.totalListed} ({((selectedNft.totalListed! / 10000) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Interactive Trait Preview & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Sweep Depth: {sweepCount} items</span>
              <button
                onClick={() => setShowRarityModal(true)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Full Rarity Traits</span>
              </button>
            </div>

            {/* Sweep Multiplier Buttons */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setSweepCount(count)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono transition-colors ${
                    sweepCount === count
                      ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sweep {count}x ({(selectedNft.price * count).toFixed(2)} {selectedNft.currency || 'ETH'})
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleInstantBuy(selectedNft, sweepCount)}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Instant Buy Floor (Sweep {sweepCount})</span>
              </button>
              <button
                onClick={() => onSelectNft(selectedNft)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Open Terminal Chart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Collection Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">All Tracked Digital Collectibles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nftAssets.map((asset) => {
            const isSelected = asset.symbol === selectedNft.symbol;
            const isUp = asset.change24h >= 0;
            return (
              <div
                key={asset.symbol}
                onClick={() => setSelectedNft(asset)}
                className={`flex flex-col bg-[#0d1424] border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-cyan-600 ${
                  isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-slate-800'
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[11px] font-mono text-white">
                    {asset.currency || 'ETH'}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{asset.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">{asset.symbol}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">FLOOR</span>
                      <span className="font-bold text-white tabular-nums">
                        {asset.price.toFixed(2)} {asset.currency || 'ETH'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">24H CHANGE</span>
                      <span
                        className={`flex items-center gap-0.5 font-semibold tabular-nums ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trait Rarity Breakdown Modal */}
      {showRarityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#0d1424] border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{selectedNft.name} · Verifiable Rarity Matrix</span>
              </h3>
              <button
                onClick={() => setShowRarityModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 mb-5 font-mono text-xs">
              {traits.map((t) => (
                <div
                  key={t.type}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg"
                >
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t.type}</span>
                    <span className="font-semibold text-slate-200">{t.value}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-400 font-bold block">{t.rarity}</span>
                    <span className="text-slate-500 text-[10px]">+{t.score} pts</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRarityModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
