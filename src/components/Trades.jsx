import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

const SETUP_COLORS = {
  breakout: '#22c55e',
  pullback_to_poc: '#3b82f6',
  ema_bounce: '#8b5cf6',
  oversold_reversal: '#06b6d4',
  overbought_warning: '#ef4444',
  neutral: '#94a3b8',
};

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [setupFilter, setSetupFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, dRes] = await Promise.all([
          fetch(`${API}/api/trades/history?limit=200`),
          fetch(`${API}/api/trades/daily`),
        ]);
        const tData = await tRes.json();
        const dData = await dRes.json();
        if (Array.isArray(tData)) setTrades(tData);
        if (dData && !dData.error) setDailySummary(dData);
      } catch (e) {
        console.error('Failed to load trades', e);
      }
      setLoading(false);
    };
    load();
  }, []);

  /* ========== COMPUTED VALUES ========== */
  const wins = trades.filter((t) => (t.pnl_pct || 0) > 0);
  const losses = trades.filter((t) => (t.pnl_pct || 0) <= 0);
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const avgWin = wins.length > 0
    ? wins.reduce((s, t) => s + (t.pnl_pct || 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0
    ? Math.abs(losses.reduce((s, t) => s + (t.pnl_pct || 0), 0) / losses.length) : 0;
  const totalWinPnl = wins.reduce((s, t) => s + Math.abs(t.pnl_dollar || 0), 0);
  const totalLossPnl = losses.reduce((s, t) => s + Math.abs(t.pnl_dollar || 0), 0);
  const profitFactor = totalLossPnl > 0 ? totalWinPnl / totalLossPnl : totalWinPnl > 0 ? 999 : 0;
  const totalPnlPct = trades.reduce((s, t) => s + (t.pnl_pct || 0), 0);
  const totalPnlDollar = trades.reduce((s, t) => s + (t.pnl_dollar || 0), 0);
  const avgDaysHeld = totalTrades > 0
    ? trades.reduce((s, t) => s + (t.days_held || 0), 0) / totalTrades : 0;

  const bestTrade = trades.length > 0
    ? trades.reduce((best, t) => (t.pnl_pct || 0) > (best.pnl_pct || 0) ? t : best, trades[0])
    : null;
  const worstTrade = trades.length > 0
    ? trades.reduce((worst, t) => (t.pnl_pct || 0) < (worst.pnl_pct || 0) ? t : worst, trades[0])
    : null;

  /* ---- Equity curve ---- */
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
  );
  let cumPnl = 0;
  const equityCurve = sortedTrades.map((t) => {
    cumPnl += t.pnl_pct || 0;
    return { date: (t.date || '').slice(0, 10), pnl: Math.round(cumPnl * 100) / 100, ticker: t.ticker };
  });

  /* ---- Setup stats ---- */
  const setupStats = {};
  trades.forEach((t) => {
    const key = t.setup_type || 'unknown';
    if (!setupStats[key]) setupStats[key] = { total: 0, wins: 0, pnl: 0 };
    setupStats[key].total++;
    if ((t.pnl_pct || 0) > 0) setupStats[key].wins++;
    setupStats[key].pnl += t.pnl_pct || 0;
  });
  const setupStatsArray = Object.entries(setupStats)
    .map(([name, s]) => ({
      name, total: s.total,
      winRate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
      pnl: Math.round(s.pnl * 100) / 100,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const setupTypes = ['all', ...new Set(trades.map((t) => t.setup_type || 'unknown'))];

  /* ---- Filtered trades ---- */
  let filtered = trades;
  if (filter === 'wins') filtered = wins;
  if (filter === 'losses') filtered = losses;
  if (setupFilter !== 'all') filtered = filtered.filter((t) => (t.setup_type || 'unknown') === setupFilter);
  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  const curveColor = totalPnlPct >= 0 ? '#22c55e' : '#ef4444';

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading trades...</div>;
  }

  if (totalTrades === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ color: '#94a3b8' }}>No trades yet</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Run the pipeline to start trading! The agents will analyze the market and execute trades automatically.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>📊 Trade History</h2>

      {/* ========== PERFORMANCE CARDS ========== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total Trades', v: totalTrades },
          { l: 'Win Rate', v: `${winRate.toFixed(1)}%`, c: winRate >= 50 ? '#22c55e' : '#ef4444' },
          { l: 'Avg Win', v: `+${avgWin.toFixed(2)}%`, c: '#22c55e' },
          { l: 'Avg Loss', v: `-${avgLoss.toFixed(2)}%`, c: '#ef4444' },
          { l: 'Profit Factor', v: profitFactor >= 999 ? '∞' : profitFactor.toFixed(2), c: profitFactor >= 1.5 ? '#22c55e' : profitFactor >= 1 ? '#eab308' : '#ef4444' },
          { l: 'Total P&L %', v: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`, c: totalPnlPct >= 0 ? '#22c55e' : '#ef4444' },
          { l: 'Total P&L $', v: `${totalPnlDollar >= 0 ? '+' : ''}$${totalPnlDollar.toFixed(0)}`, c: totalPnlDollar >= 0 ? '#22c55e' : '#ef4444' },
          { l: 'Avg Days Held', v: avgDaysHeld.toFixed(1) },
        ].map((m) => (
          <div key={m.l} style={{ background: '#0f172a', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.c || 'white', marginTop: 4 }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* ========== BEST / WORST ========== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {bestTrade && (
          <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, border: '1px solid #22c55e40', borderLeft: '4px solid #22c55e' }}>
            <div style={{ fontSize: 11, color: '#22c55e', marginBottom: 6 }}>🏆 Best Trade</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{bestTrade.ticker}</span>
                <span style={{ color: '#64748b', fontSize: 11, marginLeft: 8 }}>{bestTrade.setup_type}</span>
              </div>
              <span style={{ color: (bestTrade.pnl_pct || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: 18 }}>{(bestTrade.pnl_pct || 0) >= 0 ? '+' : ''}{(bestTrade.pnl_pct || 0).toFixed(2)}%</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{bestTrade.days_held || 0} days • ${(bestTrade.pnl_dollar || 0).toFixed(0)}</div>
          </div>
        )}
        {worstTrade && (
          <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, border: '1px solid #ef444440', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 6 }}>📉 Worst Trade</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{worstTrade.ticker}</span>
                <span style={{ color: '#64748b', fontSize: 11, marginLeft: 8 }}>{worstTrade.setup_type}</span>
              </div>
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 18 }}>{(worstTrade.pnl_pct || 0).toFixed(2)}%</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{worstTrade.days_held || 0} days • ${(worstTrade.pnl_dollar || 0).toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* ========== TODAY ========== */}
      {dailySummary && (
        <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, marginBottom: 20, border: '1px solid #1e293b' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14 }}>📅 Today</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { l: 'Buys', v: dailySummary.buys || 0, c: '#22c55e' },
              { l: 'Sells', v: dailySummary.sells || 0, c: '#ef4444' },
              { l: 'Wins', v: dailySummary.wins || 0, c: '#22c55e' },
              { l: 'Losses', v: dailySummary.losses || 0, c: '#ef4444' },
              { l: 'P&L', v: `${(dailySummary.total_pnl_pct || 0) >= 0 ? '+' : ''}${(dailySummary.total_pnl_pct || 0).toFixed(2)}%`, c: (dailySummary.total_pnl_pct || 0) >= 0 ? '#22c55e' : '#ef4444' },
            ].map((m) => (
              <div key={m.l} style={{ fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>{m.l}: </span>
                <span style={{ color: m.c, fontWeight: 700 }}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== EQUITY CURVE ========== */}
      {equityCurve.length > 1 && (
        <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>📈 Cumulative P&L</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityCurve}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`, 'Cumulative P&L']} />
              <Area type="monotone" dataKey="pnl" stroke={curveColor} fill={curveColor} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ========== SETUP STATS ========== */}
      {setupStatsArray.length > 0 && (
        <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>🎯 Performance by Setup</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {setupStatsArray.map((s) => (
              <div key={s.name} style={{ background: '#1e293b', borderRadius: 8, padding: 10, borderLeft: `3px solid ${SETUP_COLORS[s.name] || '#64748b'}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: SETUP_COLORS[s.name] || '#94a3b8', textTransform: 'capitalize', marginBottom: 4 }}>{s.name.replace(/_/g, ' ')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#94a3b8' }}>{s.total} trades</span>
                  <span style={{ color: s.winRate >= 50 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{s.winRate}% WR</span>
                </div>
                <div style={{ fontSize: 11, color: s.pnl >= 0 ? '#22c55e' : '#ef4444', marginTop: 2 }}>{s.pnl >= 0 ? '+' : ''}{s.pnl.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== FILTERS ========== */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'wins', 'losses'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === f ? '#3b82f6' : '#1e293b', color: filter === f ? 'white' : '#94a3b8', textTransform: 'capitalize' }}>
            {f === 'all' ? `All (${totalTrades})` : f === 'wins' ? `Wins (${wins.length})` : `Losses (${losses.length})`}
          </button>
        ))}
        <select value={setupFilter} onChange={(e) => setSetupFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
          {setupTypes.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Setups' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>Showing {sortedFiltered.length} trades</span>
      </div>

      {/* ========== TRADE LIST ========== */}
      <div>
        {sortedFiltered.map((t, i) => {
          const pnl = t.pnl_pct || 0;
          const isWin = pnl > 0;
          return (
            <div key={t._id || i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${isWin ? '#22c55e20' : '#ef444420'}`, borderLeft: `3px solid ${isWin ? '#22c55e' : '#ef4444'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{t.ticker}</span>
                  {t.setup_type && (
                    <span style={{ background: (SETUP_COLORS[t.setup_type] || '#64748b') + '20', color: SETUP_COLORS[t.setup_type] || '#94a3b8', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600, textTransform: 'capitalize' }}>
                      {t.setup_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {t.market_regime && <span style={{ color: '#475569', fontSize: 10 }}>{t.market_regime}</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: isWin ? '#22c55e' : '#ef4444' }}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>${(t.pnl_dollar || 0).toFixed(0)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8', flexWrap: 'wrap' }}>
                <span>Entry: ${t.entry_price?.toFixed(2) || '—'}</span>
                <span>Exit: ${t.exit_price?.toFixed(2) || '—'}</span>
                <span>{t.shares || '—'} shares</span>
                <span>{t.days_held || 0} days</span>
                {t.reason && <span style={{ color: '#475569' }}>{t.reason}</span>}
                <span style={{ color: '#475569' }}>{(t.date || '').slice(0, 10)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
