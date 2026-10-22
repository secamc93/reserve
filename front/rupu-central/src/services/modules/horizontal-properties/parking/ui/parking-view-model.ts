/**
 * Lógica pura del rediseño de parqueaderos ("PH - Parqueaderos", K1–K4): estado de cada cupo en
 * el mapa, colores, resumen por zona, vigencia de asignaciones, estado de reservas de visitantes
 * y vista previa de la numeración de cupos nuevos.
 */

import type { ParkingAssignmentListDTO, ParkingReservationListDTO, ParkingSlotListDTO } from '../domain';

// ===================== Mapa de cupos (K1) =====================

export type SlotState = 'free' | 'assigned' | 'occupied' | 'visitor';

export const SLOT_STYLE: Record<SlotState, { bg: string; border: string; fg: string; label: string }> = {
  free: { bg: '#ffffff', border: '#c9c6c0', fg: '#8a8580', label: 'Libre' },
  assigned: { bg: '#8a8580', border: '#8a8580', fg: '#ffffff', label: 'Asignado · vacío' },
  occupied: { bg: '#0F7F8A', border: '#0F7F8A', fg: '#ffffff', label: 'Ocupado' },
  visitor: { bg: '#c8603f', border: '#c8603f', fg: '#ffffff', label: 'Visitante' },
};

/** Reserva de visitante vigente hoy en el cupo: no cancelada y sin salida registrada. */
export function isLiveReservation(r: Pick<ParkingReservationListDTO, 'statusName' | 'checkedOutAt'>): boolean {
  const status = (r.statusName || '').toLowerCase();
  return !r.checkedOutAt && !status.includes('cancel') && !status.includes('rechaz') && !status.includes('complet');
}

/**
 * Estado del cupo: una reserva de visitante viva manda (naranja); si no, ocupado (hay un vehículo
 * dentro), asignado (tiene dueño pero está vacío) o libre.
 */
export function slotState(slot: Pick<ParkingSlotListDTO, 'isOccupied' | 'isAssigned'>, liveReservation?: boolean): SlotState {
  if (liveReservation) return 'visitor';
  if (slot.isOccupied) return 'occupied';
  if (slot.isAssigned) return 'assigned';
  return 'free';
}

/** Número corto para la celda: lo que va después del último guion ("P2-114" → "114"). */
export function shortSlotNumber(slotNumber: string): string {
  const i = slotNumber.lastIndexOf('-');
  return i >= 0 && i < slotNumber.length - 1 ? slotNumber.slice(i + 1) : slotNumber;
}

export interface ZoneSummary {
  total: number;
  occupied: number;
  free: number;
  /** % de cupos no libres. */
  pct: number;
}

export function zoneSummary(states: SlotState[]): ZoneSummary {
  const total = states.length;
  const free = states.filter((s) => s === 'free').length;
  const occupied = states.filter((s) => s === 'occupied' || s === 'visitor').length;
  return { total, occupied, free, pct: total === 0 ? 0 : Math.round(((total - free) / total) * 100) };
}

export type MapFilter = 'all' | 'free' | 'occupied' | 'charger' | 'moto';

export function matchesMapFilter(filter: MapFilter, slot: Pick<ParkingSlotListDTO, 'hasCharger' | 'parkingTypeName'>, state: SlotState): boolean {
  switch (filter) {
    case 'free':
      return state === 'free';
    case 'occupied':
      return state === 'occupied' || state === 'visitor';
    case 'charger':
      return slot.hasCharger;
    case 'moto':
      return /moto/i.test(slot.parkingTypeName || '');
    default:
      return true;
  }
}

/** "2,5 × 5,0 m" si el cupo tiene medidas. */
export function slotDimensions(slot: Pick<ParkingSlotListDTO, 'width' | 'length' | 'height'>): string | null {
  const f = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  if (!slot.width || !slot.length) return null;
  return `${f(slot.width)} × ${f(slot.length)}${slot.height ? ` × ${f(slot.height)}` : ''} m`;
}

