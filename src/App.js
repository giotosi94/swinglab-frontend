import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const r = await fetch(`${API}/api/data/search/${searchQuery.trim().toUpperCase()}`);
      const data = await r.json();
      if (data.error) { alert(data.error); }
      else { setSelectedStock(data); }
    } catch (e) { alert('Search failed'); }
    setSearching(false);
    setSearchQuery('');
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [secRes, assRes] = await Promise.all([
        fetch(`${API}/api/sectors`),
        fetch(`${API}/api/assets?limit=200`)
      ]);
      setSectors(await secRes.json());
      setAssets(await assRes.json());
    } catch (e) { console.error('Fetch error:', e); }
    setLoading(false);
  };

  const topSetups = [...assets].sort((a, b) => b.setup_score - a.setup_score).slice(0, 15);
  const filteredAssets = selectedSector ? assets.filter(a => a.sector_code === selectedSector) : assets;

  const getScoreColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };

  const getSetupBadge = (type) => {
    const map = {
      breakout: { bg: '#22c55e20', color: '#22c55e', label: 'Breakout' },
      pullback_to_poc: { bg: '#3b82f620', color: '#3b82f6', label: 'POC Pullback' },
      ema_bounce: { bg: '#8b5cf620', color: '#8b5cf6', label: 'EMA Bounce' },
      oversold_reversal: { bg: '#06b6d420', color: '#06b6d4', label: 'Reversal' },
      overbought_warning: { bg: '#ef444420', color: '#ef4444', label: 'Overbought' },
      neutral: { bg: '#64748b20', color: '#94a3b8', label: 'Neutral' },
    };
    const s = map[type] || map.neutral;
    return <span style={{background:s.bg, color:s.color, padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600}}>{s.label}</span>;
  };

  // ============================================
  // SMART ALERT ENGINE - Multi-Confluence
  // ============================================
  const getSmartAlert = (asset) => {
    const factors = [];
    let confluence = 0;

    // 1. POC Proximity (+2)
    if (asset.poc_price && asset.price) {
      const pocDist = Math.abs((asset.price - asset.poc_price) / asset.price * 100);
      if (pocDist <= 2) { confluence += 2; factors.push({ name: 'POC Proximity', score: 2, max: 2, detail: `${pocDist.toFixed(1)}% from POC`, pass: true }); }
      else { factors.push({ name: 'POC Proximity', score: 0, max: 2, detail: `${pocDist.toFixed(1)}% from POC`, pass: false }); }
    }

    // 2. Bullish Candlestick (+1.5)
    const bullishPatterns = (asset.candlestick_patterns || []).filter(p => p.type === 'bullish');
    if (bullishPatterns.length > 0) { confluence += 1.5; factors.push({ name: 'Bullish Pattern', score: 1.5, max: 1.5, detail: bullishPatterns.map(p => p.name).join(', '), pass: true }); }
    else { factors.push({ name: 'Bullish Pattern', score: 0, max: 1.5, detail: 'None detected', pass: false }); }

    // 3. RSI Sweet Spot (+1)
    if (asset.rsi >= 40 && asset.rsi <= 60) { confluence += 1; factors.push({ name: 'RSI Sweet Spot', score: 1, max: 1, detail: `RSI ${asset.rsi?.toFixed(1)} (40-60 zone)`, pass: true }); }
    else { factors.push({ name: 'RSI Sweet Spot', score: 0, max: 1, detail: `RSI ${asset.rsi?.toFixed(1)}`, pass: false }); }

    // 4. MACD Bullish (+1)
    if (asset.macd?.histogram > 0) { confluence += 1; factors.push({ name: 'MACD Bullish', score: 1, max: 1, detail: `Histogram +${asset.macd.histogram.toFixed(4)}`, pass: true }); }
    else { factors.push({ name: 'MACD Bullish', score: 0, max: 1, detail: `Histogram ${asset.macd?.histogram?.toFixed(4)}`, pass: false }); }

    // 5. EMA Uptrend (+1.5)
    if (asset.price > asset.ema10 && asset.ema10 > asset.ema20 && asset.ema20 > asset.ema50) { confluence += 1.5; factors.push({ name: 'EMA Uptrend', score: 1.5, max: 1.5, detail: 'P > EMA10 > EMA20 > EMA50', pass: true }); }
    else if (asset.price > asset.ema20 && asset.ema20 > asset.ema50) { confluence += 0.75; factors.push({ name: 'EMA Uptrend', score: 0.75, max: 1.5, detail: 'P > EMA20 > EMA50', pass: true }); }
    else { factors.push({ name: 'EMA Uptrend', score: 0, max: 1.5, detail: 'No uptrend alignment', pass: false }); }

    // 6. High Volume (+1)
    if (asset.relative_volume >= 1.5) { confluence += 1; factors.push({ name: 'High Volume', score: 1, max: 1, detail: `${asset.relative_volume?.toFixed(2)}x avg`, pass: true }); }
    else { factors.push({ name: 'High Volume', score: 0, max: 1, detail: `${asset.relative_volume?.toFixed(2)}x avg`, pass: false }); }

    // 7. Strong Sector (+1)
    const sectorData = sectors.find(s => s.code === asset.sector_code);
    const sectorRank = sectors.indexOf(sectorData) + 1;
    if (sectorRank <= 5) { confluence += 1; factors.push({ name: 'Strong Sector', score: 1, max: 1, detail: `${asset.sector_code} rank #${sectorRank}`, pass: true }); }
    else { factors.push({ name: 'Strong Sector', score: 0, max: 1, detail: `${asset.sector_code} rank #${sectorRank}`, pass: false }); }

    // 8. Near 52W High (+0.5)
    if (asset.pct_from_high && asset.pct_from_high >= -10) { confluence += 0.5; factors.push({ name: 'Near 52W High', score: 0.5, max: 0.5, detail: `${asset.pct_from_high?.toFixed(1)}% from high`, pass: true }); }
    else { factors.push({ name: 'Near 52W High', score: 0, max: 0.5, detail: `${asset.pct_from_high?.toFixed(1)}% from high`, pass: false }); }

    // 9. Positive Momentum (+0.5)
    if (asset.change_pct > 0 && asset.change_pct <= 5) { confluence += 0.5; factors.push({ name: 'Positive Momentum', score: 0.5, max: 0.5, detail: `+${asset.change_pct?.toFixed(2)}%`, pass: true }); }
    else { factors.push({ name: 'Positive Momentum', score: 0, max: 0.5, detail: `${asset.change_pct?.toFixed(2)}%`, pass: false }); }

    // Bearish override
    const bearishPatterns = (asset.candlestick_patterns || []).filter(p => p.type === 'bearish' && p.strength === 'strong');
    if (bearishPatterns.length > 0) confluence = Math.max(0, confluence - 2);
    if (asset.rsi > 75) confluence = Math.max(0, confluence - 1.5);

    // Calculate trade levels
    const entry = asset.price;
    const stopLoss = asset.value_area_low || (asset.poc_price ? asset.poc_price * 0.97 : entry * 0.95);
    const target1 = asset.value_area_high || entry * 1.05;
    const target2 = entry + (entry - stopLoss) * 2;
    const riskPerShare = Math.abs(entry - stopLoss);
    const rewardPerShare = Math.abs(target1 - entry);
    const riskReward = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : 0;

    // Conviction level
    let level, color, bg, icon;
    if (confluence >= 8) { level = 'ELITE SETUP'; color = '#f59e0b'; bg = '#f59e0b20'; icon = '🔥🔥🔥'; }
    else if (confluence >= 6) { level = 'STRONG BUY'; color = '#22c55e'; bg = '#22c55e20'; icon = '🔥🔥'; }
    else if (confluence >= 4) { level = 'BUY'; color = '#4ade80'; bg = '#4ade8020'; icon = '🔥'; }
    else if (asset.setup_type === 'overbought_warning') { level = 'AVOID'; color = '#ef4444'; bg = '#ef444420'; icon = '🔴'; }
    else if (confluence >= 2.5) { level = 'WATCH'; color = '#eab308'; bg = '#eab30820'; icon = '👀'; }
    else { level = 'HOLD'; color = '#64748b'; bg = '#64748b20'; icon = '⚪'; }

    return {
      confluence: Math.round(confluence * 10) / 10,
      maxConfluence: 10,
      level, color, bg, icon, factors,
      trade: { entry: Math.round(entry * 100) / 100, stopLoss: Math.round(stopLoss * 100) / 100, target1: Math.round(target1 * 100) / 100, target2: Math.round(target2 * 100) / 100, riskReward, riskPerShare: Math.round(riskPerShare * 100) / 100, rewardPerShare: Math.round(rewardPerShare * 100) / 100 },
    };
  };
