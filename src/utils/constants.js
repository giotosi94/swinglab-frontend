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

export const DEFAULT_SETTINGS = {
  max_positions: 5,
  risk_pct_per_trade: 2,
  max_position_pct: 20,
  min_risk_reward: 1.5,
  max_per_sector: 2,
  daily_loss_limit_pct: -3,
  weekly_loss_limit_pct: -5,
  starting_capital: 100000,
};
