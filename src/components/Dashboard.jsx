import React from 'react';
import {
  getScoreColor,
  getSetupBadge,
  getRegimeColor,
} from '../utils/helpers';

/* =========================================================
   MARKET INFORMATION
   ========================================================= */

const MARKET_INFO = {
  SPY: {
    name: 'S&P 500 ETF',
    category: 'US EQUITY',
    icon: '🇺🇸',
  },
  QQQ: {
    name: 'Nasdaq-100 ETF',
    category: 'US EQUITY',
    icon: '💻',
  },
  IWM: {
    name: 'Russell 2000 ETF',
    category: 'SMALL CAP',
    icon: '🏢',
  },
  DIA: {
    name: 'Dow Jones ETF',
    category: 'US EQUITY',
    icon: '🏛️',
  },
  VIXY: {
    name: 'VIX Short-Term Futures',
    category: 'VOLATILITY',
    icon: '⚡',
  },
  TLT: {
    name: '20+ Year Treasury Bond',
    category: 'BONDS',
    icon: '🏦',
  },
  UUP: {
    name: 'US Dollar ETF',
    category: 'CURRENCY',
    icon: '💵',
  },
  FXE: {
    name: 'Euro Currency ETF',
    category: 'CURRENCY',
    icon: '💶',
  },
};

const getMarketInfo = (symbol, data) =>
  MARKET_INFO[symbol] || {
    name: data?.name || 'Market Asset',
    category: 'MARKET',
    icon: '📊',
  };

