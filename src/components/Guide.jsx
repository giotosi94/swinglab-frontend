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
      {/* ---- HEADER ---- */}
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
            v4.0 with APM
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>
          <strong style={{ color: 'white' }}>SwingLab v4.0</strong> è una piattaforma di <strong style={{ color: '#3b82f6' }}>swing trading algoritmico</strong> con
          architettura <strong style={{ color: '#22c55e' }}>Multi-Agent AI a 5 agenti</strong>. Combina agenti autonomi coordinati da uno Shared Brain,
          modelli Machine Learning (XGBoost + Trend Predictor), analisi tecnica multi-fattore (15 indicatori),
          LLM reasoning in italiano (Gemini + Groq), news sentiment analysis, e — novità v4.0 — l'
          <strong style={{ color: '#8b5cf6' }}> Adaptive Position Manager (APM)</strong> che rivaluta ogni 3h le posizioni aperte
          decidendo dinamicamente HOLD, SCALE OUT, EXIT o TIGHTEN STOP con reasoning italiano.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 5 Multi-Agent AI</span>
          <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ APM Adaptive</span>
          <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ ML Integration</span>
          <span style={{ background: '#eab30820', color: '#eab308', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ LLM Reasoning</span>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Software SL/TP</span>
          <span style={{ background: '#06b6d420', color: '#06b6d4', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 24/7 Automation</span>
          <span style={{ background: '#84cc1620', color: '#84cc16', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Fractional Trading</span>
        </div>
      </div>

      {/* ---- 0. Key Metrics ---- */}
      <Section emoji="📊" title="0. Sistema in Numeri (v4.0)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Metric label="Universo Stock" value="226" color="#3b82f6" />
          <Metric label="Settori SPDR" value="11" color="#22c55e" />
          <Metric label="Macro Indicators" value="19" color="#eab308" />
          <Metric label="Fattori Confluence" value="15" color="#f97316" />
          <Metric label="Agenti AI" value="5" color="#8b5cf6" />
          <Metric label="ML Models" value="2" color="#ef4444" />
          <Metric label="LLM Providers" value="3" color="#06b6d4" />
          <Metric label="Uptime" value="24/7" color="#22c55e" />
        </div>
      </Section>

      {/* ---- 1. Data Sources ---- */}
      <Section emoji="📡" title="1. Data Sources & Universo di Trading">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📈 226 Stock S&P" color="#3b82f6">
            20 stock per ognuno degli 11 settori SPDR + assets extra. Dati OHLCV storici da Alpaca IEX,
            prezzi real-time da Twelve Data.
          </Card>
          <Card title="🏛 11 Settori SPDR" color="#22c55e">
            XLK (Tech), XLF (Financials), XLV (Health), XLI (Industrials), XLY (Discretionary),
            XLP (Staples), XLE (Energy), XLU (Utilities), XLB (Materials), XLRE (Real Estate), XLC (Communications).
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
          <Card title="💰 Alpaca Paper Trading" color="#8b5cf6">
            Broker paper trading con supporto fractional shares, portfolio history, real-time quotes IEX.
          </Card>
        </div>
      </Section>

      {/* ---- 2. Indicatori Tecnici ---- */}
      <Section emoji="📊" title="2. Analisi Tecnica Multi-Fattore">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="RSI (14)" color="#3b82f6">
            Sweet spot per entry: 40-60. Reversal opportunity: 30-40.
          </Card>
          <Card title="MACD" color="#22c55e">
            Histogram &gt; 0 = momentum positivo. Crossover linea segnale = buy/sell signal.
          </Card>
          <Card title="EMA (10/20/50)" color="#eab308">
            Full Align: Price &gt; EMA10 &gt; EMA20 &gt; EMA50 = uptrend perfetto.
          </Card>
          <Card title="Volume Profile (POC + VA)" color="#f97316">
            POC (Point of Control), VA High/Low (Value Area 70%). Target/Stop ibridi.
          </Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">
            Accumulation → Markup → Distribution → Markdown. Spring = strong bullish signal (+2.0 punti).
          </Card>
          <Card title="Candlestick & FVG" color="#ef4444">
            Pattern: Hammer, Engulfing, Doji, Morning/Evening Star. Fair Value Gap non riempiti.
          </Card>
          <Card title="Accumulation Score" color="#06b6d4">
            Punteggio 0-100 accumulo istituzionale in base a volume + price action.
          </Card>
          <Card title="Range Position 52W" color="#84cc16">
            &lt; 30% = value zone, &gt; 70% = near high (momentum).
          </Card>
        </div>
      </Section>

      {/* ---- 3. Confluence Scoring ---- */}
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
              background: '#0f172a',
              borderRadius: 6,
              padding: '8px 10px',
              borderLeft: `2px solid ${f.color}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 11,
            }}>
              <span style={{ color: 'white' }}>{f.name}</span>
              <span style={{ color: f.color, fontWeight: 700 }}>+{f.max}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- 4. Architettura Multi-Agent v4.0 ---- */}
      <Section emoji="🤖" title="4. Architettura Multi-Agent AI v4.0 (5 Agenti)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, textAlign: 'center', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6' }}>5 agenti AI indipendenti</strong> operano in pipeline sequenziale,
            comunicano tramite <strong style={{ color: '#8b5cf6' }}>Shared Brain (MongoDB)</strong>,
            e leggono il reasoning degli altri per decisioni contestuali.
          </div>

          {/* Visual Flow */}
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

        {/* Agent Detail Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst" color="#3b82f6">
            Analizza 19 indicatori macro. Determina regime (BULL/NEUTRAL/BEAR/CRASH), exposure multiplier,
            rotation signal. LLM Reasoning in italiano letto da tutti gli altri agenti.
          </Card>
          <Card title="🎯 AlphaStrategist v2.0" color="#22c55e">
            Confluence Score 15 fattori (13 rules + 2 ML). Filtra per RSI, volume smart, setup type,
            sector limit. LLM analizza top 5 candidati con pro/contro.
          </Card>
          <Card title="🛡 RiskManager" color="#eab308">
            Approva/rifiuta trade in base a R/R ratio, max positions, sector limits, cash reserve.
            Calcola notional sizing (12% per posizione).
          </Card>
          <Card title="🎯 APM v1.0 (NEW!)" color="#8b5cf6">
            <strong>Novità v4.0</strong>. Rivaluta le posizioni aperte ogni 3h. Decide:
            <br/>• 🟢 <strong>HOLD</strong> — tesi valida
            <br/>• 🟡 <strong>SCALE_OUT</strong> — chiudi parziale al target
            <br/>• 🔴 <strong>EXIT</strong> — tesi rotta, esci subito
            <br/>• 🛡️ <strong>TIGHTEN_STOP</strong> — proteggi profit
            <br/>LLM reasoning italiano per ogni decisione.
          </Card>
          <Card title="⚡ Executor v3.4" color="#f97316">
            Notional buy (fractional shares) + recalc post-fill se slippage &gt; 3%.
            Software SL/TP (Alpaca non supporta bracket+fractional), trailing 3 livelli, Trade Sync v5.
          </Card>
        </div>
      </Section>

      {/* ---- 5. APM Deep Dive ---- */}
      <Section emoji="🎯" title="5. APM — Adaptive Position Manager (v4.0 novità)">
        <div style={{ background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6', fontSize: 15 }}>🎯 La rivoluzione di v4.0</strong>
            <br/><br/>
            Prima di APM, il sistema comprava con target/stop fissi e aspettava passivamente.
            Ora l'APM <strong>rivaluta ogni 3h</strong> ogni posizione confrontando le condizioni attuali con quelle originali:
            <br/><br/>
            <strong style={{ color: '#8b5cf6' }}>Se la tesi è ancora valida</strong> → HOLD (mantiene)
            <br/>
            <strong style={{ color: '#8b5cf6' }}>Se il profit è alto ma il momentum cala</strong> → SCALE_OUT (chiude parziale) o TIGHTEN_STOP (protegge)
            <br/>
            <strong style={{ color: '#8b5cf6' }}>Se la tesi è rotta</strong> → EXIT immediato (non aspetta il SL)
            <br/><br/>
            Ogni decisione ha <strong>LLM reasoning italiano</strong> e viene salvata per learning futuro.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🟢 HOLD" color="#22c55e">
            <strong>Condizione</strong>: Confluence originale ancora &gt; 50, ML predice ancora WIN, nessuna news negativa.
            <br/><strong>Azione</strong>: Mantiene posizione, aspetta target o SL naturale.
          </Card>
          <Card title="🟡 SCALE_OUT" color="#eab308">
            <strong>Condizione</strong>: Profit raggiunge target (5%, 10%, 20% configurabili).
            <br/><strong>Azione</strong>: Chiude 50% al T1, 30% al T2, 20% al T3. Break-even sul resto.
          </Card>
          <Card title="🔴 EXIT" color="#ef4444">
            <strong>Condizione</strong>: Confluence crolla sotto 30, ML predice DOWN forte, o 2+ fattori negativi.
            <br/><strong>Azione</strong>: Chiude 100% posizione, non aspetta SL. Meglio piccola perdita che grossa.
          </Card>
          <Card title="🛡️ TIGHTEN_STOP" color="#f97316">
            <strong>Condizione</strong>: Profit &gt; 3% ma ML predice inversione o volatilità aumenta.
            <br/><strong>Azione</strong>: Alza SL vicino al current price per proteggere profit.
          </Card>
          <Card title="⏰ Frequency" color="#3b82f6">
            <strong>Timer</strong>: 3 ore (configurabile 1-8h). Bilanciato per non essere nervoso.
            <br/><strong>Urgent</strong>: Se drop &gt; 5% in 1h → check immediato (bypass timer).
          </Card>
          <Card title="🧠 Learning Loop (weekend prossimo)" color="#06b6d4">
            <strong>FASE 3</strong>: Auto-tuning settimanale delle soglie basato su outcome delle decisioni passate.
            Sistema che <strong>impara dai propri errori</strong>.
          </Card>
        </div>
      </Section>

      {/* ---- 6. ML Integration ---- */}
      <Section emoji="🧠" title="6. Machine Learning Integration">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎲 XGBoost WIN/LOSS Classifier" color="#8b5cf6">
            15 features (RSI, MACD, EMA, volume, POC, Wyckoff, accumulation, confluence).
            Output: WIN/LOSS con score 0-100 e confidence. Contribuzione fino a +2.5 punti al Confluence Score.
            Retrain automatico con nuovi trade chiusi.
          </Card>
          <Card title="📈 Trend Predictor 5D" color="#3b82f6">
            20 features da price bars: range, returns, volatility, EMA alignments.
            Output: UP/FLAT/DOWN a 5 giorni con probabilità. Contribuzione fino a +2.0 punti (UP forte).
            Training: 13,680 samples da 249 stock.
          </Card>
          <Card title="🔍 ML Health Check" color="#22c55e">
            Endpoint /api/ml/debug/health per monitoring continuo.
            Detect predizioni "flat", varianza troppo bassa, feature quality, training data quality.
          </Card>
          <Card title="🔄 Adaptive Learning Loop" color="#eab308">
            Ogni agente ha metodo learn() che analizza trade passati con time decay a 60 giorni.
            Aggiorna parametri automaticamente.
          </Card>
        </div>
      </Section>

      {/* ---- 7. LLM Reasoning ---- */}
      <Section emoji="💬" title="7. LLM Reasoning (Gemini + Groq)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🥇 Provider Primario: Gemini 2.0 Flash" color="#4285f4">
            Google Gemini API. Free tier 1,500 requests/day.
          </Card>
          <Card title="🥈 Provider Fallback: Groq (Llama 3)" color="#f97316">
            Ultra-veloce (~200 tokens/sec). Attivato automaticamente quando Gemini esaurisce quota.
          </Card>
          <Card title="🥉 Terzo Fallback: Cerebras" color="#22c55e">
            Fallback ulteriore per garantire uptime LLM.
          </Card>
          <Card title="💾 Cache & Cooldown Intelligente" color="#8b5cf6">
            Sistema cache per ticker (evita analisi duplicate). Cooldown separato per agente e ticker.
          </Card>
          <Card title="🧠 Reasoning Cross-Agente" color="#06b6d4">
            APM legge reasoning di Macro. Executor legge Macro + Risk + APM. AI multi-livello.
          </Card>
          <Card title="🌐 Reasoning Italiano" color="#84cc16">
            Ogni decisione ha spiegazione in italiano per trasparenza totale.
          </Card>
        </div>
      </Section>

      {/* ---- 8. Order Execution ---- */}
      <Section emoji="📦" title="8. Order Execution & Risk Protection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="💵 Notional Buy (Fractional)" color="#3b82f6">
            Compra in dollari invece che shares intere. Sizing preciso e diversificazione.
          </Card>
          <Card title="🎯 3-Step Buy Flow" color="#22c55e">
            place_notional_buy → wait_for_fill → place SL + TP. Recalc se slippage &gt; 3%.
          </Card>
          <Card title="🛡️ Software SL/TP" color="#f97316">
            Alpaca non supporta SL/TP nativi con fractional. Executor gestisce software-only con controllo ogni run.
          </Card>
          <Card title="📈 Trailing Stops 3-Level" color="#8b5cf6">
            L1 profit &gt; +5% → break-even. L2 &gt; +8% → entry +4%. L3 &gt; +12% → entry +8%.
          </Card>
          <Card title="🧯 Sanity Checks Multi-Layer" color="#ef4444">
            AlphaStrategist valida SL/TP. Executor recalc post-fill. Software SL/TP skip se invalidi.
          </Card>
          <Card title="🔄 Trade Sync v5" color="#06b6d4">
            Sincronizzazione automatica Alpaca ↔ MongoDB. Anti-mismatch fractional/integer.
          </Card>
        </div>
      </Section>

      {/* ---- 9. Analytics & Learning ---- */}
      <Section emoji="📈" title="9. Analytics & Adaptive Learning">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📊 Performance Analytics" color="#22c55e">
            Sharpe, Sortino, Profit Factor, Expectancy, Max Drawdown, Win Rate, Monthly P&L.
          </Card>
          <Card title="📉 Benchmark vs SPY" color="#3b82f6">
            Confronto equity vs SPY su periodi selezionabili. Calcolo Alpha automatico.
          </Card>
          <Card title="🧬 Learning Loop" color="#8b5cf6">
            Ogni agente ha learn() che aggiusta parametri con time decay 60 giorni.
          </Card>
          <Card title="🎯 Decision Log" color="#eab308">
            Ogni decisione salvata con contesto completo. Base dati per retrain ML.
          </Card>
          <Card title="🔔 Notifiche Telegram" color="#f97316">
            Bot @swinglab_alert_bot per: buy/sell, trailing stop, APM actions, morning briefing, evening report.
          </Card>
          <Card title="📱 Frontend React" color="#06b6d4">
            Dashboard con: portfolio overview, positions con SL/TP, multi-agent status, APM widget, trade history.
          </Card>
        </div>
      </Section>

      {/* ---- 10. Tech Stack ---- */}
      <Section emoji="⚙️" title="10. Tech Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="Backend" color="#3b82f6">
            Python 3.11 + FastAPI + Motor (MongoDB async) + XGBoost + scikit-learn + httpx
          </Card>
          <Card title="Frontend" color="#22c55e">
            React 19 + Recharts + Vercel deployment
          </Card>
          <Card title="Database" color="#eab308">
            MongoDB Atlas (Free M0). Collections indexed per performance.
          </Card>
          <Card title="Broker" color="#f97316">
            Alpaca Paper Trading API v2. Fractional shares supported.
          </Card>
          <Card title="LLM" color="#8b5cf6">
            Gemini 2.0 Flash + Groq (Llama 3 70B) + Cerebras fallback.
          </Card>
          <Card title="Market Data" color="#06b6d4">
            Twelve Data API (800 requests/day free tier).
          </Card>
          <Card title="Deploy Backend" color="#ef4444">
            Render.com (async endpoint per no timeout). URL: swinglab-backend.onrender.com
          </Card>
          <Card title="Deploy Frontend" color="#84cc16">
            Vercel con auto-deploy da GitHub.
          </Card>
          <Card title="Automation" color="#f59e0b">
            cron-job.org free tier. Pipeline ogni 15 min + APM ogni 3h + Telegram briefing/report.
          </Card>
        </div>
      </Section>

      {/* ---- 11. Roadmap ---- */}
      <Section emoji="🚀" title="11. Roadmap Futura">
        {/* Multi-User Feature Highlight */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf620 0%, #3b82f620 100%)',
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          border: '1px solid #8b5cf644',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>👥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Multi-User Platform (v5.0)</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>SwingLab as a Service — Coming Q3 2026</div>
            </div>
            <span style={{
              marginLeft: 'auto',
              background: '#8b5cf6',
              color: 'white',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
            }}>
              IN ROADMAP
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, marginTop: 8 }}>
            Trasformazione di SwingLab in una <strong style={{ color: 'white' }}>piattaforma multi-tenant</strong> dove
            ogni utente ha il suo <strong style={{ color: '#22c55e' }}>account Alpaca personale</strong>,
            portfolio isolato, settings customizzati, e trade history separata.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🎯 Short Term (1-2 settimane)" color="#22c55e">
            <strong>FASE 3 APM</strong>: Learning Loop settimanale.
            <br/><strong>FASE 4 APM</strong>: Multi-target real execution.
            <br/><strong>Dynamic Position Sizing</strong>: Kelly + R/R + ML.
          </Card>
          <Card title="🎯 Medium Term (1 mese)" color="#eab308">
            <strong>Backtesting Engine</strong>: simulazione strategie storiche.
            <br/><strong>Extended Hours</strong>: 10:00-02:00 CET.
            <br/><strong>VXX Indicator</strong>: volatilità estrema.
          </Card>
          <Card title="🎯 Long Term (3-6 mesi)" color="#8b5cf6">
            <strong>Multi-User v5.0</strong>: piattaforma SaaS.
            <br/><strong>Multi-Broker</strong>: IB, Robinhood.
            <br/><strong>Options Trading</strong>: covered calls, spreads.
            <br/><strong>Mobile App</strong>: iOS + Android.
          </Card>
        </div>
      </Section>

      {/* ---- 12. Glossary ---- */}
      <Section emoji="📚" title="12. Glossario Tecnico">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {[
            ['APM', '🆕 Adaptive Position Manager - Agente 5 che gestisce posizioni aperte'],
            ['POC', 'Point of Control: prezzo con maggior volume tradato'],
            ['VA High/Low', 'Value Area: range del 70% del volume totale'],
            ['RSI', 'Relative Strength Index (momentum 0-100)'],
            ['MACD', 'Moving Average Convergence Divergence'],
            ['EMA', 'Exponential Moving Average'],
            ['Wyckoff', 'Teoria delle 4 fasi (Accum/Markup/Distrib/Markdown)'],
            ['Spring', 'Signal Wyckoff di rimbalzo forte da supporto'],
            ['FVG', 'Fair Value Gap: gap non riempiti nel prezzo'],
            ['Confluence Score', '15 fattori tecnici + ML pesati (0-100)'],
            ['R/R Ratio', 'Risk/Reward: rapporto reward/risk (target 1.5:1+)'],
            ['Notional Buy', 'Ordine in dollari, non shares (supporta fractional)'],
            ['Software SL/TP', 'Stop/Target gestiti dall\'Executor, non nativi Alpaca'],
            ['HOLD (APM)', 'APM mantiene la posizione, tesi valida'],
            ['SCALE_OUT (APM)', 'APM chiude parziale, break-even sul resto'],
            ['EXIT (APM)', 'APM chiude 100% subito, tesi rotta'],
            ['TIGHTEN_STOP (APM)', 'APM alza il SL per proteggere profit'],
            ['Trailing Stop', 'Stop dinamico che segue il profit'],
            ['Setup Score', 'Punteggio 0-100 sulla qualità pre-confluence'],
            ['Breadth', '% di stock sopra la EMA50 (market health)'],
            ['Rotation Signal', 'offensive/defensive/mixed (sector rotation)'],
            ['Regime', 'BULL/NEUTRAL/BEAR/CRASH (market state)'],
            ['Exposure Multiplier', 'Fattore 0-1 per riduzione risk per regime'],
            ['Shared Brain', 'MongoDB collection condivisa tra 5 agenti'],
            ['LLM Reasoning', 'Spiegazione italiana di ogni decisione'],
            ['XGBoost', 'Modello ML per predire WIN/LOSS trade'],
            ['Trend Predictor', 'ML che classifica UP/FLAT/DOWN a 5 giorni'],
            ['ML Score', 'Probabilità WIN 0-100% dal modello XGBoost'],
            ['News Sentiment', 'LLM valuta headlines (POS/NEU/NEG)'],
            ['Earnings Detection', 'LLM identifica trimestrali imminenti'],
            ['Time Decay', 'Peso ridotto per decisioni vecchie nel learning'],
            ['Trade Sync', 'Sincronizzazione Alpaca ↔ MongoDB automatica'],
          ].map(([t, d]) => (
            <div key={t} style={{ background: '#1e293b', borderRadius: 6, padding: 8, fontSize: 12 }}>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{t}</span>
              <span style={{ color: '#94a3b8' }}> — {d}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- FOOTER ---- */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)',
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
        border: '2px solid #8b5cf6',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
          🚀 <strong style={{ color: 'white' }}>SwingLab v4.0</strong> — Multi-Agent AI Swing Trading Platform with APM
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Built with ❤️ • Paper Trading Mode • Real Market Data • 100% Automated • Now with Adaptive Position Manager
        </div>
      </div>
    </div>
  );
}
