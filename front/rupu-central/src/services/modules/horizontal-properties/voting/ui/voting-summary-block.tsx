'use client';

/**
 * Resumen en vivo de la votación (rediseño, opción 1a):
 * cifras grandes por opción (% por coeficiente), barra apilada con marcador
 * de quórum y participación con badge de estado del quórum.
 */

import {
  StackedBar,
  VT,
  vtMono,
  formatPct,
  getQuorumStatus,
  type CoefficientResults,
} from './design';

interface VotingSummaryBlockProps {
  /** Resultados por coeficiente ya calculados (null mientras cargan). */
  results: CoefficientResults | null;
  /** Quórum requerido (% de coeficiente). */
  quorum: number;
}

export function VotingSummaryBlock({ results, quorum }: VotingSummaryBlockProps) {
  if (!results) {
    return (
      <div className="px-4 sm:px-7 py-6 bg-white text-sm" style={{ borderBottom: `1px solid ${VT.border}`, color: VT.muted }}>
        Cargando estadísticas...
      </div>
    );
  }

  const { segments, pending, participation } = results;
  const status = getQuorumStatus(participation, quorum);

  return (
    <div className="bg-white px-4 sm:px-7 pt-6" style={{ borderBottom: `1px solid ${VT.border}` }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-end pb-5">
        <div className="min-w-0">
          {/* Cifras por opción */}
          <div className="flex flex-wrap gap-x-7 gap-y-3 items-baseline">
            {segments.map((s) => (
              <div key={s.key} className="flex items-baseline gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-[2px] -translate-y-px" style={{ background: s.color }} />
                <span className="text-[13px]" style={{ color: VT.inkSoft }}>{s.label}</span>
                <span className={`${vtMono} text-[26px] leading-none font-semibold tracking-[-.03em]`} style={{ color: VT.ink }}>
                  {formatPct(s.pct)}
                  <span className="text-sm" style={{ color: VT.muted }}>%</span>
                </span>
                <span className="text-[11px]" style={{ color: VT.muted }}>{s.votes} un.</span>
              </div>
            ))}
            <div className="flex items-baseline gap-2 lg:ml-auto">
              <span
                className="inline-block w-2.5 h-2.5 rounded-[2px] -translate-y-px"
                style={{ border: `1px solid ${VT.pendingBorder}`, background: '#fff' }}
              />
              <span className="text-[13px]" style={{ color: VT.inkSoft }}>Pendiente</span>
              <span className={`${vtMono} text-[26px] leading-none font-semibold tracking-[-.03em]`} style={{ color: VT.muted }}>
                {formatPct(pending.pct)}
                <span className="text-sm">%</span>
              </span>
              <span className="text-[11px]" style={{ color: VT.muted }}>{pending.votes} un.</span>
            </div>
          </div>

          {/* Barra apilada con quórum */}
          <div className="mt-[30px]">
            <StackedBar segments={segments} quorum={quorum} height={28} showQuorumLabel />
          </div>
          <div className={`${vtMono} flex justify-between text-[10px] mt-1.5`} style={{ color: VT.muted }}>
            <span>0</span>
            <span>% por coeficiente</span>
            <span>100</span>
          </div>
        </div>

        {/* Participación */}
        <div className="text-left lg:text-right pb-1">
          <div className={`${vtMono} text-[11px] tracking-[.06em] mb-0.5`} style={{ color: VT.muted }}>
            PARTICIPACIÓN
          </div>
          <div className={`${vtMono} text-[40px] leading-none font-semibold tracking-[-.04em]`} style={{ color: VT.ink }}>
            {formatPct(participation)}
            <span className="text-lg" style={{ color: VT.muted }}>%</span>
          </div>
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-2 py-[3px] rounded text-[11px] font-semibold"
            style={{ background: status.bg, color: status.fg }}
          >
            {status.label}
          </div>
        </div>
      </div>
    </div>
  );
}
