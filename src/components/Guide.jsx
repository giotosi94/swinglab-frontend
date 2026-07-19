import React from 'react';
import { AGENT_INFO } from '../utils/constants';

function Section({ emoji, title, children }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #1e293b' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>{emoji} {title}</h3>
      {children}
    </div>
  );
}

function Card({ title, color, children }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: 12, borderLeft: `3px solid ${color || '#3b82f6'}` }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: color || 'white', marginBottom: 6 }}>{title}</div>
      <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || 'white' }}>{value}</div>
    </div>
  );
}

export default function Guide() {
  return (
    <div>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: '1px solid #334155',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 32 }}>📖</span>
          <h2 style={{ margin: 0, fontSize: 24 }}>SwingLab — How It Works</h2>
          <span style={{
            background: '#8b5cf620',
            color: '#8b5cf6',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid #8b5cf644',
          }}>
            v4.7 · ADAPTIVE
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>
          <strong style={{ color: 'white' }}>SwingLab v4.7</strong> è una piattaforma di <strong style={{ color: '#3b82f6' }}>swing trading algoritmico</strong> con
          architettura <strong style={{ color: '#22c55e' }}>Multi-Agent AI a 5 agenti</strong>. Sistema completo enterprise con: APM Dual-Level,
          <strong style={{ color: '#8b5cf6' }}> Adaptive Targets per stock</strong>, DPS + Kelly Criterion, Regime-Aware, MacroAnalyst v2.0 formule continue,
          data Alpaca IEX live, Risk Profile Presets, autocomplete search, position widget unificato con progress T1/T2/T3.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 5 Multi-Agent AI</span>
          <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ APM Dual-Level</span>
          <span style={{ background: '#eab30820', color: '#eab308', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Adaptive Targets</span>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ DPS + Kelly</span>
          <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Regime-Aware</span>
          <span style={{ background: '#06b6d420', color: '#06b6d4', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Multi-Target REAL</span>
          <span style={{ background: '#84cc1620', color: '#84cc16', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Risk Presets</span>
        </div>
      </div>

      {/* 0. Key Metrics */}
      <Section emoji="📊" title="0. Sistema in Numeri (v4.7)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Metric label="Universo Stock" value="226" color="#3b82f6" />
          <Metric label="Settori SPDR" value="11" color="#22c55e" />
          <Metric label="Macro Indicators" value="19" color="#eab308" />
          <Metric label="Fattori Confluence" value="15" color="#f97316" />
          <Metric label="Agenti AI" value="5" color="#8b5cf6" />
          <Metric label="Risk Profiles" value="4" color="#06b6d4" />
          <Metric label="Sizing Layers" value="3x" color="#ef4444" />
          <Metric label="Cron Active" value="9" color="#22c55e" />
        </div>
      </Section>

      {/* 1. Data Sources */}
      <Section emoji="📡" title="1. Data Sources — Alpaca IEX Priority">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📈 226 Stock S&P" color="#3b82f6">
            20 stock per ognuno degli 11 settori SPDR. Bars daily da Alpaca IEX (v4.5), latest quotes real-time.
          </Card>
          <Card title="🏛 11 Settori SPDR" color="#22c55e">
            XLK, XLF, XLV, XLI, XLY, XLP, XLE, XLU, XLB, XLRE, XLC. Cron refresh ogni ora via Alpaca.
          </Card>
          <Card title="🌍 17 Macro ETF" color="#eab308">
            Bonds: TLT, HYG, LQD | Commodities: GLD, USO | Breadth: RSP, IWO | Vol: VIXY, VXX |
            Emerging: EEM | Transport: IYT | Indexes: SPY, QQQ, IWM, DIA
          </Card>
          <Card title="🪙 Crypto & FX" color="#f97316">
            BTC/USD, ETH/USD (risk-on/off), FXE (Euro), UUP (Dollar). Alpaca crypto API.
          </Card>
          <Card title="📰 News & Sentiment" color="#06b6d4">
            Alpaca News API + LLM (Gemini/Groq/Cerebras) per sentiment ed earnings detection.
          </Card>
          <Card title="📊 TradingView Charts" color="#8b5cf6">
            Widget integrato in StockDetail. Zero costi Twelve Data extra. Real-time IEX.
          </Card>
        </div>
      </Section>

      {/* 2. Indicatori Tecnici */}
      <Section emoji="📊" title="2. Analisi Tecnica Multi-Fattore">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="RSI (14)" color="#3b82f6">Sweet spot entry: 40-60. Reversal opportunity: 30-40.</Card>
          <Card title="MACD" color="#22c55e">Histogram &gt; 0 = momentum positivo. Crossover linea segnale.</Card>
          <Card title="EMA (10/20/50)" color="#eab308">Full Align: Price &gt; EMA10 &gt; EMA20 &gt; EMA50 = uptrend perfetto.</Card>
          <Card title="Volume Profile (POC + VA)" color="#f97316">POC (Point of Control), VA High/Low (Value Area 70%). Target/Stop ibridi.</Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">Accumulation → Markup → Distribution → Markdown. Spring = +2.0 punti.</Card>
          <Card title="Candlestick & FVG" color="#ef4444">Pattern: Hammer, Engulfing, Doji, Morning/Evening Star. Fair Value Gap.</Card>
          <Card title="Accumulation Score" color="#06b6d4">0-100 institutional accumulo. Volume + price action.</Card>
          <Card title="Range Position 52W" color="#84cc16">&lt; 30% = value zone, &gt; 70% = near high momentum.</Card>
        </div>
      </Section>

      {/* 3. Confluence Scoring */}
      <Section emoji="🎯" title="3. Confluence Score — Il Motore Decisionale">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            AlphaStrategist calcola per ogni stock un <strong style={{ color: '#22c55e' }}>Confluence Score</strong> (0-100)
            basato su <strong>15 fattori pesati</strong>. Solo candidati sopra soglia minima (default 35).
            13 Rule-Based + 2 ML-Powered.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {[
            { name: '1. POC Proximity', max: 2.0, color: '#3b82f6' },
            { name: '2. Bullish Patterns', max: 2.0, color: '#3b82f6' },
            { name: '3. RSI Sweet Spot', max: 1.0, color: '#3b82f6' },
            { name: '4. MACD Positive', max: 1.0, color: '#3b82f6' },
            { name: '5. EMA Alignment', max: 1.5, color: '#3b82f6' },
            { name: '6. Relative Volume', max: 1.0, color: '#3b82f6' },
            { name: '7. Sector Ranking', max: 1.5, color: '#3b82f6' },
            { name: '8. Wyckoff Signal', max: 2.0, color: '#3b82f6' },
            { name: '9. Accumulation', max: 1.0, color: '#3b82f6' },
            { name: '10. FVG Support', max: 0.5, color: '#3b82f6' },
            { name: '11. Range Position', max: 0.5, color: '#3b82f6' },
            { name: '12. Daily Change', max: 0.5, color: '#3b82f6' },
            { name: '13. Near 52w High', max: 0.5, color: '#3b82f6' },
            { name: '14. 🧠 ML WIN/LOSS', max: 2.5, color: '#8b5cf6' },
            { name: '15. 🧠 Trend Predictor', max: 2.0, color: '#8b5cf6' },
          ].map((f) => (
            <div key={f.name} style={{
              background: '#0f172a', borderRadius: 6, padding: '8px 10px',
              borderLeft: `2px solid ${f.color}`, display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', fontSize: 11,
            }}>
              <span style={{ color: 'white' }}>{f.name}</span>
              <span style={{ color: f.color, fontWeight: 700 }}>+{f.max}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Multi-Agent */}
      <Section emoji="🤖" title="4. Multi-Agent AI v4.7 (5 Agenti)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, textAlign: 'center', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6' }}>5 agenti AI</strong> in pipeline sequenziale,
            comunicano tramite <strong style={{ color: '#8b5cf6' }}>Shared Brain (MongoDB)</strong>,
            leggono reasoning altri agenti per decisioni contestuali.
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {['macro_analyst', 'alpha_strategist', 'risk_manager', 'adaptive_position_manager', 'executor'].map((name, i) => {
                const info = AGENT_INFO[name];
                if (!info) return null;
                return (
                  <React.Fragment key={name}>
                    {i > 0 && <div style={{ color: '#475569', fontSize: 20 }}>→</div>}
                    <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 14px', border: `2px solid ${info.color}`, textAlign: 'center', minWidth: 100 }}>
                      <div style={{ fontSize: 18 }}>{info.emoji}</div>
                      <div style={{ color: 'white', fontSize: 10, fontWeight: 700, marginTop: 2 }}>{info.name}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', margin: '8px 0' }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 12 }}>🧠 Shared Brain (MongoDB)</span>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                market · candidates · approved · APM decisions · executions · LLM reasoning
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst v2.0" color="#3b82f6">
            <strong>Formule continue</strong>. 19 macro indicators (Alpaca IEX). Regime BULL/NEUTRAL/BEAR/CRASH,
            exposure multiplier dinamico, rotation signal, credit spreads.
          </Card>
          <Card title="🎯 AlphaStrategist v2.0" color="#22c55e">
            Confluence Score 15 fattori. Filtra RSI, volume, setup type, sector limit.
            LLM italiano su top 5 candidati.
          </Card>
          <Card title="🛡 RiskManager v4.2" color="#eab308">
            <strong>DPS + Kelly + Regime</strong>. Sizing dinamico: R/R × ML × Confluence × Kelly (WR+VIX) × Regime.
            Base 12% modulato 5%-25%.
          </Card>
          <Card title="🎯 APM v1.2 Adaptive" color="#8b5cf6">
            <strong>🆕 v4.7 Adaptive Targets</strong>. Timer 1h + urgent 15min. Target T1/T2/T3 personalizzati per stock.
            Regime-Aware exit thresholds. HOLD/SCALE/EXIT/TIGHTEN.
          </Card>
          <Card title="⚡ Executor v3.5" color="#f97316">
            Notional buy + recalc post-fill slippage. Software SL/TP con break-even detection.
            Trailing 3-level. Trade Sync v5. Cancel stale 2h.
          </Card>
        </div>
      </Section>

      {/* 5. APM Deep Dive v4.7 */}
      <Section emoji="🎯" title="5. APM v1.2 — Dual-Level + Adaptive Targets">
        <div style={{ background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6', fontSize: 15 }}>🎯 Sistema a TRE LIVELLI</strong>
            <br/><br/>
            <strong style={{ color: '#f97316' }}>Livello 1 — Urgent Triggers (15 min)</strong>: Check millisecondi solo su target hit.
            SCALE_OUT immediato senza timer.
            <br/><br/>
            <strong style={{ color: '#8b5cf6' }}>Livello 2 — Full Analysis (1h)</strong>: Rivaluta confluence, ML, regime.
            HOLD/EXIT/SCALE/TIGHTEN con LLM italiano.
            <br/><br/>
            <strong style={{ color: '#eab308' }}>🆕 v4.7 — Adaptive Targets</strong>: Al momento del buy, target T1/T2/T3
            calcolati dinamicamente su target Alpha per singola stock.
            <br/>Es. ADBE target Alpha +19% → T1 +7.87%, T2 +13.77%, T3 +19.67%.
            <br/>Es. KO target Alpha +3.9% → T1 +1.56%, T2 +2.73%, T3 +3.91%.
            <br/><br/>
            <strong style={{ color: '#22c55e' }}>Regime-Aware Exit</strong>: soglie exit_confluence adattano al regime.
            BULL = meno aggressivo (esce solo se davvero rotto). BEAR = più aggressivo (protegge capitale).
            <br/><br/>
            <strong style={{ color: '#3b82f6' }}>Learning Loop</strong>: cron domenica 07:00 auto-tuning soglie.
            Sistema che <strong>impara dai propri errori</strong>.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🟢 HOLD" color="#22c55e">
            Confluence &gt; regime-adjusted threshold, ML WIN, nessun fattore negativo dominante.
            Mantiene posizione, aspetta target/SL naturale.
          </Card>
          <Card title="🟡 SCALE_OUT Adaptive" color="#eab308">
            <strong>🆕 v4.7</strong>. T1/T2/T3 personalizzati per stock. Chiude 50%/30%/20%.
            Partial close REALE su Alpaca. Break-even SL sul restante.
          </Card>
          <Card title="🔴 EXIT" color="#ef4444">
            Confluence sotto threshold + ML LOSS/DOWN + 2+ fattori negativi.
            Chiude 100%. Meglio piccola perdita che grossa.
          </Card>
          <Card title="🛡️ TIGHTEN_STOP" color="#f97316">
            Profit &gt; 3% ma ML predice inversione.
            Alza SL a -2% dal current price.
          </Card>
          <Card title="⏰ Frequency 3-Layer" color="#3b82f6">
            <strong>Urgent 15min</strong>: target hit istantaneo.
            <br/><strong>Full 1h</strong>: analysis completa LLM.
            <br/><strong>Drop 5%</strong>: check straordinario.
          </Card>
          <Card title="🧠 Learning Loop" color="#06b6d4">
            <strong>✅ Cron domenica 07:00</strong>. Analizza 30gg decisioni,
            calcola exit accuracy, auto-tuning soglie. Report Telegram.
          </Card>
        </div>
      </Section>

      {/* 6. Adaptive Targets NEW */}
      <Section emoji="🎯" title="6. 🆕 Adaptive Targets v4.7 — Target per Stock">
        <div style={{ background: 'linear-gradient(135deg, #3a2f0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #eab308' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#eab308', fontSize: 15 }}>🎯 Rivoluzione v4.7</strong>
            <br/><br/>
            <strong>PRIMA</strong> (fixed): APM chiudeva sempre a +5%/+10%/+20% per TUTTE le stock.
            <br/>
            <strong>ORA</strong> (adaptive): Al momento del buy, targets calcolati sul target Alpha specifico.
            <br/><br/>
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#eab308' }}>
              At buy time:<br/>
              target_distance_pct = (target_alpha - entry) / entry × 100<br/><br/>
              adaptive_t1_pct = target_distance × 0.40  (40% del percorso)<br/>
              adaptive_t2_pct = target_distance × 0.70  (70% del percorso)<br/>
              adaptive_t3_pct = target_distance × 1.00  (100% target Alpha)
            </div>
            <br/>
            <strong style={{ color: '#22c55e' }}>Esempio TSLA volatile</strong>: target Alpha +26% → T1 +10.4%, T2 +18.2%, T3 +26%
            <br/>
            <strong style={{ color: '#22c55e' }}>Esempio KO stabile</strong>: target Alpha +3.9% → T1 +1.56%, T2 +2.73%, T3 +3.91%
            <br/><br/>
            Ogni stock ha SUOI target basati su volatility e setup, non uniformi.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎯 Volatility-Aware Targets" color="#eab308">
            Stock volatili (ATR alto) → target più larghi (T1 alto).
            Stock stabili (ATR basso) → target stretti (T1 basso).
          </Card>
          <Card title="🎯 Setup-Specific Targets" color="#3b82f6">
            Breakout → target proporzionali a range.
            EMA Bounce → target verso resistance.
            POC Pullback → target verso VA High.
          </Card>
          <Card title="🛡️ Safety Net Cap" color="#22c55e">
            target_distance: max 40%, min 2%.
            sl_distance: max 15%, min 1%.
            Evita target irrealistici.
          </Card>
          <Card title="🔄 Backward Compatible" color="#8b5cf6">
            Trade vecchi senza adaptive → fallback a params fissi 5%/10%/20%.
            Endpoint backfill per aggiornare trade attivi.
          </Card>
          <Card title="🎨 UI Widget Visuale" color="#06b6d4">
            Progress bar T1/T2/T3 per ogni posizione.
            Badge ADAPTIVE viola vs LEGACY grigio.
            Prezzi target + distanza percentuale.
          </Card>
          <Card title="🔧 v4.7 Fix Critical" color="#ef4444">
            _decide_action ora legge last_target_hit.
            NO più scale-out ripetuti su T1.
            Progressione corretta T1 → T2 → T3.
          </Card>
        </div>
      </Section>

      {/* 7. DPS + Kelly */}
      <Section emoji="💰" title="7. Dynamic Position Sizing + Kelly Criterion">
        <div style={{ background: 'linear-gradient(135deg, #3a2f0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #eab308' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#eab308', fontSize: 15 }}>💰 Triple Intelligence Sizing</strong>
            <br/><br/>
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#eab308' }}>
              Size = Base × DPS × Kelly × Regime<br/><br/>
              DPS = R/R_mult × ML_mult × Conf_mult<br/>
              Kelly = Fractional_Kelly × Volatility_Adjust<br/>
              Regime = exposure_multiplier (BULL 1.0, NEUTRAL 0.6, BEAR 0.3)
            </div>
            <br/>
            Trade eccellente + sistema winning + BULL → 12% × 1.55 × 1.2 × 1.0 = <strong>22%</strong>
            <br/>
            Trade mediocre + sistema mixed + BEAR + VIX alto → 12% × 0.7 × 0.7 × 0.85 × 0.3 = <strong>5%</strong>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎯 R/R Multiplier" color="#22c55e">R/R 0.5→0.5x | 1.5→0.7x | 2.5→1.0x | 3.5→1.3x</Card>
          <Card title="🧠 ML Multiplier" color="#8b5cf6">ML 40%→0.7x | 60%→0.9x | 75%→1.0x | 90%→1.2x</Card>
          <Card title="🎯 Confluence Multiplier" color="#3b82f6">Conf 30→0.7x | 45→0.9x | 55→1.0x | 70→1.3x</Card>
          <Card title="💰 Kelly Criterion" color="#eab308">
            Kelly% = (WR × avg_win - LR × avg_loss) / avg_win.
            Fractional 0.25x safety. Attivo solo con &gt;20 trade chiusi.
          </Card>
          <Card title="📉 Volatility (VIX)" color="#ef4444">VIX Low/Normal→1.0x | High→0.85x | Extreme→0.7x</Card>
          <Card title="🛡️ Safety Net" color="#06b6d4">
            Kelly skip se &lt;20 trade. Cap max 25%. Regime multiplier ridotto in BEAR.
          </Card>
        </div>
      </Section>

      {/* 8. Risk Presets */}
      <Section emoji="🎚️" title="8. Risk Profile Presets — 4 Profili + Avanzato">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="🛡️ Conservativo" color="#22c55e">
            5 pos max · 8% size · R/R 2:1 · Kelly OFF · Return atteso +8-12%
          </Card>
          <Card title="🎯 Moderato" color="#3b82f6">
            8 pos max · 12% size · R/R 1.5:1 · Kelly 0.20 · Return +15-25%
          </Card>
          <Card title="⚡ Aggressivo" color="#f97316">
            12 pos max · 18% size · R/R 1.3:1 · Kelly 0.25 · Return +25-40%
          </Card>
          <Card title="🚀 Super Aggressivo" color="#ef4444">
            15 pos max · 22% size · R/R 1.2:1 · Kelly 0.35 · Return +35-60%
          </Card>
          <Card title="🔧 Avanzato" color="#8b5cf6">
            Accordion collapsable con 30+ slider dettagliati.
            Per power user che vogliono fine-tuning.
          </Card>
        </div>
      </Section>

      {/* 9. ML Integration */}
      <Section emoji="🧠" title="9. Machine Learning Integration">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎲 XGBoost WIN/LOSS" color="#8b5cf6">
            15 features. Score 0-100. Contribuzione fino a +2.5 al Confluence. Usato da DPS.
          </Card>
          <Card title="📈 Trend Predictor 5D" color="#3b82f6">
            20 features. UP/FLAT/DOWN 5gg. +2.0 Confluence. Training 13,680 samples.
          </Card>
          <Card title="🔍 ML Health Check" color="#22c55e">
            Endpoint /api/ml/debug/health. Detect flat predictions, low variance.
          </Card>
          <Card title="🔄 Learning Loop" color="#eab308">
            Ogni agente learn() analizza trade con time decay 60gg. APM cron settimanale.
          </Card>
        </div>
      </Section>

      {/* 10. LLM */}
      <Section emoji="💬" title="10. LLM Reasoning (3 Providers)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🥇 Gemini 2.0 Flash" color="#4285f4">Free 1500 req/day. Primary provider.</Card>
          <Card title="🥈 Groq Llama 3" color="#f97316">Fallback veloce ~200 tok/s.</Card>
          <Card title="🥉 Cerebras" color="#22c55e">Terzo fallback per uptime.</Card>
          <Card title="💾 Cache & Cooldown" color="#8b5cf6">Cache per ticker. Cooldown per agente.</Card>
          <Card title="🧠 Cross-Agent" color="#06b6d4">APM legge Macro. Executor legge Macro + Risk + APM.</Card>
          <Card title="🌐 Italiano" color="#84cc16">Ogni decisione in italiano per trasparenza.</Card>
        </div>
      </Section>

      {/* 11. Execution */}
      <Section emoji="📦" title="11. Order Execution & Risk Protection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="💵 Notional Buy" color="#3b82f6">
            Dollari con sizing dinamico DPS+Kelly+Regime. Fractional shares.
          </Card>
          <Card title="🎯 3-Step Buy Flow" color="#22c55e">
            place_notional_buy → wait_for_fill → place SL + TP. Recalc slippage &gt; 3%.
          </Card>
          <Card title="🛡️ Software SL/TP" color="#f97316">
            Break-even detection (v4.5). Check ogni pipeline (15 min).
          </Card>
          <Card title="🟡 Partial Close REAL" color="#8b5cf6">
            APM SCALE_OUT chiude X shares reali via DELETE /positions?qty=X.
            Break-even SL automatico.
          </Card>
          <Card title="🧯 Sanity Checks" color="#ef4444">
            Alpha valida SL/TP. Executor recalc post-fill. Software SL/TP skip se invalidi.
          </Card>
          <Card title="🔄 Trade Sync v5" color="#06b6d4">
            Sync automatico Alpaca ↔ MongoDB. Anti-mismatch fractional/integer.
            Cancel stale 2h (v4.5).
          </Card>
        </div>
      </Section>

      {/* 12. UI Widgets */}
      <Section emoji="🎨" title="12. UI Widgets — Enterprise Design">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="💼 Positions Unified" color="#8b5cf6">
            <strong>🆕 v4.7</strong>. Widget unico con progress T1/T2/T3, SL/TP, R/R, Confluence.
            Badge ADAPTIVE. Click ▶ espande dettagli.
          </Card>
          <Card title="🎯 APM Actions" color="#3b82f6">
            Timeline decisioni APM con stats. Latest 5 SCALE_OUT/EXIT/HOLD.
          </Card>
          <Card title="💰 DPS + Kelly Tab" color="#eab308">
            Distribution multipliers, Kelly status, sizing history 30 trade.
          </Card>
          <Card title="🎚️ Risk Presets" color="#22c55e">
            4 card visuali. Sezione avanzata collapsable.
          </Card>
          <Card title="🔍 Autocomplete Search" color="#06b6d4">
            Ticker + nome azienda. Filtro real-time. 226 stock + ETF.
          </Card>
          <Card title="📊 TradingView Chart" color="#84cc16">
            Widget integrato in StockDetail. Real-time IEX, multi-timeframe.
          </Card>
        </div>
      </Section>

      {/* 13. Analytics */}
      <Section emoji="📈" title="13. Analytics & Automation">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📊 Performance Analytics" color="#22c55e">
            Sharpe, Sortino, Profit Factor, Expectancy, Max Drawdown, Win Rate.
          </Card>
          <Card title="📉 Benchmark vs SPY" color="#3b82f6">
            Confronto equity vs SPY. Alpha calcolato automatico.
          </Card>
          <Card title="🧬 APM Learning Cron" color="#8b5cf6">
            <strong>Domenica 07:00</strong>. Auto-tuning soglie. Report Telegram.
          </Card>
          <Card title="🎯 Decision Log" color="#eab308">
            Ogni decisione salvata con contesto. Base per retrain ML.
          </Card>
          <Card title="🔔 Telegram Bot" color="#f97316">
            @swinglab_alert_bot: buy/sell, APM actions, urgent, briefing 14:00, report 22:30.
          </Card>
          <Card title="⏰ 9 Cron Active" color="#06b6d4">
            Pipeline 15min · APM Urgent 15min · Market 1h · Sectors 1h · Learning weekly · Keep-alive 10min · Briefing · Report.
          </Card>
        </div>
      </Section>

      {/* 14. Tech Stack */}
      <Section emoji="⚙️" title="14. Tech Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="Backend" color="#3b82f6">Python 3.11 + FastAPI + Motor + XGBoost + sklearn</Card>
          <Card title="Frontend" color="#22c55e">React 19 + Recharts + TradingView + Vercel</Card>
          <Card title="Database" color="#eab308">MongoDB Atlas Free M0. Collections indexed.</Card>
          <Card title="Broker" color="#f97316">Alpaca Paper Trading v2. Fractional + partial close.</Card>
          <Card title="LLM" color="#8b5cf6">Gemini 2.0 + Groq Llama3 + Cerebras.</Card>
          <Card title="Market Data" color="#06b6d4">Alpaca IEX (primary v4.5) + Twelve Data fallback.</Card>
          <Card title="Deploy Backend" color="#ef4444">Render.com async. swinglab-backend.onrender.com</Card>
          <Card title="Deploy Frontend" color="#84cc16">Vercel auto-deploy da GitHub.</Card>
          <Card title="Automation" color="#f59e0b">cron-job.org: 9 cron attivi.</Card>
        </div>
      </Section>

      {/* 15. Roadmap */}
      <Section emoji="🚀" title="15. Roadmap Futura">
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf620 0%, #3b82f620 100%)',
          borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid #8b5cf644',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>👥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Multi-User Platform (v5.0)</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>SwingLab as a Service — Settembre 2026</div>
            </div>
            <span style={{
              marginLeft: 'auto', background: '#8b5cf6', color: 'white',
              padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            }}>IN ROADMAP</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="✅ Completato v4.7" color="#22c55e">
            APM Adaptive Targets, Fix _decide_action, Positions Unified widget,
            DPS+Kelly Analytics, MacroAnalyst v2.0, Alpaca IEX priority.
          </Card>
          <Card title="🎯 Weekend Prossimo" color="#eab308">
            <strong>Preset "Il mio stile"</strong>: 5° card custom saved config.
            <br/><strong>Confluence detail modal</strong>: breakdown 15 fattori.
          </Card>
          <Card title="🎯 Agosto — Focus Critico" color="#3b82f6">
            <strong>Backtesting Engine</strong>: valida strategie su dati storici.
            <br/><strong>Extended Hours</strong>: pre/after market.
            <br/><strong>Universe 500 stocks</strong>: mid-cap growth.
          </Card>
          <Card title="🎯 Long Term (2027)" color="#8b5cf6">
            <strong>v5.0 Multi-User</strong>: SaaS platform.
            <br/><strong>Multi-Broker</strong>: IB, Robinhood.
            <br/><strong>Mobile Apps</strong>: iOS + Android.
            <br/><strong>Options Trading</strong>: covered calls.
          </Card>
        </div>
      </Section>

      {/* 16. Glossary */}
      <Section emoji="📚" title="16. Glossario Tecnico">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {[
            ['APM v1.2', 'Adaptive Position Manager — Dual-level + Adaptive Targets'],
            ['Adaptive Targets', '🆕 T1/T2/T3 calcolati per stock da target Alpha (v4.7)'],
            ['DPS', 'Dynamic Position Sizing con R/R + ML + Confluence'],
            ['Kelly Criterion', 'Formula sizing win rate + payoff. Fractional 0.25'],
            ['Regime-Aware', '🆕 APM adatta soglie exit a market regime (v4.5)'],
            ['Multi-Target REAL', 'Partial close reale via DELETE /positions?qty=X'],
            ['POC', 'Point of Control — prezzo maggior volume'],
            ['VA High/Low', 'Value Area 70% volume'],
            ['RSI', 'Relative Strength Index (0-100)'],
            ['MACD', 'Moving Average Convergence Divergence'],
            ['EMA', 'Exponential Moving Average'],
            ['Wyckoff', 'Teoria 4 fasi (Accum/Markup/Distrib/Markdown)'],
            ['Spring', 'Rimbalzo forte da supporto Wyckoff'],
            ['FVG', 'Fair Value Gap non riempiti'],
            ['Confluence Score', '15 fattori + ML pesati (0-100)'],
            ['R/R Ratio', 'Risk/Reward reward/risk'],
            ['Notional Buy', 'Ordine in dollari (fractional)'],
            ['Software SL/TP', 'Stop/Target Executor con break-even detection'],
            ['HOLD/SCALE/EXIT/TIGHTEN', '4 decisioni APM'],
            ['Urgent Trigger', 'APM check ogni 15min bypass timer 1h'],
            ['Backfill Adaptive', '🆕 Endpoint per aggiornare buy vecchi'],
            ['Volatility Adjust', 'Sizing ridotto in VIX High/Extreme'],
            ['Fractional Kelly', 'Kelly × 0.25 safety hedge fund'],
            ['Trailing Stop', 'SL dinamico che segue profit'],
            ['Breadth', '% stock sopra EMA50'],
            ['Rotation Signal', 'offensive/defensive/mixed'],
            ['Regime', 'BULL/NEUTRAL/BEAR/CRASH'],
            ['Exposure Multiplier', 'Fattore 0-1 per regime'],
            ['Shared Brain', 'MongoDB collection condivisa 5 agenti'],
            ['LLM Reasoning', 'Spiegazione italiana ogni decisione'],
            ['XGBoost', 'ML per WIN/LOSS predict'],
            ['Trend Predictor', 'ML UP/FLAT/DOWN 5gg'],
            ['ML Score', 'Probabilità WIN 0-100%'],
            ['Trade Sync v5', 'Anti-mismatch fractional/integer'],
            ['TradingView Widget', 'Chart integrato in StockDetail'],
            ['last_target_hit', 'Contatore progressione target APM (v4.7)'],
            ['partial_scaled_out', 'Flag safety net per bug legacy'],
          ].map(([t, d]) => (
            <div key={t} style={{ background: '#1e293b', borderRadius: 6, padding: 8, fontSize: 12 }}>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{t}</span>
              <span style={{ color: '#94a3b8' }}> — {d}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)',
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
        border: '2px solid #8b5cf6',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
          🚀 <strong style={{ color: 'white' }}>SwingLab v4.7</strong> — Multi-Agent AI Trading Platform with Adaptive Targets
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          APM Dual-Level · Adaptive Targets · DPS + Kelly · Regime-Aware · Alpaca IEX Live · 100% Automated
        </div>
      </div>
    </div>
  );
}
