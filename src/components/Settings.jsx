import React, { useState, useEffect } from 'react';
import { fetchStartingCapital } from '../utils/api';

export default function Settings({
  settings, setSettings, saveSettings, settingsSaving, alpacaData,
}) {
  // 🆕 v2.2 — Starting capital preso da Alpaca (fonte di verità)
  const [capitalData, setCapitalData] = useState(null);
  const [capitalLoading, setCapitalLoading] = useState(true);

  useEffect(() => {
    async function loadCapital() {
      setCapitalLoading(true);
      const data = await fetchStartingCapital();
      setCapitalData(data);
      setCapitalLoading(false);
    }
    loadCapital();
    // Refresh ogni 60 secondi
    const interval = setInterval(loadCapital, 60000);
    return () => clearInterval(interval);
  }, []);

  const sliders = [
    { key: 'max_positions', label: 'Max Positions', min: 3, max: 10, step: 1, unit: '', desc: 'Quante posizioni aperte contemporaneamente' },
    { key: 'risk_pct_per_trade', label: 'Risk per Trade', min: 0.5, max: 5, step: 0.25, unit: '%', desc: '% del capitale rischiato per singolo trade' },
    { key: 'max_position_pct', label: 'Max per Position', min: 10, max: 40, step: 5, unit: '%', desc: '% max del capitale per una singola posizione' },
    { key: 'min_risk_reward', label: 'Min Risk/Reward', min: 1.0, max: 3.0, step: 0.1, unit: ':1', desc: 'Rapporto minimo reward/risk accettabile' },
    { key: 'max_per_sector', label: 'Max per Sector', min: 1, max: 4, step: 1, unit: '', desc: 'Max stock dallo stesso settore' },
    { key: 'daily_loss_limit_pct', label: 'Daily Loss Limit', min: -10, max: -1, step: 0.5, unit: '%', desc: 'Smette di tradare se perde oltre questa %' },
    { key: 'weekly_loss_limit_pct', label: 'Weekly Loss Limit', min: -15, max: -2, step: 1, unit: '%', desc: 'Riduce esposizione oltre questa % settimanale' },
  ];

  // Fallback ai valori Alpaca se capitalData non è ancora caricato
  const startingCapital = capitalData?.starting_capital ?? 0;
  const currentEquity = capitalData?.current_equity ?? (alpacaData?.equity ?? 0);
  const totalPnl = capitalData?.total_pnl_dollar ?? 0;
  const totalPnlPct = capitalData?.total_pnl_pct ?? 0;
  const startingDate = capitalData?.starting_date ?? 'unknown';

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>{'\u2699\uFE0F'} Settings</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {/* 🆕 v2.2 — Portfolio Overview (READONLY, sync con Alpaca) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 12,
            padding: 20,
            border: '1px solid #334155',
            gridColumn: '1 / -1',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>
              {'\uD83D\uDCB0'} Portfolio Overview
            </h3>
            <span
              style={{
                background: '#22c55e22',
                color: '#22c55e',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                border: '1px solid #22c55e44',
              }}
            >
              {'\uD83D\uDD17'} Synced with Alpaca
            </span>
          </div>

          {capitalLoading ? (
            <div style={{ color: '#64748b', fontSize: 13 }}>Loading portfolio data...</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              {/* Starting Capital */}
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Starting Capital
                </div>
                <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
                  ${startingCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                  Since {startingDate}
                </div>
              </div>

              {/* Current Equity */}
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Current Equity
                </div>
                <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
                  ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                  Live from Alpaca
                </div>
              </div>

              {/* Total P&L $ */}
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Total P&L
                </div>
                <div style={{ color: totalPnl >= 0 ? '#22c55e' : '#ef4444', fontSize: 22, fontWeight: 700 }}>
                  {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                  Realized + Unrealized
                </div>
              </div>

              {/* Total P&L % */}
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Return %
                </div>
                <div style={{ color: totalPnlPct >= 0 ? '#22c55e' : '#ef4444', fontSize: 22, fontWeight: 700 }}>
                  {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
                </div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                  Since inception
                </div>
              </div>
            </div>
          )}

          {/* Info banner */}
          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              background: '#3b82f61a',
              border: '1px solid #3b82f644',
              borderRadius: 8,
              fontSize: 12,
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{'\u2139\uFE0F'}</span>
            <span>
              Il capitale iniziale viene sincronizzato automaticamente con la portfolio history di Alpaca.
              Non è più modificabile manualmente.
            </span>
          </div>
        </div>

        {/* Slider Cards */}
        {sliders.map((s) => (
          <div
            key={s.key}
            style={{
              background: '#0f172a',
              borderRadius: 12,
              padding: 16,
              border: '1px solid #1e293b',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>
                {s.label}
              </span>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>
                {settings[s.key]}
                {s.unit}
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>
              {s.desc}
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={settings[s.key]}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [s.key]: parseFloat(e.target.value),
                })
              }
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: '#475569',
              }}
            >
              <span>
                {s.min}
                {s.unit}
              </span>
              <span>
                {s.max}
                {s.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <button
          onClick={saveSettings}
          disabled={settingsSaving}
          style={{
            padding: '10px 24px',
            background: settingsSaving ? '#334155' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {settingsSaving ? 'Saving...' : '\uD83D\uDCBE Save Settings'}
        </button>
        <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center' }}>
          Usati dal RiskManager al prossimo pipeline run
        </span>
      </div>
    </div>
  );
}
