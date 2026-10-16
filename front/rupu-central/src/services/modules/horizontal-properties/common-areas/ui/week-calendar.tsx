/**
 * Z3 · Calendario semanal de una zona: columnas lunes … domingo, filas por hora, franjas
 * cerradas sombreadas según el horario y reservas como bloques de color por estado.
 */

'use client';

import { useMemo } from 'react';
import { dsMono } from '@/shared/ui/ds';
import type { CommonAreaSchedule, ReservationListDTO } from '../domain';
import { DAY_SHORT, closedBands, groupByDay, hourRange, isInactiveStatus, layoutDay, parseISODate, statusMeta, unitLabel } from './design';

const HOUR_PX = 44;

export interface WeekCalendarProps {
  days: string[];
  reservations: ReservationListDTO[];
  schedules: CommonAreaSchedule[];
  today: string;
  selectedId?: number | null;
  onSelect: (id: number) => void;
}

export function WeekCalendar({ days, reservations, schedules, today, selectedId, onSelect }: WeekCalendarProps) {
  const visible = useMemo(() => reservations.filter((r) => !isInactiveStatus(r.statusCode)), [reservations]);
  const range = useMemo(() => hourRange(schedules, visible), [schedules, visible]);
  const byDay = useMemo(() => groupByDay(visible), [visible]);
  const hours = Array.from({ length: range.end - range.start }, (_, i) => range.start + i);
  const height = hours.length * HOUR_PX;
  const template = '52px repeat(7, minmax(108px, 1fr))';

  return (
    <div className="bg-white border border-[#e4e2dd] rounded-[10px] overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 820 }} role="grid" aria-label="Calendario semanal de reservas">
          <div role="row" className="grid border-b border-[#efedea]" style={{ gridTemplateColumns: template }}>
            <span role="columnheader" aria-label="Hora" />
            {days.map((day) => {
              const d = parseISODate(day);
              const isToday = day === today;
              return (
                <span key={day} role="columnheader" className="px-2 py-2 text-center border-l border-[#efedea]">
                  <span className={`${dsMono} block text-[10px] tracking-[.06em] uppercase text-[#8a8580]`}>{DAY_SHORT[d.getDay()]}</span>
                  <span className={`inline-flex items-center justify-center mt-0.5 w-7 h-7 rounded-full text-[13px] font-semibold ${isToday ? 'bg-[#1a1a1a] text-white' : ''}`}>{d.getDate()}</span>
                </span>
              );
            })}
          </div>

          <div role="row" className="grid relative" style={{ gridTemplateColumns: template, height }}>
            <div role="rowheader" className="relative">
              {hours.map((h, i) => (
                <span key={h} className={`${dsMono} absolute right-2 text-[10px] text-[#8a8580] -translate-y-1/2`} style={{ top: i * HOUR_PX }}>
                  {i === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                </span>
              ))}
            </div>

            {days.map((day) => {
              const dow = parseISODate(day).getDay();
              const schedule = schedules.find((s) => s.dayOfWeek === dow);
              const placed = layoutDay(byDay.get(day) ?? [], range);
              return (
                <div key={day} role="gridcell" aria-label={`Reservas del ${day}`} className="relative border-l border-[#efedea]">
                  {hours.map((h, i) => (
                    <div key={h} className="absolute inset-x-0 border-t border-[#f2f1ee]" style={{ top: i * HOUR_PX }} />
                  ))}
                  {closedBands(schedule, range).map((b, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      className="absolute inset-x-0"
                      style={{
                        top: `${b.top}%`,
                        height: `${b.height}%`,
                        background: 'repeating-linear-gradient(135deg, #f5f5f4 0 6px, #efedea 6px 7px)',
                      }}
                    />
                  ))}
                  {placed.map(({ item, top, height: h, lane, lanes }) => {
                    const meta = statusMeta(item.statusCode, item.statusName);
                    const unit = unitLabel(item.propertyUnitNumber, item.propertyUnitBlock);
                    const selected = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        aria-label={`${unit}, ${item.startTime} a ${item.endTime}, ${meta.label}`}
                        className={`absolute rounded-md px-1.5 py-1 text-left overflow-hidden transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] ${selected ? 'ring-2 ring-[#1a1a1a]' : ''}`}
                        style={{
                          top: `${top}%`,
                          height: `${h}%`,
                          left: `calc(${(lane / lanes) * 100}% + 2px)`,
                          width: `calc(${100 / lanes}% - 4px)`,
                          background: meta.bg,
                          color: meta.fg,
                          borderWidth: item.statusCode === 'pending' ? '1px 1px 1px 3px' : '0 0 0 3px',
                          borderStyle: item.statusCode === 'pending' ? 'dashed' : 'solid',
                          borderColor: meta.border,
                        }}
                      >
                        <span className={`${dsMono} block text-[10px] leading-tight`}>
                          {item.startTime}–{item.endTime}
                        </span>
                        <span className="block text-[11px] font-semibold leading-tight truncate">{unit}</span>
                        <span className="block text-[10px] leading-tight truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
