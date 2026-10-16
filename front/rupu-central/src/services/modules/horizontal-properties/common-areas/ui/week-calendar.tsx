/**
 * Z3 · Calendario semanal: columna de horas (56 px, 08:00…22:00) y 7 días con encabezado
 * mono ("MIÉ" + número); hoy con fondo #faf9f7 y número terracota. Cada reserva es un
 * bloque por hora: aprobada en negro, pendiente en terracota con anillo, pasada en gris.
 * Con una sola zona se sombrean las horas fuera de su horario.
 */

'use client';

import { useMemo } from 'react';
import { DS, dsMono } from '@/shared/ui/ds';
import type { CommonAreaSchedule, ReservationListDTO } from '../domain';
import { DAY_SHORT, calendarTone, closedBands, groupByDay, hourRange, isInactiveStatus, layoutDay, parseISODate, statusMeta, unitLabel, type CalendarTone } from './design';

const HOUR_PX = 48;

const TONE_STYLE: Record<CalendarTone, { background: string; color: string; boxShadow?: string }> = {
  approved: { background: DS.ink, color: '#fff' },
  pending: { background: DS.accent, color: '#fff', boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${DS.accent}` },
  past: { background: DS.pendingBorder, color: DS.inkSoft },
};

export const CALENDAR_LEGEND = [
  { label: 'Aprobada', swatch: { background: DS.ink } },
  { label: 'Pendiente', swatch: { background: DS.accent } },
  { label: 'Pasada', swatch: { background: DS.pendingBorder } },
];

export interface WeekCalendarProps {
  days: string[];
  reservations: ReservationListDTO[];
  /** Horario de la zona elegida (vacío con "Todas las zonas"). */
  schedules: CommonAreaSchedule[];
  today: string;
  now?: Date;
  selectedId?: number | null;
  onSelect: (id: number) => void;
}

export function WeekCalendar({ days, reservations, schedules, today, now, selectedId, onSelect }: WeekCalendarProps) {
  const visible = useMemo(() => reservations.filter((r) => !isInactiveStatus(r.statusCode)), [reservations]);
  const range = useMemo(() => hourRange(schedules, visible), [schedules, visible]);
  const byDay = useMemo(() => groupByDay(visible), [visible]);
  const hours = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i);
  const height = (range.end - range.start) * HOUR_PX;
  const template = '56px repeat(7, minmax(110px, 1fr))';
  const shadeClosed = schedules.length > 0;

  return (
    <div className="bg-white border border-[#e4e2dd] rounded-[10px] overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 840 }} role="grid" aria-label="Calendario semanal de reservas">
          <div role="row" className="grid border-b border-[#efedea]" style={{ gridTemplateColumns: template }}>
            <span role="columnheader" aria-label="Hora" />
            {days.map((day) => {
              const d = parseISODate(day);
              const isToday = day === today;
              return (
                <span key={day} role="columnheader" aria-current={isToday ? 'date' : undefined} className={`px-2.5 py-2 border-l border-[#efedea] ${isToday ? 'bg-[#faf9f7]' : ''}`}>
                  <span className={`${dsMono} block text-[10px] tracking-[.06em] uppercase text-[#8a8580]`}>{DAY_SHORT[d.getDay()]}</span>
                  <span className={`${dsMono} block text-lg font-medium leading-tight ${isToday ? 'text-[#c8603f]' : ''}`}>{d.getDate()}</span>
                </span>
              );
            })}
          </div>

          <div role="row" className="grid relative" style={{ gridTemplateColumns: template, height: height + 8 }}>
            <div role="rowheader" className="relative">
              {hours.map((h, i) => (
                <span key={h} className={`${dsMono} absolute right-2 text-[10px] text-[#8a8580] -translate-y-1/2`} style={{ top: i * HOUR_PX + 4 }}>
                  {`${String(h).padStart(2, '0')}:00`}
                </span>
              ))}
            </div>

            {days.map((day) => {
              const dow = parseISODate(day).getDay();
              const schedule = schedules.find((s) => s.dayOfWeek === dow);
              const placed = layoutDay(byDay.get(day) ?? [], range);
              return (
                <div key={day} role="gridcell" aria-label={`Reservas del ${day}`} className={`relative border-l border-[#efedea] ${day === today ? 'bg-[#faf9f7]' : ''}`}>
                  <div className="absolute inset-x-0" style={{ top: 4, height }}>
                    {hours.map((h, i) => (
                      <div key={h} className="absolute inset-x-0 border-t border-[#f2f1ee]" style={{ top: i * HOUR_PX }} />
                    ))}
                    {shadeClosed &&
                      closedBands(schedule, range).map((b, i) => (
                        <div
                          key={i}
                          aria-hidden="true"
                          className="absolute inset-x-0"
                          style={{ top: `${b.top}%`, height: `${b.height}%`, background: 'repeating-linear-gradient(135deg, #f5f5f4 0 6px, #efedea 6px 7px)' }}
                        />
                      ))}
                    {placed.map(({ item, top, height: h, lane, lanes }) => {
                      const tone = calendarTone(item, now);
                      const unit = unitLabel(item.propertyUnitNumber, item.propertyUnitBlock);
                      const label = tone === 'past' ? 'Pasada' : statusMeta(item.statusCode, item.statusName).label;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelect(item.id)}
                          aria-label={`${item.commonAreaName}, ${unit}, ${item.startTime} a ${item.endTime}, ${label}`}
                          className={`absolute rounded-[5px] px-2 py-1.5 text-left overflow-hidden transition-[filter] hover:brightness-110 ${selectedId === item.id ? 'outline outline-2 outline-offset-2 outline-[#1a1a1a]' : ''}`}
                          style={{
                            ...TONE_STYLE[tone],
                            top: `${top}%`,
                            height: `${h}%`,
                            left: `calc(${(lane / lanes) * 100}% + 4px)`,
                            width: `calc(${100 / lanes}% - 8px)`,
                          }}
                        >
                          <span className="block text-[11px] font-semibold leading-tight truncate">{item.commonAreaName}</span>
                          <span className={`${dsMono} block text-[10px] leading-tight opacity-90`}>
                            {item.startTime}–{item.endTime}
                          </span>
                          <span className="block text-[10px] leading-tight truncate opacity-90">
                            {unit}
                            {item.purpose ? ` · ${item.purpose}` : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
