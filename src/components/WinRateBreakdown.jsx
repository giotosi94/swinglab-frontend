import React from "react";

const REASON_LABELS = {
  APM_SCALE_OUT_T1: "🎯 Scale-out T1",
  APM_SCALE_OUT_T2: "🎯 Scale-out T2",
  APM_SCALE_OUT_T3: "🎯 Scale-out T3",
  APM_SCALE_T1: "🎯 Scale-out T1",
  APM_SCALE_T2: "🎯 Scale-out T2",
  APM_SCALE_T3: "🎯 Scale-out T3",
  APM_EXIT: "🚪 APM Exit",
  SOFTWARE_TAKE_PROFIT: "✅ Take Profit",
  SOFTWARE_STOP_LOSS: "🛑 Stop Loss",
  STOP_LOSS: "🛑 Stop Loss",
  BREAK_EVEN_SL: "⚖️ Break-even",
  MARKET_SELL: "📤 Market Sell",
  END_OF_BACKTEST: "🏁 Fine Backtest",
  UNKNOWN: "❓ Sconosciuto",
};

export default function WinRateBreakdown({ data }) {
  if (!data) return null;

  const cards = [
    {
      label: "Per Esecuzione",
      value: data.win_rate,
      sub: `${data.total_trades} sell (tranche incluse)`,
      color: "#64748b",
      note: "Conta ogni scale-out",
    },
    {
      label: "Per Posizione",
      value: data.position_win_rate,
      sub: `${data.n_positions} idee uniche`,
      color: "#3b82f6",
      note: "Il dato più onesto",
    },
    {
      label: "Pesato $ (target)",
      value: data.dollar_weighted_win_rate,
      sub: "peso sul capitale mosso",
      color: "#8b5cf6",
      note: "Conta i target grandi di più",
    },
  ];

  const reasons = data.exit_reason_breakdown || [];
  const maxAbs = Math.max(...reasons.map((r) => Math.abs(r.pnl_dollar)), 1);

  return (
    <div>
      {/* 3 Win Rate Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#0f172a", borderRadius: 12, padding: 16, border: "1px solid #1e293b", borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.value >= 50 ? "#22c55e" : "#ef4444" }}>
              {(c.value ?? 0).toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{c.sub}</div>
            <div style={{ fontSize: 10, color: c.color, marginTop: 6, fontWeight: 600 }}>{c.note}</div>
          </div>
        ))}
      </div>

      {/* Exit Reason Breakdown */}
      {reasons.length > 0 && (
        <div style={{ background: "#0f172a", borderRadius: 12, padding: 16, border: "1px solid #1e293b" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>🚪 Da dove arriva il P&L (Exit Reason)</h3>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#64748b" }}>
            Contributo in dollari di ogni tipo di uscita. Capisci quali target funzionano.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reasons.map((r) => {
              const positive = r.pnl_dollar >= 0;
              const widthPct = (Math.abs(r.pnl_dollar) / maxAbs) * 100;
              return (
                <div key={r.reason}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                      {REASON_LABELS[r.reason] || r.reason}
                      <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 6 }}>
                        {r.count}x · WR {r.win_rate}%
                      </span>
                    </span>
                    <span style={{ color: positive ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                      {positive ? "+" : "-"}${Math.abs(r.pnl_dollar).toFixed(0)}
                    </span>
                  </div>
                  <div style={{ background: "#1e293b", borderRadius: 6, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${widthPct}%`, height: "100%", background: positive ? "#22c55e" : "#ef4444", borderRadius: 6, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
