import React from 'react';

const box = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 18, marginBottom: 16 };

function Section({ title, color = '#334155', children }) {
  return (
    <section style={{ ...box, borderLeft: `4px solid ${color}` }}>
      <h3 style={{ margin: '0 0 12px' }}>{title}</h3>
      <div style={{ color: '#cbd5e1', fontSize: 12.5, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function Cards({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
      {items.map((item) => (
        <div key={item.title} style={{ background: '#111827', border: '1px solid #1e293b', borderTop: `3px solid ${item.color}`, borderRadius: 9, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ color: item.color, fontWeight: 800 }}>{item.title}</span>
            {item.badge && <Badge kind={item.badge} />}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 11.5, lineHeight: 1.6 }}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}

const BADGES = {
  LIVE: '#22c55e',
  OFF: '#64748b',
  BACKTEST: '#a78bfa',
  SHADOW: '#f59e0b',
};

function Badge({ kind }) {
  const color = BADGES[kind] || '#64748b';
  return (
    <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999, color, background: `${color}1a`, border: `1px solid ${color}55` }}>
      {kind}
    </span>
  );
}

function Table({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>{head.map((h) => <th key={h} style={{ textAlign: 'left', color: '#94a3b8', fontWeight: 700, padding: '6px 8px', borderBottom: '1px solid #1e293b' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => <td key={i} style={{ padding: '6px 8px', borderBottom: '1px solid #111827', color: '#e2e8f0' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Guide() {
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', border: '1px solid #4c1d95', borderRadius: 16, padding: 28, marginBottom: 18 }}>
        <div style={{ color: '#a78bfa', fontWeight: 900, fontSize: 11 }}>SWINGLAB V3 · GUIDA OPERATIVA</div>
        <h1 style={{ margin: '8px 0 12px' }}>Un portafoglio attivo a più canali, per battere SPY</h1>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
          SwingLab analizza 300 titoli in 11 settori su Alpaca paper. Ogni canale lavora in una fase diversa del mercato:
          Alpha nei pullback, Max Strategy nei bottom, Trend Leadership nei rialzi, Crash Deploy nei crolli.
          Tutti i comandi dei canali si trovano in <strong>Settings → Canali di trading</strong>.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <Badge kind="LIVE" /><span style={{ color: '#94a3b8', fontSize: 11 }}>compra davvero (paper)</span>
          <Badge kind="SHADOW" /><span style={{ color: '#94a3b8', fontSize: 11 }}>osserva, non compra</span>
          <Badge kind="BACKTEST" /><span style={{ color: '#94a3b8', fontSize: 11 }}>validato solo nel backtest</span>
          <Badge kind="OFF" /><span style={{ color: '#94a3b8', fontSize: 11 }}>spento perché peggiora i risultati</span>
        </div>
      </div>

      <Section title="1 · Come gira il sistema" color="#22d3ee">
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><strong>Dati</strong>: cron-job.org avvia la pipeline Stocks. Un lock impedisce due pipeline contemporanee.</li>
          <li><strong>Analisi</strong>: per ogni titolo indicatori, struttura e Max Strategy, salvati pronti in MongoDB.</li>
          <li><strong>MacroAnalyst</strong>: regime (BULL … CRASH), leadership RSP/QQQ/IWM, settori focus ed esposizione.</li>
          <li><strong>AlphaStrategist</strong>: candidati Alpha e, se attivo, candidati Max.</li>
          <li><strong>RiskManager</strong>: limiti di perdita, slot per canale, settori, R/R, size con DPS × Kelly × regime.</li>
          <li><strong>APM</strong>: gestione posizioni con scale-out 30/30/25 e floor 0/+3/+8%.</li>
          <li><strong>Executor</strong>: ordini notional, stop e target software, registro trade con il canale di origine.</li>
        </ol>
      </Section>

      <Section title="2 · I canali" color="#22c55e">
        <Cards items={[
          { title: 'Alpha', badge: 'LIVE', color: '#3b82f6', text: 'Pullback e rimbalzi su titoli sani. Confluence a 17 fattori, soglia per settore. Usa gli slot non riservati.' },
          { title: 'Max Strategy', badge: 'LIVE', color: '#f59e0b', text: 'Bottom e riaccumuli. 4 slot riservati, stop massimo 8% sotto l’ingresso, R/R minimo 1,0. Interruttore in Settings.' },
          { title: 'Crash Deploy', badge: 'LIVE', color: '#ef4444', text: 'Compra SPY a fette nei crolli (regime BEAR/CRASH, drawdown −8%). Interruttore e modalità in Settings.' },
          { title: 'Trend Leadership', badge: 'BACKTEST', color: '#a78bfa', text: 'Leader vicini ai massimi e più forti di SPY. 4 slot, uscita sotto EMA50. Prossimo canale da attivare.' },
          { title: 'Core SPY 60%', badge: 'BACKTEST', color: '#94a3b8', text: 'Quota fissa in SPY che dà il beta di base. Da attivare dopo Trend Leadership.' },
        ]} />
        <div style={{ marginTop: 12 }}>
          <Cards items={[
            { title: 'Sector Intelligence', badge: 'OFF', color: '#64748b', text: 'Peggiora l’alpha in tutti e quattro i test.' },
            { title: 'APM Exit Proxy', badge: 'OFF', color: '#64748b', text: 'Toglie circa 10 punti di rendimento.' },
            { title: 'Rotazione settoriale', badge: 'OFF', color: '#64748b', text: 'Solo informativa.' },
            { title: 'Parcheggio SPY in BULL', badge: 'OFF', color: '#64748b', text: 'Si attiva troppo poco: sostituito dal Core SPY.' },
          ]} />
        </div>
      </Section>

      <Section title="3 · Max Strategy v1.5.2" color="#f59e0b">
        <p style={{ marginTop: 0 }}>Max non compra ciò che è semplicemente sceso: cerca arresto del ribasso, accumulazione e conferma.</p>
        <Cards items={[
          { title: 'Weekly', color: '#8b5cf6', text: 'POC maestro, rounding, neck, trendline discendente e fase del ciclo. Qualifica il piano.' },
          { title: 'Daily', color: '#3b82f6', text: 'Conferma breakout, volume, candela, trigger e prezzo massimo d’ingresso.' },
          { title: '4H', color: '#06b6d4', text: 'Rifinisce breakout e retest. Se manca si usa il Daily.' },
        ]} />
        <div style={{ marginTop: 12, background: '#111827', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8 }}>
          ARMED → TRIGGERED → CONFIRMED_4H / CONFIRMED_DAILY / WAIT_RETEST → INVALIDATED · EXPIRED (15 barre) · CLOSED (20 barre)<br />
          Un piano per struttura, chiave stabile: ticker:fonte_trigger:data. Uno stato confermato non torna mai ARMED.
        </div>
        <p style={{ marginBottom: 0 }}>
          <strong>Ingresso live</strong>: solo con prezzo tra trigger e prezzo massimo d’ingresso, piano qualificato e regime diverso da CRASH.
          Gate attivi: Falling Knife, Mature Markup, nuovi minimi weekly, qualità dati, ticker stale o delistati.
        </p>
      </Section>

      <Section title="4 · Risultati del backtest" color="#a78bfa">
        <p style={{ marginTop: 0 }}>Configurazione: Core SPY 60% + Alpha + Trend (4 slot) + Max (4 slot, stop 8%) + Crash Deploy + DPS/Kelly.</p>
        <Table
          head={['Periodo', 'SwingLab', 'SPY', 'Alpha', 'Sharpe (SPY)', 'Max DD (SPY)']}
          rows={[
            ['750 giorni', '+85,5%', '+79,5%', '+6,0', '1,59 (1,40)', '16,8% (19,0%)'],
            ['360 giorni', '+42,6%', '+39,7%', '+2,9', '2,24 (1,97)', '6,6% (9,1%)'],
            ['180 giorni', '+20,4%', '+15,1%', '+5,3', '2,24 (1,59)', '5,5% (9,1%)'],
          ]}
        />
        <p style={{ marginBottom: 0, color: '#94a3b8', fontSize: 11.5 }}>
          Limiti: parametri scelti sugli stessi dati, costi di transazione esclusi, Max solo su daily, universo attuale (survivorship bias),
          209 titoli su 300 con storico completo. Il risultato richiede i tre canali insieme: Max da solo non batte SPY.
        </p>
      </Section>

      <Section title="5 · Backtest Lab" color="#8b5cf6">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Gira in background: puoi cambiare pagina, il risultato resta disponibile. Un solo backtest alla volta.</li>
          <li><strong>Usa parametri live dal database</strong>: prende max posizioni, size e confluence reali. Tienilo sempre attivo.</li>
          <li>Max Strategy richiede la <strong>scansione storica</strong> completata (riquadro arancione).</li>
          <li>Metriche per posizione completa, canali separati ALPHA / TREND / MAX, confronto di rischio con SPY.</li>
        </ul>
      </Section>

      <Section title="6 · Regole operative" color="#ef4444">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Non chiamare <code>/api/agents/learn</code>: il Learning Loop conta ancora le tranche come trade separati.</li>
          <li>Non giudicare Max nelle prime 2-4 settimane e non cambiarne i parametri.</li>
          <li>Accendi un canale alla volta e solo da Settings.</li>
          <li>La pagina Salute mostra lo stato del sistema e il Crash Risk; non contiene comandi.</li>
        </ul>
      </Section>

      <Section title="7 · Roadmap" color="#f97316">
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li>Max live in osservazione.</li>
          <li>Trend Leadership live con interruttore.</li>
          <li>Core SPY 60% live.</li>
          <li>Confronto settimanale live / backtest / SPY.</li>
          <li>Correzione del Learning Loop (per posizione).</li>
          <li>GLD e SLV nell’universo, poi canale BTC con filtro TOTAL e dominance.</li>
        </ol>
      </Section>
    </div>
  );
}
