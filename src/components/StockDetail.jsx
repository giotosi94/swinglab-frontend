import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { getScoreColor, getSmartAlert } from '../utils/helpers';

export default function StockDetail({ stock, onBack, onBuy, livePrice, mlScore, trendData }) {
  const alert = getSmartAlert(stock);
  const [buyQty, setBuyQty] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);

  const history = stock.price_history || [];

  // Prepare MACD data from history (approximate from EMAs if not in data)
  const chartData = history.map((d) => ({
    ...d,
    macd_hist:
      d.ema10 && d.ema20
        ? Math.round((d.ema10 - d.ema20) * 100) / 100
        : 0,
  }));

  const wyckoff = stock.wyckoff || {};
  const accumulation = stock.accumulation || {};
  const patterns = stock.candlestick_patterns || [];

  const getWyckoffColor = (phase) =>
    ({
      accumulation: '#22c55e',
      markup: '#3b82f6',
      distribution: '#f97316',
      markdown: '#ef4444',
      spring: '#8b5cf6',
    }[phase] || '#64748b');

  const getWyckoffEmoji = (phase) =>
    ({
      accumulation: '🟢',
      markup: '🚀',
      distribution: '🟠',
      markdown: '🔴',
      spring: '⚡',
    }[phase] || '⚪');

  const handleBuy = async () => {
    if (!onBuy || buyQty < 1) return;
    setBuyLoading(true);
    try {
      await onBuy(stock.ticker, buyQty);
    } catch {}
    setBuyLoading(false);
  };

  const metrics = [
    { l: 'Score', v: stock.setup_score, c: getScoreColor(stock.setup_score) },
    { l: 'RSI', v: stock.rsi?.toFixed(1) },
    { l: 'POC', v: stock.poc_price ? '$' + stock.poc_price.toFixed(2) : 'N/A' },
    { l: 'VA High', v: stock.value_area_high ? '$' + stock.value_area_high.toFixed(2) : 'N/A' },
    { l: 'VA Low', v: stock.value_area_low ? '$' + stock.value_area_low.toFixed(2) : 'N/A' },
    { l: 'Rel Vol', v: stock.relative_volume?.toFixed(1) + 'x' },
    { l: '52w High', v: stock.high_52w ? '$' + stock.high_52w : 'N/A' },
    { l: '52w Low', v: stock.low_52w ? '$' + stock.low_52w : 'N/A' },
  ];

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          cursor: 'pointer',
          marginBottom: 16,
          fontSize: 12,
        }}
      >
        {'\u2190'} Back
      </button>

      <div
        style={{
          background: '#0f172a',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #1e293b',
        }}
      >
        {/* ---- Header + Buy Button ---- */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{stock.ticker}</h2>
            <span style={{ color: '#64748b' }}>{stock.sector_code}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>${livePrice?.price || stock.price}</div>
            <div
              style={{
                color: stock.change_pct >= 0 ? '#22c55e' : '#ef4444',
              }}
            >
              {(livePrice?.change_pct ?? stock.change_pct) >= 0 ? '+' : ''}
              {(livePrice?.change_pct ?? stock.change_pct)?.toFixed(2)}%
            </div>
          </div>
          {/* Quick Buy */}
          {onBuy && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: '#1e293b',
                borderRadius: 8,
                padding: '8px 12px',
              }}
            >
              <input
                type="number"
                value={buyQty}
                min={1}
                onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: 60,
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: 'white',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              />
              <button
                onClick={handleBuy}
                disabled={buyLoading}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: buyLoading ? '#334155' : '#22c55e',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: buyLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {buyLoading ? '\u23F3' : '\uD83D\uDED2'} BUY {stock.ticker}
              </button>
            </div>
          )}
        </div>

        {/* ---- Metrics Grid ---- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.l}
              style={{
                background: '#1e293b',
                borderRadius: 6,
                padding: 8,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, color: '#64748b' }}>{m.l}</div>
              <div style={{ fontWeight: 700, color: m.c || 'white', marginTop: 2 }}>
                {m.v}
              </div>
            </div>
          ))}
        </div>

        {/* ---- Wyckoff + Accumulation + Patterns ---- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {/* Wyckoff */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: 8,
              padding: 12,
              borderLeft: `3px solid ${getWyckoffColor(wyckoff.phase)}`,
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              Wyckoff Phase
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>
                {getWyckoffEmoji(wyckoff.phase)}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: getWyckoffColor(wyckoff.phase),
                    fontSize: 14,
                    textTransform: 'capitalize',
                  }}
                >
                  {wyckoff.phase || 'Unknown'}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>
                  {wyckoff.signal || ''} • Conf: {wyckoff.confidence || 0}%
                </div>
              </div>
            </div>
            {wyckoff.description && (
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>
                {wyckoff.description}
              </div>
            )}
          </div>

          {/* Accumulation */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: 8,
              padding: 12,
              borderLeft: `3px solid ${
                accumulation.score >= 70
                  ? '#22c55e'
                  : accumulation.score >= 40
                  ? '#eab308'
                  : '#64748b'
              }`,
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              Accumulation
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color:
                    accumulation.score >= 70
                      ? '#22c55e'
                      : accumulation.score >= 40
                      ? '#eab308'
                      : '#64748b',
                }}
              >
                {accumulation.score || 0}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  textTransform: 'capitalize',
                }}
              >
                {accumulation.level || 'none'}
              </span>
            </div>
            {accumulation.factors && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {accumulation.factors.map((f) => (
                  <span
                    key={f.name}
                    style={{
                      background: f.pass ? '#22c55e15' : '#ef444415',
                      color: f.pass ? '#22c55e' : '#ef4444',
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontSize: 9,
                    }}
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Candlestick Patterns */}
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
              Candlestick Patterns
            </div>
            {patterns.length > 0 ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {patterns.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      background:
                        p.type === 'bullish'
                          ? '#22c55e15'
                          : p.type === 'bearish'
                          ? '#ef444415'
                          : '#64748b15',
                      borderRadius: 6,
                      padding: '4px 8px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        color:
                          p.type === 'bullish'
                            ? '#22c55e'
                            : p.type === 'bearish'
                            ? '#ef4444'
                            : '#94a3b8',
                      }}
                    >
                      {p.type === 'bullish' ? '🟢' : p.type === 'bearish' ? '🔴' : '⚪'}{' '}
                      {p.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>
                      {p.strength} • {p.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#475569', fontSize: 12 }}>No patterns detected</div>
            )}
          </div>
        </div>

        {/* ---- Confluence ---- */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Confluence</span>
            <span
              style={{
                fontWeight: 700,
                color:
                  alert.confluence >= 6
                    ? '#22c55e'
                    : alert.confluence >= 4
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {alert.confluence}/10
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {alert.factors.map((f) => (
              <span
                key={f.name}
                style={{
                  background: f.pass ? '#22c55e15' : '#ef444415',
                  color: f.pass ? '#22c55e' : '#ef4444',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                }}
              >
                {f.name}: {f.detail}
              </span>
            ))}
          </div>
        </div>

        {/* ---- ML Prediction ---- */}
        {mlScore && mlScore.ml_score !== null && (
          <div style={{
            background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 16,
            borderLeft: `3px solid ${mlScore.prediction === 'WIN' ? '#22c55e' : '#ef4444'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🧠 ML Prediction</span>
                <span style={{
                  marginLeft: 8, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: mlScore.prediction === 'WIN' ? '#22c55e20' : '#ef444420',
                  color: mlScore.prediction === 'WIN' ? '#22c55e' : '#ef4444',
                }}>{mlScore.prediction}</span>
              </div>
              <span style={{
                fontSize: 22, fontWeight: 800,
                color: mlScore.ml_score >= 60 ? '#22c55e' : mlScore.ml_score >= 45 ? '#eab308' : '#ef4444',
              }}>{mlScore.ml_score}%</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Confidence: {mlScore.confidence}% • XGBoost model
            </div>
          </div>
        )}

{/* ---- Trend Prediction ---- */}
        {trendData && trendData.prediction && (
          <div style={{
            background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 16,
            borderLeft: `3px solid ${trendData.prediction === 'UP' ? '#22c55e' : trendData.prediction === 'DOWN' ? '#ef4444' : '#eab308'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>📈 Trend Prediction (5 days)</span>
                <span style={{
                  marginLeft: 8, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: trendData.prediction === 'UP' ? '#22c55e20' : trendData.prediction === 'DOWN' ? '#ef444420' : '#eab30820',
                  color: trendData.prediction === 'UP' ? '#22c55e' : trendData.prediction === 'DOWN' ? '#ef4444' : '#eab308',
                }}>{trendData.prediction}</span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Conf: {trendData.confidence}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'UP', value: trendData.up_prob, color: '#22c55e' },
                { label: 'FLAT', value: trendData.flat_prob, color: '#eab308' },
                { label: 'DOWN', value: trendData.down_prob, color: '#ef4444' },
              ].map((bar) => (
                <div key={bar.label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>
                    <span>{bar.label}</span>
                    <span style={{ color: bar.color, fontWeight: 700 }}>{bar.value}%</span>
                  </div>
                  <div style={{ background: '#0f172a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${bar.value}%`, height: '100%', background: bar.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
{/* ---- Auto Analysis Summary ---- */}
        <div style={{
          background: '#1e293b', borderRadius: 8, padding: 14, marginBottom: 16,
          borderLeft: '3px solid #3b82f6',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            📋 Analisi {stock.ticker}
          </div>
          {(() => {
            const price = livePrice?.price || stock.price || 0;
            const rsi = stock.rsi || 50;
            const score = stock.setup_score || 0;
            const conf = alert.confluence || 0;
            const relVol = stock.relative_volume || 1;
            const poc = stock.poc_price || 0;
            const pocDist = poc && price ? Math.abs((price - poc) / price * 100).toFixed(1) : null;
            const pocAbove = price > poc;
            const ema10 = stock.ema10 || 0;
            const ema20 = stock.ema20 || 0;
            const ema50 = stock.ema50 || 0;
            const wyPhase = stock.wyckoff?.phase || 'unknown';
            const accumScore = stock.accumulation?.score || 0;
            const changePct = livePrice?.change_pct ?? stock.change_pct ?? 0;
            const trend = trendData?.prediction || null;
            const trendConf = trendData?.up_prob || trendData?.down_prob || 0;
            const ml = mlScore?.ml_score || null;
            const patterns = stock.candlestick_patterns || [];
            const bullish = patterns.filter(p => p.type === 'bullish');
            const bearish = patterns.filter(p => p.type === 'bearish');

            // Determine overall rating
            let rating = 'NEUTRO';
            let ratingColor = '#eab308';
            let ratingEmoji = '⚠️';
            if (score >= 65 && conf >= 6) { rating = 'FORTE'; ratingColor = '#22c55e'; ratingEmoji = '🟢'; }
            else if (score >= 50 && conf >= 4) { rating = 'MODERATO'; ratingColor = '#22c55e'; ratingEmoji = '🟡'; }
            else if (score < 30 || conf < 2) { rating = 'DEBOLE'; ratingColor = '#ef4444'; ratingEmoji = '🔴'; }

            // EMA structure
            let emaText = '';
            let emaOk = false;
            if (price > ema10 && ema10 > ema20 && ema20 > ema50) { emaText = 'Full align — uptrend forte'; emaOk = true; }
            else if (price > ema20 && ema20 > ema50) { emaText = 'Parziale — uptrend debole'; emaOk = true; }
            else if (price > ema50) { emaText = 'Sopra EMA50 ma struttura rotta'; }
            else { emaText = 'Sotto tutte le EMA — struttura ribassista'; }

            // RSI interpretation
            let rsiText = '';
            if (rsi < 30) rsiText = `RSI ${rsi.toFixed(0)} ipervenduto — possibile rimbalzo`;
            else if (rsi < 40) rsiText = `RSI ${rsi.toFixed(0)} debole — cautela`;
            else if (rsi <= 60) rsiText = `RSI ${rsi.toFixed(0)} neutro — no segnale`;
            else if (rsi < 70) rsiText = `RSI ${rsi.toFixed(0)} forte — momentum positivo`;
            else rsiText = `RSI ${rsi.toFixed(0)} ipercomprato — rischio pullback`;

            // Volume interpretation
            let volText = '';
            if (relVol >= 2 && changePct < -1) volText = `Vol ${relVol.toFixed(1)}x elevato in discesa — distribuzione`;
            else if (relVol >= 2 && changePct > 1) volText = `Vol ${relVol.toFixed(1)}x elevato in salita — accumulazione`;
            else if (relVol >= 1.5) volText = `Vol ${relVol.toFixed(1)}x sopra media — interesse attivo`;
            else volText = `Vol ${relVol.toFixed(1)}x nella norma`;

            // Verdict
            let verdict = '';
            let verdictColor = '#94a3b8';
            if (score >= 60 && conf >= 5 && (trend === 'UP' || !trend) && emaOk) {
              verdict = '✅ Entry swing long possibile'; verdictColor = '#22c55e';
            } else if (score >= 45 && conf >= 3) {
              verdict = '⚠️ Watchlist — aspettare conferma'; verdictColor = '#eab308';
            } else if (trend === 'DOWN' && score < 40) {
              verdict = '❌ No entry — trend ribassista'; verdictColor = '#ef4444';
            } else {
              verdict = '⚠️ Attendere setup migliore'; verdictColor = '#eab308';
            }

            const lines = [];

            // Rating
            lines.push({ icon: ratingEmoji, text: `${rating} — Score ${score}, Confluence ${conf}/10`, color: ratingColor, bold: true });

            // Trend
            if (trend) {
              const tc = trend === 'UP' ? '#22c55e' : trend === 'DOWN' ? '#ef4444' : '#eab308';
              lines.push({ icon: '📈', text: `Trend 5d: ${trend} ${trendConf.toFixed(0)}%`, color: tc });
            }

            // ML
            if (ml) {
              const mc = ml >= 60 ? '#22c55e' : ml >= 45 ? '#eab308' : '#ef4444';
              lines.push({ icon: '🧠', text: `ML Score: ${ml}% ${mlScore?.prediction || ''}`, color: mc });
            }

            // RSI
            lines.push({ icon: '📉', text: rsiText, color: rsi < 30 || rsi > 70 ? '#f97316' : '#94a3b8' });

            // EMA
            lines.push({ icon: '📊', text: `EMA: ${emaText}`, color: emaOk ? '#22c55e' : '#ef4444' });

            // Wyckoff
            if (wyPhase !== 'unknown') {
              const wc = { accumulation: '#22c55e', markup: '#3b82f6', distribution: '#f97316', markdown: '#ef4444', spring: '#8b5cf6' }[wyPhase] || '#94a3b8';
              lines.push({ icon: '🔄', text: `Wyckoff: ${wyPhase} — Accum: ${accumScore}`, color: wc });
            }

            // Volume
            lines.push({ icon: '📦', text: volText, color: relVol >= 2 ? '#f97316' : '#94a3b8' });

            // POC
            if (pocDist) {
              lines.push({ icon: '🎯', text: `POC $${poc.toFixed(2)} (${pocAbove ? '+' : '-'}${pocDist}%) — ${pocAbove ? 'sopra' : 'sotto'} POC`, color: pocAbove ? '#22c55e' : '#f97316' });
            }

            // Patterns
            if (bullish.length > 0) {
              lines.push({ icon: '🟢', text: `Pattern bullish: ${bullish.map(p => p.name).join(', ')}`, color: '#22c55e' });
            }
            if (bearish.length > 0) {
              lines.push({ icon: '🔴', text: `Pattern bearish: ${bearish.map(p => p.name).join(', ')}`, color: '#ef4444' });
            }

            return (
              <>
                {stock.llm_analysis && (
                  <div style={{
                    background: '#0f172a', borderRadius: 6, padding: 10, marginBottom: 8,
                    borderLeft: '3px solid #8b5cf6',
                  }}>
                    <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 10 }}>🧠 AI Stock Analysis</span>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{stock.llm_analysis}</div>
                  </div>
                )}
                {lines.map((line, i) => (
                  <div key={i} style={{ fontSize: 11, color: line.color, padding: '2px 0', fontWeight: line.bold ? 700 : 400 }}>
                    {line.icon} {line.text}
                  </div>
                ))}
                <div style={{
                  marginTop: 8, paddingTop: 8, borderTop: '1px solid #334155',
                  fontSize: 12, fontWeight: 700, color: verdictColor,
                }}>
                  {verdict}
                </div>
              </>
            );
          })()}
        </div>
        
        {/* ---- Price Chart with EMA Lines ---- */}
        {chartData.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              {'📈'} Price + EMA (10/20/50)
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="white"
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
                <Line
                  type="monotone"
                  dataKey="ema10"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                  name="EMA 10"
                />
                <Line
                  type="monotone"
                  dataKey="ema20"
                  stroke="#eab308"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 4"
                  name="EMA 20"
                />
                <Line
                  type="monotone"
                  dataKey="ema50"
                  stroke="#ef4444"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="6 6"
                  name="EMA 50"
                />
                {stock.poc_price && (
                  <ReferenceLine
                    y={stock.poc_price}
                    stroke="#8b5cf6"
                    strokeDasharray="4 4"
                    label={{
                      value: 'POC',
                      fill: '#8b5cf6',
                      fontSize: 10,
                      position: 'right',
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            {/* ---- EMA Legend ---- */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                marginTop: 4,
                marginBottom: 16,
              }}
            >
              {[
                { c: 'white', l: 'Price', d: '' },
                { c: '#3b82f6', l: 'EMA 10', d: '· ·' },
                { c: '#eab308', l: 'EMA 20', d: '- -' },
                { c: '#ef4444', l: 'EMA 50', d: '— —' },
                { c: '#8b5cf6', l: 'POC', d: '- -' },
              ].map((item) => (
                <span
                  key={item.l}
                  style={{ fontSize: 10, color: item.c, fontWeight: 600 }}
                >
                  {item.d} {item.l}
                </span>
              ))}
            </div>

            {/* ---- MACD Histogram ---- */}
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              {'📊'} MACD Histogram (EMA10 - EMA20)
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine y={0} stroke="#334155" />
                <Bar dataKey="macd_hist" name="MACD">
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.macd_hist >= 0 ? '#22c55e' : '#ef4444'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* ---- RSI Chart ---- */}
            <div
              style={{
                fontSize: 12,
                color: '#94a3b8',
                marginBottom: 6,
                marginTop: 12,
              }}
            >
              {'📉'} RSI (14)
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[30, 50, 70]}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="rsi"
                  stroke="#8b5cf6"
                  fill="#8b5cf620"
                  strokeWidth={1.5}
                  name="RSI"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* ---- Volume ---- */}
            <div
              style={{
                fontSize: 12,
                color: '#94a3b8',
                marginBottom: 6,
                marginTop: 12,
              }}
            >
              {'📦'} Volume
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(v) => [v?.toLocaleString(), 'Volume']}
                />
                <Bar dataKey="volume" fill="#3b82f6" fillOpacity={0.4} name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
