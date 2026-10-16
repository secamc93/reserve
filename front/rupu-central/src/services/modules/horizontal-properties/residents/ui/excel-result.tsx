/** Resultado de una carga de Excel: cifras y errores por fila (importación y edición masiva). */

'use client';

import type { ReactNode } from 'react';
import { DsEyebrow, dsMono } from '@shared/ui/ds';

export function ExcelResultStats({ stats }: { stats: Array<{ label: string; value: number }> }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-[#e4e2dd] px-3 py-2.5">
          <DsEyebrow>{s.label}</DsEyebrow>
          <div className={`${dsMono} text-xl font-semibold mt-0.5`}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ExcelErrorList({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <DsEyebrow>{title}</DsEyebrow>
      <div className="max-h-44 overflow-y-auto rounded-lg border border-[#f1cfc4] bg-[#fbe9e4] px-3.5 py-2 text-xs text-[#9c3a22]">{children}</div>
    </div>
  );
}

/** Ejemplo del formato esperado (encabezados en mono y filas de muestra). */
export function ExcelFormatExample({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const template = { gridTemplateColumns: `repeat(${headers.length}, minmax(0,1fr))` };
  return (
    <div className="rounded-lg border border-[#e4e2dd] overflow-x-auto" aria-label="Ejemplo del archivo">
      <div className={`${dsMono} grid gap-3 px-3.5 py-2 bg-[#f5f5f4] text-[10px] uppercase tracking-[.06em] text-[#8a8580] min-w-[420px]`} style={template}>
        {headers.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`${dsMono} grid gap-3 px-3.5 py-1.5 text-xs border-t border-[#efedea] min-w-[420px]`} style={template}>
          {row.map((c, j) => (
            <span key={j} className="truncate">{c}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
