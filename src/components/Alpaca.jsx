import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getSetupBadge } from '../utils/helpers';

export default function Alpaca({
  alpacaData, equityPeriods, selectedPeriod, setSelectedPeriod,
  alpacaBuy, alpacaClose, alpacaCloseAll, assets, settings,
}) {
  const [buyTicker, setBuyTicker] = useState('');
  const [buyQty, setBuyQty] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);

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

      {/* ===== Equity Chart ===== */}
      {Object.keys(equityPeriods).length > 0 && (
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            border: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {Object.keys(equityPeriods).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  background: selectedPeriod === p ? '#3b82f6' : '#1e293b',
                  color: selectedPeriod === p ? 'white' : '#64748b',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          {equityPeriods[selectedPeriod] && (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={equityPeriods[selectedPeriod]}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={equityColor}
                  fill={equityColor}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
                    {o.filled_avg_price && (
                      <span style={{ color: '#94a3b8', marginLeft: 6 }}>
                        @ ${o.filled_avg_price}
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
