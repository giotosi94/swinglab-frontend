import React from 'react';

export default function Settings({
  settings, setSettings, saveSettings, settingsSaving, alpacaData,
}) {
  const sliders = [
    { key: 'max_positions', label: 'Max Positions', min: 3, max: 10, step: 1, unit: '', desc: 'Quante posizioni aperte contemporaneamente' },
    { key: 'risk_pct_per_trade', label: 'Risk per Trade', min: 0.5, max: 5, step: 0.25, unit: '%', desc: '% del capitale rischiato per singolo trade' },
    { key: 'max_position_pct', label: 'Max per Position', min: 10, max: 40, step: 5, unit: '%', desc: '% max del capitale per una singola posizione' },
    { key: 'min_risk_reward', label: 'Min Risk/Reward', min: 1.0, max: 3.0, step: 0.1, unit: ':1', desc: 'Rapporto minimo reward/risk accettabile' },
    { key: 'max_per_sector', label: 'Max per Sector', min: 1, max: 4, step: 1, unit: '', desc: 'Max stock dallo stesso settore' },
    { key: 'daily_loss_limit_pct', label: 'Daily Loss Limit', min: -10, max: -1, step: 0.5, unit: '%', desc: 'Smette di tradare se perde oltre questa %' },
    { key: 'weekly_loss_limit_pct', label: 'Weekly Loss Limit', min: -15, max: -2, step: 1, unit: '%', desc: 'Riduce esposizione oltre questa % settimanale' },
  ];

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
        {/* Starting Capital */}
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 16,
            border: '1px solid #1e293b',
            gridColumn: '1 / -1',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>
            {'\uD83D\uDCB0'} Starting Capital
          </h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>$</span>
            <input
              type="number"
              value={settings.starting_capital}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  starting_capital: parseFloat(e.target.value) || 0,
                })
              }
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #334155',
                background: '#1e293b',
                color: 'white',
                fontSize: 16,
                fontWeight: 700,
                width: 200,
              }}
            />
            <span style={{ color: '#64748b', fontSize: 12 }}>
              Capitale iniziale per calcolare P&L totale
            </span>
          </div>
          {alpacaData && settings.starting_capital > 0 && (() => {
            const t = alpacaData.equity - settings.starting_capital;
            const p = (t / settings.starting_capital) * 100;
            return (
              <div style={{ marginTop: 10, fontSize: 14 }}>
                <span style={{ color: '#94a3b8' }}>Total P&L: </span>
                <span
                  style={{
                    color: t >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 700,
                  }}
                >
                  {t >= 0 ? '+' : ''}${t.toFixed(2)} ({p >= 0 ? '+' : ''}
                  {p.toFixed(2)}%)
                </span>
              </div>
            );
          })()}
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
