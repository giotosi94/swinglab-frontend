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

export default function Sectors({ sectors, setSelectedSector, setView }) {
  const [period, setPeriod] = useState(63);
  const [relativeData, setRelativeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [focusCode, setFocusCode] = useState(null);

  useEffect(() => {
    let active = true;

    const loadRelativeStrength = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/api/sectors/relative-strength?days=${period}`);
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
    return () => {
      active = false;
    };
  }, [period]);

  const chartData = useMemo(() => {
    const rows = {};
    for (const sector of relativeData?.series || []) {
      for (const point of sector.points || []) {
        if (!rows[point.date]) rows[point.date] = { date: point.date };
        rows[point.date][sector.code] = point.value;
      }
    }
    return Object.values(rows).sort((a, b) => a.date.localeCompare(b.date));
  }, [relativeData]);

  const visibleSeries = useMemo(
    () => (relativeData?.series || []).filter((item) => selectedCodes.includes(item.code)),
    [relativeData, selectedCodes],
  );

  const ranking = relativeData?.ranking || [];
  const focusedStocks = relativeData?.best_stocks?.[focusCode] || [];

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

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
          <button onClick={() => setSelectedCodes((relativeData?.series || []).map((item) => item.code))} style={smallButtonStyle}>Tutti</button>
          <button onClick={() => setSelectedCodes([])} style={smallButtonStyle}>Nessuno</button>
          <button onClick={showTopThree} style={smallButtonStyle}>Top 3</button>
          <button onClick={showBottomThree} style={smallButtonStyle}>Bottom 3</button>
          {ranking.map((item) => (
            <button
              key={item.code}
              onClick={() => toggleCode(item.code)}
              style={{
                background: selectedCodes.includes(item.code) ? `${COLORS[item.code]}22` : '#111827',
                color: selectedCodes.includes(item.code) ? COLORS[item.code] : '#64748b',
                border: `1px solid ${selectedCodes.includes(item.code) ? COLORS[item.code] : '#1e293b'}`,
                borderRadius: 7,
                padding: '5px 8px',
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {item.code} {item.relative_return_pct >= 0 ? '+' : ''}{item.relative_return_pct.toFixed(1)}%
            </button>
          ))}
        </div>

        {loading && <div style={{ color: '#94a3b8', fontSize: 12, padding: 20 }}>Caricamento grafico...</div>}
        {error && <div style={{ color: '#f87171', fontSize: 12, padding: 20 }}>{error}</div>}

        {!loading && !error && chartData.length > 1 && (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 10, right: 22, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(0)} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(value, name) => [`${Number(value).toFixed(2)}`, name]}
              />
              <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="5 5" />
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
            </LineChart>
          </ResponsiveContainer>
        )}

        <div style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>
          Periodo realmente eseguito: {relativeData?.executed_days || 0} sedute, dal {relativeData?.start_date || 'N/D'} al {relativeData?.end_date || 'N/D'}.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(280px, 0.8fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: 12, color: '#f8fafc', fontWeight: 800 }}>Ranking settori</div>
          {ranking.map((item) => (
            <div
              key={item.code}
              onClick={() => {
                setFocusCode(item.code);
                if (!selectedCodes.includes(item.code)) setSelectedCodes((current) => [...current, item.code]);
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 64px 1fr 88px 88px',
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
              <span style={{ color: '#cbd5e1' }}>{item.name}</span>
              <span style={{ color: item.relative_return_pct >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {item.relative_return_pct >= 0 ? '+' : ''}{item.relative_return_pct.toFixed(2)}%
              </span>
              <span style={{ color: item.acceleration_20d >= 0 ? '#34d399' : '#f87171' }}>
                Acc {item.acceleration_20d >= 0 ? '+' : ''}{item.acceleration_20d.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: 12, color: '#f8fafc', fontWeight: 800 }}>Best stock in {focusCode || 'settore'}</div>
          {focusedStocks.length === 0 && <div style={{ padding: 14, color: '#64748b', fontSize: 11 }}>Nessun asset disponibile.</div>}
          {focusedStocks.map((stock) => (
            <div key={stock.ticker} style={{ padding: '9px 12px', borderTop: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: '#f8fafc', fontWeight: 800 }}>{stock.ticker}</span>
                <span style={{ color: stock.score >= 48 ? '#34d399' : '#fbbf24', fontWeight: 800 }}>{stock.score}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 3 }}>
                {stock.setup_type} | RSI {stock.rsi} | Weekly {stock.weekly_trend}{stock.poc_shift ? ' | POC Shift' : ''}
              </div>
            </div>
          ))}
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
