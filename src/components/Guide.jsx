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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>📖</span>
          <h2 style={{ margin: 0, fontSize: 24 }}>SwingLab — How It Works</h2>
          <span style={{
            background: '#3b82f620',
            color: '#3b82f6',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid #3b82f644',
          }}>
            v3.6
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>
          <strong style={{ color: 'white' }}>SwingLab</strong> è una piattaforma di <strong style={{ color: '#3b82f6' }}>swing trading algoritmico</strong> con
          architettura <strong style={{ color: '#22c55e' }}>Multi-Agent AI</strong>. Combina 4 agenti autonomi coordinati da uno Shared Brain,
          modelli Machine Learning (XGBoost + Trend Predictor), analisi tecnica multi-fattore (15 indicatori),
          LLM reasoning in italiano (Gemini + Groq), news sentiment analysis, ed esegue trade automatici via
          Alpaca Paper Trading con protezione software SL/TP integrata.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Multi-Agent AI</span>
          <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ ML Integration</span>
          <span style={{ background: '#eab30820', color: '#eab308', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ LLM Reasoning</span>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Software SL/TP</span>
          <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 24/7 Automation</span>
          <span style={{ background: '#06b6d420', color: '#06b6d4', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Fractional Trading</span>
        </div>
      </div>

      {/* ---- 0. Key Metrics ---- */}
      <Section emoji="📊" title="0. Sistema in Numeri">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Metric label="Universo Stock" value="220" color="#3b82f6" />
          <Metric label="Settori SPDR" value="11" color="#22c55e" />
          <Metric label="Macro Indicators" value="19" color="#eab308" />
          <Metric label="Fattori Confluence" value="15" color="#f97316" />
          <Metric label="Agenti AI" value="4" color="#8b5cf6" />
          <Metric label="ML Models" value="2" color="#ef4444" />
          <Metric label="LLM Providers" value="2" color="#06b6d4" />
          <Metric label="Uptime" value="24/7" color="#22c55e" />
        </div>
      </Section>

      {/* ---- 1. Data Sources ---- */}
      <Section emoji="📡" title="1. Data Sources & Universo di Trading">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📈 220 Stock S&P" color="#3b82f6">
            20 stock per ognuno degli 11 settori SPDR. Dati OHLCV storici da Alpaca IEX,
            prezzi real-time da Twelve Data (800 chiamate/giorno).
          </Card>
          <Card title="🏛 11 Settori SPDR" color="#22c55e">
            XLK (Tech), XLF (Financials), XLV (Health), XLI (Industrials), XLY (Discretionary),
            XLP (Staples), XLE (Energy), XLU (Utilities), XLB (Materials), XLRE (Real Estate), XLC (Communications).
            Ranking dinamico per composite score.
          </Card>
          <Card title="🌍 10 Macro ETF" color="#eab308">
            <strong>Bonds</strong>: TLT, HYG, LQD | <strong>Commodities</strong>: GLD, USO |
            <strong> Breadth</strong>: RSP, IWO | <strong>Volatilità</strong>: VIXY, VXX |
            <strong> Emerging</strong>: EEM | <strong>Transport</strong>: IYT
          </Card>
          <Card title="🪙 Crypto & FX" color="#f97316">
            BTC/USD, ETH/USD (crypto sentiment risk-on/off), FXE (Euro),
            UUP (Dollar strength). Real-time da Alpaca.
          </Card>
          <Card title="📰 News & Sentiment" color="#06b6d4">
            Alpaca News API fornisce headlines per ogni stock. LLM (Gemini/Groq) analizza sentiment
            (POSITIVO/NEUTRO/NEGATIVO) ed earnings imminenti.
          </Card>
          <Card title="💰 Alpaca Paper Trading" color="#8b5cf6">
            Broker per esecuzione trade in modalità paper (soldi finti, dati reali). Supporta fractional shares
            (comprare $100 invece che 1 share). Portfolio history dal giorno 1.
          </Card>
        </div>
      </Section>

      {/* ---- 2. Indicatori Tecnici ---- */}
      <Section emoji="📊" title="2. Analisi Tecnica Multi-Fattore">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="RSI (14)" color="#3b82f6">
            0-30 = Oversold | 30-70 = Normale | 70-100 = Overbought.
            Sweet spot per entry: <strong>40-60</strong>. Reversal opportunity: 30-40.
          </Card>
          <Card title="MACD" color="#22c55e">
            Histogram {'>'} 0 = momentum positivo. Crossover linea segnale =
            buy/sell signal. Visualizzato come istogramma sul chart.
          </Card>
          <Card title="EMA (10/20/50)" color="#eab308">
            <strong>Full Align</strong>: Price {'>'} EMA10 {'>'} EMA20 {'>'} EMA50 = uptrend perfetto.
            <strong>Partial</strong>: Price {'>'} EMA20 {'>'} EMA50 = trend valido ma non ottimale.
          </Card>
          <Card title="Volume Profile (POC + VA)" color="#f97316">
            <strong>POC</strong>: Point of Control (prezzo più tradato) = supporto/resistenza forte.
            <strong>VA High/Low</strong>: Value Area = zona del 70% del volume. Target/Stop ibridi.
          </Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">
            <strong>Accumulation → Markup → Distribution → Markdown</strong>.
            Signal: <strong>Spring</strong> (rimbalzo forte da supporto) = strong_bullish (+2.0 punti confluence).
          </Card>
          <Card title="Candlestick & FVG" color="#ef4444">
            Pattern: Hammer, Engulfing, Doji, Morning/Evening Star, Piercing Line.
            <strong>FVG (Fair Value Gap)</strong>: gap non riempiti dove il prezzo tende a tornare.
          </Card>
          <Card title="Accumulation Score" color="#06b6d4">
            Punteggio 0-100 che rileva accumulo istituzionale in base a volume + price action.
            {'>'} 70 = strong accumulation, {'>'} 40 = moderate.
          </Card>
          <Card title="Range Position 52W" color="#84cc16">
            Posizione del prezzo attuale rispetto al range 52 settimane.
            {'<'} 30% = value zone, {'>'} 70% = near high (momentum).
          </Card>
        </div>
      </Section>

      {/* ---- 3. Confluence Scoring ---- */}
      <Section emoji="🎯" title="3. Confluence Score — Il Motore Decisionale">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            L'AlphaStrategist calcola per ogni stock un <strong style={{ color: '#22c55e' }}>Confluence Score</strong> (0-100)
            basato su <strong>15 fattori pesati</strong>. Solo i candidati sopra la soglia minima (default 35) diventano
            buy opportunity. I fattori sono divisi in <strong style={{ color: '#3b82f6' }}>13 Rule-Based</strong> e
            <strong style={{ color: '#8b5cf6' }}> 2 ML-Powered</strong>.
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
        <div style={{ marginTop: 12, padding: 12, background: '#0f172a', borderRadius: 8, fontSize: 11, color: '#64748b' }}>
          <strong style={{ color: '#94a3b8' }}>Max Raw Score:</strong> 19.5 punti → normalizzato a 0-100.
          Sistema di pesi <strong>configurabili e adattivi</strong> tramite learning loop:
          fattori che portano più profit vengono premiati nel tempo.
        </div>
      </Section>

      {/* ---- 4. I 4 Agenti AI ---- */}
      <Section emoji="🤖" title="4. Architettura Multi-Agent AI">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, textAlign: 'center', lineHeight: 1.7 }}>
            4 agenti AI <strong style={{ color: '#3b82f6' }}>indipendenti e autonomi</strong> operano in pipeline sequenziale,
            comunicano tramite <strong style={{ color: '#8b5cf6' }}>Shared Brain (MongoDB)</strong>,
            e <strong style={{ color: '#22c55e' }}>leggono il reasoning degli altri</strong> per decisioni contestuali.
          </div>

          {/* Visual Flow */}
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {Object.entries(AGENT_INFO).map(([name, info], i) => (
                <React.Fragment key={name}>
                  {i > 0 && <div style={{ color: '#475569', fontSize: 20 }}>→</div>}
                  <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 14px', border: `2px solid ${info.color}`, textAlign: 'center', minWidth: 110 }}>
                    <div style={{ fontSize: 18 }}>{info.emoji}</div>
                    <div style={{ color: 'white', fontSize: 11, fontWeight: 700, marginTop: 2 }}>{info.name}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', margin: '8px 0' }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 12 }}>🧠 Shared Brain (MongoDB)</span>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                market state · candidates · approved trades · executions · LLM reasoning
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <span style={{ background: '#3b82f620', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#3b82f6' }}>🌍 Market Analysis</span>
              <span style={{ background: '#22c55e20', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#22c55e' }}>🎯 Stock Selection</span>
              <span style={{ background: '#eab30820', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#eab308' }}>🛡 Risk Management</span>
              <span style={{ background: '#f9731620', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#f97316' }}>⚡ Order Execution</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 10, color: '#64748b' }}>
              Pipeline eseguita <strong style={{ color: '#22c55e' }}>ogni 15 minuti</strong> tramite cron-job.org
              durante ore di mercato USA (15:30-22:00 CEST)
            </div>
          </div>

          {/* Communication Chain */}
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>🔗 Catena di Comunicazione (Esempi Reali)</div>
            {[
              { from: '🌍 Macro', to: '🎯 Alpha', msg: '"Regime NEUTRAL, rotation offensive, breadth 57%: focus su sector top rank"', color: '#3b82f6' },
              { from: '🎯 Alpha', to: '🛡 Risk', msg: '"Top pick TFC: confluence 66, ML WIN 89%, ma earnings imminenti"', color: '#22c55e' },
              { from: '🌍+🎯', to: '🛡 Risk', msg: '"Macro neutro + Alpha selettivo → riduce sizing al 12% per posizione"', color: '#eab308' },
              { from: '🌍+🛡', to: '⚡ Executor', msg: '"5 trade approvati con R/R medio 2.3, procedi con notional buy"', color: '#f97316' },
            ].map((flow, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 10, flexWrap: 'wrap' }}>
                <span style={{ color: flow.color, fontWeight: 700, minWidth: 100 }}>{flow.from} → {flow.to}</span>
                <span style={{ color: '#64748b', fontStyle: 'italic', flex: 1 }}>{flow.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Detail Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst" color="#3b82f6">
            Analizza <strong>19 indicatori macro</strong>: indici (SPY/QQQ/IWM/DIA), volatilità (VIXY),
            bonds & credit (TLT/HYG/LQD), commodities (GLD/USO), breadth (RSP), crypto, dollar strength,
            risk appetite (IWO/EEM/IYT). Determina regime (BULL/NEUTRAL/BEAR/CRASH), exposure multiplier,
            rotation signal. LLM Reasoning in italiano.
          </Card>
          <Card title="🎯 AlphaStrategist v2.0" color="#22c55e">
            Scansiona 220 stock e applica <strong>Confluence Score 15 fattori</strong> (13 rule-based + 2 ML).
            Filtra per RSI, volume smart, setup type, sector limit. Legge Macro reasoning + fetcha news + earnings.
            LLM analizza top 5 candidati con analisi dettagliata pro/contro. Target/Stop safety con validation.
          </Card>
          <Card title="🛡 RiskManager" color="#eab308">
            Approva/rifiuta trade in base a: R/R ratio ({'>'}1.5:1), max positions, max per sector,
            daily/weekly loss limits, cash reserve. Calcola <strong>notional sizing</strong> (12% per posizione)
            considerando exposure attuale. Legge Macro + Alpha reasoning per decisioni contestuali.
          </Card>
          <Card title="⚡ Executor v3.4" color="#f97316">
            Esegue trade via <strong>notional buy (fractional shares)</strong> con recalc post-fill
            se slippage {'>'} 3%. Gestisce <strong>Software SL/TP</strong> (Alpaca non supporta bracket + fractional),
            trailing stops a 3 livelli (break-even/+4%/+8%), Trade Sync v4 per posizioni chiuse,
            cancella ordini stale senza toccare SL/TP.
          </Card>
        </div>
      </Section>

      {/* ---- 5. ML Integration ---- */}
      <Section emoji="🧠" title="5. Machine Learning Integration">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            SwingLab integra <strong style={{ color: '#8b5cf6' }}>2 modelli ML</strong> nei processi decisionali
            dell'AlphaStrategist. Le predizioni sono <strong>on-the-fly</strong> (calcolate ad ogni run) e
            direttamente incorporate nel Confluence Score. I pesi ML sono <strong>conservativi</strong>
            per compensare la relativa novità dei modelli.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎲 XGBoost WIN/LOSS Classifier" color="#8b5cf6">
            <strong>15 features</strong>: RSI, MACD hist, EMA distances, volume, POC distance,
            accumulation score, Wyckoff signal, confluence pre-ML.
            <br/><strong>Output</strong>: WIN/LOSS con score 0-100 e confidence.
            <br/><strong>Contribuzione</strong>: fino a +2.5 punti al Confluence Score.
            <br/><strong>Training</strong>: 300 samples base (in crescita con trade reali).
          </Card>
          <Card title="📈 Trend Predictor 5D" color="#3b82f6">
            <strong>20 features</strong> da price bars: range, returns, volatility, EMA alignments.
            <br/><strong>Output</strong>: UP/FLAT/DOWN a 5 giorni con probabilità.
            <br/><strong>Contribuzione</strong>: fino a +2.0 punti (UP forte), -1.5 (DOWN forte).
            <br/><strong>Training</strong>: 13,680 samples da 249 stock. Accuracy 50.7%.
          </Card>
          <Card title="🔄 Adaptive Learning Loop" color="#22c55e">
            Ogni agente ha un metodo <strong>learn()</strong> che analizza trade passati (con time decay a 60 giorni)
            e aggiorna i propri parametri: pesi fattori, soglie R/R, best/worst setups, weak sectors, min confluence.
            Sistema evolutivo che migliora nel tempo.
          </Card>
          <Card title="📊 ML Contribution Tracking" color="#eab308">
            Ogni candidato mostra <strong>ml_contribution</strong> e <strong>rules_contribution</strong> separati.
            Trasparenza totale su quanto ML abbia influenzato la decisione.
            Permette test A/B pre/post ML integration.
          </Card>
        </div>
      </Section>

      {/* ---- 6. LLM Reasoning ---- */}
      <Section emoji="💬" title="6. LLM Reasoning (Gemini + Groq)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            Ogni agente produce un <strong style={{ color: '#eab308' }}>reasoning in italiano</strong>
            tramite LLM (Large Language Model). Non decide, ma <strong>spiega e contestualizza</strong>
            le decisioni prese dalle regole. Sistema con <strong>fallback multi-provider</strong>
            e cache intelligente per ottimizzare quote.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🥇 Provider Primario: Gemini 2.0 Flash" color="#4285f4">
            Google Gemini API, veloce e preciso. Free tier: 1,500 requests/day. Usato per la maggior parte del reasoning.
          </Card>
          <Card title="🥈 Provider Fallback: Groq (Llama 3)" color="#f97316">
            Groq API con Llama 3 70B. Attivato automaticamente quando Gemini esaurisce quota.
            Ultra-veloce (~200 tokens/sec).
          </Card>
          <Card title="💾 Cache & Cooldown" color="#22c55e">
            Sistema cache per prompts simili + cooldown per agente (Macro 25min, Alpha 12min, Risk 12min, Executor 8min).
            Riduce chiamate LLM di ~60%.
          </Card>
          <Card title="🧠 Reasoning Cross-Agente" color="#8b5cf6">
            Executor LLM legge reasoning di Macro e Risk dal Shared Brain per giustificare esecuzioni.
            Alpha LLM legge Macro per contestualizzare stock analysis. AI multi-livello.
          </Card>
        </div>
      </Section>

      {/* ---- 7. Shared Brain ---- */}
      <Section emoji="🧠" title="7. Shared Brain — Coordinamento Multi-Agent">
        <Card title="MongoDB Collection Condivisa" color="#8b5cf6">
          Il Shared Brain è un documento MongoDB unificato dove ogni agente scrive il suo output
          e legge quello degli altri. Permette agli agenti di essere <strong>autonomi ma coordinati</strong>,
          con reasoning LLM cross-agent accessibile a tutti.
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 10 }}>
          <Card title="📍 market" color="#3b82f6">
            <strong>Scritto da Macro</strong>. Contiene: regime, confidence, exposure multiplier, volatility,
            breadth %, rotation signal, sector rankings, LLM reasoning italiano.
          </Card>
          <Card title="🎯 candidates" color="#22c55e">
            <strong>Scritto da Alpha</strong>. Buy candidates con: confluence (rules + ML),
            target/stop safety-checked, ML predictions, LLM analysis per top 5.
          </Card>
          <Card title="✅ approved" color="#eab308">
            <strong>Scritto da Risk</strong>. Trade approvati con: notional sizing,
            R/R validation, sector distribution, risk report completo, LLM reasoning.
          </Card>
          <Card title="⚡ executions" color="#f97316">
            <strong>Scritto da Executor</strong>. Ordini eseguiti con: fill price reale,
            SL/TP finali, trailing stops attivi, Trade Sync v4, LLM reasoning esecutivo.
          </Card>
        </div>
      </Section>

      {/* ---- 8. Order Execution ---- */}
      <Section emoji="📦" title="8. Order Execution & Risk Protection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="💵 Notional Buy (Fractional Shares)" color="#3b82f6">
            Compra in <strong>dollari</strong> invece che shares intere.
            Esempio: $12,691 di V a $349.80 = <strong>36.23 shares frazionate</strong>.
            Permette sizing preciso e diversificazione anche con capitali medi.
          </Card>
          <Card title="🎯 3-Step Buy Flow" color="#22c55e">
            <strong>1.</strong> place_notional_buy → <strong>2.</strong> wait_for_fill (polling 15s max)
            → <strong>3.</strong> place SL + TP con qty reale del fill.
            Se slippage {'>'} 3% → auto-recalc target/stop.
          </Card>
          <Card title="🛡️ Software SL/TP" color="#f97316">
            Alpaca non supporta SL/TP con fractional shares. SwingLab gestisce
            <strong> software-only</strong>: l'Executor controlla ogni run se prezzo attuale
            supera SL o TP → chiude posizione. Latenza max 15 min (frequenza cron).
          </Card>
          <Card title="📈 Trailing Stops 3-Level" color="#8b5cf6">
            <strong>L1</strong>: profit {'>'} +5% → stop a break-even.
            <strong>L2</strong>: profit {'>'} +8% → stop a entry +4%.
            <strong>L3</strong>: profit {'>'} +12% → stop a entry +8%.
            Protezione dinamica del profit.
          </Card>
          <Card title="🧯 Sanity Checks Multi-Layer" color="#ef4444">
            <strong>Layer 1</strong>: AlphaStrategist valida SL {'<'} entry, TP {'>'} entry.
            <strong>Layer 2</strong>: Executor recalc post-fill se slippage rileva anomalia.
            <strong>Layer 3</strong>: Software SL/TP skip trigger se SL/TP invalidi.
          </Card>
          <Card title="🔄 Trade Sync v4" color="#06b6d4">
            Sincronizzazione automatica tra Alpaca (verità operativa) e MongoDB (verità analytics).
            Rileva chiusure esterne, calcola P&L reale, link sell → buy tramite sell_linked flag.
          </Card>
        </div>
      </Section>

      {/* ---- 9. Analytics & Learning ---- */}
      <Section emoji="📈" title="9. Analytics & Adaptive Learning">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📊 Performance Analytics" color="#22c55e">
            Sharpe, Sortino, Profit Factor, Expectancy, Max Drawdown, Win Rate, Monthly P&L,
            Win Rate per Regime/Giorno/Settore/Setup, Streaks, Holding Period.
          </Card>
          <Card title="📉 Benchmark vs SPY" color="#3b82f6">
            Confronto equity SwingLab vs SPY su periodi selezionabili (1D/1W/1M/3M/6M/1Y/YTD).
            Calcolo <strong>Alpha</strong> = extra return vs benchmark. Grafici professionali.
          </Card>
          <Card title="🧬 Learning Loop" color="#8b5cf6">
            Ogni agente ha <strong>learn()</strong> che analizza trade chiusi degli ultimi 30-90 giorni con time decay.
            Aggiusta parametri: pesi fattori, best/worst setups, weak sectors, soglie R/R.
          </Card>
          <Card title="🎯 Decision Log" color="#eab308">
            Ogni decisione di ogni agente è salvata in MongoDB con contesto completo,
            reasoning, confidence, e outcome (aggiornato retroattivamente).
            Base dati per retrain ML.
          </Card>
          <Card title="🔔 Notifiche Telegram" color="#f97316">
            Bot Telegram invia notifiche real-time per: buy/sell eseguiti,
            trailing stop scattato, market crash detection, daily summary.
          </Card>
          <Card title="📱 Frontend React" color="#06b6d4">
            Dashboard con: portfolio overview sync Alpaca, positions con SL/TP visibili,
            multi-agent status, sectors ranking, trade history, analytics, guide dettagliata.
          </Card>
        </div>
      </Section>

      {/* ---- 10. Tech Stack ---- */}
      <Section emoji="⚙️" title="10. Tech Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="Backend" color="#3b82f6">
            <strong>Python 3.11</strong> + FastAPI + Motor (MongoDB async) + XGBoost + scikit-learn + httpx (async HTTP)
          </Card>
          <Card title="Frontend" color="#22c55e">
            <strong>React 19</strong> + Recharts + Vercel deployment + responsive mobile-first
          </Card>
          <Card title="Database" color="#eab308">
            <strong>MongoDB Atlas</strong> (Free M0). Collections indexed per performance.
            Retention: trade_history unlimited, decisions 60 days.
          </Card>
          <Card title="Broker" color="#f97316">
            <strong>Alpaca Paper Trading</strong> API v2. Supporta fractional shares,
            portfolio history, real-time quotes IEX.
          </Card>
          <Card title="LLM" color="#8b5cf6">
            <strong>Gemini 2.0 Flash</strong> (Google) primary + <strong>Groq (Llama 3 70B)</strong> fallback.
          </Card>
          <Card title="Market Data" color="#06b6d4">
            <strong>Twelve Data</strong> API (800 requests/day free tier) per prezzi real-time e OHLCV storici.
          </Card>
          <Card title="Deploy Backend" color="#ef4444">
            <strong>Render.com</strong> (Free tier con async endpoint per non timeout).
            URL: swinglab-backend.onrender.com.
          </Card>
          <Card title="Deploy Frontend" color="#84cc16">
            <strong>Vercel</strong> con auto-deploy da GitHub. Domain custom disponibile.
          </Card>
          <Card title="Automation" color="#f59e0b">
            <strong>cron-job.org</strong> free tier con endpoint async.
            Pipeline ogni 15 min market hours + keep-alive ogni 10 min.
          </Card>
        </div>
      </Section>

      {/* ---- 11. Roadmap ---- */}
      <Section emoji="🚀" title="11. Roadmap Futura">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🎯 Short Term (1 mese)" color="#22c55e">
            <strong>ML Retrain</strong>: aumentare accuracy WIN/LOSS al 55%+.
            <br/><strong>VXX Indicator</strong>: volatilità estrema.
            <br/><strong>Extended Hours</strong>: trading 10:00-02:00 CET.
          </Card>
          <Card title="🎯 Medium Term (3 mesi)" color="#eab308">
            <strong>Multi-Broker</strong>: supporto IB, Robinhood.
            <br/><strong>Options Trading</strong>: strategie coperte.
            <br/><strong>Backtesting Engine</strong>: test strategie storiche.
          </Card>
          <Card title="🎯 Long Term (6-12 mesi)" color="#8b5cf6">
            <strong>Reinforcement Learning</strong>: Executor RL-based.
            <br/><strong>Social Sentiment</strong>: Twitter/Reddit analysis.
            <br/><strong>Custom Universe</strong>: stock list personalizzabile.
          </Card>
        </div>
      </Section>

      {/* ---- 12. Glossary ---- */}
      <Section emoji="📚" title="12. Glossario Tecnico">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {[
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
            ['Bracket Order', 'Ordine composto: entry + TP + SL (legacy)'],
            ['Trailing Stop', 'Stop dinamico che segue il profit'],
            ['Setup Score', 'Punteggio 0-100 sulla qualità pre-confluence'],
            ['Breadth', '% di stock sopra la EMA50 (market health)'],
            ['Rotation Signal', 'offensive/defensive/mixed (sector rotation)'],
            ['Regime', 'BULL/NEUTRAL/BEAR/CRASH (market state)'],
            ['Exposure Multiplier', 'Fattore 0-1 per riduzione risk per regime'],
            ['Shared Brain', 'MongoDB collection condivisa tra agenti'],
            ['LLM Reasoning', 'Spiegazione italiana di ogni decisione'],
            ['XGBoost', 'Modello ML per predire WIN/LOSS trade'],
            ['Trend Predictor', 'ML che classifica UP/FLAT/DOWN a 5 giorni'],
            ['ML Score', 'Probabilità WIN 0-100% dal modello XGBoost'],
            ['News Sentiment', 'LLM valuta headlines (POS/NEU/NEG)'],
            ['Earnings Detection', 'LLM identifica trimestrali imminenti'],
            ['Time Decay', 'Peso ridotto per decisioni vecchie nel learning'],
            ['Trade Sync', 'Sincronizzazione Alpaca ↔ MongoDB automatica'],
            ['Portfolio History', 'Equity curve day-by-day da Alpaca'],
            ['Alpha vs SPY', 'Extra-return vs benchmark S&P 500'],
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
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
        border: '1px solid #334155',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
          🚀 <strong style={{ color: 'white' }}>SwingLab v3.6</strong> — Multi-Agent AI Swing Trading Platform
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Built with ❤️ • Paper Trading Mode • Real Market Data • 100% Automated
        </div>
      </div>
    </div>
  );
}
