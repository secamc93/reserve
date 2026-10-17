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

/** Cifra por opción: en línea en escritorio; en teléfono, celda de una grilla de 2 columnas. */
const metricCell =
  'flex items-baseline gap-2 min-w-0 max-md:flex-wrap max-md:gap-x-2 max-md:gap-y-1.5 max-md:rounded-lg max-md:px-3 max-md:py-2.5 max-md:bg-[#faf9f7] max-md:border max-md:border-[#e4e2dd]';

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
    <div className="bg-white px-3 sm:px-7 pt-4 md:pt-6" style={{ borderBottom: `1px solid ${VT.border}` }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 md:gap-6 lg:gap-10 items-end pb-4 md:pb-5">
        <div className="min-w-0">
          {/* Cifras por opción */}
          <div className="flex flex-wrap gap-x-7 gap-y-3 items-baseline max-md:grid max-md:grid-cols-2 max-md:gap-2">
            {segments.map((s) => (
              <div key={s.key} className={metricCell}>
                <span className="inline-block w-2.5 h-2.5 rounded-[2px] -translate-y-px shrink-0" style={{ background: s.color }} />
                <span className="text-[13px] max-md:flex-1 max-md:min-w-0 max-md:truncate" style={{ color: VT.inkSoft }} title={s.label}>{s.label}</span>
                <span className="inline-flex items-baseline gap-2 max-md:basis-full">
                  <span className={`${vtMono} text-[26px] max-md:text-[22px] leading-none font-semibold tracking-[-.03em]`} style={{ color: VT.ink }}>
                    {formatPct(s.pct)}
                    <span className="text-sm" style={{ color: VT.muted }}>%</span>
                  </span>
                  <span className="text-[11px]" style={{ color: VT.muted }}>{s.votes} un.</span>
                  <span className="text-[11px] font-semibold" style={{ color: VT.inkSoft }} title="Sobre el coeficiente de las unidades que votaron">
                    {formatPct(s.pctOfVoted ?? 0)}% de lo votado
                  </span>
                </span>
              </div>
            ))}
            <div className={`${metricCell} lg:ml-auto`}>
              <span
                className="inline-block w-2.5 h-2.5 rounded-[2px] -translate-y-px shrink-0"
                style={{ border: `1px solid ${VT.pendingBorder}`, background: '#fff' }}
              />
              <span className="text-[13px] max-md:flex-1 max-md:min-w-0 max-md:truncate" style={{ color: VT.inkSoft }}>Pendiente</span>
              <span className="inline-flex items-baseline gap-2 max-md:basis-full">
                <span className={`${vtMono} text-[26px] max-md:text-[22px] leading-none font-semibold tracking-[-.03em]`} style={{ color: VT.muted }}>
                  {formatPct(pending.pct)}
                  <span className="text-sm">%</span>
                </span>
                <span className="text-[11px]" style={{ color: VT.muted }}>{pending.votes} un.</span>
              </span>
            </div>
          </div>

          {/* Barra apilada con quórum */}
          <div className="mt-7 md:mt-[30px]">
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
          <div className={`${vtMono} text-[34px] md:text-[40px] leading-none font-semibold tracking-[-.04em]`} style={{ color: VT.ink }}>
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
