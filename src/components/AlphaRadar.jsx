import { useState, useEffect } from "react";
import { API } from "../utils/constants";

export default function AlphaRadar() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/agents/alpha-radar`)
        .then(r => r.json())
        .then(d => { if (d && !d.error) setData(d); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const cr = data.crash_radar || {};
  const sb = data.sector_bottom || {};
  const score = cr.crash_risk_score ?? 0;
  const level = cr.crash_level || "NORMAL";

  const levelColor = {
    NORMAL: "#22c55e",
    WATCH: "#eab308",
    DEPLOY: "#f97316",
    DEPLOY_MAX: "#ef4444",
  }[level] || "#64748b";

  const levelEmoji = {
    NORMAL: "🟢", WATCH: "🟡", DEPLOY: "🟠", DEPLOY_MAX: "🔴",
  }[level] || "⚪";

  return (
    <div style={{
      background: `linear-gradient(135deg, ${levelColor}15 0%, #0f172a 100%)`,
      borderRadius: 12, padding: 18, marginBottom: 20,
      border: `2px solid ${levelColor}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 32 }}>🎯</span>
          <div>
            <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 0.5 }}>
              PROGETTO ALPHA
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: levelColor }}>
              {levelEmoji} Crash Risk: {score}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {level} · SPY {cr.spy_drawdown_pct ?? 0}% dal max · VIXY {cr.vixy_price ?? 0}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#64748b" }}>SETTORI IN BOTTOM</div>
          {sb.any_bottom ? (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 4 }}>
              {sb.bottom_sectors.map(s => (
                <span key={s.sector} style={{
                  background: "#ef444433", color: "#ef4444", padding: "2px 8px",
                  borderRadius: 4, fontSize: 11, fontWeight: 700,
                }}>
                  {s.sector} {s.pct_above_200sma}%
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", marginTop: 4 }}>
              ✓ Nessuno (mercato sano)
            </div>
          )}
        </div>
      </div>

      {(level === "DEPLOY" || level === "DEPLOY_MAX") && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 8,
          background: "#ef444420", border: "1px solid #ef444444",
          fontSize: 13, color: "#fca5a5", fontWeight: 600, textAlign: "center",
        }}>
          🚨 SEGNALE DEPLOY ATTIVO — condizioni di crash: valuta acquisto SPY / leader settoriali
        </div>
      )}
    </div>
  );
}
