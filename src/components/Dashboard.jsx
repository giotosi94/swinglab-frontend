import React from 'react';
import { getScoreColor, getSetupBadge, getRegimeColor } from '../utils/helpers';

export default function Dashboard({
  marketData,
  assets,
  livePrices,
  setSelectedStock,
  alpacaData,
  sectors,
  agentsStatus,
  onGoToAlpaca,
  onGoToAgents,
  onGoToSector,
  onLoadFullStock,
  mlPredictions,
  trendPredictions,
}) {
  const getLivePrice = (t) => livePrices[t] || null;
  const topSetups = [...assets]
    .sort((a, b) => b.setup_score - a.setup_score)
    .slice(0, 15);

  const ps = agentsStatus?.pipeline_state;
  const market = ps?.market || {};
  const lastActions = ps?.actions || [];

  return (
    <div>
      {/* ========== PORTFOLIO + AGENT ROW ========== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* ---- Portfolio Widget ---- */}
        <div
          onClick={onGoToAlpaca}
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            border: '1px solid #1e293b',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15 }}>{'💰'} Portfolio</h3>
            <span style={{ color: '#64748b', fontSize: 11 }}>
              Click to open Alpaca →
            </span>
          </div>
          {alpacaData ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                }}
              >
                {[
                  { l: 'Equity', v: `$${alpacaData.equity?.toLocaleString()}` },
                  { l: 'Cash', v: `$${alpacaData.cash?.toLocaleString()}` },
                  {
                    l: 'Daily P&L',
                    v: `${alpacaData.daily_pnl >= 0 ? '+' : ''}$${alpacaData.daily_pnl?.toLocaleString()}`,
                    c: alpacaData.daily_pnl >= 0 ? '#22c55e' : '#ef4444',
                  },
                  {
                    l: 'Positions',
                    v: alpacaData.positions?.length || 0,
                  },
                ].map((m) => (
                  <div
                    key={m.l}
                    style={{
                      background: '#1e293b',
                      borderRadius: 8,
                      padding: 10,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.l}</div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: m.c || 'white',
                        marginTop: 2,
                      }}
                    >
                      {m.v}
                    </div>
                  </div>
                ))}
              </div>
              {/* Mini positions list */}
              {alpacaData.positions?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {alpacaData.positions.slice(0, 3).map((p) => (
                    <div
                      key={p.symbol}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        color: '#94a3b8',
                        padding: '3px 0',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'white' }}>
                        {p.symbol}
                      </span>
                      <span
                        style={{
                          color: p.pnl_pct >= 0 ? '#22c55e' : '#ef4444',
                          fontWeight: 600,
                        }}
                      >
                        {p.pnl_pct >= 0 ? '+' : ''}
                        {p.pnl_pct?.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                  {alpacaData.positions.length > 3 && (
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                      +{alpacaData.positions.length - 3} more...
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 20 }}>
              Connecting...
            </div>
          )}
        </div>

        {/* ---- Agent Status Widget ---- */}
        <div
          onClick={onGoToAgents}
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            border: '1px solid #1e293b',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15 }}>{'🤖'} Agent Status</h3>
            <span style={{ color: '#64748b', fontSize: 11 }}>
              Click to open Agents →
            </span>
          </div>
          {market.regime ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                }}
              >
                {[
                  {
                    l: 'Regime',
                    v: market.regime,
                    c: getRegimeColor(market.regime),
                  },
                  { l: 'Confidence', v: `${market.confidence || 0}%` },
                  {
                    l: 'Exposure',
                    v: `${((market.exposure_multiplier || 0) * 100).toFixed(0)}%`,
                  },
                  {
                    l: 'Volatility',
                    v: market.volatility || '—',
                    c:
                      market.volatility === 'EXTREME'
                        ? '#ef4444'
                        : market.volatility === 'HIGH'
                        ? '#f97316'
                        : '#22c55e',
                  },
                ].map((m) => (
                  <div
                    key={m.l}
                    style={{
                      background: '#1e293b',
                      borderRadius: 8,
                      padding: 10,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.l}</div>
                    <div
                      style={{
                        fontSize: m.l === 'Regime' ? 16 : 14,
                        fontWeight: 700,
                        color: m.c || 'white',
                        marginTop: 2,
                      }}
                    >
                      {m.v}
                    </div>
                  </div>
                ))}
              </div>
              {/* Last run + recent actions */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>
                  Last Run:{' '}
                  {ps?.last_run
                    ? new Date(ps.last_run + (ps.last_run.endsWith('Z') ? '' : 'Z')).toLocaleString()
                    : 'Never'}
                </div>
                {lastActions.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      padding: '3px 0',
                    }}
                  >
                    <span
                      style={{
                        color: a.action === 'BUY' ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                      }}
                    >
                      {a.action} {a.ticker}
                    </span>
                    <span style={{ color: '#64748b' }}>
                      {a.shares && `${a.shares} shares`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 20 }}>
              Run pipeline to see status
            </div>
          )}
        </div>
      </div>

      {/* ========== SECTOR HEATMAP + ROTATION (metodo Rea) ========== */}
      {sectors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>{'🗺️'} Sector Rotation</h3>
            <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#94a3b8' }}>
              <span>🚀 Esplosivo</span>
              <span>↗️ Soldi in entrata</span>
              <span>↘️ Soldi in uscita</span>
              <span>⚡ Compresso</span>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 6,
              marginTop: 10,
            }}
          >
            {[...sectors]
              // 🆕 Ordina per accelerazione momentum (chi accelera in cima)
              .sort((a, b) => (b.momentum_accel ?? -999) - (a.momentum_accel ?? -999))
              .map((s) => {
                const sig = s.rotation_signal || 'NEUTRAL';
                const accel = s.momentum_accel ?? 0;
                const compressed = (s.compression_20d ?? 1) < 0.06;

                // Colore + emoji per segnale rotazione
                const sigCfg = {
                  EXPLOSIVE:   { bg: '#22c55e', emoji: '🚀', label: 'ESPLOSIVO' },
                  ROTATING_IN: { bg: '#16a34a', emoji: '↗️', label: 'IN ENTRATA' },
                  ROTATING_OUT:{ bg: '#ef4444', emoji: '↘️', label: 'IN USCITA' },
                  NEUTRAL:     { bg: '#64748b', emoji: '➡️', label: 'NEUTRO' },
                }[sig] || { bg: '#64748b', emoji: '➡️', label: 'NEUTRO' };

                return (
                  <div
                    key={s.code}
                    onClick={() => onGoToSector(s.code)}
                    style={{
                      background: sigCfg.bg + '20',
                      borderRadius: 8,
                      padding: 10,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: `2px solid ${sigCfg.bg}${sig === 'EXPLOSIVE' ? 'cc' : '40'}`,
                      position: 'relative',
                    }}
                  >
                    {compressed && (
                      <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 11 }} title="Compressione bassa (molla carica)">⚡</span>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 13, color: sigCfg.bg }}>
                      {sigCfg.emoji} {s.code}
                    </div>
                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
                      {s.name?.split(' ')[0]}
                    </div>
                    {/* Accelerazione = il numero chiave */}
                    <div style={{ fontSize: 16, fontWeight: 800, color: sigCfg.bg, marginTop: 4 }}>
                      {accel >= 0 ? '+' : ''}{accel.toFixed(0)}
                    </div>
                    <div style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>accel</div>
                    {/* 3M vs 6M con frecce */}
                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 3 }}>
                      3M <span style={{ color: (s.ann_3m ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>{(s.ann_3m ?? 0).toFixed(0)}%</span>
                      {' · '}
                      6M <span style={{ color: (s.ann_6m ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>{(s.ann_6m ?? 0).toFixed(0)}%</span>
                    </div>
                    <div style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>
                      RSI {s.rsi?.toFixed(0) || '—'} · {sigCfg.label}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========== MARKET TICKERS ========== */}
      {Object.keys(marketData).length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 8,
            marginBottom: 20,
          }}
        >
          {Object.entries(marketData).map(([sym, data]) => {
            let emoji = '\uD83D\uDCCA';
            if (sym.includes('/')) emoji = '\uD83E\uDE99';
            else if (['VIXY', 'FXE', 'UUP'].includes(sym)) emoji = '\uD83D\uDCB1';
            return (
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
                  {emoji} {sym}
                </div>
               <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                  ${(livePrices[sym]?.price || data.price)?.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: (livePrices[sym]?.change_pct ?? data.change_pct) >= 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  {(livePrices[sym]?.change_pct ?? data.change_pct) >= 0 ? '+' : ''}
                  {(livePrices[sym]?.change_pct ?? data.change_pct)?.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========== TOP SETUPS ========== */}
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
              onClick={() => onLoadFullStock(a.ticker)}
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
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    {a.ticker}
                  </span>{' '}
                  <span style={{ color: '#64748b', fontSize: 11 }}>
                    {a.sector_code}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>
                    ${live?.price || a.price}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        (live?.change_pct || a.change_pct) >= 0
                          ? '#22c55e'
                          : '#ef4444',
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
                {mlPredictions[a.ticker] && (
                  <span style={{
                    background: mlPredictions[a.ticker].prediction === 'WIN' ? '#22c55e20' : '#ef444420',
                    color: mlPredictions[a.ticker].prediction === 'WIN' ? '#22c55e' : '#ef4444',
                    padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, marginLeft: 6,
                  }}>
                    🧠 {mlPredictions[a.ticker].ml_score}%
                  </span>
                )}
                {trendPredictions[a.ticker] && (
                  <span style={{
                    background: trendPredictions[a.ticker].prediction === 'UP' ? '#22c55e20' : trendPredictions[a.ticker].prediction === 'DOWN' ? '#ef444420' : '#eab30820',
                    color: trendPredictions[a.ticker].prediction === 'UP' ? '#22c55e' : trendPredictions[a.ticker].prediction === 'DOWN' ? '#ef4444' : '#eab308',
                    padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, marginLeft: 4,
                  }}>
                    {trendPredictions[a.ticker].prediction === 'UP' ? '📈' : trendPredictions[a.ticker].prediction === 'DOWN' ? '📉' : '➡️'} {trendPredictions[a.ticker].up_prob}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
