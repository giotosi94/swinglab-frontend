import { useState } from "react";
import { API_URL } from "../utils/constants";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function BacktestWidget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showLab, setShowLab] = useState(false);
  const [days, setDays] = useState(180);
  const [usePreset, setUsePreset] = useState(true);
  const [sizePct, setSizePct] = useState(18);
  const [maxPos, setMaxPos] = useState(12);
  const [minConf, setMinConf] = useState(48);
  const [momentum, setMomentum] = useState(false);
  const [sectorBottom, setSectorBottom] = useState(false);
  const [crashDeploy, setCrashDeploy] = useState(false);
  const [rotation, setRotation] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({
        days: String(days),
        use_apm: "true",
        use_preset: String(usePreset),
        use_mtf: "true",
        use_momentum: String(momentum),
        use_sector_bottom: String(sectorBottom),
        use_crash_deploy: String(crashDeploy),
        use_rotation: String(rotation),
        t1_ratio: "0.40",
        t2_ratio: "0.70",
        t3_ratio: "1.00",
        t1_size_pct: "30",
        t2_size_pct: "30",
        t3_size_pct: "25",
        floor_t1_pct: "0",
        floor_t2_pct: "3",
        floor_t3_pct: "8",
        min_holding_days: "1",
      });

      if (!usePreset) {
        params.set("position_size_pct", String(sizePct));
        params.set("max_positions", String(maxPos));
        params.set("min_confluence", String(minConf));
      }

      const response = await fetch(`${API_URL}/api/data/backtest/run?${params.toString()}`, { method: "POST" });
      const data = await response.json();
      setResult(response.ok ? data : { error: data.detail || "Backtest fallito" });
    } catch (error) {
      setResult({ error: `Errore backtest: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const metricsData = result?.metrics || {};
  const benchmark = result?.benchmark || {};
  const config = result?.config || {};
  const chartData = (result?.equity_curve || []).map((point) => ({
    date: point.date,
    equity: point.equity,
    spy: point.spy_equity ?? null,
  }));

  const metrics = result ? [
    { label: "Total Return", value: `${Number(metricsData.total_return_pct || 0).toFixed(2)}%`, good: Number(metricsData.total_return_pct || 0) > 0 },
    { label: "Alpha vs SPY", value: `${Number(benchmark.alpha || 0).toFixed(2)}%`, good: Number(benchmark.alpha || 0) > 0 },
    { label: "Profit Factor", value: Number(metricsData.profit_factor || 0).toFixed(2), good: Number(metricsData.profit_factor || 0) > 1 },
    { label: "Sharpe", value: Number(metricsData.sharpe_ratio || 0).toFixed(2), good: Number(metricsData.sharpe_ratio || 0) > 1 },
    { label: "Max Drawdown", value: `${Number(metricsData.max_drawdown_pct || 0).toFixed(2)}%`, good: Number(metricsData.max_drawdown_pct || 0) < 10 },
    { label: "Win Rate", value: `${Number(metricsData.win_rate || 0).toFixed(1)}%`, good: Number(metricsData.win_rate || 0) > 50 },
  ] : [];

  const toggleStyle = { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cbd5e1", cursor: "pointer" };
  const labelStyle = { fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between", marginBottom: 4 };
  const sliderStyle = { width: "100%", accentColor: "#3b82f6" };

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Backtest Lab</h3>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
            Baseline live: APM 30/30/25, floor 0/3/8, holding minimo 24h, rotazione OFF.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLab(!showLab)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-600 transition">
            {showLab ? "Chiudi configurazione" : "Configura"}
          </button>
          <button onClick={runBacktest} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition">
            {loading ? "Simulazione..." : "Avvia backtest"}
          </button>
        </div>
      </div>

      {showLab && (
        <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #334155" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}><span>Periodo</span><strong style={{ color: "white" }}>{days} giorni</strong></label>
              <input type="range" min={90} max={250} step={10} value={days} onChange={(event) => setDays(Number(event.target.value))} style={sliderStyle} />
            </div>
            <div>
              <label style={labelStyle}><span>Min Confluence</span><strong style={{ color: "white" }}>{minConf}</strong></label>
              <input type="range" min={42} max={60} step={1} value={minConf} onChange={(event) => setMinConf(Number(event.target.value))} disabled={usePreset} style={{ ...sliderStyle, opacity: usePreset ? 0.35 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}><span>Position Size</span><strong style={{ color: "white" }}>{sizePct}%</strong></label>
              <input type="range" min={5} max={25} step={1} value={sizePct} onChange={(event) => setSizePct(Number(event.target.value))} disabled={usePreset} style={{ ...sliderStyle, opacity: usePreset ? 0.35 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}><span>Max posizioni</span><strong style={{ color: "white" }}>{maxPos}</strong></label>
              <input type="range" min={5} max={15} step={1} value={maxPos} onChange={(event) => setMaxPos(Number(event.target.value))} disabled={usePreset} style={{ ...sliderStyle, opacity: usePreset ? 0.35 : 1 }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            <label style={toggleStyle}>
              <input type="checkbox" checked={usePreset} onChange={(event) => setUsePreset(event.target.checked)} />
              Usa parametri live dal database
            </label>
            <label style={toggleStyle}>
              <input type="checkbox" checked={momentum} onChange={(event) => setMomentum(event.target.checked)} />
              Momentum sperimentale
            </label>
            <label style={toggleStyle}>
              <input type="checkbox" checked={sectorBottom} onChange={(event) => setSectorBottom(event.target.checked)} />
              Sector Bottom sperimentale
            </label>
            <label style={toggleStyle}>
              <input type="checkbox" checked={crashDeploy} onChange={(event) => setCrashDeploy(event.target.checked)} />
              Crash Deploy
            </label>
            <label style={{ ...toggleStyle, color: "#94a3b8" }}>
              <input type="checkbox" checked={rotation} onChange={(event) => setRotation(event.target.checked)} />
              Rotazione settoriale, solo test informativo
            </label>
          </div>
        </div>
      )}

      {loading && <p className="text-slate-400 text-sm animate-pulse">Simulazione in corso...</p>}
      {result?.error && <p className="text-red-400 text-sm">{result.error}</p>}

      {result && !result.error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                <div className="text-xs text-slate-400">{metric.label}</div>
                <div className={`text-xl font-bold ${metric.good ? "text-emerald-400" : "text-amber-400"}`}>{metric.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, padding: 12, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11, color: "#94a3b8" }}>
            Configurazione eseguita: conf {config.min_confluence}, size {config.position_size_pct}%, max {config.max_positions}, APM {config.use_apm ? "ON" : "OFF"}, T1/T2/T3 {config.t1_size_pct}/{config.t2_size_pct}/{config.t3_size_pct}, floor {config.floor_t1_pct}/{config.floor_t2_pct}/{config.floor_t3_pct}, rotation {config.use_rotation ? "ON" : "OFF"}, crash {config.use_crash_deploy ? "ON" : "OFF"}.
          </div>

          {(result.validation_notes || []).map((note) => (
            <div key={note} style={{ marginTop: 6, fontSize: 10, color: "#64748b" }}>{note}</div>
          ))}
        </>
      )}

      {chartData.length > 1 && !result?.error && (
        <div style={{ marginTop: 16, background: "#0f172a", borderRadius: 10, padding: 14, border: "1px solid #1e293b" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#94a3b8" }}>Equity Curve vs SPY</h4>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} formatter={(value, name) => [value != null ? `$${Number(value).toLocaleString()}` : "N/D", name === "equity" ? "SwingLab" : "SPY"]} />
              <ReferenceLine y={config.starting_capital || 100000} stroke="#64748b" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="equity" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} name="equity" />
              <Line type="monotone" dataKey="spy" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={false} name="spy" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {result?.total_trades != null && !result.error && (
        <p className="text-xs text-slate-500 mt-3">
          {result.total_trades} uscite registrate, SPY {Number(benchmark.spy_return_pct || 0).toFixed(2)}%, alpha {Number(benchmark.alpha || 0).toFixed(2)}%, beta {Number(benchmark.beta || 0).toFixed(2)}.
        </p>
      )}
    </div>
  );
}
