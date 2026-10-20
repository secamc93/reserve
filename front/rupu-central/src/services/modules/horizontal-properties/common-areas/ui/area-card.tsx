/**
 * Z1 · Tarjeta de zona común: franja de foto (96 px), nombre, "Tipo · ubicación", pill de
 * estado, reglas en etiquetas mono y "Esta semana" con la mini barra de 7 días.
 */

'use client';

import { DsCard, VtMenu, dsMono } from '@/shared/ui/ds';
import type { CommonAreaListDTO } from '../domain';
import { DAY_CELL_COLOR, DAY_CELL_LABEL, DAY_SHORT, parseISODate, ruleTags, typeAndLocation, zonePill, type DayCell } from './design';

export interface AreaCardProps {
  area: CommonAreaListDTO;
  today: string;
  /** Días de la semana actual ("YYYY-MM-DD", lunes … domingo). */
  days: string[];
  cells: DayCell[];
  summary: string;
  onOpen: () => void;
  onEdit: () => void;
  onSchedule: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function AreaCard({ area, today, days, cells, summary, onOpen, onEdit, onSchedule, onToggleActive, onDelete, busy }: AreaCardProps) {
  const pill = zonePill(area, today);
  const subtitle = typeAndLocation(area);
  return (
    <DsCard className="overflow-hidden flex flex-col">
      <article aria-label={area.name} className="flex flex-col h-full">
        <button type="button" onClick={onOpen} className="relative h-24 bg-[#efedea] flex items-end overflow-hidden text-left" aria-label={`Ver reservas de ${area.name}`}>
          {area.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={area.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className={`${dsMono} px-3.5 pb-2.5 text-[10px] tracking-[.06em] uppercase text-[#8a8580]`}>{area.name}</span>
          )}
        </button>

        <div className="p-3.5 flex flex-col gap-2.5 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="m-0 text-[15px] font-semibold tracking-[-.01em] truncate">{area.name}</h3>
              {subtitle && <div className="text-[11px] text-[#8a8580] truncate">{subtitle}</div>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: pill.bg, color: pill.fg }}>
                {pill.label}
              </span>
              <VtMenu
                size={26}
                label={`Más acciones de ${area.name}`}
                items={[
                  { label: 'Editar zona', onSelect: onEdit, disabled: busy },
                  { label: 'Horario por día y bloqueos', onSelect: onSchedule },
                  { label: area.isActive ? 'Desactivar zona' : 'Activar zona', onSelect: onToggleActive, disabled: busy },
                  { label: 'Eliminar zona', onSelect: onDelete, danger: true },
                ]}
              />
            </div>
          </div>

          <ul aria-label={`Reglas de ${area.name}`} className="flex flex-wrap gap-1 list-none m-0 p-0">
            {ruleTags(area).map((tag) => (
              <li key={tag} className={`${dsMono} px-1.5 py-[2px] border border-[#d6d3cd] rounded-full text-[10px] text-[#4b4a46]`}>
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-2.5 border-t border-[#efedea] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] text-[#8a8580]">Esta semana</div>
              <div className={`${dsMono} text-xs`}>{summary}</div>
            </div>
            <div className="flex gap-[3px]" role="img" aria-label={`Semana: ${days.map((d, i) => `${DAY_SHORT[parseISODate(d).getDay()]} ${DAY_CELL_LABEL[cells[i]]}`).join(', ')}`}>
              {cells.map((cell, i) => (
                <span key={days[i]} className="w-1.5 h-1.5 rounded-full" style={{ background: DAY_CELL_COLOR[cell] }} />
              ))}
            </div>
          </div>
        </div>
      </article>
    </DsCard>
  );
}
