import React from 'react';
import { getScoreColor, getSetupBadge, getRegimeColor } from '../utils/helpers';

/*
  SwingLab Command Center
  - Visual-only refactor of Dashboard.jsx
  - No new dependencies
  - Keeps existing props, callbacks and data contracts
  - Charts are built with native SVG/CSS using the data already available
*/

const C = {
  bg: '#060b16',
  panel: '#0b1220',
  panel2: '#0f1728',
  border: '#1b2940',
  text: '#f8fafc',
  muted: '#718096',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  blue: '#38bdf8',
  purple: '#a78bfa',
};

function LogoMark() {
  return (
    <div className="sl-logo">
      <svg viewBox="0 0 40 40" width="34" height="34">
        <defs>
          <linearGradient id="slg" x1="0" x2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        <circle
          cx="20"
          cy="20"
          r="18"
          fill="#0f1728"
          stroke="url(#slg)"
          strokeWidth="2"
        />

        <path
          d="M8 25 C12 13, 17 29, 21 18 S29 12, 33 8"
          fill="none"
          stroke="url(#slg)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle
          cx="30"
          cy="11"
          r="2.5"
          fill="#22c55e"
        />
      </svg>
    </div>
  );
}

function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`sl-card ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, right }) {
  return (
    <div className="sl-section-title">
      <div>
        {eyebrow && (
          <div className="sl-eyebrow">
            {eyebrow}
          </div>
        )}

        <div className="sl-title">
          {title}
        </div>
      </div>

      {right}
    </div>
  );
}

function Gauge({
  value = 0,
  color = C.blue,
  label,
  suffix = '%',
}) {
  const v = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = circ * (v / 100);

  return (
    <div className="sl-gauge">
      <svg viewBox="0 0 84 84">
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="#182338"
          strokeWidth="8"
        />

        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform="rotate(-90 42 42)"
        />
      </svg>

      <div className="sl-gauge-value">
        {v}{suffix}
      </div>

      <div className="sl-gauge-label">
        {label}
      </div>
    </div>
  );
}

function PulseBars({ entries }) {
  const rows = entries
    .map(([symbol, data]) => ({
      symbol,
      change: Number(data?.change_pct ?? 0),
    }))
    .slice(0, 8);

  const max = Math.max(
    1,
    ...rows.map(x => Math.abs(x.change))
  );

  return (
    <div className="sl-pulse">
      {rows.map((r) => {
        const positive = r.change >= 0;

        const width = Math.max(
          5,
          (Math.abs(r.change) / max) * 100
        );

        return (
          <div
            className="sl-pulse-row"
            key={r.symbol}
          >
            <span className="sl-pulse-symbol">
              {r.symbol}
            </span>

            <div className="sl-pulse-track">
              <div
                className={`sl-pulse-bar ${
                  positive ? 'up' : 'down'
                }`}
                style={{
                  width: `${width}%`,
                }}
              />
            </div>

            <span
              className={
                positive ? 'sl-up' : 'sl-down'
              }
            >
              {positive ? '+' : ''}
              {r.change.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SectorChart({
  sectors,
  onGoToSector,
}) {
  const data = [...(sectors || [])]
    .sort(
      (a, b) =>
        (b.momentum_accel ?? -999) -
        (a.momentum_accel ?? -999)
    )
    .slice(0, 10);

  if (!data.length) return null;

  const max = Math.max(
    1,
    ...data.map(s =>
      Math.abs(
        Number(s.momentum_accel ?? 0)
      )
    )
  );

  return (
    <div className="sl-sector-chart">
      {data.map((s) => {
        const signal =
          s.rotation_signal || 'NEUTRAL';

        const color =
          signal === 'EXPLOSIVE'
            ? C.green
            : signal === 'ROTATING_IN'
            ? '#16a34a'
            : signal === 'ROTATING_OUT'
            ? C.red
            : '#64748b';

        const accel = Number(
          s.momentum_accel ?? 0
        );

        const width = Math.max(
          3,
          (Math.abs(accel) / max) * 100
        );

        return (
          <div
            className="sl-sector-row"
            key={s.code}
            onClick={() =>
              onGoToSector(s.code)
            }
          >
            <div className="sl-sector-name">
              <b>{s.code}</b>

              <span>
                {s.name?.split(' ')[0] ||
                  signal}
              </span>
            </div>

            <div className="sl-sector-track">
              <div
                className="sl-sector-bar"
                style={{
                  width: `${width}%`,
                  background: color,
                  boxShadow: `0 0 14px ${color}55`,
                }}
              />
            </div>

            <div
              className="sl-sector-value"
              style={{ color }}
            >
              {accel >= 0 ? '+' : ''}
              {accel.toFixed(0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SetupRow({
  asset,
  index,
  livePrices,
  mlPredictions,
  trendPredictions,
  onLoadFullStock,
}) {
  const live =
    livePrices?.[asset.ticker];

  const price =
    live?.price ?? asset.price;

  const change =
    live?.change_pct ??
    asset.change_pct;

  const ml =
    mlPredictions?.[asset.ticker];

  const trend =
    trendPredictions?.[asset.ticker];

  return (
    <div
      className="sl-setup-row"
      onClick={() =>
        onLoadFullStock(asset.ticker)
      }
    >
      <div className="sl-rank">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="sl-setup-main">
        <div className="sl-setup-name">
          <b>{asset.ticker}</b>

          <span>
            {asset.sector_code || '—'}
          </span>
        </div>

        <div className="sl-score-track">
          <div
            className="sl-score-fill"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  Number(
                    asset.setup_score
                  ) || 0
                )
              )}%`,
              background:
                getScoreColor(
                  asset.setup_score
                ),
            }}
          />
        </div>
      </div>

      <div
        className="sl-score-number"
        style={{
          color:
            getScoreColor(
              asset.setup_score
            ),
        }}
      >
        {asset.setup_score}
      </div>

      <div className="sl-price">
        <b>
          {price != null
            ? `$${price}`
            : '—'}
        </b>

        <span
          className={
            Number(change ?? 0) >= 0
              ? 'sl-up'
              : 'sl-down'
          }
        >
          {Number(change ?? 0) >= 0
            ? '+'
            : ''}

          {change != null
            ? Number(change).toFixed(2)
            : '—'}
          %
        </span>
      </div>

      <div className="sl-tags">
        {getSetupBadge(
          asset.setup_type
        )}

        {ml && (
          <span
            className={`sl-tag ${
              ml.prediction === 'WIN'
                ? 'green'
                : 'red'
            }`}
          >
            🧠 {ml.ml_score}%
          </span>
        )}

        {trend && (
          <span
            className={`sl-tag ${
              trend.prediction === 'UP'
                ? 'green'
                : trend.prediction === 'DOWN'
                ? 'red'
                : 'amber'
            }`}
          >
            {trend.prediction === 'UP'
              ? '↗'
              : trend.prediction === 'DOWN'
              ? '↘'
              : '→'}{' '}
            {trend.up_prob}%
          </span>
        )}
      </div>
    </div>
  );
}

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
  const ps =
    agentsStatus?.pipeline_state;

  const market =
    ps?.market || {};

  const actions =
    ps?.actions || [];

  const topSetups = [
    ...(assets || []),
  ]
    .filter(a => a?.ticker)
    .sort(
      (a, b) =>
        (b.setup_score ?? 0) -
        (a.setup_score ?? 0)
    );

  const marketEntries =
    Object.entries(
      marketData || {}
    );

  const confidence =
    Number(
      market.confidence || 0
    );

  const exposure =
    Number(
      market.exposure_multiplier || 0
    ) * 100;

  const lastRun =
    ps?.last_run
      ? new Date(
          ps.last_run +
            (
              ps.last_run.endsWith('Z')
                ? ''
                : 'Z'
            )
        ).toLocaleString()
      : 'Never';

  const regimeColor =
    market.regime
      ? getRegimeColor(
          market.regime
        )
      : C.muted;

  return (
    <div className="sl-dashboard">

      <style>{`

        .sl-dashboard {
          --sl-bg: #060b16;
          --sl-panel: #0b1220;
          --sl-panel2: #0f1728;
          --sl-border: #1b2940;

          color: ${C.text};

          padding:
            6px 0 40px;

          font-family: inherit;
        }

        .sl-dashboard * {
          box-sizing: border-box;
        }

        .sl-card {
          background:
            linear-gradient(
              145deg,
              #0d1626,
              #09111e
            );

          border:
            1px solid
            var(--sl-border);

          border-radius: 16px;

          position: relative;

          overflow: hidden;
        }

        .sl-card::after {
          content: '';

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(56,189,248,.07),
              transparent 30%
            );
        }

        .sl-card.clickable,
        .sl-setup-row,
        .sl-sector-row {
          cursor: pointer;
        }

        .sl-hero {
          display: grid;

          grid-template-columns:
            minmax(0, 1.55fr)
            minmax(290px, .8fr);

          gap: 14px;

          margin-bottom: 14px;
        }

        .sl-hero-main {
          padding: 22px;

          min-height: 220px;

          background:
            radial-gradient(
              circle at 82% 18%,
              rgba(56,189,248,.12),
              transparent 28%
            ),
            radial-gradient(
              circle at 70% 90%,
              rgba(167,139,250,.09),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              #0e192c,
              #080f1c
            );
        }

        .sl-brand {
          display:flex;

          align-items:center;

          gap:10px;
        }

        .sl-logo {
          width:38px;
          height:38px;
        }

        .sl-brand-name {
          font-size:18px;

          font-weight:900;

          letter-spacing:-.5px;
        }

        .sl-brand-sub {
          color:#64748b;

          font-size:9px;

          margin-top:2px;
        }

        .sl-live {
          display:inline-flex;

          align-items:center;

          gap:5px;

          margin-left:7px;

          padding:
            4px 7px;

          border-radius:99px;

          font-size:8px;

          font-weight:800;

          color:#22c55e;

          background:#22c55e12;

          border:
            1px solid
            #22c55e35;
        }

        .sl-live i {
          width:5px;
          height:5px;

          border-radius:50%;

          background:#22c55e;

          box-shadow:
            0 0 8px
            #22c55e;
        }

        .sl-hero-grid {
          display:grid;

          grid-template-columns:
            1fr 1fr 1fr;

          gap:10px;

          margin-top:28px;
        }

        .sl-hero-metric {
          padding:12px;

          background:#0a1322;

          border:
            1px solid
            #18253a;

          border-radius:11px;
        }

        .sl-hero-label,
        .sl-eyebrow {
          font-size:8px;

          text-transform:uppercase;

          letter-spacing:1px;

          color:#64748b;

          font-weight:800;
        }

        .sl-hero-value {
          font-size:20px;

          font-weight:900;

          margin-top:5px;
        }

        .sl-hero-note {
          font-size:8px;

          color:#475569;

          margin-top:3px;
        }

        .sl-hero-side {
          padding:18px;

          display:flex;

          flex-direction:column;
        }

        .sl-side-title {
          font-size:12px;

          font-weight:800;
        }

        .sl-side-sub {
          font-size:8px;

          color:#64748b;

          margin-top:3px;
        }

        .sl-gauges {
          display:flex;

          justify-content:space-around;

          align-items:center;

          flex:1;

          margin-top:8px;
        }

        .sl-gauge {
          width:105px;

          text-align:center;

          position:relative;
        }

        .sl-gauge svg {
          width:84px;
          height:84px;
        }

        .sl-gauge-value {
          position:absolute;

          left:0;
          right:0;

          top:30px;

          font-size:13px;

          font-weight:900;
        }

        .sl-gauge-label {
          margin-top:-4px;

          font-size:8px;

          color:#64748b;

          text-transform:uppercase;
        }

        .sl-grid-2 {
          display:grid;

          grid-template-columns:
            minmax(0,1.2fr)
            minmax(0,.8fr);

          gap:14px;

          margin-bottom:14px;
        }

        .sl-panel-pad {
          padding:16px;
        }

        .sl-section-title {
          display:flex;

          justify-content:space-between;

          align-items:flex-end;

          gap:10px;

          margin-bottom:12px;
        }

        .sl-title {
          font-size:13px;

          font-weight:900;

          margin-top:2px;
        }

        .sl-section-note {
          font-size:8px;

          color:#475569;
        }

        .sl-pulse {
          display:flex;

          flex-direction:column;

          gap:8px;
        }

        .sl-pulse-row {
          display:grid;

          grid-template-columns:
            55px 1fr 55px;

          align-items:center;

          gap:8px;

          font-size:9px;
        }

        .sl-pulse-symbol {
          font-weight:800;

          color:#cbd5e1;
        }

        .sl-pulse-track,
        .sl-score-track,
        .sl-sector-track {
          height:7px;

          background:#111c30;

          border-radius:99px;

          overflow:hidden;
        }

        .sl-pulse-bar {
          height:100%;

          border-radius:99px;
        }

        .sl-pulse-bar.up {
          background:
            linear-gradient(
              90deg,
              #16a34a,
              #22c55e
            );
        }

        .sl-pulse-bar.down {
          background:
            linear-gradient(
              90deg,
              #ef4444,
              #b91c1c
            );
        }

        .sl-up {
          color:#22c55e;
        }

        .sl-down {
          color:#ef4444;
        }

        .sl-account {
          display:grid;

          grid-template-columns:
            repeat(4,1fr);

          gap:8px;
        }

        .sl-account-box {
          padding:11px;

          background:#0a1322;

          border:
            1px solid
            #18253a;

          border-radius:10px;
        }

        .sl-account-box span {
          display:block;

          color:#64748b;

          font-size:8px;

          text-transform:uppercase;
        }

        .sl-account-box b {
          display:block;

          font-size:15px;

          margin-top:5px;
        }

        .sl-position-row {
          display:flex;

          gap:6px;

          flex-wrap:wrap;

          margin-top:9px;
        }

        .sl-position {
          background:#111c30;

          border:
            1px solid
            #18253a;

          border-radius:7px;

          padding:5px 7px;

          font-size:8px;
        }

        .sl-position b {
          color:#f8fafc;
        }

        .sl-position span {
          margin-left:5px;
        }

        .sl-sector-chart {
          display:flex;

          flex-direction:column;

          gap:8px;
        }

        .sl-sector-row {
          display:grid;

          grid-template-columns:
            82px 1fr 38px;

          align-items:center;

          gap:9px;
        }

        .sl-sector-name b {
          display:block;

          font-size:9px;
        }

        .sl-sector-name span {
          display:block;

          color:#475569;

          font-size:7px;

          margin-top:2px;
        }

        .sl-sector-value {
          text-align:right;

          font-size:10px;

          font-weight:900;
        }

        .sl-sector-bar {
          height:100%;

          border-radius:99px;
        }

        .sl-setups {
          margin-bottom:14px;
        }

        .sl-setup-list {
          display:flex;

          flex-direction:column;

          gap:6px;
        }

        .sl-setup-row {
          display:grid;

          grid-template-columns:
            32px
            minmax(130px,1fr)
            45px
            75px
            minmax(150px,.8fr);

          gap:10px;

          align-items:center;

          padding:10px 11px;

          border:
            1px solid
            #17243a;

          border-radius:10px;

          background:
            linear-gradient(
              90deg,
              #0b1423,
              #0c1627
            );

          transition:.15s;
        }

        .sl-setup-row:hover {
          border-color:#2b4668;

          transform:
            translateY(-1px);
        }

        .sl-rank {
          color:#475569;

          font-size:9px;

          font-weight:900;
        }

        .sl-setup-name {
          display:flex;

          gap:7px;

          align-items:baseline;

          margin-bottom:6px;
        }

        .sl-setup-name b {
          font-size:11px;
        }

        .sl-setup-name span {
          color:#64748b;

          font-size:7px;
        }

        .sl-score-fill {
          height:100%;

          border-radius:99px;
        }

        .sl-score-number {
          font-size:15px;

          font-weight:900;
        }

        .sl-price {
          text-align:right;
        }

        .sl-price b {
          display:block;

          font-size:10px;
        }

        .sl-price span {
          display:block;

          font-size:8px;

          margin-top:2px;
        }

        .sl-tags {
          display:flex;

          justify-content:flex-end;

          gap:4px;

          flex-wrap:wrap;
        }

        .sl-tag {
          padding:3px 5px;

          border-radius:5px;

          font-size:7px;

          font-weight:800;

          border:
            1px solid
            transparent;
        }

        .sl-tag.green {
          color:#22c55e;

          background:#22c55e12;

          border-color:#22c55e25;
        }

        .sl-tag.red {
          color:#ef4444;

          background:#ef444412;

          border-color:#ef444425;
        }

        .sl-tag.amber {
          color:#f59e0b;

          background:#f59e0b12;

          border-color:#f59e0b25;
        }

        .sl-agent-list {
          display:grid;

          grid-template-columns:
            repeat(3,1fr);

          gap:7px;
        }

        .sl-agent {
          padding:10px;

          background:#0a1322;

          border:
            1px solid
            #18253a;

          border-radius:9px;

          display:flex;

          justify-content:space-between;

          align-items:center;
        }

        .sl-agent b {
          font-size:9px;
        }

        .sl-agent span {
          font-size:8px;

          color:#64748b;
        }

        .sl-empty {
          text-align:center;

          padding:20px;

          color:#475569;

          font-size:10px;
        }

        @media (max-width: 850px) {

          .sl-hero,
          .sl-grid-2 {
            grid-template-columns:1fr;
          }

          .sl-setup-row {
            grid-template-columns:
              26px 1fr 40px;
          }

          .sl-price {
            text-align:right;
          }

          .sl-tags {
            grid-column:2 / -1;

            justify-content:flex-start;
          }
        }

        @media (max-width: 520px) {

          .sl-dashboard {
            padding-left:2px;
            padding-right:2px;
          }

          .sl-hero-main {
            padding:15px;

            min-height:0;
          }

          .sl-hero-grid {
            margin-top:18px;

            grid-template-columns:
              1fr 1fr;
          }

          .sl-hero-grid
          .sl-hero-metric:last-child {
            grid-column:
              1 / -1;
          }

          .sl-hero-side,
          .sl-panel-pad {
            padding:13px;
          }

          .sl-account {
            grid-template-columns:
              1fr 1fr;
          }

          .sl-setup-row {
            grid-template-columns:
              25px 1fr 42px;

            padding:9px;
          }

          .sl-setup-row
          .sl-price {
            display:none;
          }

          .sl-tags {
            grid-column:
              2 / -1;
          }

          .sl-agent-list {
            grid-template-columns:1fr;
          }

          .sl-sector-row {
            grid-template-columns:
              68px 1fr 32px;
          }
        }

      `}</style>

      {/* =====================================================
          HERO / COMMAND CENTER
      ===================================================== */}

      <div className="sl-hero">

        <Card className="sl-hero-main">

          <div className="sl-brand">

            <LogoMark />

            <div>

              <div className="sl-brand-name">

                SwingLab

                <span className="sl-live">
                  <i />
                  LIVE
                </span>

              </div>

              <div className="sl-brand-sub">
                MARKET INTELLIGENCE COMMAND CENTER
              </div>

            </div>

          </div>

          <div className="sl-hero-grid">

            <div className="sl-hero-metric">

              <div className="sl-hero-label">
                Market regime
              </div>

              <div
                className="sl-hero-value"
                style={{
                  color: regimeColor,
                }}
              >
                {market.regime || '—'}
              </div>

              <div className="sl-hero-note">
                Agent consensus
              </div>

            </div>

            <div className="sl-hero-metric">

              <div className="sl-hero-label">
                Volatility
              </div>

              <div
                className="sl-hero-value"
                style={{
                  color:
                    market.volatility === 'EXTREME'
                      ? C.red
                      : market.volatility === 'HIGH'
                      ? C.amber
                      : C.green,
                }}
              >
                {market.volatility || '—'}
              </div>

              <div className="sl-hero-note">
                Risk environment
              </div>

            </div>

            <div className="sl-hero-metric">

              <div className="sl-hero-label">
                Pipeline
              </div>

              <div
                className="sl-hero-value"
                style={{
                  color: C.green,
                }}
              >
                ●
              </div>

              <div className="sl-hero-note">
                {lastRun}
              </div>

            </div>

          </div>

        </Card>

        <Card className="sl-hero-side">

          <div>

            <div className="sl-side-title">
              Risk & Exposure
            </div>

            <div className="sl-side-sub">
              Current agent controls
            </div>

          </div>

          <div className="sl-gauges">

            <Gauge
              value={confidence}
              color={C.blue}
              label="Confidence"
            />

            <Gauge
              value={exposure}
              color={
                exposure > 70
                  ? C.amber
                  : C.green
              }
              label="Exposure"
            />

          </div>

        </Card>

      </div>

      {/* =====================================================
          PORTFOLIO + MARKET PULSE
      ===================================================== */}

      <div className="sl-grid-2">

        <Card
          className="sl-panel-pad clickable"
          onClick={onGoToAlpaca}
        >

          <SectionTitle
            eyebrow="ACCOUNT"
            title="Portfolio"
            right={
              <span className="sl-section-note">
                Open Alpaca →
              </span>
            }
          />

          {alpacaData ? (
            <>

              <div className="sl-account">

                {[
                  [
                    'Equity',
                    `${
                      alpacaData.equity?.toLocaleString()
                      ?? '—'
                    }`,
                  ],

                  [
                    'Cash',
                    `${
                      alpacaData.cash?.toLocaleString()
                      ?? '—'
                    }`,
                  ],

                  [
                    'Daily P&L',
                    `${
                      alpacaData.daily_pnl >= 0
                        ? '+'
                        : ''
                    }${
                      alpacaData.daily_pnl?.toLocaleString()
                      ?? '—'
                    }`,
                  ],

                  [
                    'Positions',
                    alpacaData.positions?.length || 0,
                  ],
                ].map(
                  ([label, value]) => (

                    <div
                      className="sl-account-box"
                      key={label}
                    >

                      <span>
                        {label}
                      </span>

                      <b
                        style={
                          label === 'Daily P&L'
                            ? {
                                color:
                                  alpacaData.daily_pnl >= 0
                                    ? C.green
                                    : C.red,
                              }
                            : {}
                        }
                      >
                        {value}
                      </b>

                    </div>

                  )
                )}

              </div>

              {alpacaData.positions?.length > 0 && (

                <div className="sl-position-row">

                  {alpacaData.positions
                    .slice(0, 6)
                    .map(p => (

                      <div
                        className="sl-position"
                        key={p.symbol}
                      >

                        <b>
                          {p.symbol}
                        </b>

                        <span
                          className={
                            p.pnl_pct >= 0
                              ? 'sl-up'
                              : 'sl-down'
                          }
                        >
                          {p.pnl_pct >= 0
                            ? '+'
                            : ''}

                          {p.pnl_pct?.toFixed(2)}%
                        </span>

                      </div>

                    ))}

                </div>

              )}

            </>
          ) : (

            <div className="sl-empty">
              Connecting to Alpaca…
            </div>

          )}

        </Card>

        <Card className="sl-panel-pad">

          <SectionTitle
            eyebrow="LIVE TAPE"
            title="Market Pulse"
            right={
              <span className="sl-section-note">
                change %
              </span>
            }
          />

          {marketEntries.length ? (

            <PulseBars
              entries={marketEntries}
            />

          ) : (

            <div className="sl-empty">
              No market data.
            </div>

          )}

        </Card>

      </div>

      {/* =====================================================
          SECTOR ROTATION
      ===================================================== */}

      {sectors?.length > 0 && (

        <Card
          className="sl-panel-pad"
          style={{
            marginBottom: 14,
          }}
        >

          <SectionTitle
            eyebrow="ROTATION ENGINE"
            title="Sector Momentum Radar"
            right={
              <span className="sl-section-note">
                ranked by acceleration
              </span>
            }
          />

          <SectorChart
            sectors={sectors}
            onGoToSector={onGoToSector}
          />

        </Card>

      )}

      {/* =====================================================
          TOP SETUPS
      ===================================================== */}

      <div className="sl-setups">

        <SectionTitle
          eyebrow="SIGNAL ENGINE"
          title="Top Setups"
          right={
            <span className="sl-section-note">
              {topSetups.length} candidates · click to inspect
            </span>
          }
        />

        <div className="sl-setup-list">

          {topSetups
            .slice(0, 12)
            .map((asset, i) => (

              <SetupRow
                key={asset.ticker}
                asset={asset}
                index={i}
                livePrices={livePrices}
                mlPredictions={mlPredictions}
                trendPredictions={trendPredictions}
                onLoadFullStock={
                  onLoadFullStock
                }
              />

            ))}

        </div>

        {!topSetups.length && (

          <div className="sl-empty">
            No setups available.
          </div>

        )}

      </div>

      {/* =====================================================
          AGENTS
      ===================================================== */}

      <Card
        className="sl-panel-pad"
        onClick={onGoToAgents}
      >

        <SectionTitle
          eyebrow="AUTOMATION"
          title="Agent Activity"
          right={
            <span className="sl-section-note">
              Open Agents →
            </span>
          }
        />

        {actions.length ? (

          <div className="sl-agent-list">

            {actions
              .slice(0, 6)
              .map((a, i) => (

                <div
                  className="sl-agent"
                  key={i}
                >

                  <div>

                    <b
                      style={{
                        color:
                          a.action === 'BUY'
                            ? C.green
                            : a.action === 'SELL'
                            ? C.red
                            : '#94a3b8',
                      }}
                    >
                      {a.action}
                    </b>

                    <span
                      style={{
                        marginLeft: 6,
                      }}
                    >
                      {a.ticker}
                    </span>

                  </div>

                  {a.shares && (
                    <span>
                      {a.shares} shares
                    </span>
                  )}

                </div>

              ))}

          </div>

        ) : (

          <div className="sl-empty">
            No recent agent actions.
          </div>

        )}

      </Card>

    </div>
  );
}
