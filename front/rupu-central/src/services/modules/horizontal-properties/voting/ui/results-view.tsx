/**
 * Resultado de una votación con dona por coeficiente (opción 1e) y, cuando la
 * votación está cerrada, el resultado final (A8): veredicto, hora de cierre y
 * acciones (siguiente votación, reabrir, ver panel).
 */

'use client';

import { useEffect, type ReactNode } from 'react';
import {
  VT,
  formatCoef,
  formatOrder,
  formatPct,
  getQuorumStatus,
  getVerdict,
  getWinner,
  votingFontRoot,
  vtMono,
  type CoefficientResults,
} from './design';
import { VOTING_TIME_ZONE } from './design/status';

interface ResultsViewProps {
  results: CoefficientResults;
  quorum: number;
  votingTitle: string;
  displayOrder: number;
  /** Total de votaciones del grupo (para "01 / 04"). */
  totalVotings?: number | null;
  /** Votación cerrada: muestra el veredicto (A8). */
  closed?: boolean;
  /** Hora de cierre (ISO). */
  closedAt?: string | null;
  /** Texto del enlace para volver (arriba a la izquierda). */
  backLabel?: string;
  onBack: () => void;
  /** Acciones bajo la tabla (A8). */
  actions?: ReactNode;
}

const timeOf = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleTimeString('es-CO', { timeZone: VOTING_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false });
};

export function ResultsView({
  results,
  quorum,
  votingTitle,
  displayOrder,
  totalVotings,
  closed = false,
  closedAt,
  backLabel = 'Volver al panel',
  onBack,
  actions,
}: ResultsViewProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const { segments, pending, participation } = results;
  const status = getQuorumStatus(participation, quorum);
  const winner = getWinner(segments);
  const verdict = getVerdict(segments, participation, quorum);

  // Dona: circunferencia 100 (r = 15.9155) => el dasharray es directamente el %
  const radius = 15.91549430918954;
  let cumulative = 0;
  const donut = segments
    .filter((s) => s.pct > 0)
    .map((s) => {
      const pct = Math.min(s.pct, 100);
      const circle = (
        <circle
          key={s.key}
          r={radius}
          cx="21"
          cy="21"
          fill="transparent"
          stroke={s.color}
          strokeWidth="3"
          strokeDasharray={`${pct.toFixed(3)} ${(100 - pct).toFixed(3)}`}
          strokeDashoffset={(-cumulative).toFixed(3)}
          className="transition-all duration-500"
        />
      );
      cumulative += pct;
      return circle;
    });
  const quorumDeg = Math.min(Math.max(quorum, 0), 100) * 3.6;

  const rows = [
    ...segments.map((s) => ({ ...s, pending: false })),
    { key: 'pending', label: 'Pendiente', color: '#fff', pct: pending.pct, votes: pending.votes, coef: pending.coef, pending: true },
  ];

  const order = totalVotings ? `${formatOrder(displayOrder)} / ${formatOrder(totalVotings)}` : formatOrder(displayOrder);
  const closedTime = timeOf(closedAt);

  return (
    <div className={`fixed inset-0 z-[70] overflow-y-auto ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="min-h-full flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-7 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] hover:text-[#c8603f] transition-colors max-md:min-h-11"
            style={{ color: VT.inkSoft }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </button>
          <span className={`${vtMono} text-[11px] max-md:hidden`} style={{ color: VT.muted }}>Esc para volver</span>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-10 lg:gap-[60px] px-3 sm:px-10 lg:px-[90px] py-5 md:py-8 lg:py-12 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {/* Dona */}
          <div className="relative w-full max-w-[280px] md:max-w-[480px] aspect-square justify-self-center">
            <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90" role="img" aria-label={`Resultados por coeficiente. Quórum ${quorum}%`}>
              <circle r={radius} cx="21" cy="21" fill="transparent" stroke={VT.border} strokeWidth="3" />
              {donut}
              <line x1="37.5" y1="21" x2="40.5" y2="21" stroke={VT.accent} strokeWidth=".7" transform={`rotate(${quorumDeg} 21 21)`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 md:px-10">
              <div className={`${vtMono} text-xs tracking-[.08em]`} style={{ color: VT.muted }}>
                {winner ? (closed ? winner.label.toUpperCase() : `${winner.label.toUpperCase()} · MAYORÍA`) : 'SIN VOTOS AÚN'}
              </div>
              <div
                className={`${vtMono} font-semibold leading-none tracking-[-.05em] mt-1.5 text-[clamp(48px,10vw,92px)]`}
                style={{ color: winner ? winner.color : VT.muted }}
              >
                {formatPct(winner ? winner.pct : 0)}
                <span className="text-[0.37em]" style={{ color: VT.muted }}>%</span>
              </div>
              <div className="text-[13px] mt-2.5" style={{ color: VT.inkSoft }}>
                de coeficiente · participación {formatPct(participation)}%
              </div>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="flex flex-col gap-5 md:gap-7 min-w-0">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <span className={`${vtMono} text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
                  {closed
                    ? `VOTACIÓN ${order} · CERRADA${closedTime ? ` ${closedTime}` : ''}`
                    : `RESULTADOS · VOTACIÓN ${order}`}
                </span>
                {closed && (
                  <span className="px-[9px] py-[3px] rounded-full text-[11px] font-semibold text-white" style={{ background: verdict.color }}>
                    {verdict.label}
                  </span>
                )}
              </div>
              <h1 className="m-0 text-2xl sm:text-[32px] leading-[1.15] font-semibold tracking-[-.02em]">{votingTitle}</h1>
            </div>
            <div className="flex flex-col">
              {rows.map((r) => {
                const isWinner = !r.pending && winner?.key === r.key;
                return (
                  <div
                    key={r.key}
                    className="grid grid-cols-[14px_1fr_auto] sm:grid-cols-[14px_1fr_auto_auto] gap-x-3.5 gap-y-1 items-center py-3.5"
                    style={{ borderBottom: `1px solid ${VT.border}` }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-[3px]"
                      style={{ background: r.color, border: `1px solid ${r.pending ? VT.pendingBorder : r.color}` }}
                    />
                    <span className="text-[17px] flex items-center gap-2 min-w-0" style={{ fontWeight: isWinner ? 600 : r.pending ? 400 : 500 }}>
                      <span className="truncate">{r.label}</span>
                    </span>
                    <span className={`${vtMono} text-[13px] hidden sm:block`} style={{ color: VT.muted }}>
                      {r.votes} un. · coef {formatCoef(r.pct)}{!r.pending && ` · ${formatPct(r.pctOfVoted ?? 0)}% de lo votado`}
                    </span>
                    <span className={`${vtMono} text-2xl leading-none font-semibold tracking-[-.03em] min-w-[90px] text-right`}>
                      {formatPct(r.pct)}%
                    </span>
                    <span className={`${vtMono} text-xs sm:hidden col-start-2 col-span-2`} style={{ color: VT.muted }}>
                      {r.votes} un. · coef {formatCoef(r.pct)}{!r.pending && ` · ${formatPct(r.pctOfVoted ?? 0)}% de lo votado`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5 text-[13px]" style={{ color: VT.inkSoft }}>
              <span className="w-0.5 h-4" style={{ background: VT.accent }} />
              Quórum requerido {quorum}% ·{' '}
              <strong style={{ color: status.fg }}>{status.label}</strong>
            </div>
            {actions && <div className="flex flex-wrap gap-2 max-md:flex-col max-md:[&>*]:w-full">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
