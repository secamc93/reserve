/** Cruces de horario entre reservas de la misma zona y el mismo día (Z4 / Z5). */

import { toMinutes, reservationDay } from './calendar';
import { isInactiveStatus } from './status';

interface Slot {
  id: number;
  commonAreaId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  statusCode?: string;
}

/** Reservas activas de la misma zona y día que se solapan con `target`. */
export function findConflicts<T extends Slot>(target: Slot, others: T[]): T[] {
  const day = reservationDay(target.reservationDate);
  const start = toMinutes(target.startTime);
  const end = toMinutes(target.endTime);
  return others.filter(
    (o) =>
      o.id !== target.id &&
      o.commonAreaId === target.commonAreaId &&
      reservationDay(o.reservationDate) === day &&
      !isInactiveStatus(o.statusCode) &&
      toMinutes(o.startTime) < end &&
      toMinutes(o.endTime) > start,
  );
}

/** Siguiente reserva activa de la zona ese día que empieza al terminar `target` o después. */
export function nextReservation<T extends Slot>(target: Slot, others: T[]): T | undefined {
  const day = reservationDay(target.reservationDate);
  const end = toMinutes(target.endTime);
  return others
    .filter((o) => o.id !== target.id && o.commonAreaId === target.commonAreaId && reservationDay(o.reservationDate) === day && !isInactiveStatus(o.statusCode) && toMinutes(o.startTime) >= end)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))[0];
}
