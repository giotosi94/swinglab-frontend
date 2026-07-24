import { useState } from "react";
import { API_URL } from "../utils/constants";

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

  const metrics = result
    ? [
        { label: "Total Return", value: (result.total_return ?? 0).toFixed(2) + "%", good: (result.total_return ?? 0) > 0 },
        { label: "Sharpe", value: (result.sharpe ?? 0).toFixed(2), good: (result.sharpe ?? 0) > 1 },
        { label: "Sortino", value: (result.sortino ?? 0).toFixed(2), good: (result.sortino ?? 0) > 1.5 },
        { label: "Max Drawdown", value: (result.max_drawdown ?? 0).toFixed(2) + "%", good: (result.max_drawdown ?? 0) < 10 },
        { label: "Win Rate", value: (result.win_rate ?? 0).toFixed(1) + "%", good: (result.win_rate ?? 0) > 55 },
        { label: "Profit Factor", value: (result.profit_factor ?? 0).toFixed(2), good: (result.profit_factor ?? 0) > 1.2 },
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

      {result?.total_trades != null && !result.error && (
        <p className="text-xs text-slate-500 mt-3">
          {result.total_trades} trade simulati · config 0.4/0.7/1.0 (validata)
        </p>
      )}
    </div>
  );
}
