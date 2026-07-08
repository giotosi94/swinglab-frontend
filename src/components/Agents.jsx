import React, { useState, useEffect } from 'react';
import { AGENT_INFO } from '../utils/constants';
import { getRegimeColor } from '../utils/helpers';
import { fetchApmHistory, fetchApmStatus, fetchApmSummary } from '../utils/api';

export default function Agents({
  agentsStatus, agentsLoading, selectedAgent, setSelectedAgent,
  agentDecisions, fetchAgentDecisions, runPipeline, runLearning,
  pipelineRunning, learningRunning, fetchAgentsStatus,
}) {
  const ps = agentsStatus?.pipeline_state;
  const ag = agentsStatus?.agents || {};
  const brain = agentsStatus?.shared_brain?.market || {};
  const market = { ...(ps?.market || {}), ...brain };
  const pipeline = ps?.pipeline || {};
  const brainRisk = agentsStatus?.shared_brain?.approved?.risk_report || {};
  const riskReport = { ...(ps?.risk_report || {}), ...brainRisk };

  // 🆕 v4.0 — APM State
  const [apmData, setApmData] = useState({
    status: null,
    summary: null,
    history: [],
    loading: true,
  });

  useEffect(() => {
    async function loadApm() {
      const [status, summary, historyResp] = await Promise.all([
        fetchApmStatus().catch(() => null),
        fetchApmSummary(7).catch(() => null),
        fetchApmHistory(5).catch(() => ({ decisions: [] })),
      ]);
      setApmData({
        status,
        summary,
        history: historyResp?.decisions || [],
        loading: false,
      });
    }
    loadApm();
    const interval = setInterval(loadApm, 60000);
    return () => clearInterval(interval);
  }, [agentsStatus]);

  if (agentsLoading && !agentsStatus) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
        Loading agents...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <h2 style={{ margin: 0 }}>{'\uD83E\uDD16'} Multi-Agent AI System</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={runPipeline}
            disabled={pipelineRunning}
            style={{
              padding: '8px 16px',
              background: pipelineRunning ? '#334155' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {pipelineRunning ? '\u23F3 Running...' : '\u25B6\uFE0F Run Pipeline'}
          </button>
          <button
            onClick={runLearning}
            disabled={learningRunning}
            style={{
              padding: '8px 16px',
              background: learningRunning ? '#334155' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {learningRunning ? '\u23F3 Learning...' : '\uD83E\uDDEC Learn All'}
          </button>
          <button
            onClick={fetchAgentsStatus}
            style={{
              padding: '8px 16px',
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {'\uD83D\uDD04'} Refresh
          </button>
        </div>
      </div>

      {/* Pipeline Steps — 🆕 v4.0 con APM */}
      {ps && (
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              Last Run: {ps.last_run ? new Date(ps.last_run + (ps.last_run.endsWith('Z') ? '' : 'Z')).toLocaleString() : 'Never'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              {pipeline.timing?.total && `\u23F1 ${pipeline.timing.total}s`}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              flexWrap: 'wrap',
            }}
          >
            {['macro_analyst', 'alpha_strategist', 'risk_manager', 'adaptive_position_manager', 'executor'].map(
              (name, i) => {
                const info = AGENT_INFO[name];
                if (!info) return null;
                const st = pipeline.steps?.[name] || 'unknown';
                const bc =
                  st === 'ok'
                    ? info.color
                    : st === 'error'
                    ? '#ef4444'
                    : '#334155';
                return (
                  <React.Fragment key={name}>
                    {i > 0 && (
                      <div style={{ color: '#475569', fontSize: 20, margin: '0 4px' }}>
                        {'\u2192'}
                      </div>
                    )}
                    <div
                      onClick={() => {
                        setSelectedAgent(name);
                        if (name !== 'adaptive_position_manager') {
                          fetchAgentDecisions(name);
                        }
                      }}
                      style={{
                        background: '#1e293b',
                        borderRadius: 10,
                        padding: '10px 16px',
                        border: `2px solid ${bc}`,
                        cursor: 'pointer',
                        textAlign: 'center',
                        minWidth: 120,
                      }}
                    >
                      <div style={{ fontSize: 20 }}>{info.emoji}</div>
                      <div
                        style={{
                          color: 'white',
                          fontSize: 11,
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        {info.name}
                      </div>
                      <div style={{ color: bc, fontSize: 10, marginTop: 2 }}>
                        {st === 'ok' ? '\u2705 OK' : st === 'error' ? '\u274C Error' : '\u23F3'}
                      </div>
                    </div>
                  </React.Fragment>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Market Context */}
      {market.regime && (
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            border: '1px solid #1e293b',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>{'\uD83C\uDF0D'} Market Context</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
            }}
          >
            {[
              { l: 'Regime', v: market.regime, c: getRegimeColor(market.regime) },
              { l: 'Confidence', v: `${market.confidence || 0}%` },
              {
                l: 'Exposure',
                v: `${((market.exposure_multiplier || 0) * 100).toFixed(0)}%`,
              },
              {
                l: 'Volatility',
                v: market.volatility || '\u2014',
                c:
                  market.volatility === 'EXTREME'
                    ? '#ef4444'
                    : market.volatility === 'HIGH'
                    ? '#f97316'
                    : '#22c55e',
              },
              { l: 'Breadth', v: `${market.breadth_pct || 0}%` },
              {
                l: 'Rotation',
                v: market.rotation || '\u2014',
                c: market.rotation === 'defensive' ? '#f97316' : '#22c55e',
              },
            ].map((item) => (
              <div
                key={item.l}
                style={{
                  background: '#1e293b',
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.l}</div>
                <div
                  style={{
                    fontSize: item.l === 'Regime' ? 18 : 14,
                    fontWeight: 700,
                    color: item.c || 'white',
                    marginTop: 4,
                  }}
                >
                  {item.v}
                </div>
              </div>
            ))}
          </div>
          {market.llm_reasoning && (
            <div style={{
              background: '#1e293b', borderRadius: 8, padding: 12, marginTop: 12,
              borderLeft: '3px solid #8b5cf6', fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
            }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 11 }}>🧠 AI Reasoning</span>
              <div style={{ marginTop: 4 }}>{market.llm_reasoning}</div>
            </div>
          )}
          {market.llm_reasoning && (
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
              💬 Questo reasoning viene letto da Alpha, Risk, APM ed Executor
            </div>
          )}
        </div>
      )}

      {/* Risk Report */}
      {riskReport.equity && (
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            border: '1px solid #1e293b',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>
            {'\uD83D\uDEE1\uFE0F'} Risk Report
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
            }}
          >
            {[
              { l: 'Equity', v: `$${riskReport.equity?.toLocaleString()}` },
              { l: 'Cash', v: `$${riskReport.cash?.toLocaleString()}` },
              { l: 'Exposure', v: `${riskReport.total_exposure_pct || 0}%` },
              {
                l: 'Positions',
                v: `${riskReport.current_positions || 0}/${riskReport.max_positions || 5}`,
              },
              { l: 'Risk/Trade', v: `$${riskReport.risk_per_trade?.toFixed(0) || 0}` },
              {
                l: 'Multiplier',
                v: `${((riskReport.final_multiplier || 0) * 100).toFixed(0)}%`,
              },
            ].map((item) => (
              <div
                key={item.l}
                style={{
                  background: '#1e293b',
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.l}</div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: 'white', marginTop: 2 }}
                >
                  {item.v}
                </div>
                </div>
            ))}
          </div>
          {riskReport.llm_reasoning && (
            <div style={{
              background: '#1e293b', borderRadius: 8, padding: 12, marginTop: 12,
              borderLeft: '3px solid #eab308', fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
            }}>
              <span style={{ color: '#eab308', fontWeight: 700, fontSize: 11 }}>🛡️ Risk AI Reasoning</span>
              <div style={{ marginTop: 4 }}>{riskReport.llm_reasoning}</div>
            </div>
          )}
        </div>
      )}

      {/* 🆕 v4.0 — APM Report */}
      {apmData.status && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          border: '2px solid #8b5cf6',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#8b5cf6' }}>
              🎯 Adaptive Position Manager (APM)
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                background: apmData.status.enabled ? '#22c55e22' : '#ef444422',
                color: apmData.status.enabled ? '#22c55e' : '#ef4444',
                border: `1px solid ${apmData.status.enabled ? '#22c55e44' : '#ef444444'}`,
              }}>
                {apmData.status.enabled ? '✅ ENABLED' : '❌ DISABLED'}
              </span>
              {apmData.status.remaining_hours !== null && apmData.status.remaining_hours !== undefined && (
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 10,
                  background: '#3b82f622',
                  color: '#3b82f6',
                  border: '1px solid #3b82f644',
                }}>
                  ⏰ Next: {apmData.status.remaining_hours}h
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          {apmData.summary && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 8,
              marginBottom: 12,
            }}>
              {[
                { l: 'Total', v: apmData.summary.total_decisions, c: 'white' },
                { l: 'Actions', v: apmData.summary.actions_taken, c: '#f97316' },
                { l: 'HOLD', v: apmData.summary.counts?.HOLD || 0, c: '#22c55e' },
                { l: 'Scale', v: apmData.summary.counts?.SCALE_OUT || 0, c: '#eab308' },
                { l: 'Exit', v: apmData.summary.counts?.EXIT || 0, c: '#ef4444' },
                { l: 'Tighten', v: apmData.summary.counts?.TIGHTEN_STOP || 0, c: '#f97316' },
              ].map((item) => (
                <div key={item.l} style={{
                  background: '#1e293b',
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>{item.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: item.c, marginTop: 2 }}>
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Latest 3 decisions */}
          {apmData.history.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>
                📋 Latest 5 Decisions
              </div>
              {apmData.history.slice(0, 5).map((d) => {
                const colors = {
                  HOLD: '#22c55e',
                  EXIT: '#ef4444',
                  SCALE_OUT: '#eab308',
                  TIGHTEN_STOP: '#f97316',
                };
                const emojis = {
                  HOLD: '🟢',
                  EXIT: '🔴',
                  SCALE_OUT: '🟡',
                  TIGHTEN_STOP: '🛡️',
                };
                const color = colors[d.decision] || '#64748b';
                const emoji = emojis[d.decision] || '⚪';
                return (
                  <div key={d.id} style={{
                    background: '#1e293b',
                    borderRadius: 6,
                    padding: 8,
                    marginBottom: 4,
                    fontSize: 11,
                    borderLeft: `3px solid ${color}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12 }}>{emoji}</span>
                      <span style={{ fontWeight: 700, color: 'white' }}>{d.ticker}</span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 9,
                        fontWeight: 700,
                        background: color + '22',
                        color: color,
                      }}>
                        {d.decision}
                      </span>
                      <span style={{
                        color: d.current_pnl_pct >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                      }}>
                        {d.current_pnl_pct >= 0 ? '+' : ''}{d.current_pnl_pct?.toFixed(2)}%
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: 10 }}>
                      {d.created_at ? new Date(d.created_at + 'Z').toLocaleString('en-US', {
                        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
                      }) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info banner */}
          <div style={{
            padding: '8px 10px',
            background: '#8b5cf61a',
            border: '1px solid #8b5cf644',
            borderRadius: 8,
            fontSize: 11,
            color: '#c4b5fd',
          }}>
            💬 APM rivaluta ogni <strong>{apmData.status.interval_hours}h</strong> tutte le posizioni aperte con LLM reasoning italiano. Decide HOLD/SCALE OUT/EXIT/TIGHTEN in modo adattivo.
          </div>
        </div>
      )}

      {/* Agent Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {Object.entries(AGENT_INFO).map(([name, info]) => {
          const ad = ag[name] || {};
          const p = ad.params || {};
          const rc = ad.recent_decisions?.length || 0;
          const is_ = selectedAgent === name;
          return (
            <div
              key={name}
              onClick={() => {
                setSelectedAgent(is_ ? null : name);
                if (!is_ && name !== 'adaptive_position_manager') {
                  fetchAgentDecisions(name);
                }
              }}
              style={{
                background: '#0f172a',
                borderRadius: 12,
                padding: 16,
                border: `2px solid ${is_ ? info.color : '#1e293b'}`,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: 18, marginRight: 6 }}>{info.emoji}</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                    {info.name}
                  </span>
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>{rc} decisions</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>
                {info.desc}
              </div>

              {name === 'macro_analyst' && p.w_spy_trend && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { l: 'SPY', v: p.w_spy_trend },
                    { l: 'Breadth', v: p.w_breadth },
                    { l: 'VIX', v: p.w_vix },
                  ].map((w) => (
                    <span
                      key={w.l}
                      style={{
                        background: '#1e293b',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        color: '#94a3b8',
                      }}
                    >
                      {w.l}: {((w.v || 0) * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              )}

              {name === 'alpha_strategist' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Min Conf: {p.min_confluence || 35}
                  </span>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Max RSI: {p.max_rsi_entry || 68}
                  </span>
                  {(p.best_setups || []).slice(0, 2).map((s) => (
                    <span
                      key={s}
                      style={{
                        background: '#22c55e15',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        color: '#22c55e',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {name === 'risk_manager' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Risk: {p.risk_pct_per_trade || 2}%
                  </span>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    R/R{'\u2265'}{p.min_risk_reward || 1.5}
                  </span>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Max: {p.max_positions || 5} pos
                  </span>
                </div>
              )}

              {name === 'adaptive_position_manager' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Check: {p.apm_check_interval_hours || 3}h
                  </span>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Exit Conf: {p.apm_exit_confluence_threshold || 30}
                  </span>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: p.apm_enabled !== false ? '#8b5cf6' : '#ef4444' }}>
                    {p.apm_enabled !== false ? '✅ ON' : '❌ OFF'}
                  </span>
                </div>
              )}

              {name === 'executor' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
                    Buffer: {p.limit_price_buffer_pct || 0.5}%
                  </span>
                  <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: p.send_telegram !== false ? '#22c55e' : '#ef4444' }}>
                    {p.send_telegram !== false ? '\uD83D\uDCF1 TG On' : '\uD83D\uDCF1 TG Off'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Agent Decisions */}
      {selectedAgent && selectedAgent !== 'adaptive_position_manager' && (
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${AGENT_INFO[selectedAgent]?.color || '#334155'}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15 }}>
              {AGENT_INFO[selectedAgent]?.emoji} {AGENT_INFO[selectedAgent]?.name} — Recent
              Decisions
            </h3>
            <button
              onClick={() => setSelectedAgent(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              {'\u2715'}
            </button>
          </div>
          {agentDecisions.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              No decisions yet
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {agentDecisions.map((d, i) => (
                <div
                  key={d._id || i}
                  style={{
                    background: '#1e293b',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        color: AGENT_INFO[selectedAgent]?.color,
                        fontWeight: 600,
                      }}
                    >
                      {d.type}
                    </span>
                    <span style={{ color: '#64748b' }}>
                      {d.created_at ? new Date(d.created_at + (d.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', marginBottom: 4 }}>{d.reasoning}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#64748b' }}>
                      Confidence: {d.confidence?.toFixed(0) || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Executor AI Reasoning */}
      {agentsStatus?.shared_brain?.executions?.details?.llm_reasoning && (
        <div style={{
          background: '#0f172a', borderRadius: 12, padding: 16, marginTop: 20, border: '1px solid #1e293b',
        }}>
          <div style={{
            background: '#1e293b', borderRadius: 8, padding: 12,
            borderLeft: '3px solid #f97316', fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
          }}>
            <span style={{ color: '#f97316', fontWeight: 700, fontSize: 11 }}>⚡ Executor AI Reasoning</span>
            <div style={{ marginTop: 4 }}>{agentsStatus.shared_brain.executions.details.llm_reasoning}</div>
          </div>
        </div>
      )}
      
      {/* Last Actions */}
      {ps?.actions?.length > 0 && (
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            border: '1px solid #1e293b',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>{'\uD83D\uDCCB'} Last Actions</h3>
          {ps.actions.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#1e293b',
                borderRadius: 6,
                padding: 8,
                marginBottom: 6,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  color: a.action === 'BUY' ? '#22c55e' : '#ef4444',
                  fontWeight: 700,
                }}
              >
                {a.action} {a.ticker}
              </span>
              <span style={{ color: '#94a3b8' }}>
                {a.shares && `${a.shares} shares`} {a.reason || ''}{' '}
                {a.pnl_pct
                  ? `(${a.pnl_pct > 0 ? '+' : ''}${a.pnl_pct}%)`
                  : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
