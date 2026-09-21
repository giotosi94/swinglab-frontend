import React, { useEffect, useRef, useState } from 'react';

function Widget({ ticker, height, theme }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    ref.current.innerHTML = '';
    const host = document.createElement('div');
    host.style.height = `${height}px`;
    host.style.width = '100%';
    ref.current.appendChild(host);
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: ticker,
      interval: 'D',
      timezone: 'Europe/Rome',
      theme,
      style: '1',
      locale: 'it',
      toolbar_bg: '#0f172a',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      studies: [{ id: 'MASimple@tv-basicstudies', inputs: { length: 200 } }],
      support_host: 'https://www.tradingview.com'
    });
    host.appendChild(script);
    return () => {
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [ticker, height, theme]);

  return <div ref={ref} style={{ minHeight: height, width: '100%' }} />;
}

export default function TradingViewChart({ ticker = 'SPY', height = 500, theme = 'dark' }) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event) => {
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', close);
    };
  }, [fullscreen]);

  const content = (full) => (
    <div style={{ background: '#0f172a', borderRadius: full ? 0 : 12, padding: 12, border: full ? 'none' : '1px solid #1e293b', height: full ? '100vh' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 800 }}>{ticker} · TradingView</div>
          <div style={{ color: '#64748b', fontSize: 10 }}>Daily · SMA 200</div>
        </div>
        <button onClick={() => setFullscreen(!full)} style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: 7, padding: '7px 11px', cursor: 'pointer', fontWeight: 700 }}>
          {full ? '✕ Chiudi' : '⛶ Schermo intero'}
        </button>
      </div>
      <Widget ticker={ticker} height={full ? Math.max(500, window.innerHeight - 72) : height} theme={theme} />
    </div>
  );

  return <>{content(false)}{fullscreen && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#020617' }}>{content(true)}</div>}</>;
}
