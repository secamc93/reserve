/** Cifras de resumen de Unidades: total, activas, con residentes y suma de coeficientes. */

'use client';

import type { PropertyUnitsSummary } from '../domain';
import { formatCoefficientSum, formatPercent, getCoefficientStatus, shareOf } from '../domain';
import { DsStat } from './kit';

export function UnitsSummaryStats({ summary }: { summary: PropertyUnitsSummary | null }) {
  const dash = '—';
  const status = summary ? getCoefficientStatus(summary.coefficientSum) : null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5" aria-label="Resumen de unidades">
      <DsStat label="Unidades" value={summary ? summary.total : dash} hint={summary ? `${summary.blocks.length} bloque${summary.blocks.length === 1 ? '' : 's'}` : undefined} />
      <DsStat
        label="Activas"
        value={summary ? summary.active : dash}
        hint={summary && summary.total > summary.active ? `${summary.total - summary.active} inactivas` : summary ? 'Todas activas' : undefined}
      />
      <DsStat
        label="Con residentes"
        value={summary ? summary.withResidents : dash}
        hint={summary ? `${formatPercent(shareOf(summary.withResidents, summary.total))} ocupación` : undefined}
      />
      <DsStat
        label="Suma de coeficientes"
        value={summary ? formatCoefficientSum(summary.coefficientSum) : dash}
        hint={status?.label}
        tone={status ? (status.ok ? 'ok' : 'warn') : 'default'}
      />
    </div>
  );
}
