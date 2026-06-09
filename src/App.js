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
  // Agents
  const [agentsStatus, setAgentsStatus] = useState(null);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDecisions, setAgentDecisions] = useState([]);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [learningRunning, setLearningRunning] = useState(false);
  // Settings
  const [settings, setSettings] = useState({
    max_positions:5, risk_pct_per_trade:2, max_position_pct:20,
    min_risk_reward:1.5, max_per_sector:2, daily_loss_limit_pct:-3,
    weekly_loss_limit_pct:-5, starting_capital:100000,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // ===== FETCH FUNCTIONS =====
  const fetchMarket = async()=>{try{const r=await fetch(`${API}/api/data/market`);const d=await r.json();if(d&&typeof d==='object')setMarketData(d);}catch(e){}};
  const fetchEquityHistory = async()=>{try{const r=await fetch(`${API}/api/data/alpaca/history`);const d=await r.json();if(d&&typeof d==='object')setEquityPeriods(d);}catch(e){}};
  const fetchLivePrices = async()=>{try{const r=await fetch(`${API}/api/data/live`);const d=await r.json();if(d&&typeof d==='object'&&!d.detail)setLivePrices(d);}catch(e){}};
  const fetchAlpaca = async()=>{try{const r=await fetch(`${API}/api/data/alpaca`);const d=await r.json();if(!d.error)setAlpacaData(d);}catch(e){}};
  const alpacaBuy = async(s,q)=>{try{await fetch(`${API}/api/data/alpaca/buy?symbol=${s}&qty=${q}`,{method:'POST'});await fetchAlpaca();}catch(e){alert('Buy failed');}};
  const alpacaClose = async(s)=>{try{await fetch(`${API}/api/data/alpaca/close/${s}`,{method:'POST'});await fetchAlpaca();}catch(e){alert('Close failed');}};
  const alpacaCloseAll = async()=>{if(!window.confirm('Close ALL positions?'))return;try{await fetch(`${API}/api/data/alpaca/close-all`,{method:'POST'});await fetchAlpaca();}catch(e){}};
  const fetchTrader = async()=>{try{const r=await fetch(`${API}/api/data/autotrader`);const d=await r.json();if(!d.error)setTraderData(d);}catch(e){}};
  const runTrader = async()=>{setTraderLoading(true);try{await fetch(`${API}/api/data/autotrader/run`,{method:'POST'});await fetchTrader();await fetchAlpaca();}catch(e){}setTraderLoading(false);};
  const handleSearch = async()=>{if(!searchQuery.trim())return;setSearching(true);try{const r=await fetch(`${API}/api/data/search/${searchQuery.trim().toUpperCase()}`);const d=await r.json();if(d.error)alert(d.error);else setSelectedStock(d);}catch(e){alert('Search failed');}setSearching(false);setSearchQuery('');};
  const fetchData = async()=>{setLoading(true);try{const[s,a]=await Promise.all([fetch(`${API}/api/sectors`),fetch(`${API}/api/assets?limit=250`)]);setSectors(await s.json());setAssets(await a.json());}catch(e){}setLoading(false);};
  // Agents
  const fetchAgentsStatus = async()=>{setAgentsLoading(true);try{const r=await fetch(`${API}/api/agents/status`);const d=await r.json();if(d&&!d.error)setAgentsStatus(d);}catch(e){}setAgentsLoading(false);};
  const fetchAgentDecisions = async(n)=>{try{const r=await fetch(`${API}/api/agents/${n}/decisions?limit=20`);const d=await r.json();if(d.decisions)setAgentDecisions(d.decisions);}catch(e){}};
  const runPipeline = async()=>{setPipelineRunning(true);try{await fetch(`${API}/api/agents/run`,{method:'POST'});await fetchAgentsStatus();await fetchTrader();await fetchAlpaca();}catch(e){alert('Pipeline failed');}setPipelineRunning(false);};
  const runLearning = async()=>{setLearningRunning(true);try{await fetch(`${API}/api/agents/learn`,{method:'POST'});await fetchAgentsStatus();}catch(e){alert('Learning failed');}setLearningRunning(false);};
  // Settings
  const fetchSettings = async()=>{try{const r=await fetch(`${API}/api/settings`);const d=await r.json();if(d&&!d.error&&d.max_positions)setSettings(p=>({...p,...d}));}catch(e){}};
  const saveSettings = async()=>{setSettingsSaving(true);try{await fetch(`${API}/api/settings`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});alert('Settings saved!');}catch(e){alert('Save failed');}setSettingsSaving(false);};

  useEffect(()=>{fetchData();fetchTrader();fetchAlpaca();fetchLivePrices();fetchEquityHistory();fetchMarket();fetchSettings();const p=setInterval(fetchLivePrices,15000);const a=setInterval(fetchAlpaca,60000);const d=setInterval(fetchData,300000);return()=>{clearInterval(p);clearInterval(a);clearInterval(d);};},[]);
  useEffect(()=>{if(view==='agents')fetchAgentsStatus();},[view]);

  // ===== HELPERS =====
  const getLivePrice=(t)=>livePrices[t]||null;
  const topSetups=[...assets].sort((a,b)=>b.setup_score-a.setup_score).slice(0,15);
  const filteredAssets=selectedSector?assets.filter(a=>a.sector_code===selectedSector):assets;
  const getScoreColor=(s)=>s>=70?'#22c55e':s>=50?'#eab308':s>=30?'#f97316':'#ef4444';
  const getSetupBadge=(type)=>{const m={breakout:{bg:'#22c55e20',c:'#22c55e',l:'Breakout'},pullback_to_poc:{bg:'#3b82f620',c:'#3b82f6',l:'POC Pullback'},ema_bounce:{bg:'#8b5cf620',c:'#8b5cf6',l:'EMA Bounce'},oversold_reversal:{bg:'#06b6d420',c:'#06b6d4',l:'Reversal'},overbought_warning:{bg:'#ef444420',c:'#ef4444',l:'Overbought'},neutral:{bg:'#64748b20',c:'#94a3b8',l:'Neutral'}};const s=m[type]||m.neutral;return<span style={{background:s.bg,color:s.c,padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:600}}>{s.l}</span>;};
  const getRegimeColor=(r)=>({BULL:'#22c55e',NEUTRAL:'#eab308',BEAR:'#f97316',CRASH:'#ef4444'}[r]||'#94a3b8');
  const getSmartAlert=(asset)=>{let factors=[],conf=0;if(asset.poc_price&&asset.price){const d=Math.abs((asset.price-asset.poc_price)/asset.price*100);if(d<=2){conf+=2;factors.push({name:'POC',score:2,max:2,detail:d.toFixed(1)+'%',pass:true});}else factors.push({name:'POC',score:0,max:2,detail:d.toFixed(1)+'%',pass:false});}const bp=(asset.candlestick_patterns||[]).filter(p=>p.type==='bullish');if(bp.length>0){conf+=1.5;factors.push({name:'Pattern',score:1.5,max:1.5,detail:bp.map(p=>p.name).join(','),pass:true});}else factors.push({name:'Pattern',score:0,max:1.5,detail:'None',pass:false});if(asset.rsi>=40&&asset.rsi<=60){conf+=1;factors.push({name:'RSI',score:1,max:1,detail:''+asset.rsi?.toFixed(0),pass:true});}else factors.push({name:'RSI',score:0,max:1,detail:''+asset.rsi?.toFixed(0),pass:false});if(asset.macd?.histogram>0){conf+=1;factors.push({name:'MACD',score:1,max:1,detail:'+',pass:true});}else factors.push({name:'MACD',score:0,max:1,detail:'-',pass:false});if(asset.price>asset.ema10&&asset.ema10>asset.ema20&&asset.ema20>asset.ema50){conf+=1.5;factors.push({name:'EMA',score:1.5,max:1.5,detail:'Up',pass:true});}else if(asset.price>asset.ema20&&asset.ema20>asset.ema50){conf+=0.75;factors.push({name:'EMA',score:0.75,max:1.5,detail:'Mid',pass:true});}else factors.push({name:'EMA',score:0,max:1.5,detail:'No',pass:false});if(asset.relative_volume>=1.5){conf+=1;factors.push({name:'Vol',score:1,max:1,detail:asset.relative_volume?.toFixed(1)+'x',pass:true});}else factors.push({name:'Vol',score:0,max:1,detail:asset.relative_volume?.toFixed(1)+'x',pass:false});return{confluence:Math.round(conf*10)/10,factors};};
  const getPeriodPnL=()=>{const data=equityPeriods[selectedPeriod];if(!data||data.length<2)return{pnl:0,pnl_pct:0};const s=data[0]?.equity||0;const e=data[data.length-1]?.equity||0;const pnl=e-s;const pnl_pct=s>0?(pnl/s*100):0;return{pnl:Math.round(pnl*100)/100,pnl_pct:Math.round(pnl_pct*100)/100};};
  const assetMap={};assets.forEach(a=>{assetMap[a.ticker]=a;});
  const AGENT_INFO={macro_analyst:{emoji:'\u{1F30D}',name:'Macro Analyst',desc:'Economia, indici, settori, regime di mercato',color:'#3b82f6'},alpha_strategist:{emoji:'\u{1F3AF}',name:'Alpha Strategist',desc:'Stock picking, confluence, segnali buy/sell',color:'#22c55e'},risk_manager:{emoji:'\u{1F6E1}',name:'Risk Manager',desc:'Position sizing, limiti rischio, protezione drawdown',color:'#eab308'},executor:{emoji:'\u26A1',name:'Executor',desc:'Esecuzione ordini, Telegram, cancellazione stale',color:'#f97316'}};

  // ===== SETTINGS VIEW =====
  const renderSettings=()=>{
    const sliders=[
      {key:'max_positions',label:'Max Positions',min:3,max:10,step:1,unit:'',desc:'Quante posizioni aperte contemporaneamente'},
      {key:'risk_pct_per_trade',label:'Risk per Trade',min:0.5,max:5,step:0.25,unit:'%',desc:'% del capitale rischiato per singolo trade'},
      {key:'max_position_pct',label:'Max per Position',min:10,max:40,step:5,unit:'%',desc:'% max del capitale per una singola posizione'},
      {key:'min_risk_reward',label:'Min Risk/Reward',min:1.0,max:3.0,step:0.1,unit:':1',desc:'Rapporto minimo reward/risk accettabile'},
      {key:'max_per_sector',label:'Max per Sector',min:1,max:4,step:1,unit:'',desc:'Max stock dallo stesso settore'},
      {key:'daily_loss_limit_pct',label:'Daily Loss Limit',min:-10,max:-1,step:0.5,unit:'%',desc:'Smette di tradare se perde oltre questa %'},
      {key:'weekly_loss_limit_pct',label:'Weekly Loss Limit',min:-15,max:-2,step:1,unit:'%',desc:'Riduce esposizione oltre questa % settimanale'},
    ];
    return(<div>
      <h2 style={{marginBottom:20}}>{'\u2699\uFE0F'} Settings</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:16}}>
        <div style={{background:'#0f172a',borderRadius:12,padding:16,border:'1px solid #1e293b',gridColumn:'1/-1'}}>
          <h3 style={{margin:'0 0 12px',fontSize:15}}>{'\uD83D\uDCB0'} Starting Capital</h3>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{color:'#94a3b8',fontSize:13}}>$</span>
            <input type="number" value={settings.starting_capital} onChange={e=>setSettings({...settings,starting_capital:parseFloat(e.target.value)||0})} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:16,fontWeight:700,width:200}}/>
            <span style={{color:'#64748b',fontSize:12}}>Capitale iniziale per calcolare P&L totale</span>
          </div>
          {alpacaData&&settings.starting_capital>0&&(()=>{const t=alpacaData.equity-settings.starting_capital;const p=(t/settings.starting_capital*100);return<div style={{marginTop:10,fontSize:14}}><span style={{color:'#94a3b8'}}>Total P&L: </span><span style={{color:t>=0?'#22c55e':'#ef4444',fontWeight:700}}>{t>=0?'+':''}${t.toFixed(2)} ({p>=0?'+':''}{p.toFixed(2)}%)</span></div>;})()}
        </div>
        {sliders.map(s=>(<div key={s.key} style={{background:'#0f172a',borderRadius:12,padding:16,border:'1px solid #1e293b'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{color:'white',fontWeight:600,fontSize:13}}>{s.label}</span>
            <span style={{color:'#3b82f6',fontWeight:700,fontSize:16}}>{settings[s.key]}{s.unit}</span>
          </div>
          <div style={{color:'#64748b',fontSize:11,marginBottom:10}}>{s.desc}</div>
          <input type="range" min={s.min} max={s.max} step={s.step} value={settings[s.key]} onChange={e=>setSettings({...settings,[s.key]:parseFloat(e.target.value)})} style={{width:'100%',accentColor:'#3b82f6'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#475569'}}><span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span></div>
        </div>))}
      </div>
      <div style={{marginTop:20,display:'flex',gap:12}}>
        <button onClick={saveSettings} disabled={settingsSaving} style={{padding:'10px 24px',background:settingsSaving?'#334155':'#3b82f6',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:14}}>{settingsSaving?'Saving...':'\uD83D\uDCBE Save Settings'}</button>
        <span style={{color:'#64748b',fontSize:12,alignSelf:'center'}}>Usati dal RiskManager al prossimo pipeline run</span>
      </div>
    </div>);
  };

  // ===== GUIDE VIEW =====
  const renderGuide=()=>{
    const Section=({emoji,title,children})=>(<div style={{background:'#0f172a',borderRadius:12,padding:20,marginBottom:20,border:'1px solid #1e293b'}}><h3 style={{margin:'0 0 14px',fontSize:17}}>{emoji} {title}</h3>{children}</div>);
    const Card=({title,color,children})=>(<div style={{background:'#1e293b',borderRadius:8,padding:12,borderLeft:`3px solid ${color||'#3b82f6'}`}}><div style={{fontWeight:600,fontSize:13,color:color||'white',marginBottom:6}}>{title}</div><div style={{color:'#94a3b8',fontSize:12,lineHeight:1.6}}>{children}</div></div>);
    return(<div>
      <h2>{'\uD83D\uDCD6'} How SwingLab Works</h2>
      <p style={{color:'#94a3b8',marginBottom:20}}>SwingLab è un sistema di swing trading automatizzato con 4 agenti AI che analizzano il mercato, selezionano stock, gestiscono il rischio ed eseguono ordini su Alpaca.</p>

      <Section emoji={'\uD83D\uDCE1'} title="1. Data Sources">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10}}>
          <Card title={'\uD83D\uDCC8 220 Stock'} color="#3b82f6">20 stock per ognuno degli 11 settori S&P. Dati storici salvati in MongoDB con refresh incrementale ogni ora.</Card>
          <Card title={'\uD83C\uDFDB 11 Settori'} color="#22c55e">ETF settoriali SPDR: XLK (Tech), XLF (Finance), XLV (Health), XLI, XLY, XLP, XLE, XLU, XLB, XLRE, XLC</Card>
          <Card title={'\uD83D\uDCCA Indici USA'} color="#eab308">SPY (S&P 500), QQQ (Nasdaq), IWM (Russell 2000), DIA (Dow Jones)</Card>
          <Card title={'\uD83E\uDE99 Crypto & FX'} color="#f97316">BTC/USD, ETH/USD, FXE (Euro), UUP (Dollar), VIXY (VIX proxy)</Card>
        </div>
      </Section>

      <Section emoji={'\uD83D\uDCCA'} title="2. Indicatori Tecnici">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:10}}>
          <Card title="RSI (Relative Strength Index)" color="#3b82f6">Misura se una stock è ipercomprata o ipervenduta.<br/>0-30 = Oversold (possibile rimbalzo) | 30-70 = Normale | 70-100 = Overbought</Card>
          <Card title="MACD" color="#22c55e">Misura il momentum. Histogram {'>'} 0 = momentum positivo. Crossover = segnale BUY/SELL.</Card>
          <Card title="EMA (10/20/50)" color="#eab308">Medie mobili esponenziali. Price {'>'} EMA10 {'>'} EMA20 {'>'} EMA50 = uptrend perfetto!</Card>
          <Card title="Volume Profile & POC" color="#f97316">POC = prezzo con più volume (supporto forte). Value Area = zona del 70% del volume.</Card>
          <Card title="Wyckoff Phases" color="#8b5cf6">Accumulation → Markup → Distribution → Markdown. Spring = rimbalzo forte!</Card>
          <Card title="Candlestick & FVG" color="#ef4444">Hammer, Engulfing, Doji, Morning/Evening Star. FVG = gap dove il prezzo torna.</Card>
        </div>
      </Section>

      <Section emoji={'\uD83C\uDFAF'} title="3. Scoring System">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <Card title="Setup Score (0-100)" color="#3b82f6">EMA alignment: +25 | RSI sweet spot: +15 | MACD: +10 | Volume: +10 | POC: +15 | Sector: +10 | Patterns: +15. Score {'>'} 70 = Strong Buy</Card>
          <Card title="Confluence Score (0-100)" color="#22c55e">Usato dagli agenti AI. Combina 13 fattori con pesi regolabili. Più fattori convergono = segnale più affidabile!</Card>
        </div>
      </Section>

      <Section emoji={'\uD83E\uDD16'} title="4. I 4 Agenti AI">
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:16,flexWrap:'wrap'}}>
          {Object.entries(AGENT_INFO).map(([name,info],i)=>(<React.Fragment key={name}>{i>0&&<div style={{color:'#475569',fontSize:24,margin:'0 8px'}}>{'\u2192'}</div>}<div style={{background:'#1e293b',borderRadius:10,padding:'12px 20px',border:`2px solid ${info.color}`,textAlign:'center',minWidth:140}}><div style={{fontSize:24}}>{info.emoji}</div><div style={{color:'white',fontSize:13,fontWeight:700,marginTop:4}}>{info.name}</div><div style={{color:'#64748b',fontSize:10,marginTop:2}}>{info.desc}</div></div></React.Fragment>))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:10}}>
          <Card title={'\uD83C\uDF0D MacroAnalyst'} color="#3b82f6">Studia il mercato. Output: regime (BULL/NEUTRAL/BEAR/CRASH) e % esposizione.</Card>
          <Card title={'\uD83C\uDFAF AlphaStrategist'} color="#22c55e">Scansiona 220 stock. Seleziona candidati BUY e segnali SELL.</Card>
          <Card title={'\uD83D\uDEE1 RiskManager'} color="#eab308">Calcola position sizing, approva/rifiuta trade, controlla limiti rischio.</Card>
          <Card title={'\u26A1 Executor'} color="#f97316">Piazza bracket orders (entry + TP + SL), notifica Telegram, cancella ordini vecchi.</Card>
        </div>
      </Section>

      <Section emoji={'\uD83D\uDCE6'} title="5. Bracket Orders">
        <Card title="Come funziona" color="#3b82f6">Ogni trade piazza 3 ordini collegati: 1) BUY limit order 2) TAKE PROFIT automatico al target (VA High) 3) STOP LOSS automatico (VA Low). Mutuamente esclusivi: se scatta TP, SL si cancella e viceversa. Funzionano anche se il sistema è offline!</Card>
      </Section>

      <Section emoji={'\uD83D\uDCDA'} title="6. Glossario">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:8}}>
          {[['POC','Point of Control: prezzo con il volume più alto'],['VA High/Low','Value Area: zona dove si scambia il 70% del volume'],['RSI','Relative Strength Index (0-100)'],['MACD','Moving Average Convergence Divergence'],['EMA','Exponential Moving Average'],['Wyckoff','Teoria delle 4 fasi di mercato'],['FVG','Fair Value Gap: gap nel prezzo'],['Confluence','Quanti fattori convergono sullo stesso segnale'],['R/R Ratio','Risk/Reward: rapporto guadagno/rischio'],['Bracket Order','Ordine composto: entry + TP + SL'],['Setup Score','Punteggio 0-100 qualità opportunità'],['Breadth','% di stock sopra la EMA50']].map(([t,d])=>(<div key={t} style={{background:'#1e293b',borderRadius:6,padding:8,fontSize:12}}><span style={{color:'#3b82f6',fontWeight:700}}>{t}</span><span style={{color:'#94a3b8'}}> — {d}</span></div>))}
        </div>
      </Section>
    </div>);
  };

  // ===== AGENTS VIEW =====
  const renderAgentsView=()=>{
    const ps=agentsStatus?.pipeline_state;const ag=agentsStatus?.agents||{};const market=ps?.market||{};const pipeline=ps?.pipeline||{};const riskReport=ps?.risk_report||{};
    return(<div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{margin:0}}>{'\uD83E\uDD16'} Multi-Agent AI System</h2>
        <div style={{display:'flex',gap:10}}>
          <button onClick={runPipeline} disabled={pipelineRunning} style={{padding:'8px 16px',background:pipelineRunning?'#334155':'#3b82f6',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>{pipelineRunning?'\u23F3 Running...':'\u25B6\uFE0F Run Pipeline'}</button>
          <button onClick={runLearning} disabled={learningRunning} style={{padding:'8px 16px',background:learningRunning?'#334155':'#8b5cf6',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>{learningRunning?'\u23F3 Learning...':'\uD83E\uDDEC Learn All'}</button>
          <button onClick={fetchAgentsStatus} style={{padding:'8px 16px',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:8,cursor:'pointer'}}>{'\uD83D\uDD04'} Refresh</button>
        </div>
      </div>
      {ps&&<div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{color:'#94a3b8',fontSize:13}}>Last Run: {ps.last_run?new Date(ps.last_run).toLocaleString():'Never'}</span>
          <span style={{color:'#94a3b8',fontSize:13}}>{pipeline.timing?.total&&`\u23F1 ${pipeline.timing.total}s`}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,flexWrap:'wrap'}}>
          {['macro_analyst','alpha_strategist','risk_manager','executor'].map((name,i)=>{const info=AGENT_INFO[name];const st=pipeline.steps?.[name]||'unknown';const bc=st==='ok'?info.color:st==='error'?'#ef4444':'#334155';return(<React.Fragment key={name}>{i>0&&<div style={{color:'#475569',fontSize:20,margin:'0 4px'}}>{'\u2192'}</div>}<div onClick={()=>{setSelectedAgent(name);fetchAgentDecisions(name);}} style={{background:'#1e293b',borderRadius:10,padding:'10px 16px',border:`2px solid ${bc}`,cursor:'pointer',textAlign:'center',minWidth:130}}><div style={{fontSize:20}}>{info.emoji}</div><div style={{color:'white',fontSize:12,fontWeight:600,marginTop:2}}>{info.name}</div><div style={{color:bc,fontSize:10,marginTop:2}}>{st==='ok'?'\u2705 OK':st==='error'?'\u274C Error':'\u23F3'}</div></div></React.Fragment>);})}
        </div>
      </div>}
      {market.regime&&<div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
        <h3 style={{margin:'0 0 12px',fontSize:15}}>{'\uD83C\uDF0D'} Market Context</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
          {[{l:'Regime',v:market.regime,c:getRegimeColor(market.regime)},{l:'Confidence',v:`${market.confidence||0}%`},{l:'Exposure',v:`${((market.exposure_multiplier||0)*100).toFixed(0)}%`},{l:'Volatility',v:market.volatility||'—',c:market.volatility==='EXTREME'?'#ef4444':market.volatility==='HIGH'?'#f97316':'#22c55e'},{l:'Breadth',v:`${market.breadth_pct||0}%`},{l:'Rotation',v:market.rotation||'—',c:market.rotation==='defensive'?'#f97316':'#22c55e'}].map(item=>(<div key={item.l} style={{background:'#1e293b',borderRadius:8,padding:12,textAlign:'center'}}><div style={{fontSize:11,color:'#94a3b8'}}>{item.l}</div><div style={{fontSize:item.l==='Regime'?18:14,fontWeight:700,color:item.c||'white',marginTop:4}}>{item.v}</div></div>))}
        </div>
      </div>}
      {riskReport.equity&&<div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}>
        <h3 style={{margin:'0 0 12px',fontSize:15}}>{'\uD83D\uDEE1\uFE0F'} Risk Report</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>
          {[{l:'Equity',v:`$${riskReport.equity?.toLocaleString()}`},{l:'Cash',v:`$${riskReport.cash?.toLocaleString()}`},{l:'Exposure',v:`${riskReport.total_exposure_pct||0}%`},{l:'Positions',v:`${riskReport.current_positions||0}/${riskReport.max_positions||5}`},{l:'Risk/Trade',v:`$${riskReport.risk_per_trade?.toFixed(0)||0}`},{l:'Multiplier',v:`${((riskReport.final_multiplier||0)*100).toFixed(0)}%`}].map(item=>(<div key={item.l} style={{background:'#1e293b',borderRadius:8,padding:10,textAlign:'center'}}><div style={{fontSize:10,color:'#94a3b8'}}>{item.l}</div><div style={{fontSize:14,fontWeight:600,color:'white',marginTop:2}}>{item.v}</div></div>))}
        </div>
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,marginBottom:20}}>
        {Object.entries(AGENT_INFO).map(([name,info])=>{const ad=ag[name]||{};const p=ad.params||{};const rc=ad.recent_decisions?.length||0;const is=selectedAgent===name;return(<div key={name} onClick={()=>{setSelectedAgent(is?null:name);if(!is)fetchAgentDecisions(name);}} style={{background:'#0f172a',borderRadius:12,padding:16,border:`2px solid ${is?info.color:'#1e293b'}`,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><div><span style={{fontSize:18,marginRight:6}}>{info.emoji}</span><span style={{color:'white',fontWeight:700,fontSize:14}}>{info.name}</span></div><span style={{color:'#64748b',fontSize:11}}>{rc} decisions</span></div><div style={{color:'#64748b',fontSize:11,marginBottom:10}}>{info.desc}</div>{name==='macro_analyst'&&p.w_spy_trend&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{[{l:'SPY',v:p.w_spy_trend},{l:'Breadth',v:p.w_breadth},{l:'VIX',v:p.w_vix}].map(w=><span key={w.l} style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>{w.l}: {((w.v||0)*100).toFixed(0)}%</span>)}</div>}{name==='alpha_strategist'&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Min Conf: {p.min_confluence||35}</span><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Max RSI: {p.max_rsi_entry||68}</span>{(p.best_setups||[]).slice(0,2).map(s=><span key={s} style={{background:'#22c55e15',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#22c55e'}}>{s}</span>)}</div>}{name==='risk_manager'&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Risk: {p.risk_pct_per_trade||2}%</span><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>R/R{'\u2265'}{p.min_risk_reward||1.5}</span><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Max: {p.max_positions||5} pos</span></div>}{name==='executor'&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#94a3b8'}}>Buffer: {p.limit_price_buffer_pct||0.5}%</span><span style={{background:'#1e293b',padding:'2px 6px',borderRadius:4,fontSize:10,color:p.send_telegram!==false?'#22c55e':'#ef4444'}}>{p.send_telegram!==false?'\uD83D\uDCF1 TG On':'\uD83D\uDCF1 TG Off'}</span></div>}</div>);})}
      </div>
      {selectedAgent&&<div style={{background:'#0f172a',borderRadius:12,padding:16,border:`1px solid ${AGENT_INFO[selectedAgent]?.color||'#334155'}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><h3 style={{margin:0,fontSize:15}}>{AGENT_INFO[selectedAgent]?.emoji} {AGENT_INFO[selectedAgent]?.name} — Recent Decisions</h3><button onClick={()=>setSelectedAgent(null)} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:16}}>{'\u2715'}</button></div>
        {agentDecisions.length===0?<div style={{color:'#64748b',textAlign:'center',padding:20}}>No decisions yet</div>:<div style={{maxHeight:400,overflow:'auto'}}>{agentDecisions.map((d,i)=>(<div key={d._id||i} style={{background:'#1e293b',borderRadius:8,padding:10,marginBottom:8,fontSize:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{color:AGENT_INFO[selectedAgent]?.color,fontWeight:600}}>{d.type}</span><span style={{color:'#64748b'}}>{d.created_at?new Date(d.created_at).toLocaleString():''}</span></div><div style={{color:'#94a3b8',marginBottom:4}}>{d.reasoning}</div><div style={{display:'flex',gap:8}}><span style={{color:'#64748b'}}>Confidence: {d.confidence?.toFixed(0)||0}%</span></div></div>))}</div>}
      </div>}
      {ps?.actions?.length>0&&<div style={{background:'#0f172a',borderRadius:12,padding:16,marginTop:20,border:'1px solid #1e293b'}}><h3 style={{margin:'0 0 12px',fontSize:15}}>{'\uD83D\uDCCB'} Last Actions</h3>{ps.actions.map((a,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1e293b',borderRadius:6,padding:8,marginBottom:6,fontSize:12}}><span style={{color:a.action==='BUY'?'#22c55e':'#ef4444',fontWeight:700}}>{a.action} {a.ticker}</span><span style={{color:'#94a3b8'}}>{a.shares&&`${a.shares} shares`} {a.reason||''} {a.pnl_pct?`(${a.pnl_pct>0?'+':''}${a.pnl_pct}%)`:''}</span></div>))}</div>}
    </div>);
  };

  // ===== MAIN RENDER =====
  const navItems=[{id:'dashboard',label:'\uD83D\uDCCA Dashboard'},{id:'sectors',label:'\uD83C\uDFDB Sectors'},{id:'stocks',label:'\uD83D\uDCC8 Stocks'},{id:'agents',label:'\uD83E\uDD16 Agents'},{id:'alpaca',label:'\uD83D\uDCB0 Alpaca'},{id:'settings',label:'\u2699\uFE0F Settings'},{id:'guide',label:'\uD83D\uDCD6 Guide'}];
  const periodPnL=getPeriodPnL();

  return(
    <div style={{background:'#0a0e17',minHeight:'100vh',color:'white',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      <div style={{background:'#0f172a',borderBottom:'1px solid #1e293b',padding:'10px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:20,fontWeight:800}}>SwingLab</span>
          <span style={{fontSize:10,color:'#64748b',background:'#1e293b',padding:'2px 8px',borderRadius:4}}>v0.3</span>
          {traderData?.market?.regime&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:6,fontWeight:600,background:getRegimeColor(traderData.market.regime)+'20',color:getRegimeColor(traderData.market.regime)}}>{traderData.market.regime}{traderData.market.confidence?` ${traderData.market.confidence}%`:''}</span>}
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{navItems.map(n=><button key={n.id} onClick={()=>{setView(n.id);setSelectedStock(null);setSelectedSector(null);}} style={{padding:'6px 12px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:view===n.id?'#3b82f6':'transparent',color:view===n.id?'white':'#94a3b8'}}>{n.label}</button>)}</div>
        <div style={{display:'flex',gap:6}}><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Search ticker..." style={{padding:'6px 10px',borderRadius:6,border:'1px solid #334155',background:'#1e293b',color:'white',fontSize:12,width:120}}/><button onClick={handleSearch} disabled={searching} style={{padding:'6px 10px',borderRadius:6,background:'#3b82f6',color:'white',border:'none',cursor:'pointer',fontSize:12}}>{searching?'...':'\uD83D\uDD0D'}</button></div>
      </div>
      <div style={{maxWidth:1400,margin:'0 auto',padding:20}}>
        {loading&&!['agents','settings','guide'].includes(view)?<div style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading...</div>:

        view==='dashboard'?(<div>
          {Object.keys(marketData).length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:8,marginBottom:20}}>{Object.entries(marketData).map(([sym,data])=>(<div key={sym} style={{background:'#0f172a',borderRadius:8,padding:10,textAlign:'center',border:'1px solid #1e293b'}}><div style={{fontSize:11,color:'#64748b'}}>{sym.includes('/')?'\uD83E\uDE99':['VIXY','FXE','UUP'].includes(sym)?'\uD83D\uDCB1':'\uD83D\uDCCA'} {sym}</div><div style={{fontSize:14,fontWeight:700,color:'white'}}>${data.price?.toLocaleString()}</div><div style={{fontSize:11,color:data.change_pct>=0?'#22c55e':'#ef4444'}}>{data.change_pct>=0?'+':''}{data.change_pct?.toFixed(2)}%</div></div>))}</div>}
          <h3>{'\uD83D\uDD25'} Top Setups</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>{topSetups.map(a=>{const live=getLivePrice(a.ticker);return(<div key={a.ticker} onClick={()=>setSelectedStock(a)} style={{background:'#0f172a',borderRadius:10,padding:14,cursor:'pointer',border:'1px solid #1e293b'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><div><span style={{fontWeight:700,fontSize:15}}>{a.ticker}</span> <span style={{color:'#64748b',fontSize:11}}>{a.sector_code}</span></div><div style={{textAlign:'right'}}><div style={{fontWeight:600}}>${live?.price||a.price}</div><div style={{fontSize:11,color:(live?.change_pct||a.change_pct)>=0?'#22c55e':'#ef4444'}}>{(live?.change_pct||a.change_pct)>=0?'+':''}{(live?.change_pct||a.change_pct)?.toFixed(2)}%</div></div></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',gap:6,alignItems:'center'}}><span style={{color:getScoreColor(a.setup_score),fontWeight:700,fontSize:16}}>{a.setup_score}</span>{getSetupBadge(a.setup_type)}</div><span style={{color:'#64748b',fontSize:11}}>RSI {a.rsi?.toFixed(0)}</span></div></div>);})}</div>
        </div>):

        view==='sectors'?(<div>
          <h3>{'\uD83C\uDFDB'} Sectors</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>{sectors.sort((a,b)=>b.composite_score-a.composite_score).map(s=>(<div key={s.code} onClick={()=>{setSelectedSector(s.code);setView('stocks');}} style={{background:'#0f172a',borderRadius:10,padding:14,cursor:'pointer',border:'1px solid #1e293b'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontWeight:700}}>{s.code}</span><span style={{color:getScoreColor(s.composite_score),fontWeight:700}}>{s.composite_score?.toFixed(1)}</span></div><div style={{color:'#64748b',fontSize:12}}>{s.name}</div><div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>${s.price} | RSI {s.rsi} | Str {s.strength_score>=0?'+':''}{s.strength_score?.toFixed(1)}</div>{s.history&&<ResponsiveContainer width="100%" height={40}><AreaChart data={s.history.slice(-30)}><Area type="monotone" dataKey="close" stroke={s.composite_score>=50?'#22c55e':'#ef4444'} fill={s.composite_score>=50?'#22c55e':'#ef4444'} fillOpacity={0.1} strokeWidth={1.5}/></AreaChart></ResponsiveContainer>}</div>))}</div>
        </div>):

        view==='stocks'?(<div>
          {selectedSector&&<div style={{marginBottom:12}}><button onClick={()=>setSelectedSector(null)} style={{background:'#1e293b',color:'white',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>{'\u2190'} All</button><span style={{color:'#64748b',marginLeft:8}}>{selectedSector}</span></div>}
          {selectedStock?(<div>
            <button onClick={()=>setSelectedStock(null)} style={{background:'#1e293b',color:'white',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer',marginBottom:16,fontSize:12}}>{'\u2190'} Back</button>
            <div style={{background:'#0f172a',borderRadius:12,padding:20,border:'1px solid #1e293b'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><div><h2 style={{margin:0}}>{selectedStock.ticker}</h2><span style={{color:'#64748b'}}>{selectedStock.sector_code}</span></div><div style={{textAlign:'right'}}><div style={{fontSize:24,fontWeight:700}}>${selectedStock.price}</div><div style={{color:selectedStock.change_pct>=0?'#22c55e':'#ef4444'}}>{selectedStock.change_pct>=0?'+':''}{selectedStock.change_pct}%</div></div></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10,marginBottom:16}}>{[{l:'Score',v:selectedStock.setup_score,c:getScoreColor(selectedStock.setup_score)},{l:'RSI',v:selectedStock.rsi?.toFixed(1)},{l:'POC',v:selectedStock.poc_price?'$'+selectedStock.poc_price.toFixed(2):'N/A'},{l:'VA High',v:selectedStock.value_area_high?'$'+selectedStock.value_area_high.toFixed(2):'N/A'},{l:'VA Low',v:selectedStock.value_area_low?'$'+selectedStock.value_area_low.toFixed(2):'N/A'},{l:'Rel Vol',v:selectedStock.relative_volume?.toFixed(1)+'x'}].map(m=><div key={m.l} style={{background:'#1e293b',borderRadius:6,padding:8,textAlign:'center'}}><div style={{fontSize:10,color:'#64748b'}}>{m.l}</div><div style={{fontWeight:700,color:m.c||'white',marginTop:2}}>{m.v}</div></div>)}</div>
              {(()=>{const alert=getSmartAlert(selectedStock);return(<div style={{background:'#1e293b',borderRadius:8,padding:12,marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontWeight:600}}>Confluence</span><span style={{fontWeight:700,color:alert.confluence>=6?'#22c55e':alert.confluence>=4?'#eab308':'#ef4444'}}>{alert.confluence}/10</span></div><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{alert.factors.map(f=><span key={f.name} style={{background:f.pass?'#22c55e15':'#ef444415',color:f.pass?'#22c55e':'#ef4444',padding:'2px 6px',borderRadius:4,fontSize:10}}>{f.name}: {f.detail}</span>)}</div></div>);})()}
              {selectedStock.price_history&&<ResponsiveContainer width="100%" height={250}><AreaChart data={selectedStock.price_history}><XAxis dataKey="date" tick={{fontSize:10,fill:'#64748b'}} interval="preserveStartEnd"/><YAxis domain={['auto','auto']} tick={{fontSize:10,fill:'#64748b'}}/><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}}/><Area type="monotone" dataKey="close" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2}/>{selectedStock.poc_price&&<ReferenceLine y={selectedStock.poc_price} stroke="#eab308" strokeDasharray="4 4"/>}</AreaChart></ResponsiveContainer>}
            </div>
          </div>):(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>{filteredAssets.sort((a,b)=>b.setup_score-a.setup_score).map(a=>{const live=getLivePrice(a.ticker);return(<div key={a.ticker} onClick={()=>setSelectedStock(a)} style={{background:'#0f172a',borderRadius:10,padding:12,cursor:'pointer',border:'1px solid #1e293b'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><div><span style={{fontWeight:700}}>{a.ticker}</span> <span style={{color:'#64748b',fontSize:11}}>{a.sector_code}</span></div><div><span style={{fontWeight:600}}>${live?.price||a.price}</span><span style={{fontSize:11,marginLeft:6,color:(live?.change_pct||a.change_pct)>=0?'#22c55e':'#ef4444'}}>{(live?.change_pct||a.change_pct)>=0?'+':''}{(live?.change_pct||a.change_pct)?.toFixed(2)}%</span></div></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',gap:6,alignItems:'center'}}><span style={{color:getScoreColor(a.setup_score),fontWeight:700}}>{a.setup_score}</span>{getSetupBadge(a.setup_type)}</div><span style={{color:'#64748b',fontSize:11}}>RSI {a.rsi?.toFixed(0)}</span></div></div>);})}</div>)}
        </div>):

        view==='agents'?(agentsLoading&&!agentsStatus?<div style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading agents...</div>:renderAgentsView()):

        view==='alpaca'?(<div>
          {alpacaData?(<div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>{[{l:'Equity',v:`$${alpacaData.equity?.toLocaleString()}`},{l:'Cash',v:`$${alpacaData.cash?.toLocaleString()}`},{l:'Buying Power',v:`$${alpacaData.buying_power?.toLocaleString()}`},{l:`${selectedPeriod} P&L`,v:`${periodPnL.pnl>=0?'+':''}$${periodPnL.pnl.toLocaleString()}`,c:periodPnL.pnl>=0?'#22c55e':'#ef4444'},{l:`${selectedPeriod} %`,v:`${periodPnL.pnl_pct>=0?'+':''}${periodPnL.pnl_pct}%`,c:periodPnL.pnl_pct>=0?'#22c55e':'#ef4444'}].map(m=><div key={m.l} style={{background:'#0f172a',borderRadius:10,padding:14,textAlign:'center',border:'1px solid #1e293b'}}><div style={{fontSize:11,color:'#64748b'}}>{m.l}</div><div style={{fontSize:18,fontWeight:700,color:m.c||'white',marginTop:4}}>{m.v}</div></div>)}</div>
            {Object.keys(equityPeriods).length>0&&<div style={{background:'#0f172a',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #1e293b'}}><div style={{display:'flex',gap:6,marginBottom:12}}>{Object.keys(equityPeriods).map(p=><button key={p} onClick={()=>setSelectedPeriod(p)} style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:selectedPeriod===p?'#3b82f6':'#1e293b',color:selectedPeriod===p?'white':'#64748b'}}>{p}</button>)}</div>{equityPeriods[selectedPeriod]&&<ResponsiveContainer width="100%" height={200}><AreaChart data={equityPeriods[selectedPeriod]}><XAxis dataKey="date" tick={{fontSize:10,fill:'#64748b'}} interval="preserveStartEnd"/><YAxis tick={{fontSize:10,fill:'#64748b'}}/><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}}/><Area type="monotone" dataKey="equity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2}/></AreaChart></ResponsiveContainer>}</div>}
            {alpacaData.positions?.length>0&&<div style={{marginBottom:20}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><h3 style={{margin:0}}>Positions ({alpacaData.positions.length})</h3><button onClick={alpacaCloseAll} style={{padding:'4px 10px',borderRadius:6,background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:11}}>Close All</button></div>{alpacaData.positions.map(p=>{const asset=assetMap[p.symbol];return(<div key={p.symbol} style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:8,border:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}><div><span style={{fontWeight:700,marginRight:8}}>{p.symbol}</span><span style={{color:'#64748b',fontSize:12}}>{p.qty} shares @ ${p.entry_price}</span>{asset&&<span style={{marginLeft:8}}>{getSetupBadge(asset.setup_type)}</span>}{asset&&<span style={{color:'#64748b',fontSize:11,marginLeft:6}}>{asset.sector_code}</span>}</div><div style={{display:'flex',gap:12,alignItems:'center'}}><div style={{textAlign:'right'}}><div style={{fontWeight:600}}>${p.current_price}</div><div style={{fontSize:12,color:p.pnl_pct>=0?'#22c55e':'#ef4444'}}>{p.pnl_pct>=0?'+':''}{p.pnl_pct?.toFixed(2)}% (${p.pnl?.toFixed(2)})</div></div><button onClick={(e)=>{e.stopPropagation();alpacaClose(p.symbol);}} style={{padding:'4px 8px',borderRadius:4,background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:11}}>Close</button></div></div>);})}</div>}
            {alpacaData.orders?.length>0&&<div><h3>Recent Orders</h3>{alpacaData.orders.filter(o=>!o.legs).slice(0,15).map(o=>{const sc={filled:'#22c55e',new:'#eab308',pending_new:'#eab308',partially_filled:'#f97316',cancelled:'#475569',expired:'#475569'}[o.status]||'#64748b';return(<div key={o.id} style={{background:'#0f172a',borderRadius:6,padding:10,marginBottom:6,border:'1px solid #1e293b',fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><span style={{color:o.side==='buy'?'#22c55e':'#ef4444',fontWeight:600}}>{o.side?.toUpperCase()}</span> <span style={{fontWeight:600}}>{o.symbol}</span> <span style={{color:'#64748b'}}>x{o.qty}</span>{o.filled_avg_price&&<span style={{color:'#94a3b8',marginLeft:6}}>@ ${o.filled_avg_price}</span>}</div><div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{background:sc+'20',color:sc,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600}}>{o.status}</span><span style={{color:'#475569',fontSize:10}}>{o.type}</span>{o.created_at&&<span style={{color:'#475569',fontSize:10}}>{new Date(o.created_at).toLocaleDateString()}</span>}</div></div>);})}</div>}
          </div>):<div style={{textAlign:'center',padding:40,color:'#64748b'}}>Connecting to Alpaca...</div>}
        </div>):

        view==='settings'?renderSettings():
        view==='guide'?renderGuide():
        null}
      </div>
    </div>
  );
}

export default App;
