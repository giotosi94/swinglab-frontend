import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getSetupBadge } from '../utils/helpers';

export default function Alpaca({
  alpacaData, equityPeriods, selectedPeriod, setSelectedPeriod,
  alpacaBuy, alpacaClose, alpacaCloseAll, assets, settings,
}) {
  const [buyTicker, setBuyTicker] = useState('');
  const [buyQty, setBuyQty] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);
  const [spyData, setSpyData] = useState(null);
  const [showBenchmark, setShowBenchmark] = useState(true);

  React.useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';
    fetch(`${API_URL}/api/data/benchmark/spy?period=${selectedPeriod}`)
      .then(r => r.json())
      .then(d => { if (d && d.points) setSpyData(d); })
      .catch(() => {});
  }, [selectedPeriod]);

  // Build asset map for setup badges on positions
  const assetMap = {};
  assets.forEach((a) => { assetMap[a.ticker] = a; });

  // Period P&L calculation
  const getPeriodPnL = () => {
    const data = equityPeriods[selectedPeriod];
    if (!data || data.length < 2) return { pnl: 0, pnl_pct: 0 };
    const s = data[0]?.equity || 0;
    const e = data[data.length - 1]?.equity || 0;
    const pnl = e - s;
    const pnl_pct = s > 0 ? (pnl / s) * 100 : 0;
    return {
      pnl: Math.round(pnl * 100) / 100,
      pnl_pct: Math.round(pnl_pct * 100) / 100,
    };
  };

  const periodPnL = getPeriodPnL();
  const equityColor = periodPnL.pnl >= 0 ? '#22c55e' : '#ef4444';

  // Handle buy
  const handleBuy = async () => {
    if (!buyTicker.trim() || buyQty < 1) return;
    setBuyLoading(true);
    try {
      await alpacaBuy(buyTicker.trim().toUpperCase(), buyQty);
      setBuyTicker('');
      setBuyQty(1);
    } catch (e) {
      // error handled in parent
    }
    setBuyLoading(false);
  };

  // Order status color
  const getStatusColor = (status) =>
    ({
      filled: '#22c55e',
      new: '#eab308',
      pending_new: '#eab308',
      partially_filled: '#f97316',
      cancelled: '#475569',
      expired: '#475569',
      rejected: '#ef4444',
    }[status] || '#64748b');

  if (!alpacaData) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
        Connecting to Alpaca...
      </div>
    );
  }

  return (
    <div>
      {/* ===== Summary Cards ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { l: 'Equity', v: `$${alpacaData.equity?.toLocaleString()}` },
          { l: 'Cash', v: `$${alpacaData.cash?.toLocaleString()}` },
          { l: 'Buying Power', v: `$${alpacaData.buying_power?.toLocaleString()}` },
          {
            l: `${selectedPeriod} P&L`,
            v: `${periodPnL.pnl >= 0 ? '+' : ''}$${periodPnL.pnl.toLocaleString()}`,
            c: periodPnL.pnl >= 0 ? '#22c55e' : '#ef4444',
          },
          {
            l: `${selectedPeriod} %`,
            v: `${periodPnL.pnl_pct >= 0 ? '+' : ''}${periodPnL.pnl_pct}%`,
            c: periodPnL.pnl_pct >= 0 ? '#22c55e' : '#ef4444',
          },
        ].map((m) => (
          <div
            key={m.l}
            style={{
              background: '#0f172a',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center',
              border: '1px solid #1e293b',
            }}
          >
            <div style={{ fontSize: 11, color: '#64748b' }}>{m.l}</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: m.c || 'white',
                marginTop: 4,
              }}
            >
              {m.v}
            </div>
          </div>
        ))}
      </div>

      {/* ===== [NEW] Quick Buy Form ===== */}
      <div
        style={{
          background: '#0f172a',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          border: '1px solid #1e293b',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>
          {'\uD83D\uDED2'} Quick Buy
        </h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={buyTicker}
            onChange={(e) => setBuyTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#1e293b',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              width: 120,
              textTransform: 'uppercase',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Qty:</span>
            <input
              type="number"
              value={buyQty}
              min={1}
              onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #334155',
                background: '#1e293b',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                width: 80,
              }}
            />
          </div>
          <button
            onClick={handleBuy}
            disabled={buyLoading || !buyTicker.trim()}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background:
                buyLoading || !buyTicker.trim() ? '#334155' : '#22c55e',
              color: 'white',
              cursor: buyLoading || !buyTicker.trim() ? 'default' : 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {buyLoading ? '\u23F3 Buying...' : '\u25B6 BUY'}
          </button>
          <span style={{ color: '#64748b', fontSize: 11 }}>
            Market order via Alpaca Paper
          </span>
        </div>
      </div>

     {/* ========== EQUITY + BENCHMARK CHART ========== */}
      {Object.keys(equityPeriods).length > 0 && (
        <div style={{
          background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #1e293b',
        }}>
          {/* Period selector + benchmark toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'].filter(p => equityPeriods[p]).map((p) => (
                <button key={p} onClick={() => setSelectedPeriod(p)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600,
                  background: selectedPeriod === p ? '#3b82f6' : '#1e293b',
                  color: selectedPeriod === p ? 'white' : '#64748b',
                }}>
                  {p}
                </button>
              ))}
            </div>
            {spyData && (
              <button onClick={() => setShowBenchmark(!showBenchmark)} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 600,
                background: showBenchmark ? '#64748b20' : '#1e293b',
                color: showBenchmark ? '#94a3b8' : '#475569',
              }}>
                {showBenchmark ? '📊 Hide SPY' : '📊 Show SPY'}
              </button>
            )}
          </div>

          {/* Performance Summary */}
          {(() => {
            const data = equityPeriods[selectedPeriod] || [];
            if (data.length < 2) return null;
            const startEq = data[0]?.equity || 0;
            const endEq = data[data.length - 1]?.equity || 0;
            const pnl = endEq - startEq;
            const pnlPct = startEq > 0 ? (pnl / startEq) * 100 : 0;
            const spyReturn = spyData?.total_return || 0;
            const alpha = pnlPct - spyReturn;
            const eqColor = pnl >= 0 ? '#22c55e' : '#ef4444';

            return (
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, color: '#64748b' }}>SwingLab</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: eqColor }}>
                    {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                  </div>
                  <span style={{ fontSize: 11, color: eqColor }}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                  </span>
                </div>
                {spyData && showBenchmark && (
                  <div>
                    <span style={{ fontSize: 10, color: '#64748b' }}>SPY</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: spyReturn >= 0 ? '#22c55e80' : '#ef444480' }}>
                      {spyReturn >= 0 ? '+' : ''}{spyReturn.toFixed(2)}%
                    </div>
                  </div>
                )}
                {spyData && showBenchmark && (
                  <div style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: alpha >= 0 ? '#22c55e20' : '#ef444420',
                    border: `1px solid ${alpha >= 0 ? '#22c55e40' : '#ef444440'}`,
                  }}>
                    <span style={{ fontSize: 10, color: '#64748b' }}>Alpha</span>
                    <div style={{
                      fontSize: 16, fontWeight: 800,
                      color: alpha >= 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {alpha >= 0 ? '+' : ''}{alpha.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Chart with benchmark */}
          {equityPeriods[selectedPeriod] && (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={(() => {
                const eqData = equityPeriods[selectedPeriod] || [];
                if (!eqData.length) return [];
                const startEq = eqData[0]?.equity || 100000;
                const spyByDate = {};
                if (spyData?.points && showBenchmark) {
                  const spyStart = spyData.points[0]?.price || 1;
                  spyData.points.forEach(p => {
                    spyByDate[p.date] = parseFloat(((p.price - spyStart) / spyStart * 100).toFixed(2));
                  });
                }
                return eqData.map(point => ({
                  date: point.date,
                  swinglab: parseFloat(((point.equity - startEq) / startEq * 100).toFixed(2)),
                  spy: spyByDate[point.date] ?? null,
                }));
              })()}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd"
                  tickFormatter={(val) => {
                    const num = Number(val);
                    if (num > 1000000000) return new Date(num * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return val;
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(value, name) => {
                    if (name === 'swinglab') return [`${value}%`, '📈 SwingLab'];
                    if (name === 'spy') return [`${value}%`, '📊 SPY'];
                    return [value, name];
                  }}
                />
                <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="swinglab" stroke={periodPnL.pnl >= 0 ? '#22c55e' : '#ef4444'}
                  fill={periodPnL.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.1} strokeWidth={2} name="swinglab" />
                {showBenchmark && spyData && (
                  <Area type="monotone" dataKey="spy" stroke="#64748b" fill="none"
                    strokeWidth={1.5} strokeDasharray="4 4" name="spy" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: periodPnL.pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
              ━━ SwingLab
            </span>
            {showBenchmark && spyData && (
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                ┅┅ SPY Benchmark
              </span>
            )}
          </div>
        </div>
      )}
      {/* ===== Positions ===== */}
      {alpacaData.positions?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0 }}>
              Positions ({alpacaData.positions.length})
            </h3>
            <button
              onClick={alpacaCloseAll}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Close All
            </button>
          </div>
          {alpacaData.positions.map((p) => {
            const asset = assetMap[p.symbol];
            return (
              <div
                key={p.symbol}
                style={{
                  background: '#0f172a',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  border: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, marginRight: 8 }}>{p.symbol}</span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>
                    {p.qty} shares @ ${p.entry_price}
                  </span>
                  {asset && (
                    <span style={{ marginLeft: 8 }}>
                      {getSetupBadge(asset.setup_type)}
                    </span>
                  )}
                  {asset && (
                    <span style={{ color: '#64748b', fontSize: 11, marginLeft: 6 }}>
                      {asset.sector_code}
                    </span>
                  )}
                  {/* Target, Stop Loss & Buy Time */}
                  {(() => {
                    const bracketOrder = alpacaData.orders?.find(o =>
                      o.symbol === p.symbol && o.side === 'buy' && o.status === 'filled' && o.legs
                    );
                    const tp = bracketOrder?.legs?.find(l => l.type === 'limit' || l.limit_price);
                    const sl = bracketOrder?.legs?.find(l => l.type === 'stop' || l.stop_price);
                    const buyTime = bracketOrder?.created_at;
                    return (
                      <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                        {tp && (
                          <span style={{ fontSize: 10, color: '#22c55e', background: '#22c55e15', padding: '1px 6px', borderRadius: 4 }}>
                            🎯 TP ${tp.limit_price}
                          </span>
                        )}
                        {sl && (
                          <span style={{ fontSize: 10, color: '#ef4444', background: '#ef444415', padding: '1px 6px', borderRadius: 4 }}>
                            🛑 SL ${sl.stop_price}
                          </span>
                        )}
                        {buyTime && (
                          <span style={{ fontSize: 10, color: '#64748b' }}>
                            🕐 {new Date(buyTime).toLocaleString()}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>${p.current_price}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: p.pnl_pct >= 0 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {p.pnl_pct >= 0 ? '+' : ''}
                      {p.pnl_pct?.toFixed(2)}% (${p.pnl?.toFixed(2)})
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alpacaClose(p.symbol);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Orders (ALL including bracket legs) ===== */}
      {alpacaData.orders?.length > 0 && (
        <div>
          <h3>Orders</h3>
          {alpacaData.orders.slice(0, 20).map((o) => {
            const sc = getStatusColor(o.status);
            return (
              <div key={o.id} style={{ marginBottom: 8 }}>
                {/* Main order */}
                <div
                  style={{
                    background: '#0f172a',
                    borderRadius: 6,
                    padding: 10,
                    border: '1px solid #1e293b',
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: o.side === 'buy' ? '#22c55e' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {o.side?.toUpperCase()}
                    </span>{' '}
                    <span style={{ fontWeight: 600 }}>{o.symbol}</span>{' '}
                    <span style={{ color: '#64748b' }}>x{o.qty}</span>
                    {(o.filled_avg_price || o.limit_price) && (
                      <span style={{ color: '#94a3b8', marginLeft: 6 }}>
                        @ ${o.filled_avg_price || o.limit_price}
                      </span>
                    )}
                    {o.legs && (
                      <span
                        style={{
                          marginLeft: 8,
                          background: '#3b82f620',
                          color: '#3b82f6',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        BRACKET
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      style={{
                        background: sc + '20',
                        color: sc,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {o.status}
                    </span>
                    <span style={{ color: '#475569', fontSize: 10 }}>{o.type}</span>
                    {o.created_at && (
                      <span style={{ color: '#475569', fontSize: 10 }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bracket Legs */}
                {o.legs &&
                  o.legs.map((leg, li) => {
                    const lsc = getStatusColor(leg.status);
                    const isTP =
                      leg.type === 'limit' ||
                      leg.order_class === 'take_profit' ||
                      leg.limit_price;
                    const isSL =
                      leg.type === 'stop' ||
                      leg.order_class === 'stop_loss' ||
                      leg.stop_price;
                    const label = isTP && !isSL ? 'TP' : 'SL';
                    const labelColor = label === 'TP' ? '#22c55e' : '#ef4444';
                    const price =
                      leg.limit_price || leg.stop_price || leg.filled_avg_price || '—';
                    return (
                      <div
                        key={leg.id || li}
                        style={{
                          background: '#1e293b',
                          borderRadius: 4,
                          padding: '6px 10px 6px 24px',
                          marginTop: 2,
                          fontSize: 11,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderLeft: `3px solid ${labelColor}`,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              color: labelColor,
                              fontWeight: 700,
                              marginRight: 6,
                            }}
                          >
                            {label}
                          </span>
                          <span style={{ color: '#94a3b8' }}>
                            {leg.side?.toUpperCase()} {leg.symbol || o.symbol} @ ${price}
                          </span>
                        </div>
                        <span
                          style={{
                            background: lsc + '20',
                            color: lsc,
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: 600,
                          }}
                        >
                          {leg.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
