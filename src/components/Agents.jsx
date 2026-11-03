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
  runLearnAll,
  fetchAgentParams,
  fetchAgentParamHistory,
  fetchAgentGuardrail,
  runAgentRollback,
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
        {text.length > 220 && (
          <button onClick={() => setOpen((v) => !v)} style={{ background: 'transparent', border: 0, color: COLORS.muted, cursor: 'pointer', fontSize: 10 }}>
            {open ? 'chiudi' : 'espandi'}
          </button>
        )}
      </div>
      <div style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.6, marginTop: 6 }}>{open ? text : short}</div>
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
  const [validationFilter, setValidationFilter] = useState('ACTIONABLE');
  const [learnBusy, setLearnBusy] = useState(false);
  const [learnResult, setLearnResult] = useState(null);
  const [learnError, setLearnError] = useState(null);
  const [alphaParams, setAlphaParams] = useState(null);
  const [apmParams, setApmParams] = useState(null);
  const [alphaHistory, setAlphaHistory] = useState([]);
  const [apmHistoryParams, setApmHistoryParams] = useState([]);
  const [alphaGuardrail, setAlphaGuardrail] = useState(null);
  const [rollbackBusy, setRollbackBusy] = useState(false);

  const ps = agentsStatus?.pipeline_state;
  const agents = agentsStatus?.agents || {};
  const brain = agentsStatus?.shared_brain?.market || {};
  const market = { ...(ps?.market || {}), ...brain };
  const pipeline = ps?.pipeline || {};
  const brainRisk = agentsStatus?.shared_brain?.approved?.risk_report || {};
  const risk = { ...(ps?.risk_report || {}), ...brainRisk };

  async function loadExtras() {
    setLoadingExtra(true);
    const [status, summary, history, alphaShadow, riskSizing, validationData, aParams, pParams, aHist, pHist, guard] = await Promise.all([
      fetchApmStatus(), fetchApmSummary(7), fetchApmHistory(8),
      fetchMaxStrategyShadow(), fetchMaxStrategyRiskShadow(), fetchMaxStrategyValidation(500),
      fetchAgentParams('alpha_strategist'),
      fetchAgentParams('adaptive_position_manager'),
      fetchAgentParamHistory('alpha_strategist', 6),
      fetchAgentParamHistory('adaptive_position_manager', 6),
      fetchAgentGuardrail('alpha_strategist'),
    ]);
    setApm({ status, summary, history: history?.decisions || [] });
    setMaxShadow(alphaShadow);
    setRiskShadow(riskSizing);
    setValidation(validationData);
    setAlphaParams(aParams?.params || aParams || null);
    setApmParams(pParams?.params || pParams || null);
    setAlphaHistory(aHist?.history || []);
    setApmHistoryParams(pHist?.history || []);
    setAlphaGuardrail(guard);
    setLoadingExtra(false);
  }

  async function handleLearn() {
    setLearnBusy(true);
    setLearnError(null);
    try {
      const res = await runLearnAll(false);
      if (!res) {
        setLearnError('Richiesta fallita o backend non raggiungibile');
      } else {
        setLearnResult(res);
        await loadExtras();
        if (fetchAgentsStatus) fetchAgentsStatus();
      }
    } catch (e) {
      setLearnError(String(e?.message || e));
    } finally {
      setLearnBusy(false);
    }
  }

  async function handleRollback() {
    setRollbackBusy(true);
    setLearnError(null);
    try {
      const res = await runAgentRollback('alpha_strategist');
      if (!res || res.error) {
        setLearnError(res?.error || 'Rollback fallito');
      } else {
        setLearnResult({ status: 'rollback', results: { alpha_strategist: { status: 'ok', result: res } } });
        await loadExtras();
        if (fetchAgentsStatus) fetchAgentsStatus();
      }
    } catch (e) {
      setLearnError(String(e?.message || e));
    } finally {
      setRollbackBusy(false);
    }
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
  const validationSignals = validation?.signals || [];

  const validationCohorts = useMemo(() => validationSignals.reduce((acc, signal) => {
    const cohort = signal.validation_cohort || 'NON_CLASSIFICATO';
    acc[cohort] = (acc[cohort] || 0) + 1;
    return acc;
  }, {}), [validationSignals]);

  const validationRows = useMemo(() => {
    if (validationFilter === 'ALL') return validationSignals.slice(0, 80);
    return validationSignals.filter((s) => (s.validation_cohort || 'NON_CLASSIFICATO') === validationFilter).slice(0, 80);
  }, [validationSignals, validationFilter]);

  const tabs = [
    ['overview', 'Overview'],
    ['agents', 'Agenti'],
    ['apm', 'APM'],
    ['max', 'Max Shadow'],
    ['validation', 'Validazione'],
  ];

  const systemState = pipeline?.status || (agentsLoading ? 'loading' : 'idle');
  const stateColor = systemState === 'ok' || systemState === 'idle' ? COLORS.green : systemState === 'loading' ? COLORS.amber : COLORS.red;

  function cohortColor(key) {
    if (key === 'ACTIONABLE') return COLORS.green;
    if (key === 'NEAR_MISS') return COLORS.amber;
    if (key === 'REJECTED') return COLORS.red;
    return COLORS.muted;
  }

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
          return (
            <React.Fragment key={name}>
              {index > 0 && <span style={{ color: '#43516a' }}>→</span>}
              <button
                onClick={() => { setTab('agents'); setSelectedAgent(name); if (name !== 'adaptive_position_manager') fetchAgentDecisions(name); }}
                style={{ flex: 1, minWidth: 125, background: selectedAgent === name ? `${color}18` : 'transparent', border: 0, borderBottom: `2px solid ${color}`, color: COLORS.text, borderRadius: 8, padding: 9, cursor: 'pointer', textAlign: 'left' }}
              >
                <span>{info.emoji}</span> <strong style={{ fontSize: 11 }}>{info.name}</strong>
                <div style={{ color, fontSize: 9, marginTop: 3 }}>{status === 'ok' ? 'OK' : status.toUpperCase()}</div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <section style={{ ...panel, padding: 16, marginBottom: 14, borderLeft: `3px solid ${COLORS.purple}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: COLORS.purple, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Learning Machine v3</div>
            <h3 style={{ margin: '4px 0 6px', fontSize: 16 }}>Parametri appresi</h3>
            <div style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.5, maxWidth: 520 }}>
              Aggiornamento controllato (max 25% per ciclo) + guardrail WR. Alpha impara per posizione; APM guarda +5g post EXIT.
            </div>
          </div>
          <button
            onClick={handleLearn}
            disabled={learnBusy}
            style={{
              background: learnBusy ? COLORS.panel2 : `${COLORS.purple}22`,
              color: COLORS.text,
              border: `1px solid ${COLORS.purple}66`,
              borderRadius: 8,
              padding: '10px 16px',
              cursor: learnBusy ? 'wait' : 'pointer',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {learnBusy ? 'Learning in corso…' : 'Lancia learning'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 14 }}>
          <div style={compactCard}>
            <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 12, marginBottom: 8 }}>Alpha Strategist</div>
            <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7 }}>
              <div>min_confluence: <strong style={{ color: COLORS.text }}>{alphaParams?.min_confluence ?? '—'}</strong></div>
              <div>max_rsi_entry: <strong style={{ color: COLORS.text }}>{alphaParams?.max_rsi_entry ?? '—'}</strong></div>
              <div>best setups: <strong style={{ color: COLORS.text }}>{Array.isArray(alphaParams?.best_setups) ? alphaParams.best_setups.slice(0, 3).join(', ') : '—'}</strong></div>
              <div>weak sectors: <strong style={{ color: COLORS.text }}>{Array.isArray(alphaParams?.weak_sectors) && alphaParams.weak_sectors.length ? alphaParams.weak_sectors.join(', ') : 'nessuno'}</strong></div>
              <div>param_version: <strong style={{ color: COLORS.text }}>{alphaParams?.param_version ?? '—'}</strong></div>
            </div>
            {alphaHistory?.[0] && (
              <div style={{ marginTop: 8, fontSize: 10, color: COLORS.muted }}>
                Ultimo save: {formatDate(alphaHistory[0].created_at)} · {alphaHistory[0].reason || '—'}
              </div>
            )}
          </div>

          <div style={compactCard}>
            <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 12, marginBottom: 8 }}>Adaptive Position Manager</div>
            <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7 }}>
              <div>exit confluence: <strong style={{ color: COLORS.text }}>{apmParams?.apm_exit_confluence_threshold ?? '—'}</strong></div>
              <div>exit ML: <strong style={{ color: COLORS.text }}>{apmParams?.apm_exit_ml_threshold ?? '—'}</strong></div>
              <div>min holding h: <strong style={{ color: COLORS.text }}>{apmParams?.apm_min_holding_hours ?? '—'}</strong></div>
              <div>neg. factors: <strong style={{ color: COLORS.text }}>{apmParams?.apm_exit_min_negative_factors ?? '—'}</strong></div>
              <div>param_version: <strong style={{ color: COLORS.text }}>{apmParams?.param_version ?? '—'}</strong></div>
            </div>
            {apmHistoryParams?.[0] && (
              <div style={{ marginTop: 8, fontSize: 10, color: COLORS.muted }}>
                Ultimo save: {formatDate(apmHistoryParams[0].created_at)} · {apmHistoryParams[0].reason || '—'}
              </div>
            )}
          </div>

          <div style={compactCard}>
            <div style={{ color: COLORS.purple, fontWeight: 800, fontSize: 12, marginBottom: 8 }}>Guardrail Alpha</div>
            {(() => {
              const g = alphaGuardrail || {};
              const base = g.baseline || {};
              const drop = g.drop_pts;
              const would = g.would_rollback;
              const thr = g.thresholds || {};
              const actionColor = would ? COLORS.red : drop != null && drop > 0 ? COLORS.amber : COLORS.green;
              return (
                <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7 }}>
                  <div>baseline WR: <strong style={{ color: COLORS.text }}>{base.win_rate != null ? `${base.win_rate}%` : '—'}</strong>
                    {base.param_version != null ? ` · v${base.param_version}` : ''}</div>
                  <div>sample baseline: <strong style={{ color: COLORS.text }}>{base.sample_count ?? '—'}</strong></div>
                  <div>drop: <strong style={{ color: actionColor }}>{drop != null ? `${drop} pts` : '—'}</strong>
                    {would ? ' · ROLLBACK SE ATTIVO' : ''}</div>
                  <div style={{ fontSize: 10, marginTop: 4 }}>
                    soglia {thr.wr_drop_pts ?? 12} pts · min {thr.min_days ?? 7}g / {thr.min_new_positions ?? 5} pos
                  </div>
                  {base.created_at && (
                    <div style={{ fontSize: 10, marginTop: 2 }}>baseline: {formatDate(base.created_at)}</div>
                  )}
                  <button
                    onClick={handleRollback}
                    disabled={rollbackBusy}
                    style={{
                      marginTop: 10,
                      background: rollbackBusy ? COLORS.panel2 : `${COLORS.red}22`,
                      color: COLORS.text,
                      border: `1px solid ${COLORS.red}55`,
                      borderRadius: 8,
                      padding: '7px 12px',
                      cursor: rollbackBusy ? 'wait' : 'pointer',
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    {rollbackBusy ? 'Rollback…' : 'Rollback manuale'}
                  </button>
                </div>
              );
            })()}
          </div>

          <div style={compactCard}>
            <div style={{ color: COLORS.amber, fontWeight: 800, fontSize: 12, marginBottom: 8 }}>Ultimo run learning</div>
            {!learnResult && !learnError && (
              <div style={{ fontSize: 11, color: COLORS.muted }}>Nessun run lanciato da questa sessione. Usa il bottone oppure il cron.</div>
            )}
            {learnError && <div style={{ fontSize: 11, color: COLORS.red }}>{learnError}</div>}
            {learnResult && (
              <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7 }}>
                <div>status: <strong style={{ color: COLORS.green }}>{learnResult.status}</strong></div>
                <div>ore: {learnResult.learned_at ? formatDate(learnResult.learned_at) : '—'}</div>
                {learnResult.results && Object.entries(learnResult.results).map(([name, res]) => (
                  <div key={name}>
                    {name.replace(/_/g, ' ')}: {res.status}
                    {res.result?.win_rate != null ? ` · WR ${res.result.win_rate}%` : ''}
                    {res.result?.updated != null ? ` · upd ${String(res.result.updated)}` : ''}
                    {res.result?.guardrail?.action ? ` · guard ${res.result.guardrail.action}` : ''}
                    {res.result?.auto_tuning ? ` · ${res.result.auto_tuning}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ color: tab === key ? COLORS.text : COLORS.muted, background: tab === key ? COLORS.panel2 : 'transparent', border: `1px solid ${tab === key ? COLORS.blue : COLORS.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700 }}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
            <Kpi label="Regime" value={market.regime || 'N/D'} color={getRegimeColor(market.regime)} hint={market.regime_detail || ''} />
            <Kpi label="Esposizione" value={`${Math.round(Number(market.exposure_multiplier || 0) * 100)}%`} color={COLORS.green} />
            <Kpi label="Breadth" value={`${Number(market.breadth_pct || 0).toFixed(0)}%`} />
            <Kpi label="APM azioni 7g" value={apm.summary?.actions_taken ?? '—'} color={COLORS.orange} hint={`${apm.summary?.total_decisions || 0} decisioni`} />
          </div>
          <Reasoning title="Macro reasoning" text={market.llm_reasoning} color={COLORS.blue} />
          <Reasoning title="Risk reasoning" text={risk.llm_reasoning} color={COLORS.amber} />
          {loadingExtra && <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 10 }}>Caricamento extra…</div>}
        </>
      )}

      {tab === 'agents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {Object.keys(AGENT_INFO).map((name) => {
            const info = AGENT_INFO[name];
            const data = agents[name] || {};
            const active = selectedAgent === name;
            return (
              <button key={name} onClick={() => { setSelectedAgent(active ? null : name); if (!active && name !== 'adaptive_position_manager') fetchAgentDecisions(name); }} style={{ ...panel, padding: 14, color: COLORS.text, cursor: 'pointer', textAlign: 'left', border: `1px solid ${active ? info.color : COLORS.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{info.emoji} {info.name}</strong>
                  <span style={{ color: COLORS.muted, fontSize: 10 }}>{data.recent_decisions?.length || 0} decisioni</span>
                </div>
                <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 8, minHeight: 30 }}>{info.desc}</div>
                <div style={{ marginTop: 10 }}><Badge color={pipeline.steps?.[name] === 'ok' ? COLORS.green : COLORS.muted}>{pipeline.steps?.[name] || 'unknown'}</Badge></div>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'apm' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Kpi label="Ultimo run" value={apm.status?.last_run ? formatDate(apm.status.last_run) : 'Mai'} />
            <Kpi label="Azioni 7g" value={apm.summary?.actions_taken ?? 0} color={COLORS.orange} />
            <Kpi label="Decisioni 7g" value={apm.summary?.total_decisions ?? 0} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {importantApm.map((item) => (
              <div key={item.id || item.created_at} style={compactCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{item.ticker} · {item.decision}</strong>
                  <span style={{ color: COLORS.muted, fontSize: 10 }}>{formatDate(item.created_at)}</span>
                </div>
                <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 6 }}>{item.reason}</div>
              </div>
            ))}
            {!importantApm.length && <div style={{ color: COLORS.muted, fontSize: 12 }}>Nessuna azione APM rilevante.</div>}
          </div>
        </div>
      )}

      {tab === 'max' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Kpi label="Would Arm" value={alphaCounts.WOULD_ARM || 0} color={COLORS.blue} />
            <Kpi label="Would Buy" value={alphaCounts.WOULD_BUY || 0} color={COLORS.green} />
            <Kpi label="Would Wait" value={alphaCounts.WOULD_WAIT || 0} color={COLORS.amber} />
            <Kpi label="Risk Reject" value={riskCounts.WOULD_REJECT || 0} color={COLORS.red} />
          </div>
          <section style={{ ...panel, padding: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, fontSize: 11 }}>
              <thead>
                <tr style={{ color: COLORS.muted, textAlign: 'left' }}>
                  {['Ticker', 'Alpha', 'Risk', 'Piano'].map((label) => (
                    <th key={label} style={{ padding: '8px 7px', borderBottom: `1px solid ${COLORS.border}` }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {maxRows.slice(0, 30).map((row) => (
                  <tr key={row.ticker} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: 8, fontWeight: 800 }}>{row.ticker}</td>
                    <td><Badge color={row.shadow_action === 'WOULD_BUY' ? COLORS.green : row.shadow_action === 'WOULD_ARM' ? COLORS.blue : COLORS.amber}>{row.shadow_action}</Badge></td>
                    <td>{row.risk ? <Badge color={COLORS.muted}>{row.risk.risk_shadow_decision}</Badge> : '—'}</td>
                    <td>{row.plan_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {tab === 'validation' && (
        <section style={{ ...panel, padding: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {[['ACTIONABLE', 'Actionable'], ['NEAR_MISS', 'Near miss'], ['REJECTED', 'Rejected'], ['ALL', 'Tutti']].map(([key, label]) => (
              <button key={key} onClick={() => setValidationFilter(key)} style={{ color: COLORS.text, background: validationFilter === key ? COLORS.panel2 : 'transparent', border: `1px solid ${validationFilter === key ? cohortColor(key) : COLORS.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>{label}</button>
            ))}
          </div>
          <div style={{ color: COLORS.muted, fontSize: 11 }}>Totale: {validationSummary.total || validationSignals.length || 0}</div>
        </section>
      )}
    </div>
  );
}
