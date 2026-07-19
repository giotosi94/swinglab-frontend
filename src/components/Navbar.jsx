import React, { useState, useEffect, useRef } from 'react';
import { NAV_ITEMS } from '../utils/constants';
import { getRegimeColor } from '../utils/helpers';
import { fetchAllTickers } from '../utils/api';

export default function Navbar({
  view, setView, searchQuery, setSearchQuery, handleSearch,
  searching, traderData, setSelectedStock, setSelectedSector,
}) {
  const [allTickers, setAllTickers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load ticker list once
  useEffect(() => {
    fetchAllTickers()
      .then(data => {
        if (data && data.tickers) {
          setAllTickers(data.tickers);
        }
      })
      .catch(() => {});
  }, []);

  // Filter tickers based on search query
  const filteredTickers = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    const q = searchQuery.toLowerCase().trim();
    return allTickers
      .filter(t =>
        t.ticker.toLowerCase().startsWith(q) ||
        t.name.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // Priorità: ticker che iniziano con query
        const aStarts = a.ticker.toLowerCase().startsWith(q);
        const bStarts = b.ticker.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.ticker.localeCompare(b.ticker);
      })
      .slice(0, 8);
  }, [searchQuery, allTickers]);

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTicker = (ticker) => {
    setSearchQuery(ticker);
    setShowDropdown(false);
    // Trigger search
    setTimeout(() => handleSearch(ticker), 50);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredTickers.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredTickers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTickers[selectedIndex]) {
        handleSelectTicker(filteredTickers[selectedIndex].ticker);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Highlight matching characters
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const q = query.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: '#3b82f6', fontWeight: 700 }}>{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

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
        position: 'relative',
      }}
    >
      {/* Logo + version + regime */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>SwingLab</span>
        <span
          style={{
            fontSize: 11,
            color: '#8b5cf6',
            background: 'linear-gradient(135deg, #8b5cf620 0%, #3b82f620 100%)',
            padding: '3px 10px',
            borderRadius: 6,
            fontWeight: 700,
            border: '1px solid #8b5cf644',
            letterSpacing: 0.5,
          }}
        >
          v4.7 · ADAPTIVE
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

      {/* 🆕 v4.2 — Search with autocomplete dropdown */}
      <div ref={searchRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search ticker or name..."
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #334155',
            background: '#1e293b',
            color: 'white',
            fontSize: 12,
            width: 200,
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

        {/* Autocomplete Dropdown */}
        {showDropdown && filteredTickers.length > 0 && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              width: 320,
              maxHeight: 400,
              overflowY: 'auto',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
          >
            {filteredTickers.map((t, i) => (
              <div
                key={t.ticker}
                onClick={() => handleSelectTicker(t.ticker)}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: i === selectedIndex ? '#3b82f6' : 'transparent',
                  borderBottom: i < filteredTickers.length - 1 ? '1px solid #334155' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontWeight: 700,
                    color: i === selectedIndex ? 'white' : '#3b82f6',
                    fontSize: 13,
                  }}>
                    {highlightMatch(t.ticker, searchQuery)}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: i === selectedIndex ? 'rgba(255,255,255,0.85)' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {highlightMatch(t.name, searchQuery)}
                  </span>
                </div>
                {t.sector && (
                  <span style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: i === selectedIndex ? 'rgba(255,255,255,0.2)' : '#0f172a',
                    color: i === selectedIndex ? 'white' : '#64748b',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {t.sector}
                  </span>
                )}
              </div>
            ))}
            <div style={{
              padding: '6px 12px',
              fontSize: 10,
              color: '#64748b',
              background: '#0f172a',
              borderTop: '1px solid #334155',
              textAlign: 'center',
            }}>
              ↑↓ Navigate · Enter to select · Esc to close
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
