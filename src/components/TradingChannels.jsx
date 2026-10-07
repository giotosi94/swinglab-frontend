import React, { useState, useEffect } from 'react';
import { API } from '../utils/constants';
import CrashDeployToggle from './CrashDeployToggle';

const MAX_AGENTS = ['alpha_strategist', 'risk_manager'];

function Row({ title, color, badge, badgeColor, children, right }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b', borderLeft: `4px solid ${color}`,
      borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              color: badgeColor, background: `${badgeColor}1a`, border: `1px solid ${badgeColor}55`,
            }}>{badge}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>{children}</div>
      </div>
      {right}
    </div>
  );
}

export default function TradingChannels() {
  const [maxState, setMaxState] = useState(null);
  const [maxBusy, setMaxBusy] = useState(false);
  const [maxError, setMaxError] = useState(null);

  const loadMax = async () => {
    try {
      const results = await Promise.all(MAX_AGENTS.map((agent) =>
        fetch(`${API}/api/agents/${agent}/params`).then((r) => r.json())
      ));
      const values = results.map((r) => Boolean(r?.params?.max_live_enabled));
      setMaxState({
        enabled: values.every(Boolean),
        aligned: values[0] === values[1],
        slots: results[1]?.params?.max_live_slots ?? 4,
        stop: results[0]?.params?.max_stop_cap_pct ?? 8,
      });
      setMaxError(null);
    } catch (e) {
      setMaxError('Stato non disponibile');
    }
  };

  const toggleMax = async () => {
    if (!maxState) return;
    const next = maxState.enabled ? 0 : 1;
    const label = next ? 'ATTIVARE' : 'DISATTIVARE';
    if (!window.confirm(`Vuoi ${label} Max Strategy live? Gli ordini sono su Alpaca paper.`)) return;
    setMaxBusy(true);
    try {
      for (const agent of MAX_AGENTS) {
        await fetch(`${API}/api/agents/${agent}/set-param?key=max_live_enabled&value=${next}`, { method: 'POST' });
      }
      await loadMax();
    } catch (e) {
      setMaxError('Errore durante il cambio stato');
    }
    setMaxBusy(false);
  };

  useEffect(() => { loadMax(); }, []);

  const maxOn = maxState?.enabled;
  const maxColor = maxOn ? '#f59e0b' : '#64748b';

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, marginBottom: 6, color: '#94a3b8' }}>🎛️ Canali di trading</h3>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
        Tutti i comandi che fanno comprare o vendere sono qui. La pagina Salute mostra solo lo stato.
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <Row title="🎯 Alpha Strategist" color="#22c55e" badge="SEMPRE ATTIVO" badgeColor="#22c55e">
          Pullback e rimbalzi su titoli sani. Usa gli slot non riservati agli altri canali.
        </Row>

        <Row
          title="🟠 Max Strategy"
          color={maxColor}
          badge={maxState ? (maxOn ? 'LIVE' : 'OFF') : '...'}
          badgeColor={maxColor}
          right={(
            <button
              onClick={toggleMax}
              disabled={maxBusy || !maxState}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 12,
                cursor: maxBusy ? 'not-allowed' : 'pointer', color: 'white',
                background: maxOn ? '#ef4444' : '#f59e0b', opacity: maxBusy ? 0.6 : 1,
              }}
            >
              {maxBusy ? '...' : maxOn ? 'Disattiva' : 'Attiva'}
            </button>
          )}
        >
          Bottom e riaccumuli. {maxState ? `${maxState.slots} slot riservati, stop massimo ${maxState.stop}%, R/R minimo 1,0.` : ''}
          {maxState && !maxState.aligned && (
            <div style={{ color: '#fbbf24', marginTop: 4 }}>
              ⚠️ Alpha e RiskManager non sono allineati: premi il pulsante per riallinearli.
            </div>
          )}
          {maxError && <div style={{ color: '#ef4444', marginTop: 4 }}>{maxError}</div>}
        </Row>

        <CrashDeployToggle />

        <Row title="📈 Trend Leadership" color="#334155" badge="IN ARRIVO" badgeColor="#64748b">
          Leader vicini ai massimi, più forti di SPY. Validato solo nel backtest.
        </Row>
        <Row title="🧱 Core SPY 60%" color="#334155" badge="IN ARRIVO" badgeColor="#64748b">
          Quota fissa in SPY per seguire il mercato. Validata solo nel backtest.
        </Row>
      </div>
    </div>
  );
}
