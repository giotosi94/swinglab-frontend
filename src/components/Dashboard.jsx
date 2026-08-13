import React from 'react';
import {
  getScoreColor,
  getSetupBadge,
  getRegimeColor,
} from '../utils/helpers';

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
  const getLivePrice = (ticker) => livePrices?.[ticker] || null;

  const topSetups = [...(assets || [])]
    .filter((a) => a && a.ticker)
    .sort((a, b) => (b.setup_score ?? 0) - (a.setup_score ?? 0))
    .slice(0, 15);

  const ps = agentsStatus?.pipeline_state;
  const market = ps?.market || {};
  const lastActions = ps?.actions || [];

  const marketEntries = Object.entries(marketData || {});

  const lastRun = ps?.last_run
    ? new Date(
        ps.last_run + (ps.last_run.endsWith('Z') ? '' : 'Z')
      ).toLocaleString()
    : 'Never';

  const portfolioMetrics = alpacaData
    ? [
        {
          label: 'Equity',
          value: `$${alpacaData.equity?.toLocaleString() ?? '—'}`,
        },
        {
          label: 'Cash',
          value: `$${alpacaData.cash?.toLocaleString() ?? '—'}`,
        },
        {
          label: 'Daily P&L',
          value: `${alpacaData.daily_pnl >= 0 ? '+' : ''}$${alpacaData.daily_pnl?.toLocaleString() ?? '—'}`,
          color: alpacaData.daily_pnl >= 0 ? '#22c55e' : '#ef4444',
        },
        {
          label: 'Positions',
          value: alpacaData.positions?.length || 0,
        },
      ]
    : [];

  const signalConfig = {
    EXPLOSIVE: {
      color: '#22c55e',
      emoji: '🚀',
      label: 'EXPLOSIVE',
    },
    ROTATING_IN: {
      color: '#16a34a',
      emoji: '↗️',
      label: 'MONEY IN',
    },
    ROTATING_OUT: {
      color: '#ef4444',
      emoji: '↘️',
      label: 'MONEY OUT',
    },
    NEUTRAL: {
      color: '#64748b',
      emoji: '➡️',
      label: 'NEUTRAL',
    },
  };

  return (
    <div
      style={{
        color: '#e2e8f0',
        paddingBottom: 30,
      }}
    >
      {/* ============================================================
          DASHBOARD HEADER
      ============================================================ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.4px',
              }}
            >
              SwingLab
            </h2>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 8px',
                borderRadius: 999,
                background: '#22c55e15',
                border: '1px solid #22c55e35',
                color: '#22c55e',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              <span>●</span> LIVE
            </span>
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: 11,
              marginTop: 4,
            }}
          >
            Market intelligence · portfolio · agents · setups
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '7px 11px',
              fontSize: 10,
              color: '#94a3b8',
            }}
          >
            Last pipeline:{' '}
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
              {lastRun}
            </span>
          </div>

          {market.regime && (
            <div
              style={{
                background: `${getRegimeColor(market.regime)}15`,
                border: `1px solid ${getRegimeColor(market.regime)}45`,
                borderRadius: 8,
                padding: '7px 11px',
                color: getRegimeColor(market.regime),
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {market.regime}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          PORTFOLIO + MARKET INTELLIGENCE
      ============================================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(300px, 1fr)',
          gap: 14,
          marginBottom: 16,
        }}
      >
        {/* PORTFOLIO */}
        <div
          onClick={onGoToAlpaca}
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 16,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 13,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                💰 Portfolio
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#64748b',
                  marginTop: 2,
                }}
              >
                Live account overview
              </div>
            </div>

            <span
              style={{
                color: '#475569',
                fontSize: 10,
              }}
            >
              Alpaca →
            </span>
          </div>

          {alpacaData ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: 8,
                }}
              >
                {portfolioMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    style={{
                      background: '#111c30',
                      border: '1px solid #1e293b',
                      borderRadius: 9,
                      padding: '11px 9px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {metric.label}
                    </div>

                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: metric.color || '#f8fafc',
                        marginTop: 4,
                      }}
                    >
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              {alpacaData.positions?.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 7,
                    marginTop: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {alpacaData.positions.slice(0, 5).map((position) => (
                    <div
                      key={position.symbol}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        background: '#111c30',
                        borderRadius: 7,
                        padding: '6px 8px',
                        fontSize: 10,
                      }}
                    >
                      <strong style={{ color: '#f8fafc' }}>
                        {position.symbol}
                      </strong>

                      <span
                        style={{
                          color:
                            position.pnl_pct >= 0
                              ? '#22c55e'
                              : '#ef4444',
                          fontWeight: 700,
                        }}
                      >
                        {position.pnl_pct >= 0 ? '+' : ''}
                        {position.pnl_pct?.toFixed(2)}%
                      </span>
                    </div>
                  ))}

                  {alpacaData.positions.length > 5 && (
                    <div
                      style={{
                        color: '#475569',
                        fontSize: 10,
                        padding: '6px 4px',
                      }}
                    >
                      +{alpacaData.positions.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                color: '#475569',
                textAlign: 'center',
                padding: 25,
                fontSize: 12,
              }}
            >
              Connecting to Alpaca...
            </div>
          )}
        </div>

        {/* MARKET INTELLIGENCE */}
        <div
          onClick={onGoToAgents}
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 16,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 13,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                🤖 Market Intelligence
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#64748b',
                  marginTop: 2,
                }}
              >
                Agent-derived market state
              </div>
            </div>

            <span
              style={{
                color: '#475569',
                fontSize: 10,
              }}
            >
              Agents →
            </span>
          </div>

          {market.regime ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {[
                {
                  label: 'Regime',
                  value: market.regime,
                  color: getRegimeColor(market.regime),
                },
                {
                  label: 'Confidence',
                  value: `${market.confidence || 0}%`,
                },
                {
                  label: 'Exposure',
                  value: `${((market.exposure_multiplier || 0) * 100).toFixed(0)}%`,
                },
                {
                  label: 'Volatility',
                  value: market.volatility || '—',
                  color:
                    market.volatility === 'EXTREME'
                      ? '#ef4444'
                      : market.volatility === 'HIGH'
                      ? '#f97316'
                      : '#22c55e',
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    background: '#111c30',
                    border: '1px solid #1e293b',
                    borderRadius: 9,
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    {metric.label}
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: metric.color || '#f8fafc',
                      marginTop: 4,
                    }}
                  >
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                color: '#475569',
                textAlign: 'center',
                padding: 25,
                fontSize: 12,
              }}
            >
              Run pipeline to see market intelligence
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          MARKET SNAPSHOT
      ============================================================ */}
      {marketEntries.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 9,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                📊 Market Snapshot
              </h3>

              <div
                style={{
                  fontSize: 9,
                  color: '#475569',
                  marginTop: 2,
                }}
              >
                Live market indicators
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(105px, 1fr))',
              gap: 7,
            }}
          >
            {marketEntries.map(([symbol, data]) => {
              const live = livePrices?.[symbol];

              const price = live?.price ?? data.price;
              const change = live?.change_pct ?? data.change_pct;

              let emoji = '📊';

              if (symbol.includes('/')) emoji = '🪙';
              else if (['VIXY', 'FXE', 'UUP'].includes(symbol)) {
                emoji = '💱';
              }

              return (
                <div
                  key={symbol}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: '9px 8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      color: '#64748b',
                    }}
                  >
                    {emoji} {symbol}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#f8fafc',
                      marginTop: 3,
                    }}
                  >
                    {price != null
                      ? `$${Number(price).toLocaleString()}`
                      : '—'}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color:
                        change >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 700,
                      marginTop: 1,
                    }}
                  >
                    {change >= 0 ? '+' : ''}
                    {change != null
                      ? Number(change).toFixed(2)
                      : '—'}
                    {change != null ? '%' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================
          SECTOR ROTATION
      ============================================================ */}
      {sectors?.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 10,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                🗺️ Sector Rotation
              </h3>

              <div
                style={{
                  fontSize: 9,
                  color: '#64748b',
                  marginTop: 3,
                }}
              >
                Momentum acceleration · 3M / 6M · RSI
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 9,
                fontSize: 9,
                color: '#64748b',
                flexWrap: 'wrap',
              }}
            >
              <span>🚀 Explosive</span>
              <span>↗️ In</span>
              <span>↘️ Out</span>
              <span>⚡ Compressed</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(135px, 1fr))',
              gap: 7,
            }}
          >
            {[...sectors]
              .sort(
                (a, b) =>
                  (b.momentum_accel ?? -999) -
                  (a.momentum_accel ?? -999)
              )
              .map((sector) => {
                const signal =
                  sector.rotation_signal || 'NEUTRAL';

                const cfg =
                  signalConfig[signal] ||
                  signalConfig.NEUTRAL;

                const accel = sector.momentum_accel ?? 0;

                const compressed =
                  (sector.compression_20d ?? 1) < 0.06;

                return (
                  <div
                    key={sector.code}
                    onClick={() =>
                      onGoToSector(sector.code)
                    }
                    style={{
                      background: `${cfg.color}10`,
                      border: `1px solid ${cfg.color}${signal === 'EXPLOSIVE' ? '99' : '35'}`,
                      borderRadius: 9,
                      padding: 11,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {compressed && (
                      <span
                        title="Compressione bassa"
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 7,
                          fontSize: 11,
                        }}
                      >
                        ⚡
                      </span>
                    )}

                    <div
                      style={{
                        color: cfg.color,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {cfg.emoji} {sector.code}
                    </div>

                    <div
                      style={{
                        color: '#64748b',
                        fontSize: 8,
                        marginTop: 2,
                      }}
                    >
                      {sector.name?.split(' ')[0]}
                    </div>

                    <div
                      style={{
                        color: cfg.color,
                        fontSize: 20,
                        fontWeight: 900,
                        marginTop: 5,
                      }}
                    >
                      {accel >= 0 ? '+' : ''}
                      {accel.toFixed(0)}
                    </div>

                    <div
                      style={{
                        color: '#475569',
                        fontSize: 8,
                      }}
                    >
                      momentum accel
                    </div>

                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: 9,
                        marginTop: 5,
                      }}
                    >
                      3M{' '}
                      <span
                        style={{
                          color:
                            (sector.ann_3m ?? 0) >= 0
                              ? '#22c55e'
                              : '#ef4444',
                        }}
                      >
                        {(sector.ann_3m ?? 0).toFixed(0)}%
                      </span>
                      {' · '}
                      6M{' '}
                      <span
                        style={{
                          color:
                            (sector.ann_6m ?? 0) >= 0
                              ? '#22c55e'
                              : '#ef4444',
                        }}
                      >
                        {(sector.ann_6m ?? 0).toFixed(0)}%
                      </span>
                    </div>

                    <div
                      style={{
                        color: '#475569',
                        fontSize: 8,
                        marginTop: 3,
                      }}
                    >
                      RSI {sector.rsi?.toFixed(0) || '—'} ·{' '}
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ============================================================
          TOP SETUPS
      ============================================================ */}
      <section style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 10,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              🔥 Top Setups
            </h3>

            <div
              style={{
                color: '#64748b',
                fontSize: 9,
                marginTop: 3,
              }}
            >
              Highest setup scores from the current universe
            </div>
          </div>

          <div
            style={{
              color: '#475569',
              fontSize: 9,
            }}
          >
            {topSetups.length} setups
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(270px, 1fr))',
            gap: 9,
          }}
        >
          {topSetups.map((asset, index) => {
            const live = getLivePrice(asset.ticker);

            const price = live?.price ?? asset.price;
            const change =
              live?.change_pct ?? asset.change_pct;

            const ml = mlPredictions?.[asset.ticker];
            const trend =
              trendPredictions?.[asset.ticker];

            return (
              <div
                key={asset.ticker}
                onClick={() =>
                  onLoadFullStock(asset.ticker)
                }
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 23,
                      height: 23,
                      borderRadius: 6,
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      color: '#64748b',
                      fontWeight: 800,
                    }}
                  >
                    #{index + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#f8fafc',
                      }}
                    >
                      {asset.ticker}
                    </div>

                    <div
                      style={{
                        fontSize: 9,
                        color: '#64748b',
                        marginTop: 1,
                      }}
                    >
                      {asset.sector_code || '—'}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {price != null
                        ? `$${price}`
                        : '—'}
                    </div>

                    <div
                      style={{
                        fontSize: 9,
                        color:
                          change >= 0
                            ? '#22c55e'
                            : '#ef4444',
                        fontWeight: 700,
                      }}
                    >
                      {change >= 0 ? '+' : ''}
                      {change != null
                        ? Number(change).toFixed(2)
                        : '—'}
                      {change != null ? '%' : ''}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    marginTop: 11,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 7px',
                      background: '#111c30',
                      borderRadius: 6,
                    }}
                  >
                    <span
                      style={{
                        color: getScoreColor(
                          asset.setup_score
                        ),
                        fontWeight: 900,
                        fontSize: 15,
                      }}
                    >
                      {asset.setup_score}
                    </span>

                    <span
                      style={{
                        color: '#64748b',
                        fontSize: 8,
                      }}
                    >
                      SCORE
                    </span>
                  </div>

                  {getSetupBadge(asset.setup_type)}

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: 9,
                      marginLeft: 'auto',
                    }}
                  >
                    RSI {asset.rsi?.toFixed(0) || '—'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 5,
                    marginTop: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {ml && (
                    <span
                      style={{
                        background:
                          ml.prediction === 'WIN'
                            ? '#22c55e15'
                            : '#ef444415',
                        border: `1px solid ${
                          ml.prediction === 'WIN'
                            ? '#22c55e30'
                            : '#ef444430'
                        }`,
                        color:
                          ml.prediction === 'WIN'
                            ? '#22c55e'
                            : '#ef4444',
                        padding: '3px 6px',
                        borderRadius: 5,
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      🧠 ML {ml.ml_score}%
                    </span>
                  )}

                  {trend && (
                    <span
                      style={{
                        background:
                          trend.prediction === 'UP'
                            ? '#22c55e15'
                            : trend.prediction === 'DOWN'
                            ? '#ef444415'
                            : '#eab30815',
                        border: `1px solid ${
                          trend.prediction === 'UP'
                            ? '#22c55e30'
                            : trend.prediction === 'DOWN'
                            ? '#ef444430'
                            : '#eab30830'
                        }`,
                        color:
                          trend.prediction === 'UP'
                            ? '#22c55e'
                            : trend.prediction === 'DOWN'
                            ? '#ef4444'
                            : '#eab308',
                        padding: '3px 6px',
                        borderRadius: 5,
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {trend.prediction === 'UP'
                        ? '📈'
                        : trend.prediction === 'DOWN'
                        ? '📉'
                        : '➡️'}{' '}
                      Trend {trend.up_prob}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {topSetups.length === 0 && (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              padding: 25,
              textAlign: 'center',
              color: '#475569',
              fontSize: 12,
            }}
          >
            No setups available.
          </div>
        )}
      </section>

      {/* ============================================================
          AGENT ACTIVITY
      ============================================================ */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 9,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              ⚡ Agent Activity
            </h3>

            <div
              style={{
                fontSize: 9,
                color: '#64748b',
                marginTop: 2,
              }}
            >
              Latest actions generated by the pipeline
            </div>
          </div>

          <button
            onClick={onGoToAgents}
            style={{
              background: 'transparent',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#64748b',
              padding: '5px 9px',
              fontSize: 9,
              cursor: 'pointer',
            }}
          >
            Open Agents →
          </button>
        </div>

        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 10,
            padding: 12,
          }}
        >
          {lastActions.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 7,
              }}
            >
              {lastActions.slice(0, 6).map((action, index) => (
                <div
                  key={index}
                  style={{
                    background: '#111c30',
                    borderRadius: 7,
                    padding: '8px 9px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div>
                    <span
                      style={{
                        color:
                          action.action === 'BUY'
                            ? '#22c55e'
                            : action.action === 'SELL'
                            ? '#ef4444'
                            : '#94a3b8',
                        fontWeight: 800,
                        fontSize: 10,
                      }}
                    >
                      {action.action}
                    </span>

                    <span
                      style={{
                        color: '#f8fafc',
                        fontWeight: 700,
                        fontSize: 11,
                        marginLeft: 6,
                      }}
                    >
                      {action.ticker}
                    </span>
                  </div>

                  {action.shares && (
                    <span
                      style={{
                        color: '#64748b',
                        fontSize: 9,
                      }}
                    >
                      {action.shares} shares
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                color: '#475569',
                textAlign: 'center',
                padding: 15,
                fontSize: 11,
              }}
            >
              No recent agent actions.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
