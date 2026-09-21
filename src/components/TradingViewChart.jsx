import React, { useEffect, useRef, useState } from 'react';

// Volume Profile Visible Range: mostra la distribuzione dei volumi per
// livello di prezzo sulla porzione di grafico visibile. E' l'indicatore
// che usiamo per leggere POC, Value Area e i nodi volumetrici.
//
// Nota: sui widget pubblici TradingView il Volume Profile e' un indicatore
// premium. Se il tuo account non ha il piano necessario lo studio viene
// ignorato e resta solo la SMA 200: il grafico non si rompe.
const STUDIES = [
  { id: 'VbPVisible@tv-basicstudies' },
  { id: 'MASimple@tv-basicstudies', inputs: { length: 200 } },
];

function Widget({ ticker, height, theme }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;

    ref.current.innerHTML = '';

    const host = document.createElement('div');
    host.style.height = `${height}px`;
    host.style.width = '100%';
    ref.current.appendChild(host);

    const light = theme === 'light';

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
      toolbar_bg: light ? '#ffffff' : '#0f172a',
      backgroundColor: light ? '#ffffff' : '#0f172a',
      gridColor: light ? 'rgba(15, 23, 42, 0.06)' : 'rgba(226, 232, 240, 0.06)',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      withdateranges: true,
      studies: STUDIES,
      support_host: 'https://www.tradingview.com',
    });

    host.appendChild(script);

    return () => {
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [ticker, height, theme]);

  return <div ref={ref} style={{ minHeight: height, width: '100%' }} />;
}

export default function TradingViewChart({ ticker = 'SPY', height = 500, theme = 'light' }) {
  const [fullscreen, setFullscreen] = useState(false);

  const light = theme === 'light';

  // Il pannello segue il tema del grafico: con sfondo bianco anche la
  // cornice deve essere chiara, altrimenti resta un bordo scuro fuori posto.
  const palette = light
    ? {
        panel: '#ffffff',
        border: '#e2e8f0',
        title: '#0f172a',
        subtitle: '#64748b',
        buttonBg: '#f1f5f9',
        buttonBorder: '#cbd5e1',
        buttonText: '#0f172a',
        overlay: '#ffffff',
      }
    : {
        panel: '#0f172a',
        border: '#1e293b',
        title: '#e2e8f0',
        subtitle: '#64748b',
        buttonBg: '#1e293b',
        buttonBorder: '#334155',
        buttonText: '#ffffff',
        overlay: '#020617',
      };

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
    <div
      style={{
        background: palette.panel,
        borderRadius: full ? 0 : 12,
        padding: 12,
        border: full ? 'none' : `1px solid ${palette.border}`,
        height: full ? '100vh' : 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ color: palette.title, fontWeight: 800 }}>
            {ticker} · TradingView
          </div>
          <div style={{ color: palette.subtitle, fontSize: 10 }}>
            Daily · SMA 200 · Volume Profile
          </div>
        </div>

        <button
          onClick={() => setFullscreen(!full)}
          style={{
            background: palette.buttonBg,
            color: palette.buttonText,
            border: `1px solid ${palette.buttonBorder}`,
            borderRadius: 7,
            padding: '7px 11px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          {full ? '✕ Chiudi' : '⛶ Schermo intero'}
        </button>
      </div>

      <Widget
        ticker={ticker}
        height={full ? Math.max(500, window.innerHeight - 72) : height}
        theme={theme}
      />
    </div>
  );

  return (
    <>
      {content(false)}
      {fullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: palette.overlay,
          }}
        >
          {content(true)}
        </div>
      )}
    </>
  );
}
