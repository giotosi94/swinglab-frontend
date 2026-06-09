import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine, ReferenceArea } from 'recharts';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

function App() {
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

  // 🆕 Agents state
  const [agentsStatus, setAgentsStatus] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDecisions, setAgentDecisions] = useState([]);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [learningRunning, setLearningRunning] = useState(false);

  const fetchMarket = async () => { try { const r = await fetch(`${API}/api/data/market`); const data = await r.json(); if (data && typeof data === 'object') setMarketData(data); } catch(e){} };
  const fetchEquityHistory = async () => { try { const r = await fetch(`${API}/api/data/alpaca/history`); const data = await r.json(); if (data && typeof data === 'object') setEquityPeriods(data); } catch(e){} };

  const [capital, setCapital] = useState(() => parseFloat(localStorage.getItem('sl_capital')) || 10000);
  const [riskPct, setRiskPct] = useState(() => parseFloat(localStorage.getItem('sl_riskPct')) || 2);
  const [openTrades, setOpenTrades] = useState(() => JSON.parse(localStorage.getItem('sl_trades') || '[]'));

  const saveCapital = (val) => { setCapital(val); localStorage.setItem('sl_capital', val); };
  const saveRiskPct = (val) => { setRiskPct(val); localStorage.setItem('sl_riskPct', val); };
  const saveTrades = (trades) => { setOpenTrades(trades); localStorage.setItem('sl_trades', JSON.stringify(trades)); };
  const addTrade = (ticker, entry, stopLoss, shares) => { saveTrades([...openTrades, { id: Date.now(), ticker, entry, stopLoss, shares, totalRisk: Math.abs(entry-stopLoss)*shares, totalValue: entry*shares }]); };
  const removeTrade = (id) => { saveTrades(openTrades.filter(t => t.id !== id)); };
  const maxRiskPerTrade = capital * (riskPct / 100);
  const totalOpenRisk = openTrades.reduce((sum, t) => sum + t.totalRisk, 0);
  const riskUsedPct = capital > 0 ? ((totalOpenRisk / capital) * 100).toFixed(1) : 0;
  const calcPositionSize = (entry, stopLoss) => { const risk = Math.abs(entry - stopLoss); if (risk <= 0) return { shares:0, totalRisk:0, totalValue:0, riskPerShare:0 }; const shares = Math.floor(maxRiskPerTrade / risk); return { shares, totalRisk: Math.round(risk*shares*100)/100, totalValue: Math.round(entry*shares*100)/100, riskPerShare: Math.round(risk*100)/100 }; };

  const fetchLivePrices = async () => { try { const r = await fetch(`${API}/api/data/live`); const data = await r.json(); if (data && typeof data === 'object' && !data.detail) setLivePrices(data); } catch(e){} };
  const fetchAlpaca = async () => { try { const r = await fetch(`${API}/api/data/alpaca`); const data = await r.json(); if (!data.error) setAlpacaData(data); } catch(e){} };
  const alpacaBuy = async (symbol, qty) => { try { await fetch(`${API}/api/data/alpaca/buy?symbol=${symbol}&qty=${qty}`, {method:'POST'}); await fetchAlpaca(); } catch(e){ alert('Buy failed'); } };
  const alpacaClose = async (symbol) => { try { await fetch(`${API}/api/data/alpaca/close/${symbol}`, {method:'POST'}); await fetchAlpaca(); } catch(e){ alert('Close failed'); } };
  const alpacaCloseAll = async () => { if(!window.confirm('Close ALL positions?')) return; try { await fetch(`${API}/api/data/alpaca/close-all`, {method:'POST'}); await fetchAlpaca(); } catch(e){} };
  const fetchTrader = async () => { try { const r = await fetch(`${API}/api/data/autotrader`); const data = await r.json(); if (!data.error) setTraderData(data); } catch(e){} };
  const runTrader = async () => { setTraderLoading(true); try { await fetch(`${API}/api/data/autotrader/run`, {method:'POST'}); await fetchTrader(); await fetchAlpaca(); } catch(e){} setTraderLoading(false); };
  const handleSearch = async () => { if (!searchQuery.trim()) return; setSearching(true); try { const r = await fetch(`${API}/api/data/search/${searchQuery.trim().toUpperCase()}`); const data = await r.json(); if (data.error) alert(data.error); else setSelectedStock(data); } catch(e){ alert('Search failed'); } setSearching(false); setSearchQuery(''); };
  const fetchData = async () => { setLoading(true); try { const [s,a] = await Promise.all([fetch(`${API}/api/sectors`),fetch(`${API}/api/assets?limit=250`)]); setSectors(await s.json()); setAssets(await a.json()); } catch(e){} setLoading(false); };

  // 🆕 Agent functions
  const fetchAgentsStatus = async () => {
    setAgentsLoading(true);
    try {
      const r = await fetch(`${API}/api/agents/status`);
      const data = await r.json();
      if (data && !data.error) setAgentsStatus(data);
    } catch(e) { console.error('Agents status fetch error:', e); }
    setAgentsLoading(false);
  };
  const fetchAgentDecisions = async (agentName) => {
    try {
      const r = await fetch(`${API}/api/agents/${agentName}/decisions?limit=20`);
      const data = await r.json();
      if (data.decisions) setAgentDecisions(data.decisions);
    } catch(e) {}
  };
  const runPipeline = async () => {
    setPipelineRunning(true);
    try {
      await fetch(`${API}/api/agents/run`, {method:'POST'});
      await fetchAgentsStatus();
      await fetchTrader();
      await fetchAlpaca();
    } catch(e) { alert('Pipeline run failed'); }
    setPipelineRunning(false);
  };
  const runLearning = async () => {
    setLearningRunning(true);
    try {
      const r = await fetch(`${API}/api/agents/learn`, {method:'POST'});
      const data = await r.json();
      alert(`Learning complete!\n${Object.entries(data).map(([k,v]) => `${k}: ${v.status}`).join('\n')}`);
      await fetchAgentsStatus();
    } catch(e) { alert('Learning failed'); }
    setLearningRunning(false);
  };

  useEffect(() => {
    fetchData(); fetchTrader(); fetchAlpaca(); fetchLivePrices(); fetchEquityHistory(); fetchMarket();
    const priceIv = setInterval(fetchLivePrices, 15000);
    const portfolioIv = setInterval(fetchAlpaca, 60000);
    const dataIv = setInterval(fetchData, 300000);
    return () => { clearInterval(priceIv); clearInterval(portfolioIv); clearInterval(dataIv); };
  }, []);

  // Load agents data when switching to agents view
  useEffect(() => {
    if (view === 'agents') { fetchAgentsStatus(); }
  }, [view]);

  const getLivePrice = (ticker) => livePrices[ticker] || null;
  const topSetups = [...assets].sort((a,b) => b.setup_score-a.setup_score).slice(0,15);
  const filteredAssets = selectedSector ? assets.filter(a => a.sector_code===selectedSector) : assets;
  const getScoreColor = (s) => s>=70?'#22c55e':s>=50?'#eab308':s>=30?'#f97316':'#ef4444';
  const getSetupBadge = (type) => { const m={breakout:{bg:'#22c55e20',c:'#22c55e',l:'Breakout'},pullback_to_poc:{bg:'#3b82f620',c:'#3b82f6',l:'POC Pullback'},ema_bounce:{bg:'#8b5cf620',c:'#8b5cf6',l:'EMA Bounce'},oversold_reversal:{bg:'#06b6d420',c:'#06b6d4',l:'Reversal'},overbought_warning:{bg:'#ef444420',c:'#ef4444',l:'Overbought'},neutral:{bg:'#64748b20',c:'#94a3b8',l:'Neutral'}}; const s=m[type]||m.neutral; return <span style={{background:s.bg,color:s.c,padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:600}}>{s.l}</span>; };

  const getSmartAlert = (asset) => { let factors=[],conf=0; if(asset.poc_price&&asset.price){const d=Math.abs((asset.price-asset.poc_price)/asset.price*100);if(d<=2){conf+=2;factors.push({name:'POC',score:2,max:2,detail:d.toFixed(1)+'%',pass:true});}else factors.push({name:'POC',score:0,max:2,detail:d.toFixed(1)+'%',pass:false});} const bp=(asset.candlestick_patterns||[]).filter(p=>p.type==='bullish');if(bp.length>0){conf+=1.5;factors.push({name:'Pattern',score:1.5,max:1.5,detail:bp.map(p=>p.name).join(','),pass:true});}else factors.push({name:'Pattern',score:0,max:1.5,detail:'None',pass:false}); if(asset.rsi>=40&&asset.rsi<=60){conf+=1;factors.push({name:'RSI',score:1,max:1,detail:''+asset.rsi?.toFixed(0),pass:true});}else factors.push({name:'RSI',score:0,max:1,detail:''+asset.rsi?.toFixed(0),pass:false}); if(asset.macd?.histogram>0){conf+=1;factors.push({name:'MACD',score:1,max:1,detail:'+',pass:true});}else factors.push({name:'MACD',score:0,max:1,detail:'-',pass:false}); if(asset.price>asset.ema10&&asset.ema10>asset.ema20&&asset.ema20>asset.ema50){conf+=1.5;factors.push({name:'EMA',score:1.5,max:1.5,detail:'Up',pass:true});}else if(asset.price>asset.ema20&&asset.ema20>asset.ema50){conf+=0.75;factors.push({name:'EMA',score:0.75,max:1.5,detail:'Mid',pass:true});}else factors.push({name:'EMA',score:0,max:1.5,detail:'No',pass:false}); if(asset.relative_volume>=1.5){conf+=1;factors.push({name:'Vol',score:1,max:1,detail:asset.relative_volume?.toFixed(1)+'x',pass:true});}else factors.push({name:'Vol',score:0,max:1,detail:asset.relative_volume?.toFixed(1)+'x',pass:false}); return {confluence:Math.round(conf*10)/10,factors}; };

  // ============================================
  // 🆕 AGENTS VIEW HELPERS
  // ============================================
  const AGENT_INFO = {
    macro_analyst: { emoji: '🌍', name: 'Macro Analyst', desc: 'Economia, indici, settori, regime di mercato', color: '#3b82f6' },
    alpha_strategist: { emoji: '🎯', name: 'Alpha Strategist', desc: 'Stock picking, confluence, segnali buy/sell', color: '#22c55e' },
    risk_manager: { emoji: '🛡️', name: 'Risk Manager', desc: 'Position sizing, limiti rischio, protezione drawdown', color: '#eab308' },
    executor: { emoji: '⚡', name: 'Executor', desc: 'Esecuzione ordini, Telegram, cancellazione stale', color: '#f97316' },
  };

  const getRegimeColor = (regime) => {
    const map = { BULL:'#22c55e', NEUTRAL:'#eab308', BEAR:'#f97316', CRASH:'#ef4444' };
    return map[regime] || '#94a3b8';
  };
  const getRegimeEmoji = (regime) => {
    const map = { BULL:'🟢', NEUTRAL:'🟡', BEAR:'🟠', CRASH:'🔴' };
    return map[regime] || '⚪';
  };

  // ============================================
  // RENDER — AGENTS VIEW
  // ============================================
  const renderAgentsView = () => {
    const ps = agentsStatus?.pipeline_state;
    const agents = agentsStatus?.agents || {};
    const market = ps?.market || {};
    const pipeline = ps?.pipeline || {};
    const riskReport = ps?.risk_report || {};

    return (
      <div>
        {/* Header with actions */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h2 style={{margin:0}}>🤖 Multi-Agent AI System</h2>
          <div style={{display:'flex',gap:10}}>
            <button onClick={runPipeline} disabled={pipelineRunning}
              style={{padding:'8px 16px',background:pipelineRunning?'#334155':'#3b82f6',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>
              {pipelineRunning ? '⏳ Running...' : '▶️ Run Pipeline'}
            </button>
            <button onClick={runLearning} disabled={learningRunning}
              style={{padding:'8px 16px',background:learningRunning?'#334155':'#8b5cf6',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>
              {learningRunning ? '⏳ Learning...' : '🧬 Learn All'}
            </button>
            <button onClick={fetchAgentsStatus} disabled={agentsLoading}
              style={{padding:'8px 16px',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:8,cursor:'pointer'}}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Pipeline Status Bar */}
        {ps && (
          <div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{color:'#94a3b8',fontSize:13}}>Last Run: {ps.last_run ? new Date(ps.last_run).toLocaleString() : 'Never'}</span>
              <span style={{color:'#94a3b8',fontSize:13}}>
                {pipeline.timing?.total && `⏱️ ${pipeline.timing.total}s`}
                {pipeline.errors?.length > 0 && ` | ⚠️ ${pipeline.errors.length} errors`}
              </span>
            </div>
            {/* Agent pipeline flow */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0}}>
              {['macro_analyst','alpha_strategist','risk_manager','executor'].map((name, i) => {
                const info = AGENT_INFO[name];
                const stepStatus = pipeline.steps?.[name] || 'unknown';
                const borderColor = stepStatus === 'ok' ? info.color : stepStatus === 'error' ? '#ef4444' : '#334155';
                return (
                  <React.Fragment key={name}>
                    {i > 0 && <div style={{color:'#475569',fontSize:20,margin:'0 4px'}}>→</div>}
                    <div onClick={() => { setSelectedAgent(name); fetchAgentDecisions(name); }}
                      style={{background:'#1e293b',borderRadius:10,padding:'10px 16px',border:`2px solid ${borderColor}`,cursor:'pointer',textAlign:'center',minWidth:130,transition:'all 0.2s'}}>
                      <div style={{fontSize:20}}>{info.emoji}</div>
                      <div style={{color:'white',fontSize:12,fontWeight:600,marginTop:2}}>{info.name}</div>
                      <div style={{color:borderColor,fontSize:10,marginTop:2}}>
                        {stepStatus === 'ok' ? '✅ OK' : stepStatus === 'error' ? '❌ Error' : '⏳'}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Market Context Card */}
        {market.regime && (
          <div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
            <h3 style={{margin:'0 0 12px',fontSize:15}}>🌍 Market Context</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',gap:12}}>
              <div style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}>
                <div style={{fontSize:11,color:'#94a3b8'}}>Regime</div>
                <div style={{fontSize:18,fontWeight:700,color:getRegimeColor(market.regime),marginTop:4}}>
                  {getRegimeEmoji(market.regime)} {market.regime}
                </div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}>
                <div style={{fontSize:11,color:'#94a3b8'}}>Confidence</div>
                <div style={{fontSize:18,fontWeight:700,color:'white',marginTop:4}}>{market.confidence || 0}%</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}>
                <div style={{fontSize:11,color:'#94a3b8'}}>Exposure</div>
                <div style={{fontSize:18,fontWeight:700,color:'white',marginTop:4}}>{((market.exposure_multiplier||0)*100).toFixed(0)}%</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}>
                <div style={{fontSize:11,color:'#94a3b8'}}>Volatility</div>
                <div style={{fontSize:14,fontWeight:600,color:market.volatility==='EXTREME'?'#ef4444':market.volatility==='HIGH'?'#f97316':'#22c55e',marginTop:4}}>{market.volatility || '—'}</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}>
                <div style={{fontSize:11,color:'#94a3b8'}}>Breadth</div>
                <div style={{fontSize:14,fontWeight:600,color:'white',marginTop:4}}>{market.breadth_pct || 0}%</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}>
                <div style={{fontSize:11,color:'#94a3b8'}}>Rotation</div>
                <div style={{fontSize:14,fontWeight:600,color:market.rotation==='defensive'?'#f97316':'#22c55e',marginTop:4}}>{market.rotation || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Report */}
        {riskReport.equity && (
          <div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
            <h3 style={{margin:'0 0 12px',fontSize:15}}>🛡️ Risk Report</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))',gap:10}}>
              {[
                {label:'Equity',value:`$${riskReport.equity?.toLocaleString()}`},
                {label:'Cash',value:`$${riskReport.cash?.toLocaleString()}`},
                {label:'Exposure',value:`${riskReport.total_exposure_pct||0}%`},
                {label:'Positions',value:`${riskReport.current_positions||0}/${riskReport.max_positions||5}`},
                {label:'Risk/Trade',value:`$${riskReport.risk_per_trade?.toFixed(0)||0}`},
                {label:'Multiplier',value:`${((riskReport.final_multiplier||0)*100).toFixed(0)}%`},
              ].map(item => (
                <div key={item.label} style={{background:'#1e293b',borderRadius:8,padding:10,textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#94a3b8'}}>{item.label}</div>
                  <div style={{fontSize:14,fontWeight:600,color:'white',marginTop:2}}>{item.value}</div>
                </div>
              ))}
            </div>
            {riskReport.loss_check && riskReport.loss_check.status !== 'allowed' && (
              <div style={{marginTop:10,padding:8,background:riskReport.loss_check.status==='stopped'?'#7f1d1d':'#78350f',borderRadius:6,fontSize:12,color:'white'}}>
                ⚠️ {riskReport.loss_check.reason}
              </div>
            )}
          </div>
        )}

        {/* Agent Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:16,marginBottom:20}}>
          {Object.entries(AGENT_INFO).map(([name, info]) => {
            const agentData = agents[name] || {};
            const params = agentData.params || {};
            const recentCount = agentData.recent_decisions?.length || 0;
            const isSelected = selectedAgent === name;

            return (
              <div key={name} onClick={() => { setSelectedAgent(isSelected ? null : name); if (!isSelected) fetchAgentDecisions(name); }}
                style={{background:'#0f172a',borderRadius:12,padding:16,border:`2px solid ${isSelected?info.color:'#1e293b'}`,cursor:'pointer',transition:'all 0.2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div>
                    <span style={{fontSize:18,marginRight:6}}>{info.emoji}</span>
                    <span style={{color:'white',fontWeight:700,fontSize:14}}>{info.name}</span>
                  </div>
                  <span style={{color:'#64748b',fontSize:11}}>{recentCount} decisions</span>
                </div>
                <div style={{color:'#64748b',fontSize:11,marginBottom:10}}>{info.desc}</div>

                {/* Agent-specific key metrics */}
                {name === 'macro_analyst' && params.w_spy_trend && (
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {[{l:'SPY',v:params.w_spy_trend},{l:'Breadth',v:params.w_breadth},{l:'VIX',v:params.w_vix}].map(w =>
                      <span key={w.l} style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>{w.l}: {((w.v||0)*100).toFixed(0)}%</span>
                    )}
                  </div>
                )}
                {name === 'alpha_strategist' && (
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Min Conf: {params.min_confluence||35}</span>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Max RSI: {params.max_rsi_entry||68}</span>
                    {(params.best_setups||[]).slice(0,2).map(s =>
                      <span key={s} style={{background:'#22c55e15',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#22c55e'}}>{s}</span>
                    )}
                  </div>
                )}
                {name === 'risk_manager' && (
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Risk: {params.risk_pct_per_trade||2}%</span>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>R/R≥{params.min_risk_reward||1.5}</span>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Max: {params.max_positions||5} pos</span>
                  </div>
                )}
                {name === 'executor' && (
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Buffer: {params.limit_price_buffer_pct||0.5}%</span>
                    <span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:params.send_telegram?'#22c55e':'#ef4444'}}>{params.send_telegram!==false?'📱 TG On':'📱 TG Off'}</span>
                  </div>
                )}

                {/* Performance sparkline */}
                {agentData.performance?.length > 0 && (
                  <div style={{marginTop:8}}>
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={agentData.performance.slice().reverse()}>
                        <Area type="monotone" dataKey={name==='risk_manager'?'metrics.profit_factor':name==='executor'?'metrics.fill_rate':'metrics.accuracy'}
                          stroke={info.color} fill={info.color} fillOpacity={0.15} strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Agent — Decision Log */}
        {selectedAgent && (
          <div style={{background:'#0f172a',borderRadius:12,padding:16,border:`1px solid ${AGENT_INFO[selectedAgent]?.color || '#334155'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h3 style={{margin:0,fontSize:15}}>
                {AGENT_INFO[selectedAgent]?.emoji} {AGENT_INFO[selectedAgent]?.name} — Recent Decisions
              </h3>
              <button onClick={() => setSelectedAgent(null)} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            {agentDecisions.length === 0 ? (
              <div style={{color:'#64748b',textAlign:'center',padding:20}}>No decisions yet</div>
            ) : (
              <div style={{maxHeight:400,overflow:'auto'}}>
                {agentDecisions.map((d, i) => (
                  <div key={d._id || i} style={{background:'#1e293b',borderRadius:8,padding:10,marginBottom:8,fontSize:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{color:AGENT_INFO[selectedAgent]?.color,fontWeight:600}}>{d.type}</span>
                      <span style={{color:'#64748b'}}>{d.created_at ? new Date(d.created_at).toLocaleString() : ''}</span>
                    </div>
                    <div style={{color:'#94a3b8',marginBottom:4}}>{d.reasoning}</div>
                    <div style={{display:'flex',gap:8}}>
                      <span style={{color:'#64748b'}}>Confidence: {d.confidence?.toFixed(0)||0}%</span>
                      {d.outcome !== null && d.outcome !== undefined && (
                        <span style={{color:d.outcome?.correct ? '#22c55e' : '#ef4444'}}>
                          {d.outcome?.correct ? '✅ Correct' : '❌ Wrong'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Last Actions */}
        {ps?.actions?.length > 0 && (
          <div style={{background:'#0f172a',borderRadius:12,padding:16,marginTop:20,border:'1px solid #1e293b'}}>
            <h3 style={{margin:'0 0 12px',fontSize:15}}>📋 Last Pipeline Actions</h3>
            {ps.actions.map((a, i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1e293b',borderRadius:6,padding:8,marginBottom:6,fontSize:12}}>
                <span style={{color:a.action==='BUY'?'#22c55e':'#ef4444',fontWeight:700}}>{a.action} {a.ticker}</span>
                <span style={{color:'#94a3b8'}}>
                  {a.shares && `${a.shares} shares`} {a.reason||''} {a.pnl_pct ? `(${a.pnl_pct>0?'+':''}${a.pnl_pct}%)` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  const navItems = [
    {id:'dashboard',label:'📊 Dashboard'}, {id:'sectors',label:'🏛️ Sectors'}, {id:'stocks',label:'📈 Stocks'},
    {id:'agents',label:'🤖 Agents'}, {id:'alpaca',label:'💰 Alpaca'},
  ];

  return (
    <div style={{background:'#0a0e17',minHeight:'100vh',color:'white',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      {/* NAV */}
      <div style={{background:'#0f172a',borderBottom:'1px solid #1e293b',padding:'10px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:20,fontWeight:800}}>SwingLab</span>
          <span style={{fontSize:10,color:'#64748b',background:'#1e293b',padding:'2px 8px',borderRadius:4}}>v0.3</span>
          {traderData?.market?.regime && (
            <span style={{fontSize:11,padding:'2px 8px',borderRadius:6,fontWeight:600,
              background:getRegimeColor(traderData.market.regime)+'20',
              color:getRegimeColor(traderData.market.regime)}}>
              {getRegimeEmoji(traderData.market.regime)} {traderData.market.regime}
              {traderData.market.confidence && ` ${traderData.market.confidence}%`}
            </span>
          )}
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => { setView(n.id); setSelectedStock(null); setSelectedSector(null); }}
              style={{padding:'6px 12px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,
                background:view===n.id?'#3b82f6':'transparent',color:view===n.id?'white':'#94a3b8'}}>
              {n.label}
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:6}}>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()}
            placeholder="Search ticker..." style={{padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:12,width:120}} />
          <button onClick={handleSearch} disabled={searching}
            style={{padding:'6px 10px',borderRadius:6,background:'#3b82f6',color:'white',border:'none',cursor:'pointer',fontSize:12}}>
            {searching?'...':'🔍'}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1400,margin:'0 auto',padding:20}}>
        {loading && view !== 'agents' ? <div style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading...</div> :

        /* ==================== DASHBOARD ==================== */
        view === 'dashboard' ? (
          <div>
            {/* Market Overview */}
            {Object.keys(marketData).length > 0 && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(100px, 1fr))',gap:8,marginBottom:20}}>
                {Object.entries(marketData).map(([sym, data]) => (
                  <div key={sym} style={{background:'#0f172a',borderRadius:8,padding:10,textAlign:'center',border:'1px solid #1e293b'}}>
                    <div style={{fontSize:11,color:'#64748b'}}>{sym}</div>
                    <div style={{fontSize:14,fontWeight:700,color:'white'}}>${data.price?.toLocaleString()}</div>
                    <div style={{fontSize:11,color:data.change_pct>=0?'#22c55e':'#ef4444'}}>{data.change_pct>=0?'+':''}{data.change_pct?.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            )}
            {/* Top Setups */}
            <h3>🔥 Top Setups</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
              {topSetups.map(a => { const live=getLivePrice(a.ticker); return (
                <div key={a.ticker} onClick={()=>setSelectedStock(a)} style={{background:'#0f172a',borderRadius:10,padding:14,cursor:'pointer',border:'1px solid #1e293b',transition:'border 0.2s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div><span style={{fontWeight:700,fontSize:15}}>{a.ticker}</span> <span style={{color:'#64748b',fontSize:11}}>{a.sector_code}</span></div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:600}}>${live?.price || a.price}</div>
                      <div style={{fontSize:11,color:(live?.change_pct||a.change_pct)>=0?'#22c55e':'#ef4444'}}>{(live?.change_pct||a.change_pct)>=0?'+':''}{(live?.change_pct||a.change_pct)?.toFixed(2)}%</div>
                    </div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <span style={{color:getScoreColor(a.setup_score),fontWeight:700,fontSize:16}}>{a.setup_score}</span>
                      {getSetupBadge(a.setup_type)}
                    </div>
                    <span style={{color:'#64748b',fontSize:11}}>RSI {a.rsi?.toFixed(0)}</span>
                  </div>
                </div>
              );})}
            </div>
          </div>
        ) :

        /* ==================== SECTORS ==================== */
        view === 'sectors' ? (
          <div>
            <h3>🏛️ Sectors</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
              {sectors.sort((a,b)=>b.composite_score-a.composite_score).map(s => (
                <div key={s.code} onClick={()=>{setSelectedSector(s.code);setView('stocks');}}
                  style={{background:'#0f172a',borderRadius:10,padding:14,cursor:'pointer',border:'1px solid #1e293b'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontWeight:700}}>{s.code}</span>
                    <span style={{color:getScoreColor(s.composite_score),fontWeight:700}}>{s.composite_score?.toFixed(1)}</span>
                  </div>
                  <div style={{color:'#64748b',fontSize:12}}>{s.name}</div>
                  <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>
                    ${s.price} | RSI {s.rsi} | Str {s.strength_score>=0?'+':''}{s.strength_score?.toFixed(1)}
                  </div>
                  {s.history && (
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={s.history.slice(-30)}>
                        <Area type="monotone" dataKey="close" stroke={s.composite_score>=50?'#22c55e':'#ef4444'} fill={s.composite_score>=50?'#22c55e':'#ef4444'} fillOpacity={0.1} strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) :

        /* ==================== STOCKS ==================== */
        view === 'stocks' ? (
          <div>
            {selectedSector && <div style={{marginBottom:12}}><button onClick={()=>setSelectedSector(null)} style={{background:'#1e293b',color:'white',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>← All Stocks</button> <span style={{color:'#64748b',marginLeft:8}}>{selectedSector}</span></div>}
            {selectedStock ? (
              <div>
                <button onClick={()=>setSelectedStock(null)} style={{background:'#1e293b',color:'white',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer',marginBottom:16,fontSize:12}}>← Back</button>
                <div style={{background:'#0f172a',borderRadius:12,padding:20,border:'1px solid #1e293b'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                    <div>
                      <h2 style={{margin:0}}>{selectedStock.ticker}</h2>
                      <span style={{color:'#64748b'}}>{selectedStock.sector_code}</span>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:24,fontWeight:700}}>${selectedStock.price}</div>
                      <div style={{color:selectedStock.change_pct>=0?'#22c55e':'#ef4444'}}>{selectedStock.change_pct>=0?'+':''}{selectedStock.change_pct}%</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10,marginBottom:16}}>
                    {[{l:'Score',v:selectedStock.setup_score,c:getScoreColor(selectedStock.setup_score)},{l:'RSI',v:selectedStock.rsi?.toFixed(1)},{l:'POC',v:selectedStock.poc_price?'$'+selectedStock.poc_price.toFixed(2):'N/A'},{l:'VA High',v:selectedStock.value_area_high?'$'+selectedStock.value_area_high.toFixed(2):'N/A'},{l:'VA Low',v:selectedStock.value_area_low?'$'+selectedStock.value_area_low.toFixed(2):'N/A'},{l:'Rel Vol',v:selectedStock.relative_volume?.toFixed(1)+'x'}].map(m =>
                      <div key={m.l} style={{background:'#1e293b',borderRadius:6,padding:8,textAlign:'center'}}>
                        <div style={{fontSize:10,color:'#64748b'}}>{m.l}</div>
                        <div style={{fontWeight:700,color:m.c||'white',marginTop:2}}>{m.v}</div>
                      </div>
                    )}
                  </div>
                  {/* Confluence */}
                  {(() => { const alert=getSmartAlert(selectedStock); return (
                    <div style={{background:'#1e293b',borderRadius:8,padding:12,marginBottom:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <span style={{fontWeight:600}}>Confluence</span>
                        <span style={{fontWeight:700,color:alert.confluence>=6?'#22c55e':alert.confluence>=4?'#eab308':'#ef4444'}}>{alert.confluence}/10</span>
                      </div>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        {alert.factors.map(f => <span key={f.name} style={{background:f.pass?'#22c55e15':'#ef444415',color:f.pass?'#22c55e':'#ef4444',padding:'2px 6px',borderRadius:4,fontSize:10}}>{f.name}: {f.detail}</span>)}
                      </div>
                    </div>
                  );})()}
                  {/* Price chart */}
                  {selectedStock.price_history && (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={selectedStock.price_history}>
                        <XAxis dataKey="date" tick={{fontSize:10,fill:'#64748b'}} interval="preserveStartEnd" />
                        <YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'#64748b'}} />
                        <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}} />
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                        {selectedStock.poc_price && <ReferenceLine y={selectedStock.poc_price} stroke="#eab308" strokeDasharray="4 4" label={{value:'POC',fill:'#eab308',fontSize:10}} />}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                {filteredAssets.sort((a,b)=>b.setup_score-a.setup_score).map(a => { const live=getLivePrice(a.ticker); return (
                  <div key={a.ticker} onClick={()=>setSelectedStock(a)} style={{background:'#0f172a',borderRadius:10,padding:12,cursor:'pointer',border:'1px solid #1e293b'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <div><span style={{fontWeight:700}}>{a.ticker}</span> <span style={{color:'#64748b',fontSize:11}}>{a.sector_code}</span></div>
                      <div style={{textAlign:'right'}}>
                        <span style={{fontWeight:600}}>${live?.price||a.price}</span>
                        <span style={{fontSize:11,marginLeft:6,color:(live?.change_pct||a.change_pct)>=0?'#22c55e':'#ef4444'}}>{(live?.change_pct||a.change_pct)>=0?'+':''}{(live?.change_pct||a.change_pct)?.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <span style={{color:getScoreColor(a.setup_score),fontWeight:700}}>{a.setup_score}</span>
                        {getSetupBadge(a.setup_type)}
                      </div>
                      <span style={{color:'#64748b',fontSize:11}}>RSI {a.rsi?.toFixed(0)} | {a.relative_volume?.toFixed(1)}x</span>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </div>
        ) :

        /* ==================== AGENTS ==================== */
        view === 'agents' ? (
          agentsLoading && !agentsStatus ? <div style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading agents...</div> : renderAgentsView()
        ) :

        /* ==================== ALPACA ==================== */
        view === 'alpaca' ? (
          <div>
            {alpacaData ? (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
                  {[{l:'Equity',v:`$${alpacaData.equity?.toLocaleString()}`},{l:'Cash',v:`$${alpacaData.cash?.toLocaleString()}`},{l:'Buying Power',v:`$${alpacaData.buying_power?.toLocaleString()}`},{l:'Daily P&L',v:`${alpacaData.daily_pnl>=0?'+':''}$${alpacaData.daily_pnl?.toFixed(2)}`,c:alpacaData.daily_pnl>=0?'#22c55e':'#ef4444'},{l:'Daily %',v:`${alpacaData.daily_pnl_pct>=0?'+':''}${alpacaData.daily_pnl_pct?.toFixed(2)}%`,c:alpacaData.daily_pnl_pct>=0?'#22c55e':'#ef4444'}].map(m =>
                    <div key={m.l} style={{background:'#0f172a',borderRadius:10,padding:14,textAlign:'center',border:'1px solid #1e293b'}}>
                      <div style={{fontSize:11,color:'#64748b'}}>{m.l}</div>
                      <div style={{fontSize:18,fontWeight:700,color:m.c||'white',marginTop:4}}>{m.v}</div>
                    </div>
                  )}
                </div>
                {/* Equity chart */}
                {Object.keys(equityPeriods).length > 0 && (
                  <div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
                    <div style={{display:'flex',gap:6,marginBottom:12}}>
                      {Object.keys(equityPeriods).map(p => <button key={p} onClick={()=>setSelectedPeriod(p)} style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:selectedPeriod===p?'#3b82f6':'#1e293b',color:selectedPeriod===p?'white':'#64748b'}}>{p}</button>)}
                    </div>
                    {equityPeriods[selectedPeriod] && (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={equityPeriods[selectedPeriod]}>
                          <XAxis dataKey="date" tick={{fontSize:10,fill:'#64748b'}} interval="preserveStartEnd" />
                          <YAxis tick={{fontSize:10,fill:'#64748b'}} />
                          <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}} />
                          <Area type="monotone" dataKey="equity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
                {/* Positions */}
                {alpacaData.positions?.length > 0 && (
                  <div style={{marginBottom:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <h3 style={{margin:0}}>Positions ({alpacaData.positions.length})</h3>
                      <button onClick={alpacaCloseAll} style={{padding:'4px 10px',borderRadius:6,background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:11}}>Close All</button>
                    </div>
                    {alpacaData.positions.map(p => (
                      <div key={p.symbol} style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:8,border:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <span style={{fontWeight:700,marginRight:8}}>{p.symbol}</span>
                          <span style={{color:'#64748b',fontSize:12}}>{p.qty} shares @ ${p.entry_price}</span>
                        </div>
                        <div style={{display:'flex',gap:12,alignItems:'center'}}>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:600}}>${p.current_price}</div>
                            <div style={{fontSize:12,color:p.pnl_pct>=0?'#22c55e':'#ef4444'}}>{p.pnl_pct>=0?'+':''}{p.pnl_pct?.toFixed(2)}% (${p.pnl?.toFixed(2)})</div>
                          </div>
                          <button onClick={(e)=>{e.stopPropagation();alpacaClose(p.symbol);}} style={{padding:'4px 8px',borderRadius:4,background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:11}}>Close</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Recent orders */}
                {alpacaData.orders?.length > 0 && (
                  <div>
                    <h3>Recent Orders</h3>
                    {alpacaData.orders.slice(0,10).map(o => (
                      <div key={o.id} style={{background:'#0f172a',borderRadius:6,padding:8,marginBottom:6,border:'1px solid #1e293b',fontSize:12,display:'flex',justifyContent:'space-between'}}>
                        <span><span style={{color:o.side==='buy'?'#22c55e':'#ef4444',fontWeight:600}}>{o.side?.toUpperCase()}</span> {o.symbol} x{o.qty}</span>
                        <span style={{color:'#64748b'}}>{o.status} | {o.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : <div style={{textAlign:'center',padding:40,color:'#64748b'}}>Connecting to Alpaca...</div>}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
