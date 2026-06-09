import { API } from './constants';

// ---------- helpers ----------
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
export const fetchMarket         = () => get('/api/data/market');
export const fetchEquityHistory  = () => get('/api/data/alpaca/history');
export const fetchLivePrices     = () => get('/api/data/live');
export const fetchAlpaca         = () => get('/api/data/alpaca');
export const fetchTrader         = () => get('/api/data/autotrader');

// ---------- Alpaca actions ----------
export const alpacaBuy   = (symbol, qty) => post(`/api/data/alpaca/buy?symbol=${symbol}&qty=${qty}`);
export const alpacaClose = (symbol)      => post(`/api/data/alpaca/close/${symbol}`);
export const alpacaCloseAll = ()         => post('/api/data/alpaca/close-all');

// ---------- AutoTrader ----------
export const runTrader = () => post('/api/data/autotrader/run');

// ---------- Search ----------
export const searchStock = (query) =>
  get(`/api/data/search/${query.trim().toUpperCase()}`);

// ---------- Sectors & Assets ----------
export async function fetchSectorsAndAssets(limit = 250) {
  try {
    const [sRes, aRes] = await Promise.all([
      fetch(`${API}/api/sectors`),
      fetch(`${API}/api/assets?limit=${limit}`),
    ]);
    const sectors = await sRes.json();
    const assets  = await aRes.json();
    return { sectors, assets };
  } catch {
    return null;
  }
}

// ---------- Agents ----------
export const fetchAgentsStatus    = ()              => get('/api/agents/status');
export const fetchAgentDecisions  = (name, limit = 20) =>
  get(`/api/agents/${name}/decisions?limit=${limit}`);
export const runPipeline  = () => post('/api/agents/run');
export const runLearning  = () => post('/api/agents/learn');

// ---------- Settings ----------
export const fetchSettings = () => get('/api/settings');
export const saveSettings  = (settings) =>
  post('/api/settings', settings);
