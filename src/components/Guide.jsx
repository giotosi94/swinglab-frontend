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
            v4.2 · APM + DPS + Kelly
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>
          <strong style={{ color: 'white' }}>SwingLab v4.2</strong> è una piattaforma di <strong style={{ color: '#3b82f6' }}>swing trading algoritmico</strong> con
          architettura <strong style={{ color: '#22c55e' }}>Multi-Agent AI a 5 agenti</strong>. Combina agenti autonomi coordinati da uno Shared Brain,
          modelli Machine Learning (XGBoost + Trend Predictor), analisi tecnica multi-fattore (15 indicatori),
          LLM reasoning italiano (Gemini + Groq + Cerebras), news sentiment analysis, l'
          <strong style={{ color: '#8b5cf6' }}> Adaptive Position Manager (APM)</strong> con multi-target real execution
          e — novità v4.2 — <strong style={{ color: '#eab308' }}>Dynamic Position Sizing con Kelly Criterion</strong> per
          sizing intelligente basato su R/R, ML, Confluence e win rate storico.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 5 Multi-Agent AI</span>
          <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ APM v1.1 + Learning</span>
          <span style={{ background: '#eab30820', color: '#eab308', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ DPS + Kelly</span>
          <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ ML Integration</span>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Multi-Target Real</span>
          <span style={{ background: '#06b6d420', color: '#06b6d4', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 24/7 Automation</span>
          <span style={{ background: '#84cc1620', color: '#84cc16', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ TradingView Charts</span>
        </div>
      </div>

      {/* 0. Key Metrics */}
      <Section emoji="📊" title="0. Sistema in Numeri (v4.2)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Metric label="Universo Stock" value="226" color="#3b82f6" />
          <Metric label="Settori SPDR" value="11" color="#22c55e" />
          <Metric label="Macro Indicators" value="19" color="#eab308" />
          <Metric label="Fattori Confluence" value="15" color="#f97316" />
          <Metric label="Agenti AI" value="5" color="#8b5cf6" />
          <Metric label="Sizing Multiplier" value="3x" color="#ef4444" />
          <Metric label="LLM Providers" value="3" color="#06b6d4" />
          <Metric label="APM Check" value="1h + trigger" color="#22c55e" />
        </div>
      </Section>

      {/* 1. Data Sources */}
      <Section emoji="📡" title="1. Data Sources & Universo di Trading">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📈 226 Stock S&P" color="#3b82f6">
            20 stock per ognuno degli 11 settori SPDR + assets extra. Dati OHLCV storici da Alpaca IEX,
            prezzi real-time da Twelve Data.
          </Card>
          <Card title="🏛 11 Settori SPDR" color="#22c55e">
            XLK, XLF, XLV, XLI, XLY, XLP, XLE, XLU, XLB, XLRE, XLC. Ranking dinamico per composite score.
          </Card>
          <Card title="🌍 10 Macro ETF" color="#eab308">
            Bonds: TLT, HYG, LQD | Commodities: GLD, USO | Breadth: RSP, IWO | Volatilità: VIXY, VXX |
            Emerging: EEM | Transport: IYT
          </Card>
          <Card title="🪙 Crypto & FX" color="#f97316">
            BTC/USD, ETH/USD (crypto sentiment risk-on/off), FXE (Euro), UUP (Dollar strength).
          </Card>
          <Card title="📰 News & Sentiment" color="#06b6d4">
            Alpaca News API + LLM (Gemini/Groq) per sentiment analysis ed earnings detection.
          </Card>
          <Card title="📊 TradingView Charts" color="#8b5cf6">
            <strong>🆕 v4.2</strong>: Widget TradingView integrato per real-time charts professionali.
            Zero costi Twelve Data extra. Multi-timeframe, drawing tools, indicators.
          </Card>
        </div>
      </Section>

      {/* 2. Indicatori Tecnici */}
      <Section emoji="📊" title="2. Analisi Tecnica Multi-Fattore">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="RSI (14)" color="#3b82f6">Sweet spot per entry: 40-60. Reversal opportunity: 30-40.</Card>
          <Card title="MACD" color="#22c55e">Histogram &gt; 0 = momentum positivo. Crossover linea segnale = buy/sell signal.</Card>
          <Card title="EMA (10/20/50)" color="#eab308">Full Align: Price &gt; EMA10 &gt; EMA20 &gt; EMA50 = uptrend perfetto.</Card>
          <Card title="Volume Profile (POC + VA)" color="#f97316">POC (Point of Control), VA High/Low (Value Area 70%). Target/Stop ibridi.</Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">Accumulation → Markup → Distribution → Markdown. Spring = strong bullish (+2.0 punti).</Card>
          <Card title="Candlestick & FVG" color="#ef4444">Pattern: Hammer, Engulfing, Doji, Morning/Evening Star. Fair Value Gap non riempiti.</Card>
          <Card title="Accumulation Score" color="#06b6d4">Punteggio 0-100 accumulo istituzionale in base a volume + price action.</Card>
          <Card title="Range Position 52W" color="#84cc16">&lt; 30% = value zone, &gt; 70% = near high (momentum).</Card>
        </div>
      </Section>

      {/* 3. Confluence */}
      <Section emoji="🎯" title="3. Confluence Score — Il Motore Decisionale">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            L'AlphaStrategist calcola per ogni stock un <strong style={{ color: '#22c55e' }}>Confluence Score</strong> (0-100)
            basato su <strong>15 fattori pesati</strong>. Solo i candidati sopra la soglia minima (default 35) diventano
            buy opportunity. 13 Rule-Based + 2 ML-Powered.
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
      <Section emoji="🤖" title="4. Architettura Multi-Agent AI v4.2 (5 Agenti)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, textAlign: 'center', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6' }}>5 agenti AI indipendenti</strong> operano in pipeline sequenziale,
            comunicano tramite <strong style={{ color: '#8b5cf6' }}>Shared Brain (MongoDB)</strong>,
            e leggono il reasoning degli altri per decisioni contestuali.
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
                market state · candidates · approved trades · APM decisions · executions · LLM reasoning
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst v2.0" color="#3b82f6">
            <strong>🆕 v4.2</strong>: Formule continue (no bucket). Analizza 19 indicatori macro con
            score proporzionali. Regime (BULL/NEUTRAL/BEAR/CRASH) + exposure multiplier dinamico + rotation signal.
          </Card>
          <Card title="🎯 AlphaStrategist v2.0" color="#22c55e">
            Confluence Score 15 fattori (13 rules + 2 ML). Filtra per RSI, volume smart, setup type,
            sector limit. LLM analizza top 5 candidati con pro/contro.
          </Card>
          <Card title="🛡 RiskManager v4.2" color="#eab308">
            <strong>🆕 v4.2 DPS + Kelly</strong>. Approva/rifiuta trade con sizing dinamico:
            R/R × ML × Confluence × Kelly (WR + payoff + VIX). Base 12% modulato 6%-30%.
          </Card>
          <Card title="🎯 APM v1.1" color="#8b5cf6">
            <strong>🆕 v4.2</strong>: Timer 1h + urgent triggers ogni 15 min. Rivaluta posizioni con 4 decisioni:
            <br/>• 🟢 <strong>HOLD</strong> — tesi valida
            <br/>• 🟡 <strong>SCALE_OUT</strong> — chiude parziale REALE su Alpaca
            <br/>• 🔴 <strong>EXIT</strong> — tesi rotta
            <br/>• 🛡️ <strong>TIGHTEN_STOP</strong> — proteggi profit
          </Card>
          <Card title="⚡ Executor v3.4" color="#f97316">
            Notional buy (fractional) + recalc post-fill se slippage &gt; 3%.
            Software SL/TP con break-even detection, trailing 3 livelli, Trade Sync v5.
          </Card>
        </div>
      </Section>

      {/* 5. APM Deep Dive */}
      <Section emoji="🎯" title="5. APM v1.1 — Adaptive Position Manager">
        <div style={{ background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6', fontSize: 15 }}>🎯 Sistema a DUE LIVELLI</strong>
            <br/><br/>
            <strong style={{ color: '#f97316' }}>Livello 1 — Urgent Triggers (ogni 15 min)</strong>: Check millisecondi solo su target hit / drop critico.
            Se P&L ≥ target 1/2/3 → <strong>SCALE_OUT immediato</strong> senza aspettare timer.
            <br/><br/>
            <strong style={{ color: '#8b5cf6' }}>Livello 2 — Full Analysis (ogni 1h)</strong>: Rivaluta confluence, ML score,
            regime macro. Decisioni HOLD/EXIT/SCALE/TIGHTEN complete con LLM reasoning italiano.
            <br/><br/>
            <strong style={{ color: '#22c55e' }}>Multi-Target REAL</strong>: SCALE_OUT esegue partial close reale su Alpaca
            (chiude X shares invece di tutta la posizione) + sposta SL a break-even sul restante.
            <br/><br/>
            <strong style={{ color: '#eab308' }}>Learning Loop</strong>: Cron settimanale (domenica 07:00) analizza decisioni APM
            30 giorni e auto-aggiusta soglie. Sistema che <strong>impara dai propri errori</strong>.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🟢 HOLD" color="#22c55e">
            <strong>Condizione</strong>: Confluence ancora &gt; 30, ML predice WIN, nessun fattore negativo dominante.
            <br/><strong>Azione</strong>: Mantiene posizione, aspetta target o SL naturale.
          </Card>
          <Card title="🟡 SCALE_OUT (REAL)" color="#eab308">
            <strong>🆕 Alpaca partial close reale</strong>. Chiude 50% al T1 (+5%), 30% al T2 (+10%), 20% al T3 (+20%).
            Sposta SL a break-even sul restante. Configurabile via Settings.
          </Card>
          <Card title="🔴 EXIT" color="#ef4444">
            <strong>Condizione</strong>: Confluence &lt; 30 + ML LOSS/DOWN + 2+ fattori negativi.
            <br/><strong>Azione</strong>: Chiude 100% posizione. Meglio piccola perdita che grossa.
          </Card>
          <Card title="🛡️ TIGHTEN_STOP" color="#f97316">
            <strong>Condizione</strong>: Profit &gt; 3% ma ML predice inversione.
            <br/><strong>Azione</strong>: Alza SL a -2% dal current price per proteggere profit.
          </Card>
          <Card title="⏰ Frequency Ibrida" color="#3b82f6">
            <strong>Urgent (15 min)</strong>: Target hit → azione istantanea.
            <br/><strong>Full analysis (1h)</strong>: Confluence + ML recalc + LLM.
            <br/><strong>Drop urgent (5%)</strong>: Check straordinario.
          </Card>
          <Card title="🧠 Learning Loop Attivo" color="#06b6d4">
            <strong>✅ LIVE cron domenica 07:00</strong>. Analizza decisioni 30 giorni,
            calcola exit accuracy, auto-aggiusta soglie exit_confluence + exit_ml.
            Report Telegram automatico.
          </Card>
        </div>
      </Section>

      {/* 6. DPS + Kelly (NEW SECTION) */}
      <Section emoji="💰" title="6. Dynamic Position Sizing (DPS) + Kelly Criterion 🆕 v4.2">
        <div style={{ background: 'linear-gradient(135deg, #3a2f0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #eab308' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#eab308', fontSize: 15 }}>💰 Sizing Intelligente a TRIPLA Intelligenza</strong>
            <br/><br/>
            Sostituisce il sizing fisso (12% ogni trade) con formula dinamica basata sulla qualità del trade
            E sul track record del sistema:
            <br/><br/>
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#eab308' }}>
              Size = Base 12% × DPS × Kelly
              <br/><br/>
              DPS = R/R_multiplier × ML_multiplier × Confluence_multiplier
              <br/>
              Kelly = Fractional_Kelly × Volatility_Adjustment
            </div>
            <br/>
            <strong style={{ color: '#22c55e' }}>Esempio</strong>: Trade eccellente (R/R 3.5, ML 90%, Conf 65) con sistema winning + VIX normale
            → 12% × 1.55 × 1.2 = <strong>22% size</strong>.
            <br/>
            Trade mediocre (R/R 1.2, ML 55%, Conf 40) con VIX alto
            → 12% × 0.7 × 0.7 × 0.85 = <strong>5% size</strong>.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎯 R/R Multiplier (0.5-1.4x)" color="#22c55e">
            R/R 0.5 → 0.5x | R/R 1.5 → 0.7x | R/R 2.5 → 1.0x | R/R 3.5 → 1.3x.
            Premia trade con reward/risk favorevole.
          </Card>
          <Card title="🧠 ML Multiplier (0.7-1.3x)" color="#8b5cf6">
            ML 40% → 0.7x | ML 60% → 0.9x | ML 75% → 1.0x | ML 90% → 1.2x.
            Boost proporzionale al confidence del modello XGBoost.
          </Card>
          <Card title="🎯 Confluence Multiplier (0.7-1.3x)" color="#3b82f6">
            Conf 30 → 0.7x | Conf 45 → 0.9x | Conf 55 → 1.0x | Conf 70 → 1.3x.
            Premia setup tecnici con più fattori allineati.
          </Card>
          <Card title="💰 Kelly Criterion (Fractional)" color="#eab308">
            <strong>Formula</strong>: Kelly% = (WR × avg_win - LR × avg_loss) / avg_win
            <br/>Fractional Kelly = Kelly% × 0.25 (safety standard hedge fund).
            <br/><strong>Attivo solo con &gt;20 trade chiusi</strong>.
          </Card>
          <Card title="📉 Volatility Adjustment (VIX)" color="#ef4444">
            VIX Low/Normal → 1.0x | VIX High → 0.85x | VIX Extreme → 0.7x.
            Riduce sizing in mercati instabili automaticamente.
          </Card>
          <Card title="🛡️ Safety Net" color="#06b6d4">
            Se &lt; 20 trade → Kelly skippa (1.0x), usa solo DPS.
            Fractional 0.25 protegge da overbetting anche con Kelly alto.
            Cap max 20% per posizione hard-coded.
          </Card>
        </div>
      </Section>

      {/* 7. ML */}
      <Section emoji="🧠" title="7. Machine Learning Integration">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎲 XGBoost WIN/LOSS Classifier" color="#8b5cf6">
            15 features. Output: WIN/LOSS con score 0-100 e confidence. Contribuzione fino a +2.5 punti al Confluence.
            Usato anche da DPS per ML multiplier.
          </Card>
          <Card title="📈 Trend Predictor 5D" color="#3b82f6">
            20 features da price bars. Output: UP/FLAT/DOWN a 5 giorni. Contribuzione fino a +2.0 punti.
            Training: 13,680 samples da 249 stock.
          </Card>
          <Card title="🔍 ML Health Check" color="#22c55e">
            Endpoint /api/ml/debug/health per monitoring continuo.
            Detect predizioni flat, varianza bassa, feature quality.
          </Card>
          <Card title="🔄 Adaptive Learning Loop" color="#eab308">
            Ogni agente ha metodo learn() che analizza trade passati con time decay a 60 giorni.
            APM Learning cron settimanale attivo.
          </Card>
        </div>
      </Section>

      {/* 8. LLM */}
      <Section emoji="💬" title="8. LLM Reasoning (Multi-Provider)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🥇 Gemini 2.0 Flash" color="#4285f4">Google Gemini API. Free tier 1,500 requests/day.</Card>
          <Card title="🥈 Groq (Llama 3)" color="#f97316">Ultra-veloce (~200 tokens/sec). Fallback automatico.</Card>
          <Card title="🥉 Cerebras" color="#22c55e">Terzo fallback per uptime garantito.</Card>
          <Card title="💾 Cache & Cooldown" color="#8b5cf6">Cache per ticker. Cooldown separato per agente e ticker.</Card>
          <Card title="🧠 Cross-Agent Reasoning" color="#06b6d4">APM legge Macro. Executor legge Macro + Risk + APM.</Card>
          <Card title="🌐 Reasoning Italiano" color="#84cc16">Ogni decisione spiegata in italiano per trasparenza.</Card>
        </div>
      </Section>

      {/* 9. Execution */}
      <Section emoji="📦" title="9. Order Execution & Risk Protection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="💵 Notional Buy (Fractional)" color="#3b82f6">
            Compra in dollari con sizing dinamico DPS+Kelly. Fractional shares support.
          </Card>
          <Card title="🎯 3-Step Buy Flow" color="#22c55e">
            place_notional_buy → wait_for_fill → place SL + TP. Recalc se slippage &gt; 3%.
          </Card>
          <Card title="🛡️ Software SL/TP" color="#f97316">
            Con break-even detection (SL = entry post scale-out = valido, non skip).
            Controllo ad ogni pipeline (15 min).
          </Card>
          <Card title="🟡 Partial Close REAL" color="#8b5cf6">
            <strong>🆕 v4.2</strong>: APM SCALE_OUT chiude realmente X shares su Alpaca
            via DELETE /positions?qty=X. Break-even SL automatico sul restante.
          </Card>
          <Card title="🧯 Sanity Checks Multi-Layer" color="#ef4444">
            Alpha valida SL/TP. Executor recalc post-fill. Software SL/TP skip se invalidi.
          </Card>
          <Card title="🔄 Trade Sync v5" color="#06b6d4">
            Sincronizzazione automatica Alpaca ↔ MongoDB. Anti-mismatch fractional/integer.
          </Card>
        </div>
      </Section>

      {/* 10. Analytics */}
      <Section emoji="📈" title="10. Analytics & Automation">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📊 Performance Analytics" color="#22c55e">
            Sharpe, Sortino, Profit Factor, Expectancy, Max Drawdown, Win Rate, Monthly P&L.
          </Card>
          <Card title="📉 Benchmark vs SPY" color="#3b82f6">
            Confronto equity vs SPY su periodi selezionabili. Alpha automatico.
          </Card>
          <Card title="🧬 APM Learning Loop" color="#8b5cf6">
            <strong>✅ Live domenica 07:00</strong>. Auto-tuning soglie con report Telegram.
          </Card>
          <Card title="🎯 Decision Log" color="#eab308">
            Ogni decisione salvata con contesto completo. Base per retrain ML.
          </Card>
          <Card title="🔔 Telegram Bot" color="#f97316">
            @swinglab_alert_bot: buy/sell, APM actions, urgent triggers, morning briefing, evening report.
          </Card>
          <Card title="📱 Frontend React" color="#06b6d4">
            Dashboard + TradingView charts + APM widget + trade history + settings live.
          </Card>
        </div>
      </Section>

      {/* 11. Tech Stack */}
      <Section emoji="⚙️" title="11. Tech Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="Backend" color="#3b82f6">Python 3.11 + FastAPI + Motor + XGBoost + scikit-learn + httpx</Card>
          <Card title="Frontend" color="#22c55e">React 19 + Recharts + TradingView Widget + Vercel</Card>
          <Card title="Database" color="#eab308">MongoDB Atlas (Free M0). Collections indexed.</Card>
          <Card title="Broker" color="#f97316">Alpaca Paper Trading API v2. Fractional + partial close support.</Card>
          <Card title="LLM" color="#8b5cf6">Gemini 2.0 Flash + Groq Llama 3 + Cerebras fallback.</Card>
          <Card title="Market Data" color="#06b6d4">Twelve Data (800 req/day) + TradingView (unlimited charts).</Card>
          <Card title="Deploy Backend" color="#ef4444">Render.com async endpoint. swinglab-backend.onrender.com</Card>
          <Card title="Deploy Frontend" color="#84cc16">Vercel con auto-deploy da GitHub.</Card>
          <Card title="Automation" color="#f59e0b">
            cron-job.org: Pipeline 15 min + APM Urgent 15 min + APM Full 1h + Learning weekly + Telegram briefing.
          </Card>
        </div>
      </Section>

      {/* 12. Roadmap */}
      <Section emoji="🚀" title="12. Roadmap Futura">
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf620 0%, #3b82f620 100%)',
          borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid #8b5cf644',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>👥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Multi-User Platform (v5.0)</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>SwingLab as a Service — Q3 2026</div>
            </div>
            <span style={{
              marginLeft: 'auto', background: '#8b5cf6', color: 'white',
              padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            }}>IN ROADMAP</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, marginTop: 8 }}>
            Piattaforma multi-tenant dove ogni utente ha il suo account Alpaca personale,
            portfolio isolato, settings customizzati, e trade history separata.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="✅ Completato v4.2" color="#22c55e">
            APM Learning Loop, Multi-Target REAL, DPS + Kelly, MacroAnalyst v2.0,
            TradingView charts, Urgent triggers.
          </Card>
          <Card title="🎯 Prossimo (Agosto)" color="#eab308">
            <strong>Backtesting Engine</strong>: validi strategie su dati storici.
            <br/><strong>Extended Hours</strong>: pre/after market trading.
            <br/><strong>Universe 500 stocks</strong>: espansione mid-cap.
          </Card>
          <Card title="🎯 Medium Term" color="#3b82f6">
            <strong>News X/Reddit</strong>: signal aggiuntivi.
            <br/><strong>Trade Journal</strong>: notes + tags per pattern.
            <br/><strong>Options detection</strong>: Unusual Activity.
          </Card>
          <Card title="🎯 Long Term (2027)" color="#8b5cf6">
            <strong>v5.0 Multi-User</strong>: SaaS platform.
            <br/><strong>Multi-Broker</strong>: IB, Robinhood.
            <br/><strong>Mobile Apps</strong>: iOS + Android.
            <br/><strong>Options Trading</strong>: covered calls, spreads.
          </Card>
        </div>
      </Section>

      {/* 13. Glossary */}
      <Section emoji="📚" title="13. Glossario Tecnico">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {[
            ['APM', 'Adaptive Position Manager - Agente 5 con dual-level (15 min urgent + 1h full)'],
            ['DPS', '🆕 Dynamic Position Sizing con R/R + ML + Confluence multiplier'],
            ['Kelly Criterion', '🆕 Formula sizing basata su win rate + payoff. Fractional 0.25x safety'],
            ['Multi-Target REAL', '🆕 Partial close reale su Alpaca via DELETE /positions?qty=X'],
            ['POC', 'Point of Control: prezzo con maggior volume tradato'],
            ['VA High/Low', 'Value Area: range del 70% del volume totale'],
            ['RSI', 'Relative Strength Index (momentum 0-100)'],
            ['MACD', 'Moving Average Convergence Divergence'],
            ['EMA', 'Exponential Moving Average'],
            ['Wyckoff', 'Teoria 4 fasi (Accum/Markup/Distrib/Markdown)'],
            ['Spring', 'Signal Wyckoff rimbalzo da supporto'],
            ['FVG', 'Fair Value Gap: gap non riempiti'],
            ['Confluence Score', '15 fattori tecnici + ML pesati (0-100)'],
            ['R/R Ratio', 'Risk/Reward: rapporto reward/risk (target 1.5+)'],
            ['Notional Buy', 'Ordine in dollari (supporta fractional)'],
            ['Software SL/TP', 'Stop/Target gestiti dall\'Executor con break-even detection'],
            ['HOLD (APM)', 'APM mantiene la posizione'],
            ['SCALE_OUT (APM)', 'Partial close reale + break-even sul restante'],
            ['EXIT (APM)', 'Chiude 100% subito, tesi rotta'],
            ['TIGHTEN_STOP (APM)', 'Alza SL a -2% dal current price'],
            ['Urgent Trigger', '🆕 Check target hit ogni 15 min (bypass timer 1h)'],
            ['Volatility Adjustment', '🆕 Sizing ridotto se VIX High/Extreme'],
            ['Fractional Kelly', '🆕 Kelly% × 0.25 safety factor hedge fund standard'],
            ['Trailing Stop', 'Stop dinamico che segue il profit'],
            ['Setup Score', 'Punteggio 0-100 qualità pre-confluence'],
            ['Breadth', '% di stock sopra la EMA50'],
            ['Rotation Signal', 'offensive/defensive/mixed'],
            ['Regime', 'BULL/NEUTRAL/BEAR/CRASH (market state)'],
            ['Exposure Multiplier', 'Fattore 0-1 per riduzione risk per regime'],
            ['Shared Brain', 'MongoDB collection condivisa tra 5 agenti'],
            ['LLM Reasoning', 'Spiegazione italiana di ogni decisione'],
            ['XGBoost', 'ML per predire WIN/LOSS trade'],
            ['Trend Predictor', 'ML classifica UP/FLAT/DOWN a 5 giorni'],
            ['ML Score', 'Probabilità WIN 0-100% dal modello XGBoost'],
            ['News Sentiment', 'LLM valuta headlines (POS/NEU/NEG)'],
            ['Trade Sync v5', 'Anti-mismatch fractional/integer Alpaca ↔ MongoDB'],
            ['TradingView', '🆕 Widget chart professionale integrato'],
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
          🚀 <strong style={{ color: 'white' }}>SwingLab v4.2</strong> — Multi-Agent AI Trading Platform
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          APM Dual-Level · DPS + Kelly Criterion · Multi-Target REAL · MacroAnalyst v2.0 · TradingView Charts · 100% Automated
        </div>
      </div>
    </div>
  );
}
