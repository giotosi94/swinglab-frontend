import { useState, useEffect } from "react";
import { API } from "../utils/constants";

export default function CrashDeployToggle() {
  const [state, setState] = useState(null);

  const load = () => {
    fetch(`${API}/api/data/crash-deploy/status`)
      .then(r => r.json()).then(setState).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const setFlags = (params) => {
    fetch(`${API}/api/data/crash-deploy/flags?${params}`, { method: "POST" })
      .then(r => r.json()).then(setState).catch(() => {});
  };

  if (!state) return null;
  const enabled = state.enabled;
  const dry = state.dry_run;

  return (
    <div style={{
      background: enabled ? (dry ? "#eab30815" : "#ef444415") : "#0f172a",
      borderRadius: 12, padding: 16, marginBottom: 20,
      border: `2px solid ${enabled ? (dry ? "#eab308" : "#ef4444") : "#334155"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>
            🔴 Crash Deploy {enabled ? (dry ? "· 🧪 SIMULAZIONE" : "· 🔴 REALE") : "· ⚪ SPENTO"}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
            Compra SPY a fette nei crash (solo regime BEAR/CRASH). Validato +14,5% sul 2022.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFlags(`enabled=${!enabled}`)} style={{
            padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
            background: enabled ? "#ef4444" : "#22c55e", color: "white",
          }}>
            {enabled ? "Disattiva" : "Attiva"}
          </button>
          {enabled && (
            <button onClick={() => setFlags(`dry_run=${!dry}`)} style={{
              padding: "8px 14px", borderRadius: 8, border: "1px solid #334155", cursor: "pointer", fontWeight: 700, fontSize: 12,
              background: "#1e293b", color: dry ? "#eab308" : "#ef4444",
            }}>
              {dry ? "🧪 Simulazione" : "🔴 Reale"}
            </button>
          )}
        </div>
      </div>
      {enabled && !dry && (
        <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: "#ef444420", fontSize: 11, color: "#fca5a5", fontWeight: 600, textAlign: "center" }}>
          ⚠️ MODALITÀ REALE: comprerà SPY con capitale vero quando il mercato entra in BEAR/CRASH
        </div>
      )}
      {state.fette_done?.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
          Fette eseguite: {state.fette_done.join(", ")} · SPY investito: ${(state.spy_invested || 0).toFixed(0)}
        </div>
      )}
    </div>
  );
}
