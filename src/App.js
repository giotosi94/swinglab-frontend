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

  const fetchAlpaca = async () => { try { const r = await fetch(`${API}/api/data/alpaca`); const data = await r.json(); if (!data.error) setAlpacaData(data); } catch (e) {} };

  const alpacaBuy = async (symbol, qty) => { try { await fetch(`${API}/api/data/alpaca/buy?symbol=${symbol}&qty=${qty}`, {method:'POST'}); await fetchAlpaca(); } catch(e) { alert('Buy failed'); } };

  const alpacaSell = async (symbol, qty) => { try { await fetch(`${API}/api/data/alpaca/sell?symbol=${symbol}&qty=${qty}`, {method:'POST'}); await fetchAlpaca(); } catch(e) { alert('Sell failed'); } };

  const alpacaClose = async (symbol) => { try { await fetch(`${API}/api/data/alpaca/close/${symbol}`, {method:'POST'}); await fetchAlpaca(); } catch(e) { alert('Close failed'); } };

  const alpacaCloseAll = async () => { if(!window.confirm('Close ALL positions?')) return; try { await fetch(`${API}/api/data/alpaca/close-all`, {method:'POST'}); await fetchAlpaca(); } catch(e) {} };
  const [capital, setCapital] = useState(() => parseFloat(localStorage.getItem('sl_capital')) || 10000);
  const [riskPct, setRiskPct] = useState(() => parseFloat(localStorage.getItem('sl_riskPct')) || 2);
  const [openTrades, setOpenTrades] = useState(() => JSON.parse(localStorage.getItem('sl_trades') || '[]'));

  const saveCapital = (val) => { setCapital(val); localStorage.setItem('sl_capital', val); };
  const saveRiskPct = (val) => { setRiskPct(val); localStorage.setItem('sl_riskPct', val); };
  const saveTrades = (trades) => { setOpenTrades(trades); localStorage.setItem('sl_trades', JSON.stringify(trades)); };
  const addTrade = (ticker, entry, stopLoss, shares) => { const t = { id: Date.now(), ticker, entry, stopLoss, shares, date: new Date().toISOString().slice(0,10), riskPerShare: Math.abs(entry - stopLoss), totalRisk: Math.abs(entry - stopLoss) * shares, totalValue: entry * shares }; saveTrades([...openTrades, t]); };
  const removeTrade = (id) => { saveTrades(openTrades.filter(t => t.id !== id)); };
  const maxRiskPerTrade = capital * (riskPct / 100);
  const totalOpenRisk = openTrades.reduce((sum, t) => sum + t.totalRisk, 0);
  const riskUsedPct = capital > 0 ? ((totalOpenRisk / capital) * 100).toFixed(1) : 0;
  const calcPositionSize = (entry, stopLoss) => { const risk = Math.abs(entry - stopLoss); if (risk <= 0) return { shares: 0, totalRisk: 0, totalValue: 0, riskPerShare: 0 }; const shares = Math.floor(maxRiskPerTrade / risk); return { shares, totalRisk: Math.round(risk * shares * 100) / 100, totalValue: Math.round(entry * shares * 100) / 100, riskPerShare: Math.round(risk * 100) / 100 }; };

  const fetchTrader = async () => { try { const r = await fetch(`${API}/api/data/autotrader`); const data = await r.json(); if (!data.error) setTraderData(data); } catch (e) {} };
  const resetTrader = async (cap) => { setTraderLoading(true); try { await fetch(`${API}/api/data/autotrader/reset?capital=${cap}`, { method: 'POST' }); await fetchTrader(); } catch (e) {} setTraderLoading(false); };
  const runTrader = async () => { setTraderLoading(true); try { await fetch(`${API}/api/data/autotrader/run`, { method: 'POST' }); await fetchTrader(); } catch (e) {} setTraderLoading(false); };

  const handleSearch = async () => { if (!searchQuery.trim()) return; setSearching(true); try { const r = await fetch(`${API}/api/data/search/${searchQuery.trim().toUpperCase()}`); const data = await r.json(); if (data.error) { alert(data.error); } else { setSelectedStock(data); } } catch (e) { alert('Search failed'); } setSearching(false); setSearchQuery(''); };

  useEffect(() => { fetchData(); fetchTrader(); fetchMarket(); fetchAlpaca(); }, []);

  const fetchData = async () => { setLoading(true); try { const [secRes, assRes] = await Promise.all([fetch(`${API}/api/sectors`), fetch(`${API}/api/assets?limit=200`)]); setSectors(await secRes.json()); setAssets(await assRes.json()); } catch (e) { console.error('Fetch error:', e); } setLoading(false); };

  const topSetups = [...assets].sort((a, b) => b.setup_score - a.setup_score).slice(0, 15);
  const filteredAssets = selectedSector ? assets.filter(a => a.sector_code === selectedSector) : assets;
  const getScoreColor = (score) => { if (score >= 70) return '#22c55e'; if (score >= 50) return '#eab308'; if (score >= 30) return '#f97316'; return '#ef4444'; };
  const getSetupBadge = (type) => { const map = { breakout:{bg:'#22c55e20',color:'#22c55e',label:'Breakout'}, pullback_to_poc:{bg:'#3b82f620',color:'#3b82f6',label:'POC Pullback'}, ema_bounce:{bg:'#8b5cf620',color:'#8b5cf6',label:'EMA Bounce'}, oversold_reversal:{bg:'#06b6d420',color:'#06b6d4',label:'Reversal'}, overbought_warning:{bg:'#ef444420',color:'#ef4444',label:'Overbought'}, neutral:{bg:'#64748b20',color:'#94a3b8',label:'Neutral'} }; const s = map[type] || map.neutral; return <span style={{background:s.bg, color:s.color, padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600}}>{s.label}</span>; };

  const getSmartAlert = (asset) => { const factors = []; let confluence = 0; if (asset.poc_price && asset.price) { const pocDist = Math.abs((asset.price - asset.poc_price) / asset.price * 100); if (pocDist <= 2) { confluence += 2; factors.push({name:'POC Proximity',score:2,max:2,detail:`${pocDist.toFixed(1)}%`,pass:true}); } else { factors.push({name:'POC Proximity',score:0,max:2,detail:`${pocDist.toFixed(1)}%`,pass:false}); } } const bp = (asset.candlestick_patterns||[]).filter(p=>p.type==='bullish'); if (bp.length>0) { confluence+=1.5; factors.push({name:'Bullish Pattern',score:1.5,max:1.5,detail:bp.map(p=>p.name).join(', '),pass:true}); } else { factors.push({name:'Bullish Pattern',score:0,max:1.5,detail:'None',pass:false}); } if (asset.rsi>=40&&asset.rsi<=60) { confluence+=1; factors.push({name:'RSI Sweet Spot',score:1,max:1,detail:`RSI ${asset.rsi?.toFixed(1)}`,pass:true}); } else { factors.push({name:'RSI Sweet Spot',score:0,max:1,detail:`RSI ${asset.rsi?.toFixed(1)}`,pass:false}); } if (asset.macd?.histogram>0) { confluence+=1; factors.push({name:'MACD Bullish',score:1,max:1,detail:`+${asset.macd.histogram.toFixed(4)}`,pass:true}); } else { factors.push({name:'MACD Bullish',score:0,max:1,detail:`${asset.macd?.histogram?.toFixed(4)}`,pass:false}); } if (asset.price>asset.ema10&&asset.ema10>asset.ema20&&asset.ema20>asset.ema50) { confluence+=1.5; factors.push({name:'EMA Uptrend',score:1.5,max:1.5,detail:'Perfect',pass:true}); } else if (asset.price>asset.ema20&&asset.ema20>asset.ema50) { confluence+=0.75; factors.push({name:'EMA Uptrend',score:0.75,max:1.5,detail:'Moderate',pass:true}); } else { factors.push({name:'EMA Uptrend',score:0,max:1.5,detail:'No',pass:false}); } if (asset.relative_volume>=1.5) { confluence+=1; factors.push({name:'High Volume',score:1,max:1,detail:`${asset.relative_volume?.toFixed(2)}x`,pass:true}); } else { factors.push({name:'High Volume',score:0,max:1,detail:`${asset.relative_volume?.toFixed(2)}x`,pass:false}); } const sd=sectors.find(s=>s.code===asset.sector_code); const sr=sectors.indexOf(sd)+1; if(sr<=5){confluence+=1;factors.push({name:'Strong Sector',score:1,max:1,detail:`#${sr}`,pass:true});}else{factors.push({name:'Strong Sector',score:0,max:1,detail:`#${sr}`,pass:false});} if(asset.pct_from_high&&asset.pct_from_high>=-10){confluence+=0.5;factors.push({name:'Near 52W High',score:0.5,max:0.5,detail:`${asset.pct_from_high?.toFixed(1)}%`,pass:true});}else{factors.push({name:'Near 52W High',score:0,max:0.5,detail:`${asset.pct_from_high?.toFixed(1)}%`,pass:false});} if(asset.change_pct>0&&asset.change_pct<=5){confluence+=0.5;factors.push({name:'Momentum',score:0.5,max:0.5,detail:`+${asset.change_pct?.toFixed(2)}%`,pass:true});}else{factors.push({name:'Momentum',score:0,max:0.5,detail:`${asset.change_pct?.toFixed(2)}%`,pass:false});} const bearP=(asset.candlestick_patterns||[]).filter(p=>p.type==='bearish'&&p.strength==='strong'); if(bearP.length>0)confluence=Math.max(0,confluence-2); if(asset.rsi>75)confluence=Math.max(0,confluence-1.5); const entry=asset.price; const stopLoss=asset.value_area_low||(asset.poc_price?asset.poc_price*0.97:entry*0.95); const target1=asset.value_area_high||entry*1.05; const rPS=Math.abs(entry-stopLoss); const rwPS=Math.abs(target1-entry); const rr=rPS>0?(rwPS/rPS).toFixed(2):0; let level,color,bg,icon; if(confluence>=8){level='ELITE';color='#f59e0b';bg='#f59e0b20';icon='🔥🔥🔥';}else if(confluence>=6){level='STRONG BUY';color='#22c55e';bg='#22c55e20';icon='🔥🔥';}else if(confluence>=4){level='BUY';color='#4ade80';bg='#4ade8020';icon='🔥';}else if(asset.setup_type==='overbought_warning'){level='AVOID';color='#ef4444';bg='#ef444420';icon='🔴';}else if(confluence>=2.5){level='WATCH';color='#eab308';bg='#eab30820';icon='👀';}else{level='HOLD';color='#64748b';bg='#64748b20';icon='⚪';} return{confluence:Math.round(confluence*10)/10,level,color,bg,icon,factors,trade:{entry:Math.round(entry*100)/100,stopLoss:Math.round(stopLoss*100)/100,target1:Math.round(target1*100)/100,riskReward:rr,riskPerShare:Math.round(rPS*100)/100,rewardPerShare:Math.round(rwPS*100)/100}}; };

  const getBottomSignal = (asset) => { let score=0; if(asset.rsi<=30)score+=3; else if(asset.rsi<=40)score+=2; if(asset.value_area_low&&asset.price){const d=((asset.price-asset.value_area_low)/asset.price*100);if(d<=2&&d>=-5)score+=2;} if(asset.low_52w&&asset.price){const d=((asset.price-asset.low_52w)/asset.low_52w*100);if(d<=15)score+=1.5;} const br=(asset.candlestick_patterns||[]).filter(p=>p.type==='bullish'&&['Hammer','Morning Star','Bullish Engulfing'].includes(p.name));if(br.length>0)score+=2; if(asset.relative_volume>=1.5)score+=1; if(asset.price<asset.ema50)score+=0.5; return{score:Math.round(score*10)/10}; };

  const bottomStocks = assets.map(a=>({...a,bottom:getBottomSignal(a)})).filter(a=>a.bottom.score>=3).sort((a,b)=>b.bottom.score-a.bottom.score);
  const sectorChartData = sectors.map(s=>({name:s.code,score:s.composite_score,fill:getScoreColor(s.composite_score)}));
  const setupCounts = {}; assets.forEach(a=>{setupCounts[a.setup_type]=(setupCounts[a.setup_type]||0)+1;}); const pieData = Object.entries(setupCounts).map(([name,value])=>({name,value})); const PIE_COLORS=['#22c55e','#3b82f6','#8b5cf6','#06b6d4','#ef4444','#64748b'];
  const smartAlerts = assets.map(a=>({...a,alert:getSmartAlert(a)})).filter(a=>a.alert.confluence>=4).sort((a,b)=>b.alert.confluence-a.alert.confluence);
  const eliteAlerts = smartAlerts.filter(a=>a.alert.confluence>=8);
  const strongAlerts = smartAlerts.filter(a=>a.alert.confluence>=6&&a.alert.confluence<8);

  if (loading) { return (<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0f172a',color:'white',fontSize:24,flexDirection:'column',gap:16}}><div style={{fontSize:48}}>🔬</div><div>SwingLab Loading...</div></div>); }

  if (selectedStock) { const a=selectedStock; const alert=getSmartAlert(a); const pocDist=a.poc_price?Math.abs(((a.price-a.poc_price)/a.price)*100).toFixed(2):null; const sector=sectors.find(s=>s.code===a.sector_code); return (
    <div style={{background:'#0f172a',minHeight:'100vh',color:'#e2e8f0'}}>
      <header style={{background:'#1e293b',padding:'16px 24px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:28}}>🔬</span><h1 style={{margin:0,fontSize:22,fontWeight:700}}>SwingLab</h1></div><button onClick={()=>setSelectedStock(null)} style={{background:'#334155',color:'white',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600}}>Back</button></header>
      <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
        <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}><div><h2 style={{margin:0,fontSize:32,fontWeight:700}}>{a.ticker}</h2><p style={{color:'#94a3b8',margin:'4px 0',fontSize:14}}>{a.name} - {sector?.name||a.sector_code}</p><p style={{fontSize:36,fontWeight:700,margin:'8px 0'}}>${a.price?.toFixed(2)}</p><p style={{color:a.change_pct>=0?'#22c55e':'#ef4444',fontSize:16,fontWeight:600,margin:0}}>{a.change_pct>=0?'+':''}{a.change_pct?.toFixed(2)}%</p></div><div style={{textAlign:'center'}}><div style={{width:120,height:120,borderRadius:'50%',border:`6px solid ${alert.color}`,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}><span style={{fontSize:32,fontWeight:700,color:alert.color}}>{alert.confluence}</span><span style={{fontSize:10,color:'#94a3b8'}}>/ 10</span></div><div style={{marginTop:12,padding:'8px 20px',borderRadius:20,background:alert.bg,color:alert.color,fontWeight:700,fontSize:16}}>{alert.icon} {alert.level}</div></div></div></div>
        <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}><h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>Confluence ({alert.confluence}/10)</h3><div style={{background:'#334155',borderRadius:8,height:12,marginBottom:20,overflow:'hidden'}}><div style={{width:`${(alert.confluence/10)*100}%`,height:'100%',borderRadius:8,background:alert.confluence>=8?'linear-gradient(90deg,#f59e0b,#ef4444)':alert.confluence>=6?'linear-gradient(90deg,#22c55e,#4ade80)':'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>{alert.factors.map((f,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:i<alert.factors.length-1?'1px solid #334155':'none'}}><span style={{fontSize:18,width:24}}>{f.pass?'✅':'❌'}</span><div style={{flex:1}}><p style={{margin:0,fontSize:13,fontWeight:600,color:f.pass?'#e2e8f0':'#64748b'}}>{f.name}</p><p style={{margin:0,fontSize:11,color:'#94a3b8'}}>{f.detail}</p></div><span style={{fontSize:13,fontWeight:700,color:f.pass?'#22c55e':'#64748b'}}>{f.score}/{f.max}</span></div>))}</div>
        <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}><h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>Trade Plan</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center',borderLeft:'4px solid #3b82f6'}}><p style={{color:'#3b82f6',fontSize:11,margin:0}}>ENTRY</p><p style={{fontSize:22,fontWeight:700,color:'#3b82f6',margin:'4px 0'}}>${alert.trade.entry}</p></div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center',borderLeft:'4px solid #ef4444'}}><p style={{color:'#ef4444',fontSize:11,margin:0}}>STOP</p><p style={{fontSize:22,fontWeight:700,color:'#ef4444',margin:'4px 0'}}>${alert.trade.stopLoss}</p></div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center',borderLeft:'4px solid #22c55e'}}><p style={{color:'#22c55e',fontSize:11,margin:0}}>TARGET</p><p style={{fontSize:22,fontWeight:700,color:'#22c55e',margin:'4px 0'}}>${alert.trade.target1}</p></div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center',borderLeft:'4px solid #eab308'}}><p style={{color:'#eab308',fontSize:11,margin:0}}>R:R</p><p style={{fontSize:22,fontWeight:700,color:'#eab308',margin:'4px 0'}}>{alert.trade.riskReward}:1</p></div></div></div>
        <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}><h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>Position Sizing</h3>{(()=>{const pos=calcPositionSize(alert.trade.entry,alert.trade.stopLoss);const already=openTrades.find(t=>t.ticker===a.ticker);return(<div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#f59e0b',fontSize:11,margin:0}}>BUY</p><p style={{fontSize:28,fontWeight:700,color:'#f59e0b',margin:'4px 0'}}>{pos.shares}</p><p style={{fontSize:10,color:'#94a3b8',margin:0}}>shares</p></div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#64748b',fontSize:11,margin:0}}>POSITION</p><p style={{fontSize:20,fontWeight:700,margin:'4px 0'}}>${pos.totalValue.toLocaleString()}</p></div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#ef4444',fontSize:11,margin:0}}>MAX LOSS</p><p style={{fontSize:20,fontWeight:700,color:'#ef4444',margin:'4px 0'}}>${pos.totalRisk}</p></div></div>{already?(<button onClick={()=>removeTrade(already.id)} style={{background:'#ef4444',color:'white',border:'none',padding:'12px',borderRadius:8,cursor:'pointer',fontWeight:700,width:'100%'}}>Close Trade</button>):(<button onClick={()=>addTrade(a.ticker,alert.trade.entry,alert.trade.stopLoss,pos.shares)} style={{background:'#22c55e',color:'white',border:'none',padding:'12px',borderRadius:8,cursor:'pointer',fontWeight:700,width:'100%'}}>Add Trade ({pos.shares} shares)</button>)}</div>);})()}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:24}}><div style={{background:'#1e293b',borderRadius:12,padding:16}}><p style={{color:'#64748b',fontSize:12,margin:0}}>Setup</p><div style={{marginTop:8}}>{getSetupBadge(a.setup_type)}</div></div><div style={{background:'#1e293b',borderRadius:12,padding:16}}><p style={{color:'#64748b',fontSize:12,margin:0}}>RSI</p><p style={{fontSize:24,fontWeight:700,margin:'4px 0',color:a.rsi>70?'#ef4444':a.rsi<30?'#22c55e':'#e2e8f0'}}>{a.rsi?.toFixed(1)}</p></div><div style={{background:'#1e293b',borderRadius:12,padding:16}}><p style={{color:'#64748b',fontSize:12,margin:0}}>MACD</p><p style={{fontSize:24,fontWeight:700,margin:'4px 0',color:a.macd?.histogram>0?'#22c55e':'#ef4444'}}>{a.macd?.histogram?.toFixed(4)}</p></div><div style={{background:'#1e293b',borderRadius:12,padding:16}}><p style={{color:'#64748b',fontSize:12,margin:0}}>Volume</p><p style={{fontSize:24,fontWeight:700,margin:'4px 0',color:a.relative_volume>=1.5?'#eab308':'#e2e8f0'}}>{a.relative_volume?.toFixed(2)}x</p></div></div>
        <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}><h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>Volume Profile</h3><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#8b5cf6',fontSize:12,margin:0}}>POC</p><p style={{fontSize:28,fontWeight:700,color:'#8b5cf6',margin:'8px 0'}}>{a.poc_price?`$${a.poc_price}`:'N/A'}</p>{pocDist&&<p style={{fontSize:12,color:'#94a3b8',margin:0}}>{pocDist}% away</p>}</div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#22c55e',fontSize:12,margin:0}}>VA High</p><p style={{fontSize:28,fontWeight:700,color:'#22c55e',margin:'8px 0'}}>{a.value_area_high?`$${a.value_area_high}`:'N/A'}</p></div><div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#ef4444',fontSize:12,margin:0}}>VA Low</p><p style={{fontSize:28,fontWeight:700,color:'#ef4444',margin:'8px 0'}}>{a.value_area_low?`$${a.value_area_low}`:'N/A'}</p></div></div></div>
        {a.price_history && a.price_history.length > 5 && (
          <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}>
            <h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>Price Chart</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={a.price_history} margin={{left:0,right:10,top:10,bottom:0}}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickFormatter={d=>d.slice(5)} interval={Math.floor(a.price_history.length/10)}/>
                <YAxis yAxisId="price" stroke="#475569" fontSize={10} domain={['auto','auto']}/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#e2e8f0',fontSize:12}} formatter={(value,name)=>{
                  if(name==='close')return[`$${value}`,'Price'];
                  if(name==='ema10')return[`$${value}`,'EMA 10'];
                  if(name==='ema20')return[`$${value}`,'EMA 20'];
                  if(name==='ema50')return[`$${value}`,'EMA 50'];
                  return[value,name];
                }}/>
                {a.poc_price && <ReferenceLine yAxisId="price" y={a.poc_price} stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} label={{value:`POC $${a.poc_price}`,position:'right',fill:'#8b5cf6',fontSize:10}}/>}
                {a.value_area_high && <ReferenceLine yAxisId="price" y={a.value_area_high} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5}/>}
                {a.value_area_low && <ReferenceLine yAxisId="price" y={a.value_area_low} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5}/>}
                <Area yAxisId="price" type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#priceGrad)" dot={false}/>
                <Line yAxisId="price" type="monotone" dataKey="ema10" stroke="#22c55e" strokeWidth={1} dot={false}/>
                <Line yAxisId="price" type="monotone" dataKey="ema20" stroke="#eab308" strokeWidth={1} strokeDasharray="4 4" dot={false}/>
                <Line yAxisId="price" type="monotone" dataKey="ema50" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:8,fontSize:10}}>
              <span><span style={{color:'#3b82f6'}}>━</span> Price</span>
              <span><span style={{color:'#22c55e'}}>━</span> EMA10</span>
              <span><span style={{color:'#eab308'}}>╌</span> EMA20</span>
              <span><span style={{color:'#ef4444'}}>╌</span> EMA50</span>
              <span><span style={{color:'#8b5cf6'}}>╌</span> POC</span>
            </div>
            {/* RSI Sub-chart */}
            <div style={{marginTop:16}}>
              <p style={{color:'#64748b',fontSize:12,margin:'0 0 8px'}}>RSI (14)</p>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={a.price_history} margin={{left:0,right:10,top:5,bottom:0}}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickFormatter={d=>d.slice(5)} interval={Math.floor(a.price_history.length/10)}/>
                  <YAxis stroke="#475569" fontSize={9} domain={[0,100]}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#e2e8f0',fontSize:11}} formatter={v=>[v,'RSI']}/>
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5}/>
                  <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5}/>
                  <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.05}/>
                  <ReferenceArea y1={0} y2={30} fill="#22c55e" fillOpacity={0.05}/>
                  <Area type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={1.5} fill="none" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Volume Sub-chart */}
            <div style={{marginTop:12}}>
              <p style={{color:'#64748b',fontSize:12,margin:'0 0 8px'}}>Volume</p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={a.price_history} margin={{left:0,right:10,top:5,bottom:0}}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickFormatter={d=>d.slice(5)} interval={Math.floor(a.price_history.length/10)}/>
                  <YAxis stroke="#475569" fontSize={9}/>
                  <Bar dataKey="volume" fill="#475569" radius={[2,2,0,0]}>{a.price_history.map((entry,idx)=>{const prev=idx>0?a.price_history[idx-1].close:entry.close;return <Cell key={idx} fill={entry.close>=prev?'#22c55e40':'#ef444440'}/>;})}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {alpacaData?.connected && (
          <div style={{background:'#1e293b',borderRadius:16,padding:24,marginBottom:24}}>
            <h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>Trade with Alpaca {alpacaData.paper?'(Paper)':'(LIVE)'}</h3>
            {(() => { const pos = calcPositionSize(alert.trade.entry, alert.trade.stopLoss); const hasPosition = alpacaData.positions?.find(p=>p.symbol===a.ticker); return (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                  <div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#f59e0b',fontSize:11,margin:0}}>Shares</p><p style={{fontSize:28,fontWeight:700,color:'#f59e0b',margin:'4px 0'}}>{pos.shares}</p></div>
                  <div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#64748b',fontSize:11,margin:0}}>Cost</p><p style={{fontSize:20,fontWeight:700,margin:'4px 0'}}>${pos.totalValue.toLocaleString()}</p></div>
                  <div style={{background:'#0f172a',borderRadius:12,padding:16,textAlign:'center'}}><p style={{color:'#ef4444',fontSize:11,margin:0}}>Max Loss</p><p style={{fontSize:20,fontWeight:700,color:'#ef4444',margin:'4px 0'}}>${pos.totalRisk}</p></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {hasPosition ? (
                    <button onClick={()=>alpacaClose(a.ticker)} style={{background:'#ef4444',color:'white',border:'none',padding:'14px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:15,flex:1}}>Close {a.ticker} Position</button>
                  ) : (
                    <>
                      <button onClick={()=>{if(window.confirm(`Buy ${pos.shares} shares of ${a.ticker} at market price?`))alpacaBuy(a.ticker,pos.shares);}} style={{background:'#22c55e',color:'white',border:'none',padding:'14px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:15,flex:1}}>BUY {pos.shares} shares</button>
                      <button onClick={()=>{if(window.confirm(`Buy 1 share of ${a.ticker}?`))alpacaBuy(a.ticker,1);}} style={{background:'#334155',color:'#22c55e',border:'1px solid #22c55e',padding:'14px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13}}>Buy 1</button>
                    </>
                  )}
                </div>
                {hasPosition && <p style={{color:'#22c55e',fontSize:12,marginTop:8}}>Currently holding {hasPosition.qty} shares at ${hasPosition.entry_price} (P&L: {hasPosition.pnl>=0?'+':''}${hasPosition.pnl})</p>}
              </div>
            );})()}
          </div>
        )}
        <div style={{background:'#1e293b',borderRadius:16,padding:24}}><h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:600}}>EMA Structure</h3><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>{[{l:'Price',v:a.price,c:'#f1f5f9'},{l:'EMA10',v:a.ema10,c:'#3b82f6'},{l:'EMA20',v:a.ema20,c:'#eab308'},{l:'EMA50',v:a.ema50,c:'#ef4444'}].map(e=>(<div key={e.l} style={{background:'#0f172a',borderRadius:12,padding:16,borderLeft:`4px solid ${e.c}`}}><p style={{color:'#64748b',fontSize:12,margin:0}}>{e.l}</p><p style={{fontSize:20,fontWeight:700,color:e.c,margin:'4px 0'}}>${e.v?.toFixed(2)}</p></div>))}</div></div>
      </main>
    </div>); }
    return (
    <div style={{background:'#0f172a',minHeight:'100vh',color:'#e2e8f0'}}>
      <header style={{background:'#1e293b',padding:'16px 24px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:28}}>🔬</span><div><h1 style={{margin:0,fontSize:22,fontWeight:700}}>SwingLab</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Swing Trading Analysis</p></div></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}><input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Search ticker..." style={{background:'#334155',color:'white',border:'1px solid #475569',padding:'8px 12px',borderRadius:8,fontSize:13,width:140,outline:'none'}}/><button onClick={handleSearch} disabled={searching} style={{background:'#8b5cf6',color:'white',border:'none',padding:'8px 12px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:13}}>{searching?'...':'🔍'}</button></div>
        <div style={{display:'flex',gap:8}}>{['dashboard','poc','scanner','trader'].map(v=>(<button key={v} onClick={()=>{setView(v);setSelectedSector(null);}} style={{background:view===v?'#3b82f6':'#334155',color:'white',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:13}}>{v==='dashboard'?'Dashboard':v==='poc'?'POC Scanner':v==='scanner'?'Scanner':'AutoTrader'}</button>))}</div>
      </header>

      <main style={{padding:24,maxWidth:1200,margin:'0 auto'}}>

        {view==='dashboard'&&(<>
          {eliteAlerts.length>0&&(<div style={{background:'linear-gradient(135deg,#f59e0b20,#ef444420)',border:'2px solid #f59e0b',borderRadius:16,padding:20,marginBottom:24}}><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}><span style={{fontSize:24}}>🔥🔥🔥</span><h3 style={{margin:0,fontSize:18,fontWeight:700,color:'#f59e0b'}}>ELITE SETUP!</h3></div><div style={{display:'flex',gap:16,flexWrap:'wrap'}}>{eliteAlerts.map(a=>(<span key={a.ticker} style={{background:'#f59e0b30',color:'#f59e0b',padding:'6px 16px',borderRadius:20,fontWeight:700}}>{a.ticker} ({a.alert.confluence}/10)</span>))}</div></div>)}
          {eliteAlerts.length===0&&strongAlerts.length>0&&(<div style={{background:'#22c55e10',border:'1px solid #22c55e40',borderRadius:16,padding:20,marginBottom:24}}><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:20}}>🔥🔥</span><h3 style={{margin:0,fontSize:16,fontWeight:700,color:'#22c55e'}}>{strongAlerts.length} Strong Buy Signals</h3><div style={{display:'flex',gap:8}}>{strongAlerts.slice(0,5).map(a=>(<span key={a.ticker} style={{background:'#22c55e20',color:'#22c55e',padding:'2px 10px',borderRadius:12,fontSize:12,fontWeight:700}}>{a.ticker}</span>))}</div></div></div>)}
          {bottomStocks.length>0&&(<div style={{background:'#f9731610',border:'1px solid #f9731640',borderRadius:12,padding:16,marginBottom:16}}><span style={{color:'#f97316',fontWeight:700}}>🔴 {bottomStocks.length} stocks showing bottom signals</span><span style={{color:'#94a3b8',fontSize:12,marginLeft:12}}>{bottomStocks.slice(0,5).map(a=>a.ticker).join(', ')}</span></div>)}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
            <div style={{background:'#1e293b',borderRadius:12,padding:20,borderLeft:'4px solid #3b82f6'}}><p style={{color:'#64748b',fontSize:13,margin:0}}>Sectors</p><p style={{fontSize:28,fontWeight:700,margin:'8px 0 0'}}>{sectors.length}</p></div>
            <div style={{background:'#1e293b',borderRadius:12,padding:20,borderLeft:'4px solid #22c55e'}}><p style={{color:'#64748b',fontSize:13,margin:0}}>Stocks</p><p style={{fontSize:28,fontWeight:700,margin:'8px 0 0'}}>{assets.length}</p></div>
            <div style={{background:'#1e293b',borderRadius:12,padding:20,borderLeft:'4px solid #f59e0b'}}><p style={{color:'#64748b',fontSize:13,margin:0}}>Alerts</p><p style={{fontSize:28,fontWeight:700,margin:'8px 0 0',color:'#f59e0b'}}>{smartAlerts.length}</p></div>
            <div style={{background:'#1e293b',borderRadius:12,padding:20,borderLeft:'4px solid #eab308'}}><p style={{color:'#64748b',fontSize:13,margin:0}}>Top Score</p><p style={{fontSize:28,fontWeight:700,margin:'8px 0 0',color:'#22c55e'}}>{smartAlerts[0]?.alert.confluence||'-'}/10</p></div>
            <div style={{background:'#1e293b',borderRadius:12,padding:20,borderLeft:'4px solid #8b5cf6'}}><p style={{color:'#64748b',fontSize:13,margin:0}}>Best</p><p style={{fontSize:20,fontWeight:700,margin:'8px 0 0'}}>{smartAlerts[0]?.ticker||'-'}</p></div>
          </div>
          <div style={{background:'#1e293b',borderRadius:8,padding:'10px 16px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}><span style={{color:'#64748b',fontSize:12}}>Last refresh: <strong style={{color:'#f1f5f9'}}>{sectors[0]?.updated_at?new Date(sectors[0].updated_at).toLocaleString():'Never'}</strong></span><div style={{display:'flex',gap:8}}><button onClick={fetchData} style={{background:'#334155',color:'#94a3b8',border:'none',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:11}}>Refresh UI</button><button onClick={async()=>{if(!window.confirm('Refresh data from API? Uses ~180 API calls'))return;try{await fetch(`${API}/api/data/refresh/sectors`,{method:'POST'});await fetch(`${API}/api/data/refresh/stocks`,{method:'POST'});await fetchData();alert('Refresh completed!');}catch(e){alert('Refresh failed');}}} style={{background:'#3b82f6',color:'white',border:'none',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600}}>Refresh Data</button></div></div>
        {/* Sector Performance Chart */}
          <div style={{background:'#1e293b',borderRadius:12,padding:20,marginBottom:24}}>
            <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:600}}>Sector Performance & Breadth</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={sectors.map(s => {
                const sa = assets.filter(a => a.sector_code === s.code);
                const total = sa.length || 1;
                const aboveEma50 = sa.filter(a => a.price > a.ema50).length;
                const breadth = Math.round((aboveEma50 / total) * 100);
                const avgRsi = Math.round(sa.reduce((sum, a) => sum + (a.rsi || 50), 0) / total);
                return { name: s.code, return20d: s.return_20d || 0, breadth, avgRsi, score: s.composite_score || 0 };
              }).sort((a, b) => b.return20d - a.return20d)} layout="vertical" margin={{left:10, right:20}}>
                <XAxis type="number" stroke="#475569" fontSize={10} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={45} />
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#e2e8f0',fontSize:12}} formatter={(value, name) => {
                  if (name === 'return20d') return [`${value.toFixed(2)}%`, 'Return 20d'];
                  if (name === 'breadth') return [`${value}%`, 'Breadth (>EMA50)'];
                  return [value, name];
                }} />
                <Bar dataKey="return20d" radius={[0, 6, 6, 0]} barSize={14}>
                  {sectors.map((s, i) => <Cell key={i} fill={s.return_20d >= 0 ? '#22c55e' : '#ef4444'} />)}
                </Bar>
                <Bar dataKey="breadth" radius={[0, 4, 4, 0]} barSize={10} opacity={0.5}>
                  {sectors.map((s, i) => {
                    const sa = assets.filter(a => a.sector_code === s.code);
                    const b = sa.length > 0 ? (sa.filter(a => a.price > a.ema50).length / sa.length * 100) : 50;
                    return <Cell key={i} fill={b > 60 ? '#3b82f680' : b > 40 ? '#eab30880' : '#ef444480'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:8,fontSize:10}}>
              <span><span style={{color:'#22c55e'}}>■</span> Return 20d (green=positive)</span>
              <span><span style={{color:'#3b82f6'}}>■</span> Breadth % above EMA50</span>
            </div>
          </div>

          {/* Sector Breadth Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,marginBottom:24}}>
            {sectors.map(s => {
              const sa = assets.filter(a => a.sector_code === s.code);
              const total = sa.length || 1;
              const aboveEma50 = sa.filter(a => a.price > a.ema50).length;
              const breadth = Math.round((aboveEma50 / total) * 100);
              const bullish = sa.filter(a => a.setup_score >= 50).length;
              const bearish = sa.filter(a => a.rsi > 70).length;
              const bottoming = sa.filter(a => a.rsi < 35).length;
              return (
                <div key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}} style={{background:'#1e293b',borderRadius:10,padding:12,cursor:'pointer',border:'1px solid #334155'}} onMouseOver={e=>e.currentTarget.style.borderColor='#3b82f6'} onMouseOut={e=>e.currentTarget.style.borderColor='#334155'}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontWeight:700,fontSize:13}}>{s.code}</span>
                    <span style={{color:s.return_20d>=0?'#22c55e':'#ef4444',fontSize:12,fontWeight:600}}>{s.return_20d>=0?'+':''}{s.return_20d?.toFixed(1)}%</span>
                  </div>
                  <div style={{background:'#334155',borderRadius:4,height:6,marginBottom:6,overflow:'hidden'}}>
                    <div style={{width:`${breadth}%`,height:'100%',borderRadius:4,background:breadth>60?'#22c55e':breadth>40?'#eab308':'#ef4444'}} />
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#64748b'}}>
                    <span>Breadth {breadth}%</span>
                    <span style={{color:'#22c55e'}}>{bullish}🟢</span>
                    <span style={{color:'#ef4444'}}>{bearish}🔴</span>
                    {bottoming > 0 && <span style={{color:'#f97316'}}>{bottoming}⚠️</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Sectors</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:32}}>{sectors.map(s=>(<div key={s.code} onClick={()=>{setSelectedSector(s.code);setView('scanner');}} style={{background:'#1e293b',borderRadius:12,padding:16,cursor:'pointer',border:'1px solid #334155'}} onMouseOver={e=>e.currentTarget.style.borderColor='#3b82f6'} onMouseOut={e=>e.currentTarget.style.borderColor='#334155'}><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,fontSize:14}}>{s.code}</span><span style={{color:getScoreColor(s.composite_score),fontWeight:700}}>{s.composite_score?.toFixed(1)}</span></div><p style={{fontSize:11,color:'#94a3b8',margin:'4px 0'}}>{s.name}</p><p style={{fontSize:18,fontWeight:600,margin:'4px 0'}}>${s.price?.toFixed(2)}</p><p style={{fontSize:12,color:s.return_20d>=0?'#22c55e':'#ef4444',margin:0}}>{s.return_20d>=0?'+':''}{s.return_20d?.toFixed(2)}%</p></div>))}</div>
          </>)}

        {view==='poc'&&(()=>{const pocStocks=[...assets].filter(a=>a.poc_price&&a.price).map(a=>({...a,poc_distance:Math.abs(((a.price-a.poc_price)/a.price)*100),poc_position:a.price>=a.poc_price?'above':'below'})).sort((a,b)=>a.poc_distance-b.poc_distance);const atPoc=pocStocks.filter(a=>a.poc_distance<=1);const nearPoc=pocStocks.filter(a=>a.poc_distance<=3);return(<><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,flexWrap:'wrap',gap:8}}><div><h2 style={{fontSize:20,fontWeight:700,margin:0}}>POC Scanner</h2><p style={{color:'#94a3b8',margin:'4px 0 0',fontSize:14}}>Stocks closest to Point of Control</p></div><div style={{display:'flex',gap:12}}><div style={{background:'#8b5cf620',borderRadius:8,padding:'8px 16px',textAlign:'center'}}><p style={{color:'#8b5cf6',fontSize:22,fontWeight:700,margin:0}}>{atPoc.length}</p><p style={{color:'#94a3b8',fontSize:11,margin:0}}>AT POC</p></div><div style={{background:'#3b82f620',borderRadius:8,padding:'8px 16px',textAlign:'center'}}><p style={{color:'#3b82f6',fontSize:22,fontWeight:700,margin:0}}>{nearPoc.length}</p><p style={{color:'#94a3b8',fontSize:11,margin:0}}>NEAR POC</p></div></div></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(350px,1fr))',gap:16,marginTop:20}}>{pocStocks.slice(0,20).map(a=>{const al=getSmartAlert(a);const dist=a.vp_distribution||[];return(<div key={a.ticker} onClick={()=>setSelectedStock(a)} style={{background:'#1e293b',borderRadius:16,padding:20,cursor:'pointer',border:a.poc_distance<=1?'2px solid #8b5cf6':a.poc_distance<=3?'1px solid #3b82f6':'1px solid #334155',transition:'all 0.2s'}} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18,fontWeight:700}}>{a.ticker}</span><span style={{color:'#94a3b8',fontSize:12}}>{a.sector_code}</span>{a.poc_distance<=1&&<span style={{background:'#8b5cf620',color:'#8b5cf6',padding:'2px 8px',borderRadius:12,fontSize:10,fontWeight:700}}>AT POC</span>}</div><span style={{background:al.bg,color:al.color,padding:'4px 10px',borderRadius:16,fontSize:12,fontWeight:700}}>{al.icon} {al.level}</span></div><div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><div><p style={{fontSize:24,fontWeight:700,margin:0}}>${a.price?.toFixed(2)}</p><p style={{color:a.change_pct>=0?'#22c55e':'#ef4444',fontSize:13,margin:'2px 0 0',fontWeight:600}}>{a.change_pct>=0?'+':''}{a.change_pct?.toFixed(2)}%</p></div><div style={{textAlign:'right'}}><p style={{color:'#8b5cf6',fontSize:12,margin:0}}>POC</p><p style={{color:'#8b5cf6',fontSize:20,fontWeight:700,margin:0}}>${a.poc_price?.toFixed(2)}</p><p style={{color:a.poc_distance<=1?'#8b5cf6':'#94a3b8',fontSize:12,margin:0,fontWeight:600}}>{a.poc_distance?.toFixed(2)}% {a.poc_position}</p></div></div>{dist.length>0&&(<div style={{marginBottom:12}}><div style={{display:'flex',flexDirection:'column',gap:1}}>{dist.map((d,idx)=>(<div key={idx} style={{display:'flex',alignItems:'center',gap:4,height:7}}><span style={{fontSize:7,color:'#64748b',width:40,textAlign:'right'}}>{d.price}</span><div style={{flex:1,height:'100%',background:'#0f172a',borderRadius:2,overflow:'hidden'}}><div style={{width:`${d.volume_pct}%`,height:'100%',borderRadius:2,background:d.is_poc?'#8b5cf6':d.in_value_area?'#3b82f680':'#475569'}}/></div></div>))}</div></div>)}<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{getSetupBadge(a.setup_type)}<span style={{background:'#64748b20',color:'#94a3b8',padding:'2px 8px',borderRadius:12,fontSize:10}}>Score {a.setup_score}</span><span style={{background:al.bg,color:al.color,padding:'2px 8px',borderRadius:12,fontSize:10}}>{al.confluence}/10</span></div></div>);})}</div></>);})()}

        {view==='scanner'&&(<><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}><h2 style={{fontSize:18,fontWeight:600,margin:0}}>{selectedSector?`${selectedSector} Stocks`:'All Stocks'}</h2>{selectedSector&&<button onClick={()=>setSelectedSector(null)} style={{background:'#334155',color:'white',border:'none',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:12}}>Clear</button>}</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>{sectors.map(s=>(<button key={s.code} onClick={()=>setSelectedSector(s.code)} style={{background:selectedSector===s.code?'#3b82f6':'#334155',color:'white',border:'none',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:12}}>{s.code}</button>))}</div><div style={{background:'#1e293b',borderRadius:12,overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{borderBottom:'1px solid #334155'}}>{['Ticker','Price','Chg%','Signal','Score','Setup','RSI','POC','Wyckoff','Accum'].map(h=>(<th key={h} style={{padding:'10px 12px',textAlign:'left',color:'#64748b',fontSize:11,fontWeight:600}}>{h}</th>))}</tr></thead><tbody>{[...filteredAssets].sort((a,b)=>b.setup_score-a.setup_score).map((a,i)=>{const al=getSmartAlert(a);return(<tr key={a.ticker} onClick={()=>setSelectedStock(a)} style={{borderBottom:'1px solid #1e293b',background:i%2===0?'#1e293b':'#162032',cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.background='#253048'} onMouseOut={e=>e.currentTarget.style.background=i%2===0?'#1e293b':'#162032'}><td style={{padding:'10px 12px',fontWeight:700,color:'#f1f5f9'}}>{a.ticker}</td><td style={{padding:'10px 12px'}}>${a.price?.toFixed(2)}</td><td style={{padding:'10px 12px',color:a.change_pct>=0?'#22c55e':'#ef4444'}}>{a.change_pct>=0?'+':''}{a.change_pct?.toFixed(2)}%</td><td style={{padding:'10px 12px'}}><span style={{background:al.bg,color:al.color,padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:600}}>{al.icon} {al.level}</span></td><td style={{padding:'10px 12px'}}><span style={{color:getScoreColor(a.setup_score),fontWeight:700}}>{a.setup_score}</span></td><td style={{padding:'10px 12px'}}>{getSetupBadge(a.setup_type)}</td><td style={{padding:'10px 12px',color:a.rsi>70?'#ef4444':a.rsi<30?'#22c55e':'#e2e8f0'}}>{a.rsi?.toFixed(1)}</td><td style={{padding:'10px 12px',color:'#8b5cf6',fontSize:12}}>{a.poc_price?`$${a.poc_price}`:'-'}</td><td style={{padding:'10px 12px',fontSize:11}}>{(()=>{const w=a.wyckoff?.phase||'-';const c={accumulation:'#22c55e',markup:'#4ade80',distribution:'#ef4444',markdown:'#ef4444',spring:'#f59e0b',selling_climax:'#f97316'};return<span style={{color:c[w]||'#64748b'}}>{w}</span>;})()}</td><td style={{padding:'10px 12px'}}>{(()=>{const acc=a.accumulation?.score||0;return<span style={{color:acc>=70?'#22c55e':acc>=40?'#eab308':'#64748b',fontWeight:acc>=40?700:400}}>{acc}</span>;})()}</td></tr>);})}</tbody></table></div></>)}

        {view==='trader'&&(<>
          <div style={{background:'#1e293b',borderRadius:16,padding:20,marginBottom:24,borderLeft:'4px solid #f59e0b'}}>
            <h3 style={{margin:'0 0 8px',fontSize:16,fontWeight:600}}>Alpaca Trading {alpacaData?.paper?'(Paper Mode)':'(LIVE)'}</h3>
            <p style={{margin:0,fontSize:13,color:'#94a3b8'}}>Real broker connected. {alpacaData?.paper?'Paper trading — no real money at risk.':'⚠️ LIVE trading — real money!'}</p>
          </div>

          {!alpacaData?.connected ? (
            <div style={{background:'#1e293b',borderRadius:12,padding:40,textAlign:'center'}}>
              <p style={{fontSize:48}}>🔌</p>
              <p style={{fontSize:18,color:'#94a3b8'}}>Connecting to Alpaca...</p>
              <button onClick={fetchAlpaca} style={{background:'#3b82f6',color:'white',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer',fontWeight:700,marginTop:16}}>Retry</button>
            </div>
          ) : (<>
            {/* KPI */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:24}}>
              <div style={{background:'#1e293b',borderRadius:12,padding:16,borderLeft:'4px solid #3b82f6'}}><p style={{color:'#64748b',fontSize:11,margin:0}}>Equity</p><p style={{fontSize:22,fontWeight:700,margin:'4px 0'}}>${alpacaData.equity?.toLocaleString()}</p></div>
              <div style={{background:'#1e293b',borderRadius:12,padding:16,borderLeft:'4px solid #22c55e'}}><p style={{color:'#64748b',fontSize:11,margin:0}}>Cash</p><p style={{fontSize:22,fontWeight:700,margin:'4px 0'}}>${alpacaData.cash?.toLocaleString()}</p></div>
              <div style={{background:'#1e293b',borderRadius:12,padding:16,borderLeft:`4px solid ${alpacaData.daily_pnl>=0?'#22c55e':'#ef4444'}`}}><p style={{color:'#64748b',fontSize:11,margin:0}}>Daily P&L</p><p style={{fontSize:22,fontWeight:700,color:alpacaData.daily_pnl>=0?'#22c55e':'#ef4444',margin:'4px 0'}}>{alpacaData.daily_pnl>=0?'+':''}${alpacaData.daily_pnl?.toFixed(2)}</p></div>
              <div style={{background:'#1e293b',borderRadius:12,padding:16,borderLeft:'4px solid #eab308'}}><p style={{color:'#64748b',fontSize:11,margin:0}}>Buying Power</p><p style={{fontSize:22,fontWeight:700,margin:'4px 0'}}>${alpacaData.buying_power?.toLocaleString()}</p></div>
              <div style={{background:'#1e293b',borderRadius:12,padding:16,borderLeft:'4px solid #8b5cf6'}}><p style={{color:'#64748b',fontSize:11,margin:0}}>Positions</p><p style={{fontSize:22,fontWeight:700,margin:'4px 0'}}>{alpacaData.positions?.length||0}</p></div>
            </div>

            {/* Risk Settings */}
            <div style={{background:'#1e293b',borderRadius:12,padding:20,marginBottom:24}}><h3 style={{margin:'0 0 12px',fontSize:15,fontWeight:600}}>Risk Settings</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}><div><p style={{color:'#64748b',fontSize:12,margin:'0 0 8px'}}>Capital ($)</p><input type="number" value={capital} onChange={e=>saveCapital(parseFloat(e.target.value)||0)} style={{background:'#334155',color:'white',border:'1px solid #475569',padding:'10px',borderRadius:8,fontSize:16,width:'100%',outline:'none',fontWeight:700}}/></div><div><p style={{color:'#64748b',fontSize:12,margin:'0 0 8px'}}>Risk Per Trade (%)</p><div style={{display:'flex',gap:6}}>{[1,1.5,2,3,5].map(v=>(<button key={v} onClick={()=>saveRiskPct(v)} style={{background:riskPct===v?'#f59e0b':'#334155',color:'white',border:'none',padding:'10px 14px',borderRadius:8,cursor:'pointer',fontWeight:700,flex:1}}>{v}%</button>))}</div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><div style={{background:'#0f172a',borderRadius:8,padding:12,textAlign:'center'}}><p style={{color:'#f59e0b',fontSize:10,margin:0}}>Max Risk/Trade</p><p style={{fontSize:18,fontWeight:700,color:'#f59e0b',margin:'4px 0'}}>${maxRiskPerTrade.toFixed(0)}</p></div><div style={{background:'#0f172a',borderRadius:8,padding:12,textAlign:'center'}}><p style={{color:parseFloat(riskUsedPct)>10?'#ef4444':'#22c55e',fontSize:10,margin:0}}>Risk Used</p><p style={{fontSize:18,fontWeight:700,color:parseFloat(riskUsedPct)>10?'#ef4444':'#22c55e',margin:'4px 0'}}>{riskUsedPct}%</p></div></div></div></div>

            {/* Equity Chart */}
            {alpacaData.equity_history&&alpacaData.equity_history.length>1&&(
              <div style={{background:'#1e293b',borderRadius:12,padding:20,marginBottom:24}}>
                <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:600}}>Portfolio Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={alpacaData.equity_history} margin={{left:10,right:10,top:10,bottom:0}}>
                    <defs><linearGradient id="alpEq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={alpacaData.daily_pnl>=0?'#22c55e':'#ef4444'} stopOpacity={0.3}/><stop offset="95%" stopColor={alpacaData.daily_pnl>=0?'#22c55e':'#ef4444'} stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickFormatter={d=>d.slice(5)}/>
                    <YAxis stroke="#475569" fontSize={10} domain={['auto','auto']}/>
                    <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#e2e8f0'}} formatter={v=>[`$${v.toLocaleString()}`,'Equity']}/>
                    <Area type="monotone" dataKey="equity" stroke={alpacaData.daily_pnl>=0?'#22c55e':'#ef4444'} strokeWidth={2} fill="url(#alpEq)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Positions */}
            {alpacaData.positions&&alpacaData.positions.length>0&&(
              <div style={{marginBottom:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <h3 style={{fontSize:16,fontWeight:600,margin:0}}>Open Positions</h3>
                  <button onClick={alpacaCloseAll} style={{background:'#ef444420',color:'#ef4444',border:'1px solid #ef4444',padding:'6px 16px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:12}}>Close All</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12}}>
                  {alpacaData.positions.map((p,i)=>(
                    <div key={i} style={{background:'#1e293b',borderRadius:12,padding:16,border:p.pnl>=0?'1px solid #22c55e40':'1px solid #ef444440'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                        <span style={{fontSize:20,fontWeight:700,cursor:'pointer'}} onClick={()=>{const asset=assets.find(a=>a.ticker===p.symbol);if(asset)setSelectedStock(asset);}}>{p.symbol}</span>
                        <button onClick={()=>alpacaClose(p.symbol)} style={{background:'#ef444420',color:'#ef4444',border:'none',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600}}>Close</button>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,fontSize:12}}>
                        <div><span style={{color:'#64748b'}}>Entry</span><br/><span style={{fontWeight:600}}>${p.entry_price}</span></div>
                        <div><span style={{color:'#64748b'}}>Current</span><br/><span style={{fontWeight:600,color:p.current_price>=p.entry_price?'#22c55e':'#ef4444'}}>${p.current_price}</span></div>
                        <div><span style={{color:'#64748b'}}>Qty</span><br/><span style={{fontWeight:600}}>{p.qty}</span></div>
                        <div><span style={{color:'#64748b'}}>Value</span><br/><span style={{fontWeight:600}}>${p.market_value?.toLocaleString()}</span></div>
                        <div><span style={{color:'#64748b'}}>P&L</span><br/><span style={{fontWeight:700,color:p.pnl>=0?'#22c55e':'#ef4444'}}>{p.pnl>=0?'+':''}${p.pnl?.toFixed(2)}</span></div>
                        <div><span style={{color:'#64748b'}}>P&L %</span><br/><span style={{fontWeight:700,color:p.pnl_pct>=0?'#22c55e':'#ef4444'}}>{p.pnl_pct>=0?'+':''}{p.pnl_pct?.toFixed(2)}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            {alpacaData.orders&&alpacaData.orders.length>0&&(
              <div style={{marginBottom:24}}>
                <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Recent Orders</h3>
                <div style={{background:'#1e293b',borderRadius:12,overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Symbol','Side','Qty','Type','Price','Status','Time'].map(h=>(<th key={h} style={{padding:'10px 12px',textAlign:'left',color:'#64748b',fontSize:11,fontWeight:600}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {alpacaData.orders.map((o,i)=>(
                        <tr key={i} style={{borderBottom:'1px solid #1e293b',background:i%2===0?'#1e293b':'#162032'}}>
                          <td style={{padding:'10px 12px',fontWeight:700}}>{o.symbol}</td>
                          <td style={{padding:'10px 12px',color:o.side==='buy'?'#22c55e':'#ef4444',fontWeight:600}}>{o.side?.toUpperCase()}</td>
                          <td style={{padding:'10px 12px'}}>{o.qty}</td>
                          <td style={{padding:'10px 12px',fontSize:11}}>{o.type}</td>
                          <td style={{padding:'10px 12px'}}>{o.filled_avg_price?`$${o.filled_avg_price}`:'-'}</td>
                          <td style={{padding:'10px 12px'}}><span style={{background:o.status==='filled'?'#22c55e20':o.status==='canceled'?'#ef444420':'#eab30820',color:o.status==='filled'?'#22c55e':o.status==='canceled'?'#ef4444':'#eab308',padding:'2px 8px',borderRadius:12,fontSize:10,fontWeight:600}}>{o.status}</span></td>
                          <td style={{padding:'10px 12px',fontSize:10,color:'#94a3b8'}}>{o.created_at?.slice(0,16)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Controls */}
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <button onClick={fetchAlpaca} style={{background:'#3b82f6',color:'white',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer',fontWeight:700}}>Refresh Portfolio</button>
              <button onClick={runTrader} disabled={traderLoading} style={{background:'#f59e0b',color:'#0f172a',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer',fontWeight:700,opacity:traderLoading?0.5:1}}>{traderLoading?'Running...':'Run AI Trader'}</button>
            </div>
          </>)}
        </>)}

      </main>
      <footer style={{textAlign:'center',padding:24,color:'#475569',fontSize:12,borderTop:'1px solid #1e293b'}}>SwingLab v1.0 - Consolidated</footer>
    </div>
  );
}

export default App;
