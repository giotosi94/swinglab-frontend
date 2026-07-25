import { useState } from "react";
import { API_URL } from "../utils/constants";
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function BacktestWidget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [days, setDays] = useState(180);
  const [showInfo, setShowInfo] = useState(false);

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
        { label: "Beta", value: (bench.beta ?? 0).toFixed(2), good: (bench.beta ?? 1) < 1, tip: "<1 = più difensivo del mercato" },
        { label: "Correlazione", value: (bench.correlation ?? 0).toFixed(2), good: (bench.correlation ?? 1) < 0.7, tip: "Bassa = indipendente dal mercato" },
      ]
    : [];

  // Merge equity + SPY (entrambi in $ dallo stesso start)
  const chartData = (() => {
    if (!result?.equity_curve?.length) return [];
    const startEq = result.equity_curve[0].equity;
    const spyMap = {};
    (bench.spy_curve || []).forEach((p) => { spyMap[p.date] = p.spy_pct; });
    return result.equity_curve.map((e) => ({
      date: e.date,
      equity: e.equity,
      spy: spyMap[e.date] != null ? Math.round(startEq * (1 + spyMap[e.date] / 100)) : null,
    }));
  })();

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 Backtesting Engine
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-600 transition"
          >
            {showInfo ? "▲ Nascondi" : "ℹ️ Come funziona"}
          </button>
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

      {/* BOX SPIEGAZIONE */}
      {showInfo && (
        <div style={{ background: "#0f172a", borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.7, border: "1px solid #334155" }}>
          <div style={{ fontWeight: 700, color: "#3b82f6", marginBottom: 8 }}>🔬 Come funziona</div>
          Il motore <strong>rigioca la strategia sul passato</strong> usando le barre storiche reali dei 219 titoli. Ogni giorno simulato calcola la confluence (16 fattori + MTF weekly), apre posizioni sui candidati sopra soglia e le gestisce con l'<strong>APM completo</strong> (scale-out adattivi T1/T2/T3, floor "lascia correre").
          <br /><br />
          <div style={{ fontWeight: 700, color: "#8b5cf6", marginBottom: 8 }}>⚙️ Cosa ha in canna</div>
          Stessa identica logica del trading live: confluence, adaptive targets, APM. Target/stop calibrati sulla volatilità (ATR) di ogni titolo. Confronto con SPY + Beta e Correlazione.
          <br /><br />
          <div style={{ fontWeight: 700, color: "#eab308", marginBottom: 6 }}>📖 Come leggerlo</div>
          <strong>Alpha</strong> = quanto batti SPY · <strong>Beta &lt;1</strong> = più difensivo del mercato · <strong>Correlazione bassa + alpha positivo</strong> = rendimento indipendente (il vero valore). In periodi super-bull è normale un alpha negativo ma con drawdown molto più basso.
          <br /><br />
          <div style={{ fontSize: 11, color: "#64748b" }}>
            ⏱️ Lancialo <strong>manualmente</strong> quando modifichi la strategia o vuoi validarla. Non gira col cron: rigioca sempre lo stesso storico.
          </div>
        </div>
      )}

      {loading && (
        <p className="text-slate-400 text-sm animate-pulse">
          Simulazione strategia con APM in corso... (può richiedere 30-60s)
        </p>
      )}

      {result?.error && (
        <p className="text-red-400 text-sm">{result.error}</p>
      )}

      {result && !result.error && (
        <>
          {/* Metriche strategia */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metrics.map((mt) => (
              <div
                key={mt.label}
                className="bg-slate-900 rounded-lg p-3 border border-slate-700"
              >
                <div className="text-xs text-slate-400">{mt.label}</div>
                <div
                  className={
                    "text-xl font-bold " +
                    (mt.good ? "text-emerald-400" : "text-red-400")
                  }
                >
                  {mt.value}
                </div>
              </div>
            ))}
          </div>

          {/* Card benchmark SPY */}
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
            <AreaChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }}
                formatter={(v, name) => [v != null ? "$" + Number(v).toLocaleString() : "—", name === "equity" ? "📈 SwingLab" : "📊 SPY"]} />
              <ReferenceLine y={result.config?.starting_capital ?? 100000} stroke="#64748b" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="equity" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} name="equity" />
              <Line type="monotone" dataKey="spy" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="spy" connectNulls={true} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>━━ SwingLab</span>
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>┅┅ SPY</span>
          </div>
        </div>
      )}

      {result?.total_trades != null && !result.error && (
        <p className="text-xs text-slate-500 mt-3">
          {result.total_trades} trade simulati · config 0.4/0.7/1.0 · SPY {bench.spy_return_pct ?? 0}% (α {bench.alpha ?? 0}%) · β {bench.beta ?? 0} · corr {bench.correlation ?? 0}
        </p>
      )}
    </div>
  );
}
