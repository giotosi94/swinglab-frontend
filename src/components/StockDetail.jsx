import React, { useEffect, useState } from 'react';
import { getScoreColor } from '../utils/helpers';
import { fetchNews } from '../utils/api';
import TradingViewChart from './TradingViewChart';

const money = (value) => value == null ? 'N/D' : `$${Number(value).toFixed(2)}`;
const value = (input, fallback = 'N/D') => input == null ? fallback : input;

function Pill({ children, color = '#94a3b8' }) {
  return <span style={{ background: `${color}18`, color, border: `1px solid ${color}45`, borderRadius: 6, padding: '3px 7px', fontSize: 10, fontWeight: 700 }}>{children}</span>;
}

function Metric({ label, children, color = 'white' }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
      <div style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 14, marginTop: 4 }}>{children}</div>
    </div>
  );
}

function Section({ title, children, accent = '#334155' }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export default function StockDetail({ stock, onBack, onBuy, livePrice, mlScore, trendData }) {
  const [buyQty, setBuyQty] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);
  const [newsData, setNewsData] = useState(null);
  const [technicalOpen, setTechnicalOpen] = useState(false);

  useEffect(() => {
    if (!stock?.ticker) return;
    fetchNews(stock.ticker).then((data) => {
      if (data?.news) setNewsData(data);
    }).catch(() => {});
  }, [stock?.ticker]);

  const max = stock.max_strategy || {};
  const plan = max.entry_plan || {};
  const phaseLabel = typeof max.market_phase === 'string' ? max.market_phase : (max.market_phase?.phase || max.market_phase?.state || 'N/D');
  const weekly = max.weekly_context || {};
  const daily = max.daily_confirmation || {};
  const execution = max.execution_4h || {};
  const currentPrice = livePrice?.price ?? stock.price;
  const change = livePrice?.change_pct ?? stock.change_pct ?? 0;
  const planColor = plan.status === 'ARMED' ? '#3b82f6' : plan.status === 'TRIGGERED' ? '#f97316' : plan.status === 'WAIT_RETEST' ? '#eab308' : plan.status === 'BLOCKED' ? '#ef4444' : '#64748b';

  const handleBuy = async () => {
    if (!onBuy || buyQty < 1) return;
    setBuyLoading(true);
    try {
      await onBuy(stock.ticker, buyQty);
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', marginBottom: 12 }}>← Torna alle stock</button>

      <div style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{stock.ticker}</h2>
              <Pill>{stock.sector_code || 'N/D'}</Pill>
              <Pill color={stock.data_status === 'FRESH' ? '#22c55e' : '#ef4444'}>{stock.data_status || 'N/D'}</Pill>
              <Pill color="#8b5cf6">Max live OFF</Pill>
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 5 }}>{stock.name || 'Analisi multi-timeframe Weekly · Daily · 4H'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{money(currentPrice)}</div>
            <div style={{ color: change >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{change >= 0 ? '+' : ''}{Number(change).toFixed(2)}%</div>
          </div>
          {onBuy && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" value={buyQty} min={1} onChange={(event) => setBuyQty(Math.max(1, parseInt(event.target.value, 10) || 1))} style={{ width: 62, background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: 7, padding: 8 }} />
              <button onClick={handleBuy} disabled={buyLoading} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 7, padding: '9px 14px', fontWeight: 800, cursor: 'pointer' }}>{buyLoading ? 'Attendi' : `BUY ${stock.ticker}`}</button>
            </div>
          )}
        </div>
      </div>

      <Section title="Max Strategy v1.5.2" accent="#8b5cf6">
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
          <Pill color={planColor}>{plan.status || 'N/D'}</Pill>
          <Pill color="#8b5cf6">Fase titolo: {phaseLabel}</Pill>
          <Pill color="#06b6d4">{plan.execution_mode || 'N/D'}</Pill>
          <Pill color={max.strategy_eligible ? '#22c55e' : '#64748b'}>{max.strategy_eligible ? 'Strategy eligible' : 'Non eligible'}</Pill>
          <Pill color={max.trade_ready ? '#22c55e' : '#eab308'}>{max.trade_ready ? 'Trade ready' : 'In attesa'}</Pill>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 8 }}>
          <Metric label="Max score" color="#8b5cf6">{value(max.max_score)}</Metric>
          <Metric label="Trigger">{money(plan.trigger_price)}</Metric>
          <Metric label="Maximum entry">{money(plan.maximum_entry_price)}</Metric>
          <Metric label="Invalidazione" color="#ef4444">{money(plan.invalidation_price)}</Metric>
          <Metric label="Weekly">{weekly.structural_state || weekly.state || 'N/D'}</Metric>
          <Metric label="Daily">{daily.confirmed ? 'CONFERMATO' : daily.state || 'ATTESA'}</Metric>
          <Metric label="4H">{execution.available === false ? 'FALLBACK DAILY' : execution.state || plan.execution_mode || 'N/D'}</Metric>
          <Metric label="Ordine teorico">{plan.order_action || 'WAIT'}</Metric>
        </div>
        {(max.rejection_reasons || []).length > 0 && <div style={{ color: '#fca5a5', fontSize: 10, marginTop: 10 }}>Gate: {max.rejection_reasons.join(' · ')}</div>}
      </Section>

      <div style={{ marginBottom: 14 }}>
        <TradingViewChart ticker={stock.ticker} height={580} theme="dark" />
      </div>

      <Section title="Sintesi tecnica" accent="#3b82f6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
          <Metric label="Setup score" color={getScoreColor(stock.setup_score)}>{value(stock.setup_score)}</Metric>
          <Metric label="RSI">{stock.rsi?.toFixed(1) || 'N/D'}</Metric>
          <Metric label="POC">{money(stock.poc_price)}</Metric>
          <Metric label="Value Area High">{money(stock.value_area_high)}</Metric>
          <Metric label="Value Area Low">{money(stock.value_area_low)}</Metric>
          <Metric label="Relative Volume">{stock.relative_volume ? `${stock.relative_volume.toFixed(1)}x` : 'N/D'}</Metric>
          <Metric label="52w High">{money(stock.high_52w)}</Metric>
          <Metric label="52w Low">{money(stock.low_52w)}</Metric>
        </div>
      </Section>

      <Section title="Modelli e segnali" accent="#06b6d4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          <div style={{ background: '#111827', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#94a3b8', fontSize: 10 }}>ML WIN/LOSS</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 5 }}>{mlScore?.ml_score != null ? `${mlScore.ml_score}%` : 'N/D'}</div>
            <div style={{ color: '#64748b', fontSize: 10 }}>{mlScore?.prediction || 'Informativo, non veto Max'}</div>
          </div>
          <div style={{ background: '#111827', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#94a3b8', fontSize: 10 }}>TREND 5 GIORNI</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 5 }}>{trendData?.prediction || 'N/D'}</div>
            <div style={{ color: '#64748b', fontSize: 10 }}>Confidenza {trendData?.confidence ?? 'N/D'}%</div>
          </div>
          <div style={{ background: '#111827', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#94a3b8', fontSize: 10 }}>WYCKOFF / ACCUMULO</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 5 }}>{stock.wyckoff?.phase || 'N/D'}</div>
            <div style={{ color: '#64748b', fontSize: 10 }}>Accumulation score {stock.accumulation?.score ?? 'N/D'}</div>
          </div>
        </div>
      </Section>

      <Section title="Approfondimenti legacy" accent="#475569">
        <button onClick={() => setTechnicalOpen(!technicalOpen)} style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}>{technicalOpen ? 'Nascondi dettagli' : 'Mostra pattern, EMA e analisi AI'}</button>
        {technicalOpen && (
          <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 11, lineHeight: 1.65 }}>
            <div>EMA 10 / 20 / 50: {value(stock.ema10)} · {value(stock.ema20)} · {value(stock.ema50)}</div>
            <div>MACD: {value(stock.macd)} · Segnale: {value(stock.macd_signal)}</div>
            <div>Pattern: {(stock.candlestick_patterns || []).map((pattern) => pattern.name).join(', ') || 'Nessuno'}</div>
            {stock.llm_analysis && <div style={{ marginTop: 8, padding: 10, background: '#111827', borderRadius: 7 }}>{stock.llm_analysis}</div>}
          </div>
        )}
      </Section>

      {newsData?.news?.length > 0 && (
        <Section title={`News (${newsData.news_count || newsData.news.length})`} accent="#06b6d4">
          {newsData.sentiment && <div style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.55, marginBottom: 10 }}>{newsData.sentiment}</div>}
          {newsData.news.slice(0, 5).map((news, index) => (
            <button key={`${news.url}-${index}`} onClick={() => window.open(news.url, '_blank', 'noopener,noreferrer')} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#111827', color: '#60a5fa', border: 'none', borderRadius: 7, padding: 9, marginBottom: 6, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{news.headline}</div>
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>{news.source || ''}</div>
            </button>
          ))}
        </Section>
      )}
    </div>
  );
}
