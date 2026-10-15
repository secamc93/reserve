/**
 * Barra apilada por % de coeficiente con marcador de quórum (terracota).
 * Cada segmento ocupa su % sobre 100; el espacio restante (pendiente) queda en blanco.
 */

import { VT, type ResultSegment } from './tokens';
import { vtMono } from './fonts';

interface StackedBarProps {
  segments: Pick<ResultSegment, 'key' | 'pct' | 'color' | 'label'>[];
  quorum: number;
  /** Alto de la barra en px. */
  height?: number;
  /** Muestra la etiqueta "QUÓRUM N%" sobre el marcador. */
  showQuorumLabel?: boolean;
  /** Extensión del marcador por encima/debajo de la barra (px). */
  markerOverflow?: number;
  radius?: number;
}

export function StackedBar({
  segments,
  quorum,
  height = 28,
  showQuorumLabel = false,
  markerOverflow = 6,
  radius = 4,
}: StackedBarProps) {
  const clampedQuorum = Math.min(Math.max(quorum, 0), 100);
  const label = segments
    .filter((s) => s.pct > 0)
    .map((s) => `${s.label} ${s.pct.toFixed(1)}%`)
    .join(', ');

  return (
    <div className="relative" style={{ height }} role="img" aria-label={`Resultados por coeficiente: ${label || 'sin votos'}. Quórum ${clampedQuorum}%`}>
      <div
        className="flex h-full overflow-hidden bg-white"
        style={{ borderRadius: radius, border: `1px solid ${VT.borderStrong}` }}
      >
        {segments.map((s) =>
          s.pct > 0 ? (
            <div
              key={s.key}
              className="h-full transition-[width] duration-500"
              style={{ width: `${Math.min(s.pct, 100)}%`, background: s.color }}
              title={`${s.label}: ${s.pct.toFixed(1)}%`}
            />
          ) : null
        )}
      </div>
      <div
        className="absolute"
        style={{
          top: -markerOverflow,
          bottom: -markerOverflow,
          left: `${clampedQuorum}%`,
          width: 2,
          background: VT.accent,
          transform: 'translateX(-1px)',
        }}
      />
      {showQuorumLabel && (
        <div
          className={`absolute whitespace-nowrap text-[10px] font-semibold tracking-[.06em] ${vtMono}`}
          style={{ top: -24, left: `${clampedQuorum}%`, transform: 'translateX(-50%)', color: VT.accent }}
        >
          QUÓRUM {clampedQuorum}%
        </div>
      )}
    </div>
  );
}
