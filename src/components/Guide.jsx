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

export default function Guide() {
  return (
    <div>
      <h2>📖 How SwingLab Works</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>
        SwingLab è un sistema di swing trading automatizzato con 4 agenti AI indipendenti
        che comunicano tramite un Shared Brain, analizzano il mercato con LLM (Gemini/Groq),
        2 modelli ML, news sentiment e earnings detection. Operano autonomamente su Alpaca.
      </p>

      {/* ---- 1. Data Sources ---- */}
      <Section emoji="📡" title="1. Data Sources">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="📈 220 Stock" color="#3b82f6">
            20 stock per ognuno degli 11 settori S&P. Dati storici da Alpaca IEX + Twelve Data (recente). Refresh ogni ora.
          </Card>
          <Card title="🏛 11 Settori" color="#22c55e">
            ETF settoriali SPDR: XLK, XLF, XLV, XLI, XLY, XLP, XLE, XLU, XLB, XLRE, XLC. Ranking per composite score.
          </Card>
          <Card title="🌍 10 Macro ETF" color="#eab308">
            TLT, HYG, LQD (bonds), GLD, USO (commodities), RSP (breadth), IWO (small cap), VXX (volatility), EEM (emerging), IYT (transport).
          </Card>
          <Card title="🪙 Crypto & FX" color="#f97316">
            BTC/USD, ETH/USD, FXE (Euro), UUP (Dollar). Real-time da Alpaca.
          </Card>
        </div>
      </Section>

      {/* ---- 2. Indicatori Tecnici ---- */}
      <Section emoji="📊" title="2. Indicatori Tecnici">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="RSI (14)" color="#3b82f6">
            0-30 = Oversold | 30-70 = Normale | 70-100 = Overbought. Sweet spot per entry: 35-60.
          </Card>
          <Card title="MACD" color="#22c55e">
            Histogram {'>'} 0 = momentum positivo. Crossover = segnale BUY/SELL. Visualizzato come barre verdi/rosse.
          </Card>
          <Card title="EMA (10/20/50)" color="#eab308">
            Price {'>'} EMA10 {'>'} EMA20 {'>'} EMA50 = uptrend perfetto (Full Align). Visualizzate sul chart con colori diversi.
          </Card>
          <Card title="Volume Profile & POC" color="#f97316">
            POC = prezzo con più volume (supporto forte). VA High/Low = zona del 70% del volume. Target/Stop ibridi.
          </Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">
            Accumulation → Markup → Distribution → Markdown. Spring = rimbalzo forte! Confidence % per ogni fase.
          </Card>
          <Card title="Candlestick & FVG" color="#ef4444">
            Hammer, Engulfing, Doji, Morning/Evening Star. FVG = gap dove il prezzo torna. Pattern bullish/bearish con strength.
          </Card>
        </div>
      </Section>

      {/* ---- 3. Scoring ---- */}
      <Section emoji="🎯" title="3. Scoring System">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Setup Score (0-100)" color="#3b82f6">
            EMA alignment: +25 | RSI sweet spot: +15 | MACD: +10 | Volume: +10 | POC: +15 | Sector: +10 | Patterns: +15
          </Card>
          <Card title="Confluence Score (0-100)" color="#22c55e">
            13 fattori con pesi regolabili. Più fattori convergono = segnale più affidabile. Usato dagli agenti AI.
          </Card>
        </div>
      </Section>

      {/* ---- 4. I 4 Agenti AI ---- */}
      <Section emoji="🤖" title="4. I 4 Agenti AI">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, textAlign: 'center' }}>
            Gli agenti operano in modo <span style={{ color: '#3b82f6', fontWeight: 700 }}>indipendente</span>,
            comunicano via <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Shared Brain</span>,
            e <span style={{ color: '#22c55e', fontWeight: 700 }}>leggono il reasoning degli altri</span>
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
                market state | candidates | approved trades | executions | reasoning
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <span style={{ background: '#3b82f620', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#3b82f6' }}>🌍 ogni 30 min</span>
              <span style={{ background: '#22c55e20', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#22c55e' }}>🎯 ogni 15 min</span>
              <span style={{ background: '#eab30820', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#eab308' }}>🛡 ogni 15 min</span>
              <span style={{ background: '#f9731620', padding: '3px 8px', borderRadius: 4, fontSize: 9, color: '#f97316' }}>⚡ ogni 10 min</span>
            </div>
          </div>

          {/* Communication Chain */}
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>🔗 Catena di Comunicazione</div>
            {[
              { from: '🌍 Macro', to: '🎯 Alpha', msg: '"Regime NEUTRAL, TLT in salita suggerisce cautela sui bonds"', color: '#3b82f6' },
              { from: '🎯 Alpha', to: '🛡 Risk', msg: '"Top picks: GS, BLK, VRTX. News positive su CSCO"', color: '#22c55e' },
              { from: '🌍 Macro + 🎯 Alpha', to: '🛡 Risk', msg: '"Macro cauto + Alpha selettivo → riduco sizing"', color: '#eab308' },
              { from: '🌍 Macro + 🛡 Risk', to: '⚡ Executor', msg: '"Risk ha ridotto, uso buffer maggiore per i fill"', color: '#f97316' },
            ].map((flow, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 10 }}>
                <span style={{ color: flow.color, fontWeight: 700, minWidth: 120 }}>{flow.from} → {flow.to}</span>
                <span style={{ color: '#64748b', fontStyle: 'italic' }}>{flow.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Detail Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst" color="#3b82f6">
            Analizza 10+ indicatori macro ogni 30 min. Determina regime (BULL/NEUTRAL/BEAR/CRASH), esposizione,
            volatilità. LLM scrive reasoning in italiano letto da tutti gli altri agenti. Monitora earnings season e IPO.
          </Card>
          <Card title="🎯 AlphaStrategist" color="#22c55e">
            Scansiona 220 stock ogni 15 min. Calcola confluence a 13 fattori. Legge reasoning Macro +
            news headlines + earnings imminenti. LLM analizza top 5 candidati con pro/contro. Target/Stop ibridi.
          </Card>
          <Card title="🛡 RiskManager" color="#eab308">
            Valuta ogni 15 min. Approva/rifiuta trade. Calcola position sizing, R/R ratio,
            esposizione settoriale. Legge reasoning di Macro e Alpha per contestualizzare. Limiti perdita giornalieri/settimanali.
          </Card>
          <Card title="⚡ Executor" color="#f97316">
            Esegue ogni 10 min. Piazza bracket orders (entry + TP + SL), trailing stops a 3 livelli,
            cancella ordini stale. Legge reasoning di Macro e Risk. Trade Sync v3 per sincronizzare chiusure.
          </Card>
        </div>
      </Section>
      {/* ---- 5. Shared Brain ---- */}
      <Section emoji="🧠" title="5. Shared Brain">
        <Card title="Come Comunicano gli Agenti" color="#8b5cf6">
          Il Shared Brain è un documento MongoDB condiviso. Ogni agente legge ciò che gli serve,
          scrive il suo output, e i reasoning LLM sono accessibili a tutti.
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 10 }}>
          <Card title="market" color="#3b82f6">Scritto da Macro. Regime, confidence, exposure, sector rankings + LLM reasoning.</Card>
          <Card title="candidates" color="#22c55e">Scritto da Alpha. Buy candidates con confluence, target, stop + LLM analysis per stock.</Card>
          <Card title="approved" color="#eab308">Scritto da Risk. Trade approvati con sizing, risk report + LLM reasoning.</Card>
          <Card title="executions" color="#f97316">Scritto da Executor. Ordini eseguiti, trailing stops, trade sync + LLM reasoning.</Card>
        </div>
      </Section>

      {/* ---- 6. ML Models ---- */}
      <Section emoji="🧠" title="6. ML Models">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="XGBoost WIN/LOSS" color="#3b82f6">
            15 features (RSI, MACD, EMA, volume, POC, Wyckoff, etc.). Predice la probabilità che un trade sia vincente.
            Visibile come badge 🧠 nelle stock cards. Si allena su dati sintetici, migliora con trade reali.
          </Card>
          <Card title="Trend Prediction 5D" color="#22c55e">
            20 features dai price bars. Classifica ogni stock come UP ({'>'} +2%), FLAT (±2%), DOWN ({'<'} -2%) a 5 giorni.
            13,680 campioni da 249 stock. Visualizzato con barre colorate nel StockDetail.
          </Card>
        </div>
      </Section>

      {/* ---- 7. News & Earnings ---- */}
      <Section emoji="📰" title="7. News & Earnings">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="📰 News Sentiment" color="#06b6d4">
            Alpaca News API fetcha le ultime headlines per ogni stock. Il LLM analizza il sentiment
            (POSITIVO/NEGATIVO/NEUTRO) e lo mostra nel StockDetail con badge colorato.
          </Card>
          <Card title="📅 Earnings Detection" color="#f97316">
            Il LLM dell'AlphaStrategist analizza le news per identificare earnings/trimestrali imminenti.
            Se trova earnings entro 7 giorni, avvisa nell'analisi. Il MacroAnalyst segnala l'earnings season.
          </Card>
        </div>
      </Section>

      {/* ---- 8. Bracket Orders ---- */}
      <Section emoji="📦" title="8. Bracket Orders & Trading">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Bracket Order" color="#3b82f6">
            Ogni trade piazza 3 ordini: 1) BUY limit 2) TAKE PROFIT automatico 3) STOP LOSS automatico.
            Target = max(VA High, +6%). Stop = max(VA Low, -4%). Mutuamente esclusivi. Funzionano offline!
          </Card>
          <Card title="Trailing Stops" color="#22c55e">
            3 livelli automatici: L1 (+5% → break-even), L2 (+8% → entry+4%), L3 (+12% → entry+8%).
            L'Executor li gestisce ogni 10 minuti.
          </Card>
        </div>
      </Section>

      {/* ---- 9. Glossario ---- */}
      <Section emoji="📚" title="9. Glossario">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 8 }}>
          {[
            ['POC', 'Point of Control: prezzo con il volume più alto'],
            ['VA High/Low', 'Value Area: zona dove si scambia il 70% del volume'],
            ['RSI', 'Relative Strength Index (0-100)'],
            ['MACD', 'Moving Average Convergence Divergence'],
            ['EMA', 'Exponential Moving Average'],
            ['Wyckoff', 'Teoria delle 4 fasi di mercato'],
            ['FVG', 'Fair Value Gap: gap nel prezzo'],
            ['Confluence', 'Quanti fattori convergono sullo stesso segnale'],
            ['R/R Ratio', 'Risk/Reward: rapporto guadagno/rischio'],
            ['Bracket Order', 'Ordine composto: entry + TP + SL'],
            ['Setup Score', 'Punteggio 0-100 qualità opportunità'],
            ['Breadth', '% di stock sopra la EMA50'],
            ['Shared Brain', 'Database MongoDB condiviso tra gli agenti per comunicare'],
            ['XGBoost', 'Algoritmo ML per predire WIN/LOSS su ogni trade'],
            ['Trend Prediction', 'ML che prevede UP/FLAT/DOWN a 5 giorni'],
            ['ML Score', 'Probabilità 0-100% che un trade sia vincente'],
            ['News Sentiment', 'LLM analizza headlines per determinare sentiment'],
            ['Earnings Detection', 'LLM identifica trimestrali imminenti dalle news'],
            ['Message Board', 'Sistema con cui gli agenti leggono il reasoning degli altri'],
            ['Trailing Stop', 'Stop loss che si alza automaticamente in profitto'],
          ].map(([t, d]) => (
            <div key={t} style={{ background: '#1e293b', borderRadius: 6, padding: 8, fontSize: 12 }}>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{t}</span>
              <span style={{ color: '#94a3b8' }}> — {d}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
