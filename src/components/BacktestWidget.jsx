import { useState } from "react";
import { API_URL } from "../utils/constants";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function BacktestWidget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showLab, setShowLab] = useState(false);

  // Parametri configurabili del Lab
  const [days, setDays] = useState(180);
  const [momentum, setMomentum] = useState(false);
  const [sizePct, setSizePct] = useState(12);
  const [maxPos, setMaxPos] = useState(8);
  const [minConf, setMinConf] = useState(55);
  const [t1, setT1] = useState(0.4);
  const [t2, setT2] = useState(0.7);
  const [t3, setT3] = useState(1.0);
  const [usePreset, setUsePreset] = useState(true);
  const [sectorBottom, setSectorBottom] = useState(true);
  const [crashDeploy, setCrashDeploy] = useState(true);

  const runBacktest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({
        days: days,
        use_apm: true,
        use_momentum: momentum,
        t1_ratio: t1,
        t2_ratio: t2,
        t3_ratio: t3,
        use_preset: usePreset,
        use_sector_bottom: sectorBottom,
        use_crash_deploy: crashDeploy,
      });
      if (!usePreset) {
        params.set("position_size_pct", sizePct);
        params.set("max_positions", maxPos);
        params.set("min_confluence", minConf);
      }
      const res = await fetch(`${API_URL}/api/data/backtest/run?${params.toString()}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: "Errore backtest: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const m = result?.metrics || {};
  const bench = result?.benchmark || {};

  const metrics = result
    ? [
        { label: "Total Return", value: (m.total_return_pct ?? 0).toFixed(2) + "%", good: (m.total_return_pct ?? 0) > 0 },
        { label: "Sharpe", value: (m.sharpe_ratio ?? 0).toFixed(2), good: (m.sharpe_ratio ?? 0) > 1 },
        { label: "Sortino", value: (m.sortino_ratio ?? 0).toFixed(2), good: (m.sortino_ratio ?? 0) > 1.5 },
        { label: "Max Drawdown", value: (m.max_drawdown_pct ?? 0).toFixed(2) + "%", good: (m.max_drawdown_pct ?? 0) < 10 },
        { label: "Win Rate", value: (m.win_rate ?? 0).toFixed(1) + "%", good: (m.win_rate ?? 0) > 55 },
        { label: "Profit Factor", value: (m.profit_factor ?? 0).toFixed(2), good: (m.profit_factor ?? 0) > 1.2 },
      ]
    : [];

  const benchCards = result
    ? [
        { label: "Alpha vs SPY", value: (bench.alpha ?? 0).toFixed(2) + "%", good: (bench.alpha ?? 0) > 0, tip: "Sovrarendimento su SPY" },
        { label: "Beta", value: (bench.beta ?? 0).toFixed(2), good: (bench.beta ?? 1) < 1, tip: "<1 = difensivo · >1 = aggressivo" },
        { label: "Correlazione", value: (bench.correlation ?? 0).toFixed(2), good: (bench.correlation ?? 1) < 0.7, tip: "Bassa = indipendente" },
      ]
    : [];

  const chartData = (result?.equity_curve || []).map((e) => ({
    date: e.date, equity: e.equity, spy: e.spy_equity ?? null,
  }));

  const sliderStyle = { width: "100%", accentColor: "#3b82f6" };
  const labelStyle = { fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between", marginBottom: 4 };

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">🔬 Backtest Lab</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLab(!showLab)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-600 transition">
            {showLab ? "▲ Chiudi Lab" : "⚙️ Configura"}
          </button>
          <button onClick={runBacktest} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition">
            {loading ? "Running..." : "Run Backtest"}
          </button>
        </div>
      </div>

      {/* PANNELLO LAB */}
      {showLab && (
        <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #334155" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}><span>Periodo</span><span style={{ color: "white", fontWeight: 700 }}>{days}g</span></label>
              <input type="range" min={90} max={250} step={10} value={days} onChange={(e) => setDays(+e.target.value)} style={sliderStyle} />
            </div>
            <div>
              <label style={labelStyle}><span>Min Confluence</span><span style={{ color: "white", fontWeight: 700 }}>{minConf}</span></label>
              <input type="range" min={40} max={65} step={1} value={minConf} onChange={(e) => setMinConf(+e.target.value)} disabled={usePreset} style={{ ...sliderStyle, opacity: usePreset ? 0.4 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}><span>Position Size</span><span style={{ color: "white", fontWeight: 700 }}>{sizePct}%</span></label>
              <input type="range" min={8} max={25} step={1} value={sizePct} onChange={(e) => setSizePct(+e.target.value)} disabled={usePreset} style={{ ...sliderStyle, opacity: usePreset ? 0.4 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}><span>Max Posizioni</span><span style={{ color: "white", fontWeight: 700 }}>{maxPos}</span></label>
              <input type="range" min={5} max={20} step={1} value={maxPos} onChange={(e) => setMaxPos(+e.target.value)} disabled={usePreset} style={{ ...sliderStyle, opacity: usePreset ? 0.4 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}><span>Target T1 (scale-out)</span><span style={{ color: "white", fontWeight: 700 }}>{t1}</span></label>
              <input type="range" min={0.3} max={1.2} step={0.1} value={t1} onChange={(e) => setT1(+e.target.value)} style={sliderStyle} />
            </div>
            <div>
              <label style={labelStyle}><span>Target T2</span><span style={{ color: "white", fontWeight: 700 }}>{t2}</span></label>
              <input type="range" min={0.5} max={1.6} step={0.1} value={t2} onChange={(e) => setT2(+e.target.value)} style={sliderStyle} />
            </div>
            <div>
              <label style={labelStyle}><span>Target T3</span><span style={{ color: "white", fontWeight: 700 }}>{t3}</span></label>
              <input type="range" min={0.8} max={2.5} step={0.1} value={t3} onChange={(e) => setT3(+e.target.value)} style={sliderStyle} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
              <input type="checkbox" checked={momentum} onChange={(e) => setMomentum(e.target.checked)} style={{ accentColor: "#8b5cf6" }} />
              🎢 Momentum Factor
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
              <input type="checkbox" checked={sectorBottom} onChange={(e) => setSectorBottom(e.target.checked)} style={{ accentColor: "#f97316" }} />
              🏭 Sector Bottom
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
              <input type="checkbox" checked={crashDeploy} onChange={(e) => setCrashDeploy(e.target.checked)} style={{ accentColor: "#ef4444" }} />
              🔴 Crash Deploy
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
              <input type="checkbox" checked={usePreset} onChange={(e) => setUsePreset(e.target.checked)} style={{ accentColor: "#22c55e" }} />
              📋 Usa preset attivo (size/pos/conf dal profilo di rischio)
            </label>
          </div>

          {/* Preset rapidi */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#64748b", alignSelf: "center" }}>Quick:</span>
            <button onClick={() => { setMomentum(false); setUsePreset(false); setSizePct(12); setMaxPos(8); setMinConf(55); setT1(0.4); setT2(0.7); setT3(1.0); }}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #22c55e44", background: "#22c55e15", color: "#22c55e", cursor: "pointer" }}>
              🛡️ Protezione
            </button>
            <button onClick={() => { setMomentum(true); setUsePreset(false); setSizePct(20); setMaxPos(12); setMinConf(45); setT1(0.7); setT2(1.2); setT3(2.0); }}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #ef444444", background: "#ef444415", color: "#ef4444", cursor: "pointer" }}>
              🚀 Alpha (aggressivo)
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-slate-400 text-sm animate-pulse">Simulazione in corso... (30-60s)</p>}
      {result?.error && <p className="text-red-400 text-sm">{result.error}</p>}

      {result && !result.error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metrics.map((mt) => (
              <div key={mt.label} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                <div className="text-xs text-slate-400">{mt.label}</div>
                <div className={"text-xl font-bold " + (mt.good ? "text-emerald-400" : "text-red-400")}>{mt.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 12 }}>
            {benchCards.map((c) => (
              <div key={c.label} style={{ background: "#0f172a", borderRadius: 8, padding: 12, border: "1px solid #1e293b", borderLeft: `3px solid ${c.good ? "#22c55e" : "#eab308"}` }}>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{c.label}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: c.good ? "#22c55e" : "#eab308" }}>{c.value}</div>
                <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{c.tip}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {chartData.length > 1 && !result.error && (
        <div style={{ marginTop: 16, background: "#0f172a", borderRadius: 10, padding: 14, border: "1px solid #1e293b" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#94a3b8" }}>📈 Equity Curve vs SPY</h4>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }}
                formatter={(v, name) => [v != null ? "$" + Number(v).toLocaleString() : "—", name === "equity" ? "📈 SwingLab" : "📊 SPY"]} />
              <ReferenceLine y={result.config?.starting_capital ?? 100000} stroke="#64748b" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="equity" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} name="equity" />
              <Line type="monotone" dataKey="spy" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={false} name="spy" connectNulls={true} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>━━ SwingLab</span>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>┅┅ SPY</span>
          </div>
        </div>
      )}

      {result?.total_trades != null && !result.error && (
        <p className="text-xs text-slate-500 mt-3">
          {result.total_trades} trade · SPY {bench.spy_return_pct ?? 0}% (α {bench.alpha ?? 0}%) · β {bench.beta ?? 0} · corr {bench.correlation ?? 0}
        </p>
      )}
    </div>
  );
}
