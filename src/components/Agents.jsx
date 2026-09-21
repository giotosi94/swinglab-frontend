import React, { useEffect, useMemo, useState } from 'react';
import { AGENT_INFO } from '../utils/constants';
import { getRegimeColor } from '../utils/helpers';
import {
  fetchApmHistory,
  fetchApmStatus,
  fetchApmSummary,
  fetchMaxStrategyShadow,
  fetchMaxStrategyRiskShadow,
  fetchMaxStrategyValidation,
} from '../utils/api';

const COLORS = {
  bg: '#08101d', panel: '#0f172a', panel2: '#172235', border: '#23324a',
  text: '#f8fafc', muted: '#8da0ba', green: '#22c55e', amber: '#f59e0b',
  red: '#ef4444', blue: '#3b82f6', purple: '#8b5cf6', orange: '#f97316',
};

const panel = { background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14 };
const compactCard = { background: COLORS.panel2, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12 };

function formatDate(value) {
  if (!value) return 'Mai';
  const normalized = typeof value === 'string' && !value.endsWith('Z') ? `${value}Z` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('it-IT');
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString('it-IT', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function Kpi({ label, value, color = COLORS.text, hint }) {
  return (
    <div style={{ ...compactCard, minWidth: 0 }}>
      <div style={{ color: COLORS.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 18, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      {hint && <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function Badge({ children, color = COLORS.blue }) {
  return <span style={{ color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{children}</span>;
}

function Reasoning({ title, text, color }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const short = text.length > 220 ? `${text.slice(0, 220)}...` : text;
  return (
    <div style={{ ...compactCard, borderLeft: `3px solid ${color}`, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <strong style={{ color, fontSize: 11 }}>{title}</strong>
        {text.length > 220 && <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 0, color: COLORS.muted, cursor: 'pointer', fontSize: 11 }}>{open ? 'Riduci' : 'Leggi tutto'}</button>}
      </div>
      <div style={{ color: '#c5d0df', fontSize: 12, lineHeight: 1.6, marginTop: 6, whiteSpace: 'pre-wrap' }}>{open ? text : short}</div>
    </div>
  );
}

export default function Agents({ agentsStatus, agentsLoading, selectedAgent, setSelectedAgent, agentDecisions, fetchAgentDecisions, fetchAgentsStatus }) {
  const [tab, setTab] = useState('overview');
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [apm, setApm] = useState({ status: null, summary: null, history: [] });
  const [maxShadow, setMaxShadow] = useState(null);
  const [riskShadow, setRiskShadow] = useState(null);
  const [validation, setValidation] = useState(null);

  const ps = agentsStatus?.pipeline_state;
  const agents = agentsStatus?.agents || {};
  const brain = agentsStatus?.shared_brain?.market || {};
  const market = { ...(ps?.market || {}), ...brain };
  const pipeline = ps?.pipeline || {};
  const brainRisk = agentsStatus?.shared_brain?.approved?.risk_report || {};
  const risk = { ...(ps?.risk_report || {}), ...brainRisk };

  async function loadExtras() {
    setLoadingExtra(true);
    const [status, summary, history, alphaShadow, riskSizing, validationData] = await Promise.all([
      fetchApmStatus(), fetchApmSummary(7), fetchApmHistory(8),
      fetchMaxStrategyShadow(), fetchMaxStrategyRiskShadow(), fetchMaxStrategyValidation(100),
    ]);
    setApm({ status, summary, history: history?.decisions || [] });
    setMaxShadow(alphaShadow);
    setRiskShadow(riskSizing);
    setValidation(validationData);
    setLoadingExtra(false);
  }

 useEffect(() => {
   loadExtras();
   const interval = setInterval(loadExtras, 60000);
   return () => clearInterval(interval);
 }, []);

  const maxRows = useMemo(() => {
    const alpha = maxShadow?.candidates || [];
    const riskByTicker = Object.fromEntries((riskShadow?.candidates || []).map((item) => [item.ticker, item]));
    return alpha
      .filter((item) => item.shadow_action !== 'WOULD_REJECT' || item.plan_status !== 'DETECTED')
      .map((item) => ({ ...item, risk: riskByTicker[item.ticker] }))
      .slice(0, 100);
  }, [maxShadow, riskShadow]);

  const importantApm = (apm.history || []).filter((item) => item.decision !== 'HOLD').slice(0, 5);
  const alphaCounts = maxShadow?.action_counts || {};
  const riskCounts = riskShadow?.decision_counts || {};
  const validationSummary = validation?.summary || {};
  const systemState = agentsLoading || loadingExtra ? 'AGGIORNAMENTO' : Object.values(pipeline.steps || {}).includes('error') ? 'ATTENZIONE' : 'OPERATIVO';
  const stateColor = systemState === 'OPERATIVO' ? COLORS.green : systemState === 'ATTENZIONE' ? COLORS.red : COLORS.amber;

  if (agentsLoading && !agentsStatus) return <div style={{ padding: 40, color: COLORS.muted, textAlign: 'center' }}>Caricamento Control Center...</div>;

  const tabs = [
    ['overview', 'Panoramica'],
    ['agents', 'Agenti'],
    ['max', 'Max Strategy'],
  ];

  return (
    <div style={{ color: COLORS.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Multi-Agent Control Center</h2>
          <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>Ultima pipeline: {formatDate(ps?.last_run)} · {pipeline.timing?.total || 0}s</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge color={stateColor}>{systemState}</Badge>
          <button onClick={() => { fetchAgentsStatus(); loadExtras(); }} style={{ background: COLORS.panel2, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>Aggiorna</button>
        </div>
      </div>

      <div style={{ ...panel, padding: 10, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
        {['macro_analyst', 'alpha_strategist', 'risk_manager', 'adaptive_position_manager', 'executor'].map((name, index) => {
          const info = AGENT_INFO[name];
          const status = pipeline.steps?.[name] || 'unknown';
          if (!info) return null;
          const color = status === 'ok' ? info.color : status === 'error' ? COLORS.red : COLORS.muted;
          return <React.Fragment key={name}>{index > 0 && <span style={{ color: '#43516a' }}>→</span>}<button onClick={() => { setTab('agents'); setSelectedAgent(name); if (name !== 'adaptive_position_manager') fetchAgentDecisions(name); }} style={{ flex: 1, minWidth: 125, background: selectedAgent === name ? `${color}18` : 'transparent', border: 0, borderBottom: `2px solid ${color}`, color: COLORS.text, borderRadius: 8, padding: 9, cursor: 'pointer', textAlign: 'left' }}><span>{info.emoji}</span> <strong style={{ fontSize: 11 }}>{info.name}</strong><div style={{ color, fontSize: 9, marginTop: 3 }}>{status === 'ok' ? 'OK' : status.toUpperCase()}</div></button></React.Fragment>;
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} style={{ color: tab === key ? COLORS.text : COLORS.muted, background: tab === key ? COLORS.panel2 : 'transparent', border: `1px solid ${tab === key ? COLORS.blue : COLORS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700 }}>{label}</button>)}
      </div>

      {tab === 'overview' && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 10, marginBottom: 14 }}>
          <Kpi label="Regime" value={market.regime || 'N/D'} color={getRegimeColor(market.regime)} hint={`Confidenza ${market.confidence || 0}%`} />
          <Kpi label="Esposizione" value={`${risk.total_exposure_pct || 0}%`} hint={`${risk.current_positions || 0}/${risk.max_positions || 0} posizioni`} />
          <Kpi label="Equity" value={money(risk.equity)} hint={`Cash ${money(risk.cash)}`} />
          <Kpi label="Max Armed" value={alphaCounts.WOULD_ARM || 0} color={COLORS.blue} hint="Piani in attesa trigger" />
          <Kpi label="Max Would Buy" value={alphaCounts.WOULD_BUY || 0} color={COLORS.green} hint="Shadow, ordini OFF" />
          <Kpi label="Risk Shadow" value={(riskCounts.WOULD_APPROVE || 0) + (riskCounts.WOULD_REDUCE || 0)} color={COLORS.purple} hint={`${riskCounts.WOULD_REJECT || 0} rifiutati`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
          <section style={{ ...panel, padding: 14 }}><h3 style={{ margin: 0, fontSize: 14 }}>Contesto di mercato</h3><div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}><Badge color={getRegimeColor(market.regime)}>{market.regime || 'N/D'}</Badge><Badge>Volatilità {market.volatility || 'N/D'}</Badge><Badge>Breadth {market.breadth_pct || 0}%</Badge><Badge>Exposure {Math.round((market.exposure_multiplier || 0) * 100)}%</Badge></div><Reasoning title="Analisi Macro" text={market.llm_reasoning} color={COLORS.purple} /></section>
          <section style={{ ...panel, padding: 14 }}><h3 style={{ margin: 0, fontSize: 14 }}>Rischio e capacità</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}><Kpi label="Cash" value={money(risk.cash)} /><Kpi label="Risk/Trade" value={money(risk.risk_per_trade_usd || risk.risk_per_trade)} /><Kpi label="Moltiplicatore" value={`${Math.round((risk.final_multiplier || 0) * 100)}%`} /></div><Reasoning title="Analisi Risk" text={risk.llm_reasoning} color={COLORS.amber} /></section>
        </div>

        <section style={{ ...panel, padding: 14, marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}><div><h3 style={{ margin: 0, fontSize: 14 }}>APM · Azioni rilevanti</h3><span style={{ color: COLORS.muted, fontSize: 10 }}>Gli HOLD restano in secondo piano</span></div><div style={{ display: 'flex', gap: 6 }}><Badge color={apm.status?.enabled ? COLORS.green : COLORS.red}>{apm.status?.enabled ? 'ATTIVO' : 'OFF'}</Badge><Badge color={COLORS.purple}>Prossimo {apm.status?.remaining_hours ?? '-'}h</Badge></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginTop: 10 }}><Kpi label="Scale" value={apm.summary?.counts?.SCALE_OUT || 0} color={COLORS.amber} /><Kpi label="Exit" value={apm.summary?.counts?.EXIT || 0} color={COLORS.red} /><Kpi label="Tighten" value={apm.summary?.counts?.TIGHTEN_STOP || 0} color={COLORS.orange} /><Kpi label="Hold" value={apm.summary?.counts?.HOLD || 0} color={COLORS.muted} /></div>
          <div style={{ marginTop: 10 }}>{importantApm.length ? importantApm.map((item, index) => <div key={item.id || index} style={{ ...compactCard, display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 6, fontSize: 11 }}><strong>{item.ticker} · {item.decision}</strong><span style={{ color: Number(item.current_pnl_pct) >= 0 ? COLORS.green : COLORS.red }}>{Number(item.current_pnl_pct || 0).toFixed(2)}%</span></div>) : <div style={{ color: COLORS.muted, fontSize: 11, padding: 10 }}>Nessuna azione APM rilevante recente.</div>}</div>
        </section>
      </>}

      {tab === 'agents' && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
          {Object.entries(AGENT_INFO).map(([name, info]) => {
            const data = agents[name] || {};
            const active = selectedAgent === name;
            return <button key={name} onClick={() => { setSelectedAgent(active ? null : name); if (!active && name !== 'adaptive_position_manager') fetchAgentDecisions(name); }} style={{ ...panel, padding: 14, color: COLORS.text, cursor: 'pointer', textAlign: 'left', border: `1px solid ${active ? info.color : COLORS.border}` }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{info.emoji} {info.name}</strong><span style={{ color: COLORS.muted, fontSize: 10 }}>{data.recent_decisions?.length || 0} decisioni</span></div><div style={{ color: COLORS.muted, fontSize: 11, marginTop: 8, minHeight: 30 }}>{info.desc}</div><div style={{ marginTop: 10 }}><Badge color={pipeline.steps?.[name] === 'ok' ? COLORS.green : COLORS.muted}>{pipeline.steps?.[name] || 'unknown'}</Badge></div></button>;
          })}
        </div>
        {selectedAgent && selectedAgent !== 'adaptive_position_manager' && <section style={{ ...panel, padding: 14, marginTop: 14, borderColor: AGENT_INFO[selectedAgent]?.color }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: 0, fontSize: 14 }}>{AGENT_INFO[selectedAgent]?.emoji} {AGENT_INFO[selectedAgent]?.name} · Decisioni</h3><button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 0, color: COLORS.muted, cursor: 'pointer' }}>Chiudi</button></div><div style={{ marginTop: 10, maxHeight: 460, overflowY: 'auto' }}>{agentDecisions.length ? agentDecisions.map((item, index) => <div key={item._id || index} style={{ ...compactCard, marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ color: AGENT_INFO[selectedAgent]?.color, fontSize: 11 }}>{item.type}</strong><span style={{ color: COLORS.muted, fontSize: 10 }}>{formatDate(item.created_at)}</span></div><div style={{ color: '#c5d0df', fontSize: 11, lineHeight: 1.5, marginTop: 5 }}>{item.reasoning}</div><div style={{ color: COLORS.muted, fontSize: 10, marginTop: 5 }}>Confidence {Number(item.confidence || 0).toFixed(0)}%</div></div>) : <div style={{ color: COLORS.muted }}>Nessuna decisione.</div>}</div></section>}
      </>}

      {tab === 'max' && <>
        <div style={{ ...panel, padding: 14, marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}><div><h3 style={{ margin: 0, fontSize: 15 }}>Max Strategy v1.5.2</h3><div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>Weekly context · Daily confirmation · 4H refined con fallback Daily</div></div><div style={{ display: 'flex', gap: 6 }}><Badge color={COLORS.purple}>SHADOW</Badge><Badge color={COLORS.red}>ORDINI LIVE OFF</Badge></div></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 8, marginBottom: 12 }}><Kpi label="Would Arm" value={alphaCounts.WOULD_ARM || 0} color={COLORS.blue} /><Kpi label="Would Buy" value={alphaCounts.WOULD_BUY || 0} color={COLORS.green} /><Kpi label="Would Wait" value={alphaCounts.WOULD_WAIT || 0} color={COLORS.amber} /><Kpi label="Would Reject" value={alphaCounts.WOULD_REJECT || 0} color={COLORS.red} /><Kpi label="Risk Approve" value={riskCounts.WOULD_APPROVE || 0} color={COLORS.green} /><Kpi label="Risk Reduce" value={riskCounts.WOULD_REDUCE || 0} color={COLORS.amber} /><Kpi label="Risk Reject" value={riskCounts.WOULD_REJECT || 0} color={COLORS.red} /></div>
        <section style={{ ...panel, padding: 12, overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1050, fontSize: 11 }}><thead><tr style={{ color: COLORS.muted, textAlign: 'left' }}>{['Ticker','Alpha','Risk','Piano','Fase','Prezzo','Trigger','Max entry','Invalidazione','Size teorica','Rischio','Motivo'].map((label) => <th key={label} style={{ padding: '8px 7px', borderBottom: `1px solid ${COLORS.border}` }}>{label}</th>)}</tr></thead><tbody>{maxRows.map((row) => <tr key={row.ticker} style={{ borderBottom: `1px solid ${COLORS.border}` }}><td style={{ padding: 8, fontWeight: 800 }}>{row.ticker}</td><td><Badge color={row.shadow_action === 'WOULD_BUY' ? COLORS.green : row.shadow_action === 'WOULD_ARM' ? COLORS.blue : row.shadow_action === 'WOULD_REJECT' ? COLORS.red : COLORS.amber}>{row.shadow_action}</Badge></td><td>{row.risk ? <Badge color={row.risk.risk_shadow_decision === 'WOULD_APPROVE' ? COLORS.green : row.risk.risk_shadow_decision === 'WOULD_REDUCE' ? COLORS.amber : COLORS.red}>{row.risk.risk_shadow_decision}</Badge> : '—'}</td><td>{row.plan_status}</td><td>{row.market_phase || '—'}</td><td>{row.signal_price ?? '—'}</td><td>{row.trigger_price ?? '—'}</td><td>{row.maximum_entry_price ?? '—'}</td><td>{row.invalidation_price ?? '—'}</td><td>{row.risk ? `${row.risk.shadow_qty} · ${money(row.risk.shadow_notional)}` : '—'}</td><td>{row.risk ? `${money(row.risk.shadow_risk_usd)} (${row.risk.portfolio_risk_pct}%)` : '—'}</td><td style={{ color: COLORS.muted, maxWidth: 260 }}>{(row.risk?.rejection_reasons?.length ? row.risk.rejection_reasons : row.rejection_reasons || []).join(', ') || '—'}</td></tr>)}</tbody></table>{!maxRows.length && <div style={{ padding: 24, textAlign: 'center', color: COLORS.muted }}>Nessun candidato Shadow disponibile. Se la route Risk Shadow non è ancora esposta, la pagina continuerà a mostrare i dati Alpha e Validation.</div>}</section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}><Kpi label="Snapshot point-in-time" value={validationSummary.total || 0} hint="max_strategy_signals" /><Kpi label="Trigger raggiunti" value={validationSummary.trigger_reached || 0} /><Kpi label="Invalidazioni" value={validationSummary.invalidation_reached || 0} color={COLORS.red} /><Kpi label="Outcome 5/10/20d" value={`${validationSummary.completed_5d || 0}/${validationSummary.completed_10d || 0}/${validationSummary.completed_20d || 0}`} /></div>
      </>}
    </div>
  );
}
