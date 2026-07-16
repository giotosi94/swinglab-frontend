import React, { useState, useEffect } from 'react';
import { API } from '../utils/constants';

export default function PositionTargets() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/agents/apm/position-targets`)
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (!data || !data.positions || data.positions.length === 0) return null;

  const toggleExpand = (ticker) => {
    setExpanded(prev => ({ ...prev, !prev[ticker] }));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      border: '2px solid #8b5cf6',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 24 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Adaptive Position Targets</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            Target 1/2/3 personalizzati per ogni stock basati su analisi Alpha
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          background: '#8b5cf633',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          color: '#8b5cf6',
        }}>
          {data.positions.length} POSIZIONI
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.positions.map((p) => {
          const isExpanded = expanded[p.ticker];
          const t1 = p.targets.t1;
          const t2 = p.targets.t2;
          const t3 = p.targets.t3;
          const pnl = p.pnl_pct || 0;
          const isProfit = pnl >= 0;

          return (
            <div
              key={p.ticker}
              style={{
                background: '#0f172a',
                borderRadius: 8,
                padding: 12,
                border: `1px solid ${isProfit ? '#22c55e30' : '#ef444430'}`,
              }}
            >
              {/* HEADER row */}
              <div
                onClick={() => toggleExpand(p.ticker)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{p.ticker}</span>
                  {p.is_adaptive && (
                    <span style={{
                      padding: '2px 8px',
                      background: '#8b5cf633',
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#8b5cf6',
                    }}>ADAPTIVE</span>
                  )}
                  {!p.is_adaptive && (
                    <span style={{
                      padding: '2px 8px',
                      background: '#64748b33',
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#94a3b8',
                    }}>LEGACY</span>
                  )}
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Entry ${p.entry_price.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isProfit ? '#22c55e' : '#ef4444',
                    }}>
                      {isProfit ? '+' : ''}{pnl.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      ${p.current_price.toFixed(2)}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR compact */}
              <div style={{
                marginTop: 10,
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}>
                {[t1, t2, t3].map((t, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: 8,
                    background: t.reached ? '#22c55e' : '#1e293b',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {!t.reached && t.progress > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${t.progress}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* TARGETS INLINE (always visible) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                marginTop: 8,
                fontSize: 10,
              }}>
                {[
                  { l: 'T1 (50%)', t: t1, color: '#22c55e' },
                  { l: 'T2 (30%)', t: t2, color: '#eab308' },
                  { l: 'T3 (20%)', t: t3, color: '#f97316' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: item.t.reached ? `${item.color}22` : '#1e293b',
                    padding: '6px 8px',
                    borderRadius: 6,
                    borderLeft: `3px solid ${item.color}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: 9 }}>{item.l}</div>
                    <div style={{ color: item.color, fontWeight: 700, marginTop: 2 }}>
                      +{item.t.pct}% (${item.t.price})
                    </div>
                    <div style={{ color: item.t.reached ? '#22c55e' : '#64748b', fontSize: 9, marginTop: 2 }}>
                      {item.t.reached ? '✓ Raggiunto' : `${item.t.distance_pct > 0 ? '+' : ''}${item.t.distance_pct}% da qui`}
                    </div>
                  </div>
                ))}
              </div>

              {/* EXPANDED DETAILS */}
              {isExpanded && (
                <div style={{
                  marginTop: 12,
                  padding: 10,
                  background: '#1e293b',
                  borderRadius: 6,
                  fontSize: 11,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Setup:</div>
                      <div style={{ color: 'white', fontWeight: 600 }}>{p.setup_type}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Confluence:</div>
                      <div style={{ color: 'white', fontWeight: 600 }}>{p.confluence}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Stop Loss:</div>
                      <div style={{ color: '#ef4444', fontWeight: 600 }}>${p.stop_loss.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Target Alpha:</div>
                      <div style={{ color: '#22c55e', fontWeight: 600 }}>${p.original_target.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Shares:</div>
                      <div style={{ color: 'white', fontWeight: 600 }}>{p.qty.toFixed(4)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Ultimo target hit:</div>
                      <div style={{ color: 'white', fontWeight: 600 }}>
                        {p.last_target_hit > 0 ? `T${p.last_target_hit}` : 'Nessuno'}
                        {p.partial_scaled_out && ' 🟡'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 12,
        padding: 8,
        background: '#0f172a',
        borderRadius: 6,
        fontSize: 10,
        color: '#64748b',
        textAlign: 'center',
      }}>
        🎯 <strong>Adaptive</strong>: target calcolati da Alpha per ogni stock &nbsp;•&nbsp;
        <strong>Legacy</strong>: trade vecchi con target fissi 5%/10%/20% &nbsp;•&nbsp;
        Aggiornamento ogni 30s
      </div>
    </div>
  );
}
