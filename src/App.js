import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

function App() {
  const [sectors, setSectors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [view, setView] = useState('dashboard');
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [secRes, assRes] = await Promise.all([
        fetch(`${API}/api/sectors`),
        fetch(`${API}/api/assets?limit=110`)
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

  const getSignal = (asset) => {
    const s = asset.setup_score;
    const type = asset.setup_type;
    if (type === 'overbought_warning') return { label: 'AVOID', color: '#ef4444', bg: '#ef444420', icon: '🔴' };
    if (type === 'oversold_reversal' && s >= 40) return { label: 'WATCH', color: '#06b6d4', bg: '#06b6d420', icon: '👀' };
    if (s >= 65 && (type === 'breakout' || type === 'pullback_to_poc')) return { label: 'STRONG BUY', color: '#22c55e', bg: '#22c55e20', icon: '🟢' };
    if (s >= 55 && (type === 'pullback_to_poc' || type === 'ema_bounce' || type === 'breakout')) return { label: 'BUY', color: '#4ade80', bg: '#4ade8020', icon: '🟢' };
    if (s >= 45) return { label: 'WATCH', color: '#eab308', bg: '#eab30820', icon: '🟡' };
    return { label: 'HOLD', color: '#64748b', bg: '#64748b20', icon: '⚪' };
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

  // Chart data
  const sectorChartData = sectors.map(s => ({
    name: s.code, score: s.composite_score, fill: getScoreColor(s.composite_score)
  }));

  const setupCounts = {};
  assets.forEach(a => { setupCounts[a.setup_type] = (setupCounts[a.setup_type] || 0) + 1; });
  const pieData = Object.entries(setupCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'];

  const buySignals = assets.filter(a => {
    const sig = getSignal(a);
    return sig.label === 'STRONG BUY' || sig.label === 'BUY';
  }).sort((a, b) => b.setup_score - a.setup_score);

  if (loading) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0f172a',color:'white',fontSize:24,flexDirection:'column',gap:16}}>
        <div style={{fontSize:48}}>🔬</div>
        <div>SwingLab Loading...</div>
      </div>
    );
  }

  // STOCK DETAIL MODAL
  if (selectedStock) {
    const a = selectedStock;
    const sig = getSignal(a);
    const pocDist = a.poc_price ? Math.abs(((a.price - a.poc_price) / a.price) * 100).toFixed(2) : null;
    const sector = sectors.find(s => s.code === a.sector_code);

    return (
      <div style={{background:'#0f172a', minHeight:'100vh', color:'#e2e8f0'}}>
        <header style={{background:'#1e293b', padding:'16px 24px', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{fontSize:28}}>🔬</span>
            <h1 style={{margin:0, fontSize:22, fontWeight:700}}>SwingLab</h1>
          </div>
          <button onClick={() => setSelectedStock(null)} style={{background:'#334155', color:'white', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600}}>
            Back
          </button>
        </header>
        <main style={{padding:24, maxWidth:900, margin:'0 auto'}}>
          {/* Stock Header */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24, marginBottom:24}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16}}>
              <div>
                <h2 style={{margin:0, fontSize:32, fontWeight:700}}>{a.ticker}</h2>
                <p style={{color:'#94a3b8', margin:'4px 0', fontSize:14}}>{a.name} • {sector?.name || a.sector_code}</p>
                <p style={{fontSize:36, fontWeight:700, margin:'8px 0'}}>${a.price?.toFixed(2)}</p>
                <p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', fontSize:16, fontWeight:600, margin:0}}>
                  {a.change_pct >= 0 ? '▲' : '▼'} {a.change_pct?.toFixed(2)}%
                </p>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{width:120, height:120, borderRadius:'50%', border:`6px solid ${getScoreColor(a.setup_score)}`, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                  <span style={{fontSize:36, fontWeight:700, color:getScoreColor(a.setup_score)}}>{a.setup_score}</span>
                  <span style={{fontSize:11, color:'#94a3b8'}}>SCORE</span>
                </div>
                <div style={{marginTop:12, padding:'8px 20px', borderRadius:20, background:sig.bg, color:sig.color, fontWeight:700, fontSize:16}}>
                  {sig.icon} {sig.label}
                </div>
              </div>
            </div>
          </div>

          {/* Indicators Grid */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginBottom:24}}>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}>
              <p style={{color:'#64748b', fontSize:12, margin:0}}>Setup Type</p>
              <div style={{marginTop:8}}>{getSetupBadge(a.setup_type)}</div>
            </div>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}>
              <p style={{color:'#64748b', fontSize:12, margin:0}}>RSI (14)</p>
              <p style={{fontSize:24, fontWeight:700, margin:'4px 0', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</p>
              <p style={{fontSize:11, color:'#94a3b8', margin:0}}>{a.rsi > 70 ? 'Overbought' : a.rsi < 30 ? 'Oversold' : 'Neutral zone'}</p>
            </div>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}>
              <p style={{color:'#64748b', fontSize:12, margin:0}}>MACD Histogram</p>
              <p style={{fontSize:24, fontWeight:700, margin:'4px 0', color: a.macd?.histogram > 0 ? '#22c55e' : '#ef4444'}}>{a.macd?.histogram?.toFixed(4)}</p>
              <p style={{fontSize:11, color:'#94a3b8', margin:0}}>{a.macd?.histogram > 0 ? 'Bullish momentum' : 'Bearish momentum'}</p>
            </div>
            <div style={{background:'#1e293b', borderRadius:12, padding:16}}>
              <p style={{color:'#64748b', fontSize:12, margin:0}}>Relative Volume</p>
              <p style={{fontSize:24, fontWeight:700, margin:'4px 0', color: a.relative_volume >= 1.5 ? '#eab308' : '#e2e8f0'}}>{a.relative_volume?.toFixed(2)}x</p>
              <p style={{fontSize:11, color:'#94a3b8', margin:0}}>{a.relative_volume >= 1.5 ? 'High volume!' : 'Normal volume'}</p>
            </div>
          </div>

          {/* POC & Value Area */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24, marginBottom:24}}>
            <h3 style={{margin:'0 0 16px', fontSize:16, fontWeight:600}}>Volume Profile & POC</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16}}>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center'}}>
                <p style={{color:'#8b5cf6', fontSize:12, margin:0}}>POC (Point of Control)</p>
                <p style={{fontSize:28, fontWeight:700, color:'#8b5cf6', margin:'8px 0'}}>{a.poc_price ? `$${a.poc_price}` : 'N/A'}</p>
                {pocDist && <p style={{fontSize:12, color:'#94a3b8', margin:0}}>{pocDist}% from current price</p>}
              </div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center'}}>
                <p style={{color:'#22c55e', fontSize:12, margin:0}}>Value Area High</p>
                <p style={{fontSize:28, fontWeight:700, color:'#22c55e', margin:'8px 0'}}>{a.value_area_high ? `$${a.value_area_high}` : 'N/A'}</p>
                <p style={{fontSize:12, color:'#94a3b8', margin:0}}>Resistance level</p>
              </div>
              <div style={{background:'#0f172a', borderRadius:12, padding:16, textAlign:'center'}}>
                <p style={{color:'#ef4444', fontSize:12, margin:0}}>Value Area Low</p>
                <p style={{fontSize:28, fontWeight:700, color:'#ef4444', margin:'8px 0'}}>{a.value_area_low ? `$${a.value_area_low}` : 'N/A'}</p>
                <p style={{fontSize:12, color:'#94a3b8', margin:0}}>Support level</p>
              </div>
            </div>
            {/* Price Bar */}
            {a.value_area_low && a.value_area_high && (
              <div style={{marginTop:20}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'#94a3b8', marginBottom:4}}>
                  <span>VA Low ${a.value_area_low}</span>
                  <span>POC ${a.poc_price}</span>
                  <span>VA High ${a.value_area_high}</span>
                </div>
                <div style={{background:'#334155', borderRadius:8, height:24, position:'relative', overflow:'hidden'}}>
                  <div style={{background:'linear-gradient(90deg, #ef4444, #8b5cf6, #22c55e)', height:'100%', borderRadius:8, opacity:0.3}} />
                  {/* Price marker */}
                  {(() => {
                    const range = a.value_area_high - a.value_area_low;
                    const pos = range > 0 ? Math.min(100, Math.max(0, ((a.price - a.value_area_low) / range) * 100)) : 50;
                    return (
                      <div style={{position:'absolute', top:0, left:`${pos}%`, transform:'translateX(-50%)', height:'100%', display:'flex', alignItems:'center'}}>
                        <div style={{width:3, height:24, background:'#f1f5f9', borderRadius:2}} />
                      </div>
                    );
                  })()}
                </div>
                <p style={{textAlign:'center', fontSize:12, color:'#f1f5f9', marginTop:4}}>Current: ${a.price?.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* EMA Structure */}
          <div style={{background:'#1e293b', borderRadius:16, padding:24}}>
            <h3 style={{margin:'0 0 16px', fontSize:16, fontWeight:600}}>EMA Structure</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12}}>
              {[
                { label: 'Price', value: a.price, color: '#f1f5f9' },
                { label: 'EMA 10', value: a.ema10, color: '#3b82f6' },
                { label: 'EMA 20', value: a.ema20, color: '#eab308' },
                { label: 'EMA 50', value: a.ema50, color: '#ef4444' },
              ].map(e => (
                <div key={e.label} style={{background:'#0f172a', borderRadius:12, padding:16, borderLeft:`4px solid ${e.color}`}}>
                  <p style={{color:'#64748b', fontSize:12, margin:0}}>{e.label}</p>
                  <p style={{fontSize:20, fontWeight:700, color:e.color, margin:'4px 0'}}>${e.value?.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div style={{marginTop:16, padding:12, background:'#0f172a', borderRadius:8}}>
              <p style={{margin:0, fontSize:13, color:'#94a3b8'}}>
                {a.price > a.ema10 && a.ema10 > a.ema20 && a.ema20 > a.ema50
                  ? '✅ Perfect uptrend: Price > EMA10 > EMA20 > EMA50'
                  : a.price > a.ema20 && a.ema20 > a.ema50
                  ? '🟡 Moderate uptrend: Price > EMA20 > EMA50'
                  : a.price > a.ema50
                  ? '🟠 Weak uptrend: Price > EMA50 only'
                  : '🔴 Downtrend: Price below all EMAs'}
              </p>
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
          <div>
            <h1 style={{margin:0, fontSize:22, fontWeight:700, color:'#f1f5f9'}}>SwingLab</h1>
            <p style={{margin:0, fontSize:12, color:'#64748b'}}>Swing Trading Analysis & POC Scanner</p>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          {['dashboard','signals','poc','scanner','sectors'].map(v => (
            <button key={v} onClick={() => {setView(v); setSelectedSector(null);}}
              style={{background: view===v ? '#3b82f6' : '#334155', color:'white', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13}}>
              {v === 'dashboard' ? 'Dashboard' : v === 'signals' ? 'Signals' : v === 'poc' ? 'POC Scanner' : v === 'scanner' ? 'Scanner' : 'Sectors'}
            </button>
          ))}
        </div>
      </header>

      <main style={{padding:24, maxWidth:1200, margin:'0 auto'}}>

        {/* ========== DASHBOARD ========== */}
        {view === 'dashboard' && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:24}}>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #3b82f6'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Sectors</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0'}}>{sectors.length}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #22c55e'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Stocks</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0'}}>{assets.length}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #4ade80'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Buy Signals</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#22c55e'}}>{buySignals.length}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #eab308'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Top Score</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#22c55e'}}>{topSetups[0]?.setup_score || '-'}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #8b5cf6'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Best Setup</p>
                <p style={{fontSize:20, fontWeight:700, margin:'8px 0 0'}}>{topSetups[0]?.ticker || '-'}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:32}}>
              {/* Sector Bar Chart */}
              <div style={{background:'#1e293b', borderRadius:12, padding:20}}>
                <h3 style={{margin:'0 0 16px', fontSize:15, fontWeight:600}}>Sector Scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorChartData} layout="vertical" margin={{left:10}}>
                    <XAxis type="number" domain={[0, 60]} stroke="#475569" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={50} />
                    <Tooltip contentStyle={{background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0'}} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {sectorChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Setup Type Pie */}
              <div style={{background:'#1e293b', borderRadius:12, padding:20}}>
                <h3 style={{margin:'0 0 16px', fontSize:15, fontWeight:600}}>Setup Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name.replace('_', ' ')} (${value})`} labelLine={false} fontSize={10}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector Cards */}
            <h2 style={{fontSize:18, fontWeight:600, marginBottom:12}}>Sector Ranking</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:32}}>
              {sectors.map(s => (
                <div key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}}
                  style={{background:'#1e293b', borderRadius:12, padding:16, cursor:'pointer', border:'1px solid #334155', transition:'all 0.2s'}}
                  onMouseOver={e => e.currentTarget.style.borderColor='#3b82f6'}
                  onMouseOut={e => e.currentTarget.style.borderColor='#334155'}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span style={{fontWeight:700, fontSize:14}}>{s.code}</span>
                    <span style={{color:getScoreColor(s.composite_score), fontWeight:700}}>{s.composite_score?.toFixed(1)}</span>
                  </div>
                  <p style={{fontSize:11, color:'#94a3b8', margin:'4px 0'}}>{s.name}</p>
                  <p style={{fontSize:18, fontWeight:600, margin:'4px 0'}}>${s.price?.toFixed(2)}</p>
                  <p style={{fontSize:12, color: s.return_20d >= 0 ? '#22c55e' : '#ef4444', margin:0}}>
                    {s.return_20d >= 0 ? '+' : ''}{s.return_20d?.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Top Setups Table */}
            <h2 style={{fontSize:18, fontWeight:600, marginBottom:12}}>Top 15 Setups</h2>
            <div style={{background:'#1e293b', borderRadius:12, overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #334155'}}>
                    {['#','Ticker','Price','Signal','Score','Setup','RSI','POC'].map(h => (
                      <th key={h} style={{padding:'12px 16px', textAlign:'left', color:'#64748b', fontSize:12, fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topSetups.map((a, i) => {
                    const sig = getSignal(a);
                    return (
                      <tr key={a.ticker} onClick={() => setSelectedStock(a)}
                        style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032', cursor:'pointer'}}
                        onMouseOver={e => e.currentTarget.style.background='#253048'}
                        onMouseOut={e => e.currentTarget.style.background= i % 2 === 0 ? '#1e293b' : '#162032'}>
                        <td style={{padding:'12px 16px', fontWeight:700, color:'#64748b'}}>{i+1}</td>
                        <td style={{padding:'12px 16px', fontWeight:700, color:'#f1f5f9', fontSize:15}}>{a.ticker}</td>
                        <td style={{padding:'12px 16px'}}>${a.price?.toFixed(2)}</td>
                        <td style={{padding:'12px 16px'}}>
                          <span style={{background:sig.bg, color:sig.color, padding:'4px 12px', borderRadius:20, fontWeight:700, fontSize:12}}>
                            {sig.icon} {sig.label}
                          </span>
                        </td>
                        <td style={{padding:'12px 16px'}}>
                          <span style={{color:getScoreColor(a.setup_score), fontWeight:700, fontSize:16}}>{a.setup_score}</span>
                        </td>
                        <td style={{padding:'12px 16px'}}>{getSetupBadge(a.setup_type)}</td>
                        <td style={{padding:'12px 16px', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</td>
                        <td style={{padding:'12px 16px', color:'#8b5cf6'}}>{a.poc_price ? `$${a.poc_price}` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ========== SIGNALS VIEW ========== */}
        {view === 'signals' && (
          <>
            <h2 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Buy Signals</h2>
            <p style={{color:'#94a3b8', marginBottom:24, fontSize:14}}>
              Stocks with score 55+ and actionable setup (Breakout, POC Pullback, EMA Bounce)
            </p>

            {buySignals.length === 0 ? (
              <div style={{background:'#1e293b', borderRadius:12, padding:40, textAlign:'center'}}>
                <p style={{fontSize:48}}>🔍</p>
                <p style={{fontSize:18, color:'#94a3b8'}}>No buy signals right now. Check back after market refresh.</p>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:16}}>
                {buySignals.map(a => {
                  const sig = getSignal(a);
                  const sector = sectors.find(s => s.code === a.sector_code);
                  return (
                    <div key={a.ticker} onClick={() => setSelectedStock(a)}
                      style={{background:'#1e293b', borderRadius:16, padding:20, cursor:'pointer', border:'1px solid #334155', transition:'all 0.2s'}}
                      onMouseOver={e => e.currentTarget.style.borderColor='#22c55e'}
                      onMouseOut={e => e.currentTarget.style.borderColor='#334155'}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <div>
                          <span style={{fontSize:20, fontWeight:700}}>{a.ticker}</span>
                          <span style={{color:'#94a3b8', fontSize:12, marginLeft:8}}>{sector?.name || a.sector_code}</span>
                        </div>
                        <span style={{background:sig.bg, color:sig.color, padding:'6px 14px', borderRadius:20, fontWeight:700, fontSize:14}}>
                          {sig.icon} {sig.label}
                        </span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                        <div>
                          <p style={{fontSize:28, fontWeight:700, margin:0}}>${a.price?.toFixed(2)}</p>
                          <p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', margin:'4px 0 0', fontWeight:600}}>
                            {a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%
                          </p>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{width:60, height:60, borderRadius:'50%', border:`4px solid ${getScoreColor(a.setup_score)}`, display:'flex', justifyContent:'center', alignItems:'center'}}>
                            <span style={{fontWeight:700, fontSize:18, color:getScoreColor(a.setup_score)}}>{a.setup_score}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
                        {getSetupBadge(a.setup_type)}
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:11}}>RSI {a.rsi?.toFixed(0)}</span>
                        {a.poc_price && <span style={{background:'#8b5cf620', color:'#8b5cf6', padding:'2px 8px', borderRadius:12, fontSize:11}}>POC ${a.poc_price}</span>}
                        {a.relative_volume >= 1.5 && <span style={{background:'#eab30820', color:'#eab308', padding:'2px 8px', borderRadius:12, fontSize:11}}>Vol {a.relative_volume?.toFixed(1)}x</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {/* ========== POC SCANNER VIEW ========== */}
        {view === 'poc' && (() => {
          const pocStocks = [...assets]
            .filter(a => a.poc_price && a.price)
            .map(a => ({
              ...a,
              poc_distance: Math.abs(((a.price - a.poc_price) / a.price) * 100),
              poc_position: a.price >= a.poc_price ? 'above' : 'below',
            }))
            .sort((a, b) => a.poc_distance - b.poc_distance);

          const nearPoc = pocStocks.filter(a => a.poc_distance <= 3);
          const atPoc = pocStocks.filter(a => a.poc_distance <= 1);

          return (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:8}}>
                <div>
                  <h2 style={{fontSize:20, fontWeight:700, margin:0}}>POC Scanner</h2>
                  <p style={{color:'#94a3b8', margin:'4px 0 0', fontSize:14}}>Stocks closest to their Point of Control — highest probability zones</p>
                </div>
                <div style={{display:'flex', gap:12}}>
                  <div style={{background:'#8b5cf620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}>
                    <p style={{color:'#8b5cf6', fontSize:22, fontWeight:700, margin:0}}>{atPoc.length}</p>
                    <p style={{color:'#94a3b8', fontSize:11, margin:0}}>AT POC (&lt;1%)</p>
                  </div>
                  <div style={{background:'#3b82f620', borderRadius:8, padding:'8px 16px', textAlign:'center'}}>
                    <p style={{color:'#3b82f6', fontSize:22, fontWeight:700, margin:0}}>{nearPoc.length}</p>
                    <p style={{color:'#94a3b8', fontSize:11, margin:0}}>NEAR POC (&lt;3%)</p>
                  </div>
                </div>
              </div>

              {/* Visual VP Cards */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:16, marginTop:20}}>
                {pocStocks.slice(0, 20).map(a => {
                  const sig = getSignal(a);
                  const dist = a.vp_distribution || [];
                  const vaLow = a.value_area_low || 0;
                  const vaHigh = a.value_area_high || 0;

                  return (
                    <div key={a.ticker} onClick={() => setSelectedStock(a)}
                      style={{
                        background:'#1e293b', borderRadius:16, padding:20, cursor:'pointer',
                        border: a.poc_distance <= 1 ? '2px solid #8b5cf6' : a.poc_distance <= 3 ? '1px solid #3b82f6' : '1px solid #334155',
                        transition:'all 0.2s',
                      }}
                      onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>

                      {/* Header */}
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{fontSize:18, fontWeight:700}}>{a.ticker}</span>
                          <span style={{color:'#94a3b8', fontSize:12}}>{a.sector_code}</span>
                          {a.poc_distance <= 1 && <span style={{background:'#8b5cf620', color:'#8b5cf6', padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700}}>AT POC</span>}
                        </div>
                        <span style={{background:sig.bg, color:sig.color, padding:'4px 10px', borderRadius:16, fontSize:12, fontWeight:700}}>{sig.icon} {sig.label}</span>
                      </div>

                      {/* Price + POC */}
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:16}}>
                        <div>
                          <p style={{fontSize:24, fontWeight:700, margin:0}}>${a.price?.toFixed(2)}</p>
                          <p style={{color: a.change_pct >= 0 ? '#22c55e' : '#ef4444', fontSize:13, margin:'2px 0 0', fontWeight:600}}>
                            {a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%
                          </p>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <p style={{color:'#8b5cf6', fontSize:12, margin:0}}>POC</p>
                          <p style={{color:'#8b5cf6', fontSize:20, fontWeight:700, margin:0}}>${a.poc_price?.toFixed(2)}</p>
                          <p style={{color: a.poc_distance <= 1 ? '#8b5cf6' : a.poc_distance <= 3 ? '#3b82f6' : '#94a3b8', fontSize:12, margin:0, fontWeight:600}}>
                            {a.poc_distance?.toFixed(2)}% {a.poc_position}
                          </p>
                        </div>
                      </div>

                      {/* Volume Profile Visual */}
                      {dist.length > 0 ? (
                        <div style={{marginBottom:12}}>
                          <p style={{fontSize:11, color:'#64748b', margin:'0 0 6px'}}>Volume Profile</p>
                          <div style={{display:'flex', flexDirection:'column', gap:1}}>
                            {dist.map((d, idx) => (
                              <div key={idx} style={{display:'flex', alignItems:'center', gap:4, height:8}}>
                                <span style={{fontSize:8, color:'#64748b', width:45, textAlign:'right'}}>{d.price}</span>
                                <div style={{flex:1, height:'100%', background:'#0f172a', borderRadius:2, position:'relative', overflow:'hidden'}}>
                                  <div style={{
                                    width: `${d.volume_pct}%`,
                                    height:'100%',
                                    borderRadius:2,
                                    background: d.is_poc ? '#8b5cf6' : d.in_value_area ? '#3b82f680' : '#475569',
                                  }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Price position indicator */}
                          {vaLow > 0 && vaHigh > 0 && (
                            <div style={{marginTop:8}}>
                              <div style={{display:'flex', justifyContent:'space-between', fontSize:9, color:'#64748b'}}>
                                <span>VA Low ${vaLow}</span>
                                <span style={{color:'#8b5cf6'}}>POC ${a.poc_price}</span>
                                <span>VA High ${vaHigh}</span>
                              </div>
                              <div style={{background:'#334155', borderRadius:6, height:12, position:'relative', marginTop:2}}>
                                <div style={{background:'#3b82f630', height:'100%', borderRadius:6}} />
                                {/* POC line */}
                                {(() => {
                                  const range = vaHigh - vaLow;
                                  if (range <= 0) return null;
                                  const pocPos = Math.min(100, Math.max(0, ((a.poc_price - vaLow) / range) * 100));
                                  const pricePos = Math.min(100, Math.max(0, ((a.price - vaLow) / range) * 100));
                                  return (
                                    <>
                                      <div style={{position:'absolute', top:0, left:`${pocPos}%`, width:2, height:'100%', background:'#8b5cf6'}} />
                                      <div style={{position:'absolute', top:-2, left:`${pricePos}%`, transform:'translateX(-50%)', width:8, height:16, background:'#f1f5f9', borderRadius:4, border:'2px solid #0f172a'}} />
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{background:'#0f172a', borderRadius:8, padding:12, marginBottom:12, textAlign:'center'}}>
                          <p style={{color:'#64748b', fontSize:12, margin:0}}>VP data loading on next refresh...</p>
                        </div>
                      )}

                      {/* Bottom badges */}
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        {getSetupBadge(a.setup_type)}
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>RSI {a.rsi?.toFixed(0)}</span>
                        <span style={{background:'#64748b20', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:10}}>Score {a.setup_score}</span>
                        {a.relative_volume >= 1.5 && <span style={{background:'#eab30820', color:'#eab308', padding:'2px 8px', borderRadius:12, fontSize:10}}>Vol {a.relative_volume?.toFixed(1)}x</span>}
                        {a.candlestick_patterns && a.candlestick_patterns.length > 0 && a.candlestick_patterns.map((p, pi) => (
                          <span key={pi} style={{
                            background: p.type === 'bullish' ? '#22c55e20' : p.type === 'bearish' ? '#ef444420' : '#64748b20',
                            color: p.type === 'bullish' ? '#22c55e' : p.type === 'bearish' ? '#ef4444' : '#94a3b8',
                            padding:'2px 8px', borderRadius:12, fontSize:10
                          }}>{p.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
        {/* ========== SCANNER VIEW ========== */}
        {view === 'scanner' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8}}>
              <h2 style={{fontSize:18, fontWeight:600, margin:0}}>
                {selectedSector ? `${selectedSector} Stocks` : 'All Stocks Scanner'}
              </h2>
              {selectedSector && (
                <button onClick={() => setSelectedSector(null)} style={{background:'#334155', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12}}>Clear</button>
              )}
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
              {sectors.map(s => (
                <button key={s.code} onClick={() => setSelectedSector(s.code)}
                  style={{background: selectedSector === s.code ? '#3b82f6' : '#334155', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12}}>
                  {s.code}
                </button>
              ))}
            </div>
            <div style={{background:'#1e293b', borderRadius:12, overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #334155'}}>
                    {['Ticker','Price','Chg%','Signal','Score','Setup','RSI','MACD','POC','RVol'].map(h => (
                      <th key={h} style={{padding:'10px 12px', textAlign:'left', color:'#64748b', fontSize:11, fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filteredAssets].sort((a,b) => b.setup_score - a.setup_score).map((a, i) => {
                    const sig = getSignal(a);
                    return (
                      <tr key={a.ticker} onClick={() => setSelectedStock(a)}
                        style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032', cursor:'pointer'}}
                        onMouseOver={e => e.currentTarget.style.background='#253048'}
                        onMouseOut={e => e.currentTarget.style.background= i % 2 === 0 ? '#1e293b' : '#162032'}>
                        <td style={{padding:'10px 12px', fontWeight:700, color:'#f1f5f9'}}>{a.ticker}</td>
                        <td style={{padding:'10px 12px'}}>${a.price?.toFixed(2)}</td>
                        <td style={{padding:'10px 12px', color: a.change_pct >= 0 ? '#22c55e' : '#ef4444'}}>
                          {a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%
                        </td>
                        <td style={{padding:'10px 12px'}}>
                          <span style={{background:sig.bg, color:sig.color, padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600}}>{sig.icon} {sig.label}</span>
                        </td>
                        <td style={{padding:'10px 12px'}}><span style={{color:getScoreColor(a.setup_score), fontWeight:700}}>{a.setup_score}</span></td>
                        <td style={{padding:'10px 12px'}}>{getSetupBadge(a.setup_type)}</td>
                        <td style={{padding:'10px 12px', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</td>
                        <td style={{padding:'10px 12px', color: a.macd?.histogram > 0 ? '#22c55e' : '#ef4444', fontSize:11}}>{a.macd?.histogram?.toFixed(4)}</td>
                        <td style={{padding:'10px 12px', color:'#8b5cf6', fontSize:12}}>{a.poc_price ? `$${a.poc_price}` : '-'}</td>
                        <td style={{padding:'10px 12px', color: a.relative_volume >= 1.5 ? '#eab308' : '#94a3b8'}}>{a.relative_volume?.toFixed(2)}x</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ========== SECTORS VIEW ========== */}
        {view === 'sectors' && (
          <>
            <h2 style={{fontSize:18, fontWeight:600, marginBottom:16}}>Sector Analysis</h2>
            <div style={{background:'#1e293b', borderRadius:12, overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #334155'}}>
                    {['#','ETF','Sector','Price','Return 20d','RSI','Trend','Strength','Volume','Score'].map(h => (
                      <th key={h} style={{padding:'12px 16px', textAlign:'left', color:'#64748b', fontSize:12, fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sectors.map((s, i) => (
                    <tr key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}}
                      style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032', cursor:'pointer'}}
                      onMouseOver={e => e.currentTarget.style.background='#253048'}
                      onMouseOut={e => e.currentTarget.style.background= i % 2 === 0 ? '#1e293b' : '#162032'}>
                      <td style={{padding:'12px 16px', fontWeight:700, color:'#64748b'}}>{i+1}</td>
                      <td style={{padding:'12px 16px', fontWeight:700, color:'#3b82f6'}}>{s.code}</td>
                      <td style={{padding:'12px 16px'}}>{s.name}</td>
                      <td style={{padding:'12px 16px'}}>${s.price?.toFixed(2)}</td>
                      <td style={{padding:'12px 16px', color: s.return_20d >= 0 ? '#22c55e' : '#ef4444', fontWeight:600}}>
                        {s.return_20d >= 0 ? '+' : ''}{s.return_20d?.toFixed(2)}%
                      </td>
                      <td style={{padding:'12px 16px', color: s.rsi > 70 ? '#ef4444' : s.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{s.rsi?.toFixed(1)}</td>
                      <td style={{padding:'12px 16px'}}>{s.trend_score}</td>
                      <td style={{padding:'12px 16px', color: s.strength_score >= 0 ? '#22c55e' : '#ef4444'}}>{s.strength_score?.toFixed(2)}</td>
                      <td style={{padding:'12px 16px', color:'#94a3b8'}}>{s.volume_score?.toFixed(1)}</td>
                      <td style={{padding:'12px 16px'}}><span style={{color:getScoreColor(s.composite_score), fontWeight:700, fontSize:16}}>{s.composite_score?.toFixed(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <footer style={{textAlign:'center', padding:24, color:'#475569', fontSize:12, borderTop:'1px solid #1e293b'}}>
        SwingLab v0.3.0 - Swing Trading Analysis & POC Scanner
      </footer>
    </div>
  );
}

export default App;
