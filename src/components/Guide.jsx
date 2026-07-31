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
      {/* ============ HERO ============ */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b3a 0%, #0a1628 60%, #0f172a 100%)',
        borderRadius: 16, padding: 32, marginBottom: 24, border: '2px solid #8b5cf6',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: 13, color: '#8b5cf6', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          SWINGLAB — INTELLIGENZA ARTIFICIALE PER IL TRADING
        </div>
        <h1 style={{ margin: '0 0 16px', fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
          Non è un bot che compra a caso.<br />
          <span style={{ color: '#8b5cf6' }}>È una squadra di 5 analisti AI</span> che lavora 24/7.
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.8, maxWidth: 780, margin: '0 0 20px' }}>
          Cinque specialisti allo stesso tavolo. Uno legge il <strong style={{ color: '#3b82f6' }}>quadro macro</strong> e
          annusa i <strong style={{ color: '#ef4444' }}>crash</strong>. Uno caccia le <strong style={{ color: '#22c55e' }}>migliori opportunità</strong> incrociando 17 fattori.
          Uno decide <strong style={{ color: '#eab308' }}>quanto rischiare</strong> con la matematica di Kelly. Uno
          <strong style={{ color: '#8b5cf6' }}> gestisce ogni posizione</strong> minuto per minuto. Uno <strong style={{ color: '#f97316' }}>esegue</strong> con
          precisione chirurgica. Si parlano tra loro, imparano dai propri errori ogni domenica, e non dormono mai.
        </p>
        <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.7, maxWidth: 780, margin: '0 0 20px' }}>
          Ogni decisione è <strong style={{ color: 'white' }}>tracciata, spiegata in italiano e misurabile</strong>. Niente scatole nere.
          E c'è di più: un modulo <strong style={{ color: '#ef4444' }}>Progetto Alpha</strong> validato scientificamente su 68 anni di dati —
          quando arriva un vero crash, il sistema <strong style={{ color: '#ef4444' }}>compra l'inferno a fette</strong> mentre gli altri vanno nel panico.
        </p>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 20, paddingTop: 20, borderTop: '1px solid #334155' }}>
          <div><div style={{ fontSize: 26, fontWeight: 900, color: '#22c55e' }}>1,67</div><div style={{ fontSize: 11, color: '#64748b' }}>Sharpe Ratio</div></div>
          <div><div style={{ fontSize: 26, fontWeight: 900, color: '#06b6d4' }}>0,24</div><div style={{ fontSize: 11, color: '#64748b' }}>Beta (difensivo)</div></div>
          <div><div style={{ fontSize: 26, fontWeight: 900, color: '#ef4444' }}>+14,5%</div><div style={{ fontSize: 11, color: '#64748b' }}>Crash Deploy vs mkt (2022)</div></div>
          <div><div style={{ fontSize: 26, fontWeight: 900, color: '#8b5cf6' }}>100%</div><div style={{ fontSize: 11, color: '#64748b' }}>Automatizzato</div></div>
        </div>
      </div>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #334155',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 32 }}>📖</span>
          <h2 style={{ margin: 0, fontSize: 24 }}>SwingLab — How It Works</h2>
          <span style={{
            background: '#ef444420', color: '#ef4444', padding: '4px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 700, border: '1px solid #ef444444',
          }}>v6.0 · PROGETTO ALPHA</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>
          <strong style={{ color: 'white' }}>SwingLab v6.0</strong> è una piattaforma di <strong style={{ color: '#3b82f6' }}>swing trading algoritmico</strong> con
          architettura <strong style={{ color: '#22c55e' }}>Multi-Agent AI a 5 agenti</strong>. Sistema difensivo (beta ~0,24) con
          <strong style={{ color: '#ef4444' }}> Crash Radar & Crash Deploy validato</strong>, <strong style={{ color: '#8b5cf6' }}>APM Dual-Level</strong>,
          Adaptive Targets, DPS + Kelly, MTF Weekly, SentimentAgent, POC Shift (metodo Rea), Sector Rotation e System Health.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ background: '#ef444420', color: '#ef4444', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Crash Deploy validato</span>
          <span style={{ background: '#22c55e20', color: '#22c55e', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ 5 Multi-Agent AI</span>
          <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ POC Shift (Rea)</span>
          <span style={{ background: '#06b6d420', color: '#06b6d4', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ SentimentAgent</span>
          <span style={{ background: '#eab30820', color: '#eab308', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ Sector Rotation</span>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ DPS + Kelly</span>
          <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>✓ System Health</span>
        </div>
      </div>

      {/* ============ PROGETTO ALPHA ============ */}
      <div style={{
        background: 'linear-gradient(135deg, #3a0a0a 0%, #0f172a 100%)',
        borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid #ef4444',
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 20, color: '#ef4444' }}>🔴 PROGETTO ALPHA — L'arma validata sui dati</h3>
        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, margin: '8px 0 16px' }}>
          Un sistema difensivo non batte il mercato inseguendo i rialzi (lo abbiamo dimostrato con oltre 10 test scientifici).
          Lo batte facendo l'opposto: <strong style={{ color: '#ef4444' }}>comprando i crash a fette quando tutti vendono</strong>.
          Questa è l'unica leva di alpha validata — su un vero bear market avrebbe reso <strong style={{ color: '#22c55e' }}>+14,5% oltre il buy&hold</strong>.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🌡️ Crash Radar" color="#ef4444">
            Score 0-100 nel MacroAnalyst: drawdown SPY dal massimo + VIX. NORMAL / WATCH / DEPLOY / DEPLOY_MAX.
            Soglie validate su Quant Rea (dati 1950-2025, win rate 100% a −20%).
          </Card>
          <Card title="🔴 Crash Deploy a Fette" color="#ef4444">
            Nei crash libera capitale dallo swing e compra SPY a fette (−8/−15/−25%). Tiene fino al massimo precedente,
            poi lascia una fetta long-term. <strong>Validato: +14,5% sul bear 2022</strong>.
          </Card>
          <Card title="🛡️ Tripla Sicurezza" color="#eab308">
            Flag master OFF + modalità Simulazione (dry-run) + gate regime (agisce SOLO in BEAR/CRASH). In bull dorme,
            zero rischio. Toggle nel tab Salute.
          </Card>
          <Card title="🗺️ Sector Rotation (Rea)" color="#22c55e">
            Heatmap dei flussi di capitale: Ann3M vs Ann6M (accelerazione) + compressione 20d. Segnala i settori
            ESPLOSIVI / in entrata / in uscita. Strumento informativo per leggere il mercato.
          </Card>
        </div>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#22c55e15', border: '1px solid #22c55e33', fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
          🔬 <strong style={{ color: '#22c55e' }}>Metodo scientifico:</strong> ogni idea (momentum, rotazione, esposizione, bottom) è stata
          testata nel Backtest Lab. Solo ciò che ha battuto i dati è entrato in produzione. La disciplina quant sopra l'entusiasmo.
        </div>
      </div>

      {/* ============ COME RAGIONA ============ */}
      <Section emoji="🧠" title="COME RAGIONA — Il ciclo di vita di un trade">
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>
          Ogni 15 minuti (a mercato aperto) parte una pipeline. Ecco cosa succede, passo per passo.
        </div>
        <Step n="1" title="🌍 Legge il mercato (MacroAnalyst)" color="#3b82f6">
          Analizza 17 indicatori macro e stabilisce il <strong>regime</strong>: BULL/NEUTRAL/BEAR/CRASH. Calcola il
          <strong style={{ color: '#ef4444' }}> Crash Radar</strong> (rischio crash 0-100) e la <strong>rotazione settoriale</strong>.
          È il "meteo" su cui tutti gli altri agenti si basano.
        </Step>
        <Step n="2" title="🎯 Caccia le opportunità (AlphaStrategist)" color="#22c55e">
          Passa in rassegna i 219 titoli e calcola un <strong>Confluence Score</strong> su 17 fattori (tecnici + ML + MTF +
          <strong style={{ color: '#06b6d4' }}> POC Shift</strong>). Solo chi supera la soglia (48) diventa candidato. Sui top 10 aggiunge il
          <strong style={{ color: '#06b6d4' }}> SentimentAgent</strong> (news + earnings) e chiede un parere all'LLM.
        </Step>
        <Step n="3" title="🛡️ Decide quanto rischiare (RiskManager)" color="#eab308">
          Sizing a formula: <strong>Base × DPS × Kelly × Regime</strong>. Filtra R/R minimo, max posizioni, max per settore,
          riserva di cassa e limiti di perdita giornalieri/settimanali.
        </Step>
        <Step n="4" title="⚡ Esegue con precisione (Executor)" color="#f97316">
          Ordine in dollari (fractional), attende il fill reale, imposta SL/TP sul prezzo effettivo e calcola i
          <strong> target adattivi T1/T2/T3</strong> in base alla volatilità (ATR).
        </Step>
        <Step n="5" title="🎯 Gestisce la posizione viva (APM)" color="#8b5cf6">
          Scale-out parziale ai target (50/30/20%), floor "lascia correre" dopo T1, minimum holding 24h anti-churning.
          Ogni ora rivaluta la tesi con LLM. Se il quadro si rompe esce, se corre lascia correre.
        </Step>
        <Step n="6" title="🧬 Impara dai propri errori (Learning)" color="#06b6d4">
          Domenica 06:00 il ML si <strong>ritraina</strong> sui nuovi trade; 07:00 l'APM auto-regola le soglie.
          Il sistema di lunedì è più intelligente di quello di venerdì.
        </Step>
        <div style={{ marginTop: 8, padding: 14, borderRadius: 8, background: '#06b6d415', border: '1px solid #06b6d444', fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.6 }}>
          🩺 <strong style={{ color: '#06b6d4' }}>E il guardiano?</strong> Un System Health Dashboard controlla in continuo dati,
          agenti, broker e ML. Semafori 🟢🟡🔴 + diagnosi AI in italiano on-demand.
        </div>
      </Section>

      {/* Numeri */}
      <Section emoji="📊" title="Sistema in Numeri (v6.0)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Metric label="Universo Stock" value="219" color="#3b82f6" />
          <Metric label="Settori SPDR" value="11" color="#22c55e" />
          <Metric label="Macro Indicators" value="17" color="#eab308" />
          <Metric label="Fattori Confluence" value="17" color="#f97316" />
          <Metric label="Agenti AI" value="5" color="#8b5cf6" />
          <Metric label="ML Features" value="17" color="#06b6d4" />
          <Metric label="Timeframe" value="2 (D+W)" color="#ef4444" />
          <Metric label="Cron Active" value="10" color="#22c55e" />
        </div>
      </Section>

      {/* Confluence 17 fattori */}
      <Section emoji="🎯" title="Confluence Score — 17 Fattori (soglia 48)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            L'AlphaStrategist calcola un <strong style={{ color: '#22c55e' }}>Confluence Score</strong> (0-100) su 17 fattori pesati.
            Soglia minima <strong>48</strong> (alzata da 35 per qualità superiore). 13 Rule-Based + 2 ML + 1 MTF +
            <strong style={{ color: '#06b6d4' }}> 1 POC Shift</strong>.
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
            { name: '16. 📅 MTF Weekly', max: 2.5, color: '#06b6d4' },
            { name: '17. 🆕 POC Shift (Rea)', max: 3.0, color: '#ef4444' },
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

      {/* POC Shift */}
      <Section emoji="🔄" title="🆕 POC Shift Detector — Il metodo di Massimo Rea">
        <div style={{ background: 'linear-gradient(135deg, #2a0a0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #ef4444' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#ef4444', fontSize: 15 }}>🔄 Il muro che diventa pavimento</strong>
            <br /><br />
            Il POC (Point of Control) è il prezzo dove si è scambiato più volume — un livello che "difende". Quando un titolo
            depresso accumula volume, il POC <strong>si sposta da sopra il prezzo (resistenza) a sotto (supporto)</strong>:
            il muro sopra la testa diventa un pavimento sotto i piedi. È un <strong style={{ color: '#22c55e' }}>segnale bullish</strong>.
            <br /><br />
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#ef4444' }}>
              POC era SOPRA il prezzo (resistenza)<br />
              → ora è SOTTO (supporto)  = SHIFT BULL<br />
              + accumulation_score ≥ 50 (volume in entrata)<br />
              + pattern bullish / Wyckoff spring (rottura)<br />
              → +3.0 confluence (setup contrarian confermato)
            </div>
            <br />
            <strong style={{ color: '#eab308' }}>Non alla cieca:</strong> non compra "vicino al POC" (che può sfondare), ma solo con la
            conferma di accumulazione + rottura — esattamente come fa Rea.
          </div>
        </div>
      </Section>

      {/* SentimentAgent */}
      <Section emoji="📰" title="🆕 SentimentAgent — Il sesto senso narrativo">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="📰 News + Sentiment LLM" color="#06b6d4">
            Sui top 10 candidati legge le news via Alpaca + LLM. Sentiment POSITIVO +5, NEGATIVO −8. Efficiente:
            solo sui migliori, non sui 219.
          </Card>
          <Card title="⚠️ Protezione Earnings" color="#ef4444">
            Rileva earnings imminenti (campo dedicato LLM) → −15 confluence. Evita il rischio n°1 dello swing:
            il gap notturno post-trimestrale.
          </Card>
          <Card title="🎯 Filtro di qualità" color="#22c55e">
            Compra i titoli tecnicamente forti con news positive, evita quelli con news disastrose. Il contesto
            che i numeri non vedono.
          </Card>
        </div>
      </Section>

      {/* Multi-Agent */}
      <Section emoji="🤖" title="Multi-Agent AI (5 Agenti)">
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, textAlign: 'center', lineHeight: 1.7 }}>
            <strong style={{ color: '#8b5cf6' }}>5 agenti AI</strong> in pipeline sequenziale, comunicano via
            <strong style={{ color: '#8b5cf6' }}> Shared Brain (MongoDB)</strong>, leggono il reasoning degli altri.
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 16 }}>
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
            <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #334155', margin: '8px 0 0' }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 12 }}>🧠 Shared Brain (MongoDB)</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🌍 MacroAnalyst" color="#3b82f6">17 indicatori, regime BULL/NEUTRAL/BEAR/CRASH, Crash Radar, rotazione settoriale, exposure multiplier.</Card>
          <Card title="🎯 AlphaStrategist" color="#22c55e">Confluence 17 fattori, soglia 48, target ATR-based, SentimentAgent, POC Shift. LLM sui top 5.</Card>
          <Card title="🛡 RiskManager" color="#eab308">DPS + Kelly + Regime. Sizing dinamico, limiti di perdita, riserva cash, max per settore.</Card>
          <Card title="🎯 APM Dual-Level" color="#8b5cf6">Scale-out T1/T2/T3, floor lascia-correre, minimum holding 24h anti-churning, regime-aware exit.</Card>
          <Card title="⚡ Executor" color="#f97316">Notional buy + recalc slippage. Software SL/TP. Trailing. Trade Sync. Cancel stale.</Card>
        </div>
      </Section>

      {/* Crash Deploy dettaglio */}
      <Section emoji="🔴" title="Crash Deploy — Come funziona (validato +14,5%)">
        <div style={{ background: 'linear-gradient(135deg, #2a0a0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #ef4444' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#ef4444', fontSize: 15 }}>💰 Compra l'inferno a fette</strong>
            <br /><br />
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#ef4444' }}>
              Drawdown SPY −8%   → Fetta 1 (30% munizioni)<br />
              Drawdown SPY −15%  → Fetta 2 (40%) + libera swing<br />
              Drawdown SPY −25%  → Fetta 3 (30%, quasi il fondo)<br />
              Ritorno al massimo → trim 80%, tieni 20% long-term
            </div>
            <br />
            <strong style={{ color: '#22c55e' }}>Backtest bear 2022:</strong> Crash Deploy +2,76% vs Buy&Hold −11,71% = <strong>+14,48%</strong>.
            Le fette scattarono a −8% ($439), −16% ($398), −25% ($357 — quasi il minimo assoluto).
            <br /><br />
            <strong style={{ color: '#eab308' }}>Regola d'oro:</strong> attivo solo in BEAR/CRASH prolungati. Nei bull dorme. È un'assicurazione che rende.
          </div>
        </div>
      </Section>

      {/* DPS + Kelly */}
      <Section emoji="💰" title="Dynamic Position Sizing + Kelly Criterion">
        <div style={{ background: 'linear-gradient(135deg, #3a2f0a 0%, #0f172a 100%)', borderRadius: 10, padding: 20, marginBottom: 14, border: '2px solid #eab308' }}>
          <div style={{ fontSize: 13, color: 'white', lineHeight: 1.7 }}>
            <strong style={{ color: '#eab308', fontSize: 15 }}>💰 Triple Intelligence Sizing</strong>
            <br /><br />
            <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#eab308' }}>
              Size = Base × DPS × Kelly × Regime<br /><br />
              DPS   = R/R × ML × Confluence<br />
              Kelly = Fractional_Kelly × Volatility_Adjust<br />
              Regime = BULL 1.0 · NEUTRAL 0.6 · BEAR 0.3
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎯 R/R Multiplier" color="#22c55e">Premia i trade con rischio/rendimento migliore.</Card>
          <Card title="🧠 ML Multiplier" color="#8b5cf6">Più size se il ML predice WIN con alta probabilità.</Card>
          <Card title="💰 Kelly Criterion" color="#eab308">Kelly% = (WR × avg_win − LR × avg_loss)/avg_win. Fractional. Attivo con &gt;20 trade.</Card>
          <Card title="📉 Volatility (VIX)" color="#ef4444">Riduce la size quando la volatilità è alta/estrema.</Card>
        </div>
      </Section>

      {/* Risk Presets */}
      <Section emoji="🎚️" title="Risk Profile Presets">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="🛡️ Conservativo" color="#22c55e">5 pos · 8% size · R/R 2:1 · Kelly OFF</Card>
          <Card title="🎯 Moderato" color="#3b82f6">8 pos · 12% size · R/R 1.5:1 · Kelly 0.20</Card>
          <Card title="⚡ Aggressivo" color="#f97316">12 pos · 18% size · R/R 1.3:1 · Kelly 0.25</Card>
          <Card title="🚀 Super Aggressivo" color="#ef4444">15 pos · 22% size · R/R 1.2:1 · Kelly 0.35</Card>
          <Card title="🔧 Avanzato" color="#8b5cf6">30+ slider per power user.</Card>
        </div>
      </Section>

      {/* Backtest Lab */}
      <Section emoji="🔬" title="Backtest Lab — Il laboratorio scientifico">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="📈 Equity vs SPY" color="#22c55e">Curva del sistema sovrapposta a SPY. Alpha, Beta, Correlazione a colpo d'occhio.</Card>
          <Card title="🎛️ Toggle configurabili" color="#3b82f6">Momentum, Sector Bottom, Crash Deploy, preset di rischio. Test A/B su ogni idea.</Card>
          <Card title="📊 Metriche oneste" color="#eab308">Sharpe, Sortino, Max Drawdown, Win Rate, Profit Factor. Return equity-based reale.</Card>
          <Card title="🧪 Storico esteso" color="#8b5cf6">Modulo SPY/ETF history (2020-2026) per validare le strategie sui crash veri (2022).</Card>
        </div>
      </Section>

      {/* System Health */}
      <Section emoji="🩺" title="System Health Dashboard — Il Guardiano">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="🌡️ Badge Progetto Alpha" color="#ef4444">Crash Risk in tempo reale + settori in bottom. Toggle Crash Deploy con sicurezze.</Card>
          <Card title="📊 Freschezza Dati" color="#22c55e">Barre aggiornate (max 4gg). Scova i dati stale.</Card>
          <Card title="🔄 Sync Posizioni" color="#f97316">Coerenza Alpaca ↔ DB (tolleranza ai glitch temporanei).</Card>
          <Card title="🧠 ML & Regime" color="#8b5cf6">Accuracy + varianza predizioni + regime valido.</Card>
          <Card title="⏰ Pipeline & Alpaca" color="#eab308">Update recente + broker connesso.</Card>
          <Card title="🤖 Diagnosi AI" color="#06b6d4">Report LLM italiano on-demand.</Card>
        </div>
      </Section>

      {/* ML */}
      <Section emoji="🧠" title="Machine Learning">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          <Card title="🎲 XGBoost WIN/LOSS" color="#8b5cf6">17 features (zombie risvegliate + interazioni). Anti-overfitting. Training ibrido real + backtest.</Card>
          <Card title="📈 Trend Predictor 5D" color="#3b82f6">UP/FLAT/DOWN a 5 giorni. Contribuisce alla confluence.</Card>
          <Card title="🔄 Retrain Automatico" color="#eab308">Cron domenica 06:00: rigenera dati + ritraina sui nuovi trade reali. Report Telegram.</Card>
          <Card title="🎯 Accuracy in crescita" color="#22c55e">Migliora man mano che accumuli trade reali. Il ML impara dal tuo trading.</Card>
        </div>
      </Section>

      {/* Tech Stack */}
      <Section emoji="⚙️" title="Tech Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Card title="Backend" color="#3b82f6">Python 3.11 + FastAPI + Motor + XGBoost + sklearn</Card>
          <Card title="Frontend" color="#22c55e">React 19 + Recharts + TradingView + Vercel</Card>
          <Card title="Database" color="#eab308">MongoDB Atlas</Card>
          <Card title="Broker" color="#f97316">Alpaca Paper Trading v2</Card>
          <Card title="LLM" color="#8b5cf6">Gemini + Groq + Cerebras (fallback)</Card>
          <Card title="Market Data" color="#06b6d4">Alpaca IEX + Twelve Data fallback</Card>
          <Card title="Deploy" color="#ef4444">Render.com Starter async</Card>
          <Card title="Automation" color="#f59e0b">cron-job.org: 10 cron</Card>
        </div>
      </Section>

      {/* Roadmap */}
      <Section emoji="🚀" title="Roadmap Futura">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          <Card title="✅ Completato v6.0" color="#22c55e">
            Progetto Alpha (Crash Radar, Crash Deploy validato, Sector Rotation), SentimentAgent, POC Shift, confluence 48, anti-churning, target ATR.
          </Card>
          <Card title="🎯 P1 — Agenti" color="#3b82f6">CorrelationAgent (anti-concentrazione), MetaAgent (auto-riflessione serale), MTF Full 4H/1H.</Card>
          <Card title="🧠 P2 — LLM & ML" color="#8b5cf6">LLM Consensus (3 provider votano), accuracy 60%+, reasoning con memoria (RAG sui trade).</Card>
          <Card title="🔵 P3 — Scala" color="#06b6d4">Universo 500 stocks, storico titoli lungo per validare Sector Bottom, dual-currency EUR.</Card>
          <Card title="👥 P4 — Multi-User" color="#ef4444">Auth JWT, Alpaca keys AES-256, multi-tenant, Stripe, beta utenti.</Card>
        </div>
      </Section>

      {/* FOOTER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)',
        borderRadius: 12, padding: 20, marginTop: 24, border: '2px solid #8b5cf6', textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
          🚀 <strong style={{ color: 'white' }}>SwingLab v6.0</strong> — Multi-Agent AI Trading Platform · Progetto Alpha
        </div>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, maxWidth: 700, margin: '0 auto' }}>
          "Prima difendi, poi compra l'inferno." Un sistema difensivo (beta 0,24, Sharpe 1,67) che protegge nei ribassi
          e deploya sui crash. Validato scientificamente, non a sensazione.
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 10 }}>
          5 Agenti · Crash Deploy validato · POC Shift · SentimentAgent · DPS + Kelly · MTF · System Health · 100% Automated
        </div>
      </div>
    </div>
  );
}
