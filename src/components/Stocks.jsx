import React from 'react';
import { getScoreColor, getSetupBadge } from '../utils/helpers';
import StockDetail from './StockDetail';

export default function Stocks({
  assets, selectedSector, setSelectedSector,
  selectedStock, setSelectedStock, livePrices, onBuy, onLoadFullStock,mlPredictions,
  trendPredictions,
}) {
  const getLivePrice = (t) => livePrices[t] || null;
  const filteredAssets = selectedSector
    ? assets.filter((a) => a.sector_code === selectedSector)
    : assets;

  if (selectedStock) {
    return <StockDetail stock={selectedStock} onBack={() => setSelectedStock(null)} onBuy={onBuy} livePrice={livePrices[selectedStock.ticker]} mlScore={mlPredictions[selectedStock.ticker]} trendData={trendPredictions[selectedStock.ticker]} />;
  }
  }
return <StockDetail stock={selectedStock} onBack={() => setSelectedStock(null)} onBuy={onBuy} livePrice={livePrices[selectedStock.ticker]} mlScore={mlPredictions[selectedStock.ticker]} trendData={trendPredictions[selectedStock.ticker]} />;
  return (
    <div>
      {selectedSector && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setSelectedSector(null)}
            style={{
              background: '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {'\u2190'} All
          </button>
          <span style={{ color: '#64748b', marginLeft: 8 }}>{selectedSector}</span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {[...filteredAssets]
          .sort((a, b) => b.setup_score - a.setup_score)
          .map((a) => {
            const live = getLivePrice(a.ticker);
            return (
              <div
                key={a.ticker}
                onClick={() => onLoadFullStock(a.ticker)}
                style={{
                  background: '#0f172a',
                  borderRadius: 10,
                  padding: 12,
                  cursor: 'pointer',
                  border: '1px solid #1e293b',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700 }}>{a.ticker}</span>{' '}
                    <span style={{ color: '#64748b', fontSize: 11 }}>
                      {a.sector_code}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>
                      ${live?.price || a.price}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        marginLeft: 6,
                        color:
                          (live?.change_pct || a.change_pct) >= 0
                            ? '#22c55e'
                            : '#ef4444',
                      }}
                    >
                      {(live?.change_pct || a.change_pct) >= 0 ? '+' : ''}
                      {(live?.change_pct || a.change_pct)?.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span
                      style={{
                        color: getScoreColor(a.setup_score),
                        fontWeight: 700,
                      }}
                    >
                      {a.setup_score}
                    </span>
                    {getSetupBadge(a.setup_type)}
                  </div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>
                    RSI {a.rsi?.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
