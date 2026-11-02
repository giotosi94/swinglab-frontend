import React, { useEffect, useState } from 'react';
import { getScoreColor, getSetupBadge, getRegimeColor } from '../utils/helpers';
import {
  fetchMarketContext,
  fetchMaxStrategyShadow,
  fetchMaxStrategyValidation,
  fetchAgentParams,
  runProfessionalReport,
} from '../utils/api';

const C = {
  panel: '#0f172a',
  panel2: '#0b1220',
  border: '#1e293b',
  border2: '#18243a',
  text: '#f8fafc',
  muted: '#64748b',
  dim: '#94a3b8',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  blue: '#38bdf8',
  purple: '#8b5cf6',
  orange: '#f97316',
};

const REGIME_EXPLAIN = {
  BULL: 'Trend e partecipazione allineati: il rialzo è ampio e sostenuto.',
  NARROW_BULL: 'Gli indici tengono ma pochi titoli partecipano. Rialzo fragile.',
  PULLBACK_IN_UPTREND: 'Trend intatto, debolezza di breve: le correzioni sono occasioni.',
  NEUTRAL: 'Nessuna direzione chiara. Il sistema resta operativo ma non forza size.',
  ROTATION: 'Il capitale si sta spostando fra settori. Attenzione al cambio di leadership.',
  EARLY_RECOVERY: 'Breve periodo in ripresa, trend ancora debole. Da confermare.',
  BEAR: 'Trend negativo e partecipazione debole. Size fortemente ridotta.',
  CRASH: 'Stress di mercato. Solo Crash Deploy su SPY, niente ingressi ordinari.',
};

const LEADERSHIP_LABEL = {
  BROAD_PARTICIPATION: 'Partecipazione ampia',
  MEGA_CAP_NARROW: 'Rialzo stretto mega-cap',
  NARROW_NON_TECH: 'Rialzo stretto non-tech',
  SMALL_CAP_LED: 'Leadership small cap',
  DEFENSIVE_LED: 'Leadership difensiva',
  NO_CLEAR_LEADERSHIP: 'Nessuna leadership chiara',
};

function stanceFromExposure(multiplier, regime) {
  if (regime === 'CRASH' || regime === 'BEAR') {
    return { label: 'DIFENSIVA', color: C.red, hint: 'Nuovi ingressi ordinari ridotti o bloccati' };
  }
  const pct = Math.round(Number(multiplier || 0) * 100);
  if (pct >= 85) return { label: 'AGGRESSIVA', color: C.green, hint: 'Size piena sui setup che superano la soglia' };
  if (pct >= 60) return { label: 'NEUTRALE', color: C.blue, hint: 'Operativo con size moderata' };
  if (pct >= 35) return { label: 'PRUDENTE', color: C.amber, hint: 'Size ridotta: solo setup di qualità' };
  return { label: 'DIFENSIVA', color: C.red, hint: 'Pochi o nessun nuovo ingresso ordinario' };
}

function exposureMeaning(multiplier) {
  const pct = Math.round(Number(multiplier || 0) * 100);
  if (pct >= 90) return 'Size piena';
  if (pct >= 70) return 'Quasi piena';
  if (pct >= 55) return 'Ridotta';
  if (pct >= 30) return 'Fortemente ridotta';
  return 'Bloccata';
}

function money(value) {
  return `$${Number(value || 0).toLocaleString('it-IT', { maximumFractionDigits: 0 })}`;
}

function parseDate(value) {
  if (!value) return null;
  const normalized = typeof value === 'string' && !value.endsWith('Z') ? `${value}Z` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #0b1220 100%)',
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Header({ eyebrow, title, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, gap: 10 }}>
      <div>
        {eyebrow && (
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 }}>
            {eyebrow}
          </div>
        )}
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>{title}</h3>
      </div>
      {right && <div style={{ fontSize: 9, color: '#475569', whiteSpace: 'nowrap' }}>{right}</div>}
    </div>
  );
}

