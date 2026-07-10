import React, { useEffect, useRef } from 'react';

/**
 * 🎯 TradingView Advanced Chart Widget
 * 
 * Sostituisce i grafici custom con TradingView professionale.
 * - Zero costi Twelve Data (TradingView è gratis)
 * - Real-time updates
 * - Full drawing tools + indicators
 * - Look & feel Bloomberg-style
 * 
 * Props:
 *   ticker: string (es. "AAPL", "SNAP", "NVDA")
 *   height: number (default 500)
 *   theme: "dark" | "light" (default "dark")
 */
export default function TradingViewChart({ 
  ticker = 'SPY', 
  height = 500,
  theme = 'dark',
}) {
  const containerRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Pulisci container precedente
    containerRef.current.innerHTML = '';
    
    // Crea container per widget
    const widgetContainer = document.createElement('div');
    widgetContainer.style.height = `${height}px`;
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    // Rimuovi script vecchio se esiste
    const oldScript = document.getElementById(`tv-script-${ticker}`);
    if (oldScript) oldScript.remove();
    
    // Crea script TradingView
    const script = document.createElement('script');
    script.id = `tv-script-${ticker}`;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Config widget
    const config = {
      autosize: true,
      symbol: ticker,
      interval: 'D',              // Default: Daily. User può cambiare
      timezone: 'Europe/Rome',
      theme: theme,
      style: '1',                  // Candles
      locale: 'it',
      toolbar_bg: '#0f172a',
      enable_publishing: false,
      allow_symbol_change: true,   // User può cambiare ticker
      hide_side_toolbar: false,
      studies: [
        'MASimple@tv-basicstudies',
        'MACD@tv-basicstudies',
        'RSI@tv-basicstudies',
      ],
      support_host: 'https://www.tradingview.com',
    };
    
    script.innerHTML = JSON.stringify(config);
    widgetContainer.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      // Cleanup
      const script = document.getElementById(`tv-script-${ticker}`);
      if (script) script.remove();
    };
  }, [ticker, height, theme]);

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 12,
      padding: 12,
      border: '1px solid #1e293b',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 10,
      }}>
        <h3 style={{ margin: 0, fontSize: 15, color: '#94a3b8' }}>
          📊 {ticker} — Live Chart
        </h3>
        <span style={{
          fontSize: 10,
          padding: '3px 8px',
          borderRadius: 4,
          background: '#3b82f622',
          color: '#3b82f6',
          border: '1px solid #3b82f644',
        }}>
          Powered by TradingView
        </span>
      </div>
      <div ref={containerRef} style={{ minHeight: height }} />
    </div>
  );
}
