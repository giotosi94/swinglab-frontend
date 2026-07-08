export const API =
  process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

export const AGENT_INFO = {
  macro_analyst: {
    emoji: '🌍',
    name: 'Macro Analyst',
    desc: 'Economia, indici, settori, regime di mercato',
    color: '#3b82f6',
  },
  alpha_strategist: {
    emoji: '🎯',
    name: 'Alpha Strategist',
    desc: 'Stock picking, confluence, segnali buy/sell',
    color: '#22c55e',
  },
  risk_manager: {
    emoji: '🛡',
    name: 'Risk Manager',
    desc: 'Position sizing, limiti rischio, protezione drawdown',
    color: '#eab308',
  },
  // 🆕 v4.0 — Adaptive Position Manager
  adaptive_position_manager: {
    emoji: '🎯',
    name: 'APM',
    desc: 'Gestione adattiva posizioni: HOLD/EXIT/SCALE/TIGHTEN',
    color: '#8b5cf6',
  },
  executor: {
    emoji: '⚡',
    name: 'Executor',
    desc: 'Esecuzione ordini, Telegram, cancellazione stale',
    color: '#f97316',
  },
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'sectors',   label: '🏛 Sectors' },
  { id: 'stocks',    label: '📈 Stocks' },
  { id: 'agents',    label: '🤖 Agents' },
  { id: 'alpaca',    label: '💰 Alpaca' },
  { id: 'trades',    label: '📋 Trades' },
  { id: 'settings',  label: '⚙️ Settings' },
  { id: 'guide',     label: '📖 Guide' },
];

// 🔧 v2.2 — Default settings aggiornati con APM
export const DEFAULT_SETTINGS = {
  // Risk Management
  max_positions: 8,
  risk_pct_per_trade: 2,
  max_position_pct: 20,
  min_risk_reward: 1.5,
  max_per_sector: 2,
  daily_loss_limit_pct: -3,
  weekly_loss_limit_pct: -5,
  // Fractional / Notional
  position_sizing_mode: 'notional',
  position_size_pct: 12,
  fractionable_only: true,
  min_notional_per_trade: 100,
  // 🆕 APM (Adaptive Position Manager)
  apm_enabled: true,
  apm_exit_confluence_threshold: 30,
  apm_exit_ml_threshold: 40,
  apm_exit_min_negative_factors: 2,
  apm_scaling_enabled: true,
  apm_target_1_pct: 5,
  apm_target_1_size: 50,
  apm_target_2_pct: 10,
  apm_target_2_size: 30,
  apm_target_3_pct: 20,
  apm_target_3_size: 20,
  apm_tighten_profit_threshold: 3,
  apm_tighten_new_sl_distance: 2,
  apm_check_interval_hours: 3,
  apm_urgent_check_drop_pct: 5,
};
