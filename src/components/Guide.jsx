import React from 'react';
import { AGENT_INFO } from '../utils/constants';

const Section = ({ emoji, title, children }) => (
  <div
    style={{
      background: '#0f172a',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      border: '1px solid #1e293b',
    }}
  >
    <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>
      {emoji} {title}
    </h3>
    {children}
  </div>
);

const Card = ({ title, color, children }) => (
  <div
    style={{
      background: '#1e293b',
      borderRadius: 8,
      padding: 12,
      borderLeft: `3px solid ${color || '#3b82f6'}`,
    }}
  >
    <div
      style={{
        fontWeight: 600,
        fontSize: 13,
        color: color || 'white',
        marginBottom: 6,
      }}
    >
      {title}
    </div>
    <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>{children}</div>
  </div>
);

export default function Guide() {
  return (
    <div>
      <h2>{'\uD83D\uDCD6'} How SwingLab Works</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>
        SwingLab è un sistema di swing trading automatizzato con 4 agenti AI che
        analizzano il mercato, selezionano stock, gestiscono il rischio ed eseguono
        ordini su Alpaca.
      </p>

      <Section emoji={'\uD83D\uDCE1'} title="1. Data Sources">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10,
          }}
        >
          <Card title={'\uD83D\uDCC8 220 Stock'} color="#3b82f6">
            20 stock per ognuno degli 11 settori S&P. Dati storici salvati in
            MongoDB con refresh incrementale ogni ora.
          </Card>
          <Card title={'\uD83C\uDFDB 11 Settori'} color="#22c55e">
            ETF settoriali SPDR: XLK (Tech), XLF (Finance), XLV (Health), XLI, XLY,
            XLP, XLE, XLU, XLB, XLRE, XLC
          </Card>
          <Card title={'\uD83D\uDCCA Indici USA'} color="#eab308">
            SPY (S&P 500), QQQ (Nasdaq), IWM (Russell 2000), DIA (Dow Jones)
          </Card>
          <Card title={'\uD83E\uDE99 Crypto & FX'} color="#f97316">
            BTC/USD, ETH/USD, FXE (Euro), UUP (Dollar), VIXY (VIX proxy)
          </Card>
        </div>
      </Section>

      <Section emoji={'\uD83D\uDCCA'} title="2. Indicatori Tecnici">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 10,
          }}
        >
          <Card title="RSI (Relative Strength Index)" color="#3b82f6">
            Misura se una stock è ipercomprata o ipervenduta.
            <br />
            0-30 = Oversold (possibile rimbalzo) | 30-70 = Normale | 70-100 =
            Overbought
          </Card>
          <Card title="MACD" color="#22c55e">
            Misura il momentum. Histogram {'>'} 0 = momentum positivo. Crossover =
            segnale BUY/SELL.
          </Card>
          <Card title="EMA (10/20/50)" color="#eab308">
            Medie mobili esponenziali. Price {'>'} EMA10 {'>'} EMA20 {'>'} EMA50 =
            uptrend perfetto!
          </Card>
          <Card title="Volume Profile & POC" color="#f97316">
            POC = prezzo con più volume (supporto forte). Value Area = zona del 70%
            del volume.
          </Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">
            Accumulation → Markup → Distribution → Markdown. Spring = rimbalzo forte!
          </Card>
          <Card title="Candlestick & FVG" color="#ef4444">
            Hammer, Engulfing, Doji, Morning/Evening Star. FVG = gap dove il prezzo
            torna.
          </Card>
        </div>
      </Section>

      <Section emoji={'\uD83C\uDFAF'} title="3. Scoring System">
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <Card title="Setup Score (0-100)" color="#3b82f6">
            EMA alignment: +25 | RSI sweet spot: +15 | MACD: +10 | Volume: +10 |
            POC: +15 | Sector: +10 | Patterns: +15. Score {'>'} 70 = Strong Buy
          </Card>
          <Card title="Confluence Score (0-100)" color="#22c55e">
            Usato dagli agenti AI. Combina 13 fattori con pesi regolabili. Più
            fattori convergono = segnale più affidabile!
          </Card>
        </div>
      </Section>

      <Section emoji={'\uD83E\uDD16'} title="4. I 4 Agenti AI">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(AGENT_INFO).map(([name, info], i) => (
            <React.Fragment key={name}>
              {i > 0 && (
                <div style={{ color: '#475569', fontSize: 24, margin: '0 8px' }}>
                  {'\u2192'}
                </div>
              )}
              <div
                style={{
                  background: '#1e293b',
                  borderRadius: 10,
                  padding: '12px 20px',
                  border: `2px solid ${info.color}`,
                  textAlign: 'center',
                  minWidth: 140,
                }}
              >
                <div style={{ fontSize: 24 }}>{info.emoji}</div>
                <div
                  style={{
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 4,
                  }}
                >
                  {info.name}
                </div>
                <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
                  {info.desc}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 10,
          }}
        >
          <Card title={'\uD83C\uDF0D MacroAnalyst'} color="#3b82f6">
            Studia il mercato. Output: regime (BULL/NEUTRAL/BEAR/CRASH) e %
            esposizione.
          </Card>
          <Card title={'\uD83C\uDFAF AlphaStrategist'} color="#22c55e">
            Scansiona 220 stock. Seleziona candidati BUY e segnali SELL.
          </Card>
          <Card title={'\uD83D\uDEE1 RiskManager'} color="#eab308">
            Calcola position sizing, approva/rifiuta trade, controlla limiti
            rischio.
          </Card>
          <Card title={'\u26A1 Executor'} color="#f97316">
            Piazza bracket orders (entry + TP + SL), notifica Telegram, cancella
            ordini vecchi.
          </Card>
        </div>
      </Section>

      <Section emoji={'\uD83D\uDCE6'} title="5. Bracket Orders">
        <Card title="Come funziona" color="#3b82f6">
          Ogni trade piazza 3 ordini collegati: 1) BUY limit order 2) TAKE PROFIT
          automatico al target (VA High) 3) STOP LOSS automatico (VA Low).
          Mutuamente esclusivi: se scatta TP, SL si cancella e viceversa. Funzionano
          anche se il sistema è offline!
        </Card>
      </Section>

      <Section emoji={'\uD83D\uDCDA'} title="6. Glossario">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 8,
          }}
        >
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
          ].map(([t, d]) => (
            <div
              key={t}
              style={{
                background: '#1e293b',
                borderRadius: 6,
                padding: 8,
                fontSize: 12,
              }}
            >
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{t}</span>
              <span style={{ color: '#94a3b8' }}> — {d}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
