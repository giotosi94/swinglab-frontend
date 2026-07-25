import React, { useState, useEffect } from 'react';
import './App.css';
import { useToast } from './components/Toast';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Sectors from './components/Sectors';
import Stocks from './components/Stocks';
import Agents from './components/Agents';
import Alpaca from './components/Alpaca';
import Settings from './components/Settings';
import Guide from './components/Guide';
import Trades from './components/Trades';
import SystemHealth from './components/SystemHealth';
import * as api from './utils/api';

function App() {
  const toast = useToast();

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
  const [mlPredictions, setMlPredictions] = useState({});
  const [trendPredictions, setTrendPredictions] = useState({});
  const [stockLoading, setStockLoading] = useState(false);

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

  // ===== FETCH FUNCTIONS (21A: tutte via api.js) =====
  const refreshMarket = async () => {
    const d = await api.fetchMarket();
    if (d && typeof d === 'object') setMarketData(d);
  };

  const refreshEquityHistory = async () => {
    const d = await api.fetchEquityHistory();
    if (d && typeof d === 'object') setEquityPeriods(d);
  };

  const refreshLivePrices = async () => {
    const d = await api.fetchLivePrices();
    if (d && typeof d === 'object' && !d.detail) setLivePrices(d);
  };

  const refreshAlpaca = async () => {
    const d = await api.fetchAlpaca();
    if (d && !d.error) setAlpacaData(d);
  };

  const refreshTrader = async () => {
    const d = await api.fetchTrader();
    if (d && !d.error) setTraderData(d);
  };

  const refreshData = async () => {
    setLoading(true);
    const result = await api.fetchSectorsAndAssets(250);
    if (result) {
      setSectors(result.sectors);
      setAssets(result.assets);
    }
    setLoading(false);
  };

  const refreshMlPredictions = async () => {
    const d = await api.fetchMlPredictions();
    if (d && d.top_20) {
      const map = {};
      d.top_20.forEach((p) => { map[p.ticker] = p; });
      setMlPredictions(map);
    }
  };

  const refreshTrendPredictions = async () => {
    const d = await api.fetchTrendPredictions();
    if (d && d.predictions) {
      const map = {};
      d.predictions.forEach((p) => { map[p.ticker] = p; });
      setTrendPredictions(map);
    }
  };

  const refreshAgentsStatus = async () => {
    setAgentsLoading(true);
    const d = await api.fetchAgentsStatus();
    if (d && !d.error) setAgentsStatus(d);
    setAgentsLoading(false);
  };

  const refreshSettings = async () => {
    const d = await api.fetchSettings();
    if (d && !d.error && d.max_positions) setSettings((p) => ({ ...p, ...d }));
  };

  // ===== ACTIONS =====
  const handleBuy = async (symbol, qty) => {
    const d = await api.alpacaBuy(symbol, qty);
    if (d && !d.error) {
      toast.success(`BUY ${symbol} x${qty} inviato`);
      await refreshAlpaca();
    } else {
      toast.error(`Buy ${symbol} fallito`);
    }
  };

  const handleClose = async (symbol) => {
    const d = await api.alpacaClose(symbol);
    if (d) {
      toast.success(`Posizione ${symbol} chiusa`);
      await refreshAlpaca();
    } else {
      toast.error(`Close ${symbol} fallito`);
    }
  };

  const handleCloseAll = async () => {
    if (!window.confirm('Close ALL positions?')) return;
    await api.alpacaCloseAll();
    toast.info('Chiusura tutte le posizioni...');
    await refreshAlpaca();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const d = await api.searchStock(searchQuery);
    if (d && !d.error) {
      setSelectedStock(d);
      setView('stocks');
    } else {
      toast.error(d?.error || 'Ricerca fallita');
    }
    setSearching(false);
    setSearchQuery('');
  };

  // 21D: Loading state per stock detail
  const loadFullStock = async (ticker) => {
    setStockLoading(true);
    const d = await api.searchStock(ticker);
    if (d && !d.error) {
      setSelectedStock(d);
    } else {
      toast.error(`Errore caricamento ${ticker}`);
    }
    setStockLoading(false);
  };

  const handleRunPipeline = async () => {
    setPipelineRunning(true);
    const d = await api.runPipeline();
    if (d && !d.error) {
      toast.success('Pipeline completata');
      await refreshAgentsStatus();
      await refreshTrader();
      await refreshAlpaca();
    } else {
      toast.error('Pipeline fallita');
    }
    setPipelineRunning(false);
  };

  const handleRunLearning = async () => {
    setLearningRunning(true);
    const d = await api.runLearning();
    if (d && !d.error) {
      toast.success('Learning completato');
      await refreshAgentsStatus();
    } else {
      toast.error('Learning fallito');
    }
    setLearningRunning(false);
  };

  const handleFetchAgentDecisions = async (name) => {
    const d = await api.fetchAgentDecisions(name, 20);
    if (d && d.decisions) setAgentDecisions(d.decisions);
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    const d = await api.saveSettings(settings);
    if (d && !d.error) {
      toast.success('Settings salvate e propagate a tutti gli agenti');
    } else {
      toast.error('Salvataggio settings fallito');
    }
    setSettingsSaving(false);
  };

  // ===== EFFECTS =====
  useEffect(() => {
    refreshData();
    refreshTrader();
    refreshAlpaca();
    refreshLivePrices();
    refreshEquityHistory();
    refreshMarket();
    refreshSettings();
    refreshAgentsStatus();
    refreshMlPredictions();
    refreshTrendPredictions();

    const p = setInterval(refreshLivePrices, 15000);
    const a = setInterval(refreshAlpaca, 60000);
    const d = setInterval(refreshData, 300000);
    return () => {
      clearInterval(p);
      clearInterval(a);
      clearInterval(d);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (view === 'agents') refreshAgentsStatus();
    // eslint-disable-next-line
  }, [view]);

  // ===== RENDER HELPERS =====
  const handleDashboardStockSelect = (stock) => {
    setSelectedStock(stock);
    setView('stocks');
  };

  // ===== MAIN RENDER =====
  return (
    <div style={{
      background: '#0a0e17', minHeight: '100vh', color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>
      <Navbar
        view={view} setView={setView}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        handleSearch={handleSearch} searching={searching}
        traderData={traderData}
        setSelectedStock={setSelectedStock}
        setSelectedSector={setSelectedSector}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 20 }}>
        {/* 21D: Stock loading overlay */}
        {stockLoading && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10,14,23,0.7)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: '#1e293b', borderRadius: 12, padding: '24px 40px',
              border: '1px solid #334155', textAlign: 'center',
            }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 12px' }} />
              <div style={{ color: '#94a3b8', fontSize: 14 }}>Caricamento stock...</div>
            </div>
          </div>
        )}

        {loading && !['agents', 'settings', 'guide', 'health'].includes(view) ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: 150, height: 14, margin: '0 auto' }} />
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard
            marketData={marketData} assets={assets} livePrices={livePrices}
            setSelectedStock={handleDashboardStockSelect}
            alpacaData={alpacaData} sectors={sectors}
            agentsStatus={agentsStatus}
            onGoToAlpaca={() => setView('alpaca')}
            onGoToAgents={() => setView('agents')}
            onGoToSector={(code) => { setSelectedSector(code); setView('stocks'); }}
            onLoadFullStock={(ticker) => { loadFullStock(ticker); setView('stocks'); }}
            mlPredictions={mlPredictions} trendPredictions={trendPredictions}
          />
        ) : view === 'sectors' ? (
          <Sectors
            sectors={sectors} setSelectedSector={setSelectedSector} setView={setView}
          />
        ) : view === 'stocks' ? (
          <Stocks
            assets={assets}
            selectedSector={selectedSector} setSelectedSector={setSelectedSector}
            selectedStock={selectedStock} setSelectedStock={setSelectedStock}
            livePrices={livePrices} onBuy={handleBuy}
            onLoadFullStock={loadFullStock}
            mlPredictions={mlPredictions} trendPredictions={trendPredictions}
          />
        ) : view === 'agents' ? (
          <Agents
            agentsStatus={agentsStatus} agentsLoading={agentsLoading}
            selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent}
            agentDecisions={agentDecisions}
            fetchAgentDecisions={handleFetchAgentDecisions}
            runPipeline={handleRunPipeline} runLearning={handleRunLearning}
            pipelineRunning={pipelineRunning} learningRunning={learningRunning}
            fetchAgentsStatus={refreshAgentsStatus}
          />
        ) : view === 'alpaca' ? (
          <Alpaca
            alpacaData={alpacaData} equityPeriods={equityPeriods}
            selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
            alpacaBuy={handleBuy} alpacaClose={handleClose}
            alpacaCloseAll={handleCloseAll}
            assets={assets} settings={settings}
          />
        ) : view === 'trades' ? (
          <Trades />
        ) : view === 'settings' ? (
          <Settings
            settings={settings} setSettings={setSettings}
            saveSettings={handleSaveSettings} settingsSaving={settingsSaving}
            alpacaData={alpacaData}
          />
        ) : view === 'health' ? (
          <SystemHealth />
        ) : view === 'guide' ? (
          <Guide />
        ) : null}
      </div>
    </div>
  );
}

export default App;
