import React, { useState, useEffect } from 'react';
import { API } from '../utils/constants';
import { getSetupBadge } from '../utils/helpers';
import { fetchPositionsDetail } from '../utils/api';

export default function PositionsUnified({ alpacaData, alpacaClose, alpacaCloseAll, assets }) {
  const [positionsDetail, setPositionsDetail] = useState({});
  const [adaptiveTargets, setAdaptiveTargets] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function loadDetail() {
      const data = await fetchPositionsDetail();
      if (data && data.positions) {
        const map = {};
        data.positions.forEach(p => { map[p.ticker] = p; });
        setPositionsDetail(map);
      }
    }
    loadDetail();
    const interval = setInterval(loadDetail, 30000);
    return () => clearInterval(interval);
  }, [alpacaData]);

  useEffect(() => {
    const loadTargets = () => {
      fetch(`${API}/api/agents/apm/position-targets`)
        .then(r => r.json())
        .then(d => {
          if (d && d.positions) {
            const map = {};
            d.positions.forEach(p => { map[p.ticker] = p; });
            setAdaptiveTargets(map);
          }
        })
        .catch(() => {});
    };
    loadTargets();
    const interval = setInterval(loadTargets, 30000);
    return () => clearInterval(interval);
  }, [alpacaData]);

  const assetMap = {};
  assets.forEach((a) => { assetMap[a.ticker] = a; });

  const toggleExpand = (ticker) => {
    setExpanded(prev => {
      const newState = { ...prev };
      newState[ticker] = !prev[ticker];
      return newState;
    });
  };

  const getDistanceColor = (distancePct, isTarget) => {
    const abs = Math.abs(distancePct);
    if (isTarget) {
      if (abs < 2) return '#22c55e';
      if (abs < 5) return '#eab308';
      return '#94a3b8';
    } else {
      if (abs < 2) return '#ef4444';
      if (abs < 5) return '#eab308';
      return '#94a3b8';
    }
  };

  if (!alpacaData || !alpacaData.positions || alpacaData.positions.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ margin: 0 }}>💼 Positions ({alpacaData.positions.length})</h3>
          <span style={{
            fontSize: 10,
            color: '#8b5cf6',
            background: '#8b5cf615',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid #8b5cf644',
            fontWeight: 700,
          }}>
            🎯 ADAPTIVE TARGETS
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 10,
            color: '#22c55e',
            background: '#22c55e15',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid #22c55e33',
          }}>
            🛡️ Software SL/TP active
          </span>
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
      </div>

      {alpacaData.positions.map((p) => {
        const asset = assetMap[p.symbol];
        const detail = positionsDetail[p.symbol];
        const adaptive = adaptiveTargets[p.symbol];
        const isExpanded = expanded[p.symbol];
        const isProfit = (p.pnl_pct || 0) >= 0;

        return (
          <div
            key={p.symbol}
            style={{
              background: '#0f172a',
              borderRadius: 10,
              padding: 14,
              marginBottom: 10,
              border: `1px solid ${isProfit ? '#22c55e30' : '#ef444430'}`,
              borderLeft: `4px solid ${isProfit ? '#22c55e' : '#ef4444'}`,
            }}
          >
            {/* HEADER ROW */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{p.symbol}</span>
                {adaptive?.is_adaptive && (
                  <span style={{
                    padding: '2px 6px',
                    background: '#8b5cf633',
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#8b5cf6',
                  }}>ADAPTIVE</span>
                )}
                {adaptive && !adaptive.is_adaptive && (
                  <span style={{
                    padding: '2px 6px',
                    background: '#64748b33',
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#94a3b8',
                  }}>LEGACY</span>
                )}
                <span style={{ color: '#64748b', fontSize: 12 }}>
                  {p.qty?.toFixed(4)} shares @ ${p.entry_price}
                </span>
                {asset && <span style={{ marginLeft: 4 }}>{getSetupBadge(asset.setup_type)}</span>}
                {(detail?.sector || asset?.sector_code) && (
                  <span style={{ color: '#64748b', fontSize: 11 }}>
                    {detail?.sector || asset.sector_code}
                  </span>
                )}
                {detail?.days_held > 0 && (
                  <span style={{
                    color: '#3b82f6',
                    fontSize: 10,
                    background: '#3b82f620',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}>
                    {detail.days_held}d held
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>${p.current_price}</div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isProfit ? '#22c55e' : '#ef4444',
                  }}>
                    {isProfit ? '+' : ''}{p.pnl_pct?.toFixed(2)}% (${p.pnl?.toFixed(0)})
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alpacaClose(p.symbol);
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => toggleExpand(p.symbol)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              </div>
            </div>

            {/* PROGRESS BARS T1 T2 T3 */}
            {adaptive && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {['t1', 't2', 't3'].map((tk) => {
                  const t = adaptive.targets[tk];
                  return (
                    <div key={tk} style={{
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
                  );
                })}
              </div>
            )}

            {/* SUMMARY GRID */}
            {(detail || adaptive) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 8,
                padding: '10px',
                background: '#1e293b',
                borderRadius: 6,
              }}>
                {detail?.stop_loss > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      🛑 Stop Loss
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                      ${detail.stop_loss?.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: getDistanceColor(detail.stop_distance_pct, false),
                      fontWeight: 600,
                    }}>
                      {detail.stop_distance_pct >= 0 ? '+' : ''}{detail.stop_distance_pct?.toFixed(2)}%
                    </div>
                  </div>
                )}

                {adaptive && (
                  <>
                    <div style={{ borderLeft: '2px solid #22c55e', paddingLeft: 6 }}>
                      <div style={{ fontSize: 9, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                        🎯 T1 (50%)
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                        ${adaptive.targets.t1.price}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: adaptive.targets.t1.reached ? '#22c55e' : '#94a3b8',
                        fontWeight: 600,
                      }}>
                        +{adaptive.targets.t1.pct}% {adaptive.targets.t1.reached ? '✓' : `(+${adaptive.targets.t1.distance_pct.toFixed(1)}%)`}
                      </div>
                    </div>

                    <div style={{ borderLeft: '2px solid #eab308', paddingLeft: 6 }}>
                      <div style={{ fontSize: 9, color: '#eab308', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                        🎯 T2 (30%)
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                        ${adaptive.targets.t2.price}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: adaptive.targets.t2.reached ? '#22c55e' : '#94a3b8',
                        fontWeight: 600,
                      }}>
                        +{adaptive.targets.t2.pct}% {adaptive.targets.t2.reached ? '✓' : `(+${adaptive.targets.t2.distance_pct.toFixed(1)}%)`}
                      </div>
                    </div>

                    <div style={{ borderLeft: '2px solid #f97316', paddingLeft: 6 }}>
                      <div style={{ fontSize: 9, color: '#f97316', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                        🎯 T3 (20%)
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                        ${adaptive.targets.t3.price}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: adaptive.targets.t3.reached ? '#22c55e' : '#94a3b8',
                        fontWeight: 600,
                      }}>
                        +{adaptive.targets.t3.pct}% {adaptive.targets.t3.reached ? '✓' : `(+${adaptive.targets.t3.distance_pct.toFixed(1)}%)`}
                      </div>
                    </div>
                  </>
                )}

                {detail?.risk_reward > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      ⚖️ R/R
                    </div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: detail.risk_reward >= 2 ? '#22c55e' : detail.risk_reward >= 1 ? '#eab308' : '#ef4444',
                    }}>
                      {detail.risk_reward?.toFixed(2)}:1
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {detail.risk_reward >= 2 ? 'Excellent' : detail.risk_reward >= 1 ? 'Good' : 'Weak'}
                    </div>
                  </div>
                )}

                {detail?.confluence > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      📊 Confluence
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                      {detail.confluence?.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {detail.setup_type}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXPANDED DETAILS */}
            {isExpanded && detail && (
              <div style={{
                marginTop: 10,
                padding: 10,
                background: '#1e293b',
                borderRadius: 6,
                fontSize: 11,
                borderLeft: '3px solid #3b82f6',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Take Profit Alpha:</div>
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>
                      ${detail.target?.toFixed(2)}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 10 }}>
                      {detail.target_distance_pct >= 0 ? '+' : ''}{detail.target_distance_pct?.toFixed(2)}% da qui
                    </div>
                  </div>
                  {detail.trailing_stop && (
                    <div>
                      <div style={{ color: '#94a3b8' }}>Trailing Stop:</div>
                      <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>
                        ${detail.trailing_stop?.toFixed(2)}
                      </div>
                      <div style={{ color: '#22c55e', fontSize: 10 }}>Active</div>
                    </div>
                  )}
                  {adaptive?.last_target_hit > 0 && (
                    <div>
                      <div style={{ color: '#94a3b8' }}>Ultimo target hit:</div>
                      <div style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 13 }}>
                        T{adaptive.last_target_hit} {adaptive.partial_scaled_out ? '🟡' : ''}
                      </div>
                    </div>
                  )}
                  {asset?.rsi && (
                    <div>
                      <div style={{ color: '#94a3b8' }}>RSI attuale:</div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>
                        {asset.rsi?.toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
