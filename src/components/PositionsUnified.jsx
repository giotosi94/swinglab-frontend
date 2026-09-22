import React, { useEffect, useMemo, useState } from 'react';
import { API } from '../utils/constants';
import { getSetupBadge } from '../utils/helpers';
import { fetchPositionsDetail } from '../utils/api';

const TARGET_SIZES = { t1: 30, t2: 30, t3: 25 };

function normalizeLivePrices(payload) {
  const source = payload?.prices || payload?.live_prices || payload?.data || payload || {};
  const map = {};

  if (Array.isArray(source)) {
    source.forEach((item) => {
      const ticker = item?.ticker || item?.symbol;
      if (ticker) map[ticker] = item;
    });
    return map;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (value && typeof value === 'object') map[key] = value;
  });

  return map;
}

export default function PositionsUnified({
  alpacaData,
  assets = [],
  livePrices = {},
  onLoadFullStock,
  setSelectedStock,
  setView,
}) {
  const [positionsDetail, setPositionsDetail] = useState({});
  const [adaptiveTargets, setAdaptiveTargets] = useState({});
  const [expanded, setExpanded] = useState({});
  const [internalLivePrices, setInternalLivePrices] = useState({});
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      try {
        const [detailData, targetsResponse] = await Promise.all([
          fetchPositionsDetail(),
          fetch(`${API}/api/agents/apm/position-targets`).then((response) => response.json()),
        ]);

        if (!active) return;

        if (detailData?.positions) {
          const detailMap = {};
          detailData.positions.forEach((position) => {
            detailMap[position.ticker] = position;
          });
          setPositionsDetail(detailMap);
        }

        if (targetsResponse?.positions) {
          const targetsMap = {};
          targetsResponse.positions.forEach((position) => {
            targetsMap[position.ticker] = position;
          });
          setAdaptiveTargets(targetsMap);
        }

        setUpdatedAt(new Date());
      } catch (error) {
        console.error('Positions load failed', error);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [alpacaData]);

  useEffect(() => {
    let active = true;

    async function loadLivePrices() {
      try {
        const response = await fetch(`${API}/api/data/live`);
        if (!response.ok) return;

        const payload = await response.json();
        if (!active) return;

        setInternalLivePrices(normalizeLivePrices(payload));
        setUpdatedAt(new Date());
      } catch (error) {
        console.error('Live prices load failed', error);
      }
    }

    loadLivePrices();
    const timer = setInterval(loadLivePrices, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const assetMap = useMemo(() => {
    const map = {};
    assets.forEach((asset) => {
      map[asset.ticker] = asset;
    });
    return map;
  }, [assets]);

  const mergedLivePrices = useMemo(
    () => ({ ...internalLivePrices, ...livePrices }),
    [internalLivePrices, livePrices],
  );

  const positions = alpacaData?.positions || [];

  const toggleExpand = (ticker) => {
    setExpanded((previous) => ({ ...previous, [ticker]: !previous[ticker] }));
  };

  const openStock = (ticker) => {
    if (onLoadFullStock) {
      onLoadFullStock(ticker);
      return;
    }

    if (setSelectedStock) setSelectedStock(ticker);
    if (setView) setView('stock');
  };

  if (positions.length === 0) {
    return (
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>Nessuna posizione aperta</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>SwingLab aprirà nuove posizioni quando Alpha e Risk approveranno un setup.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>Posizioni gestite da SwingLab</h3>
          <div style={{ color: '#64748b', fontSize: 10, marginTop: 3 }}>
            Gestione automatica APM ed Executor. Scale-out reali 30% / 30% / 25% sulla quantità residua.
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: 10 }}>
          {updatedAt ? `Prezzi aggiornati ${updatedAt.toLocaleTimeString('it-IT')}` : 'Aggiornamento in corso'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {positions.map((position) => {
          const ticker = position.symbol;
          const detail = positionsDetail[ticker] || {};
          const adaptive = adaptiveTargets[ticker];
          const asset = assetMap[ticker] || {};
          const live = mergedLivePrices[ticker] || {};
          const isExpanded = Boolean(expanded[ticker]);
          const pnlPct = Number(position.pnl_pct ?? detail.pnl_pct ?? 0);
          const pnl = Number(position.pnl ?? detail.pnl ?? 0);
          const currentPrice = Number(live.price ?? live.current_price ?? position.current_price ?? detail.current_price ?? asset.price ?? 0);
          const entryPrice = Number(position.entry_price ?? position.avg_entry_price ?? detail.entry_price ?? 0);
          const quantity = Number(position.qty ?? detail.qty ?? 0);
          const marketValue = Number(position.market_value ?? currentPrice * quantity ?? 0);
          const stop = Number(detail.stop_loss || 0);
          const target = Number(detail.target || 0);
          const lastTarget = Number(adaptive?.last_target_hit ?? detail.last_target_hit ?? 0);
          const protectedPosition = stop > 0;
          const setupType = detail.setup_type || asset.setup_type;
          const canOpenStock = Boolean(onLoadFullStock || setSelectedStock || setView);

          return (
            <div key={ticker} style={{ background: '#111827', border: `1px solid ${protectedPosition ? '#1e293b' : '#ef444466'}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => openStock(ticker)}
                      disabled={!canOpenStock}
                      title={canOpenStock ? `Apri analisi completa ${ticker}` : ticker}
                      style={{
                        border: 0,
                        background: 'transparent',
                        padding: 0,
                        color: '#f8fafc',
                        fontSize: 16,
                        fontWeight: 800,
                        cursor: canOpenStock ? 'pointer' : 'default',
                        textDecoration: canOpenStock ? 'underline' : 'none',
                        textDecorationColor: '#334155',
                        textUnderlineOffset: 4,
                      }}
                    >
                      {ticker}
                    </button>
                    {setupType && getSetupBadge(setupType)}
                    <span style={{ color: protectedPosition ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 700 }}>
                      {protectedPosition ? 'PROTETTA' : 'STOP MANCANTE'}
                    </span>
                    {detail.apm_managed && (
                      <span style={{ color: '#a78bfa', background: '#8b5cf622', border: '1px solid #8b5cf644', borderRadius: 10, padding: '2px 7px', fontSize: 9, fontWeight: 700 }}>
                        APM T{lastTarget}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => openStock(ticker)}
                      disabled={!canOpenStock}
                      style={{
                        minWidth: 94,
                        textAlign: 'right',
                        border: 0,
                        background: 'transparent',
                        padding: 0,
                        cursor: canOpenStock ? 'pointer' : 'default',
                      }}
                    >
                      <div style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.04em' }}>Prezzo attuale</div>
                      <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16, marginTop: 2 }}>
                        {currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : 'N/D'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 9, marginTop: 2 }}>
                        Entry {entryPrice > 0 ? `$${entryPrice.toFixed(2)}` : 'N/D'}
                      </div>
                    </button>

                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                      <div style={{ color: pnlPct >= 0 ? '#22c55e' : '#ef4444', fontWeight: 800, fontSize: 16 }}>
                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                      <div style={{ color: '#64748b', fontSize: 10 }}>
                        {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                      </div>
                    </div>

                    {canOpenStock && (
                      <button
                        type="button"
                        onClick={() => openStock(ticker)}
                        style={{ padding: '5px 10px', borderRadius: 6, background: '#172554', color: '#93c5fd', border: '1px solid #1d4ed8', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                      >
                        Apri stock
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(ticker)}
                      style={{ padding: '5px 10px', borderRadius: 6, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', cursor: 'pointer', fontSize: 11 }}
                    >
                      {isExpanded ? 'Nascondi' : 'Dettagli'}
                    </button>
                  </div>
                </div>

                {adaptive?.targets && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 10 }}>
                    {['t1', 't2', 't3'].map((key) => {
                      const item = adaptive.targets[key] || {};
                      const size = Number(item.size_pct ?? TARGET_SIZES[key]);

                      return (
                        <div key={key} style={{ background: item.reached ? '#22c55e22' : '#0f172a', border: `1px solid ${item.reached ? '#22c55e55' : '#1e293b'}`, borderRadius: 7, padding: '6px 8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                            <span style={{ color: item.reached ? '#22c55e' : '#94a3b8', fontWeight: 700 }}>{key.toUpperCase()} ({size}%)</span>
                            <span style={{ color: '#64748b' }}>{item.reached ? 'raggiunto' : `${Number(item.progress || 0).toFixed(0)}%`}</span>
                          </div>
                          <div style={{ color: '#cbd5e1', fontSize: 11, marginTop: 3 }}>${Number(item.price || item.target_price || 0).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid #1e293b', padding: 12, background: '#0b1220' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                    {[
                      ['Quantità', quantity.toFixed(4)],
                      ['Entry', `$${entryPrice.toFixed(2)}`],
                      ['Prezzo attuale', currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : 'N/D'],
                      ['Valore posizione', marketValue > 0 ? `$${marketValue.toFixed(2)}` : 'N/D'],
                      ['Stop effettivo', stop > 0 ? `$${stop.toFixed(2)}` : 'Assente'],
                      ['Target finale', target > 0 ? `$${target.toFixed(2)}` : 'N/D'],
                      ['R/R residuo', Number(detail.risk_reward || 0).toFixed(2)],
                      ['Holding', `${Number(detail.days_held || 0)} giorni`],
                      ['Confluence entry', Number(detail.confluence || 0).toFixed(1)],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: '#111827', borderRadius: 7, padding: 8 }}>
                        <div style={{ color: '#64748b', fontSize: 9 }}>{label}</div>
                        <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700, marginTop: 3 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
