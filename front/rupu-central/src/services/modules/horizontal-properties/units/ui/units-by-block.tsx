/**
 * U1 · Vista "Por bloque": cada bloque/torre con sus unidades, activas, suma de coeficientes
 * y participación en el total, más la fila de totales. Clic en un bloque → lista filtrada.
 */

'use client';

import { DS, DsTable, dsMono, type DsColumn } from '@shared/ui/ds';
import type { PropertyUnitsSummary } from '../domain';
import { blockLabel, buildBlockRows, formatCoefficientSum, formatPercent, type BlockRow } from '../domain';

export function UnitsByBlock({
  summary,
  onSelectBlock,
}: {
  summary: PropertyUnitsSummary | null;
  onSelectBlock: (block: string) => void;
}) {
  const rows = buildBlockRows(summary);

  const columns: DsColumn<BlockRow>[] = [
    { key: 'block', label: 'Bloque', width: 'minmax(120px,1fr)', render: (r) => <span className="font-semibold">{blockLabel(r.block)}</span> },
    { key: 'total', label: 'Unidades', width: '90px', align: 'right', render: (r) => <span className={`${dsMono} text-xs`}>{r.total}</span> },
    { key: 'active', label: 'Activas', width: '80px', align: 'right', render: (r) => <span className={`${dsMono} text-xs`}>{r.active}</span> },
    {
      key: 'coef',
      label: 'Suma coeficientes',
      width: '130px',
      align: 'right',
      render: (r) => <span className={`${dsMono} text-xs font-medium`}>{formatCoefficientSum(r.coefficientSum)}</span>,
    },
    {
      key: 'share',
      label: 'Participación',
      width: 'minmax(160px,1.2fr)',
      render: (r) => (
        <div className="flex items-center gap-2.5 w-full">
          <div className="flex-1 h-1.5 rounded-full bg-[#efedea] overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, r.share)}%`, background: DS.ink }} />
          </div>
          <span className={`${dsMono} text-[11px] w-14 text-right`}>{formatPercent(r.share)}</span>
        </div>
      ),
    },
  ];

  return (
    <DsTable
      ariaLabel="Unidades por bloque"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.block || '__sin_bloque__'}
      onRowClick={(r) => r.block.trim() && onSelectBlock(r.block)}
      loading={!summary}
      minWidth={640}
      empty="Aún no hay unidades"
      footer={
        summary && (
          <div className={`${dsMono} flex flex-wrap justify-between gap-2 text-[11px] text-[#4b4a46] py-1`}>
            <span>TOTAL · {summary.total} unidades en {summary.blocks.length} bloques</span>
            <span>Suma de coeficientes {formatCoefficientSum(summary.coefficientSum)}</span>
          </div>
        )
      }
    />
  );
}