// ============================================
  // BOTTOM DETECTION ENGINE
  // ============================================
  const getBottomSignal = (asset) => {
    const factors = [];
    let score = 0;

    // 1. RSI Oversold (+3 or +2)
    if (asset.rsi <= 30) { score += 3; factors.push({ name: 'RSI Extreme Oversold', score: 3, detail: `RSI ${asset.rsi?.toFixed(1)} (< 30)`, pass: true }); }
    else if (asset.rsi <= 40) { score += 2; factors.push({ name: 'RSI Low Zone', score: 2, detail: `RSI ${asset.rsi?.toFixed(1)} (30-40)`, pass: true }); }
    else { factors.push({ name: 'RSI Oversold', score: 0, detail: `RSI ${asset.rsi?.toFixed(1)}`, pass: false }); }

    // 2. Near Value Area Low (+2)
    if (asset.value_area_low && asset.price) {
      const vaLowDist = ((asset.price - asset.value_area_low) / asset.price * 100);
      if (vaLowDist <= 2 && vaLowDist >= -5) { score += 2; factors.push({ name: 'Near VA Low', score: 2, detail: `${vaLowDist.toFixed(1)}% from VA Low $${asset.value_area_low}`, pass: true }); }
      else { factors.push({ name: 'Near VA Low', score: 0, detail: `${vaLowDist.toFixed(1)}% from VA Low`, pass: false }); }
    }

    // 3. Near 52W Low (+1.5)
    if (asset.low_52w && asset.price) {
      const lowDist = ((asset.price - asset.low_52w) / asset.low_52w * 100);
      if (lowDist <= 15) { score += 1.5; factors.push({ name: 'Near 52W Low', score: 1.5, detail: `${lowDist.toFixed(1)}% above 52W Low $${asset.low_52w}`, pass: true }); }
      else { factors.push({ name: 'Near 52W Low', score: 0, detail: `${lowDist.toFixed(1)}% above 52W Low`, pass: false }); }
    }

    // 4. Bullish Reversal Pattern (+2)
    const bullishReversals = (asset.candlestick_patterns || []).filter(p => p.type === 'bullish' && (p.name === 'Hammer' || p.name === 'Morning Star' || p.name === 'Bullish Engulfing'));
    if (bullishReversals.length > 0) { score += 2; factors.push({ name: 'Bullish Reversal', score: 2, detail: bullishReversals.map(p => p.name).join(', '), pass: true }); }
    else { factors.push({ name: 'Bullish Reversal', score: 0, detail: 'No reversal pattern', pass: false }); }

    // 5. Volume Spike (+1)
    if (asset.relative_volume >= 1.5) { score += 1; factors.push({ name: 'Volume Spike', score: 1, detail: `${asset.relative_volume?.toFixed(2)}x (capitulation?)`, pass: true }); }
    else { factors.push({ name: 'Volume Spike', score: 0, detail: `${asset.relative_volume?.toFixed(2)}x`, pass: false }); }

    // 6. MACD Turning (+1)
    if (asset.macd && asset.macd.histogram < 0 && asset.macd.histogram > asset.macd.signal * 0.5) { score += 1; factors.push({ name: 'MACD Turning', score: 1, detail: `Histogram ${asset.macd.histogram.toFixed(4)} (improving)`, pass: true }); }
    else if (asset.macd && asset.macd.histogram < 0) { factors.push({ name: 'MACD Turning', score: 0, detail: `Histogram ${asset.macd?.histogram?.toFixed(4)}`, pass: false }); }
    else { factors.push({ name: 'MACD Turning', score: 0, detail: 'MACD positive (no bottom)', pass: false }); }

    // 7. Below EMA50 (+0.5)
    if (asset.price < asset.ema50) { score += 0.5; factors.push({ name: 'Below EMA50', score: 0.5, detail: `Price $${asset.price?.toFixed(2)} < EMA50 $${asset.ema50?.toFixed(2)}`, pass: true }); }
    else { factors.push({ name: 'Below EMA50', score: 0, detail: 'Price above EMA50', pass: false }); }

    score = Math.round(score * 10) / 10;

    let level, color, bg, icon;
    if (score >= 7) { level = 'STRONG BOTTOM'; color = '#ef4444'; bg = '#ef444420'; icon = '🔴'; }
    else if (score >= 5) { level = 'POTENTIAL BOTTOM'; color = '#f97316'; bg = '#f9731620'; icon = '🟠'; }
    else if (score >= 3) { level = 'APPROACHING'; color = '#eab308'; bg = '#eab30820'; icon = '🟡'; }
    else { level = 'NO SIGNAL'; color = '#64748b'; bg = '#64748b20'; icon = '⚪'; }

    // Recovery targets
    const recoveryTarget1 = asset.poc_price || (asset.price * 1.05);
    const recoveryTarget2 = asset.value_area_high || (asset.price * 1.10);
    const stopLoss = asset.low_52w ? asset.low_52w * 0.97 : asset.price * 0.95;

    return { score, maxScore: 10, level, color, bg, icon, factors, trade: { entry: asset.price, stopLoss: Math.round(stopLoss * 100) / 100, target1: Math.round(recoveryTarget1 * 100) / 100, target2: Math.round(recoveryTarget2 * 100) / 100 } };
  };

  // Bottom stocks
  const bottomStocks = assets.map(a => ({ ...a, bottom: getBottomSignal(a) })).filter(a => a.bottom.score >= 3).sort((a, b) => b.bottom.score - a.bottom.score);

  // Bottom sectors
  const bottomSectors = sectors.map(s => {
    const sectorAssets = assets.filter(a => a.sector_code === s.code);
    const avgRsi = sectorAssets.length > 0 ? sectorAssets.reduce((sum, a) => sum + (a.rsi || 50), 0) / sectorAssets.length : 50;
    const bottomCount = sectorAssets.filter(a => getBottomSignal(a).score >= 3).length;
    let sectorBottomScore = 0;
    if (avgRsi < 35) sectorBottomScore += 3;
    else if (avgRsi < 45) sectorBottomScore += 1.5;
    if (s.strength_score < -5) sectorBottomScore += 2;
    if (s.rsi < 40) sectorBottomScore += 2;
    if (bottomCount >= 3) sectorBottomScore += 2;
    else if (bottomCount >= 1) sectorBottomScore += 1;
    return { ...s, avgRsi: Math.round(avgRsi * 10) / 10, bottomCount, sectorBottomScore: Math.round(sectorBottomScore * 10) / 10, totalStocks: sectorAssets.length };
  }).filter(s => s.sectorBottomScore >= 2).sort((a, b) => b.sectorBottomScore - a.sectorBottomScore);
  const sectorChartData = sectors.map(s => ({ name: s.code, score: s.composite_score, fill: getScoreColor(s.composite_score) }));
  const sectorHealthData = sectors.map(s => {
    const sectorAssets = assets.filter(a => a.sector_code === s.code);
    const total = sectorAssets.length || 1;
    const bottomCount = sectorAssets.filter(a => getBottomSignal(a).score >= 3).length;
    const bottomPct = Math.round((bottomCount / total) * 100);
    const avgRsi = Math.round(sectorAssets.reduce((sum, a) => sum + (a.rsi || 50), 0) / total);
    const weakCount = sectorAssets.filter(a => a.rsi < 40).length;
    const weakPct = Math.round((weakCount / total) * 100);
    const bearishMacdCount = sectorAssets.filter(a => a.macd && a.macd.histogram < 0).length;
    const bearishMacdPct = Math.round((bearishMacdCount / total) * 100);
    const bullishCount = sectorAssets.filter(a => a.setup_score >= 50).length;
    const bullishPct = Math.round((bullishCount / total) * 100);
    let health = 100;
    health -= bottomPct * 0.3;
    health -= (50 - Math.min(avgRsi, 50)) * 0.5;
    health -= weakPct * 0.15;
    health -= bearishMacdPct * 0.1;
    health += (s.strength_score || 0) * 0.5;
    health = Math.max(0, Math.min(100, Math.round(health)));
    let status, statusColor, statusBg, statusIcon;
    if (health < 30) { status = 'SECTOR BOTTOM'; statusColor = '#ef4444'; statusBg = '#ef444420'; statusIcon = '🔴'; }
    else if (health < 50) { status = 'WEAK'; statusColor = '#f97316'; statusBg = '#f9731620'; statusIcon = '🟠'; }
    else if (health < 70) { status = 'NEUTRAL'; statusColor = '#eab308'; statusBg = '#eab30820'; statusIcon = '🟡'; }
    else { status = 'STRONG'; statusColor = '#22c55e'; statusBg = '#22c55e20'; statusIcon = '🟢'; }
    return { ...s, health, status, statusColor, statusBg, statusIcon, bottomCount, bottomPct, avgRsi, weakCount, weakPct, bearishMacdCount, bearishMacdPct, bullishCount, bullishPct, total };
  }).sort((a, b) => a.health - b.health);
  const sectorsAtBottom = sectorHealthData.filter(s => s.health < 30);
  const sectorsWeak = sectorHealthData.filter(s => s.health >= 30 && s.health < 50);
  const setupCounts = {};
  assets.forEach(a => { setupCounts[a.setup_type] = (setupCounts[a.setup_type] || 0) + 1; });
  const pieData = Object.entries(setupCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'];

  const smartAlerts = assets.map(a => ({ ...a, alert: getSmartAlert(a) })).filter(a => a.alert.confluence >= 4).sort((a, b) => b.alert.confluence - a.alert.confluence);
  const eliteAlerts = smartAlerts.filter(a => a.alert.confluence >= 8);
  const strongAlerts = smartAlerts.filter(a => a.alert.confluence >= 6 && a.alert.confluence < 8);

  if (loading) {
    return (<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0f172a',color:'white',fontSize:24,flexDirection:'column',gap:16}}><div style={{fontSize:48}}>🔬</div><div>SwingLab Loading...</div></div>);
  }

  // STOCK DETAIL
  if (selectedStock) {
    const a = selectedStock;
    const alert = getSmartAlert(a);
    const pocDist = a.poc_price ? Math.abs(((a.price - a.poc_price) / a.price) * 100).toFixed(2) : null;
    const sector = sectors.find(s => s.code === a.sector_code);

    return (
      <div style={{background:'#0f172a', minHeight:'100vh', color:'#e2e8f0'}}>
        <header style={{background:'#1e293b', padding:'16px 24px', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}><span style={{fontSize:28}}>🔬</span><h1 style={{margin:0, fontSize:22, fontWeight:700}}>SwingLab</h1></div>
          <button onClick={() => setSelectedStock(null)} style={{background:'#334155', color:'white', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600}}>Back</button>
        </header>
        <main style={{padding:24, maxWidth:900, margin:'0 auto'}}>
          <div style={{background:'#1e293b', borderRadius:16, padding:24, marginBottom:24}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16}}>
              <div>
                <h2 style={{margin:0, fontSize:32, fontWeight:700}}>{a.ticker}</h2>
                <p style={{color:'#94a3b8', margin:'4px 0', fontSize:14}}>{a.name} - {sector?.name || a.sector_code}</p>
                <p style={{fontSize:36, fontWeight:700, margin:'8px 0'}}>${a.price?.toFixed(2)}</p>
                <p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', fontSize:16, fontWeight:600, margin:0}}>{a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%</p>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{width:120, height:120, borderRadius:'50%', border:`6px solid ${alert.color}`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                  <span style={{fontSize:32, fontWeight:700, color:alert.color}}>{alert.confluence}</span>
                  <span style={{fontSize:10, color:'#94a3b8'}}>/ 10</span>
                </div>
                <div style={{marginTop:12, padding:'8px 20px', borderRadius:20, background:alert.bg, color:alert.color, fontWeight:700, fontSize:16}}>{alert.icon} {alert.level}</div>
              </div>
            </div>
          </div>

          {/* Confluence Breakdown */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24, marginBottom:24}}>
            <h3 style={{margin:'0 0 16px', fontSize:16, fontWeight:600}}>Confluence Analysis ({alert.confluence}/10)</h3>
            <div style={{background:'#334155', borderRadius:8, height:12, marginBottom:20, position:'relative', overflow:'hidden'}}>
              <div style={{width:`${(alert.confluence/10)*100}%`, height:'100%', borderRadius:8, background: alert.confluence >= 8 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : alert.confluence >= 6 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)'}} />
            </div>
            {alert.factors.map((f, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom: i < alert.factors.length - 1 ? '1px solid #334155' : 'none'}}>
                <span style={{fontSize:18, width:24}}>{f.pass ? '✅' : '❌'}</span>
                <div style={{flex:1}}>
                  <p style={{margin:0, fontSize:13, fontWeight:600, color: f.pass ? '#e2e8f0' : '#64748b'}}>{f.name}</p>
                  <p style={{margin:0, fontSize:11, color:'#94a3b8'}}>{f.detail}</p>
                </div>
                <span style={{fontSize:13, fontWeight:700, color: f.pass ? '#22c55e' : '#64748b'}}>{f.score}/{f.max}</span>
              </div>
            ))}
          </div>

          {/* Trade Plan */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24, marginBottom:24}}>
            <h3 style={{margin:'0 0 16px', fontSize:16, fontWeight:600}}>Trade Plan</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12}}>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center', borderLeft:'4px solid #3b82f6'}}>
                <p style={{color:'#3b82f6', fontSize:11, margin:0}}>ENTRY</p>
                <p style={{fontSize:22, fontWeight:700, color:'#3b82f6', margin:'4px 0'}}>${alert.trade.entry}</p>
              </div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center', borderLeft:'4px solid #ef4444'}}>
                <p style={{color:'#ef4444', fontSize:11, margin:0}}>STOP LOSS</p>
                <p style={{fontSize:22, fontWeight:700, color:'#ef4444', margin:'4px 0'}}>${alert.trade.stopLoss}</p>
                <p style={{fontSize:10, color:'#94a3b8', margin:0}}>-${alert.trade.riskPerShare}/share</p>
              </div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center', borderLeft:'4px solid #22c55e'}}>
                <p style={{color:'#22c55e', fontSize:11, margin:0}}>TARGET 1</p>
                <p style={{fontSize:22, fontWeight:700, color:'#22c55e', margin:'4px 0'}}>${alert.trade.target1}</p>
                <p style={{fontSize:10, color:'#94a3b8', margin:0}}>+${alert.trade.rewardPerShare}/share</p>
              </div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center', borderLeft:'4px solid #eab308'}}>
                <p style={{color:'#eab308', fontSize:11, margin:0}}>R:R RATIO</p>
                <p style={{fontSize:22, fontWeight:700, color:'#eab308', margin:'4px 0'}}>{alert.trade.riskReward}:1</p>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginBottom:24}}>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}><p style={{color:'#64748b', fontSize:12, margin:0}}>Setup Type</p><div style={{marginTop:8}}>{getSetupBadge(a.setup_type)}</div></div>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}><p style={{color:'#64748b', fontSize:12, margin:0}}>RSI (14)</p><p style={{fontSize:24, fontWeight:700, margin:'4px 0', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</p></div>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}><p style={{color:'#64748b', fontSize:12, margin:0}}>MACD Histogram</p><p style={{fontSize:24, fontWeight:700, margin:'4px 0', color: a.macd?.histogram > 0 ? '#22c55e' : '#ef4444'}}>{a.macd?.histogram?.toFixed(4)}</p></div>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}><p style={{color:'#64748b', fontSize:12, margin:0}}>Relative Volume</p><p style={{fontSize:24, fontWeight:700, margin:'4px 0', color: a.relative_volume >= 1.5 ? '#eab308' : '#e2e8f0'}}>{a.relative_volume?.toFixed(2)}x</p></div>
          </div>

          {/* POC and Value Area */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24, marginBottom:24}}>
            <h3 style={{margin:'0 0 16px', fontSize:16, fontWeight:600}}>Volume Profile</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16}}>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center'}}><p style={{color:'#8b5cf6', fontSize:12, margin:0}}>POC</p><p style={{fontSize:28, fontWeight:700, color:'#8b5cf6', margin:'8px 0'}}>{a.poc_price ? `$${a.poc_price}` : 'N/A'}</p>{pocDist && <p style={{fontSize:12, color:'#94a3b8', margin:0}}>{pocDist}% away</p>}</div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center'}}><p style={{color:'#22c55e', fontSize:12, margin:0}}>VA High</p><p style={{fontSize:28, fontWeight:700, color:'#22c55e', margin:'8px 0'}}>{a.value_area_high ? `$${a.value_area_high}` : 'N/A'}</p></div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center'}}><p style={{color:'#ef4444', fontSize:12, margin:0}}>VA Low</p><p style={{fontSize:28, fontWeight:700, color:'#ef4444', margin:'8px 0'}}>{a.value_area_low ? `$${a.value_area_low}` : 'N/A'}</p></div>
            </div>
            {a.high_52w && a.low_52w && (
              <div style={{marginTop:20, background:'#0f172a', borderRadius:12, padding:16}}>
                <h4 style={{margin:'0 0 12px', fontSize:14, color:'#94a3b8'}}>52-Week Range</h4>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:4}}><span>Low ${a.low_52w}</span><span>High ${a.high_52w}</span></div>
                <div style={{background:'#334155', borderRadius:8, height:16, position:'relative'}}>
                  <div style={{background:'linear-gradient(90deg, #ef4444, #eab308, #22c55e)', height:'100%', borderRadius:8, opacity:0.2}} />
                  {(() => { const range = a.high_52w - a.low_52w; if (range <= 0) return null; const pocPos = Math.min(100, Math.max(0, ((a.poc_price - a.low_52w) / range) * 100)); const pricePos = Math.min(100, Math.max(0, ((a.price - a.low_52w) / range) * 100)); return (<><div style={{position:'absolute', top:0, left:`${pocPos}%`, width:3, height:'100%', background:'#8b5cf6', borderRadius:2}} /><div style={{position:'absolute', top:-2, left:`${pricePos}%`, transform:'translateX(-50%)', width:12, height:20, background:'#f1f5f9', borderRadius:4, border:'2px solid #0f172a'}} /></>); })()}
                </div>
                <p style={{textAlign:'center', marginTop:8, fontSize:12, color:'#94a3b8'}}>{a.pct_from_high >= -5 ? 'Near 52W High - strong zone' : a.pct_from_high >= -15 ? 'Mid range' : 'Near 52W Low'}</p>
              </div>
            )}
          </div>

          {/* EMA */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24}}>
            <h3 style={{margin:'0 0 16px', fontSize:16, fontWeight:600}}>EMA Structure</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12}}>
              {[{label:'Price',value:a.price,color:'#f1f5f9'},{label:'EMA 10',value:a.ema10,color:'#3b82f6'},{label:'EMA 20',value:a.ema20,color:'#eab308'},{label:'EMA 50',value:a.ema50,color:'#ef4444'}].map(e => (
                <div key={e.label} style={{background:'#0f172a', borderRadius:12, padding:16, borderLeft:`4px solid ${e.color}`}}><p style={{color:'#64748b', fontSize:12, margin:0}}>{e.label}</p><p style={{fontSize:20, fontWeight:700, color:e.color, margin:'4px 0'}}>${e.value?.toFixed(2)}</p></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{background:'#0f172a', minHeight:'100vh', color:'#e2e8f0'}}>
      <header style={{background:'#1e293b', padding:'16px 24px', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{fontSize:28}}>🔬</span>
          <div><h1 style={{margin:0, fontSize:22, fontWeight:700, color:'#f1f5f9'}}>SwingLab</h1><p style={{margin:0, fontSize:12, color:'#64748b'}}>Swing Trading Analysis</p></div>
        </div>
    <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search any ticker..."
            style={{background:'#334155', color:'white', border:'1px solid #475569', padding:'8px 12px', borderRadius:8, fontSize:13, width:160, outline:'none'}}
          />
          <button onClick={handleSearch} disabled={searching}
            style={{background:'#8b5cf6', color:'white', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, opacity: searching ? 0.5 : 1}}>
            {searching ? '...' : '🔍'}
          </button>
        </div>
        <div style={{display:'flex', gap:8}}>
          {['dashboard','alerts','bottoms','poc','scanner','sectors'].map(v => (
            <button key={v} onClick={() => {setView(v); setSelectedSector(null);}}
              style={{background: view===v ? '#3b82f6' : '#334155', color:'white', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, position:'relative'}}>
              {v === 'dashboard' ? 'Dashboard' : v === 'alerts' ? 'Alerts' : v === 'bottoms' ? 'Bottoms' : v === 'poc' ? 'POC Scanner' : v === 'scanner' ? 'Scanner' : 'Sectors'}
              {v === 'alerts' && smartAlerts.length > 0 && <span style={{position:'absolute', top:-4, right:-4, background:'#ef4444', color:'white', borderRadius:'50%', width:18, height:18, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{smartAlerts.length}</span>}
              {v === 'bottoms' && bottomStocks.length > 0 && <span style={{position:'absolute', top:-4, right:-4, background:'#f97316', color:'white', borderRadius:'50%', width:18, height:18, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{bottomStocks.length}</span>}
            </button>
          ))}
        </div>
      </header>

      <main style={{padding:24, maxWidth:1200, margin:'0 auto'}}>

        {/* ALERT BANNER */}
        {view === 'dashboard' && eliteAlerts.length > 0 && (
          <div style={{background:'linear-gradient(135deg, #f59e0b20, #ef444420)', border:'2px solid #f59e0b', borderRadius:16, padding:20, marginBottom:24, cursor:'pointer'}} onClick={() => setView('alerts')}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
              <span style={{fontSize:24}}>🔥🔥🔥</span>
              <h3 style={{margin:0, fontSize:18, fontWeight:700, color:'#f59e0b'}}>ELITE SETUP DETECTED!</h3>
            </div>
            <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
              {eliteAlerts.map(a => (
                <span key={a.ticker} style={{background:'#f59e0b30', color:'#f59e0b', padding:'6px 16px', borderRadius:20, fontWeight:700, fontSize:14}}>{a.ticker} ({a.alert.confluence}/10)</span>
              ))}
            </div>
            <p style={{color:'#94a3b8', fontSize:12, margin:'8px 0 0'}}>Click to see full analysis</p>
          </div>
        )}

        {view === 'dashboard' && eliteAlerts.length === 0 && strongAlerts.length > 0 && (
          <div style={{background:'#22c55e10', border:'1px solid #22c55e40', borderRadius:16, padding:20, marginBottom:24, cursor:'pointer'}} onClick={() => setView('alerts')}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span style={{fontSize:20}}>🔥🔥</span>
              <h3 style={{margin:0, fontSize:16, fontWeight:700, color:'#22c55e'}}>{strongAlerts.length} Strong Buy Signal{strongAlerts.length > 1 ? 's' : ''}</h3>
              <div style={{display:'flex', gap:8}}>{strongAlerts.slice(0, 5).map(a => (<span key={a.ticker} style={{background:'#22c55e20', color:'#22c55e', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:700}}>{a.ticker}</span>))}</div>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:24}}>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #3b82f6'}}><p style={{color:'#64748b', fontSize:13, margin:0}}>Sectors</p><p style={{fontSize:28, fontWeight:700, margin:'8px 0 0'}}>{sectors.length}</p></div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #22c55e'}}><p style={{color:'#64748b', fontSize:13, margin:0}}>Stocks</p><p style={{fontSize:28, fontWeight:700, margin:'8px 0 0'}}>{assets.length}</p></div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #f59e0b'}}><p style={{color:'#64748b', fontSize:13, margin:0}}>Active Alerts</p><p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#f59e0b'}}>{smartAlerts.length}</p></div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #eab308'}}><p style={{color:'#64748b', fontSize:13, margin:0}}>Top Confluence</p><p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#22c55e'}}>{smartAlerts[0]?.alert.confluence || '-'}/10</p></div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #8b5cf6'}}><p style={{color:'#64748b', fontSize:13, margin:0}}>Best Setup</p><p style={{fontSize:20, fontWeight:700, margin:'8px 0 0'}}>{smartAlerts[0]?.ticker || '-'}</p></div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:32}}>
              <div style={{background:'#1e293b', borderRadius:12, padding:20}}>
                <h3 style={{margin:'0 0 16px', fontSize:15, fontWeight:600}}>Sector Scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorChartData} layout="vertical" margin={{left:10}}>
                    <XAxis type="number" domain={[0, 60]} stroke="#475569" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={50} />
                    <Tooltip contentStyle={{background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0'}} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>{sectorChartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20}}>
                <h3 style={{margin:'0 0 16px', fontSize:15, fontWeight:600}}>Setup Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name.replace('_', ' ')} (${value})`} labelLine={false} fontSize={10}>{pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0'}} /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <h2 style={{fontSize:18, fontWeight:600, marginBottom:12}}>Sector Ranking</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:32}}>
              {sectors.map(s => (
                <div key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}} style={{background:'#1e293b', borderRadius:12, padding:16, cursor:'pointer', border:'1px solid #334155', transition:'all 0.2s'}} onMouseOver={e => e.currentTarget.style.borderColor='#3b82f6'} onMouseOut={e => e.currentTarget.style.borderColor='#334155'}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:700, fontSize:14}}>{s.code}</span><span style={{color:getScoreColor(s.composite_score), fontWeight:700}}>{s.composite_score?.toFixed(1)}</span></div>
                  <p style={{fontSize:11, color:'#94a3b8', margin:'4px 0'}}>{s.name}</p>
                  <p style={{fontSize:18, fontWeight:600, margin:'4px 0'}}>${s.price?.toFixed(2)}</p>
                  <p style={{fontSize:12, color: s.return_20d >= 0 ? '#22c55e' : '#ef4444', margin:0}}>{s.return_20d >= 0 ? '+' : ''}{s.return_20d?.toFixed(2)}%</p>
                </div>
              ))}
            </div>

            <h2 style={{fontSize:18, fontWeight:600, marginBottom:12}}>Top 15 Setups</h2>
            <div style={{background:'#1e293b', borderRadius:12, overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid #334155'}}>{['#','Ticker','Price','Alert','Confluence','Setup','RSI','POC'].map(h => (<th key={h} style={{padding:'12px 16px', textAlign:'left', color:'#64748b', fontSize:12, fontWeight:600}}>{h}</th>))}</tr></thead>
                <tbody>
                  {topSetups.map((a, i) => { const al = getSmartAlert(a); return (
                    <tr key={a.ticker} onClick={() => setSelectedStock(a)} style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032', cursor:'pointer'}} onMouseOver={e => e.currentTarget.style.background='#253048'} onMouseOut={e => e.currentTarget.style.background= i % 2 === 0 ? '#1e293b' : '#162032'}>
                      <td style={{padding:'12px 16px', fontWeight:700, color:'#64748b'}}>{i+1}</td>
                      <td style={{padding:'12px 16px', fontWeight:700, color:'#f1f5f9', fontSize:15}}>{a.ticker}</td>
                      <td style={{padding:'12px 16px'}}>${a.price?.toFixed(2)}</td>
                      <td style={{padding:'12px 16px'}}><span style={{background:al.bg, color:al.color, padding:'4px 12px', borderRadius:20, fontWeight:700, fontSize:12}}>{al.icon} {al.level}</span></td>
                      <td style={{padding:'12px 16px'}}><span style={{color:al.color, fontWeight:700, fontSize:16}}>{al.confluence}/10</span></td>
                      <td style={{padding:'12px 16px'}}>{getSetupBadge(a.setup_type)}</td>
                      <td style={{padding:'12px 16px', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</td>
                      <td style={{padding:'12px 16px', color:'#8b5cf6'}}>{a.poc_price ? `$${a.poc_price}` : '-'}</td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ALERTS VIEW */}
        {view === 'alerts' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8}}>
              <div>
                <h2 style={{fontSize:20, fontWeight:700, margin:0}}>Smart Alerts</h2>
                <p style={{color:'#94a3b8', margin:'4px 0 0', fontSize:14}}>Multi-confluence analysis - 9 factors scored independently</p>
              </div>
              <div style={{display:'flex', gap:12}}>
                <div style={{background:'#f59e0b20', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#f59e0b', fontSize:22, fontWeight:700, margin:0}}>{eliteAlerts.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>ELITE (8+)</p></div>
                <div style={{background:'#22c55e20', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#22c55e', fontSize:22, fontWeight:700, margin:0}}>{strongAlerts.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>STRONG (6+)</p></div>
                <div style={{background:'#3b82f620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#3b82f6', fontSize:22, fontWeight:700, margin:0}}>{smartAlerts.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>ALL ALERTS</p></div>
              </div>
            </div>

            {smartAlerts.length === 0 ? (
              <div style={{background:'#1e293b', borderRadius:12, padding:40, textAlign:'center'}}><p style={{fontSize:48}}>🔍</p><p style={{fontSize:18, color:'#94a3b8'}}>No alerts right now. Check back after market refresh.</p></div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:16}}>
                {smartAlerts.map(a => {
                  const al = a.alert;
                  const sector = sectors.find(s => s.code === a.sector_code);
                  const passCount = al.factors.filter(f => f.pass).length;
                  return (
                    <div key={a.ticker} onClick={() => setSelectedStock(a)} style={{background:'#1e293b', borderRadius:16, padding:20, cursor:'pointer', border: al.confluence >= 8 ? '2px solid #f59e0b' : al.confluence >= 6 ? '2px solid #22c55e' : '1px solid #334155', transition:'all 0.2s'}} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{fontSize:20, fontWeight:700}}>{a.ticker}</span>
                          <span style={{color:'#94a3b8', fontSize:12}}>{sector?.name || a.sector_code}</span>
                        </div>
                        <span style={{background:al.bg, color:al.color, padding:'6px 14px', borderRadius:20, fontWeight:700, fontSize:14}}>{al.icon} {al.level}</span>
                      </div>

                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div>
                          <p style={{fontSize:28, fontWeight:700, margin:0}}>${a.price?.toFixed(2)}</p>
                          <p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', margin:'4px 0 0', fontWeight:600}}>{a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%</p>
                        </div>
                        <div style={{textAlign:'center'}}>
                          <div style={{width:70, height:70, borderRadius:'50%', border:`5px solid ${al.color}`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                            <span style={{fontWeight:700, fontSize:22, color:al.color}}>{al.confluence}</span>
                            <span style={{fontSize:8, color:'#94a3b8'}}>/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Confluence mini bar */}
                      <div style={{background:'#334155', borderRadius:6, height:8, marginBottom:12, overflow:'hidden'}}>
                        <div style={{width:`${(al.confluence/10)*100}%`, height:'100%', borderRadius:6, background: al.confluence >= 8 ? '#f59e0b' : al.confluence >= 6 ? '#22c55e' : '#3b82f6'}} />
                      </div>

                      {/* Factor dots */}
                      <div style={{display:'flex', gap:4, marginBottom:12}}>
                        {al.factors.map((f, i) => (
                          <div key={i} title={`${f.name}: ${f.detail}`} style={{width:24, height:24, borderRadius:'50%', background: f.pass ? '#22c55e20' : '#64748b20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10}}>{f.pass ? '✅' : '❌'}</div>
                        ))}
                      </div>

                      {/* Trade levels */}
                      <div style={{display:'flex', gap:8, fontSize:11, marginBottom:12}}>
                        <span style={{background:'#3b82f620', color:'#3b82f6', padding:'4px 8px', borderRadius:6}}>Entry ${al.trade.entry}</span>
                        <span style={{background:'#ef444420', color:'#ef4444', padding:'4px 8px', borderRadius:6}}>Stop ${al.trade.stopLoss}</span>
                        <span style={{background:'#22c55e20', color:'#22c55e', padding:'4px 8px', borderRadius:6}}>Target ${al.trade.target1}</span>
                        <span style={{background:'#eab30820', color:'#eab308', padding:'4px 8px', borderRadius:6}}>R:R {al.trade.riskReward}</span>
                      </div>

                      {/* Badges */}
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        {getSetupBadge(a.setup_type)}
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>RSI {a.rsi?.toFixed(0)}</span>
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>{passCount}/9 factors</span>
                        {a.poc_price && <span style={{background:'#8b5cf620', color:'#8b5cf6', padding:'2px 8px', borderRadius:12, fontSize:10}}>POC ${a.poc_price}</span>}
                        {a.candlestick_patterns && a.candlestick_patterns.filter(p => p.type === 'bullish').map((p, pi) => (
                          <span key={pi} style={{background:'#22c55e20', color:'#22c55e', padding:'2px 8px', borderRadius:12, fontSize:10}}>{p.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
{/* BOTTOMS DETECTOR */}
        {view === 'bottoms' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8}}>
              <div>
                <h2 style={{fontSize:20, fontWeight:700, margin:0}}>Bottom Detector</h2>
                <p style={{color:'#94a3b8', margin:'4px 0 0', fontSize:14}}>Stocks and sectors showing signs of bottoming - potential reversal plays</p>
              </div>
              <div style={{display:'flex', gap:12}}>
                <div style={{background:'#ef444420', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#ef4444', fontSize:22, fontWeight:700, margin:0}}>{bottomStocks.filter(a => a.bottom.score >= 7).length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>STRONG</p></div>
                <div style={{background:'#f9731620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#f97316', fontSize:22, fontWeight:700, margin:0}}>{bottomStocks.filter(a => a.bottom.score >= 5).length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>POTENTIAL</p></div>
                <div style={{background:'#eab30820', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#eab308', fontSize:22, fontWeight:700, margin:0}}>{bottomStocks.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>TOTAL</p></div>
              </div>
            </div>
            {bottomSectors.length > 0 && (
              <div style={{marginBottom:24}}>
                <h3 style={{fontSize:16, fontWeight:600, marginBottom:12}}>Sector Bottoms</h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12}}>
                  {bottomSectors.map(s => (
                    <div key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}} style={{background:'#1e293b', borderRadius:12, padding:16, cursor:'pointer', border:'1px solid #f9731640'}} onMouseOver={e => e.currentTarget.style.borderColor='#f97316'} onMouseOut={e => e.currentTarget.style.borderColor='#f9731640'}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                        <span style={{fontWeight:700, fontSize:16}}>{s.code}</span>
                        <span style={{background: s.sectorBottomScore >= 6 ? '#ef444420' : '#f9731620', color: s.sectorBottomScore >= 6 ? '#ef4444' : '#f97316', padding:'4px 10px', borderRadius:12, fontSize:12, fontWeight:700}}>{s.sectorBottomScore}/10</span>
                      </div>
                      <p style={{fontSize:12, color:'#94a3b8', margin:'0 0 8px'}}>{s.name}</p>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:12}}>
                        <span style={{color:'#ef4444'}}>RSI {s.rsi?.toFixed(0)}</span>
                        <span style={{color:'#94a3b8'}}>Avg RSI {s.avgRsi}</span>
                        <span style={{color:'#f97316'}}>{s.bottomCount} bottoms</span>
                      </div>
                      <div style={{marginTop:8, background:'#334155', borderRadius:4, height:6, overflow:'hidden'}}>
                        <div style={{width:`${(s.sectorBottomScore/10)*100}%`, height:'100%', borderRadius:4, background: s.sectorBottomScore >= 6 ? '#ef4444' : '#f97316'}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h3 style={{fontSize:16, fontWeight:600, marginBottom:12}}>Stock Bottoms</h3>
            {bottomStocks.length === 0 ? (
              <div style={{background:'#1e293b', borderRadius:12, padding:40, textAlign:'center'}}><p style={{fontSize:48}}>📈</p><p style={{fontSize:18, color:'#94a3b8'}}>No bottom signals detected. Market is healthy!</p></div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:16}}>
                {bottomStocks.map(a => {
                  const bot = a.bottom;
                  const sector = sectors.find(s => s.code === a.sector_code);
                  const passCount = bot.factors.filter(f => f.pass).length;
                  return (
                    <div key={a.ticker} onClick={() => setSelectedStock(a)} style={{background:'#1e293b', borderRadius:16, padding:20, cursor:'pointer', border: bot.score >= 7 ? '2px solid #ef4444' : bot.score >= 5 ? '2px solid #f97316' : '1px solid #334155', transition:'all 0.2s'}} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{fontSize:20, fontWeight:700}}>{a.ticker}</span>
                          <span style={{color:'#94a3b8', fontSize:12}}>{sector?.name || a.sector_code}</span>
                        </div>
                        <span style={{background:bot.bg, color:bot.color, padding:'6px 14px', borderRadius:20, fontWeight:700, fontSize:14}}>{bot.icon} {bot.level}</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <div>
                          <p style={{fontSize:28, fontWeight:700, margin:0}}>${a.price?.toFixed(2)}</p>
                          <p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', margin:'4px 0 0', fontWeight:600}}>{a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%</p>
                          {a.low_52w && <p style={{color:'#94a3b8', fontSize:11, margin:'2px 0 0'}}>52W Low: ${a.low_52w}</p>}
                        </div>
                        <div style={{textAlign:'center'}}>
                          <div style={{width:70, height:70, borderRadius:'50%', border:`5px solid ${bot.color}`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                            <span style={{fontWeight:700, fontSize:22, color:bot.color}}>{bot.score}</span>
                            <span style={{fontSize:8, color:'#94a3b8'}}>/10</span>
                          </div>
                        </div>
                      </div>
                      <div style={{background:'#334155', borderRadius:6, height:8, marginBottom:12, overflow:'hidden'}}>
                        <div style={{width:`${(bot.score/10)*100}%`, height:'100%', borderRadius:6, background: bot.score >= 7 ? '#ef4444' : bot.score >= 5 ? '#f97316' : '#eab308'}} />
                      </div>
                      <div style={{display:'flex', gap:4, marginBottom:12}}>
                        {bot.factors.map((f, i) => (
                          <div key={i} title={`${f.name}: ${f.detail}`} style={{flex:1, height:24, borderRadius:4, background: f.pass ? '#f9731630' : '#64748b15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color: f.pass ? '#f1f5f9' : '#475569', fontWeight:600}}>
                            {f.pass ? f.name.split(' ')[0] : ''}
                          </div>
                        ))}
                      </div>
                      <div style={{background:'#0f172a', borderRadius:10, padding:12, marginBottom:12}}>
                        <p style={{fontSize:11, color:'#64748b', margin:'0 0 8px'}}>Recovery Targets</p>
                        <div style={{display:'flex', gap:8, fontSize:11, flexWrap:'wrap'}}>
                          <span style={{background:'#ef444420', color:'#ef4444', padding:'4px 8px', borderRadius:6}}>Stop ${bot.trade.stopLoss}</span>
                          <span style={{background:'#3b82f620', color:'#3b82f6', padding:'4px 8px', borderRadius:6}}>Entry ${bot.trade.entry?.toFixed(2)}</span>
                          <span style={{background:'#22c55e20', color:'#22c55e', padding:'4px 8px', borderRadius:6}}>T1 ${bot.trade.target1} (POC)</span>
                          <span style={{background:'#8b5cf620', color:'#8b5cf6', padding:'4px 8px', borderRadius:6}}>T2 ${bot.trade.target2} (VA High)</span>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        {getSetupBadge(a.setup_type)}
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>RSI {a.rsi?.toFixed(0)}</span>
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>{passCount}/7 factors</span>
                        {a.candlestick_patterns && a.candlestick_patterns.filter(p => p.type === 'bullish').map((p, pi) => (
                          <span key={pi} style={{background:'#22c55e20', color:'#22c55e', padding:'2px 8px', borderRadius:12, fontSize:10}}>{p.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {/* POC SCANNER */}
        {view === 'poc' && (() => {
          const pocStocks = [...assets].filter(a => a.poc_price && a.price).map(a => ({...a, poc_distance: Math.abs(((a.price - a.poc_price) / a.price) * 100), poc_position: a.price >= a.poc_price ? 'above' : 'below'})).sort((a, b) => a.poc_distance - b.poc_distance);
          const atPoc = pocStocks.filter(a => a.poc_distance <= 1);
          const nearPoc = pocStocks.filter(a => a.poc_distance <= 3);
          return (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:8}}>
                <div><h2 style={{fontSize:20, fontWeight:700, margin:0}}>POC Scanner</h2><p style={{color:'#94a3b8', margin:'4px 0 0', fontSize:14}}>Stocks closest to their Point of Control</p></div>
                <div style={{display:'flex', gap:12}}>
                  <div style={{background:'#8b5cf620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#8b5cf6', fontSize:22, fontWeight:700, margin:0}}>{atPoc.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>AT POC</p></div>
                  <div style={{background:'#3b82f620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#3b82f6', fontSize:22, fontWeight:700, margin:0}}>{nearPoc.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>NEAR POC</p></div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:16, marginTop:20}}>
                {pocStocks.slice(0, 20).map(a => {
                  const al = getSmartAlert(a);
                  const dist = a.vp_distribution || [];
                  const vaLow = a.value_area_low || 0;
                  const vaHigh = a.value_area_high || 0;
                  return (
                    <div key={a.ticker} onClick={() => setSelectedStock(a)} style={{background:'#1e293b', borderRadius:16, padding:20, cursor:'pointer', border: a.poc_distance <= 1 ? '2px solid #8b5cf6' : a.poc_distance <= 3 ? '1px solid #3b82f6' : '1px solid #334155', transition:'all 0.2s'}} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{fontSize:18, fontWeight:700}}>{a.ticker}</span>
                          <span style={{color:'#94a3b8', fontSize:12}}>{a.sector_code}</span>
                          {a.poc_distance <= 1 && <span style={{background:'#8b5cf620', color:'#8b5cf6', padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700}}>AT POC</span>}
                        </div>
                        <span style={{background:al.bg, color:al.color, padding:'4px 10px', borderRadius:16, fontSize:12, fontWeight:700}}>{al.icon} {al.level}</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                        <div><p style={{fontSize:24, fontWeight:700, margin:0}}>${a.price?.toFixed(2)}</p><p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', fontSize:13, margin:'2px 0 0', fontWeight:600}}>{a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%</p></div>
                        <div style={{textAlign:'right'}}><p style={{color:'#8b5cf6', fontSize:12, margin:0}}>POC</p><p style={{color:'#8b5cf6', fontSize:20, fontWeight:700, margin:0}}>${a.poc_price?.toFixed(2)}</p><p style={{color: a.poc_distance <= 1 ? '#8b5cf6' : '#94a3b8', fontSize:12, margin:0, fontWeight:600}}>{a.poc_distance?.toFixed(2)}% {a.poc_position}</p></div>
                      </div>
                      {dist.length > 0 && (
                        <div style={{marginBottom:12}}>
                          <div style={{display:'flex', flexDirection:'column', gap:1}}>
                            {dist.map((d, idx) => (
                              <div key={idx} style={{display:'flex', alignItems:'center', gap:4, height:7}}>
                                <span style={{fontSize:7, color:'#64748b', width:40, textAlign:'right'}}>{d.price}</span>
                                <div style={{flex:1, height:'100%', background:'#0f172a', borderRadius:2, overflow:'hidden'}}>
                                  <div style={{width:`${d.volume_pct}%`, height:'100%', borderRadius:2, background: d.is_poc ? '#8b5cf6' : d.in_value_area ? '#3b82f680' : '#475569'}} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        {getSetupBadge(a.setup_type)}
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>Score {a.setup_score}</span>
                        <span style={{background:al.bg, color:al.color, padding:'2px 8px', borderRadius:12, fontSize:10}}>{al.confluence}/10</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}

        {/* SCANNER */}
        {view === 'scanner' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8}}>
              <h2 style={{fontSize:18, fontWeight:600, margin:0}}>{selectedSector ? `${selectedSector} Stocks` : 'All Stocks Scanner'}</h2>
              {selectedSector && <button onClick={() => setSelectedSector(null)} style={{background:'#334155', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12}}>Clear</button>}
            </div>
            <div style={{marginBottom:12}}>
              <input
                type="text"
                placeholder="Filter by ticker..."
                onChange={e => {
                  const q = e.target.value.toUpperCase();
                  if (q) { setSelectedSector(null); }
                }}
                style={{background:'#334155', color:'white', border:'1px solid #475569', padding:'8px 12px', borderRadius:8, fontSize:13, width:200, outline:'none'}}
                id="scannerFilter"
              />
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
              {sectors.map(s => (<button key={s.code} onClick={() => setSelectedSector(s.code)} style={{background: selectedSector === s.code ? '#3b82f6' : '#334155', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12}}>{s.code}</button>))}
            </div>
            <div style={{background:'#1e293b', borderRadius:12, overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Ticker','Price','Chg%','Alert','Confluence','Setup','RSI','MACD','POC','RVol'].map(h => (<th key={h} style={{padding:'10px 12px', textAlign:'left', color:'#64748b', fontSize:11, fontWeight:600}}>{h}</th>))}</tr></thead>
                <tbody>
                  {[...filteredAssets].filter(a => {
                    const filterEl = document.getElementById('scannerFilter');
                    const q = filterEl ? filterEl.value.toUpperCase() : '';
                    return !q || a.ticker.includes(q);
                  }).sort((a,b) => b.setup_score - a.setup_score).map((a, i) => { const al = getSmartAlert(a); return (
                    <tr key={a.ticker} onClick={() => setSelectedStock(a)} style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032', cursor:'pointer'}} onMouseOver={e => e.currentTarget.style.background='#253048'} onMouseOut={e => e.currentTarget.style.background= i % 2 === 0 ? '#1e293b' : '#162032'}>
                      <td style={{padding:'10px 12px', fontWeight:700, color:'#f1f5f9'}}>{a.ticker}</td>
                      <td style={{padding:'10px 12px'}}>${a.price?.toFixed(2)}</td>
                      <td style={{padding:'10px 12px', color: a.change_pct >= 0 ? '#22c55e' : '#ef4444'}}>{a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%</td>
                      <td style={{padding:'10px 12px'}}><span style={{background:al.bg, color:al.color, padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600}}>{al.icon} {al.level}</span></td>
                      <td style={{padding:'10px 12px'}}><span style={{color:al.color, fontWeight:700}}>{al.confluence}/10</span></td>
                      <td style={{padding:'10px 12px'}}>{getSetupBadge(a.setup_type)}</td>
                      <td style={{padding:'10px 12px', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</td>
                      <td style={{padding:'10px 12px', color: a.macd?.histogram > 0 ? '#22c55e' : '#ef4444', fontSize:11}}>{a.macd?.histogram?.toFixed(4)}</td>
                      <td style={{padding:'10px 12px', color:'#8b5cf6', fontSize:12}}>{a.poc_price ? `$${a.poc_price}` : '-'}</td>
                      <td style={{padding:'10px 12px', color: a.relative_volume >= 1.5 ? '#eab308' : '#94a3b8'}}>{a.relative_volume?.toFixed(2)}x</td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'sectors' && (
          <>
            <div style={{background:'#1e293b', borderRadius:16, padding:20, marginBottom:24, borderLeft:'4px solid #8b5cf6'}}>
              <h3 style={{margin:'0 0 8px', fontSize:16, fontWeight:600, color:'#f1f5f9'}}>How Sector Health Works</h3>
              <p style={{margin:0, fontSize:13, color:'#94a3b8', lineHeight:1.6}}>
                Each sector gets a <strong style={{color:'#f1f5f9'}}>Health Score (0-100)</strong> based on 5 factors:
                <strong style={{color:'#ef4444'}}> % stocks at bottom</strong>,
                <strong style={{color:'#eab308'}}> average RSI</strong>,
                <strong style={{color:'#3b82f6'}}> sector strength vs SPY</strong>,
                <strong style={{color:'#f97316'}}> % weak stocks</strong>, and
                <strong style={{color:'#8b5cf6'}}> % bearish MACD</strong>.
                When the line turns <span style={{color:'#ef4444', fontWeight:700}}>RED</span>, the sector is at a potential bottom.
                <span style={{color:'#22c55e', fontWeight:700}}> GREEN</span> means the sector is healthy and trending up.
              </p>
            </div>

            <div style={{display:'flex', gap:12, marginBottom:24, flexWrap:'wrap'}}>
              <div style={{background:'#ef444420', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#ef4444', fontSize:22, fontWeight:700, margin:0}}>{sectorsAtBottom.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>AT BOTTOM</p></div>
              <div style={{background:'#f9731620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#f97316', fontSize:22, fontWeight:700, margin:0}}>{sectorsWeak.length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>WEAK</p></div>
              <div style={{background:'#22c55e20', borderRadius:8, padding:'8px 16px', textAlign:'center'}}><p style={{color:'#22c55e', fontSize:22, fontWeight:700, margin:0}}>{sectorHealthData.filter(s => s.health >= 70).length}</p><p style={{color:'#94a3b8', fontSize:11, margin:0}}>STRONG</p></div>
            </div>

            <div style={{background:'#1e293b', borderRadius:12, padding:20, marginBottom:24}}>
              <h3 style={{margin:'0 0 16px', fontSize:15, fontWeight:600}}>Sector Health Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[...sectorHealthData].sort((a, b) => b.health - a.health)} margin={{left:10, right:20, top:10, bottom:10}}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="50%" stopColor="#eab308" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} />
                  <Tooltip contentStyle={{background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0'}} formatter={(value, name) => {
                    if (name === 'health') return [`${value}/100`, 'Health Score'];
                    if (name === 'avgRsi') return [value, 'Avg RSI'];
                    if (name === 'bottomPct') return [`${value}%`, '% At Bottom'];
                    return [value, name];
                  }} />
                  <Area type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={3} fill="url(#healthGradient)" dot={(props) => {
                    const { cx, cy, payload } = props;
                    const color = payload.health < 30 ? '#ef4444' : payload.health < 50 ? '#f97316' : payload.health < 70 ? '#eab308' : '#22c55e';
                    return <circle cx={cx} cy={cy} r={8} fill={color} stroke="#0f172a" strokeWidth={3} />;
                  }} />
                  <Line type="monotone" dataKey="avgRsi" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="bottomPct" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:'flex', justifyContent:'center', gap:20, marginTop:12, fontSize:11}}>
                <span><span style={{color:'#3b82f6'}}>--</span> Health</span>
                <span><span style={{color:'#8b5cf6'}}>--</span> Avg RSI</span>
                <span><span style={{color:'#ef4444'}}>--</span> % Bottom</span>
                <span style={{marginLeft:8}}><span style={{color:'#ef4444'}}>*</span> Bottom</span>
                <span><span style={{color:'#f97316'}}>*</span> Weak</span>
                <span><span style={{color:'#eab308'}}>*</span> Neutral</span>
                <span><span style={{color:'#22c55e'}}>*</span> Strong</span>
              </div>
            </div>

            <h3 style={{fontSize:16, fontWeight:600, marginBottom:12}}>Sector Breakdown</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:16, marginBottom:24}}>
              {sectorHealthData.map(s => (
                <div key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}}
                  style={{background:'#1e293b', borderRadius:16, padding:20, cursor:'pointer', border: s.health < 30 ? '2px solid #ef4444' : s.health < 50 ? '1px solid #f97316' : '1px solid #334155', transition:'all 0.2s'}}
                  onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{fontSize:18, fontWeight:700}}>{s.code}</span>
                      <span style={{color:'#94a3b8', fontSize:12}}>{s.name}</span>
                    </div>
                    <span style={{background:s.statusBg, color:s.statusColor, padding:'4px 12px', borderRadius:16, fontSize:12, fontWeight:700}}>{s.statusIcon} {s.status}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                    <div>
                      <p style={{fontSize:24, fontWeight:700, margin:0}}>${s.price?.toFixed(2)}</p>
                      <p style={{color: s.return_20d >= 0 ? '#22c55e' : '#ef4444', margin:'2px 0 0', fontWeight:600, fontSize:13}}>{s.return_20d >= 0 ? '+' : ''}{s.return_20d?.toFixed(2)}%</p>
                    </div>
                    <div style={{width:65, height:65, borderRadius:'50%', border:`5px solid ${s.statusColor}`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                      <span style={{fontWeight:700, fontSize:20, color:s.statusColor}}>{s.health}</span>
                      <span style={{fontSize:8, color:'#94a3b8'}}>/100</span>
                    </div>
                  </div>
                  <div style={{background:'#334155', borderRadius:6, height:10, marginBottom:16, overflow:'hidden'}}>
                    <div style={{width:`${s.health}%`, height:'100%', borderRadius:6, background: s.health < 30 ? '#ef4444' : s.health < 50 ? '#f97316' : s.health < 70 ? '#eab308' : '#22c55e'}} />
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginBottom:12}}>
                    <div style={{background:'#0f172a', borderRadius:8, padding:8, textAlign:'center'}}>
                      <p style={{color: s.bottomPct > 20 ? '#ef4444' : '#94a3b8', fontSize:18, fontWeight:700, margin:0}}>{s.bottomPct}%</p>
                      <p style={{color:'#64748b', fontSize:9, margin:0}}>At Bottom</p>
                    </div>
                    <div style={{background:'#0f172a', borderRadius:8, padding:8, textAlign:'center'}}>
                      <p style={{color: s.avgRsi < 40 ? '#ef4444' : s.avgRsi > 60 ? '#22c55e' : '#eab308', fontSize:18, fontWeight:700, margin:0}}>{s.avgRsi}</p>
                      <p style={{color:'#64748b', fontSize:9, margin:0}}>Avg RSI</p>
                    </div>
                    <div style={{background:'#0f172a', borderRadius:8, padding:8, textAlign:'center'}}>
                      <p style={{color: s.strength_score >= 0 ? '#22c55e' : '#ef4444', fontSize:18, fontWeight:700, margin:0}}>{s.strength_score?.toFixed(1)}</p>
                      <p style={{color:'#64748b', fontSize:9, margin:0}}>vs SPY</p>
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 8px', background:'#0f172a', borderRadius:6}}>
                      <span style={{color:'#64748b'}}>Weak</span>
                      <span style={{color: s.weakPct > 30 ? '#ef4444' : '#94a3b8', fontWeight:600}}>{s.weakPct}%</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 8px', background:'#0f172a', borderRadius:6}}>
                      <span style={{color:'#64748b'}}>Bearish MACD</span>
                      <span style={{color: s.bearishMacdPct > 50 ? '#ef4444' : '#94a3b8', fontWeight:600}}>{s.bearishMacdPct}%</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 8px', background:'#0f172a', borderRadius:6}}>
                      <span style={{color:'#64748b'}}>Bullish</span>
                      <span style={{color: s.bullishPct > 50 ? '#22c55e' : '#94a3b8', fontWeight:600}}>{s.bullishPct}%</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 8px', background:'#0f172a', borderRadius:6}}>
                      <span style={{color:'#64748b'}}>Bottoming</span>
                      <span style={{color: s.bottomCount > 0 ? '#f97316' : '#94a3b8', fontWeight:600}}>{s.bottomCount}/{s.total}</span>
                    </div>
                  </div>
                  <div style={{marginTop:12, padding:10, background:'#0f172a', borderRadius:8}}>
                    <p style={{margin:0, fontSize:11, color:'#94a3b8'}}>
                      {s.health < 30 ? `${s.statusIcon} SECTOR BOTTOM: ${s.bottomPct}% of stocks bottoming with avg RSI ${s.avgRsi}. Watch for reversal signals.`
                        : s.health < 50 ? `${s.statusIcon} WEAK: ${s.weakPct}% of stocks below RSI 40. Wait for confirmation.`
                        : s.health < 70 ? `${s.statusIcon} NEUTRAL: ${s.bullishPct}% bullish vs ${s.bearishMacdPct}% bearish. Watch direction.`
                        : `${s.statusIcon} STRONG: ${s.bullishPct}% bullish stocks. Look for pullback entries.`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

export default App;