function Pill({ children, color = C.blue }) {
  return (
    <span
      style={{
        color,
        background: `${color}16`,
        border: `1px solid ${color}38`,
        borderRadius: 999,
        padding: '3px 9px',
        fontSize: 9,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function Metric({ label, value, color = C.text, sub }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 12, minWidth: 0 }}>
      <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 18, fontWeight: 900, color, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: 10, color: C.dim }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard({
  marketData,
  assets,
  livePrices,
  alpacaData,
  sectors,
  agentsStatus,
  onGoToAlpaca,
  onGoToAgents,
  onGoToSector,
  onLoadFullStock,
  mlPredictions,
  trendPredictions,
}) {
  const [ctx, setCtx] = useState(null);
  const [maxShadow, setMaxShadow] = useState(null);
  const [validation, setValidation] = useState(null);
  const [learnStrip, setLearnStrip] = useState(null);
  const [briefBusy, setBriefBusy] = useState(false);
  const [briefMsg, setBriefMsg] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      const [context, shadow, valid, aParams, pParams] = await Promise.all([
        fetchMarketContext(),
        fetchMaxStrategyShadow(),
        fetchMaxStrategyValidation(200),
        fetchAgentParams('alpha_strategist'),
        fetchAgentParams('adaptive_position_manager'),
      ]);
      if (!alive) return;
      if (context && context.available) setCtx(context);
      setMaxShadow(shadow);
      setValidation(valid);
      const ap = aParams?.params || aParams || {};
      const pp = pParams?.params || pParams || {};
      setLearnStrip({
        minConf: ap.min_confluence,
        maxRsi: ap.max_rsi_entry,
        exitConf: pp.apm_exit_confluence_threshold,
        alphaVer: ap.param_version,
        apmVer: pp.param_version,
      });
    }

    load();
    const timer = setInterval(load, 120000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  async function handleRegenerateBrief() {
    setBriefBusy(true);
    setBriefMsg(null);
    try {
      const res = await runProfessionalReport();
      if (!res) {
        setBriefMsg('Richiesta fallita o LLM non disponibile');
      } else if (res.professional_report) {
        setBriefMsg('Brief aggiornato');
        const context = await fetchMarketContext();
        if (context && context.available) setCtx(context);
      } else if (res.status === 'skipped') {
        setBriefMsg(res.message || 'LLM non disponibile');
      } else if (res.status === 'error') {
        setBriefMsg(res.error || 'Errore');
      } else {
        setBriefMsg('Risposta ricevuta');
        const context = await fetchMarketContext();
        if (context && context.available) setCtx(context);
      }
    } catch (e) {
      setBriefMsg(String(e?.message || e));
    } finally {
      setBriefBusy(false);
    }
  }

  const ps = agentsStatus?.pipeline_state;
  const brain = agentsStatus?.shared_brain?.market || {};
  const market = { ...(ps?.market || {}), ...brain };

  const regime = ctx?.regime || market.regime || 'NEUTRAL';
  const detail = ctx?.regime_detail || market.regime_detail || regime;
  const confidence = Number(ctx?.confidence ?? market.confidence ?? 0);
  const exposure = Number(ctx?.exposure_multiplier ?? market.exposure_multiplier ?? 0);
  const breadth = Number(ctx?.breadth_pct ?? market.breadth_pct ?? 0);
  const volatility = ctx?.volatility || market.volatility || 'NORMAL';
  const llmMacro = ctx?.llm_reasoning || market.llm_reasoning;
  const professionalReport =
    ctx?.professional_report || market.professional_report || null;
  const reportText = professionalReport || llmMacro;
  const reportSource = professionalReport
    ? 'BRIEF PROFESSIONALE'
    : llmMacro
      ? 'LETTURA MACRO'
      : null;

  const regimeColor = getRegimeColor(regime);
  const stance = stanceFromExposure(exposure, detail === 'CRASH' ? 'CRASH' : regime);

  const lastRun = parseDate(ps?.last_run);
  const minutesAgo = lastRun ? Math.round((Date.now() - lastRun.getTime()) / 60000) : null;
  const fresh = minutesAgo !== null && minutesAgo < 45;

  const focusSectors = ctx?.focus_sectors || [];
  const avoidSectors = ctx?.avoid_sectors || [];
  const leadershipState = ctx?.leadership_state || market.leadership || 'N/D';
  const leadershipLabel = LEADERSHIP_LABEL[leadershipState] || leadershipState;

  const equity = Number(alpacaData?.equity ?? alpacaData?.portfolio_value ?? 0);
  const cash = Number(alpacaData?.cash ?? 0);
  const positions = alpacaData?.positions || [];
  const positionsCount = Array.isArray(positions) ? positions.length : Number(ps?.positions || 0);

  const topSetups = [...(assets || [])]
    .sort((a, b) => (b.setup_score || 0) - (a.setup_score || 0))
    .slice(0, 8);

  const lastActions = ps?.actions || [];
  const alphaCounts = maxShadow?.action_counts || {};
  const volColor = volatility === 'EXTREME' ? C.red : volatility === 'HIGH' ? C.orange : C.green;

  const openPnl = Array.isArray(positions)
    ? positions.reduce((sum, p) => sum + Number(p.unrealized_pl || 0), 0)
    : 0;

  return (
    <div style={{ color: C.text, paddingBottom: 40 }}>
      <Card
        style={{
          marginBottom: 14,
          padding: 20,
          background:
            'radial-gradient(circle at 88% 12%, rgba(56,189,248,.10), transparent 30%), linear-gradient(145deg,#0d1729,#070c17)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>
              Desk · Stance operativa
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: stance.color, letterSpacing: -0.5 }}>
                {stance.label}
              </div>
              <Pill color={regimeColor}>{regime}</Pill>
              {detail && detail !== regime && <Pill color={C.purple}>{detail}</Pill>}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: C.dim, maxWidth: 520 }}>
              {stance.hint}. {REGIME_EXPLAIN[detail] || REGIME_EXPLAIN[regime] || ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Pill color={fresh ? C.green : C.amber}>
              {fresh ? 'PIPELINE ATTIVA' : minutesAgo === null ? 'MAI ESEGUITA' : 'IN RITARDO'}
            </Pill>
            <span style={{ fontSize: 10, color: C.muted }}>
              {minutesAgo === null
                ? 'nessun run'
                : minutesAgo < 60
                  ? `${minutesAgo} min fa`
                  : `${Math.round(minutesAgo / 60)}h fa`}
              {ps?.pipeline?.timing?.total ? ` · ${ps.pipeline.timing.total}s` : ''}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
          }}
        >
          <Metric label="Esposizione" value={`${Math.round(exposure * 100)}%`} color={C.green} sub={exposureMeaning(exposure)} />
          <Metric label="Confidenza" value={confidence.toFixed(0)} color={confidence >= 60 ? C.green : confidence >= 45 ? C.amber : C.red} sub="regime" />
          <Metric label="Partecipazione" value={`${breadth.toFixed(0)}%`} color={breadth >= 50 ? C.green : breadth >= 35 ? C.amber : C.red} sub="sopra EMA50" />
          <Metric label="Volatilità" value={volatility} color={volColor} sub="da VIXY / radar" />
          <Metric
            label="Leadership"
            value={typeof leadershipLabel === 'string' ? leadershipLabel.replace(/_/g, ' ').slice(0, 22) : 'N/D'}
            color={C.blue}
            sub={focusSectors.slice(0, 3).join(' · ') || '—'}
          />
        </div>

        {(focusSectors.length > 0 || avoidSectors.length > 0) && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: C.muted }}>Focus</span>
            {focusSectors.map((s) => (
              <Pill key={`f-${s}`} color={C.green}>{s}</Pill>
            ))}
            {avoidSectors.length > 0 && (
              <>
                <span style={{ fontSize: 10, color: C.muted, marginLeft: 6 }}>Evita</span>
                {avoidSectors.map((s) => (
                  <Pill key={`a-${s}`} color={C.red}>{s}</Pill>
                ))}
              </>
            )}
          </div>
        )}
      </Card>

      {learnStrip && (
        <div
          style={{
            marginBottom: 14,
            padding: '10px 14px',
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: 'rgba(139,92,246,.06)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
            cursor: onGoToAgents ? 'pointer' : 'default',
          }}
          onClick={onGoToAgents}
        >
          <div style={{ fontSize: 11, color: C.dim }}>
            <span style={{ color: C.purple, fontWeight: 800, marginRight: 8 }}>LEARNING</span>
            Alpha min_conf <strong style={{ color: C.text }}>{learnStrip.minConf ?? '—'}</strong>
            {' · '}max RSI <strong style={{ color: C.text }}>{learnStrip.maxRsi ?? '—'}</strong>
            {' · '}APM exit <strong style={{ color: C.text }}>{learnStrip.exitConf ?? '—'}</strong>
            {' · '}v{learnStrip.alphaVer ?? '—'}/{learnStrip.apmVer ?? '—'}
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>Apri Agenti →</div>
        </div>
      )}

      <Card
        style={{
          marginBottom: 14,
          borderLeft: `3px solid ${reportText ? C.purple : C.muted}`,
          background: reportText
            ? 'linear-gradient(145deg, rgba(139,92,246,.08) 0%, #0b1220 55%)'
            : undefined,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 }}>
              Desk Brief
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>Analisi di mercato</h3>
            <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>
              {reportSource || 'IN ATTESA'}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRegenerateBrief();
            }}
            disabled={briefBusy}
            style={{
              background: briefBusy ? C.panel2 : 'rgba(139,92,246,.18)',
              color: C.text,
              border: `1px solid ${C.purple}66`,
              borderRadius: 8,
              padding: '8px 12px',
              cursor: briefBusy ? 'wait' : 'pointer',
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {briefBusy ? 'Genero…' : 'Rigenera brief'}
          </button>
        </div>

        {briefMsg && (
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>{briefMsg}</div>
        )}

        {reportText ? (
          <div style={{ fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontWeight: 450 }}>
            {reportText}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Nessun brief salvato. Premi «Rigenera brief» oppure aspetta il prossimo run della pipeline.
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 14 }}>
        <Card onClick={onGoToAlpaca}>
          <Header eyebrow="Portafoglio" title="Posizioni aperte" right="APRI ALPACA →" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            <Metric label="Equity" value={money(equity)} color={C.text} />
            <Metric label="Cash" value={money(cash)} color={C.dim} />
            <Metric label="PnL aperto" value={`${openPnl >= 0 ? '+' : ''}${money(openPnl)}`} color={openPnl >= 0 ? C.green : C.red} sub={`${positionsCount} pos`} />
          </div>
          {Array.isArray(positions) && positions.length > 0 ? (
            <div style={{ display: 'grid', gap: 6 }}>
              {positions.slice(0, 6).map((p) => {
                const pnlPct = Number(p.unrealized_plpc || 0) * 100;
                const sym = p.symbol || p.ticker;
                return (
                  <div key={sym} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 72px', gap: 8, alignItems: 'center', padding: '8px 10px', background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 12 }}>{sym}</div>
                    <div style={{ fontSize: 10, color: C.dim }}>{money(p.market_value)} · {Number(p.qty || p.shares || 0).toFixed(2)} sh</div>
                    <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 12, color: pnlPct >= 0 ? C.green : C.red }}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: 18, textAlign: 'center', color: '#475569', fontSize: 12 }}>Nessuna posizione aperta.</div>
          )}
        </Card>

        <Card onClick={onGoToAgents}>
          <Header eyebrow="Automazione" title="Ultime operazioni" right="APRI AGENTI →" />
          {lastActions.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', color: '#475569', fontSize: 12 }}>
              Nessuna operazione recente. Il sistema resta fermo quando non trova setup sopra soglia.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {lastActions.slice(0, 8).map((a, i) => (
                <div key={`${a.ticker}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 8 }}>
                  <Pill color={a.action === 'BUY' ? C.green : a.action === 'SELL' ? C.red : C.amber}>{a.action}</Pill>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{a.ticker}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>
                    {a.pnl_pct != null ? `${Number(a.pnl_pct) >= 0 ? '+' : ''}${Number(a.pnl_pct).toFixed(1)}%` : a.shares ? `${Number(a.shares).toFixed(2)} sh` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <Header eyebrow="Scanner" title="Setup da osservare" right={topSetups.length ? `${topSetups.length} titoli` : '—'} />
        {topSetups.length === 0 ? (
          <div style={{ padding: 18, textAlign: 'center', color: '#475569', fontSize: 12 }}>Nessun setup in evidenza.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {topSetups.map((a) => {
              const ticker = a.ticker;
              const score = Number(a.setup_score || 0);
              const change = Number(a.change_pct || 0);
              const price = livePrices?.[ticker]?.price ?? a.price;
              const inFocus = focusSectors.includes(a.sector_code || a.sector);
              return (
                <div key={ticker} onClick={() => onLoadFullStock && onLoadFullStock(ticker)} style={{ padding: 11, background: C.panel2, border: `1px solid ${C.border2}`, borderLeft: `3px solid ${inFocus ? C.green : 'transparent'}`, borderRadius: 10, cursor: onLoadFullStock ? 'pointer' : 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{ticker}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: getScoreColor(score) }}>{score}</div>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: C.dim }}>
                    {a.setup_type || 'setup'} · <span style={{ color: change >= 0 ? C.green : C.red }}>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>
                    RSI {a.rsi != null ? Number(a.rsi).toFixed(0) : '—'} · ${Number(price || 0).toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {ctx && Array.isArray(ctx.sectors) && ctx.sectors.length > 0 && (
        <Card>
          <Header eyebrow="Flusso di capitale" title="Settori" right={ctx.intraday_available ? 'INTRADAY ON' : 'BARRE CHIUSE'} />
          <div style={{ display: 'grid', gap: 5 }}>
            {ctx.sectors.slice(0, 8).map((s) => {
              const inFocus = focusSectors.includes(s.sector);
              const inAvoid = avoidSectors.includes(s.sector);
              const edge = inFocus ? C.green : inAvoid ? C.red : 'transparent';
              return (
                <div key={s.sector} onClick={() => onGoToSector && onGoToSector(s.sector)} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 64px 64px', gap: 8, alignItems: 'center', padding: '7px 9px', borderRadius: 8, cursor: onGoToSector ? 'pointer' : 'default', background: inFocus ? 'rgba(34,197,94,.05)' : inAvoid ? 'rgba(239,68,68,.04)' : C.panel2, border: `1px solid ${C.border2}`, borderLeft: `3px solid ${edge}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{s.sector}</div>
                  <div style={{ fontSize: 10, color: C.dim }}>{inFocus ? 'FOCUS' : inAvoid ? 'EVITA' : s.status || '—'}</div>
                  <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: Number(s.rs_swing) >= 0 ? C.green : C.red }}>
                    {Number(s.rs_swing) >= 0 ? '+' : ''}{Number(s.rs_swing || 0).toFixed(1)}%
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10, color: C.muted }}>20g</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
