import React, { useEffect, useState } from 'react';
import { getScoreColor, getSetupBadge, getRegimeColor } from '../utils/helpers';
import {
  fetchMarketContext,
  fetchMaxStrategyShadow,
  fetchMaxStrategyValidation,
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
  NARROW_BULL: 'Gli indici tengono ma pochi titoli partecipano. Il rialzo è guidato da poche mega cap: fragile.',
  PULLBACK_IN_UPTREND: 'Trend di fondo intatto, debolezza di breve periodo. Le correzioni qui sono occasioni.',
  NEUTRAL: 'Nessuna direzione chiara. Il mercato non offre un vantaggio evidente in nessuna direzione.',
  ROTATION: 'Il capitale si sta spostando fra settori. La leadership sta cambiando: attenzione a chi guidava prima.',
  EARLY_RECOVERY: 'Il breve periodo ha girato al rialzo mentre il trend resta debole. Possibile svolta, da confermare.',
  BEAR: 'Trend negativo e partecipazione debole. Il sistema riduce fortemente la size.',
  CRASH: 'Stress di mercato. Nessun nuovo ingresso ordinario: resta attivo solo il Crash Deploy su SPY.',
};

const FLOW_INFO = {
  TREND_CONFIRMED: { label: 'Conferma trend', color: C.green, hint: 'Denaro in ingresso su un settore già forte' },
  ROTATION_INFLOW: { label: 'Rotazione', color: C.blue, hint: 'Denaro che arriva su un settore ancora debole' },
  ONE_DAY_SPIKE: { label: 'Solo oggi', color: C.amber, hint: 'Balzo isolato senza conferma: il sistema lo ignora' },
  TREND_INTACT: { label: 'Trend intatto', color: C.dim, hint: 'Debole oggi ma la tendenza resta positiva' },
  OUTFLOW: { label: 'Uscita', color: C.red, hint: 'Denaro in uscita, anche nel trend' },
  NEUTRAL_FLOW: { label: 'Neutro', color: C.muted, hint: '' },
};

const STATUS_LABEL = {
  ESTABLISHED_LEADER: 'Leader consolidato',
  EMERGING_LEADER: 'Leader emergente',
  FADING_LEADER: 'Leader in calo',
  IMPROVING: 'In miglioramento',
  DETERIORATING: 'In peggioramento',
  NEUTRAL: 'Neutro',
};

const LEADERSHIP_EXPLAIN = {
  BROAD_PARTICIPATION: 'Partecipazione ampia: sale la maggioranza del mercato, non solo i giganti.',
  MEGA_CAP_NARROW: 'Rialzo stretto guidato dalle mega cap tecnologiche. Storicamente più fragile.',
  NARROW_NON_TECH: 'Rialzo stretto non guidato dalla tecnologia.',
  SMALL_CAP_LED: 'Guidano le small cap: partecipazione molto ampia.',
  DEFENSIVE_LED: 'Comandano utility, consumi di base e sanità. Il mercato cerca riparo.',
  NO_CLEAR_LEADERSHIP: 'Nessun gruppo comanda con chiarezza.',
};

const ROTATION_EXPLAIN = {
  STABLE_LEADERSHIP: 'Gli stessi settori guidano sia il trimestre sia il mese.',
  ROTATION_STARTING: 'Un settore sta entrando nella leadership: la rotazione è iniziata.',
  ROTATION_IN_PROGRESS: 'La leadership è cambiata quasi del tutto rispetto al trimestre.',
};

function exposureMeaning(multiplier) {
  const pct = Math.round(Number(multiplier || 0) * 100);
  if (pct >= 90) return 'Size piena sui nuovi ingressi';
  if (pct >= 70) return 'Size quasi piena, leggera prudenza';
  if (pct >= 55) return 'Size ridotta: il sistema è prudente';
  if (pct >= 30) return 'Size fortemente ridotta';
  return 'Nessun nuovo ingresso ordinario';
}

function breadthMeaning(pct) {
  const value = Number(pct || 0);
  if (value >= 60) return 'Partecipazione sana';
  if (value >= 40) return 'Partecipazione mista';
  if (value >= 25) return 'Partecipazione debole';
  return 'Partecipazione critica';
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
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>{title}</h3>
      </div>
      {right && <div style={{ fontSize: 9, color: '#475569', whiteSpace: 'nowrap' }}>{right}</div>}
    </div>
  );
}

