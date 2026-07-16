import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

import * as api from '../utils/api';
import Analytics from './Analytics';
import { API } from '../utils/constants';

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
  const [activeTab, setActiveTab] = useState('history');
  const [dpsData, setDpsData] = useState(null);
  const [dpsLoading, setDpsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tData, dData] = await Promise.all([
          api.fetchTradeHistory(200),
          api.fetchDailySummary(),
        ]);
        if (Array.isArray(tData)) setTrades(tData);
        if (dData && !dData.error) setDailySummary(dData);
      } catch (e) {
        console.error('Failed to load trades', e);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (activeTab === 'dps' && !dpsData) {
      setDpsLoading(true);
      fetch(`${API}/api/agents/dps/status`)
        .then(r => r.json())
        .then(data => setDpsData(data))
        .catch(e => console.error('DPS load fail', e))
        .finally(() => setDpsLoading(false));
    }
  }, [activeTab, dpsData]);

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

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
  );
  let cumPnl = 0;
  const equityCurve = sortedTrades.map((t) => {
    cumPnl += t.pnl_pct || 0;
    return { date: (t.date || '').slice(0, 10), pnl: Math.round(cumPnl * 100) / 100, ticker: t.ticker };
  });

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

  const renderDPSTab = () => {
    if (dpsLoading) {
      return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading DPS data...</div>;
    }
    if (!dpsData) {
      return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No DPS data available</div>;
    }

    const { params, kelly_status, current_risk_report, sizing_history, multipliers_distribution, stats } = dpsData;

    // Prepare distribution chart data
    const distData = Object.entries(multipliers_distribution || {})
      .map(([mult, count]) => ({ multiplier: parseFloat(mult).toFixed(1) + 'x', count }))
      .sort((a, b) => parseFloat(a.multiplier) - parseFloat(b.multiplier));

    return (
      <>
        {/* KELLY STATUS CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: `2px solid ${kelly_status.active ? '#22c55e' : '#eab308'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 32 }}>💰</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Kelly Criterion Status</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                Sizing intelligente basato su win rate + payoff
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                padding: '6px 14px',
                borderRadius: 6,
                background: kelly_status.active ? '#22c55e33' : '#eab30833',
                color: kelly_status.active ? '#22c55e' : '#eab308',
                fontWeight: 700,
                fontSize: 13,
              }}>
                {kelly_status.active ? '✅ ATTIVO' : `⏳ Attende ${kelly_status.trades_needed} trade`}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 16 }}>
            {[
              { l: 'Trade chiusi', v: kelly_status.n_trades, sub: `min ${params.kelly_min_trades}` },
              { l: 'Win rate', v: `${kelly_status.win_rate}%`, c: kelly_status.win_rate >= 50 ? '#22c55e' : '#ef4444' },
              { l: 'Avg win', v: `+${kelly_status.avg_win}%`, c: '#22c55e' },
              { l: 'Avg loss', v: `-${kelly_status.avg_loss}%`, c: '#ef4444' },
              { l: 'Kelly raw', v: `${kelly_status.kelly_pct}%`, c: kelly_status.kelly_pct > 0 ? '#22c55e' : '#ef4444' },
              { l: `Fractional ${params.kelly_fractional_factor}x`, v: `${kelly_status.fractional_kelly}%`, c: '#f97316' },
              { l: 'Multiplier', v: `${kelly_status.current_multiplier.toFixed(2)}x`, c: '#3b82f6' },
            ].map((m) => (
              <div key={m.l} style={{ background: '#0f172a', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: m.c || 'white', marginTop: 4 }}>{m.v}</div>
                {m.sub && <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{m.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* CURRENT SIZING */}
        <div style={{
          background: '#0f172a',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: '1px solid #1e293b',
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🎯 Sizing corrente sistema</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { l: 'Position size base', v: `${current_risk_report.position_size_pct}%`, c: 'white' },
              { l: 'Kelly multiplier', v: `${current_risk_report.kelly_multiplier.toFixed(2)}x`, c: '#f97316' },
              { l: 'Regime multiplier', v: `${current_risk_report.final_multiplier.toFixed(2)}x`, c: '#3b82f6' },
              { l: 'Risk per trade', v: `$${current_risk_report.risk_per_trade_usd.toFixed(0)}`, c: '#eab308' },
              { l: 'Avg DPS 30d', v: `${stats.avg_dps_multiplier}x`, c: '#22c55e' },
              { l: 'Avg Kelly 30d', v: `${stats.avg_kelly_multiplier}x`, c: '#8b5cf6' },
            ].map((m) => (
              <div key={m.l} style={{ background: '#1e293b', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: m.c, marginTop: 4 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DISTRIBUTION CHART */}
        {distData.length > 0 && (
          <div style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            border: '1px solid #1e293b',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📊 Distribution DPS Multipliers (ultimi 30 trade)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distData}>
                <XAxis dataKey="multiplier" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6">
                  {distData.map((entry, i) => {
                    const mult = parseFloat(entry.multiplier);
                    const color = mult >= 1.3 ? '#22c55e' : mult >= 1.0 ? '#3b82f6' : '#f97316';
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, textAlign: 'center' }}>
              🟢 &gt; 1.3x sizing aggressivo su best picks &nbsp; 🔵 1.0-1.3x normale &nbsp; 🟠 &lt; 1.0x cautela
            </div>
          </div>
        )}

        {/* SIZING HISTORY TABLE */}
        {sizing_history && sizing_history.length > 0 && (
          <div style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 20,
            border: '1px solid #1e293b',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📋 Ultimi 30 trade approvati</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: 8, textAlign: 'left' }}>Ticker</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Notional</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Confluence</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>R/R</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>DPS</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Kelly</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {sizing_history.slice(0, 20).map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: 8, fontWeight: 700 }}>{s.ticker}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>${s.notional_usd?.toFixed(0)}</td>
                      <td style={{ padding: 8, textAlign: 'right', color: s.confluence >= 60 ? '#22c55e' : '#eab308' }}>
                        {s.confluence?.toFixed(0)}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{s.risk_reward?.toFixed(2)}</td>
                      <td style={{
                        padding: 8, textAlign: 'right', fontWeight: 700,
                        color: s.dps_multiplier >= 1.3 ? '#22c55e' : s.dps_multiplier >= 1.0 ? '#3b82f6' : '#f97316',
                      }}>
                        {s.dps_multiplier?.toFixed(2)}x
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', color: '#8b5cf6' }}>
                        {s.kelly_multiplier?.toFixed(2)}x
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', color: '#64748b', fontSize: 10 }}>
                        {(s.date || '').slice(5, 16).replace('T', ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  if (totalTrades === 0 && activeTab !== 'dps') {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ color: '#94a3b8' }}>No trades yet</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Run the pipeline to start trading!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>📊 Trades</h2>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {[
            { id: 'history', label: '📋 History' },
            { id: 'analytics', label: '📊 Analytics' },
            { id: 'dps', label: '💰 DPS + Kelly' },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: activeTab === t.id ? '#3b82f6' : '#1e293b',
              color: activeTab === t.id ? 'white' : '#94a3b8',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <Analytics />
      ) : activeTab === 'dps' ? (
        renderDPSTab()
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
