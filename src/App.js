import React, { useState, useEffect } from 'react';
import './App.css';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Sectors from './components/Sectors';
import Stocks from './components/Stocks';
import Agents from './components/Agents';
import Alpaca from './components/Alpaca';
import Settings from './components/Settings';
import Guide from './components/Guide';

const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

function App() {
  // ===== STATE =====
  const [sectors, setSectors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [view, setView] = useState('dashboard');
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [traderData, setTraderData] = useState(null);
  const [traderLoading, setTraderLoading] = useState(false);
  const [alpacaData, setAlpacaData] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [equityPeriods, setEquityPeriods] = useState({});
  const [marketData, setMarketData] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  // Agents
  const [agentsStatus, setAgentsStatus] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDecisions, setAgentDecisions] = useState([]);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [learningRunning, setLearningRunning] = useState(false);
  // Settings
  const [settings, setSettings] = useState({
    max_positions: 5,
    risk_pct_per_trade: 2,
    max_position_pct: 20,
    min_risk_reward: 1.5,
    max_per_sector: 2,
    daily_loss_limit_pct: -3,
    weekly_loss_limit_pct: -5,
    starting_capital: 100000,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // ===== FETCH FUNCTIONS =====
  const fetchMarket = async () => {
    try {
      const r = await fetch(`${API}/api/data/market`);
      const d = await r.json();
      if (d && typeof d === 'object') setMarketData(d);
    } catch (e) {}
  };

  const fetchEquityHistory = async () => {
    try {
      const r = await fetch(`${API}/api/data/alpaca/history`);
      const d = await r.json();
      if (d && typeof d === 'object') setEquityPeriods(d);
    } catch (e) {}
  };

  const fetchLivePrices = async () => {
    try {
      const r = await fetch(`${API}/api/data/live`);
      const d = await r.json();
      if (d && typeof d === 'object' && !d.detail) setLivePrices(d);
    } catch (e) {}
  };

  const fetchAlpaca = async () => {
    try {
      const r = await fetch(`${API}/api/data/alpaca`);
      const d = await r.json();
      if (!d.error) setAlpacaData(d);
    } catch (e) {}
  };

  const alpacaBuy = async (s, q) => {
    try {
      await fetch(`${API}/api/data/alpaca/buy?symbol=${s}&qty=${q}`, {
        method: 'POST',
      });
      await fetchAlpaca();
    } catch (e) {
      alert('Buy failed');
    }
  };

  const alpacaClose = async (s) => {
    try {
      await fetch(`${API}/api/data/alpaca/close/${s}`, { method: 'POST' });
      await fetchAlpaca();
    } catch (e) {
      alert('Close failed');
    }
  };

  const alpacaCloseAll = async () => {
    if (!window.confirm('Close ALL positions?')) return;
    try {
      await fetch(`${API}/api/data/alpaca/close-all`, { method: 'POST' });
      await fetchAlpaca();
    } catch (e) {}
  };

  const fetchTrader = async () => {
    try {
      const r = await fetch(`${API}/api/data/autotrader`);
      const d = await r.json();
      if (!d.error) setTraderData(d);
    } catch (e) {}
  };

  const runTrader = async () => {
    setTraderLoading(true);
    try {
      await fetch(`${API}/api/data/autotrader/run`, { method: 'POST' });
      await fetchTrader();
      await fetchAlpaca();
    } catch (e) {}
    setTraderLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const r = await fetch(
        `${API}/api/data/search/${searchQuery.trim().toUpperCase()}`
      );
      const d = await r.json();
      if (d.error) alert(d.error);
      else {
        setSelectedStock(d);
        setView('stocks');
      }
    } catch (e) {
      alert('Search failed');
    }
    setSearching(false);
    setSearchQuery('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        fetch(`${API}/api/sectors`),
        fetch(`${API}/api/assets?limit=250`),
      ]);
      setSectors(await s.json());
      setAssets(await a.json());
    } catch (e) {}
    setLoading(false);
  };

  // Agents
  const fetchAgentsStatus = async () => {
    setAgentsLoading(true);
    try {
      const r = await fetch(`${API}/api/agents/status`);
      const d = await r.json();
      if (d && !d.error) setAgentsStatus(d);
    } catch (e) {}
    setAgentsLoading(false);
  };

  const fetchAgentDecisions = async (n) => {
    try {
      const r = await fetch(`${API}/api/agents/${n}/decisions?limit=20`);
      const d = await r.json();
      if (d.decisions) setAgentDecisions(d.decisions);
    } catch (e) {}
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    try {
      await fetch(`${API}/api/agents/run`, { method: 'POST' });
      await fetchAgentsStatus();
      await fetchTrader();
      await fetchAlpaca();
    } catch (e) {
      alert('Pipeline failed');
    }
    setPipelineRunning(false);
  };

  const runLearning = async () => {
    setLearningRunning(true);
    try {
      await fetch(`${API}/api/agents/learn`, { method: 'POST' });
      await fetchAgentsStatus();
    } catch (e) {
      alert('Learning failed');
    }
    setLearningRunning(false);
  };

  // Settings
  const fetchSettings = async () => {
    try {
      const r = await fetch(`${API}/api/settings`);
      const d = await r.json();
      if (d && !d.error && d.max_positions)
        setSettings((p) => ({ ...p, ...d }));
    } catch (e) {}
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await fetch(`${API}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved!');
    } catch (e) {
      alert('Save failed');
    }
    setSettingsSaving(false);
  };

  // ===== EFFECTS =====
  useEffect(() => {
    fetchData();
    fetchTrader();
    fetchAlpaca();
    fetchLivePrices();
    fetchEquityHistory();
    fetchMarket();
    fetchSettings();
    const p = setInterval(fetchLivePrices, 15000);
    const a = setInterval(fetchAlpaca, 60000);
    const d = setInterval(fetchData, 300000);
    return () => {
      clearInterval(p);
      clearInterval(a);
      clearInterval(d);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (view === 'agents') fetchAgentsStatus();
    // eslint-disable-next-line
  }, [view]);

  // ===== RENDER HELPERS =====
  const handleDashboardStockSelect = (stock) => {
    setSelectedStock(stock);
    setView('stocks');
  };

  // ===== MAIN RENDER =====
  return (
    <div
      style={{
        background: '#0a0e17',
        minHeight: '100vh',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <Navbar
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searching={searching}
        traderData={traderData}
        setSelectedStock={setSelectedStock}
        setSelectedSector={setSelectedSector}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 20 }}>
        {loading && !['agents', 'settings', 'guide'].includes(view) ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            Loading...
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard
            marketData={marketData}
            assets={assets}
            livePrices={livePrices}
            setSelectedStock={handleDashboardStockSelect}
          />
        ) : view === 'sectors' ? (
          <Sectors
            sectors={sectors}
            setSelectedSector={setSelectedSector}
            setView={setView}
          />
        ) : view === 'stocks' ? (
          <Stocks
            assets={assets}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            livePrices={livePrices}
          />
        ) : view === 'agents' ? (
          <Agents
            agentsStatus={agentsStatus}
            agentsLoading={agentsLoading}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            agentDecisions={agentDecisions}
            fetchAgentDecisions={fetchAgentDecisions}
            runPipeline={runPipeline}
            runLearning={runLearning}
            pipelineRunning={pipelineRunning}
            learningRunning={learningRunning}
            fetchAgentsStatus={fetchAgentsStatus}
          />
        ) : view === 'alpaca' ? (
          <Alpaca
            alpacaData={alpacaData}
            equityPeriods={equityPeriods}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            alpacaBuy={alpacaBuy}
            alpacaClose={alpacaClose}
            alpacaCloseAll={alpacaCloseAll}
            assets={assets}
            settings={settings}
          />
        ) : view === 'settings' ? (
          <Settings
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            settingsSaving={settingsSaving}
            alpacaData={alpacaData}
          />
        ) : view === 'guide' ? (
          <Guide />
        ) : null}
      </div>
    </div>
  );
}

export default App;
