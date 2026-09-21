import React, { useMemo, useState } from 'react';
import { getScoreColor, getSetupBadge } from '../utils/helpers';
import StockDetail from './StockDetail';

const PAGE_SIZE = 60;
const money = (input) => input == null ? 'N/D' : `$${Number(input).toFixed(2)}`;

function readMax(asset) {
  const max = asset.max_strategy || {};
  return {
    score: max.max_score,
    phase: max.market_phase?.phase || max.market_phase || 'N/D',
    status: max.entry_plan?.status || 'N/D',
    mode: max.entry_plan?.execution_mode || 'N/D',
    trigger: max.entry_plan?.trigger_price,
    invalidation: max.entry_plan?.invalidation_price,
    stale: asset.data_status === 'STALE_OR_DELISTED' || asset.data_eligible === false
  };
}

export default function Stocks({ assets = [], selectedSector, setSelectedSector, selectedStock, setSelectedStock, livePrices = {}, onBuy, onLoadFullStock, mlPredictions = {}, trendPredictions = {} }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('MAX');
  const [compact, setCompact] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const stats = useMemo(() => ({
    fresh: assets.filter((item) => item.data_status === 'FRESH' && item.data_eligible !== false).length,
    stale: assets.filter((item) => item.data_status === 'STALE_OR_DELISTED' || item.data_eligible === false).length,
    armed: assets.filter((item) => item.max_strategy?.entry_plan?.status === 'ARMED').length,
    triggered: assets.filter((item) => item.max_strategy?.entry_plan?.status === 'TRIGGERED').length,
    wait: assets.filter((item) => item.max_strategy?.entry_plan?.status === 'WAIT_RETEST').length
  }), [assets]);

  const sectors = useMemo(() => [...new Set(assets.map((item) => item.sector_code).filter(Boolean))].sort(), [assets]);

  const rows = useMemo(() => {
    const needle = query.trim().toUpperCase();
    const filtered = assets.filter((asset) => {
      const max = readMax(asset);
      if (selectedSector && asset.sector_code !== selectedSector) return false;
      if (needle && !asset.ticker?.includes(needle) && !asset.name?.toUpperCase()?.includes(needle)) return false;
      if (filter === 'TRADE_READY' && !asset.max_strategy?.trade_ready) return false;
      if (['ARMED', 'TRIGGERED', 'WAIT_RETEST', 'DETECTED', 'BLOCKED'].includes(filter) && max.status !== filter) return false;
      if (filter === 'FALLING_KNIFE' && max.phase !== 'FALLING_KNIFE_WAIT') return false;
      if (filter === 'MATURE_MARKUP' && max.phase !== 'MATURE_MARKUP_BLOCK') return false;
      if (filter === 'STALE' && !max.stale) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === 'TICKER') return a.ticker.localeCompare(b.ticker);
      if (sort === 'CHANGE') return (b.change_pct || 0) - (a.change_pct || 0);
      if (sort === 'SETUP') return (b.setup_score || 0) - (a.setup_score || 0);
      return (b.max_strategy?.max_score || 0) - (a.max_strategy?.max_score || 0);
    });
  }, [assets, selectedSector, query, filter, sort]);

  if (selectedStock) {
    return <StockDetail stock={selectedStock} onBack={() => setSelectedStock(null)} onBuy={onBuy} livePrice={livePrices[selectedStock.ticker]} mlScore={mlPredictions[selectedStock.ticker]} trendData={trendPredictions[selectedStock.ticker]} />;
  }

  const control = { background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: 8, padding: '9px 10px', fontSize: 12 };

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
      <div><h2 style={{ margin: 0 }}>Stock Intelligence</h2><div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>Universo 300 · Max Strategy live OFF</div></div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{[['Freschi', stats.fresh, '#22c55e'], ['Stale', stats.stale, '#ef4444'], ['ARMED', stats.armed, '#3b82f6'], ['TRIGGERED', stats.triggered, '#f97316'], ['WAIT', stats.wait, '#eab308']].map(([label, number, color]) => <div key={label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, minWidth: 66, padding: 7, textAlign: 'center' }}><div style={{ color, fontWeight: 900 }}>{number}</div><div style={{ color: '#64748b', fontSize: 9 }}>{label}</div></div>)}</div>
    </div>

    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(PAGE_SIZE); }} placeholder="Cerca ticker o nome" style={{ ...control, flex: '2 1 220px' }} />
        <select value={selectedSector || ''} onChange={(event) => { setSelectedSector(event.target.value || null); setVisible(PAGE_SIZE); }} style={{ ...control, flex: '1 1 150px' }}><option value="">Tutti i settori</option>{sectors.map((sector) => <option key={sector}>{sector}</option>)}</select>
        <select value={filter} onChange={(event) => { setFilter(event.target.value); setVisible(PAGE_SIZE); }} style={{ ...control, flex: '1 1 160px' }}><option value="ALL">Tutti gli stati</option><option value="TRADE_READY">Trade Ready</option><option value="ARMED">ARMED</option><option value="TRIGGERED">TRIGGERED</option><option value="WAIT_RETEST">WAIT_RETEST</option><option value="DETECTED">DETECTED</option><option value="FALLING_KNIFE">Falling Knife</option><option value="MATURE_MARKUP">Mature Markup</option><option value="STALE">Stale</option></select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} style={{ ...control, flex: '1 1 140px' }}><option value="MAX">Max Score</option><option value="SETUP">Setup Score</option><option value="CHANGE">Variazione</option><option value="TICKER">Ticker A-Z</option></select>
        <button onClick={() => setCompact(!compact)} style={{ ...control, cursor: 'pointer', fontWeight: 700 }}>{compact ? 'Vista ampia' : 'Vista compatta'}</button>
      </div>
      <div style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>{rows.length} risultati · {Math.min(visible, rows.length)} visualizzati</div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 245 : 315}px, 1fr))`, gap: 10 }}>
      {rows.slice(0, visible).map((asset) => {
        const max = readMax(asset);
        const live = livePrices[asset.ticker];
        const current = live?.price ?? asset.price;
        const change = live?.change_pct ?? asset.change_pct ?? 0;
        const color = max.status === 'ARMED' ? '#3b82f6' : max.status === 'TRIGGERED' ? '#f97316' : max.status === 'WAIT_RETEST' ? '#eab308' : max.stale ? '#ef4444' : '#64748b';
        return <button key={asset.ticker} onClick={() => onLoadFullStock(asset.ticker)} style={{ background: '#0f172a', color: 'white', border: `1px solid ${color}55`, borderRadius: 10, padding: compact ? 11 : 14, textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><strong>{asset.ticker}</strong><span style={{ color: '#64748b', fontSize: 10, marginLeft: 6 }}>{asset.sector_code}</span></div><div style={{ textAlign: 'right' }}><strong>{money(current)}</strong><div style={{ color: change >= 0 ? '#22c55e' : '#ef4444', fontSize: 10 }}>{change >= 0 ? '+' : ''}{Number(change).toFixed(2)}%</div></div></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}><span style={{ color: getScoreColor(asset.setup_score), fontWeight: 800 }}>Setup {asset.setup_score ?? 'N/D'}</span>{getSetupBadge(asset.setup_type)}<span style={{ color: '#8b5cf6', fontWeight: 800 }}>Max {max.score ?? 'N/D'}</span></div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}><span style={{ color, background: `${color}18`, borderRadius: 5, padding: '2px 6px', fontSize: 9, fontWeight: 800 }}>{max.status}</span><span style={{ color: '#94a3b8', background: '#1e293b', borderRadius: 5, padding: '2px 6px', fontSize: 9 }}>{max.phase}</span><span style={{ color: '#94a3b8', background: '#1e293b', borderRadius: 5, padding: '2px 6px', fontSize: 9 }}>{max.mode}</span></div>
          {!compact && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, color: '#94a3b8', fontSize: 10, marginTop: 9 }}><div>Trigger <strong style={{ color: 'white' }}>{money(max.trigger)}</strong></div><div>Invalidazione <strong style={{ color: 'white' }}>{money(max.invalidation)}</strong></div><div>RSI <strong style={{ color: 'white' }}>{asset.rsi?.toFixed(0) ?? 'N/D'}</strong></div><div>Rel Vol <strong style={{ color: 'white' }}>{asset.relative_volume?.toFixed(1) ?? 'N/D'}x</strong></div></div>}
        </button>;
      })}
    </div>
    {visible < rows.length && <div style={{ textAlign: 'center', marginTop: 18 }}><button onClick={() => setVisible((count) => count + PAGE_SIZE)} style={{ ...control, cursor: 'pointer', fontWeight: 800 }}>Mostra altri {Math.min(PAGE_SIZE, rows.length - visible)}</button></div>}
  </div>;
}
