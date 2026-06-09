import React from 'react';
import { NAV_ITEMS } from '../utils/constants';
import { getRegimeColor } from '../utils/helpers';

export default function Navbar({
  view, setView, searchQuery, setSearchQuery, handleSearch,
  searching, traderData, setSelectedStock, setSelectedSector,
}) {
  return (
    <div
      style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      {/* Logo + version + regime */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>SwingLab</span>
        <span
          style={{
            fontSize: 10,
            color: '#64748b',
            background: '#1e293b',
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          v0.3
        </span>
        {traderData?.market?.regime && (
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 6,
              fontWeight: 600,
              background: getRegimeColor(traderData.market.regime) + '20',
              color: getRegimeColor(traderData.market.regime),
            }}
          >
            {traderData.market.regime}
            {traderData.market.confidence ? ` ${traderData.market.confidence}%` : ''}
          </span>
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setView(n.id);
              setSelectedStock(null);
              setSelectedSector(null);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: view === n.id ? '#3b82f6' : 'transparent',
              color: view === n.id ? 'white' : '#94a3b8',
            }}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search ticker..."
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #334155',
            background: '#1e293b',
            color: 'white',
            fontSize: 12,
            width: 120,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {searching ? '...' : '\uD83D\uDD0D'}
        </button>
      </div>
    </div>
  );
}
