import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { API_URL } from '../utils/constants';
import { getScoreColor } from '../utils/helpers';

const COLORS = {
  XLK: '#3b82f6',
  XLF: '#f59e0b',
  XLV: '#22c55e',
  XLI: '#a855f7',
  XLY: '#ec4899',
  XLP: '#94a3b8',
  XLE: '#f97316',
  XLU: '#14b8a6',
  XLB: '#eab308',
  XLRE: '#8b5cf6',
  XLC: '#ef4444',
};

const PERIODS = [
  { label: '1M', days: 21 },
  { label: '3M', days: 63 },
  { label: '6M', days: 126 },
  { label: '1Y', days: 252 },
  { label: '3Y', days: 750 },
];

const SESSION_LABEL = {
  REGULAR: 'Sessione regolare',
  PREMARKET: 'Premarket',
  AFTERHOURS: 'After hours',
  OVERNIGHT: 'Mercato chiuso',
  WEEKEND: 'Weekend',
  UNKNOWN: 'Sessione non determinata',
};

const QUALITY = {
  FULL: {
    color: '#22c55e',
    label: 'Dati completi',
    note: 'Tutti i settori stanno scambiando: il punto di oggi e affidabile.',
  },
  PARTIAL: {
    color: '#f59e0b',
    label: 'Dati parziali',
    note: 'Solo una parte dei settori sta scambiando. I mancanti restano fermi all ultima chiusura.',
  },
  CLOSED_BARS_ONLY: {
    color: '#64748b',
    label: 'Solo barre chiuse',
    note: 'Nessuno scambio registrato oggi: il grafico mostra la storia consolidata.',
  },
};

