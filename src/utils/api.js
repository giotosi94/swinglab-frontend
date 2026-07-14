const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

// ---------- Helpers ----------
async function get(path) {
  try {
    const res = await fetch(`${API}${path}`);
    return await res.json();
  } catch {
    return null;
  }
}

async function post(path, body = null) {
  try {
    const opts = { method: 'POST' };
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${API}${path}`, opts);
    return await res.json();
  } catch {
    return null;
  }
}

// ---------- Market & Data ----------
export const fetchMarket = () => get('/api/data/market');
export const fetchEquityHistory = () => get('/api/data/alpaca/history');
export const fetchLivePrices = () => get('/api/data/live');
export const fetchAlpaca = () => get('/api/data/alpaca');
export const fetchTrader = () => get('/api/data/autotrader');
export const fetchBenchmark = (period) => get(`/api/data/benchmark/spy?period=${period}`);
export const fetchNews = (ticker) => get(`/api/data/news/${ticker}`);
// 🆕 v2.2 — Starting capital from Alpaca portfolio history (single source of truth)
export const fetchStartingCapital = () => get('/api/data/starting-capital');
// 🆕 v3.4 — Positions with SL/TP details from DB (per fractional shares)
export const fetchPositionsDetail = () => get('/api/debug/positions-detail');

// ---------- Alpaca Actions ----------
export const alpacaBuy = (symbol, qty) => post(`/api/data/alpaca/buy?symbol=${symbol}&qty=${qty}`);
export const alpacaClose = (symbol) => post(`/api/data/alpaca/close/${symbol}`);
export const alpacaCloseAll = () => post('/api/data/alpaca/close-all');

// ---------- AutoTrader ----------
export const runTrader = () => post('/api/data/autotrader/run');

// ---------- Search ----------
export const searchStock = (query) => get(`/api/data/search/${query.trim().toUpperCase()}`);
// 🆕 v4.2 — Lista completa ticker per autocomplete
export const fetchAllTickers = () => get('/api/data/tickers/list');

// ---------- Sectors & Assets ----------
export async function fetchSectorsAndAssets(limit = 250) {
  try {
    const [sRes, aRes] = await Promise.all([
      fetch(`${API}/api/sectors`),
      fetch(`${API}/api/assets?limit=${limit}`),
    ]);
    return {
      sectors: await sRes.json(),
      assets: await aRes.json(),
    };
  } catch {
    return null;
  }
}

// ---------- Analytics ----------
export const fetchAnalytics = () => get('/api/trades/analytics');

// ---------- Agents ----------
export const fetchAgentsStatus = () => get('/api/agents/status');
export const fetchAgentDecisions = (name, limit = 20) => get(`/api/agents/${name}/decisions?limit=${limit}`);
export const runPipeline = () => post('/api/agents/run');
export const runLearning = () => post('/api/agents/learn');
// 🆕 v4.0 — APM (Adaptive Position Manager)
export const fetchApmHistory = (limit = 30) => get(`/api/agents/apm-history?limit=${limit}`);
export const fetchApmStatus = () => get('/api/agents/apm/status');
export const fetchApmSummary = (days = 7) => get(`/api/agents/apm/summary?days=${days}`);

// ---------- Settings ----------
export const fetchSettings = () => get('/api/settings');
export const saveSettings = (settings) => post('/api/settings', settings);

// ---------- ML ----------
export const fetchMlPredictions = () => get('/api/ml/predict/all');
export const fetchTrendPredictions = () => get('/api/ml/trend/all');

// ---------- Trades ----------
export const fetchTradeHistory = (limit = 200) => get(`/api/trades/history?limit=${limit}`);
export const fetchDailySummary = () => get('/api/trades/daily');
