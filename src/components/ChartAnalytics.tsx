import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MarketAsset, Candle } from '../types/market';
import { generateCandlesForAsset } from '../data/mockData';
import { Activity, BarChart2, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ChartAnalyticsProps {
  asset: MarketAsset;
  onPriceUpdate?: (newPrice: number) => void;
}

export const ChartAnalytics: React.FC<ChartAnalyticsProps> = ({ asset, onPriceUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [timeframe, setTimeframe] = useState<string>('15m');
  const [chartType, setChartType] = useState<'candles' | 'line' | 'heikin'>('candles');
  const [showSma20, setShowSma20] = useState<boolean>(true);
  const [showSma50, setShowSma50] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [subIndicator, setSubIndicator] = useState<'rsi' | 'macd' | 'none'>('rsi');

  const [candles, setCandles] = useState<Candle[]>([]);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; candle: Candle | null } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Generate initial candles when asset or timeframe changes
  useEffect(() => {
    const volatility = asset.category === 'FOREX' ? 0.0008 : asset.category === 'NFTS' ? 0.015 : 0.004;
    const initial = generateCandlesForAsset(asset.price, 75, volatility);
    setCandles(initial);
  }, [asset.symbol, timeframe]);

  // Real-time market tick simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        if (!prev.length) return prev;
        const last = { ...prev[prev.length - 1] };
        const pip = asset.category === 'FOREX' ? (asset.symbol.includes('JPY') ? 0.01 : 0.0001) : asset.price * 0.0005;
        const delta = (Math.random() - 0.49) * pip * (1 + Math.random() * 2);
        const newClose = Math.max(0.0001, last.close + delta);

        last.close = newClose;
        last.high = Math.max(last.high, newClose);
        last.low = Math.min(last.low, newClose);
        last.volume += Math.floor(Math.random() * 80);

        if (onPriceUpdate) {
          onPriceUpdate(newClose);
        }

        return [...prev.slice(0, prev.length - 1), last];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [asset, onPriceUpdate]);

  // Derived Indicators: SMA 20, SMA 50, Bollinger Bands, RSI
  const indicators = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const sma20: (number | null)[] = [];
    const sma50: (number | null)[] = [];
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];
    const rsiValues: (number | null)[] = [];

    // SMA 20 & Bollinger
    for (let i = 0; i < closes.length; i++) {
      if (i < 19) {
        sma20.push(null);
        bbUpper.push(null);
        bbLower.push(null);
      } else {
        const slice = closes.slice(i - 19, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / 20;
        sma20.push(mean);

        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        bbUpper.push(mean + stdDev * 2);
        bbLower.push(mean - stdDev * 2);
      }

      // SMA 50
      if (i < 49) {
        sma50.push(null);
      } else {
        const slice = closes.slice(i - 49, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / 50;
        sma50.push(mean);
      }

      // RSI 14
      if (i < 14) {
        rsiValues.push(null);
      } else {
        let gains = 0;
        let losses = 0;
        for (let j = i - 13; j <= i; j++) {
          const diff = closes[j] - closes[j - 1];
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        if (avgLoss === 0) {
          rsiValues.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsiValues.push(100 - 100 / (1 + rs));
        }
      }
    }

    return { sma20, sma50, bbUpper, bbLower, rsiValues };
  }, [candles]);

  // Convert candles to Heikin-Ashi if selected
  const displayCandles = useMemo(() => {
    if (chartType !== 'heikin') return candles;
    const haCandles: Candle[] = [];
    for (let i = 0; i < candles.length; i++) {
      const cur = candles[i];
      const prevHa = i > 0 ? haCandles[i - 1] : null;

      const haClose = (cur.open + cur.high + cur.low + cur.close) / 4;
      const haOpen = prevHa ? (prevHa.open + prevHa.close) / 2 : (cur.open + cur.close) / 2;
      const haHigh = Math.max(cur.high, haOpen, haClose);
      const haLow = Math.min(cur.low, haOpen, haClose);

      haCandles.push({
        ...cur,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
      });
    }
    return haCandles;
  }, [candles, chartType]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !displayCandles.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Layout dimensions
    const priceScaleWidth = 65;
    const timeScaleHeight = 26;
    const subChartHeight = subIndicator !== 'none' ? Math.floor(height * 0.22) : 0;
    const mainChartHeight = height - timeScaleHeight - subChartHeight;
    const chartWidth = width - priceScaleWidth;

    // Background
    ctx.fillStyle = '#0a0f19';
    ctx.fillRect(0, 0, width, height);

    // Visible candle slice based on zoom
    const totalVisible = Math.max(20, Math.floor(55 / zoomLevel));
    const startIdx = Math.max(0, displayCandles.length - totalVisible);
    const visibleCandles = displayCandles.slice(startIdx);
    const visibleSma20 = indicators.sma20.slice(startIdx);
    const visibleSma50 = indicators.sma50.slice(startIdx);
    const visibleBbUpper = indicators.bbUpper.slice(startIdx);
    const visibleBbLower = indicators.bbLower.slice(startIdx);
    const visibleRsi = indicators.rsiValues.slice(startIdx);

    // Compute min and max price for main chart
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    // Pad range by 5%
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const paddedRange = maxPrice - minPrice;

    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / paddedRange) * (mainChartHeight - 20) - 10;
    };

    const candleWidth = Math.max(2, (chartWidth / visibleCandles.length) * 0.72);
    const getX = (index: number) => {
      const step = chartWidth / visibleCandles.length;
      return index * step + step / 2;
    };

    // Draw Grid Lines
    ctx.strokeStyle = '#162032';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    // Horizontal Price Grid
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (paddedRange / gridSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        asset.category === 'FOREX'
          ? p.toFixed(asset.symbol.includes('JPY') ? 2 : 4)
          : asset.category === 'NFTS'
          ? `${p.toFixed(2)} ${asset.currency || 'ETH'}`
          : `$${p.toFixed(2)}`,
        chartWidth + 6,
        y + 4
      );
    }

    // Vertical Time Grid
    const timeSteps = 6;
    for (let i = 0; i < timeSteps; i++) {
      const idx = Math.floor((visibleCandles.length / timeSteps) * i);
      const x = getX(idx);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mainChartHeight + subChartHeight);
      ctx.stroke();

      if (visibleCandles[idx]) {
        const d = new Date(visibleCandles[idx].time);
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, x, height - 8);
      }
    }
    ctx.setLineDash([]);

    // Draw Volume Bars in background of main chart
    visibleCandles.forEach((c, i) => {
      const x = getX(i);
      const isUp = c.close >= c.open;
      const volHeight = (c.volume / (maxVolume || 1)) * (mainChartHeight * 0.22);
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
      ctx.fillRect(x - candleWidth / 2, mainChartHeight - volHeight, candleWidth, volHeight);
    });

    // Draw Bollinger Bands (if enabled)
    if (showBollinger) {
      ctx.fillStyle = 'rgba(147, 51, 234, 0.06)';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const up = visibleBbUpper[i];
        if (up !== null) {
          const x = getX(i);
          const y = getY(up);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const low = visibleBbLower[i];
        if (low !== null) {
          const x = getX(i);
          const y = getY(low);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Lower & Upper Lines
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        if (visibleBbUpper[i] !== null) {
          const x = getX(i);
          const y = getY(visibleBbUpper[i]!);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        if (visibleBbLower[i] !== null) {
          const x = getX(i);
          const y = getY(visibleBbLower[i]!);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw Candlesticks or Line Chart
    if (chartType === 'line') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Gradient Fill below line
      const gradient = ctx.createLinearGradient(0, 0, 0, mainChartHeight);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = gradient;
      ctx.lineTo(getX(visibleCandles.length - 1), mainChartHeight);
      ctx.lineTo(getX(0), mainChartHeight);
      ctx.closePath();
      ctx.fill();
    } else {
      // Candlesticks (or Heikin-Ashi)
      visibleCandles.forEach((c, i) => {
        const x = getX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#f43f5e';

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const topY = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillRect(x - candleWidth / 2, topY, candleWidth, bodyHeight);
      });
    }

    // Draw SMA 20 (Cyan)
    if (showSma20) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      visibleSma20.forEach((val, i) => {
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw SMA 50 (Amber)
    if (showSma50) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      visibleSma50.forEach((val, i) => {
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Current Price Pulse Line on Main Chart
    const currentPrice = visibleCandles[visibleCandles.length - 1].close;
    const currentY = getY(currentPrice);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Price Pill on Right Axis
    ctx.fillStyle = '#10b981';
    ctx.fillRect(chartWidth, currentY - 10, priceScaleWidth, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      asset.category === 'FOREX'
        ? currentPrice.toFixed(asset.symbol.includes('JPY') ? 2 : 4)
        : asset.category === 'NFTS'
        ? `${currentPrice.toFixed(2)}`
        : `$${currentPrice.toFixed(2)}`,
      chartWidth + 5,
      currentY + 4
    );

    // Sub-Chart: RSI Indicator
    if (subIndicator === 'rsi') {
      const subTop = mainChartHeight;
      const subBottom = height - timeScaleHeight;
      const subH = subBottom - subTop;

      // Divider line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, subTop);
      ctx.lineTo(width, subTop);
      ctx.stroke();

      // RSI 70 / 30 guide lines
      const y70 = subTop + subH * (1 - 70 / 100);
      const y30 = subTop + subH * (1 - 30 / 100);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.04)';
      ctx.fillRect(0, y70, chartWidth, y30 - y70);

      ctx.strokeStyle = '#334155';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('70', chartWidth + 6, y70 + 3);
      ctx.fillText('30', chartWidth + 6, y30 + 3);

      // RSI Line
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let started = false;
      visibleRsi.forEach((val, i) => {
        if (val !== null) {
          const x = getX(i);
          const y = subTop + subH * (1 - val / 100);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Crosshair rendering
    if (crosshair && crosshair.x < chartWidth && crosshair.y < height - timeScaleHeight) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crosshair.x, 0);
      ctx.lineTo(crosshair.x, height - timeScaleHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(chartWidth, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    displayCandles,
    indicators,
    chartType,
    showSma20,
    showSma50,
    showBollinger,
    subIndicator,
    zoomLevel,
    crosshair,
    asset,
  ]);

  // Handle Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !displayCandles.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const totalVisible = Math.max(20, Math.floor(55 / zoomLevel));
    const startIdx = Math.max(0, displayCandles.length - totalVisible);
    const visibleCandles = displayCandles.slice(startIdx);
    const chartWidth = rect.width - 65;

    const step = chartWidth / visibleCandles.length;
    const index = Math.floor(x / step);

    if (index >= 0 && index < visibleCandles.length) {
      setCrosshair({ x, y, candle: visibleCandles[index] });
    } else {
      setCrosshair(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
  };

  const activeCandle = crosshair?.candle || displayCandles[displayCandles.length - 1];

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#0a0f19] border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-slate-800 bg-[#0d1424] text-xs">
        {/* Asset Title & Live OHLCV HUD */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">{asset.symbol}</span>
            <span className="text-slate-400 font-mono text-[11px]">{asset.name}</span>
          </div>

          {activeCandle && (
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>O: <strong className="text-slate-200">{activeCandle.open.toFixed(asset.category === 'FOREX' ? 4 : 2)}</strong></span>
              <span>H: <strong className="text-emerald-400">{activeCandle.high.toFixed(asset.category === 'FOREX' ? 4 : 2)}</strong></span>
              <span>L: <strong className="text-rose-400">{activeCandle.low.toFixed(asset.category === 'FOREX' ? 4 : 2)}</strong></span>
              <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
                {activeCandle.close.toFixed(asset.category === 'FOREX' ? 4 : 2)}
              </strong></span>
              <span>Vol: <strong className="text-slate-200">{activeCandle.volume.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        {/* Timeframe & Indicator Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe buttons */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded">
            {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  timeframe === tf ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                chartType === 'candles' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Candlesticks"
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                chartType === 'line' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Line Chart"
            >
              Line
            </button>
            <button
              onClick={() => setChartType('heikin')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                chartType === 'heikin' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Heikin-Ashi"
            >
              Heikin
            </button>
          </div>

          {/* Indicators Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSma20(!showSma20)}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
                showSma20 ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSma50(!showSma50)}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
                showSma50 ? 'bg-amber-950 border-amber-700 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              SMA 50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
                showBollinger ? 'bg-purple-950 border-purple-700 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              Bollinger
            </button>
            <button
              onClick={() => setSubIndicator(subIndicator === 'rsi' ? 'none' : 'rsi')}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
                subIndicator === 'rsi' ? 'bg-purple-950 border-purple-700 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              RSI (14)
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 rounded border border-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 rounded border border-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 rounded border border-slate-800"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 w-full min-h-[360px] bg-[#0a0f19]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};
