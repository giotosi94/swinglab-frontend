import React, { useState, useEffect } from 'react';
import { API } from '../utils/constants';

export default function Settings({ settings, setSettings, saveSettings, settingsSaving }) {
  const [presets, setPresets] = useState({});
  const [currentPreset, setCurrentPreset] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [applying, setApplying] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/settings/presets`)
      .then(r => r.json())
      .then(data => {
        setPresets(data.presets || {});
        setCurrentPreset(data.current);
        setSelectedPreset(data.current);
      })
      .catch(() => {});
  }, []);

  const handleSelectPreset = (key) => {
    setConfirmModal(key);
  };

  const applyPreset = async (key) => {
    setApplying(true);
    try {
      const r = await fetch(`${API}/api/settings/preset/${key}`, { method: 'POST' });
      const data = await r.json();
      if (data.preset) {
        setCurrentPreset(key);
        setSelectedPreset(key);
        // Reload settings
        const sr = await fetch(`${API}/api/settings/`);
        const sd = await sr.json();
        setSettings(sd);
        setConfirmModal(null);
      }
    } catch (e) {
      console.error(e);
    }
    setApplying(false);
  };

  const presetColors = {
    conservative: '#22c55e',
    moderate: '#3b82f6',
    aggressive: '#f97316',
    super_aggressive: '#ef4444',
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>⚙️ Settings</h2>

      {/* HEADER — Attuale profilo */}
      {currentPreset && presets[currentPreset] && (
        <div style={{
          background: `linear-gradient(135deg, ${presetColors[currentPreset]}22 0%, #0f172a 100%)`,
          border: `2px solid ${presetColors[currentPreset]}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 48 }}>{presets[currentPreset].emoji}</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>PROFILO ATTIVO</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: presetColors[currentPreset] }}>
                {presets[currentPreset].name}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                {presets[currentPreset].description}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>RETURN ATTESO</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>
                {presets[currentPreset].expected_return}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                Max drawdown: {presets[currentPreset].max_drawdown}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRESET CARDS */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, color: '#94a3b8' }}>
          🎯 Scegli il tuo profilo di rischio
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}>
          {Object.entries(presets).map(([key, preset]) => {
            const isActive = currentPreset === key;
            const color = presetColors[key];
            return (
              <div
                key={key}
                onClick={() => handleSelectPreset(key)}
                style={{
                  background: isActive ? `${color}15` : '#0f172a',
                  border: `2px solid ${isActive ? color : '#1e293b'}`,
                  borderRadius: 12,
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isActive ? color : '#1e293b';
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: color,
                    color: 'white',
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700,
                  }}>
                    ATTIVO
                  </div>
                )}
                <div style={{ fontSize: 40, marginBottom: 8 }}>{preset.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color, marginBottom: 4 }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                  {preset.description}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Max Positions:</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>
                      {preset.settings.max_positions}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Position Size:</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>
                      {preset.settings.position_size_pct}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Min R/R:</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>
                      {preset.settings.min_risk_reward}:1
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Kelly:</span>
                    <span style={{ color: preset.settings.kelly_enabled ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                      {preset.settings.kelly_enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: 12,
                  padding: '8px 10px',
                  background: `${color}15`,
                  borderRadius: 6,
                  fontSize: 11,
                }}>
                  <div style={{ color: '#94a3b8', marginBottom: 2 }}>Return atteso:</div>
                  <div style={{ color: '#22c55e', fontWeight: 700 }}>
                    {preset.expected_return}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL Confirm */}
      {confirmModal && presets[confirmModal] && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }} onClick={() => setConfirmModal(null)}>
          <div style={{
            background: '#0f172a',
            border: `2px solid ${presetColors[confirmModal]}`,
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: '100%',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 40 }}>{presets[confirmModal].emoji}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: presetColors[confirmModal] }}>
                  Attivare {presets[confirmModal].name}?
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {presets[confirmModal].description}
                </div>
              </div>
            </div>

            <div style={{
              background: '#1e293b',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              fontSize: 12,
              color: '#cbd5e1',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: 'white' }}>Cambiera:</strong><br />
              • Max positions: <strong>{presets[confirmModal].settings.max_positions}</strong><br />
              • Position size: <strong>{presets[confirmModal].settings.position_size_pct}%</strong><br />
              • Min R/R: <strong>{presets[confirmModal].settings.min_risk_reward}</strong><br />
              • Risk per trade: <strong>{presets[confirmModal].settings.risk_pct_per_trade}%</strong><br />
              • Kelly: <strong>{presets[confirmModal].settings.kelly_enabled ? 'ON' : 'OFF'}</strong><br />
              • + altre 15 impostazioni APM/DPS
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#334155',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Annulla
              </button>
              <button
                onClick={() => applyPreset(confirmModal)}
                disabled={applying}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: presetColors[confirmModal],
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: applying ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: applying ? 0.6 : 1,
                }}
              >
                {applying ? 'Applicando...' : `Attiva ${presets[confirmModal].name}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AVANZATO — Accordion */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 20,
      }}>
        <div
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: 16,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#1e293b',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>🔧 Impostazioni Avanzate</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Per power user — modifica manualmente ogni parametro
            </div>
          </div>
          <span style={{ fontSize: 20, color: '#94a3b8' }}>
            {showAdvanced ? '▼' : '▶'}
          </span>
        </div>

        {showAdvanced && (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {Object.entries(settings || {}).map(([key, value]) => {
                if (key === '_id' || key === 'starting_capital' || key === 'active_preset') return null;
                return (
                  <div key={key} style={{ background: '#1e293b', padding: 10, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                      {key}
                    </div>
                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value}
                      step={typeof value === 'number' && value < 1 ? 0.01 : 1}
                      onChange={(e) => {
                        const val = typeof value === 'number' ? parseFloat(e.target.value) : e.target.value;
                        setSettings({ ...settings, val });
                      }}
                      style={{
                        width: '100%',
                        padding: 6,
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 4,
                        color: 'white',
                        fontSize: 12,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={saveSettings}
              disabled={settingsSaving}
              style={{
                marginTop: 16,
                padding: '10px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {settingsSaving ? 'Salvando...' : '💾 Salva Impostazioni Avanzate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
