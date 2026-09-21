const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

async function get(path) {
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) return null;
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
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const fetchMarket = () => get('/api/data/market');
export const fetchEquityHistory = () => get('/api/data/alpaca/history');
export const fetchLivePrices = () => get('/api/data/live');
export const fetchAlpaca = () => get('/api/data/alpaca');
export const fetchTrader = () => get('/api/data/autotrader');
export const fetchBenchmark = (period) => get(`/api/data/benchmark/spy?period=${period}`);
export const fetchNews = (ticker) => get(`/api/data/news/${ticker}`);
export const fetchStartingCapital = () => get('/api/data/starting-capital');
export const fetchPositionsDetail = () => get('/api/debug/positions-detail');
export const runTrader = () => post('/api/data/autotrader/run');
export const searchStock = (query) => get(`/api/data/search/${query.trim().toUpperCase()}`);
export const fetchAllTickers = () => get('/api/data/tickers/list');

export const fetchAssetsOverview = (limit = 305) =>
  get(`/api/assets/overview?limit=${limit}`);

export async function fetchSectorsAndAssets(limit = 250) {
  try {
    const [sRes, aRes] = await Promise.all([
      fetch(`${API}/api/sectors`),
      fetch(`${API}/api/assets?limit=${limit}`),
    ]);
    return { sectors: await sRes.json(), assets: await aRes.json() };
  } catch {
    return null;
  }
}

export const fetchAnalytics = () => get('/api/trades/analytics');
export const fetchAgentsStatus = () => get('/api/agents/status');
export const fetchAgentDecisions = (name, limit = 20) => get(`/api/agents/${name}/decisions?limit=${limit}`);
export const fetchApmHistory = (limit = 30) => get(`/api/agents/apm-history?limit=${limit}`);
export const fetchApmStatus = () => get('/api/agents/apm/status');
export const fetchApmSummary = (days = 7) => get(`/api/agents/apm/summary?days=${days}`);
export const fetchMaxStrategyShadow = () => get('/api/data/max-strategy-shadow');
export const fetchMaxStrategyRiskShadow = () => get('/api/data/max-strategy-risk-shadow');
export const fetchMaxStrategyValidation = (limit = 100) => get(`/api/data/max-strategy-validation?limit=${limit}`);
export const fetchSettings = () => get('/api/settings');
export const saveSettings = (settings) => post('/api/settings', settings);
export const fetchMlPredictions = () => get('/api/ml/predict/all');
export const fetchTrendPredictions = () => get('/api/ml/trend/all');
export const fetchTradeHistory = (limit = 200) => get(`/api/trades/history?limit=${limit}`);
export const fetchDailySummary = () => get('/api/trades/daily');
