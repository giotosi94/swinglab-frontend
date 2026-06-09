import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getScoreColor, getSmartAlert } from '../utils/helpers';

export default function StockDetail({ stock, onBack }) {
  const alert = getSmartAlert(stock);

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          cursor: 'pointer',
          marginBottom: 16,
          fontSize: 12,
        }}
      >
        {'\u2190'} Back
      </button>

      <div
        style={{
          background: '#0f172a',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #1e293b',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{stock.ticker}</h2>
            <span style={{ color: '#64748b' }}>{stock.sector_code}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>${stock.price}</div>
            <div
              style={{
                color: stock.change_pct >= 0 ? '#22c55e' : '#ef4444',
              }}
            >
              {stock.change_pct >= 0 ? '+' : ''}
              {stock.change_pct}%
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[
            { l: 'Score', v: stock.setup_score, c: getScoreColor(stock.setup_score) },
            { l: 'RSI', v: stock.rsi?.toFixed(1) },
            { l: 'POC', v: stock.poc_price ? '$' + stock.poc_price.toFixed(2) : 'N/A' },
            { l: 'VA High', v: stock.value_area_high ? '$' + stock.value_area_high.toFixed(2) : 'N/A' },
            { l: 'VA Low', v: stock.value_area_low ? '$' + stock.value_area_low.toFixed(2) : 'N/A' },
            { l: 'Rel Vol', v: stock.relative_volume?.toFixed(1) + 'x' },
          ].map((m) => (
            <div
              key={m.l}
              style={{
                background: '#1e293b',
                borderRadius: 6,
                padding: 8,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, color: '#64748b' }}>{m.l}</div>
              <div style={{ fontWeight: 700, color: m.c || 'white', marginTop: 2 }}>
                {m.v}
              </div>
            </div>
          ))}
        </div>

        {/* Confluence */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Confluence</span>
            <span
              style={{
                fontWeight: 700,
                color:
                  alert.confluence >= 6
                    ? '#22c55e'
                    : alert.confluence >= 4
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {alert.confluence}/10
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {alert.factors.map((f) => (
              <span
                key={f.name}
                style={{
                  background: f.pass ? '#22c55e15' : '#ef444415',
                  color: f.pass ? '#22c55e' : '#ef4444',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                }}
              >
                {f.name}: {f.detail}
              </span>
            ))}
          </div>
        </div>

        {/* Price Chart */}
        {stock.price_history && (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stock.price_history}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              {stock.poc_price && (
                <ReferenceLine
                  y={stock.poc_price}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
