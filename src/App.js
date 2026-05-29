import React, { useState, useEffect } from 'react';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'https://swinglab-backend.onrender.com';

function App() {
  const [sectors, setSectors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [view, setView] = useState('dashboard');
  const [selectedSector, setSelectedSector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [secRes, assRes] = await Promise.all([
        fetch(`${API}/api/sectors`),
        fetch(`${API}/api/assets?limit=110`)
      ]);
      setSectors(await secRes.json());
      setAssets(await assRes.json());
    } catch (e) {
      console.error('Fetch error:', e);
    }
    setLoading(false);
  };

  const topSetups = [...assets].sort((a, b) => b.setup_score - a.setup_score).slice(0, 10);
  const filteredAssets = selectedSector
    ? assets.filter(a => a.sector_code === selectedSector)
    : assets;

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
    return (
      <span style={{background:s.bg, color:s.color, padding:'2px 8px', borderRadius:12, fontSize:12, fontWeight:600}}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0f172a',color:'white',fontSize:24}}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{background:'#0f172a', minHeight:'100vh', color:'#e2e8f0'}}>
      <header style={{background:'#1e293b', padding:'16px 24px', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{fontSize:28}}>🔬</span>
          <div>
            <h1 style={{margin:0, fontSize:22, fontWeight:700, color:'#f1f5f9'}}>SwingLab</h1>
            <p style={{margin:0, fontSize:12, color:'#64748b'}}>Swing Trading Analysis</p>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          {['dashboard','scanner','sectors'].map(v => (
            <button key={v} onClick={() => {setView(v); setSelectedSector(null);}}
              style={{background: view===v ? '#3b82f6' : '#334155', color:'white', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13}}>
              {v === 'dashboard' ? 'Dashboard' : v === 'scanner' ? 'Scanner' : 'Sectors'}
            </button>
          ))}
        </div>
      </header>

      <main style={{padding:24, maxWidth:1200, margin:'0 auto'}}>
        {view === 'dashboard' && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:24}}>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #3b82f6'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Sectors</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#f1f5f9'}}>{sectors.length}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #22c55e'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Stocks</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#f1f5f9'}}>{assets.length}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #eab308'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Top Score</p>
                <p style={{fontSize:28, fontWeight:700, margin:'8px 0 0', color:'#22c55e'}}>{topSetups[0]?.setup_score || '-'}</p>
              </div>
              <div style={{background:'#1e293b', borderRadius:12, padding:20, borderLeft:'4px solid #8b5cf6'}}>
                <p style={{color:'#64748b', fontSize:13, margin:0}}>Best Setup</p>
                <p style={{fontSize:20, fontWeight:700, margin:'8px 0 0', color:'#f1f5f9'}}>{topSetups[0]?.ticker || '-'}</p>
              </div>
            </div>

            <h2 style={{fontSize:18, fontWeight:600, marginBottom:12}}>Sector Ranking</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:32}}>
              {sectors.map(s => (
                <div key={s.code} onClick={() => {setSelectedSector(s.code); setView('scanner');}}
                  style={{background:'#1e293b', borderRadius:12, padding:16, cursor:'pointer', border:'1px solid #334155', transition:'all 0.2s'}}
                  onMouseOver={e => e.currentTarget.style.borderColor='#3b82f6'}
                  onMouseOut={e => e.currentTarget.style.borderColor='#334155'}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontWeight:700, fontSize:14}}>{s.code}</span>
                    <span style={{color: getScoreColor(s.composite_score), fontWeight:700, fontSize:16}}>{s.composite_score?.toFixed(1)}</span>
                  </div>
                  <p style={{fontSize:11, color:'#94a3b8', margin:'4px 0'}}>{s.name}</p>
                  <p style={{fontSize:18, fontWeight:600, margin:'4px 0'}}>${s.price?.toFixed(2)}</p>
                  <p style={{fontSize:12, color: s.return_20d >= 0 ? '#22c55e' : '#ef4444', margin:0}}>
                    {s.return_20d >= 0 ? '+' : ''}{s.return_20d?.toFixed(2)}% (20d)
                  </p>
                </div>
              ))}
            </div>

            <h2 style={{fontSize:18, fontWeight:600, marginBottom:12}}>Top 10 Setups</h2>
            <div style={{background:'#1e293b', borderRadius:12, overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #334155'}}>
                    {['#','Ticker','Price','Score','Setup','RSI','Sector','POC'].map(h => (
                      <th key={h} style={{padding:'12px 16px', textAlign:'left', color:'#64748b', fontSize:12, fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topSetups.map((a, i) => (
                    <tr key={a.ticker} style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032'}}>
                      <td style={{padding:'12px 16px', fontWeight:700, color:'#64748b'}}>{i+1}</td>
                      <td style={{padding:'12px 16px', fontWeight:700, color:'#f1f5f9', fontSize:15}}>{a.ticker}</td>
                      <td style={{padding:'12px 16px'}}>${a.price?.toFixed(2)}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{color:getScoreColor(a.setup_score), fontWeight:700, fontSize:16}}>{a.setup_score}</span>
                      </td>
                      <td style={{padding:'12px 16px'}}>{getSetupBadge(a.setup_type)}</td>
                      <td style={{padding:'12px 16px', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</td>
                      <td style={{padding:'12px 16px', color:'#94a3b8', fontSize:12}}>{a.sector_code}</td>
                      <td style={{padding:'12px 16px', color:'#8b5cf6'}}>{a.poc_price ? `$${a.poc_price.toFixed(2)}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'scanner' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <h2 style={{fontSize:18, fontWeight:600}}>
                {selectedSector ? `${selectedSector} Stocks` : 'All Stocks Scanner'}
              </h2>
              {selectedSector && (
                <button onClick={() => setSelectedSector(null)}
                  style={{background:'#334155', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12}}>
                  Clear Filter
                </button>
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
                    {['Ticker','Price','Chg%','Score','Setup','RSI','MACD','POC','VA High','VA Low','RVol'].map(h => (
                      <th key={h} style={{padding:'10px 12px', textAlign:'left', color:'#64748b', fontSize:11, fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filteredAssets].sort((a,b) => b.setup_score - a.setup_score).map((a, i) => (
                    <tr key={a.ticker} style={{borderBottom:'1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032'}}>
                      <td style={{padding:'10px 12px', fontWeight:700, color:'#f1f5f9'}}>{a.ticker}</td>
                      <td style={{padding:'10px 12px'}}>${a.price?.toFixed(2)}</td>
                      <td style={{padding:'10px 12px', color: a.change_pct >= 0 ? '#22c55e' : '#ef4444'}}>
                        {a.change_pct >= 0 ? '+' : ''}{a.change_pct?.toFixed(2)}%
                      </td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{color:getScoreColor(a.setup_score), fontWeight:700}}>{a.setup_score}</span>
                      </td>
                      <td style={{padding:'10px 12px'}}>{getSetupBadge(a.setup_type)}</td>
                      <td style={{padding:'10px 12px', color: a.rsi > 70 ? '#ef4444' : a.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{a.rsi?.toFixed(1)}</td>
                      <td style={{padding:'10px 12px', color: a.macd?.histogram > 0 ? '#22c55e' : '#ef4444', fontSize:11}}>
                        {a.macd?.histogram?.toFixed(4)}
                      </td>
                      <td style={{padding:'10px 12px', color:'#8b5cf6', fontSize:12}}>{a.poc_price ? `$${a.poc_price}` : '-'}</td>
                      <td style={{padding:'10px 12px', fontSize:12, color:'#94a3b8'}}>{a.value_area_high ? `$${a.value_area_high}` : '-'}</td>
                      <td style={{padding:'10px 12px', fontSize:12, color:'#94a3b8'}}>{a.value_area_low ? `$${a.value_area_low}` : '-'}</td>
                      <td style={{padding:'10px 12px', color: a.relative_volume >= 1.5 ? '#eab308' : '#94a3b8', fontWeight: a.relative_volume >= 1.5 ? 700 : 400}}>
                        {a.relative_volume?.toFixed(2)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

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
                      <td style={{padding:'12px 16px', color:'#f1f5f9'}}>{s.name}</td>
                      <td style={{padding:'12px 16px'}}>${s.price?.toFixed(2)}</td>
                      <td style={{padding:'12px 16px', color: s.return_20d >= 0 ? '#22c55e' : '#ef4444', fontWeight:600}}>
                        {s.return_20d >= 0 ? '+' : ''}{s.return_20d?.toFixed(2)}%
                      </td>
                      <td style={{padding:'12px 16px', color: s.rsi > 70 ? '#ef4444' : s.rsi < 30 ? '#22c55e' : '#e2e8f0'}}>{s.rsi?.toFixed(1)}</td>
                      <td style={{padding:'12px 16px'}}>{s.trend_score}</td>
                      <td style={{padding:'12px 16px', color: s.strength_score >= 0 ? '#22c55e' : '#ef4444'}}>{s.strength_score?.toFixed(2)}</td>
                      <td style={{padding:'12px 16px', color:'#94a3b8'}}>{s.volume_score?.toFixed(1)}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{color:getScoreColor(s.composite_score), fontWeight:700, fontSize:16}}>{s.composite_score?.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <footer style={{textAlign:'center', padding:24, color:'#475569', fontSize:12, borderTop:'1px solid #1e293b'}}>
        SwingLab v0.2.0 - Swing Trading Analysis & POC Scanner
      </footer>
    </div>
  );
}

export default App;
