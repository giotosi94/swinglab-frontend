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

function Step({ n, title, color, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
      <div style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
        background: color, color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 800, fontSize: 15,
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 4 }}>{title}</div>
        <div style={{ color: '#94a3b8', fontSize: 12.5, lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Guide() {
  return (
    <div>
      {/* ============ SIPARIETTO / HERO ============ */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b3a 0%, #0a1628 60%, #0f172a 100%)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 24,
        border: '2px solid #8b5cf6',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ fontSize: 13, color: '#8b5cf6', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          SWINGLAB — INTELLIGENZA ARTIFICIALE PER IL TRADING
        </div>
        <h1 style={{ margin: '0 0 16px', fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
          Non è un bot che compra a caso.<br />
          <span style={{ color: '#8b5cf6' }}>È una squadra di 5 analisti AI</span> che lavora 24/7.
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.8, maxWidth: 760, margin: '0 0 20px' }}>
          Immagina cinque specialisti seduti allo stesso tavolo. Uno legge il <strong style={{ color: '#3b82f6' }}>quadro macro</strong> del
          mercato. Uno caccia le <strong style={{ color: '#22c55e' }}>migliori opportunità</strong> incrociando 16 fattori. Uno decide
          <strong style={{ color: '#eab308' }}> quanto capitale rischiare</strong> con la matematica del Kelly Criterion. Uno
          <strong style={{ color: '#8b5cf6' }}> gestisce ogni posizione</strong> minuto per minuto. Uno <strong style={{ color: '#f97316' }}>esegue gli ordini</strong> con
          precisione chirurgica. Si parlano tra loro, imparano dai propri errori ogni domenica, e non dormono mai.
        </p>
        <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.7, maxWidth: 760, margin: '0 0 20px' }}>
          Ogni decisione è <strong style={{ color: 'white' }}>tracciata, spiegata in italiano e misurabile</strong>. Niente scatole nere:
          se il sistema compra AAPL, sai esattamente perché — quali dei 16 fattori si sono allineati, cosa dice il
          machine learning, in che regime di mercato siamo. E un <strong style={{ color: '#06b6d4' }}>cruscotto di salute</strong> controlla in
          tempo reale che ogni ingranaggio giri come deve.
        </p>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 20, paddingTop: 20, borderTop: '1px solid #334155' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#22c55e' }}>+7,2%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Equity paper trading</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#06b6d4' }}>+6,4%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Alpha vs SPY (1M)</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#8b5cf6' }}>100%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Automatizzato</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#eab308' }}>57,4%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>ML accuracy</div>
          </div>
        </div>
      </div>

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
            v5.0 · MTF + HEALTH
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>
          <strong style={{ color: 'white' }}>SwingLab v5.0</strong> è una piattaforma di <strong style={{ color: '#3b82f6' }}>swing trading algoritmico</strong> con
          architettura <strong style={{ color: '#22c55e' }}>Multi-Agent AI a 5 agenti</strong>. Sistema enterprise con: APM Dual-Level,
          <strong style={{ color: '#8b5cf6' }}> Adaptive Targets per stock</strong>, DPS + Kelly Criterion, Regime-Aware,
          <strong style={{ color: '#06b6d4' }}> Multi-Timeframe (Weekly)</strong>, MacroAnalyst v2.0 formule continue,
          data Alpaca IEX live, Backtesting Engine, Analytics equity-based, System Health Dashboard.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 5 Multi-Agent AI</span>
          <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ APM Dual-Level</span>
          <span style={{ background: '#eab30820', color: '#eab308', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Adaptive Targets</span>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ DPS + Kelly</span>
          <span style={{ background: '#06b6d420', color: '#06b6d4', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ MTF Weekly</span>
          <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Regime-Aware</span>
          <span style={{ background: '#84cc1620', color: '#84cc16', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ System Health</span>
        </div>
      </div>

      {/* ============ COME RAGIONA E OPERA ============ */}
      <Section emoji="🧠" title="COME RAGIONA — Il ciclo di vita di un trade">
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>
          Ogni 15 minuti (a mercato aperto) parte una pipeline. Ecco cosa succede, passo per passo,
          dal momento in cui il sistema "si sveglia" fino a quando gestisce una posizione aperta.
        </div>

        <Step n="1" title="🌍 Legge il mercato (MacroAnalyst)" color="#3b82f6">
          Analizza 17 indicatori macro (SPY, VIX, bond, oro, breadth...) e stabilisce il <strong>regime</strong>:
          BULL, NEUTRAL, BEAR o CRASH. Questo decide quanto essere aggressivi. In BULL apre di più, in BEAR si protegge.
          È il "meteo" su cui tutti gli altri agenti si basano.
        </Step>

        <Step n="2" title="🎯 Caccia le opportunità (AlphaStrategist)" color="#22c55e">
          Passa in rassegna i 219 titoli e per ognuno calcola un <strong>Confluence Score</strong> incrociando 16 fattori:
          RSI, MACD, EMA, Volume Profile, Wyckoff, pattern, machine learning e il trend settimanale (MTF).
          Solo chi supera la soglia diventa candidato. Sui migliori 5 chiede un parere all'LLM in italiano.
        </Step>

        <Step n="3" title="🛡️ Decide quanto rischiare (RiskManager)" color="#eab308">
          Per ogni candidato calcola la size con una formula a tre livelli: <strong>Base × DPS × Kelly × Regime</strong>.
          Un trade eccellente in mercato BULL riceve più capitale; uno mediocre in BEAR con volatilità alta ne riceve
          molto meno. Applica anche limiti: max posizioni, max per settore, riserva di cassa.
        </Step>

        <Step n="4" title="⚡ Esegue con precisione (Executor)" color="#f97316">
          Piazza l'ordine in dollari (fractional), aspetta il fill reale, e solo allora imposta Stop Loss e Take Profit
          ricalcolati sul prezzo effettivo. Al momento del buy calcola i <strong>target adattivi T1/T2/T3</strong>
          specifici per quel titolo, in base alla sua volatilità.
        </Step>

        <Step n="5" title="🎯 Gestisce la posizione viva (APM)" color="#8b5cf6">
          Da qui in poi la posizione è "monitorata". Ogni 15 min controlla se ha raggiunto un target (scale-out parziale
          50%/30%/20%), ogni ora rivaluta l'intera tesi. Se il quadro si rompe esce; se corre bene lascia correre
          proteggendo il profitto con un floor. Ogni scelta è spiegata e loggata.
        </Step>

        <Step n="6" title="🧬 Impara dai propri errori (Learning)" color="#06b6d4">
          Ogni domenica: alle 06:00 il modello ML si <strong>ritraina</strong> sui nuovi trade reali accumulati,
          alle 07:00 l'APM analizza le decisioni della settimana e <strong>auto-regola le sue soglie</strong>.
          Il sistema di lunedì è più intelligente di quello di venerdì.
        </Step>

        <div style={{
          marginTop: 8, padding: 14, borderRadius: 8,
          background: '#06b6d415', border: '1px solid #06b6d444',
          fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.6,
        }}>
          🩺 <strong style={{ color: '#06b6d4' }}>E il guardiano?</strong> Un System Health Dashboard controlla in
          continuo che i dati siano freschi, gli agenti attivi, il broker connesso e il ML sano. Se qualcosa si rompe,
          lo vedi subito con un semaforo rosso — e puoi chiedere una diagnosi AI in italiano.
        </div>
      </Section>

      {/* 0. Key Metrics */}
      <Section emoji="📊" title="Sistema in Numeri (v5.0)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Metric label="Universo Stock" value="219" color="#3b82f6" />
          <Metric label="Settori SPDR" value="11" color="#22c55e" />
          <Metric label="Macro Indicators" value="17" color="#eab308" />
          <Metric label="Fattori Confluence" value="16" color="#f97316" />
          <Metric label="Agenti AI" value="5" color="#8b5cf6" />
          <Metric label="ML Features" value="17" color="#06b6d4" />
          <Metric label="Timeframe" value="2 (D+W)" color="#ef4444" />
          <Metric label="Cron Active" value="10" color="#22c55e" />
        </div>
      </Section>

      {/* 1. Data Sources */}
      <Section emoji="📡" title="1. Data Sources — Alpaca IEX Priority">
        <div style={{ background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: '3px solid #22c55e' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#22c55e' }}>🆕 v5.0 Fix Dati</strong>: risolto bug critico sull'ordine barre Alpaca
            (sort=desc). Prima le barre recenti venivano troncate e i dati restavano stale (SPY fermo settimane).
            Ora cache validata su freschezza update <strong>E</strong> recency ultima barra (max 4 giorni).
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📈 219 Stock S&P" color="#3b82f6">
            ~20 stock per ognuno degli 11 settori SPDR. Bars daily da Alpaca IEX, latest quotes real-time.
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
            Widget integrato in StockDetail. Real-time IEX, multi-timeframe.
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
          <Card title="🆕 MTF Weekly Trend" color="#06b6d4">Resample daily → weekly. BULL/NEUTRAL/BEAR + slope EMA20. Filtro trend di fondo.</Card>
          <Card title="Range Position 52W" color="#84cc16">&lt; 30% = value zone, &gt; 70% = near high momentum.</Card>
        </div>
      </Section>

      {/* 3. Confluence Scoring */}
      <Section emoji="🎯" title="3. Confluence Score — Il Motore Decisionale">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            AlphaStrategist calcola per ogni stock un <strong style={{ color: '#22c55e' }}>Confluence Score</strong> (0-100)
            basato su <strong>16 fattori pesati</strong>. Solo candidati sopra soglia minima (default 35).
            13 Rule-Based + 2 ML-Powered + <strong style={{ color: '#06b6d4' }}>1 Multi-Timeframe</strong>.
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
            { name: '16. 🆕 MTF Weekly', max: 2.5, color: '#06b6d4' },
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
      <Section emoji="🤖" title="4. Multi-Agent AI v5.0 (5 Agenti)">
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
            <strong>Formule continue</strong>. 17 macro indicators (Alpaca IEX). Regime BULL/NEUTRAL/BEAR/CRASH,
            exposure multiplier dinamico, rotation signal, credit spreads.
          </Card>
          <Card title="🎯 AlphaStrategist v2.1" color="#22c55e">
            Confluence Score 16 fattori (con MTF Weekly). Filtra RSI, volume, setup, sector limit.
            LLM italiano su top 5 candidati.
          </Card>
          <Card title="🛡 RiskManager v4.2" color="#eab308">
            <strong>DPS + Kelly + Regime</strong>. Sizing dinamico: R/R × ML × Confluence × Kelly (WR+VIX) × Regime.
            Base 18% (Aggressivo) modulato.
          </Card>
          <Card title="🎯 APM v1.2 Adaptive" color="#8b5cf6">
            Timer 1h + urgent 15min. Target T1/T2/T3 personalizzati per stock.
            Regime-Aware exit. HOLD/SCALE/EXIT/TIGHTEN.
          </Card>
          <Card title="⚡ Executor v3.5" color="#f97316">
            Notional buy + recalc post-fill slippage. Software SL/TP con break-even.
            Trailing 3-level. Trade Sync v5. Cancel stale 2h.
          </Card>
        </div>
      </Section>

      {/* 5. MTF */}
      <Section emoji="📅" title="5. 🆕 Multi-Timeframe Analysis (MTF Light)">
        <div style={{ background: 'linear-gradient(135deg, #0a2f3a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #06b6d4' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#06b6d4', fontSize: 15 }}>📅 Trend di fondo settimanale</strong>
            <br /><br />
            Un setup daily è molto più forte se allineato al trend <strong>weekly</strong>.
            Il MTF ricostruisce le barre settimanali dalle daily (resample, zero API extra) e valuta il trend di fondo.
            <br /><br />
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#06b6d4' }}>
              Weekly BULL + rising  → +2.5 confluence (entry ideale)<br />
              Weekly BULL           → +1.5<br />
              Weekly NEUTRAL        → +0.5<br />
              Weekly BEAR           → -2.0 (evita il "coltello che cade")
            </div>
            <br />
            Evita l'errore classico: comprare un bel pullback daily su un titolo che sul weekly sta crollando.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="📅 Weekly Trend Filter" color="#06b6d4">
            EMA10/20/50 weekly + slope EMA20 su 4 settimane. BULL / NEUTRAL / BEAR.
          </Card>
          <Card title="⚡ Zero API Extra" color="#22c55e">
            Resample delle ~300 daily già in cache. Nessuna chiamata Alpaca aggiuntiva, zero latenza.
          </Card>
          <Card title="🎯 Factor 16 Confluence" color="#3b82f6">
            Integrato come 16° fattore. Attivo in produzione sul trading live.
          </Card>
          <Card title="🔮 Prossimo: MTF Full" color="#8b5cf6">
            Aggiungere 4H/1H per timing entry ancora più preciso (roadmap).
          </Card>
        </div>
      </Section>

      {/* 6. APM */}
      <Section emoji="🎯" title="6. APM v1.2 — Dual-Level + Adaptive Targets">
        <div style={{ background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6', fontSize: 15 }}>🎯 Sistema a TRE LIVELLI</strong>
            <br /><br />
            <strong style={{ color: '#f97316' }}>Livello 1 — Urgent (15 min)</strong>: check su target hit, SCALE_OUT immediato.
            <br /><br />
            <strong style={{ color: '#8b5cf6' }}>Livello 2 — Full Analysis (1h)</strong>: rivaluta confluence, ML, regime. HOLD/EXIT/SCALE/TIGHTEN con LLM.
            <br /><br />
            <strong style={{ color: '#eab308' }}>Adaptive Targets</strong>: al buy, T1/T2/T3 calcolati sul target Alpha specifico per stock.
            <br /><br />
            <strong style={{ color: '#22c55e' }}>Floor "lascia correre"</strong>: dopo T1 lo stop diventa un floor fisso (break-even, poi +3%),
            il residuo corre libero verso il target pieno senza essere strozzato.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🟢 HOLD" color="#22c55e">Confluence sopra soglia, ML WIN, nessun fattore negativo. Mantiene.</Card>
          <Card title="🟡 SCALE_OUT Adaptive" color="#eab308">T1/T2/T3 per stock. Chiude 50%/30%/20% reale su Alpaca. Floor fisso sul resto.</Card>
          <Card title="🔴 EXIT" color="#ef4444">Confluence sotto soglia + ML LOSS + 2+ fattori negativi. Chiude 100%.</Card>
          <Card title="🛡️ TIGHTEN_STOP" color="#f97316">Profit &gt; 3% ma ML inverte. Alza SL a -2% dal current.</Card>
          <Card title="🧬 Learning Loop" color="#06b6d4">Cron domenica 07:00. Analizza 30gg, auto-tuning soglie.</Card>
          <Card title="🏃 Runner Protection" color="#22c55e">🆕 v5.0 Fix T2/T3: floor fisso post-T1, no più break-even prematuro.</Card>
        </div>
      </Section>

      {/* 7. DPS + Kelly */}
      <Section emoji="💰" title="7. Dynamic Position Sizing + Kelly Criterion">
        <div style={{ background: 'linear-gradient(135deg, #3a2f0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #eab308' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#eab308', fontSize: 15 }}>💰 Triple Intelligence Sizing</strong>
            <br /><br />
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#eab308' }}>
              Size = Base × DPS × Kelly × Regime<br /><br />
              DPS = R/R_mult × ML_mult × Conf_mult<br />
              Kelly = Fractional_Kelly × Volatility_Adjust<br />
              Regime = exposure_multiplier (BULL 1.0, NEUTRAL 0.6, BEAR 0.3)
            </div>
            <br />
            <strong style={{ color: '#06b6d4' }}>Nota</strong>: la position size mostrata nel widget DPS è già post-regime.
            Il Kelly fraction dipende dal profilo di rischio (Moderato 0.20, Aggressivo 0.25).
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎯 R/R Multiplier" color="#22c55e">R/R 0.5→0.5x | 1.5→0.7x | 2.5→1.0x | 3.5→1.3x</Card>
          <Card title="🧠 ML Multiplier" color="#8b5cf6">ML 40%→0.7x | 60%→0.9x | 75%→1.0x | 90%→1.2x</Card>
          <Card title="🎯 Confluence Multiplier" color="#3b82f6">Conf 30→0.7x | 45→0.9x | 55→1.0x | 70→1.3x</Card>
          <Card title="💰 Kelly Criterion" color="#eab308">
            Kelly% = (WR × avg_win - LR × avg_loss) / avg_win. Fractional 0.25x. Attivo con &gt;20 trade.
          </Card>
          <Card title="📉 Volatility (VIX)" color="#ef4444">VIX Low/Normal→1.0x | High→0.85x | Extreme→0.7x</Card>
          <Card title="🛡️ Safety Net" color="#06b6d4">Kelly skip se &lt;20 trade. Cap max 25%. Regime ridotto in BEAR.</Card>
        </div>
      </Section>

      {/* 8. Risk Presets */}
      <Section emoji="🎚️" title="8. Risk Profile Presets — 4 Profili + Avanzato">
        <div style={{ background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: '3px solid #22c55e' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#22c55e' }}>🆕 v5.0 Fix Preset</strong>: i profili ora scrivono <strong>tutti</strong> i parametri
            (kelly/dps inclusi) nel DB e tracciano <code>active_preset</code>. Prima alcuni valori restavano ai default.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="🛡️ Conservativo" color="#22c55e">5 pos · 8% size · R/R 2:1 · Kelly OFF · +8-12%</Card>
          <Card title="🎯 Moderato" color="#3b82f6">8 pos · 12% size · R/R 1.5:1 · Kelly 0.20 · +15-25%</Card>
          <Card title="⚡ Aggressivo" color="#f97316">12 pos · 18% size · R/R 1.3:1 · Kelly 0.25 · +25-40%</Card>
          <Card title="🚀 Super Aggressivo" color="#ef4444">15 pos · 22% size · R/R 1.2:1 · Kelly 0.35 · +35-60%</Card>
          <Card title="🔧 Avanzato" color="#8b5cf6">Accordion con 30+ slider per power user.</Card>
        </div>
      </Section>

      {/* 9. Analytics */}
      <Section emoji="📈" title="9. 🆕 Analytics Equity-Based & Metriche Oneste">
        <div style={{ background: 'linear-gradient(135deg, #0a3a1a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#22c55e', fontSize: 15 }}>📈 Rivoluzione v5.0</strong>
            <br /><br />
            <strong>PRIMA</strong>: Total P&L sommava le percentuali dei trade (matematicamente errato → +159% farlocco).
            <br />
            <strong>ORA</strong>: return reale = profitto $ / capitale iniziale. Drawdown, cumulative, monthly tutti su equity reale.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="✅ Total P&L Reale" color="#22c55e">Return in $ / capitale. Coerente con l'equity Alpaca.</Card>
          <Card title="🎯 3 Win Rate" color="#3b82f6">
            Per esecuzione (tranche incluse), per posizione (dedup scale-out, il più onesto), pesato per capitale.
          </Card>
          <Card title="🚪 Exit Reason Breakdown" color="#eab308">
            Contributo $ per tipo di uscita: capisci quali target funzionano davvero.
          </Card>
          <Card title="📊 Profit Factor Dollar-Based" color="#8b5cf6">$ vinti / $ persi (non più su %).</Card>
          <Card title="🧪 Backtest Widget" color="#06b6d4">Metriche + equity curve. Config validata 0.4/0.7/1.0.</Card>
          <Card title="ℹ️ InfoTip + Warning" color="#f97316">Spiegazioni su ogni metrica + banner campione limitato (&lt;30 trade).</Card>
        </div>
      </Section>

      {/* 10. ML */}
      <Section emoji="🧠" title="10. Machine Learning Integration">
        <div style={{ background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#8b5cf6' }}>🆕 v5.0 Feature Engineering</strong>: da 15 a <strong>17 feature</strong>.
            Risvegliate 3 feature "zombie" (wyckoff, accumulation, bullish erano hardcoded) + aggiunte 3 interazioni
            (rsi×volume, trend strength, value proximity). Anti-overfitting (max_depth 3 + regularization).
            Accuracy 54,8% → <strong style={{ color: '#22c55e' }}>57,4%</strong>.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎲 XGBoost WIN/LOSS" color="#8b5cf6">
            17 features. Score 0-100. Contribuzione fino a +2.5 al Confluence. Training ibrido real + backtest.
          </Card>
          <Card title="📈 Trend Predictor 5D" color="#3b82f6">
            UP/FLAT/DOWN 5gg. +2.0 Confluence. Accuracy ~50% (da migliorare).
          </Card>
          <Card title="🔍 ML Health Check" color="#22c55e">
            Endpoint /api/ml/debug/health. Detect flat predictions, low variance.
          </Card>
          <Card title="🔄 Retrain Automatico" color="#eab308">
            🆕 Cron domenica 06:00: rigenera dati + ritraina sui nuovi trade reali. Report Telegram.
          </Card>
        </div>
      </Section>

      {/* 11. LLM */}
      <Section emoji="💬" title="11. LLM Reasoning (3 Providers)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🥇 Gemini 2.0 Flash" color="#4285f4">Free 1500 req/day. Primary provider.</Card>
          <Card title="🥈 Groq Llama 3" color="#f97316">Fallback veloce ~200 tok/s.</Card>
          <Card title="🥉 Cerebras" color="#22c55e">Terzo fallback per uptime.</Card>
          <Card title="💾 Cache & Cooldown" color="#8b5cf6">Cache per ticker. Cooldown per agente.</Card>
          <Card title="🧠 Cross-Agent" color="#06b6d4">APM legge Macro. Executor legge Macro + Risk + APM.</Card>
          <Card title="🔮 Prossimo: Consensus" color="#84cc16">3 provider votano, riduce sizing sul disaccordo (roadmap).</Card>
        </div>
      </Section>

      {/* 12. Execution */}
      <Section emoji="📦" title="12. Order Execution & Risk Protection">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="💵 Notional Buy" color="#3b82f6">Dollari con sizing DPS+Kelly+Regime. Fractional shares.</Card>
          <Card title="🎯 3-Step Buy Flow" color="#22c55e">place_notional_buy → wait_for_fill → SL + TP. Recalc slippage &gt; 3%.</Card>
          <Card title="🛡️ Software SL/TP" color="#f97316">Sicurezza: chiude a SL/TP anche senza ordini nativi (fractional). Check ogni 15 min.</Card>
          <Card title="🟡 Partial Close REAL" color="#8b5cf6">APM SCALE_OUT chiude X shares reali. Floor fisso automatico.</Card>
          <Card title="🔄 Trade Sync v5" color="#06b6d4">Sync Alpaca ↔ MongoDB. Anti-mismatch. Cancel stale 2h.</Card>
          <Card title="🧹 Universo Pulito" color="#84cc16">🆕 SEARCH/ETF macro esclusi da candidature (fix v5.0).</Card>
        </div>
      </Section>

      {/* 13. System Health */}
      <Section emoji="🩺" title="13. 🆕 System Health Dashboard — Il Guardiano">
        <div style={{ background: 'linear-gradient(135deg, #0a2f3a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #06b6d4' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#06b6d4', fontSize: 15 }}>🩺 Il controllore di tutto</strong>
            <br /><br />
            8 check automatici con semafori 🟢🟡🔴, auto-refresh ogni 60s (senza costi LLM).
            Un pulsante "🤖 Diagnosi AI" genera un report in italiano on-demand.
            Scova da solo problemi come dati stale, agenti fermi o modello degradato.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="📊 Freschezza Dati" color="#22c55e">Barre aggiornate (max 4gg). Avrebbe scovato il bug SPY.</Card>
          <Card title="📉 SPY / Benchmark" color="#3b82f6">Ultima barra SPY = ultimo giorno di mercato.</Card>
          <Card title="⏰ Pipeline & Alpaca" color="#eab308">Update recente + broker connesso.</Card>
          <Card title="🧠 ML & Regime" color="#8b5cf6">Accuracy + varianza predizioni + regime valido.</Card>
          <Card title="🔄 Sync Posizioni" color="#f97316">Coerenza Alpaca ↔ DB.</Card>
          <Card title="🤖 Diagnosi AI" color="#06b6d4">Report LLM italiano on-demand (solo quando lo premi).</Card>
        </div>
      </Section>

      {/* 14. Automation */}
      <Section emoji="⏰" title="14. Automation & Cron (10 attivi)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="⏰ Pipeline Stocks" color="#3b82f6">Ogni 15min in orario mercato. Disabilitata nel weekend (mercato chiuso).</Card>
          <Card title="🏛 Sectors + Market" color="#22c55e">Refresh ogni ora. SPY + ETF macro + settori.</Card>
          <Card title="🧠 ML Retrain" color="#06b6d4">🆕 Domenica 06:00. Ritraina il modello sui nuovi trade reali.</Card>
          <Card title="🧬 APM Learning" color="#8b5cf6">Domenica 07:00. Auto-tuning soglie sul modello aggiornato.</Card>
          <Card title="💓 Keep-alive" color="#eab308">Ping ogni 10min per tenere sveglio Render.</Card>
          <Card title="🔔 Telegram Bot" color="#f97316">@swinglab_alert_bot: buy/sell, APM, report 22:30.</Card>
        </div>
      </Section>

      {/* 15. Tech Stack */}
      <Section emoji="⚙️" title="15. Tech Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="Backend" color="#3b82f6">Python 3.11 + FastAPI + Motor + XGBoost + sklearn</Card>
          <Card title="Frontend" color="#22c55e">React 19 + Recharts + TradingView + Vercel</Card>
          <Card title="Database" color="#eab308">MongoDB Atlas Free M0.</Card>
          <Card title="Broker" color="#f97316">Alpaca Paper Trading v2.</Card>
          <Card title="LLM" color="#8b5cf6">Gemini 2.0 + Groq Llama3 + Cerebras.</Card>
          <Card title="Market Data" color="#06b6d4">Alpaca IEX (sort=desc fix) + Twelve Data fallback.</Card>
          <Card title="Deploy Backend" color="#ef4444">Render.com Starter async.</Card>
          <Card title="Automation" color="#f59e0b">cron-job.org: 10 cron attivi.</Card>
        </div>
      </Section>

      {/* 16. Roadmap */}
      <Section emoji="🚀" title="16. Roadmap Futura">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="✅ Completato v5.0" color="#22c55e">
            MTF Weekly, Analytics equity-based, System Health, fix dati sort, fix T2/T3, ML 17 feature + retrain cron, preset fix.
          </Card>
          <Card title="🎯 P1 — Validazione" color="#eab308">
            Verifica T2/T3 sul campo (mercato aperto). Card Unrealized P&L (realized vs equity totale).
          </Card>
          <Card title="🎯 P2 — Agenti" color="#3b82f6">
            SentimentAgent (news/earnings), CorrelationAgent, MetaAgent self-reflection, MTF Full (4H/1H).
          </Card>
          <Card title="🧠 P3 — LLM & ML" color="#8b5cf6">
            LLM Consensus (3 voti), accuracy 60%+ con più trade reali, reasoning con memoria.
          </Card>
          <Card title="🔵 P4 — Scala" color="#06b6d4">
            Universo 500 stocks, extended hours, fix date SPY 1D/1W, dual-currency EUR.
          </Card>
          <Card title="👥 P5 — Multi-User v6" color="#ef4444">
            Auth JWT, Alpaca keys AES-256, multi-tenant, Celery/Redis, Stripe, beta 50 utenti.
          </Card>
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
          🚀 <strong style={{ color: 'white' }}>SwingLab v5.0</strong> — Multi-Agent AI Trading Platform · MTF + System Health + ML Auto-Retrain
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          5 Agenti · APM Dual-Level · Adaptive Targets · DPS + Kelly · MTF Weekly · Regime-Aware · Alpaca IEX Live · 100% Automated
        </div>
      </div>
    </div>
  );
}