/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function SectionHeader({ eyebrow, title, right }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: 9,
              color: '#64748b',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
          >
            {eyebrow}
          </div>
        )}

        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            color: '#f8fafc',
          }}
        >
          {title}
        </h3>
      </div>

      {right && (
        <div
          style={{
            fontSize: 9,
            color: '#475569',
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

function DashboardCard({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:
          'linear-gradient(145deg, #0f172a 0%, #0b1220 100%)',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: 15,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Gauge({ value = 0, label, color }) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  const offset =
    circumference - (safeValue / 100) * circumference;

  return (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 78,
          height: 78,
          margin: '0 auto 7px',
        }}
      >
        <svg
          width="78"
          height="78"
          viewBox="0 0 78 78"
        >
          <circle
            cx="39"
            cy="39"
            r={radius}
            fill="none"
            stroke="#172235"
            strokeWidth="7"
          />

          <circle
            cx="39"
            cy="39"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 39 39)"
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            color: '#f8fafc',
          }}
        >
          {Math.round(safeValue)}%
        </div>
      </div>

      <div
        style={{
          fontSize: 9,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function MomentumBar({ value }) {
  const numericValue = Number(value) || 0;
  const width = Math.min(Math.abs(numericValue), 100);
  const positive = numericValue >= 0;

  return (
    <div
      style={{
        height: 5,
        background: '#172235',
        borderRadius: 10,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: positive ? '#22c55e' : '#ef4444',
          borderRadius: 10,
        }}
      />
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

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
  const getLivePrice = (ticker) =>
    livePrices?.[ticker] || null;

  const topSetups = [...(assets || [])]
    .sort(
      (a, b) =>
        (b.setup_score || 0) -
        (a.setup_score || 0)
    )
    .slice(0, 12);

  const sortedSectors = [...(sectors || [])]
    .sort(
      (a, b) =>
        (b.momentum_accel ?? -999) -
        (a.momentum_accel ?? -999)
    );

  const ps = agentsStatus?.pipeline_state;
  const market = ps?.market || {};
  const lastActions = ps?.actions || [];

  const confidence = Number(
    market.confidence || 0
  );

  const exposure =
    Number(market.exposure_multiplier || 0) *
    100;

  const regime = market.regime || 'NEUTRAL';

  const regimeColor =
    getRegimeColor(regime);

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#050914',
        color: '#f8fafc',
        paddingBottom: 40,
      }}
    >
      {/* =====================================================
          HERO / SYSTEM STATUS
      ===================================================== */}

      <DashboardCard
        style={{
          marginBottom: 16,
          padding: 18,
          background:
            'radial-gradient(circle at 85% 15%, rgba(56,189,248,.12), transparent 30%), linear-gradient(145deg,#0d1729,#070c17)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: -0.8,
              }}
            >
              Swing
              <span style={{ color: '#38bdf8' }}>
                Lab
              </span>
            </div>

            <div
              style={{
                fontSize: 8,
                color: '#64748b',
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              Market Intelligence Center
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 9px',
              borderRadius: 20,
              background:
                'rgba(34,197,94,.08)',
              border:
                '1px solid rgba(34,197,94,.2)',
              color: '#22c55e',
              fontSize: 9,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow:
                  '0 0 8px rgba(34,197,94,.8)',
              }}
            />

            LIVE
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {/* Regime */}
          <div
            style={{
              background: '#0b1220',
              border: '1px solid #18243a',
              borderRadius: 10,
              padding: 11,
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Market Regime
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 15,
                fontWeight: 900,
                color: regimeColor,
              }}
            >
              {regime}
            </div>
          </div>

          {/* Volatility */}
          <div
            style={{
              background: '#0b1220',
              border: '1px solid #18243a',
              borderRadius: 10,
              padding: 11,
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Volatility
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 15,
                fontWeight: 900,
                color:
                  market.volatility ===
                  'EXTREME'
                    ? '#ef4444'
                    : market.volatility ===
                      'HIGH'
                    ? '#f97316'
                    : '#22c55e',
              }}
            >
              {market.volatility ||
                'NORMAL'}
            </div>
          </div>

          {/* Pipeline */}
          <div
            style={{
              background: '#0b1220',
              border: '1px solid #18243a',
              borderRadius: 10,
              padding: 11,
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Pipeline
            </div>

            <div
              style={{
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: ps
                    ? '#22c55e'
                    : '#eab308',
                }}
              />

              {ps
                ? 'ACTIVE'
                : 'WAITING'}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 8,
            color: '#475569',
          }}
        >
          Last pipeline run:{' '}
          {ps?.last_run
            ? new Date(
                ps.last_run +
                  (ps.last_run.endsWith(
                    'Z'
                  )
                    ? ''
                    : 'Z')
              ).toLocaleString()
            : 'Never'}
        </div>
      </DashboardCard>

      {/* =====================================================
          RISK ENGINE
      ===================================================== */}

      <DashboardCard
        style={{
          marginBottom: 16,
        }}
      >
        <SectionHeader
          eyebrow="Risk Engine"
          title="Risk & Exposure"
          right="CURRENT AGENT STATE"
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <Gauge
            value={confidence}
            label="Confidence"
            color="#38bdf8"
          />

          <Gauge
            value={exposure}
            label="Exposure"
            color="#22c55e"
          />

          <div
            style={{
              flex: 1,
              textAlign: 'center',
              borderLeft:
                '1px solid #1e293b',
              paddingLeft: 15,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Volatility
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                marginTop: 7,
                color:
                  market.volatility ===
                    'HIGH' ||
                  market.volatility ===
                    'EXTREME'
                    ? '#ef4444'
                    : '#22c55e',
              }}
            >
              {market.volatility ||
                'NORMAL'}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* =====================================================
          PORTFOLIO
      ===================================================== */}

      <DashboardCard
        onClick={onGoToAlpaca}
        style={{
          marginBottom: 16,
        }}
      >
        <SectionHeader
          eyebrow="Account"
          title="💰 Portfolio"
          right="OPEN ALPACA →"
        />

        {alpacaData ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                gap: 8,
              }}
            >
              {[
                {
                  label: 'Equity',
                  value: `$${Number(
                    alpacaData.equity ||
                      0
                  ).toLocaleString()}`,
                },
                {
                  label: 'Cash',
                  value: `$${Number(
                    alpacaData.cash ||
                      0
                  ).toLocaleString()}`,
                },
                {
                  label: 'Daily P&L',
                  value: `$${Number(
                    alpacaData.daily_pnl ||
                      0
                  ).toLocaleString()}`,
                  pnl: true,
                },
                {
                  label: 'Positions',
                  value:
                    alpacaData.positions
                      ?.length || 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: '#0b1220',
                    border:
                      '1px solid #18243a',
                    borderRadius: 9,
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 7,
                      color: '#64748b',
                      textTransform:
                        'uppercase',
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      fontWeight: 800,
                      color: item.pnl
                        ? alpacaData.daily_pnl >=
                          0
                          ? '#22c55e'
                          : '#ef4444'
                        : '#f8fafc',
                    }}
                  >
                    {item.pnl &&
                    alpacaData.daily_pnl >=
                      0
                      ? '+'
                      : ''}
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {alpacaData.positions
              ?.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginTop: 10,
                  overflow: 'hidden',
                }}
              >
                {alpacaData.positions
                  .slice(0, 6)
                  .map((p) => (
                    <div
                      key={p.symbol}
                      style={{
                        padding:
                          '5px 8px',
                        borderRadius: 6,
                        background:
                          '#111b2c',
                        border:
                          '1px solid #1e293b',
                        fontSize: 8,
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      <b>{p.symbol}</b>{' '}
                      <span
                        style={{
                          color:
                            p.pnl_pct >=
                            0
                              ? '#22c55e'
                              : '#ef4444',
                        }}
                      >
                        {p.pnl_pct >= 0
                          ? '+'
                          : ''}
                        {Number(
                          p.pnl_pct || 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              color: '#475569',
              fontSize: 12,
              textAlign: 'center',
              padding: 20,
            }}
          >
            Connecting to Alpaca...
          </div>
        )}
      </DashboardCard>

      {/* =====================================================
          MARKET PULSE
      ===================================================== */}

      {Object.keys(
        marketData || {}
      ).length > 0 && (
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <SectionHeader
            eyebrow="Live Tape"
            title="📡 Market Pulse"
            right="LIVE MARKET DATA"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 10,
            }}
          >
            {Object.entries(
              marketData
            ).map(([sym, data]) => {
              const info =
                getMarketInfo(
                  sym,
                  data
                );

              const price =
                livePrices?.[sym]?.price ??
                data.price;

              const change =
                livePrices?.[sym]
                  ?.change_pct ??
                data.change_pct ??
                0;

              const numericChange =
                Number(change) || 0;

              const positive =
                numericChange >= 0;

              return (
                <div
                  key={sym}
                  style={{
                    background:
                      'linear-gradient(145deg,#0f172a,#0b1220)',
                    border:
                      '1px solid #1e293b',
                    borderRadius: 12,
                    padding: 12,
                    position:
                      'relative',
                    overflow:
                      'hidden',
                  }}
                >
                  {/* top signal bar */}
                  <div
                    style={{
                      position:
                        'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background:
                        positive
                          ? '#22c55e'
                          : '#ef4444',
                    }}
                  />

                  {/* ticker */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color:
                            '#f8fafc',
                        }}
                      >
                        {info.icon}{' '}
                        {sym}
                      </div>

                      <div
                        style={{
                          fontSize: 8,
                          color:
                            '#38bdf8',
                          fontWeight:
                            700,
                          letterSpacing:
                            0.7,
                          marginTop: 2,
                        }}
                      >
                        {info.category}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius:
                          '50%',
                        background:
                          '#22c55e',
                        boxShadow:
                          '0 0 8px rgba(34,197,94,.8)',
                      }}
                    />
                  </div>

                  {/* description */}
                  <div
                    style={{
                      fontSize: 10,
                      color:
                        '#94a3b8',
                      minHeight: 28,
                    }}
                  >
                    {info.name}
                  </div>

                  {/* price */}
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color:
                        '#f8fafc',
                      marginTop: 8,
                    }}
                  >
                    {price != null
                      ? `$${Number(
                          price
                        ).toLocaleString()}`
                      : '—'}
                  </div>

                  {/* change */}
                  <div
                    style={{
                      marginTop: 5,
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        color:
                          positive
                            ? '#22c55e'
                            : '#ef4444',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {positive
                        ? '▲'
                        : '▼'}{' '}
                      {positive
                        ? '+'
                        : ''}
                      {numericChange.toFixed(
                        2
                      )}
                      %
                    </span>

                    <span
                      style={{
                        color:
                          '#475569',
                        fontSize: 8,
                      }}
                    >
                      today
                    </span>
                  </div>

                  {/* momentum */}
                  <div
                    style={{
                      height: 4,
                      background:
                        '#172235',
                      borderRadius: 5,
                      marginTop: 10,
                      overflow:
                        'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(
                          Math.abs(
                            numericChange
                          ) * 18,
                          100
                        )}%`,
                        background:
                          positive
                            ? '#22c55e'
                            : '#ef4444',
                        borderRadius: 5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          SECTOR MOMENTUM RADAR
      ===================================================== */}

      {sortedSectors.length > 0 && (
        <DashboardCard
          style={{
            marginBottom: 16,
          }}
        >
          <SectionHeader
            eyebrow="Rotation Engine"
            title="🗺️ Sector Momentum Radar"
            right="SORTED BY ACCELERATION"
          />

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 12,
              fontSize: 8,
              color: '#64748b',
            }}
          >
            <span>
              🚀 Explosive
            </span>
            <span>
              ↗️ Money In
            </span>
            <span>
              ↘️ Money Out
            </span>
            <span>
              ⚡ Compressed
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 9,
            }}
          >
            {sortedSectors.map(
              (s, index) => {
                const sig =
                  s.rotation_signal ||
                  'NEUTRAL';

                const accel =
                  Number(
                    s.momentum_accel ??
                      0
                  );

                const compressed =
                  (s.compression_20d ??
                    1) < 0.06;

                const sigCfg = {
                  EXPLOSIVE: {
                    color:
                      '#22c55e',
                    emoji: '🚀',
                    label:
                      'EXPLOSIVE',
                  },
                  ROTATING_IN: {
                    color:
                      '#16a34a',
                    emoji: '↗️',
                    label:
                      'IN',
                  },
                  ROTATING_OUT: {
                    color:
                      '#ef4444',
                    emoji: '↘️',
                    label:
                      'OUT',
                  },
                  NEUTRAL: {
                    color:
                      '#64748b',
                    emoji: '➡️',
                    label:
                      'NEUTRAL',
                  },
                }[sig] || {
                  color: '#64748b',
                  emoji: '➡️',
                  label: 'NEUTRAL',
                };

                return (
                  <div
                    key={s.code}
                    onClick={() =>
                      onGoToSector(
                        s.code
                      )
                    }
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '24px 55px 1fr 55px',
                      gap: 8,
                      alignItems:
                        'center',
                      cursor:
                        'pointer',
                      padding:
                        '7px 5px',
                      borderRadius: 8,
                      background:
                        sig ===
                        'EXPLOSIVE'
                          ? 'rgba(34,197,94,.04)'
                          : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 8,
                        color:
                          '#475569',
                      }}
                    >
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        '0'
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight:
                            800,
                        }}
                      >
                        {s.code}
                      </div>

                      <div
                        style={{
                          fontSize: 7,
                          color:
                            '#64748b',
                          marginTop: 2,
                        }}
                      >
                        {s.name
                          ?.split(
                            ' '
                          )[0] ||
                          'Sector'}
                      </div>
                    </div>

                    <MomentumBar
                      value={
                        accel
                      }
                    />

                    <div
                      style={{
                        textAlign:
                          'right',
                        fontSize: 9,
                        fontWeight:
                          900,
                        color:
                          sigCfg.color,
                      }}
                    >
                      {accel >= 0
                        ? '+'
                        : ''}
                      {accel.toFixed(
                        0
                      )}
                    </div>

                    {compressed && (
                      <span
                        style={{
                          position:
                            'absolute',
                          display:
                            'none',
                        }}
                      >
                        ⚡
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </DashboardCard>
      )}

      {/* =====================================================
          TOP SETUPS
      ===================================================== */}

      <DashboardCard
        style={{
          marginBottom: 16,
        }}
      >
        <SectionHeader
          eyebrow="Signal Engine"
          title="🔥 Top Setups"
          right={`${topSetups.length} HIGH-CONVICTION SIGNALS`}
        />

        {topSetups.length === 0 ? (
          <div
            style={{
              padding: 30,
              textAlign: 'center',
              color: '#475569',
              fontSize: 12,
            }}
          >
            No setups available.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 8,
            }}
          >
            {topSetups.map(
              (a, index) => {
                const live =
                  getLivePrice(
                    a.ticker
                  );

                const price =
                  live?.price ??
                  a.price;

                const change =
                  live?.change_pct ??
                  a.change_pct ??
                  0;

                const score =
                  Number(
                    a.setup_score ||
                      0
                  );

                const ml =
                  mlPredictions?.[
                    a.ticker
                  ];

                const trend =
                  trendPredictions?.[
                    a.ticker
                  ];

                return (
                  <div
                    key={
                      a.ticker
                    }
                    onClick={() =>
                      onLoadFullStock(
                        a.ticker
                      )
                    }
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(15,24,40,.95), rgba(10,17,29,.75))',
                      border:
                        '1px solid #1e293b',
                      borderRadius: 11,
                      padding: 10,
                      cursor:
                        'pointer',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '24px 55px 1fr 55px',
                        gap: 8,
                        alignItems:
                          'center',
                      }}
                    >
                      {/* rank */}
                      <div
                        style={{
                          fontSize: 8,
                          color:
                            '#475569',
                        }}
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          '0'
                        )}
                      </div>

                      {/* ticker */}
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight:
                              900,
                          }}
                        >
                          {a.ticker}
                        </div>

                        <div
                          style={{
                            fontSize: 7,
                            color:
                              '#64748b',
                            marginTop: 2,
                          }}
                        >
                          {a.sector_code ||
                            '—'}
                        </div>
                      </div>

                      {/* signal */}
                      <div>
                        <div
                          style={{
                            height: 6,
                            background:
                              '#172235',
                            borderRadius:
                              10,
                            overflow:
                              'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                score,
                                100
                              )}%`,
                              height:
                                '100%',
                              borderRadius:
                                10,
                              background:
                                getScoreColor(
                                  score
                                ),
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display:
                              'flex',
                            gap: 5,
                            marginTop: 5,
                            flexWrap:
                              'wrap',
                            alignItems:
                              'center',
                          }}
                        >
                          {getSetupBadge(
                            a.setup_type
                          )}

                          {mlPredictions?.[
                            a.ticker
                          ] && (
                            <span
                              style={{
                                background:
                                  ml.prediction ===
                                  'WIN'
                                    ? 'rgba(34,197,94,.12)'
                                    : 'rgba(239,68,68,.12)',
                                color:
                                  ml.prediction ===
                                  'WIN'
                                    ? '#22c55e'
                                    : '#ef4444',
                                padding:
                                  '2px 6px',
                                borderRadius:
                                  4,
                                fontSize: 8,
                                fontWeight:
                                  600,
                              }}
                            >
                              🧠 ML{' '}
                              {
                                ml.ml_score
                              }
                              %
                            </span>
                          )}

                          {trendPredictions?.[
                            a.ticker
                          ] && (
                            <span
                              style={{
                                background:
                                  trend.prediction ===
                                  'UP'
                                    ? 'rgba(34,197,94,.12)'
                                    : trend.prediction ===
                                      'DOWN'
                                    ? 'rgba(239,68,68,.12)'
                                    : 'rgba(234,179,8,.12)',
                                color:
                                  trend.prediction ===
                                  'UP'
                                    ? '#22c55e'
                                    : trend.prediction ===
                                      'DOWN'
                                    ? '#ef4444'
                                    : '#eab308',
                                padding:
                                  '2px 6px',
                                borderRadius:
                                  4,
                                fontSize: 8,
                                fontWeight:
                                  600,
                              }}
                            >
                              {trend.prediction ===
                              'UP'
                                ? '📈'
                                : trend.prediction ===
                                  'DOWN'
                                ? '📉'
                                : '➡️'}{' '}
                              {
                                trend.up_prob
                              }
                              %
                            </span>
                          )}
                        </div>
                      </div>

                      {/* score */}
                      <div
                        style={{
                          textAlign:
                            'right',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight:
                              900,
                            color:
                              getScoreColor(
                                score
                              ),
                          }}
                        >
                          {score}
                        </div>

                        <div
                          style={{
                            fontSize: 8,
                            color:
                              change >=
                              0
                                ? '#22c55e'
                                : '#ef4444',
                            marginTop: 2,
                          }}
                        >
                          {change >=
                          0
                            ? '+'
                            : ''}
                          {Number(
                            change
                          ).toFixed(
                            1
                          )}
                          %
                        </div>
                      </div>
                    </div>

                    {/* bottom metadata */}
                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        marginTop: 7,
                        fontSize: 7,
                        color:
                          '#64748b',
                      }}
                    >
                      <span>
                        RSI{' '}
                        {a.rsi !=
                        null
                          ? a.rsi.toFixed(
                              0
                            )
                          : '—'}
                      </span>

                      <span>
                        $
                        {Number(
                          price || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </DashboardCard>

      {/* =====================================================
          AGENT ACTIVITY
      ===================================================== */}

      <DashboardCard
        onClick={onGoToAgents}
      >
        <SectionHeader
          eyebrow="Automation"
          title="🤖 Agent Activity"
          right="OPEN AGENTS →"
        />

        {lastActions.length ===
        0 ? (
          <div
            style={{
              padding: 20,
              textAlign:
                'center',
              color: '#475569',
              fontSize: 10,
            }}
          >
            No recent agent
            actions.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 6,
            }}
          >
            {lastActions
              .slice(0, 5)
              .map((a, i) => (
                <div
                  key={i}
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                    padding:
                      '8px 9px',
                    background:
                      '#0b1220',
                    border:
                      '1px solid #18243a',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      color:
                        a.action ===
                        'BUY'
                          ? '#22c55e'
                          : a.action ===
                            'SELL'
                          ? '#ef4444'
                          : '#eab308',
                      fontSize: 9,
                      fontWeight:
                        900,
                    }}
                  >
                    {a.action}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      fontWeight:
                        800,
                    }}
                  >
                    {a.ticker}
                  </div>

                  <div
                    style={{
                      color:
                        '#64748b',
                      fontSize: 8,
                    }}
                  >
                    {a.shares
                      ? `${a.shares} shares`
                      : '—'}
                  </div>
                </div>
              ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
