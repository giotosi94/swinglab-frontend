import React, { useState, useEffect } from "react";
import { API } from "../utils/constants";
import AlphaRadar from "./AlphaRadar";
import CrashDeployToggle from "./CrashDeployToggle";

const STATUS_COLORS = { ok: "#22c55e", warning: "#eab308", critical: "#ef4444", error: "#ef4444" };
const STATUS_EMOJI = { ok: "🟢", warning: "🟡", critical: "🔴", error: "🔴" };
const CHECK_LABELS = {
  data_freshness: "📊 Freschezza Dati",
  spy_benchmark: "📉 SPY / Benchmark",
  pipeline: "⏰ Pipeline",
  alpaca: "💰 Alpaca",
  ml_model: "🧠 ML Model",
  positions_sync: "🔄 Sync Posizioni",
  apm: "🎯 APM",
  market_regime: "🌍 Regime Macro",
};

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/system/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      setHealth({ overall: "error", checks: {}, summary: {} });
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    setReportLoading(true);
    setReport(null);
    try {
      const res = await fetch(`${API}/api/system/health/report`);
      const data = await res.json();
      setReport(data.llm_report || "Nessun report disponibile.");
    } catch (e) {
      setReport("Errore generazione report: " + e.message);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Verifica sistema in corso...</div>;
  }

  const overall = health?.overall || "error";
  const overallColor = STATUS_COLORS[overall] || "#64748b";
  const overallLabel = { healthy: "SISTEMA SANO", warning: "ATTENZIONE", critical: "PROBLEMI CRITICI", error: "ERRORE" }[overall] || overall.toUpperCase();

  return (
    <div>
      {/* 🎯 Progetto Alpha — Crash Radar + Sector Bottom */}
      <AlphaRadar />

      {/* 🔴 Crash Deploy — controllo con flag di sicurezza */}
      <CrashDeployToggle />

      {/* Header stato generale */}
      <div style={{
        background: `linear-gradient(135deg, ${overallColor}22 0%, #0f172a 100%)`,
        borderRadius: 12, padding: 20, marginBottom: 20, border: `2px solid ${overallColor}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 36 }}>{overall === "healthy" ? "🩺" : overall === "warning" ? "⚠️" : "🚨"}</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: overallColor }}>{overallLabel}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {health?.summary?.ok || 0} ok · {health?.summary?.warning || 0} warning · {health?.summary?.critical || 0} critici
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadHealth} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid #334155", cursor: "pointer",
            background: "#1e293b", color: "#94a3b8", fontSize: 12, fontWeight: 600,
          }}>🔄 Ricontrolla</button>
          <button onClick={loadReport} disabled={reportLoading} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: reportLoading ? "#334155" : "#8b5cf6", color: "white", fontSize: 12, fontWeight: 700,
          }}>{reportLoading ? "..." : "🤖 Diagnosi AI"}</button>
        </div>
      </div>

      {/* Report LLM */}
      {report && (
        <div style={{
          background: "#1e1b3a", borderRadius: 10, padding: 16, marginBottom: 20,
          border: "1px solid #8b5cf644",
        }}>
          <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, marginBottom: 8 }}>🤖 DIAGNOSI AI</div>
          <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>{report}</div>
        </div>
      )}

      {/* Griglia check */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {Object.entries(health?.checks || {}).map(([key, c]) => {
          const color = STATUS_COLORS[c.status] || "#64748b";
          return (
            <div key={key} style={{
              background: "#0f172a", borderRadius: 10, padding: 16,
              border: "1px solid #1e293b", borderLeft: `4px solid ${color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                  {CHECK_LABELS[key] || key}
                </span>
                <span style={{ fontSize: 16 }}>{STATUS_EMOJI[c.status] || "⚪"}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                {c.message || c.error || "—"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#64748b" }}>
        Auto-refresh ogni 60s · Ultimo check: {health?.checked_at ? new Date(health.checked_at).toLocaleTimeString() : "—"} · Check base senza costi LLM
      </div>
    </div>
  );
}
