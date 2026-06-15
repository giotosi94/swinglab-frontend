} catch (e) {}
};

  const [trendPredictions, setTrendPredictions] = useState({});

  const fetchTrendPredictions = async () => {
    try {
      const r = await fetch(`${API}/api/ml/trend/all`);
      const d = await r.json();
      if (d && d.predictions) {
        const map = {};
        d.predictions.forEach(p => { map[p.ticker] = p; });
        setTrendPredictions(map);
      }
    } catch (e) {}
  };

// Agents
const fetchAgentsStatus = async () => {
setAgentsLoading(true);
@@ -267,6 +281,7 @@ function App() {
fetchSettings();
fetchAgentsStatus();
fetchMlPredictions();
    fetchTrendPredictions();
const p = setInterval(fetchLivePrices, 15000);
const a = setInterval(fetchAlpaca, 60000);
const d = setInterval(fetchData, 300000);
@@ -336,6 +351,7 @@ function App() {
setView('stocks');
}}
mlPredictions={mlPredictions}
            trendPredictions={trendPredictions}
/>
) : view === 'sectors' ? (
<Sectors
@@ -354,6 +370,7 @@ function App() {
onBuy={alpacaBuy}
onLoadFullStock={loadFullStock}
mlPredictions={mlPredictions}
            trendPredictions={trendPredictions}
/>
) : view === 'agents' ? (
<Agents
