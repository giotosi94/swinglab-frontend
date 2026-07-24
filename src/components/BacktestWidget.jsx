import { useState } from "react";
import { API_URL } from "../utils/constants";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";


export default function BacktestWidget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [days, setDays] = useState(180);

  const runBacktest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        API_URL +
          "/api/data/backtest/run?days=" +
          days +
          "&min_confluence=55&use_apm=true&t1_ratio=0.4&t2_ratio=0.7&t3_ratio=1.0",
        { method: "POST" }
      );
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Errore backtest: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const m = result?.metrics || {};
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

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 Backtesting Engine
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-slate-700 text-white text-sm rounded-lg px-2 py-1 border border-slate-600"
          >
            <option value={90}>90 giorni</option>
            <option value={180}>180 giorni</option>
            <option value={250}>250 giorni</option>
          </select>
          <button
            onClick={runBacktest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition"
          >
            {loading ? "Running..." : "Run Backtest"}
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-slate-400 text-sm animate-pulse">
          Simulazione strategia con APM in corso... (può richiedere 30-60s)
        </p>
      )}

      {result?.error && (
        <p className="text-red-400 text-sm">{result.error}</p>
      )}

      {result && !result.error && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-slate-900 rounded-lg p-3 border border-slate-700"
            >
              <div className="text-xs text-slate-400">{m.label}</div>
              <div
                className={
                  "text-xl font-bold " +
                  (m.good ? "text-emerald-400" : "text-red-400")
                }
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {result?.equity_curve?.length > 1 && !result.error && (
  <div style={{ marginTop: 16, background: "#0f172a", borderRadius: 10, padding: 14, border: "1px solid #1e293b" }}>
    <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#94a3b8" }}>📈 Equity Curve</h4>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={result.equity_curve}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} formatter={(v) => ["$" + v.toLocaleString(), "Equity"]} />
        <ReferenceLine y={result.config?.starting_capital ?? 100000} stroke="#64748b" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="equity" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
    <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "#64748b" }}>
      ┄┄ Capitale iniziale ${((result.config?.starting_capital ?? 100000) / 1000).toFixed(0)}k
    </div>
  </div>
)}
      
      {result?.total_trades != null && !result.error && (
        <p className="text-xs text-slate-500 mt-3">
          {result.total_trades} trade simulati · config 0.4/0.7/1.0 · SPY {result.benchmark?.spy_return_pct ?? 0}% (α {result.benchmark?.alpha ?? 0}%)
        </p>
      )}
    </div>
  );
}
