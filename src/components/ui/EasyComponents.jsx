import React, { useState, useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

// Tactile Button (EasyUI-style physics: scale 0.97 on press, no cartoon bounce)
export function TactileButton({ children, onClick, className = '', disabled = false, type = 'button', title }) {
  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={`cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </motion.button>
  );
}

// EasyUI-style Animated Loading Screen
export function EasyLoadingScreen({ message = 'Connecting to Investomania Engine...' }) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="surface-box rounded-2xl p-8 max-w-sm w-full text-center space-y-4 border border-[var(--border-soft)] shadow-xl relative overflow-hidden"
      >
        {/* Glowing dual-ring orbital spinner */}
        <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-2 border-transparent border-t-[#D9BB7C] border-r-[#b81434] absolute"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-transparent border-b-[#D9BB7C] border-l-[#b81434] absolute opacity-60"
          />
          <img
            src="/InvestomaniaLogo.png"
            alt="Investomania"
            className="w-8 h-8 rounded-full object-contain shadow-md"
          />
        </div>

        <div className="space-y-1">
          <div className="font-display text-base sm:text-lg font-bold" style={{ color: 'var(--text-main)' }}>
            {message}
          </div>
          <p className="text-xs font-rounded font-semibold text-[var(--text-sub)]">
            Synchronizing live trading floor state and market orderbooks...
          </p>
        </div>

        {/* Shimmer pulse progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="w-1/2 h-full rounded-full bg-gradient-to-r from-transparent via-[#D9BB7C] to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}

// Morphing Pill Tabs with Framer Motion layoutId
export function MorphingPillTabs({ tabs, activeTab, onChange, layoutId = 'pillTabIndicator' }) {
  return (
    <div className="capsule-inset p-1.5 rounded-full inline-flex items-center gap-1 flex-wrap border border-[var(--border-soft)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative cursor-pointer rounded-full px-4 py-1.5 text-xs font-rounded font-bold transition-colors z-10"
            style={{ color: isActive ? 'var(--tab-active-text)' : 'var(--text-main)' }}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full shadow-md -z-10"
                style={{ backgroundColor: 'var(--tab-active-bg)' }}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 opacity-80">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// EasyUI-style Full-Width Responsive Mini Sparkline with Area Fill
export function MiniSparkline({ series = [], isPositive = true, className = 'w-full h-8' }) {
  const gradId = useId();
  const safe = series && series.length >= 2 ? series : [100, 100];

  // If flat line, add gentle realistic intraday wave
  let points = safe;
  if (new Set(safe).size <= 1) {
    const base = safe[0] || 100;
    const delta = Math.max(0.6, base * 0.015);
    points = [base, base + delta * 0.5, base - delta * 0.35, base + delta * 0.75, base - delta * 0.2, base];
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 160;
  const h = 30;
  const pad = 3;

  const coords = points.map((val, idx) => {
    const x = pad + (idx / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((val - min) / range) * (h - pad * 2);
    return { x, y };
  });

  // Construct smooth bezier curve path
  let pathD = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cpx1 = curr.x + (next.x - curr.x) / 2;
    const cpy1 = curr.y;
    const cpx2 = curr.x + (next.x - curr.x) / 2;
    const cpy2 = next.y;
    pathD += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${h} L ${coords[0].x.toFixed(1)} ${h} Z`;
  const stroke = isPositive ? '#2E7D52' : '#C0392B';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// High-fidelity Financial Market Simulation Engine for Tournament Rounds & Crises
export function generateRealisticStockTrajectory(asset) {
  if (!asset) return [];
  const currentPrice = Number(asset.price || asset.basePrice || 100);
  const basePrice = Number(asset.basePrice || currentPrice);

  // Sector volatility calibration (Tech moves more dynamically, Utilities move steadily)
  const sectorBeta = {
    'Technology': 1.5,
    'Oil & Gas Exploration': 1.3,
    'Oil & Gas': 1.3,
    'Oil Marketing': 1.2,
    'Fertilizer': 0.9,
    'Cement': 1.1,
    'Banking': 0.85,
    'Power Generation': 0.75,
    'Automobile': 1.25
  }[asset.sector] || 1.0;

  const volatility = Math.max(0.75, basePrice * 0.012 * sectorBeta);

  // Deterministic seed from symbol string ensures consistent, reproducible curves
  const sym = asset.symbol || 'STK';
  const seed = sym.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1) * 17, 1337);

  const pseudoRand = (n) => {
    const x = Math.sin(seed + n * 93.13) * 10000;
    return x - Math.floor(x);
  };

  const rawHist = Array.isArray(asset.history) && asset.history.length > 0 ? asset.history : [basePrice, currentPrice];

  // If game has recorded distinct rounds/crises history
  if (rawHist.length >= 3 && new Set(rawHist).size > 1) {
    return rawHist.map((val, idx) => ({
      time: idx === 0 ? 'R1 Open' : idx === rawHist.length - 1 ? 'Live' : `Crisis #${idx}`,
      price: Number(Number(val).toFixed(2)),
      volume: Math.round(50000 + pseudoRand(idx) * 85000)
    }));
  }

  // Realistic tournament round progression checkpoints: Base -> Pre-Crisis -> Depth -> Shift -> Live
  const steps = [
    { label: 'R1 Open', frac: 0.0, wave: 0 },
    { label: 'Market Depth', frac: 0.25, wave: 0.65 },
    { label: 'Order Flow', frac: 0.50, wave: -0.45 },
    { label: 'Round Shift', frac: 0.75, wave: 0.75 },
    { label: 'Live Floor', frac: 1.0, wave: 0 }
  ];

  return steps.map((s, idx) => {
    const linear = basePrice + (currentPrice - basePrice) * s.frac;
    const waveOffset = (idx === 0 || idx === steps.length - 1) ? 0 : (s.wave * volatility * 0.75);
    const price = idx === steps.length - 1 ? currentPrice : Math.max(1, Number((linear + waveOffset).toFixed(2)));
    const volume = Math.round((35000 + pseudoRand(idx * 11) * 55000) * (idx === 0 || idx === steps.length - 1 ? 1.8 : 1.0));
    return {
      time: s.label,
      price,
      volume
    };
  });
}

// Easy UI Trade Modal Interactive Recharts Area Chart
export function EasyStockModalChart({ stock }) {
  const gradId = useId();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const chartData = useMemo(() => {
    return stock ? generateRealisticStockTrajectory(stock) : [];
  }, [stock]);

  if (!stock) return null;

  const currentPrice = Number(stock.price || stock.basePrice || 100);
  const basePrice = Number(stock.basePrice || currentPrice);
  const activePrice = hoveredPoint ? hoveredPoint.price : currentPrice;
  const isUp = activePrice >= basePrice;
  const strokeColor = isUp ? '#2E7D52' : '#C0392B';

  const pctChange = basePrice > 0 ? (((activePrice - basePrice) / basePrice) * 100) : 0;

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalVolume = chartData.reduce((acc, d) => acc + (d.volume || 0), 0);
  const pricePadding = (maxPrice - minPrice) * 0.18 || (Number(stock.price) * 0.015) || 1;
  const yDomain = [
    Math.max(0, Math.floor(minPrice - pricePadding)),
    Math.ceil(maxPrice + pricePadding)
  ];

  return (
    <div className="w-full flex flex-col space-y-2">
      {/* Dynamic Header & Tournament Round Status */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-soft)] pb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base font-bold tabular-nums" style={{ color: 'var(--text-main)' }}>
            PKR {activePrice.toFixed(2)}
          </span>
          <span
            className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              isUp ? 'bg-[#2E7D52]/15 text-[#2E7D52]' : 'bg-[#C0392B]/15 text-[#C0392B]'
            }`}
          >
            {isUp ? '+' : ''}{pctChange.toFixed(2)}%
          </span>
          {hoveredPoint ? (
            <span className="text-[10px] font-mono text-[var(--text-sub)]">
              @{hoveredPoint.time}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-sub)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D52] animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Tournament Round Indicator */}
        <span className="rounded-full bg-[var(--bg-inset)] text-[var(--border-active)] border border-[var(--border-soft)] px-2.5 py-0.5 text-[10px] font-mono font-bold">
          Round Trajectory
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-32 relative select-none min-w-0 min-h-[128px]">
        <ResponsiveContainer width="100%" height={128}>
          <AreaChart
            data={chartData}
            margin={{ top: 6, right: 4, left: -24, bottom: 0 }}
            onMouseMove={(e) => {
              if (e?.activePayload?.[0]?.payload) {
                setHoveredPoint(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" opacity={0.25} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: 'var(--text-sub)' }}
              axisLine={{ stroke: 'var(--border-soft)', opacity: 0.3 }}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 9, fill: 'var(--text-sub)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => Math.round(v)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="capsule-card rounded-xl p-2 px-3 shadow-xl text-xs font-rounded border border-[var(--border-soft)]">
                    <div className="text-[10px] font-semibold text-[var(--text-sub)]">
                      {d.time}
                    </div>
                    <div className="font-mono font-bold text-sm text-[var(--text-main)]">
                      PKR {Number(d.price).toFixed(2)}
                    </div>
                    {d.volume && (
                      <div className="text-[10px] font-mono text-[var(--text-sub)] opacity-80">
                        Vol: {Number(d.volume).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.2}
              fillOpacity={1}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 5, fill: strokeColor, stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={450}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Range Statistics Footnote */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--border-soft)] text-[10px] font-mono text-center">
        <div>
          <span className="block text-[var(--text-sub)] opacity-75">Round Low</span>
          <strong className="text-[var(--text-main)] font-bold">PKR {minPrice.toFixed(2)}</strong>
        </div>
        <div>
          <span className="block text-[var(--text-sub)] opacity-75">Round High</span>
          <strong className="text-[var(--text-main)] font-bold">PKR {maxPrice.toFixed(2)}</strong>
        </div>
        <div>
          <span className="block text-[var(--text-sub)] opacity-75">Est. Volume</span>
          <strong className="text-[var(--text-main)] font-bold">{totalVolume.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for Recharts EasyUI Component
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="capsule-card rounded-2xl p-2.5 px-3.5 shadow-xl text-xs font-rounded border border-[var(--border-soft)]">
      <div className="font-semibold text-[10px] text-[var(--text-sub)]">
        {d.time || 'Tick'}
      </div>
      <div className="text-base font-bold mt-0.5 font-mono text-[var(--text-main)]">
        PKR {Number(d.price).toFixed(2)}
      </div>
      {d.volume && (
        <div className="text-[10px] font-mono text-[var(--text-sub)] mt-0.5">
          Volume: {Number(d.volume).toLocaleString()} shares
        </div>
      )}
    </div>
  );
}

// Interactive Recharts Area Trajectory Graph Component (EasyUI-style area glow)
export function AreaTrajectoryGraph({ asset }) {
  const gradId = useId();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const chartData = useMemo(() => {
    return asset ? generateRealisticStockTrajectory(asset) : [];
  }, [asset]);

  if (!asset) {
    return (
      <div className="surface-box rounded-[28px] p-6 h-full min-h-[260px] flex flex-col items-center justify-center text-center border border-[var(--border-soft)] shadow-sm">
        <div className="font-display text-base font-bold" style={{ color: 'var(--text-sub)' }}>
          No Instrument Selected
        </div>
        <p className="text-xs font-rounded mt-1 opacity-75" style={{ color: 'var(--text-sub)' }}>
          Select any asset below to view its price trajectory and crisis impact.
        </p>
      </div>
    );
  }

  const currentPrice = Number(asset.price || asset.basePrice || 100);
  const basePrice = Number(asset.basePrice || currentPrice);
  const activePrice = hoveredPoint ? hoveredPoint.price : currentPrice;
  const isUp = activePrice >= basePrice;
  const strokeColor = isUp ? '#2E7D52' : '#C0392B';

  const pctChange = basePrice > 0 ? (((activePrice - basePrice) / basePrice) * 100) : 0;

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalVolume = chartData.reduce((acc, d) => acc + (d.volume || 0), 0);
  const vwap = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : currentPrice;

  const pricePadding = (maxPrice - minPrice) * 0.18 || (currentPrice * 0.02) || 1;
  const yDomain = [
    Math.max(0, Math.floor(minPrice - pricePadding)),
    Math.ceil(maxPrice + pricePadding)
  ];

  return (
    <div className="surface-box rounded-[28px] p-4 sm:p-5 flex flex-col w-full h-full border border-[var(--border-soft)] shadow-sm">
      {/* Top Header Row with Status and Live Scrubbing */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#b81434] text-[#D9BB7C] flex items-center justify-center font-rounded font-bold text-xs shadow-sm shrink-0">
            {asset.symbol.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                {asset.name}
              </h2>
              <span className="rounded-full bg-[var(--bg-inset)] text-[var(--text-sub)] border border-[var(--border-soft)] px-2 py-0.5 text-[10px] font-rounded font-bold">
                {asset.symbol} • {asset.category}
              </span>
            </div>
            <p className="text-[11px] font-rounded font-semibold text-[var(--text-sub)]">
              {hoveredPoint ? (
                <span>
                  Scrubbing @ {hoveredPoint.time} • Vol: {hoveredPoint.volume?.toLocaleString()} shares
                </span>
              ) : (
                <span>
                  Tournament Trajectory • Sector: {asset.sector}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Price & Tournament Badge */}
        <div className="flex flex-col sm:items-end gap-1.5 font-rounded">
          <div className="flex items-center gap-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-main)' }}>
              PKR {activePrice.toFixed(2)}
            </div>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-rounded font-bold ${
                isUp
                  ? 'bg-[#2E7D52]/15 text-[#2E7D52] border border-[#2E7D52]/30'
                  : 'bg-[#C0392B]/15 text-[#C0392B] border border-[#C0392B]/30'
              }`}
            >
              {isUp ? '+' : ''}{pctChange.toFixed(2)}% vs Base
            </span>
          </div>

          <span className="rounded-full bg-[var(--bg-inset)] text-[var(--border-active)] border border-[var(--border-soft)] px-3 py-1 text-xs font-mono font-bold self-start sm:self-end">
            Rounds & Crises Trajectory
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="capsule-card rounded-[22px] p-2.5 sm:p-3 flex-1 min-h-[220px] w-full border border-[var(--border-soft)] flex flex-col mt-2 select-none">
        <div className="w-full flex-1 min-h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(e) => {
                if (e?.activePayload?.[0]?.payload) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.38} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" opacity={0.3} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-sub)', fontSize: 10, fontFamily: 'Outfit, sans-serif' }}
              />
              <YAxis
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-sub)', fontSize: 10, fontFamily: 'Outfit, sans-serif' }}
                tickFormatter={(v) => `PKR ${Math.round(v)}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.8}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 6, fill: '#D9BB7C', stroke: strokeColor, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-soft)] text-xs font-mono text-center">
          <div className="bg-[var(--bg-inset)]/60 rounded-xl p-1.5 border border-[var(--border-soft)]/50">
            <span className="block text-[10px] text-[var(--text-sub)]">Round Low</span>
            <strong className="text-[var(--text-main)] font-bold">PKR {minPrice.toFixed(2)}</strong>
          </div>
          <div className="bg-[var(--bg-inset)]/60 rounded-xl p-1.5 border border-[var(--border-soft)]/50">
            <span className="block text-[10px] text-[var(--text-sub)]">Round High</span>
            <strong className="text-[var(--text-main)] font-bold">PKR {maxPrice.toFixed(2)}</strong>
          </div>
          <div className="bg-[var(--bg-inset)]/60 rounded-xl p-1.5 border border-[var(--border-soft)]/50">
            <span className="block text-[10px] text-[var(--text-sub)]">VWAP Average</span>
            <strong className="text-[var(--text-main)] font-bold">PKR {vwap.toFixed(2)}</strong>
          </div>
          <div className="bg-[var(--bg-inset)]/60 rounded-xl p-1.5 border border-[var(--border-soft)]/50">
            <span className="block text-[10px] text-[var(--text-sub)]">Session Volume</span>
            <strong className="text-[var(--text-main)] font-bold">{totalVolume.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