const smallButtonStyle = {
  background: '#1e293b',
  color: '#cbd5e1',
  border: '1px solid #334155',
  borderRadius: 7,
  padding: '5px 8px',
  fontSize: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

export default function Sectors({ sectors, setSelectedSector, setView }) {
  const [period, setPeriod] = useState(63);
  const [relativeData, setRelativeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [focusCode, setFocusCode] = useState(null);
  const [showToday, setShowToday] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRelativeStrength = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_URL}/api/sectors/relative-strength?days=${period}&include_today=true`,
        );
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Errore caricamento forza relativa');
        }

        if (!active) return;

        setRelativeData(data);

        const available = (data.series || []).map((item) => item.code);
        setSelectedCodes((current) => {
          const preserved = current.filter((code) => available.includes(code));
          return preserved.length ? preserved : available;
        });
        setFocusCode((current) => current || data.ranking?.[0]?.code || null);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRelativeStrength();

    // L'analisi e sempre attiva: il punto di oggi cambia mentre il mercato
    // scambia, quindi si rinfresca a intervalli regolari.
    const timer = setInterval(loadRelativeStrength, 120000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [period]);

  const projectionOn = Boolean(relativeData?.projection_available) && showToday;
  const spyToday = relativeData?.spy_intraday_move_pct;
  const quality = QUALITY[relativeData?.data_quality] || QUALITY.CLOSED_BARS_ONLY;
  const sessionLabel = SESSION_LABEL[relativeData?.session] || SESSION_LABEL.UNKNOWN;
  const noTrade = relativeData?.sectors_no_trade || [];

  // Il punto di oggi viene disegnato su una serie separata, in tratteggio,
  // agganciata all'ultima chiusura. Cosi resta chiaro che e provvisorio.
  const chartData = useMemo(() => {
    const rows = {};

    for (const sector of relativeData?.series || []) {
      const points = sector.points || [];

      points.forEach((point, index) => {
        if (!rows[point.date]) rows[point.date] = { date: point.date };

        if (point.projected) {
          if (!projectionOn) return;
          rows[point.date][`${sector.code}__today`] = point.value;
        } else {
          rows[point.date][sector.code] = point.value;

          const isLastClose = index === points.length - 1
            || (points[index + 1] && points[index + 1].projected);

          if (isLastClose && projectionOn) {
            rows[point.date][`${sector.code}__today`] = point.value;
          }
        }
      });
    }

    return Object.values(rows).sort((a, b) => a.date.localeCompare(b.date));
  }, [relativeData, projectionOn]);

  const visibleSeries = useMemo(
    () => (relativeData?.series || []).filter((item) => selectedCodes.includes(item.code)),
    [relativeData, selectedCodes],
  );

  const ranking = relativeData?.ranking || [];
  const focusedStocks = relativeData?.best_stocks?.[focusCode] || [];
  const projectedLeaders = relativeData?.projected_leaders || [];

  const toggleCode = (code) => {
    setSelectedCodes((current) => (
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    ));
    setFocusCode(code);
  };

  const showTopThree = () => {
    const top = ranking.slice(0, 3).map((item) => item.code);
    setSelectedCodes(top);
    setFocusCode(top[0] || null);
  };

  const showBottomThree = () => {
    const bottom = ranking.slice(-3).map((item) => item.code);
    setSelectedCodes(bottom);
    setFocusCode(bottom[0] || null);
  };

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const isToday = label === relativeData?.today;

    const seen = new Set();
    const rows = [];

    for (const entry of payload) {
      if (entry.value == null) continue;

      const name = entry.name.replace('__today', '');
      if (seen.has(name)) continue;

      seen.add(name);
      rows.push({ name, value: entry.value, color: entry.color });
    }

    return (
      <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 11 }}>
        <div style={{ color: isToday ? '#fbbf24' : '#cbd5e1', fontWeight: 700, marginBottom: 6 }}>
          {label}{isToday ? ' · in corso' : ''}
        </div>
        {rows.map((row) => (
          <div key={row.name} style={{ color: row.color, display: 'flex', justifyContent: 'space-between', gap: 14 }}>
            <span>{row.name}</span>
            <span>{Number(row.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: 14 }}>Sector Intelligence</h3>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16 }}>Forza relativa settori vs SPY</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>
              Rapporto ETF/SPY indicizzato a 100. Sopra 100 significa sovraperformance nel periodo selezionato.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PERIODS.map((item) => (
              <button
                key={item.days}
                onClick={() => setPeriod(item.days)}
                style={{
                  background: period === item.days ? '#2563eb' : '#1e293b',
                  color: period === item.days ? '#fff' : '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: 7,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {relativeData && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              padding: '10px 12px',
              borderRadius: 9,
              background: `${quality.color}0f`,
              border: `1px solid ${quality.color}38`,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: '#e2e8f0', minWidth: 0 }}>
              <span style={{ color: quality.color, fontWeight: 800 }}>{sessionLabel}</span>
              <span style={{ color: '#64748b' }}> · {quality.label}</span>

              {relativeData.sectors_total > 0 && (
                <span style={{ color: '#64748b' }}>
                  {' '}· {relativeData.sectors_traded_today}/{relativeData.sectors_total} settori attivi
                </span>
              )}

              {spyToday != null && (
                <span style={{ color: spyToday >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                  {' '}· SPY {spyToday >= 0 ? '+' : ''}{Number(spyToday).toFixed(2)}%
                </span>
              )}

              <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>
                {quality.note}
              </div>

              {projectedLeaders.length > 0 && (
                <div style={{ color: '#fcd34d', fontSize: 10, marginTop: 3 }}>
                  Oggi guidano: {projectedLeaders.join(', ')}
                </div>
              )}

              {noTrade.length > 0 && (
                <div style={{ color: '#64748b', fontSize: 10, marginTop: 3 }}>
                  Senza scambi oggi: {noTrade.join(', ')}
                </div>
              )}
            </div>

            {relativeData.projection_available && (
              <button
                onClick={() => setShowToday(!showToday)}
                style={{
                  ...smallButtonStyle,
                  background: showToday ? '#78350f' : '#1e293b',
                  color: showToday ? '#fcd34d' : '#94a3b8',
                  border: `1px solid ${showToday ? '#b45309' : '#334155'}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {showToday ? 'Nascondi oggi' : 'Mostra oggi'}
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
          <button onClick={() => setSelectedCodes((relativeData?.series || []).map((item) => item.code))} style={smallButtonStyle}>Tutti</button>
          <button onClick={() => setSelectedCodes([])} style={smallButtonStyle}>Nessuno</button>
          <button onClick={showTopThree} style={smallButtonStyle}>Top 3</button>
          <button onClick={showBottomThree} style={smallButtonStyle}>Bottom 3</button>

          {ranking.map((item) => {
            const selected = selectedCodes.includes(item.code);
            const move = item.intraday_move_pct;

            return (
              <button
                key={item.code}
                onClick={() => toggleCode(item.code)}
                style={{
                  background: selected ? `${COLORS[item.code]}22` : '#111827',
                  color: selected ? COLORS[item.code] : '#64748b',
                  border: `1px solid ${selected ? COLORS[item.code] : '#1e293b'}`,
                  borderRadius: 7,
                  padding: '5px 8px',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                  opacity: item.traded_today === false && projectionOn ? 0.6 : 1,
                }}
              >
                {item.code} {item.relative_return_pct >= 0 ? '+' : ''}{item.relative_return_pct.toFixed(1)}%
                {projectionOn && move != null && (
                  <span style={{ color: move >= 0 ? '#34d399' : '#f87171', marginLeft: 5, fontSize: 9 }}>
                    oggi {move >= 0 ? '+' : ''}{move.toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && <div style={{ color: '#94a3b8', fontSize: 12, padding: 20 }}>Caricamento grafico...</div>}
        {error && <div style={{ color: '#f87171', fontSize: 12, padding: 20 }}>{error}</div>}

        {!loading && !error && chartData.length > 1 && (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 10, right: 22, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(0)} />
              <Tooltip content={renderTooltip} />
              <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="5 5" />

              {projectionOn && relativeData?.last_close_date && (
                <ReferenceLine
                  x={relativeData.last_close_date}
                  stroke="#fbbf24"
                  strokeDasharray="2 4"
                  strokeOpacity={0.5}
                />
              )}

              {visibleSeries.map((item) => (
                <Line
                  key={item.code}
                  type="monotone"
                  dataKey={item.code}
                  name={item.code}
                  stroke={COLORS[item.code]}
                  strokeWidth={focusCode === item.code ? 3 : 1.7}
                  dot={false}
                  connectNulls
                  onClick={() => setFocusCode(item.code)}
                />
              ))}

              {projectionOn && visibleSeries.filter((item) => item.has_projection).map((item) => (
                <Line
                  key={`${item.code}__today`}
                  type="linear"
                  dataKey={`${item.code}__today`}
                  name={item.code}
                  stroke={COLORS[item.code]}
                  strokeWidth={focusCode === item.code ? 2.6 : 1.5}
                  strokeDasharray="4 3"
                  dot={{ r: 3, fill: '#0f172a', stroke: COLORS[item.code], strokeWidth: 2 }}
                  connectNulls
                  legendType="none"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        <div style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>
          Barre chiuse: {relativeData?.executed_days || 0} sedute, dal {relativeData?.start_date || 'N/D'} al {relativeData?.last_close_date || 'N/D'}.
          {projectionOn && <span style={{ color: '#fbbf24' }}> Tratteggio: seduta del {relativeData?.today} ancora in corso.</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(280px, 0.8fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: 12, color: '#f8fafc', fontWeight: 800 }}>
            Ranking settori
            <span style={{ color: '#64748b', fontSize: 10, fontWeight: 400, marginLeft: 8 }}>
              ordinato su barre chiuse
            </span>
          </div>

          {ranking.map((item) => (
            <div
              key={item.code}
              onClick={() => {
                setFocusCode(item.code);
                if (!selectedCodes.includes(item.code)) setSelectedCodes((current) => [...current, item.code]);
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 58px 1fr 84px 76px 72px',
                gap: 8,
                alignItems: 'center',
                padding: '9px 12px',
                borderTop: '1px solid #1e293b',
                background: focusCode === item.code ? '#172554' : 'transparent',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              <span style={{ color: '#64748b' }}>#{item.rank}</span>
              <span style={{ color: COLORS[item.code], fontWeight: 800 }}>{item.code}</span>
              <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>

              <span style={{ color: item.relative_return_pct >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {item.relative_return_pct >= 0 ? '+' : ''}{item.relative_return_pct.toFixed(2)}%
              </span>

              <span style={{ color: item.acceleration_20d >= 0 ? '#34d399' : '#f87171', fontSize: 10 }}>
                Acc {item.acceleration_20d >= 0 ? '+' : ''}{item.acceleration_20d.toFixed(2)}
              </span>

              <span style={{ fontSize: 10, color: '#64748b' }}>
                {item.intraday_move_pct != null ? (
                  <span style={{ color: item.intraday_move_pct >= 0 ? '#fbbf24' : '#f87171' }}>
                    oggi {item.intraday_move_pct >= 0 ? '+' : ''}{item.intraday_move_pct.toFixed(1)}%
                  </span>
                ) : item.traded_today === false ? (
                  <span style={{ color: '#475569' }}>fermo</span>
                ) : '—'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: 12, color: '#f8fafc', fontWeight: 800 }}>Best stock in {focusCode || 'settore'}</div>

          {focusedStocks.length === 0 && <div style={{ padding: 14, color: '#64748b', fontSize: 11 }}>Nessun asset disponibile.</div>}

          {focusedStocks.map((stock) => {
            const approved = stock.status === 'CANDIDATE' && stock.alpha_confluence >= stock.threshold;
            const missingSnapshot = stock.status === 'NO_ALPHA_SNAPSHOT';

            return (
              <div key={stock.ticker} style={{ padding: '10px 12px', borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#f8fafc', fontWeight: 800 }}>{stock.ticker}</span>
                  <span
                    style={{
                      color: approved ? '#34d399' : missingSnapshot ? '#94a3b8' : '#fbbf24',
                      background: approved ? '#052e16' : missingSnapshot ? '#1e293b' : '#451a03',
                      borderRadius: 6,
                      padding: '3px 7px',
                      fontSize: 9,
                      fontWeight: 800,
                    }}
                  >
                    {approved ? 'CANDIDATO' : missingSnapshot ? 'ATTESA SCAN' : 'SOTTO SOGLIA'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 7 }}>
                  <div style={{ color: '#64748b', fontSize: 9 }}>
                    Setup
                    <div style={{ color: '#cbd5e1', fontWeight: 700 }}>{Number(stock.score || 0).toFixed(1)}</div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 9 }}>
                    Pre-settore
                    <div style={{ color: '#cbd5e1', fontWeight: 700 }}>{Number(stock.confluence_before_sector || 0).toFixed(1)}</div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 9 }}>
                    Finale
                    <div style={{ color: approved ? '#34d399' : '#fbbf24', fontWeight: 800 }}>{Number(stock.alpha_confluence || 0).toFixed(1)}</div>
                  </div>
                </div>

                <div style={{ color: stock.sector_adjustment >= 0 ? '#34d399' : '#f87171', fontSize: 10, marginTop: 5 }}>
                  Settore #{stock.sector_rank || '-'} | Adj {stock.sector_adjustment >= 0 ? '+' : ''}{Number(stock.sector_adjustment || 0).toFixed(1)} | {stock.sector_reason}
                </div>

                <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 3 }}>
                  {stock.setup_type} | RSI {stock.rsi} | Weekly {stock.weekly_trend} | R/R {Number(stock.risk_reward || 0).toFixed(2)}{stock.poc_shift ? ' | POC Shift' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {[...sectors]
          .sort((a, b) => b.composite_score - a.composite_score)
          .map((sector) => (
            <div
              key={sector.code}
              onClick={() => {
                setSelectedSector(sector.code);
                setView('stocks');
              }}
              style={{ background: '#0f172a', borderRadius: 10, padding: 14, cursor: 'pointer', border: '1px solid #1e293b' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{sector.code}</span>
                <span style={{ color: getScoreColor(sector.composite_score), fontWeight: 700 }}>{sector.composite_score?.toFixed(1)}</span>
              </div>

              <div style={{ color: '#64748b', fontSize: 12 }}>{sector.name}</div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                ${sector.price} | RSI {sector.rsi} | Str {sector.strength_score >= 0 ? '+' : ''}{sector.strength_score?.toFixed(1)}
              </div>

              <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>
                {sector.updated_at
                  ? new Date(sector.updated_at.endsWith('Z') ? sector.updated_at : `${sector.updated_at}Z`).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Rome',
                  })
                  : 'N/D'}
              </div>

              {sector.history && (
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={sector.history.slice(-30)}>
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={sector.composite_score >= 50 ? '#22c55e' : '#ef4444'}
                      fill={sector.composite_score >= 50 ? '#22c55e' : '#ef4444'}
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
