import React, { useState } from 'react';
import { NewsItem, EconomicEvent, MarketAsset } from '../types/market';
import { INITIAL_NEWS, INITIAL_ECONOMIC_EVENTS } from '../data/mockData';
import { Globe, Clock, ChevronRight, Zap } from 'lucide-react';

interface NewsSentimentFeedProps {
  onSelectAssetBySymbol?: (symbol: string) => void;
  onOpenAiAnalyst?: () => void;
  activeAsset: MarketAsset;
}

export const NewsSentimentFeed: React.FC<NewsSentimentFeedProps> = ({
  onSelectAssetBySymbol,
  onOpenAiAnalyst,
  activeAsset,
}) => {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [economicEvents] = useState<EconomicEvent[]>(INITIAL_ECONOMIC_EVENTS);
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('news');

  const filteredNews = news.filter((item) => {
    if (selectedSentiment !== 'ALL' && item.sentiment !== selectedSentiment) return false;
    if (selectedCategory !== 'ALL') {
      if (selectedCategory === 'FOREX' && !item.relatedAssets.some((s) => s.includes('/') || s.includes('USD'))) return false;
      if (selectedCategory === 'STOCKS' && !item.relatedAssets.some((s) => ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL'].includes(s))) return false;
      if (selectedCategory === 'NFTS' && !item.relatedAssets.some((s) => s.includes('SAMURAI') || s.includes('CRYSTAL') || s.includes('GENESIS'))) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0f19] border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1424] px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">News Trading & Macro Intelligence</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'news'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Breaking News
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Economic Calendar
          </button>
        </div>
      </div>

      {activeTab === 'news' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 p-2.5 border-b border-slate-800/80 bg-[#090d15] text-[11px] font-mono flex-wrap">
            {/* Asset Categories */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 mr-1">Sector:</span>
              {['ALL', 'FOREX', 'STOCKS', 'NFTS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sentiment Filters */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 mr-1">Sentiment:</span>
              {['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSentiment(s)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    selectedSentiment === s
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* News List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 p-2">
            {filteredNews.map((item) => {
              const isBull = item.sentiment === 'BULLISH';
              const isBear = item.sentiment === 'BEARISH';
              return (
                <div key={item.id} className="p-3 hover:bg-slate-800/30 transition-colors rounded-lg my-1">
                  {/* Metadata Row: Source · Time · Impact · Sentiment (Zero-pill text separators) */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1.5 flex-wrap">
                    <span className="text-slate-300 font-medium">{item.source}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        item.impact === 'HIGH' ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {item.impact} Volatility
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold ${
                        isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </div>

                  {/* Headline */}
                  <h4 className="text-sm font-semibold text-slate-100 hover:text-cyan-300 transition-colors leading-snug">
                    {item.headline}
                  </h4>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Related Asset Tickers */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500">Related Assets:</span>
                    {item.relatedAssets.map((sym) => (
                      <button
                        key={sym}
                        onClick={() => onSelectAssetBySymbol && onSelectAssetBySymbol(sym)}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[10px] font-mono text-cyan-300 transition-colors flex items-center gap-0.5"
                      >
                        <span>{sym}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Synthesis Callout Box */}
          <div className="p-3 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-cyan-400">Live AI News Analysis:</span> Evaluate market catalysts for{' '}
              <strong className="text-white">{activeAsset.symbol}</strong>
            </div>
            <button
              onClick={onOpenAiAnalyst}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Synthesize Setup</span>
            </button>
          </div>
        </div>
      ) : (
        /* Economic Calendar View */
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 text-xs text-slate-400">
            High-impact macro announcements tracked by institutional trading desks:
          </div>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d15] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Currency</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Impact</th>
                <th className="py-2.5 px-3 text-right">Actual</th>
                <th className="py-2.5 px-3 text-right">Forecast</th>
                <th className="py-2.5 px-3 text-right">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {economicEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">{ev.time}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{ev.currency}</td>
                  <td className="py-2.5 px-3 text-slate-200">{ev.event}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        ev.impact === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {ev.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">{ev.actual}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{ev.forecast}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{ev.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
