/**
 * Z1 · Estado de la zona, etiquetas de reglas y "Esta semana" (mini barra de 7 días) de
 * cada tarjeta.
 */

import { DS } from '@/shared/ui/ds/tokens';
import type { CommonAreaListDTO, CommonAreaRestriction, ReservationListDTO } from '../../domain';
import { parseISODate, reservationDay } from './calendar';
import { dayMonth, formatThousands } from './format';
import { isInactiveStatus } from './status';

export interface ZonePill {
  label: string;
  bg: string;
  fg: string;
}

/** Bloqueo de día completo vigente en `day` (si hay). */
export function closingRestriction(restrictions: CommonAreaRestriction[], day: string): CommonAreaRestriction | undefined {
  return restrictions.find((r) => !r.startTime && r.startDate <= day && r.endDate >= day);
}

/** Pill de estado: Activa (verde), Mantenimiento o Inactiva (gris). */
export function zonePill(area: CommonAreaListDTO, today: string): ZonePill {
  const gray = { bg: '#efedea', fg: DS.inkSoft };
  if (!area.isActive) return { label: 'Inactiva', ...gray };
  const closed = closingRestriction(area.restrictions, today);
  if (closed) return { label: closed.restrictionType === 'maintenance' ? 'Mantenimiento' : 'Cerrada', ...gray };
  return { label: 'Activa', bg: DS.reachedBg, fg: DS.reachedFg };
}

/** Reglas como etiquetas cortas: "40 pers.", "25.000/h", "depósito 150.000", "aprobación". */
export function ruleTags(area: CommonAreaListDTO): string[] {
  const tags = [`${area.maxCapacity} pers.`];
  if (area.hourlyRate) tags.push(`${formatThousands(area.hourlyRate)}/h`);
  if (area.requiresDeposit && area.depositAmount) tags.push(`depósito ${formatThousands(area.depositAmount)}`);
  tags.push(area.requiresApproval ? 'aprobación' : 'sin aprobación');
  if (area.allowsRecurring) tags.push('recurrentes');
  return tags;
}

export type DayCell = 'reserved' | 'pending' | 'closed' | 'free';

export const DAY_CELL_COLOR: Record<DayCell, string> = {
  reserved: DS.ink,
  pending: DS.accent,
  closed: DS.pendingBorder,
  free: '#efedea',
};

export const DAY_CELL_LABEL: Record<DayCell, string> = {
  reserved: 'con reserva',
  pending: 'pendiente',
  closed: 'cerrada',
  free: 'libre',
};

/** Estado de cada día de la semana para la zona: pendiente > reservada > cerrada > libre. */
export function weekCells(area: CommonAreaListDTO, days: string[], reservations: ReservationListDTO[]): DayCell[] {
  const mine = reservations.filter((r) => r.commonAreaId === area.id && !isInactiveStatus(r.statusCode));
  return days.map((day) => {
    const ofDay = mine.filter((r) => reservationDay(r.reservationDate) === day);
    if (ofDay.some((r) => r.statusCode === 'pending')) return 'pending';
    if (ofDay.length > 0) return 'reserved';
    const dow = parseISODate(day).getDay();
    const open = area.schedules.some((s) => s.isActive && s.dayOfWeek === dow);
    if (!area.isActive || !open || closingRestriction(area.restrictions, day)) return 'closed';
    return 'free';
  });
}

/** Texto de "Esta semana": "4 reservas", "1 reserva", "sin reservas", "cerrada hasta 20 oct". */
export function weekSummary(area: CommonAreaListDTO, reservations: ReservationListDTO[], today: string): string {
  if (!area.isActive) return 'inactiva';
  const closed = closingRestriction(area.restrictions, today);
  if (closed) return `cerrada hasta ${dayMonth(closed.endDate)}`;
  const count = reservations.filter((r) => r.commonAreaId === area.id && !isInactiveStatus(r.statusCode)).length;
  if (count === 0) return 'sin reservas';
  return count === 1 ? '1 reserva' : `${count} reservas`;
}

/** Tipo + ubicación: "Salón social · Torre B". */
export function typeAndLocation(area: CommonAreaListDTO): string {
  return [area.typeName, area.location].filter(Boolean).join(' · ');
}
