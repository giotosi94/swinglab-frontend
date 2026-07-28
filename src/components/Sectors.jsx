import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getScoreColor } from '../utils/helpers';

export default function Sectors({ sectors, setSelectedSector, setView }) {
  return (
    <div>
      <h3>{'\uD83C\uDFDB'} Sectors</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {[...sectors]
          .sort((a, b) => b.composite_score - a.composite_score)
          .map((s) => (
            <div
              key={s.code}
              onClick={() => {
                setSelectedSector(s.code);
                setView('stocks');
              }}
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
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 700 }}>{s.code}</span>
                <span
                  style={{
                    color: getScoreColor(s.composite_score),
                    fontWeight: 700,
                  }}
                >
                  {s.composite_score?.toFixed(1)}
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                ${s.price} | RSI {s.rsi} | Str{' '}
                {s.strength_score >= 0 ? '+' : ''}
                {s.strength_score?.toFixed(1)}
              </div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>
                🕐 {s.updated_at
                  ? new Date(s.updated_at).toLocaleString('it-IT', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </div>
              {s.history && (
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={s.history.slice(-30)}>
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={s.composite_score >= 50 ? '#22c55e' : '#ef4444'}
                      fill={s.composite_score >= 50 ? '#22c55e' : '#ef4444'}
                      fillOpacity={0.1}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