function Stat({ label, value, color = C.text, hint }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 11, minWidth: 0 }}>
      <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 16, fontWeight: 800, color, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
      {hint && <div style={{ marginTop: 3, fontSize: 9, color: C.muted }}>{hint}</div>}
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

function Bar({ value, max = 100, color }) {
  const width = Math.min(Math.abs(Number(value) || 0) / max * 100, 100);
  return (
    <div style={{ height: 5, background: '#172235', borderRadius: 10, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 10 }} />
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

  useEffect(() => {
    let alive = true;

    async function load() {
      const [context, shadow, valid] = await Promise.all([
        fetchMarketContext(),
        fetchMaxStrategyShadow(),
        fetchMaxStrategyValidation(200),
      ]);
      if (!alive) return;
      if (context && context.available) setCtx(context);
      setMaxShadow(shadow);
      setValidation(valid);
    }

    load();
    const timer = setInterval(load, 120000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const ps = agentsStatus?.pipeline_state;
  const brain = agentsStatus?.shared_brain?.market || {};
  const market = { ...(ps?.market || {}), ...brain };

  const regime = ctx?.regime || market.regime || 'NEUTRAL';
  const detail = ctx?.regime_detail || market.regime_detail || regime;
  const detailReason = ctx?.regime_detail_reason;
  const confidence = Number(ctx?.confidence ?? market.confidence ?? 0);
  const exposure = Number(ctx?.exposure_multiplier ?? market.exposure_multiplier ?? 0);
  const breadth = Number(ctx?.breadth_pct ?? market.breadth_pct ?? 0);
  const volatility = ctx?.volatility || market.volatility || 'NORMAL';
  const llmMacro = ctx?.llm_reasoning || market.llm_reasoning;
  const regimeColor = getRegimeColor(regime);

  const lastRun = parseDate(ps?.last_run);
  const minutesAgo = lastRun ? Math.round((Date.now() - lastRun.getTime()) / 60000) : null;
  const fresh = minutesAgo !== null && minutesAgo < 45;

  const focusSectors = ctx?.focus_sectors || [];
  const avoidSectors = ctx?.avoid_sectors || [];
  const focusSet = new Set(focusSectors);
  const avoidSet = new Set(avoidSectors);

  const leadershipSectors = ctx?.sectors || [];
  const intradayOn = Boolean(ctx?.intraday_available);
  const spyToday = Number(ctx?.intraday_spy_move || 0);

  const alphaCounts = maxShadow?.action_counts || {};
  const vSummary = validation?.summary || {};
  const vAvg = vSummary.averages || {};

  const topSetups = [...(assets || [])]
    .sort((a, b) => (b.setup_score || 0) - (a.setup_score || 0))
    .slice(0, 10);

  const lastActions = ps?.actions || [];
  const volColor = volatility === 'EXTREME' ? C.red : volatility === 'HIGH' ? C.orange : C.green;

  return (
    <div style={{ color: C.text, paddingBottom: 40 }}>
      <Card style={{ marginBottom: 14, padding: 18, background: 'radial-gradient(circle at 85% 15%, rgba(56,189,248,.12), transparent 32%), linear-gradient(145deg,#0d1729,#070c17)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.8 }}>
              Swing<span style={{ color: C.blue }}>Lab</span>
            </div>
            <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 2 }}>
              Market Intelligence Center
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Pill color={fresh ? C.green : C.amber}>
              {fresh ? 'PIPELINE ATTIVA' : minutesAgo === null ? 'MAI ESEGUITA' : 'IN RITARDO'}
            </Pill>
            <span style={{ fontSize: 9, color: C.muted }}>
              {minutesAgo === null ? 'nessun run' : minutesAgo < 60 ? `${minutesAgo} min fa` : `${Math.round(minutesAgo / 60)}h fa`}
              {ps?.pipeline?.timing?.total ? ` · ${ps.pipeline.timing.total}s` : ''}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <div style={{ background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Regime</div>
            <div style={{ marginTop: 5, fontSize: 17, fontWeight: 900, color: regimeColor }}>{regime}</div>
            {detail && detail !== regime && (
              <div style={{ marginTop: 4 }}>
                <Pill color={C.purple}>{detail}</Pill>
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 9, color: C.muted }}>Confidenza {confidence.toFixed(1)}</div>
          </div>

          <div style={{ background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Esposizione</div>
            <div style={{ marginTop: 5, fontSize: 17, fontWeight: 900, color: C.green }}>{Math.round(exposure * 100)}%</div>
            <div style={{ marginTop: 6, fontSize: 9, color: C.dim }}>{exposureMeaning(exposure)}</div>
          </div>

          <div style={{ background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Partecipazione</div>
            <div style={{ marginTop: 5, fontSize: 17, fontWeight: 900, color: breadth >= 50 ? C.green : breadth >= 35 ? C.amber : C.red }}>
              {breadth.toFixed(1)}%
            </div>
            <div style={{ marginTop: 6, fontSize: 9, color: C.dim }}>{breadthMeaning(breadth)} · sopra EMA50</div>
          </div>

          <div style={{ background: C.panel2, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Volatilità</div>
            <div style={{ marginTop: 5, fontSize: 17, fontWeight: 900, color: volColor }}>{volatility}</div>
            <div style={{ marginTop: 6, fontSize: 9, color: C.dim }}>
              {ctx?.crash_radar?.crash_level ? `Crash radar ${ctx.crash_radar.crash_level}` : 'Da VIXY'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, padding: 12, background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#ddd6fe', lineHeight: 1.6 }}>
            {REGIME_EXPLAIN[detail] || REGIME_EXPLAIN[regime] || 'Regime in valutazione.'}
          </div>
          {detailReason && (
            <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>{detailReason}</div>
          )}
        </div>
      </Card>

      {ctx && (
        <Card style={{ marginBottom: 14 }}>
          <Header
            eyebrow="Flusso di capitale"
            title="Dove vanno i soldi"
            right={intradayOn ? `SPY OGGI ${spyToday >= 0 ? '+' : ''}${spyToday.toFixed(2)}%` : 'SOLO BARRE CHIUSE'}
          />

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
            <Pill color={C.blue}>{ctx.leadership_state || 'N/D'}</Pill>
            <Pill color={C.purple}>{ctx.rotation_state || 'N/D'}</Pill>
            {ctx.emerging_leaders?.length > 0 && <Pill color={C.green}>Emergente: {ctx.emerging_leaders.join(', ')}</Pill>}
            {ctx.fading_leaders?.length > 0 && <Pill color={C.red}>In calo: {ctx.fading_leaders.join(', ')}</Pill>}
          </div>

          <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6, marginBottom: 12 }}>
            {LEADERSHIP_EXPLAIN[ctx.leadership_state] || ''}
            {ctx.rotation_state && ROTATION_EXPLAIN[ctx.rotation_state] ? ` ${ROTATION_EXPLAIN[ctx.rotation_state]}` : ''}
          </div>

          {intradayOn && ctx.flow_summary && (
            <div style={{ padding: 10, background: 'rgba(56,189,248,.06)', border: '1px solid rgba(56,189,248,.2)', borderRadius: 9, marginBottom: 12, fontSize: 11, color: '#bae6fd' }}>
              {ctx.flow_summary}
            </div>
          )}

          <div style={{ display: 'grid', gap: 6 }}>
            {leadershipSectors.slice(0, 11).map((s) => {
              const flow = FLOW_INFO[s.flow] || FLOW_INFO.NEUTRAL_FLOW;
              const inFocus = focusSet.has(s.sector);
              const inAvoid = avoidSet.has(s.sector);
              const edge = inFocus ? C.green : inAvoid ? C.red : 'transparent';

              return (
                <div
                  key={s.sector}
                  onClick={() => onGoToSector && onGoToSector(s.sector)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '54px 1fr 62px 62px 96px',
                    gap: 8,
                    alignItems: 'center',
                    padding: '8px 9px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: inFocus ? 'rgba(34,197,94,.05)' : inAvoid ? 'rgba(239,68,68,.04)' : C.panel2,
                    borderLeft: `3px solid ${edge}`,
                    border: `1px solid ${C.border2}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{s.sector}</div>
                    <div style={{ fontSize: 7, color: C.muted, marginTop: 2 }}>
                      {inFocus ? 'FOCUS' : inAvoid ? 'EVITA' : `#${s.rank_swing ?? '-'}`}
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: C.dim }}>{STATUS_LABEL[s.status] || s.status}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Bar value={s.rs_swing} max={8} color={Number(s.rs_swing) >= 0 ? C.green : C.red} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 7, color: C.muted }}>20g</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: Number(s.rs_swing) >= 0 ? C.green : C.red }}>
                      {Number(s.rs_swing) >= 0 ? '+' : ''}{Number(s.rs_swing || 0).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 7, color: C.muted }}>63g</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: Number(s.rs_structural) >= 0 ? C.green : C.red }}>
                      {Number(s.rs_structural) >= 0 ? '+' : ''}{Number(s.rs_structural || 0).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <Pill color={flow.color}>{flow.label}</Pill>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 10, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
            La forza relativa è calcolata contro SPY. Un settore entra in FOCUS quando guida davvero: i balzi di una sola
            giornata vengono esclusi. Nei settori in focus la soglia di ingresso si abbassa, in quelli da evitare si alza.
          </div>
        </Card>
      )}

      {llmMacro && (
        <Card style={{ marginBottom: 14, borderLeft: `3px solid ${C.purple}` }}>
          <Header eyebrow="Analisi automatica" title="Lettura macro" right="GENERATA DAL MACROANALYST" />
          <div style={{ fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{llmMacro}</div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14, marginBottom: 14 }}>
        <Card onClick={onGoToAlpaca}>
          <Header eyebrow="Account" title="Portafoglio" right="APRI ALPACA →" />
          {alpacaData ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <Stat label="Equity" value={money(alpacaData.equity)} />
                <Stat label="Cash" value={money(alpacaData.cash)} hint="Liquidità disponibile" />
                <Stat
                  label="P&L giornaliero"
                  value={`${Number(alpacaData.daily_pnl || 0) >= 0 ? '+' : ''}${money(alpacaData.daily_pnl)}`}
                  color={Number(alpacaData.daily_pnl || 0) >= 0 ? C.green : C.red}
                />
                <Stat label="Posizioni" value={alpacaData.positions?.length || 0} hint="Aperte adesso" />
              </div>

              {alpacaData.positions?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {alpacaData.positions.slice(0, 8).map((p) => (
                    <div
                      key={p.symbol}
                      style={{
                        padding: '5px 9px',
                        borderRadius: 7,
                        background: '#111b2c',
                        border: `1px solid ${C.border}`,
                        fontSize: 9,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <b>{p.symbol}</b>{' '}
                      <span style={{ color: Number(p.pnl_pct || 0) >= 0 ? C.green : C.red }}>
                        {Number(p.pnl_pct || 0) >= 0 ? '+' : ''}{Number(p.pnl_pct || 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#475569', fontSize: 12, textAlign: 'center', padding: 20 }}>Connessione ad Alpaca...</div>
          )}
        </Card>

        <Card onClick={onGoToAgents}>
          <Header eyebrow="Validazione in corso" title="Max Strategy" right="ORDINI LIVE OFF" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <Stat label="Piani armati" value={alphaCounts.WOULD_ARM || 0} color={C.blue} hint="In attesa del trigger" />
            <Stat label="Would buy" value={alphaCounts.WOULD_BUY || 0} color={C.green} hint="Solo simulazione" />
            <Stat label="Segnali registrati" value={vSummary.total || 0} hint="Snapshot point-in-time" />
            <Stat
              label="Trigger raggiunti"
              value={vSummary.trigger_reached || 0}
              color={C.amber}
              hint={`${vSummary.invalidation_reached || 0} invalidazioni`}
            />
          </div>

          {(vAvg.avg_mfe_pct !== undefined || vAvg.avg_mae_pct !== undefined) && (
            <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: 10, color: C.dim }}>
              <span>
                Escursione favorevole media{' '}
                <b style={{ color: C.green }}>+{Number(vAvg.avg_mfe_pct || 0).toFixed(2)}%</b>
              </span>
              <span>
                Avversa{' '}
                <b style={{ color: C.red }}>{Number(vAvg.avg_mae_pct || 0).toFixed(2)}%</b>
              </span>
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
            La strategia registra i segnali ma non invia ordini. Servono i risultati a 5, 10 e 20 sedute prima di
            decidere se attivarla sul paper trading.
          </div>
        </Card>
      </div>

      {Object.keys(marketData || {}).length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <Header eyebrow="Live tape" title="Indici e asset macro" right="PREZZI IN TEMPO REALE" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: 8 }}>
            {Object.entries(marketData).slice(0, 12).map(([sym, data]) => {
              const price = livePrices?.[sym]?.price ?? data.price;
              const change = Number(livePrices?.[sym]?.change_pct ?? data.change_pct ?? 0);
              const positive = change >= 0;

              return (
                <div
                  key={sym}
                  style={{
                    background: C.panel2,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 10,
                    padding: 10,
                    borderTop: `2px solid ${positive ? C.green : C.red}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{sym}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 5 }}>
                    {price != null ? `$${Number(price).toLocaleString('it-IT', { maximumFractionDigits: 2 })}` : '—'}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 10, fontWeight: 700, color: positive ? C.green : C.red }}>
                    {positive ? '▲ +' : '▼ '}{change.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 14 }}>
        <Header eyebrow="Scanner" title="Migliori setup tecnici" right={`${topSetups.length} TITOLI`} />

        {topSetups.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#475569', fontSize: 12 }}>Nessun setup disponibile.</div>
        ) : (
          <div style={{ display: 'grid', gap: 7 }}>
            {topSetups.map((a, index) => {
              const live = livePrices?.[a.ticker];
              const price = live?.price ?? a.price;
              const change = Number(live?.change_pct ?? a.change_pct ?? 0);
              const score = Number(a.setup_score || 0);
              const ml = mlPredictions?.[a.ticker];
              const trend = trendPredictions?.[a.ticker];
              const sector = a.sector_code || '';
              const inFocus = focusSet.has(sector);
              const inAvoid = avoidSet.has(sector);

              return (
                <div
                  key={a.ticker}
                  onClick={() => onLoadFullStock(a.ticker)}
                  style={{
                    background: C.panel2,
                    border: `1px solid ${C.border2}`,
                    borderLeft: `3px solid ${inFocus ? C.green : inAvoid ? C.red : C.border2}`,
                    borderRadius: 10,
                    padding: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '22px 62px 1fr 52px', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontSize: 8, color: '#475569' }}>{String(index + 1).padStart(2, '0')}</div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 900 }}>{a.ticker}</div>
                      <div style={{ fontSize: 7, color: inFocus ? C.green : inAvoid ? C.red : C.muted, marginTop: 2 }}>
                        {sector || '—'}{inFocus ? ' · FOCUS' : inAvoid ? ' · EVITA' : ''}
                      </div>
                    </div>

                    <div>
                      <Bar value={score} color={getScoreColor(score)} />
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                        {getSetupBadge(a.setup_type)}
                        {ml && (
                          <span
                            style={{
                              background: ml.prediction === 'WIN' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
                              color: ml.prediction === 'WIN' ? C.green : C.red,
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 8,
                              fontWeight: 600,
                            }}
                          >
                            ML {ml.ml_score}%
                          </span>
                        )}
                        {trend && (
                          <span
                            style={{
                              background:
                                trend.prediction === 'UP'
                                  ? 'rgba(34,197,94,.12)'
                                  : trend.prediction === 'DOWN'
                                  ? 'rgba(239,68,68,.12)'
                                  : 'rgba(234,179,8,.12)',
                              color: trend.prediction === 'UP' ? C.green : trend.prediction === 'DOWN' ? C.red : '#eab308',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 8,
                              fontWeight: 600,
                            }}
                          >
                            {trend.prediction} {trend.up_prob}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: getScoreColor(score) }}>{score}</div>
                      <div style={{ fontSize: 8, color: change >= 0 ? C.green : C.red, marginTop: 2 }}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 7, color: C.muted }}>
                    <span>RSI {a.rsi != null ? Number(a.rsi).toFixed(0) : '—'}</span>
                    <span>${Number(price || 0).toLocaleString('it-IT', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
          Questo è il punteggio tecnico dello scanner, non la confluence finale usata per comprare. Il bordo verde indica
          un titolo in un settore dove il capitale sta entrando.
        </div>
      </Card>

      <Card onClick={onGoToAgents}>
        <Header eyebrow="Automazione" title="Ultime operazioni" right="APRI AGENTI →" />
        {lastActions.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#475569', fontSize: 11 }}>
            Nessuna operazione recente. Il sistema resta fermo quando non trova setup che superano la soglia.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {lastActions.slice(0, 6).map((a, i) => (
              <div
                key={`${a.ticker}-${i}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 10px',
                  background: C.panel2,
                  border: `1px solid ${C.border2}`,
                  borderRadius: 8,
                }}
              >
                <Pill color={a.action === 'BUY' ? C.green : a.action === 'SELL' ? C.red : C.amber}>{a.action}</Pill>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{a.ticker}</div>
                <div style={{ color: C.muted, fontSize: 9 }}>
                  {a.pnl_pct != null ? `${Number(a.pnl_pct) >= 0 ? '+' : ''}${Number(a.pnl_pct).toFixed(1)}%` : a.shares ? `${Number(a.shares).toFixed(2)} sh` : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
