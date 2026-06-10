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
        che comunicano tramite un Shared Brain, analizzano il mercato, selezionano stock,
        gestiscono il rischio ed eseguono ordini su Alpaca. Include un modello ML (XGBoost)
        per predizioni WIN/LOSS.
      </p>

      {/* ---- 1. Data Sources ---- */}
      <Section emoji="📡" title="1. Data Sources">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="📈 220 Stock" color="#3b82f6">
            20 stock per ognuno degli 11 settori S&P. Dati storici salvati in MongoDB con refresh incrementale ogni ora.
          </Card>
          <Card title="🏛 11 Settori" color="#22c55e">
            ETF settoriali SPDR: XLK (Tech), XLF (Finance), XLV (Health), XLI, XLY, XLP, XLE, XLU, XLB, XLRE, XLC
          </Card>
          <Card title="📊 Indici USA" color="#eab308">
            SPY (S&P 500), QQQ (Nasdaq), IWM (Russell 2000), DIA (Dow Jones)
          </Card>
          <Card title="🪙 Crypto & FX" color="#f97316">
            BTC/USD, ETH/USD, FXE (Euro), UUP (Dollar), VIXY (VIX proxy)
          </Card>
        </div>
      </Section>

      {/* ---- 2. Indicatori Tecnici ---- */}
      <Section emoji="📊" title="2. Indicatori Tecnici">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="RSI (Relative Strength Index)" color="#3b82f6">
            Misura se una stock è ipercomprata o ipervenduta.<br />
            0-30 = Oversold (possibile rimbalzo) | 30-70 = Normale | 70-100 = Overbought
          </Card>
          <Card title="MACD" color="#22c55e">
            Misura il momentum. Histogram {'>'} 0 = momentum positivo. Crossover = segnale BUY/SELL.
          </Card>
          <Card title="EMA (10/20/50)" color="#eab308">
            Medie mobili esponenziali. Price {'>'} EMA10 {'>'} EMA20 {'>'} EMA50 = uptrend perfetto!
          </Card>
          <Card title="Volume Profile & POC" color="#f97316">
            POC = prezzo con più volume (supporto forte). Value Area = zona del 70% del volume.
          </Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">
            Accumulation → Markup → Distribution → Markdown. Spring = rimbalzo forte!
          </Card>
          <Card title="Candlestick & FVG" color="#ef4444">
            Hammer, Engulfing, Doji, Morning/Evening Star. FVG = gap dove il prezzo torna.
          </Card>
        </div>
      </Section>

      {/* ---- 3. Scoring System ---- */}
      <Section emoji="🎯" title="3. Scoring System">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Setup Score (0-100)" color="#3b82f6">
            EMA alignment: +25 | RSI sweet spot: +15 | MACD: +10 | Volume: +10 | POC: +15 | Sector: +10 | Patterns: +15. Score {'>'} 70 = Strong Buy
          </Card>
          <Card title="Confluence Score (0-100)" color="#22c55e">
            Usato dagli agenti AI. Combina 13 fattori con pesi regolabili. Più fattori convergono = segnale più affidabile!
          </Card>
        </div>
      </Section>

      {/* ---- 4. I 4 Agenti AI (Indipendenti) ---- */}
      <Section emoji="🤖" title="4. I 4 Agenti AI (Indipendenti)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
            Gli agenti operano in modo <span style={{ color: '#3b82f6', fontWeight: 700 }}>indipendente</span> e comunicano tramite il <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Shared Brain</span> (MongoDB)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {Object.entries(AGENT_INFO).map(([name, info]) => (
              <div key={name} style={{ background: '#0f172a', borderRadius: 10, padding: '10px 16px', border: `2px solid ${info.color}`, textAlign: 'center', minWidth: 120 }}>
                <div style={{ fontSize: 20 }}>{info.emoji}</div>
                <div style={{ color: 'white', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{info.name}</div>
                <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>{info.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: 6, fontSize: 10, color: '#3b82f6' }}>🌍 Macro: ogni 30 min (sempre)</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: 6, fontSize: 10, color: '#22c55e' }}>🎯 Alpha: ogni 15 min (mercato)</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: 6, fontSize: 10, color: '#eab308' }}>🛡 Risk: ogni 5 min (mercato)</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: 6, fontSize: 10, color: '#f97316' }}>⚡ Executor: ogni 5 min (mercato)</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst" color="#3b82f6">
            Studia il mercato globale. Scrive nel Shared Brain: regime (BULL/NEUTRAL/BEAR/CRASH), % esposizione, volatilità, sector rankings. Gira sempre, anche fuori mercato.
          </Card>
          <Card title="🎯 AlphaStrategist" color="#22c55e">
            Scansiona 220 stock. Legge il regime dal Brain, calcola confluence a 13 fattori, genera candidati BUY e segnali SELL. Target/Stop ibridi (VA + min %).
          </Card>
          <Card title="🛡 RiskManager" color="#eab308">
            Legge i candidati dal Brain. Calcola position sizing, verifica R/R ratio, limiti di esposizione, max per settore. Scrive i trade approvati nel Brain.
          </Card>
          <Card title="⚡ Executor" color="#f97316">
            Legge i trade approvati dal Brain. Piazza bracket orders (entry + TP + SL), gestisce trailing stop, notifica Telegram. Pulisce il Brain dopo l'esecuzione.
          </Card>
        </div>
      </Section>
      {/* ---- 5. Shared Brain ---- */}
      <Section emoji="🧠" title="5. Shared Brain">
        <Card title="Come Comunicano gli Agenti" color="#8b5cf6">
          Il Shared Brain è un documento MongoDB condiviso tra tutti gli agenti. Ogni agente legge ciò che gli serve e scrive il suo output:
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 10 }}>
          <Card title="market" color="#3b82f6">
            Scritto da MacroAnalyst. Contiene: regime, confidence, exposure, volatility, breadth, sector rankings.
          </Card>
          <Card title="candidates" color="#22c55e">
            Scritto da AlphaStrategist. Contiene: lista buy candidates (ticker, confluence, target, stop) e sell signals.
          </Card>
          <Card title="approved" color="#eab308">
            Scritto da RiskManager. Contiene: trade approvati con position sizing, risk report.
          </Card>
          <Card title="executions" color="#f97316">
            Scritto da Executor. Contiene: ordini eseguiti, trailing stop adjustments. Pulisce gli approved dopo l'esecuzione.
          </Card>
        </div>
      </Section>

      {/* ---- 6. ML Model ---- */}
      <Section emoji="🧠" title="6. ML Model (XGBoost)">
        <Card title="Come Funziona il Machine Learning" color="#8b5cf6">
          SwingLab usa un modello XGBoost che impara dai trade passati quali combinazioni di indicatori portano a trade vincenti. Predice la probabilità WIN/LOSS per ogni candidato.
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10, marginTop: 10 }}>
          <Card title="15 Features" color="#3b82f6">
            RSI, MACD histogram, EMA alignment, relative volume, POC distance, setup type,
            sector rank, Wyckoff phase, accumulation score, range position, daily change,
            market regime, confluence score, bullish patterns, % from 52w high.
          </Card>
          <Card title="Training" color="#22c55e">
            Si allena sui trade chiusi in trade_history. Con meno di 15 trade usa dati sintetici
            generati dalle 220 stock attuali. Si retraina automaticamente.
          </Card>
          <Card title="Output" color="#eab308">
            Per ogni stock: ML Score (0-100%), Prediction (WIN/LOSS), Confidence.
            Visibile come badge 🧠 nel dettaglio stock e nelle Top Setup cards.
          </Card>
          <Card title="Evoluzione" color="#f97316">
            Con 50+ trade reali il modello diventa molto più accurato. Futuro: ogni agente
            avrà il suo ML model specializzato (Fase 8).
          </Card>
        </div>
      </Section>

      {/* ---- 7. Bracket Orders ---- */}
      <Section emoji="📦" title="7. Bracket Orders">
        <Card title="Come funziona" color="#3b82f6">
          Ogni trade piazza 3 ordini collegati: 1) BUY limit order 2) TAKE PROFIT automatico
          al target (VA High o min +6%) 3) STOP LOSS automatico (VA Low o max -4%). Target e stop
          sono calcolati con metodo ibrido: il migliore tra Volume Profile e percentuale minima.
          Mutuamente esclusivi: se scatta TP, SL si cancella e viceversa.
          Funzionano anche se il sistema è offline!
        </Card>
      </Section>

      {/* ---- 8. Glossario ---- */}
      <Section emoji="📚" title="8. Glossario">
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
            ['Shared Brain', 'Database condiviso dove gli agenti leggono/scrivono indipendentemente'],
            ['XGBoost', 'Algoritmo ML che impara dai trade passati a predire WIN/LOSS'],
            ['ML Score', 'Probabilità 0-100% che un trade sia vincente secondo il modello ML'],
            ['Synthetic Data', 'Dati simulati per allenare il ML quando non ci sono abbastanza trade reali'],
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
