export type AssetCategory = 'FOREX' | 'STOCKS' | 'NFTS';

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  spread?: number; // Forex spread in pips
  pipValue?: number;
  marketCap?: string; // Stocks & NFTs
  peRatio?: number; // Stocks
  dividendYield?: number; // Stocks
  beta?: number; // Stocks
  floorPrice?: number; // NFTs
  currency?: string; // e.g. 'USD', 'ETH', 'SOL'
  totalListed?: number; // NFTs
  owners?: number; // NFTs
  image?: string;
  sparkline: number[];
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface TradeTapeItem {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact: 'HIGH' | 'MED' | 'LOW';
  relatedAssets: string[];
  summary: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  actual: string;
  forecast: string;
  previous: string;
}

export interface Position {
  id: string;
  symbol: string;
  assetType: AssetCategory;
  side: 'BUY' | 'SELL';
  size: number;
  entryPrice: number;
  markPrice: number;
  margin: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  assetType: AssetCategory;
  side: 'BUY' | 'SELL';
  size: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  openTime: number;
  closeTime: number;
  reason: 'Manual Close' | 'Take Profit' | 'Stop Loss';
}

export interface AiAnalystResult {
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  summary: string;
  technicalOutlook: string;
  macroNewsImpact: string;
  tradeSetup: {
    recommendedAction: string;
    entryZone: string;
    stopLoss: string;
    takeProfit1: string;
    takeProfit2: string;
    riskRewardRatio: string;
  };
  volatilityWarning: string;
  source?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  accountTier: string;
  kycStatus: 'Verified Level 2' | 'Pending' | 'Tier 1';
  tradingId: string;
  memberSince: string;
  bio: string;
  timezone: string;
  baseCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  connectedWallets: {
    address: string;
    chain: string;
    label: string;
  }[];
}

export interface TerminalSettings {
  defaultOrderType: 'MARKET' | 'LIMIT' | 'STOP';
  defaultLeverage: number;
  maxSlippage: number;
  oneClickTrading: boolean;
  audioCues: boolean;
  defaultTimeframe: string;
  defaultChartType: 'candles' | 'line' | 'heikin';
  showGridLines: boolean;
  twoFactorAuth: boolean;
  autoLockMinutes: number;
  maskBalances: boolean;
  newsSoundAlerts: boolean;
  economicAlerts: boolean;
  pushNotifications: boolean;
  apiKey: string;
}

