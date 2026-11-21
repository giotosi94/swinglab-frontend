import React, { useEffect, useState } from 'react';
import {
  fetchMlVersions,
  fetchTrendVersions,
  promoteMlVersion,
  promoteTrendVersion,
  rollbackMl,
  rollbackTrend,
  runMlWeeklyRetrain,
} from '../utils/api';

const COLORS = {
  panel: '#0f172a', panel2: '#172235', border: '#23324a',
  text: '#f8fafc', muted: '#8da0ba', green: '#22c55e',
  red: '#ef4444', blue: '#3b82f6', orange: '#f97316',
};

const panel = { background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14 };
const compactCard = { background: COLORS.panel2, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12 };

function formatDate(value) {
  if (!value) return 'Mai';
  const normalized = typeof value === 'string' && !value.endsWith('Z') ? `${value}Z` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('it-IT');
}

export default function MlModelsPanel() {
  const [mlXgb, setMlXgb] = useState({ production: null, versions: [] });
  const [mlTrend, setMlTrend] = useState({ production: null, versions: [] });
  const [mlBusy, setMlBusy] = useState(false);
  const [mlMsg, setMlMsg] = useState(null);

  async function load() {
    const [xgbVers, trendVers] = await Promise.all([
      fetchMlVersions(6),
      fetchTrendVersions(6),
    ]);
    setMlXgb({ production: xgbVers?.production || null, versions: xgbVers?.versions || [] });
    setMlTrend({ production: trendVers?.production || null, versions: trendVers?.versions || [] });
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  async function handlePromote(family, versionId) {
    setMlBusy(true);
    setMlMsg(null);
    try {
      const res = family === 'trend'
        ? await promoteTrendVersion(versionId)
        : await promoteMlVersion(versionId);
      if (!res || res.error || res.promoted === false) {
        setMlMsg({ type: 'error', text: res?.error || 'Promote fallito' });
      } else {
        setMlMsg({ type: 'ok', text: res.message || `${versionId} promossa` });
        await load();
      }
    } catch (e) {
      setMlMsg({ type: 'error', text: String(e?.message || e) });
    } finally {
      setMlBusy(false);
    }
  }

  async function handleRollback(family) {
    setMlBusy(true);
    setMlMsg(null);
    try {
      const res = family === 'trend' ? await rollbackTrend() : await rollbackMl();
      if (!res || res.error || res.rolled_back === false) {
        setMlMsg({ type: 'error', text: res?.error || 'Rollback fallito' });
      } else {
        setMlMsg({ type: 'ok', text: res.message || `Rollback a ${res.to}` });
        await load();
      }
    } catch (e) {
      setMlMsg({ type: 'error', text: String(e?.message || e) });
    } finally {
      setMlBusy(false);
    }
  }

  async function handleRetrain() {
    setMlBusy(true);
    setMlMsg(null);
    try {
      const res = await runMlWeeklyRetrain(true);
      if (!res || String(res.status || '').startsWith('failed')) {
        setMlMsg({ type: 'error', text: res?.status || 'Retrain fallito' });
      } else {
        setMlMsg({
          type: 'ok',
          text: `Retrain OK · XGB ${res.train_xgboost?.version || '?'} · Trend ${res.train_trend?.version || '?'}`,
        });
        await load();
      }
    } catch (e) {
      setMlMsg({ type: 'error', text: String(e?.message || e) });
    } finally {
      setMlBusy(false);
    }
  }

  function VersionList({ family, data, accent }) {
    const prodLabel = data.production?.active_version
      || (data.production?.legacy ? 'legacy' : '—');
    return (
      <div style={compactCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ color: accent, fontWeight: 800, fontSize: 12 }}>
            {family === 'xgboost' ? 'XGBoost · WIN/LOSS' : 'Trend · 5 giorni'}
          </div>
          <button
            onClick={() => handleRollback(family)}
            disabled={mlBusy || !data.production?.previous_version}
            style={{
              background: 'transparent', color: COLORS.muted,
              border: `1px solid ${COLORS.border}`, borderRadius: 6,
              padding: '4px 8px', fontSize: 10,
              cursor: mlBusy ? 'wait' : 'pointer',
            }}
          >
            Rollback
          </button>
        </div>
        <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7, marginBottom: 8 }}>
          <div>production: <strong style={{ color: COLORS.text }}>{prodLabel}</strong></div>
          {data.production?.metadata?.accuracy != null && (
            <div>accuracy: <strong style={{ color: COLORS.green }}>{data.production.metadata.accuracy}%</strong></div>
          )}
          {data.production?.previous_version && (
            <div>previous: <strong style={{ color: COLORS.text }}>{data.production.previous_version}</strong></div>
          )}
        </div>
        {(data.versions || []).slice(0, 5).map((v) => (
          <div
            key={v._id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              padding: '6px 0', borderTop: `1px solid ${COLORS.border}`, fontSize: 11,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <span style={{ color: v.is_production ? COLORS.green : COLORS.text, fontWeight: 700 }}>{v._id}</span>
              {v.is_production && <span style={{ color: COLORS.green, marginLeft: 6, fontSize: 10 }}>PROD</span>}
              <div style={{ color: COLORS.muted, fontSize: 10 }}>
                {v.metadata?.accuracy != null ? `${v.metadata.accuracy}%` : '—'}
                {v.created_at ? ` · ${formatDate(v.created_at)}` : ''}
              </div>
            </div>
            {!v.is_production && (
              <button
                onClick={() => handlePromote(family, v._id)}
                disabled={mlBusy}
                style={{
                  background: `${accent}18`, color: accent,
                  border: `1px solid ${accent}44`, borderRadius: 6,
                  padding: '4px 8px', fontSize: 10, fontWeight: 700,
                  cursor: mlBusy ? 'wait' : 'pointer', flexShrink: 0,
                }}
              >
                Promote
              </button>
            )}
          </div>
        ))}
        {!(data.versions || []).length && (
          <div style={{ fontSize: 11, color: COLORS.muted }}>
            Nessuna versione ancora. Lancia un train o attendi il cron domenicale.
          </div>
        )}
      </div>
    );
  }

  return (
    <section style={{ ...panel, padding: 16, marginBottom: 14, borderLeft: `3px solid ${COLORS.blue}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: COLORS.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            ML Models v3
          </div>
          <h3 style={{ margin: '4px 0 6px', fontSize: 16 }}>Versioning modelli</h3>
          <div style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.5, maxWidth: 520 }}>
            XGBoost (WIN/LOSS) e Trend (5g). Training automatico la domenica. Promote / rollback senza interrompere il pipeline.
          </div>
        </div>
        <button
          onClick={handleRetrain}
          disabled={mlBusy}
          style={{
            background: mlBusy ? COLORS.panel2 : `${COLORS.blue}22`,
            color: COLORS.text,
            border: `1px solid ${COLORS.blue}66`,
            borderRadius: 8,
            padding: '10px 14px',
            cursor: mlBusy ? 'wait' : 'pointer',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {mlBusy ? 'Operazione…' : 'Retrain ora'}
        </button>
      </div>

      {mlMsg && (
        <div style={{
          marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: 11,
          background: mlMsg.type === 'ok' ? `${COLORS.green}15` : `${COLORS.red}15`,
          border: `1px solid ${mlMsg.type === 'ok' ? COLORS.green : COLORS.red}44`,
          color: mlMsg.type === 'ok' ? COLORS.green : COLORS.red,
        }}>
          {mlMsg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 14 }}>
        <VersionList family="xgboost" data={mlXgb} accent={COLORS.blue} />
        <VersionList family="trend" data={mlTrend} accent={COLORS.orange} />
      </div>
    </section>
  );
}
