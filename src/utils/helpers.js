import React from 'react';

/* ---------- Color helpers ---------- */

export function getScoreColor(s) {
  if (s >= 70) return '#22c55e';
  if (s >= 50) return '#eab308';
  if (s >= 30) return '#f97316';
  return '#ef4444';
}

export function getRegimeColor(r) {
  const map = {
    BULL: '#22c55e',
    NEUTRAL: '#eab308',
    BEAR: '#f97316',
    CRASH: '#ef4444',
  };
  return map[r] || '#94a3b8';
}

/* ---------- Setup badge (JSX) ---------- */

const SETUP_MAP = {
  breakout:           { bg: '#22c55e20', c: '#22c55e', l: 'Breakout' },
  pullback_to_poc:    { bg: '#3b82f620', c: '#3b82f6', l: 'POC Pullback' },
  ema_bounce:         { bg: '#8b5cf620', c: '#8b5cf6', l: 'EMA Bounce' },
  oversold_reversal:  { bg: '#06b6d420', c: '#06b6d4', l: 'Reversal' },
  overbought_warning: { bg: '#ef444420', c: '#ef4444', l: 'Overbought' },
  neutral:            { bg: '#64748b20', c: '#94a3b8', l: 'Neutral' },
};

export function getSetupBadge(type) {
  const s = SETUP_MAP[type] || SETUP_MAP.neutral;
  return (
    <span
      style={{
        background: s.bg,
        color: s.c,
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {s.l}
    </span>
  );
}

/* ---------- Smart Alert / Confluence ---------- */

export function getSmartAlert(asset) {
  const factors = [];
  let conf = 0;

  // 1. POC distance (max 2 pts)
  if (asset.poc_price && asset.price) {
    const d = Math.abs((asset.price - asset.poc_price) / asset.price * 100);
    if (d <= 2) {
      conf += 2;
      factors.push({ name: 'POC', score: 2, max: 2, detail: d.toFixed(1) + '%', pass: true });
    } else {
      factors.push({ name: 'POC', score: 0, max: 2, detail: d.toFixed(1) + '%', pass: false });
    }
  }

  // 2. Bullish candlestick patterns (max 1.5 pts)
  const bp = (asset.candlestick_patterns || []).filter((p) => p.type === 'bullish');
  if (bp.length > 0) {
    conf += 1.5;
    factors.push({ name: 'Pattern', score: 1.5, max: 1.5, detail: bp.map((p) => p.name).join(','), pass: true });
  } else {
    factors.push({ name: 'Pattern', score: 0, max: 1.5, detail: 'None', pass: false });
  }

  // 3. RSI sweet spot 40-60 (max 1 pt)
  if (asset.rsi >= 40 && asset.rsi <= 60) {
    conf += 1;
    factors.push({ name: 'RSI', score: 1, max: 1, detail: '' + asset.rsi?.toFixed(0), pass: true });
  } else {
    factors.push({ name: 'RSI', score: 0, max: 1, detail: '' + asset.rsi?.toFixed(0), pass: false });
  }

  // 4. MACD histogram > 0 (max 1 pt)
  if (asset.macd?.histogram > 0) {
    conf += 1;
    factors.push({ name: 'MACD', score: 1, max: 1, detail: '+', pass: true });
  } else {
    factors.push({ name: 'MACD', score: 0, max: 1, detail: '-', pass: false });
  }

  // 5. EMA alignment (max 1.5 pts)
  if (asset.price > asset.ema10 && asset.ema10 > asset.ema20 && asset.ema20 > asset.ema50) {
    conf += 1.5;
    factors.push({ name: 'EMA', score: 1.5, max: 1.5, detail: 'Up', pass: true });
  } else if (asset.price > asset.ema20 && asset.ema20 > asset.ema50) {
    conf += 0.75;
    factors.push({ name: 'EMA', score: 0.75, max: 1.5, detail: 'Mid', pass: true });
  } else {
    factors.push({ name: 'EMA', score: 0, max: 1.5, detail: 'No', pass: false });
  }

  // 6. Relative volume >= 1.5 (max 1 pt)
  if (asset.relative_volume >= 1.5) {
    conf += 1;
    factors.push({ name: 'Vol', score: 1, max: 1, detail: asset.relative_volume?.toFixed(1) + 'x', pass: true });
  } else {
    factors.push({ name: 'Vol', score: 0, max: 1, detail: asset.relative_volume?.toFixed(1) + 'x', pass: false });
  }

  return { confluence: Math.round(conf * 10) / 10, factors };
}

/* ---------- Period P&L ---------- */

export function getPeriodPnL(equityPeriods, selectedPeriod) {
  const data = equityPeriods[selectedPeriod];
  if (!data || data.length < 2) return { pnl: 0, pnl_pct: 0 };

  const start = data[0]?.equity || 0;
  const end   = data[data.length - 1]?.equity || 0;
  const pnl   = end - start;
  const pnl_pct = start > 0 ? (pnl / start) * 100 : 0;

  return {
    pnl: Math.round(pnl * 100) / 100,
    pnl_pct: Math.round(pnl_pct * 100) / 100,
  };
}
