import React, { useState, useEffect } from 'react';
import { fetchApmHistory, fetchApmStatus, fetchApmSummary } from '../utils/api';

export default function ApmActions() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, HOLD, EXIT, SCALE_OUT, TIGHTEN_STOP

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [h, s, sum] = await Promise.all([
        fetchApmHistory(50),
        fetchApmStatus(),
        fetchApmSummary(7),
      ]);
      setHistory(h?.decisions || []);
      setStatus(s || null);
      setSummary(sum || null);
      setLoading(false);
    }
    loadAll();
    // Refresh ogni 60 secondi
    const interval = setInterval(loadAll, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter decisions
  const filteredHistory = filter === 'ALL'
    ? history
    : history.filter(d => d.decision === filter);

  // Colori per decisione
  const decisionColor = {
    HOLD: '#22c55e',
    EXIT: '#ef4444',
    SCALE_OUT: '#eab308',
    TIGHTEN_STOP: '#f97316',
    SKIP: '#64748b',
  };

  const decisionEmoji = {
    HOLD: '🟢',
    EXIT: '🔴',
    SCALE_OUT: '🟡',
    TIGHTEN_STOP: '🛡️',
    SKIP: '⚪',
  };

  const decisionLabel = {
    HOLD: 'HOLD',
    EXIT: 'EXIT',
    SCALE_OUT: 'SCALE OUT',
    TIGHTEN_STOP: 'TIGHTEN',
    SKIP: 'SKIP',
  };

  // Format time
  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const day = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${time}`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 12,
      padding: 20,
      border: '2px solid #8b5cf6',
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, color: '#8b5cf6' }}>
            🎯 Adaptive Position Manager
          </h3>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            Timeline decisioni intelligenti sulle posizioni aperte
          </div>
        </div>

        {status && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              background: status.enabled ? '#22c55e22' : '#ef444422',
              color: status.enabled ? '#22c55e' : '#ef4444',
              border: `1px solid ${status.enabled ? '#22c55e44' : '#ef444444'}`,
            }}>
              {status.enabled ? '✅ ENABLED' : '❌ DISABLED'}
            </div>
            
            {status.remaining_hours !== null && status.remaining_hours !== undefined && (
              <div style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                background: '#3b82f622',
                color: '#3b82f6',
                border: '1px solid #3b82f644',
              }}>
                ⏰ Next: {status.remaining_hours}h
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary stats */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
          marginBottom: 16,
        }}>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{summary.total_decisions}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Last 7 days</div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Actions</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>{summary.actions_taken}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Taken</div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Hold</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>{summary.counts?.HOLD || 0}</div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Scale</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#eab308' }}>{summary.counts?.SCALE_OUT || 0}</div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Exit</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{summary.counts?.EXIT || 0}</div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Tighten</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>{summary.counts?.TIGHTEN_STOP || 0}</div>
          </div>
        </div>
      )}

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['ALL', 'HOLD', 'SCALE_OUT', 'EXIT', 'TIGHTEN_STOP'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              background: filter === f ? '#8b5cf6' : '#1e293b',
              color: filter === f ? 'white' : '#94a3b8',
            }}
          >
            {f === 'ALL' ? 'ALL' : decisionLabel[f] || f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Loading APM decisions...</div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
          {filter === 'ALL' ? 'No APM decisions yet' : `No ${decisionLabel[filter] || filter} decisions`}
        </div>
      ) : (
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {filteredHistory.map((d, i) => (
            <div
              key={d.id || i}
              style={{
                background: '#0f172a',
                borderRadius: 8,
                padding: 12,
                marginBottom: 6,
                borderLeft: `3px solid ${decisionColor[d.decision] || '#64748b'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{decisionEmoji[d.decision] || '⚪'}</span>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{d.ticker}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    background: (decisionColor[d.decision] || '#64748b') + '22',
                    color: decisionColor[d.decision] || '#64748b',
                    border: `1px solid ${(decisionColor[d.decision] || '#64748b') + '44'}`,
                  }}>
                    {decisionLabel[d.decision] || d.decision}
                  </span>
                  {d.action_taken && (
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      background: '#f9731622',
                      color: '#f97316',
                    }}>
                      ACTION
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    color: d.current_pnl_pct >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 700,
                    fontSize: 12,
                  }}>
                    {d.current_pnl_pct >= 0 ? '+' : ''}{d.current_pnl_pct?.toFixed(2)}%
                  </span>
                  <span style={{ color: '#64748b', fontSize: 10 }}>{formatTime(d.created_at)}</span>
                </div>
              </div>

              {/* State snapshot mini */}
              {d.state_snapshot && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap', fontSize: 10 }}>
                  <span style={{ color: '#94a3b8' }}>
                    Conf: <span style={{ color: 'white' }}>{d.state_snapshot.confluence_original}→{d.state_snapshot.confluence_now?.toFixed(0)}</span>
                  </span>
                  {d.state_snapshot.ml_score_now > 0 && (
                    <span style={{ color: '#94a3b8' }}>
                      ML: <span style={{ color: '#8b5cf6' }}>{d.state_snapshot.ml_score_now?.toFixed(0)}% {d.state_snapshot.ml_prediction_now}</span>
                    </span>
                  )}
                  {d.state_snapshot.trend_prediction_now && (
                    <span style={{ color: '#94a3b8' }}>
                      Trend: <span style={{ color: '#3b82f6' }}>{d.state_snapshot.trend_prediction_now}</span>
                    </span>
                  )}
                  <span style={{ color: '#94a3b8' }}>
                    Regime: <span style={{ color: 'white' }}>{d.state_snapshot.regime}</span>
                  </span>
                </div>
              )}

              {/* Reason */}
              <div style={{ fontSize: 11, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5 }}>
                💬 {d.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
