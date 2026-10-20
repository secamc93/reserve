'use client';

/**
 * Tabla densa de la portería: la misma de shared/ui/ds (DsTable) con `rowStyle` para pintar la
 * fila que excede su tiempo (#fdf4f1). Candidata a subir a DsTable como prop.
 */

import type { CSSProperties, ReactNode } from 'react';
import { dsMono } from '@/shared/ui/ds';

export type { Column as DenseColumn };

interface Column<T> {
  key: string;
  label: ReactNode;
  /** Ancho de la columna en el grid ("90px", "1fr", "minmax(120px,1fr)"). */
  width: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
}

/**
 * Tabla densa: tarjeta blanca, encabezados en mono (10 px, gris) y filas de 13 px separadas
 * por líneas suaves. En pantallas angostas se desplaza horizontalmente.
 */
export function DenseTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  loading,
  empty = 'Sin registros',
  minWidth = 860,
  footer,
  ariaLabel,
  rowStyle,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  selectedKey?: string | number | null;
  loading?: boolean;
  empty?: ReactNode;
  minWidth?: number;
  footer?: ReactNode;
  ariaLabel?: string;
  /** Estilo por fila (p. ej. fondo de la que excede su tiempo). */
  rowStyle?: (row: T) => CSSProperties | undefined;
}) {
  const template = columns.map((c) => c.width).join(' ');
  const align = (a?: 'left' | 'right' | 'center') => (a === 'right' ? 'text-right justify-end' : a === 'center' ? 'text-center justify-center' : '');
  return (
    <div className="bg-white border border-[#e4e2dd] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <div role="table" aria-label={ariaLabel} style={{ minWidth }}>
          <div role="row" className={`${dsMono} grid gap-3.5 px-[18px] py-[9px] border-b border-[#efedea] text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580]`} style={{ gridTemplateColumns: template }}>
            {columns.map((c) => (
              <span key={c.key} role="columnheader" className={`flex ${align(c.align)}`}>{c.label}</span>
            ))}
          </div>
          {loading ? (
            <div className="px-[18px] py-10 text-center text-sm text-[#8a8580]">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="px-[18px] py-10 text-center text-sm text-[#8a8580]">{empty}</div>
          ) : (
            rows.map((row) => {
              const key = rowKey(row);
              const selected = selectedKey !== undefined && selectedKey === key;
              return (
                <div
                  key={key}
                  role="row"
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`grid gap-3.5 px-[18px] py-2.5 items-center border-b border-[#efedea] last:border-b-0 text-[13px] ${
                    onRowClick ? 'cursor-pointer hover:bg-[#faf9f7]' : ''
                  } ${selected ? 'bg-[#f5f5f4]' : ''}`}
                  style={{ gridTemplateColumns: template, ...rowStyle?.(row) }}
                >
                  {columns.map((c) => (
                    <div key={c.key} role="cell" className={`min-w-0 flex items-center ${align(c.align)}`}>{c.render(row)}</div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
      {footer && <div className="border-t border-[#efedea] px-[18px] py-2">{footer}</div>}
    </div>
  );
}

