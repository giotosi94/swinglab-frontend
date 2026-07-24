import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import * as api from '../utils/api';
import BacktestWidget from "./BacktestWidget";
import WinRateBreakdown from "./WinRateBreakdown";
import InfoTip from "./InfoTip";
import { TIPS } from "../utils/metricTips";

const REGIME_COLORS = {
  BULL: '#22c55e', NEUTRAL: '#eab308', BEAR: '#f97316',
  CRASH: '#ef4444', UNKNOWN: '#64748b',
};
const DAY_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const d = await api.fetchAnalytics();
      if (d && !d.error) setData(d);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading analytics...</div>;
  }
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ color: '#94a3b8' }}>Non abbastanza trade</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>Servono almeno 2 trade chiusi per le analytics.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'drawdown', label: '📉 Drawdown' },
    { id: 'breakdown', label: '🔍 Breakdown' },
    { id: 'monthly', label: '📅 Monthly P&L' },
    { id: 'backtest', label: '🧪 Backtest' },
    { id: 'winrate', label: '🎯 Win Rate' },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: tab === t.id ? '#3b82f6' : '#1e293b',
            color: tab === t.id ? 'white' : '#94a3b8',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ==================== BACKTEST ==================== */}
      {tab === 'backtest' && <BacktestWidget />}

      {tab === 'winrate' && <WinRateBreakdown data={data} />}

      {/* ==================== OVERVIEW ==================== */}
{tab === 'overview' && (
  <>
    {/* Warning campione limitato */}
    {data.n_positions != null && data.n_positions < 30 && (
      <div style={{ background: "#eab30820", border: "1px solid #eab30844", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#eab308" }}>
        ⚠️ Campione limitato ({data.n_positions} posizioni). Sharpe, Sortino e drawdown diventano affidabili con 30+ trade chiusi.
      </div>
    )}

    {/* Key Metrics */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
      {[
        { l: 'Sharpe Ratio', tip: TIPS.sharpe, v: data.sharpe, c: data.sharpe >= 1 ? '#22c55e' : data.sharpe >= 0.5 ? '#eab308' : '#ef4444' },
        { l: 'Sortino Ratio', tip: TIPS.sortino, v: data.sortino >= 999 ? '∞' : data.sortino, c: data.sortino >= 1.5 ? '#22c55e' : data.sortino >= 0.7 ? '#eab308' : '#ef4444' },
        { l: 'Expectancy', tip: TIPS.expectancy, v: `${data.expectancy >= 0 ? '+' : ''}${data.expectancy}%`, c: data.expectancy >= 0 ? '#22c55e' : '#ef4444' },
        { l: 'Profit Factor', tip: TIPS.profit_factor, v: data.profit_factor >= 999 ? '∞' : data.profit_factor, c: data.profit_factor >= 1.5 ? '#22c55e' : data.profit_factor >= 1 ? '#eab308' : '#ef4444' },
        { l: 'Max Drawdown', tip: TIPS.max_drawdown, v: `${data.max_drawdown}%`, c: data.max_drawdown > -5 ? '#22c55e' : data.max_drawdown > -10 ? '#eab308' : '#ef4444' },
        { l: 'Win Rate', tip: TIPS.win_rate, v: `${data.win_rate}%`, c: data.win_rate >= 50 ? '#22c55e' : '#ef4444' },
        { l: 'Total P&L', tip: TIPS.total_pnl_pct, v: `${data.total_pnl_pct >= 0 ? '+' : ''}${data.total_pnl_pct}%`, c: data.total_pnl_pct >= 0 ? '#22c55e' : '#ef4444' },
        { l: 'Total P&L $', tip: TIPS.total_pnl_dollar, v: `${data.total_pnl_dollar >= 0 ? '+' : ''}$${data.total_pnl_dollar}`, c: data.total_pnl_dollar >= 0 ? '#22c55e' : '#ef4444' },
      ].map((m) => (
        <div key={m.l} style={{ background: '#0f172a', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.l}{m.tip && <InfoTip text={m.tip} />}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: m.c || 'white', marginTop: 4 }}>{m.v}</div>
        </div>
      ))}
    </div>

          {/* Streaks + Holding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* Streaks */}
            <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>🔥 Streaks</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{data.max_consec_wins}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Max Win Streak</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{data.max_consec_losses}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Max Loss Streak</div>
                </div>
              </div>
            </div>

            {/* Holding Period */}
            <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>⏱ Holding Period (days)</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { l: 'Winners', v: data.avg_hold_winners, c: '#22c55e' },
                  { l: 'Losers', v: data.avg_hold_losers, c: '#ef4444' },
                  { l: 'Overall', v: data.avg_hold_all, c: '#3b82f6' },
                ].map((m) => (
                  <div key={m.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cumulative P&L Chart */}
          {data.drawdown_series?.length > 1 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>📈 Cumulative P&L</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.drawdown_series}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v, name) => [`${v}%`, name === 'cum_pnl' ? 'Cumulative P&L' : name]} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Area type="monotone" dataKey="cum_pnl"
                    stroke={data.total_pnl_pct >= 0 ? '#22c55e' : '#ef4444'}
                    fill={data.total_pnl_pct >= 0 ? '#22c55e' : '#ef4444'}
                    fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* ==================== DRAWDOWN ==================== */}
      {tab === 'drawdown' && (
        <>
          {/* Drawdown Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #ef444440', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Max Drawdown</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>{data.max_drawdown}%</div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Drawdown Date</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginTop: 8 }}>{data.max_drawdown_date || '—'}</div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Current from Peak</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#eab308', marginTop: 4 }}>
                {data.drawdown_series?.length > 0
                  ? `${data.drawdown_series[data.drawdown_series.length - 1].drawdown}%`
                  : '—'}
              </div>
            </div>
          </div>

          {/* Drawdown Chart */}
          {data.drawdown_series?.length > 1 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>📉 Drawdown Curve</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.drawdown_series}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => [`${v}%`, 'Drawdown']}
                    labelFormatter={(l) => `Date: ${l}`} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#64748b' }}>
                ━━ Drawdown dal picco (più basso = peggiore)
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== BREAKDOWN ==================== */}
      {tab === 'breakdown' && (
        <>
          {/* Win Rate per Regime */}
          {data.regime_breakdown?.length > 0 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>🌍 Win Rate per Regime</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {data.regime_breakdown.map((r) => (
                  <div key={r.regime} style={{
                    background: '#1e293b', borderRadius: 8, padding: 12,
                    borderLeft: `3px solid ${REGIME_COLORS[r.regime] || '#64748b'}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: REGIME_COLORS[r.regime] || '#94a3b8', marginBottom: 6 }}>{r.regime}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#94a3b8' }}>{r.total} trades</span>
                      <span style={{ color: r.win_rate >= 50 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{r.win_rate}% WR</span>
                    </div>
                    <div style={{ fontSize: 11, color: r.pnl >= 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>{r.pnl >= 0 ? '+' : ''}{r.pnl}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Win Rate per Day */}
          {data.day_breakdown?.length > 0 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>📅 Performance per Giorno</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.day_breakdown}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => [`${v}%`, 'P&L']} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Bar dataKey="pnl">
                    {data.day_breakdown.map((d, i) => (
                      <Cell key={i} fill={d.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                {data.day_breakdown.map((d, i) => (
                  <span key={d.day} style={{ fontSize: 10, color: '#94a3b8' }}>
                    {d.day}: {d.total}t / {d.win_rate}% WR
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sector P&L */}
          {data.sector_breakdown?.length > 0 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>🏛 P&L per Settore</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {data.sector_breakdown.map((s) => (
                  <div key={s.sector} style={{
                    background: '#1e293b', borderRadius: 8, padding: 10,
                    borderLeft: `3px solid ${s.pnl >= 0 ? '#22c55e' : '#ef4444'}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{s.sector}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#64748b' }}>{s.total} trades</span>
                      <span style={{ color: s.win_rate >= 50 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{s.win_rate}% WR</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.pnl >= 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>
                      {s.pnl >= 0 ? '+' : ''}{s.pnl}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Stats */}
          {data.setup_breakdown?.length > 0 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>🎯 Performance per Setup</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {data.setup_breakdown.map((s) => (
                  <div key={s.setup} style={{
                    background: '#1e293b', borderRadius: 8, padding: 10,
                    borderLeft: `3px solid ${s.pnl >= 0 ? '#22c55e' : '#ef4444'}`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'capitalize', marginBottom: 4 }}>
                      {s.setup.replace(/_/g, ' ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#64748b' }}>{s.total} trades</span>
                      <span style={{ color: s.win_rate >= 50 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{s.win_rate}% WR</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.pnl >= 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>
                      {s.pnl >= 0 ? '+' : ''}{s.pnl}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== MONTHLY P&L ==================== */}
      {tab === 'monthly' && (
        <>
          {data.monthly_table?.length > 0 && (
            <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14 }}>📅 Monthly P&L</h3>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthly_table}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => [`${v}%`, 'P&L']} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Bar dataKey="pnl">
                    {data.monthly_table.map((m, i) => (
                      <Cell key={i} fill={m.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Table */}
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      {['Month', 'Trades', 'Wins', 'Win Rate', 'P&L %', 'P&L $'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly_table.map((m) => (
                      <tr key={m.month} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{m.month}</td>
                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{m.trades}</td>
                        <td style={{ padding: '8px 12px', color: '#22c55e' }}>{m.wins}</td>
                        <td style={{ padding: '8px 12px', color: m.win_rate >= 50 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{m.win_rate}%</td>
                        <td style={{ padding: '8px 12px', color: m.pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {m.pnl >= 0 ? '+' : ''}{m.pnl}%
                        </td>
                        <td style={{ padding: '8px 12px', color: m.pnl_dollar >= 0 ? '#22c55e' : '#ef4444' }}>
                          {m.pnl_dollar >= 0 ? '+' : ''}${m.pnl_dollar}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
