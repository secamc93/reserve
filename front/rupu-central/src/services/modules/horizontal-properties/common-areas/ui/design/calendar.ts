/**
 * Calendario semanal de reservas por zona (Z3): semana de lunes a domingo, rango de horas
 * y posición de cada bloque (con carriles cuando dos reservas se solapan).
 * Las fechas se manejan como "YYYY-MM-DD" en hora local, sin zonas horarias.
 */

import type { CommonAreaSchedule } from '../../domain';

/** Fecha local → "YYYY-MM-DD". */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" (o un ISO con hora) → fecha local a medianoche. */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** La fecha de una reserva llega como "2026-10-20T00:00:00Z": se toma solo el día. */
export function reservationDay(value: string): string {
  return value.slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Lunes de la semana de la fecha dada. */
export function startOfWeek(iso: string): string {
  const d = parseISODate(iso);
  const offset = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - offset);
  return toISODate(d);
}

/** Los 7 días (lunes … domingo) de la semana que empieza en `monday`. */
export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "12 – 18 oct 2026" o "28 sep – 4 oct 2026". */
export function weekLabel(monday: string): string {
  const a = parseISODate(monday);
  const b = parseISODate(addDays(monday, 6));
  const left = a.getMonth() === b.getMonth() ? `${a.getDate()}` : `${a.getDate()} ${MONTHS[a.getMonth()]}`;
  return `${left} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
}

/** "HH:MM" → minutos desde medianoche. */
export function toMinutes(clock: string): number {
  const [h, m] = clock.slice(0, 5).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export interface HourRange {
  /** Hora de inicio (entera, incluida). */
  start: number;
  /** Hora de fin (entera, excluida). */
  end: number;
}

/**
 * Rango de horas a dibujar: cubre el horario de la zona y todas las reservas de la semana;
 * sin datos, 08:00–22:00.
 */
export function hourRange(schedules: CommonAreaSchedule[], reservations: { startTime: string; endTime: string }[]): HourRange {
  const starts: number[] = [];
  const ends: number[] = [];
  for (const s of schedules) {
    if (!s.isActive) continue;
    starts.push(toMinutes(s.startTime));
    ends.push(toMinutes(s.endTime));
  }
  for (const r of reservations) {
    starts.push(toMinutes(r.startTime));
    ends.push(toMinutes(r.endTime));
  }
  if (starts.length === 0) return { start: 8, end: 22 };
  const start = Math.floor(Math.min(...starts) / 60);
  const end = Math.ceil(Math.max(...ends) / 60);
  return { start: Math.max(0, start), end: Math.min(24, Math.max(end, start + 1)) };
}

export interface CalendarItem {
  id: number;
  startTime: string;
  endTime: string;
}

export interface PlacedItem<T extends CalendarItem> {
  item: T;
  /** Posición vertical en % del alto del día visible. */
  top: number;
  height: number;
  /** Carril (0…lanes-1) y número de carriles del grupo de solapes. */
  lane: number;
  lanes: number;
}

/**
 * Ubica las reservas de un día dentro del rango de horas. Las que se solapan se reparten en
 * carriles lado a lado.
 */
export function layoutDay<T extends CalendarItem>(items: T[], range: HourRange): PlacedItem<T>[] {
  const total = (range.end - range.start) * 60;
  const offset = range.start * 60;
  const sorted = [...items].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime) || toMinutes(b.endTime) - toMinutes(a.endTime));

  const placed: PlacedItem<T>[] = [];
  let group: PlacedItem<T>[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;

  const closeGroup = () => {
    for (const p of group) p.lanes = laneEnds.length;
    group = [];
    laneEnds = [];
  };

  for (const item of sorted) {
    const start = toMinutes(item.startTime);
    const end = Math.max(toMinutes(item.endTime), start + 15);
    if (start >= groupEnd) closeGroup();
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else laneEnds[lane] = end;
    groupEnd = Math.max(groupEnd, end);

    const top = Math.max(0, ((start - offset) / total) * 100);
    const bottom = Math.min(100, ((end - offset) / total) * 100);
    const p: PlacedItem<T> = { item, top, height: Math.max(bottom - top, 2), lane, lanes: 1 };
    placed.push(p);
    group.push(p);
  }
  closeGroup();
  return placed;
}

/** Agrupa por día ("YYYY-MM-DD"). */
export function groupByDay<T extends { reservationDate: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const key = reservationDay(it.reservationDate);
    const list = map.get(key);
    if (list) list.push(it);
    else map.set(key, [it]);
  }
  return map;
}

/** Franjas cerradas del día según el horario (en % del alto visible), para sombrearlas. */
export function closedBands(schedule: CommonAreaSchedule | undefined, range: HourRange): { top: number; height: number }[] {
  const total = (range.end - range.start) * 60;
  const offset = range.start * 60;
  if (!schedule || !schedule.isActive) return [{ top: 0, height: 100 }];
  const bands: { top: number; height: number }[] = [];
  const open = ((toMinutes(schedule.startTime) - offset) / total) * 100;
  const close = ((toMinutes(schedule.endTime) - offset) / total) * 100;
  if (open > 0) bands.push({ top: 0, height: Math.min(open, 100) });
  if (close < 100) bands.push({ top: Math.max(close, 0), height: 100 - Math.max(close, 0) });
  return bands;
}