// ===================== Fechas =====================

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** Parte la fecha ISO en día calendario (sin desplazar por zona horaria). */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "01 ene 2026" */
export function formatDay(iso: string): string {
  const d = parseDay(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "01 ene 2026 → 31 dic 2026" o "15 mar 2025 → indefinido". */
export function formatRange(start: string, end?: string | null): string {
  return `${formatDay(start)} → ${end ? formatDay(end) : 'indefinido'}`;
}

/** Días enteros de `from` a `to` (pueden ser negativos). */
export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

/** "Hoy · mié 15 oct", "Mañana · jue 16 oct", "vie 17 oct". */
export function dayNavLabel(day: Date, today: Date): string {
  const base = `${DAYS[day.getDay()]} ${day.getDate()} ${MONTHS[day.getMonth()]}`;
  const diff = daysBetween(today, day);
  if (diff === 0) return `Hoy · ${base}`;
  if (diff === 1) return `Mañana · ${base}`;
  if (diff === -1) return `Ayer · ${base}`;
  return base;
}

// ===================== Asignaciones (K3) =====================

export const DS_OK = '#1f8a4c';
export const DS_WARN = '#c8603f';
export const DS_DANGER = '#c8382d';
export const DS_MUTED = '#8a8580';

export function assignmentStatus(a: Pick<ParkingAssignmentListDTO, 'isActive' | 'endDate'>, today: Date): { label: string; color: string } {
  if (!a.isActive) return { label: 'Liberada', color: DS_MUTED };
  if (!a.endDate) return { label: 'Vigente', color: DS_OK };
  const left = daysBetween(today, parseDay(a.endDate));
  if (left < 0) return { label: 'Vencida', color: DS_DANGER };
  if (left <= 30) return { label: left === 0 ? 'Vence hoy' : `Vence en ${left} día${left === 1 ? '' : 's'}`, color: DS_WARN };
  return { label: 'Vigente', color: DS_OK };
}

/** "Casa 126"; sin bloque, el número; sin unidad, "—". */
export function unitLabel(block?: string | null, number?: string | null): string {
  if (!number) return '—';
  return block?.trim() ? `${block.trim()} ${number}` : number;
}

/** "Mazda CX-30 · gris" */
export function vehicleLabel(brand?: string, model?: string, color?: string): string {
  const car = [brand, model].filter((x) => x && x.trim()).join(' ');
  return [car, color?.trim()].filter(Boolean).join(' · ') || '—';
}

// ===================== Reservas de visitantes (K4) =====================

export type ReservationState = 'wait' | 'in' | 'over' | 'done' | 'cancelled';

export const RESERVATION_STYLE: Record<ReservationState, { label: string; color: string; action: 'check-in' | 'check-out' | null }> = {
  wait: { label: 'Reservado', color: '#4b4a46', action: 'check-in' },
  in: { label: 'Dentro', color: DS_OK, action: 'check-out' },
  over: { label: 'Excede su horario', color: DS_WARN, action: 'check-out' },
  done: { label: 'Salió', color: DS_MUTED, action: null },
  cancelled: { label: 'Cancelada', color: DS_MUTED, action: null },
};

/** Minutos desde medianoche de "HH:MM" o "HH:MM:SS". */
export function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function reservationState(r: Pick<ParkingReservationListDTO, 'statusName' | 'checkedInAt' | 'checkedOutAt' | 'endTime' | 'reservationDate'>, now: Date): ReservationState {
  const status = (r.statusName || '').toLowerCase();
  if (status.includes('cancel') || status.includes('rechaz')) return 'cancelled';
  if (r.checkedOutAt) return 'done';
  if (r.checkedInAt) {
    const sameDay = toISODay(now) === r.reservationDate.slice(0, 10);
    const late = sameDay ? now.getHours() * 60 + now.getMinutes() > minutesOf(r.endTime) : daysBetween(parseDay(r.reservationDate), now) > 0;
    return late ? 'over' : 'in';
  }
  return 'wait';
}

/** "09:00–11:00" */
export function timeRange(start: string, end: string): string {
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`;
}

// ===================== Cupos nuevos (K2) =====================

export function bulkPreview(prefix: string, from: number, to: number, pad: number): { count: number; first: string; last: string } | null {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from) return null;
  const fmt = (n: number) => `${prefix}${String(n).padStart(Math.max(0, pad), '0')}`;
  return { count: to - from + 1, first: fmt(from), last: fmt(to) };
}
