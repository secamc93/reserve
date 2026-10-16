/** Formatos de la pantalla de zonas comunes (unidad, dinero, horario semanal). */

import type { CommonAreaSchedule } from '../../domain';

/** "Casa 126" a partir de block="Casa" y number="126". Nunca el id. */
export function unitLabel(number?: string | null, block?: string | null): string {
  const n = (number ?? '').trim();
  const b = (block ?? '').trim();
  if (!n) return b || 'Sin unidad';
  if (!b) return `Unidad ${n}`;
  return `${b} ${n}`;
}

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** "$ 30.000" (pesos colombianos, sin decimales). */
export function formatMoney(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return money.format(value).replace(/ /g, ' ');
}

/** "08:00:00" → "08:00" */
export function formatClock(value?: string | null): string {
  if (!value) return '';
  return value.length >= 5 ? value.slice(0, 5) : value;
}

/** Orden de la semana para mostrar: lunes … domingo (0 = domingo en el back). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const DAY_SHORT: Record<number, string> = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };
export const DAY_LONG: Record<number, string> = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };

/**
 * Resumen del horario semanal agrupando días seguidos con las mismas horas:
 * "Lun–Vie 08:00–22:00 · Sáb 09:00–18:00". Sin días abiertos: "Sin horario".
 */
export function scheduleSummary(schedules: CommonAreaSchedule[]): string {
  const open = new Map<number, string>();
  for (const s of schedules) if (s.isActive) open.set(s.dayOfWeek, `${formatClock(s.startTime)}–${formatClock(s.endTime)}`);
  if (open.size === 0) return 'Sin horario';
  if (open.size === 7 && new Set(open.values()).size === 1) return `Todos los días ${[...open.values()][0]}`;

  const groups: { from: number; to: number; hours: string }[] = [];
  for (const day of WEEK_ORDER) {
    const hours = open.get(day);
    const last = groups[groups.length - 1];
    if (!hours) {
      groups.push({ from: -1, to: -1, hours: '' });
      continue;
    }
    if (last && last.hours === hours) last.to = day;
    else groups.push({ from: day, to: day, hours });
  }
  return groups
    .filter((g) => g.hours)
    .map((g) => `${g.from === g.to ? DAY_SHORT[g.from] : `${DAY_SHORT[g.from]}–${DAY_SHORT[g.to]}`} ${g.hours}`)
    .join(' · ');
}

const dateTime = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });

/** "14 oct, 09:30" para la línea de tiempo. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return dateTime.format(d).replace(/\./g, '');
}
