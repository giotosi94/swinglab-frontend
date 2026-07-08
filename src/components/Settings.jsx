import React, { useState, useEffect } from 'react';
import { fetchStartingCapital } from '../utils/api';

export default function Settings({
  settings, setSettings, saveSettings, settingsSaving, alpacaData,
}) {
  // v2.2 — Starting capital preso da Alpaca (fonte di verità)
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
    const interval = setInterval(loadCapital, 60000);
    return () => clearInterval(interval);
  }, []);

  // Risk sliders
  const riskSliders = [
    { key: 'max_positions', label: 'Max Positions', min: 3, max: 15, step: 1, unit: '', desc: 'Quante posizioni aperte contemporaneamente' },
    { key: 'risk_pct_per_trade', label: 'Risk per Trade', min: 0.5, max: 5, step: 0.25, unit: '%', desc: '% del capitale rischiato per singolo trade' },
    { key: 'max_position_pct', label: 'Max per Position', min: 10, max: 40, step: 5, unit: '%', desc: '% max del capitale per una singola posizione' },
    { key: 'min_risk_reward', label: 'Min Risk/Reward', min: 1.0, max: 3.0, step: 0.1, unit: ':1', desc: 'Rapporto minimo reward/risk accettabile' },
    { key: 'max_per_sector', label: 'Max per Sector', min: 1, max: 4, step: 1, unit: '', desc: 'Max stock dallo stesso settore' },
    { key: 'daily_loss_limit_pct', label: 'Daily Loss Limit', min: -10, max: -1, step: 0.5, unit: '%', desc: 'Smette di tradare se perde oltre questa %' },
    { key: 'weekly_loss_limit_pct', label: 'Weekly Loss Limit', min: -15, max: -2, step: 1, unit: '%', desc: 'Riduce esposizione oltre questa % settimanale' },
    { key: 'position_size_pct', label: 'Position Size %', min: 5, max: 25, step: 1, unit: '%', desc: '% capitale per ogni nuova posizione' },
  ];

  // APM sliders (grouped by section)
  const apmExitSliders = [
    { key: 'apm_exit_confluence_threshold', label: 'Exit Confluence', min: 15, max: 50, step: 1, unit: '', desc: 'Sotto questa confluence, APM considera EXIT' },
    { key: 'apm_exit_ml_threshold', label: 'Exit ML Threshold', min: 20, max: 60, step: 1, unit: '%', desc: 'Sotto questa ML WIN %, APM considera EXIT' },
    { key: 'apm_exit_min_negative_factors', label: 'Min Negative Factors', min: 1, max: 4, step: 1, unit: '', desc: 'Minimo fattori negativi per triggerare EXIT' },
  ];

  const apmScaleOutSliders = [
    { key: 'apm_target_1_pct', label: 'Target 1', min: 3, max: 10, step: 0.5, unit: '%', desc: 'Primo target profit (chiude parte)' },
    { key: 'apm_target_1_size', label: 'T1 Size', min: 30, max: 70, step: 5, unit: '%', desc: '% posizione da chiudere al T1' },
    { key: 'apm_target_2_pct', label: 'Target 2', min: 7, max: 15, step: 0.5, unit: '%', desc: 'Secondo target profit' },
    { key: 'apm_target_2_size', label: 'T2 Size', min: 20, max: 50, step: 5, unit: '%', desc: '% posizione da chiudere al T2' },
    { key: 'apm_target_3_pct', label: 'Target 3', min: 15, max: 30, step: 1, unit: '%', desc: 'Terzo target profit (residuo)' },
    { key: 'apm_target_3_size', label: 'T3 Size', min: 10, max: 30, step: 5, unit: '%', desc: '% posizione da chiudere al T3' },
  ];

  const apmTightenSliders = [
    { key: 'apm_tighten_profit_threshold', label: 'Tighten Trigger', min: 1, max: 8, step: 0.5, unit: '%', desc: 'Profit % dove tighten SL se ML bearish' },
    { key: 'apm_tighten_new_sl_distance', label: 'New SL Distance', min: 1, max: 5, step: 0.5, unit: '%', desc: '% sotto current price per nuovo SL' },
  ];

  const apmFrequencySliders = [
    { key: 'apm_check_interval_hours', label: 'Check Interval', min: 1, max: 8, step: 1, unit: 'h', desc: 'Ogni quante ore APM rivaluta' },
    { key: 'apm_urgent_check_drop_pct', label: 'Urgent Drop', min: 3, max: 10, step: 0.5, unit: '%', desc: 'Drop % che triggera check immediato' },
  ];

  // Fallback ai valori Alpaca se capitalData non è ancora caricato
  const startingCapital = capitalData?.starting_capital ?? 0;
  const currentEquity = capitalData?.current_equity ?? (alpacaData?.equity ?? 0);
  const totalPnl = capitalData?.total_pnl_dollar ?? 0;
  const totalPnlPct = capitalData?.total_pnl_pct ?? 0;
  const startingDate = capitalData?.starting_date ?? 'unknown';

  const apmEnabled = settings.apm_enabled !== false;
  const scalingEnabled = settings.apm_scaling_enabled !== false;

  // Slider card component
  const SliderCard = ({ s, disabled }) => (
    <div
      style={{
        background: disabled ? '#0a1220' : '#0f172a',
        borderRadius: 12,
        padding: 16,
        border: '1px solid #1e293b',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{s.label}</span>
        <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>
          {settings[s.key]}{s.unit}
        </span>
      </div>
      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>{s.desc}</div>
      <input
        type="range"
        min={s.min}
        max={s.max}
        step={s.step}
        value={settings[s.key] ?? s.min}
        disabled={disabled}
        onChange={(e) =>
          setSettings({ ...settings, [s.key]: parseFloat(e.target.value) })
        }
        style={{ width: '100%', accentColor: '#3b82f6' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569' }}>
        <span>{s.min}{s.unit}</span>
        <span>{s.max}{s.unit}</span>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>{'\u2699\uFE0F'} Settings</h2>

      {/* ===== PORTFOLIO OVERVIEW (READONLY, sync con Alpaca) ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #334155',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>{'\uD83D\uDCB0'} Portfolio Overview</h3>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Starting Capital</div>
              <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
                ${startingCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Since {startingDate}</div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Current Equity</div>
              <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
                ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Live from Alpaca</div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Total P&L</div>
              <div style={{ color: totalPnl >= 0 ? '#22c55e' : '#ef4444', fontSize: 22, fontWeight: 700 }}>
                {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Realized + Unrealized</div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Return %</div>
              <div style={{ color: totalPnlPct >= 0 ? '#22c55e' : '#ef4444', fontSize: 22, fontWeight: 700 }}>
                {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Since inception</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== RISK MANAGEMENT ===== */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12, color: '#3b82f6' }}>
          {'\uD83D\uDEE1\uFE0F'} Risk Management
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
          {riskSliders.map((s) => <SliderCard key={s.key} s={s} />)}
        </div>
      </div>

      {/* ===== 🆕 APM CONFIGURATION ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 12,
        padding: 20,
        border: '2px solid #8b5cf6',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#8b5cf6' }}>
              🎯 Adaptive Position Manager (APM)
            </h3>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Gestisce le posizioni aperte in modo intelligente. Rivaluta e decide HOLD/SCALE/EXIT/TIGHTEN.
            </div>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={apmEnabled}
              onChange={(e) => setSettings({ ...settings, apm_enabled: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: '#8b5cf6' }}
            />
            <span style={{ color: apmEnabled ? '#8b5cf6' : '#64748b', fontWeight: 700 }}>
              {apmEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </label>
        </div>

        {/* APM EXIT */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, color: '#ef4444', marginBottom: 8 }}>🔴 EXIT Triggers</h4>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
            Quando la tesi originale è invalidata → APM esce completamente dalla posizione.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {apmExitSliders.map((s) => <SliderCard key={s.key} s={s} disabled={!apmEnabled} />)}
          </div>
        </div>

        {/* APM SCALE OUT */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, color: '#eab308', margin: 0 }}>🟡 SCALE OUT (Multi-Target)</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={scalingEnabled}
                disabled={!apmEnabled}
                onChange={(e) => setSettings({ ...settings, apm_scaling_enabled: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: '#eab308' }}
              />
              <span style={{ color: scalingEnabled ? '#eab308' : '#64748b', fontSize: 11, fontWeight: 700 }}>
                {scalingEnabled ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
            Chiude parti di posizione a target progressivi. Cash flow ottimizzato.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {apmScaleOutSliders.map((s) => <SliderCard key={s.key} s={s} disabled={!apmEnabled || !scalingEnabled} />)}
          </div>
        </div>

        {/* APM TIGHTEN */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, color: '#f97316', marginBottom: 8 }}>🛡️ TIGHTEN STOP</h4>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
            Se profit alto ma ML predice DOWN → alza SL per proteggere profit.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {apmTightenSliders.map((s) => <SliderCard key={s.key} s={s} disabled={!apmEnabled} />)}
          </div>
        </div>

        {/* APM FREQUENCY */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ fontSize: 13, color: '#22c55e', marginBottom: 8 }}>⏰ Frequency</h4>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
            Quanto spesso APM rivaluta le posizioni.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {apmFrequencySliders.map((s) => <SliderCard key={s.key} s={s} disabled={!apmEnabled} />)}
          </div>
        </div>

        {/* APM Info Banner */}
        <div style={{
          marginTop: 16,
          padding: '10px 12px',
          background: '#8b5cf61a',
          border: '1px solid #8b5cf644',
          borderRadius: 8,
          fontSize: 12,
          color: '#c4b5fd',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>{'\u2139\uFE0F'}</span>
          <span>
            APM rivaluta ogni <strong>{settings.apm_check_interval_hours || 3}h</strong> tutte le posizioni aperte con LLM reasoning.
            Se drop &gt; <strong>{settings.apm_urgent_check_drop_pct || 5}%</strong> in 1h → check immediato (urgent).
          </span>
        </div>
      </div>

      {/* ===== SAVE BUTTON ===== */}
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
          Propagati a tutti i 5 agenti (incluso APM) al prossimo run
        </span>
      </div>
    </div>
  );
}
