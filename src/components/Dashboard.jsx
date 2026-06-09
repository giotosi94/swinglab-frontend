import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getScoreColor, getSetupBadge } from '../utils/helpers';

export default function Dashboard({ marketData, assets, livePrices, setSelectedStock }) {
  const getLivePrice = (t) => livePrices[t] || null;
  const topSetups = [...assets].sort((a, b) => b.setup_score - a.setup_score).slice(0, 15);

  return (
    <div>
      {/* Market Data Tickers */}
      {Object.keys(marketData).length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 8,
            marginBottom: 20,
          }}
        >
          {Object.entries(marketData).map(([sym, data]) => (
            <div
              key={sym}
              style={{
                background: '#0f172a',
                borderRadius: 8,
                padding: 10,
                textAlign: 'center',
                border: '1px solid #1e293b',
              }}
            >
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {sym.includes('/')
                  ? '\uD83E\uDE99'
                  : ['VIXY', 'FXE', 'UUP'].includes(sym)
                  ? '\uD83D\uDCB1'
                  : '\uD83D\uDCCA'}{' '}
                {sym}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                ${data.price?.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: data.change_pct >= 0 ? '#22c55e' : '#ef4444',
                }}
              >
                {data.change_pct >= 0 ? '+' : ''}
                {data.change_pct?.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Setups */}
      <h3>{'\uD83D\uDD25'} Top Setups</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {topSetups.map((a) => {
          const live = getLivePrice(a.ticker);
          return (
            <div
              key={a.ticker}
              onClick={() => setSelectedStock(a)}
              style={{
                background: '#0f172a',
                borderRadius: 10,
                padding: 14,
                cursor: 'pointer',
                border: '1px solid #1e293b',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{a.ticker}</span>{' '}
                  <span style={{ color: '#64748b', fontSize: 11 }}>{a.sector_code}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>${live?.price || a.price}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        (live?.change_pct || a.change_pct) >= 0 ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {(live?.change_pct || a.change_pct) >= 0 ? '+' : ''}
                    {(live?.change_pct || a.change_pct)?.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span
                    style={{
                      color: getScoreColor(a.setup_score),
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {a.setup_score}
                  </span>
                  {getSetupBadge(a.setup_type)}
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>
                  RSI {a.rsi?.toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
