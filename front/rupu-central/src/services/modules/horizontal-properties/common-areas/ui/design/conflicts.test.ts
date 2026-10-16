import { describe, expect, it } from 'vitest';
import { findConflicts, nextReservation } from './conflicts';

const r = (id: number, startTime: string, endTime: string, statusCode = 'approved', commonAreaId = 2, date = '2026-10-15') => ({
  id, commonAreaId, reservationDate: `${date}T00:00:00Z`, startTime, endTime, statusCode,
});

describe('cruces de horario', () => {
  const target = r(1, '14:00', '16:00', 'pending');
  it('detecta solapes activos de la misma zona y día', () => {
    const others = [target, r(2, '15:00', '17:00'), r(3, '16:00', '18:00'), r(4, '13:00', '14:30', 'cancelled'), r(5, '14:00', '15:00', 'approved', 9), r(6, '14:00', '15:00', 'approved', 2, '2026-10-16')];
    expect(findConflicts(target, others).map((x) => x.id)).toEqual([2]);
  });
  it('siguiente reserva después del fin', () => {
    expect(nextReservation(target, [r(3, '18:00', '20:00'), r(2, '16:00', '17:00'), r(7, '10:00', '12:00')])?.id).toBe(2);
    expect(nextReservation(target, [])).toBeUndefined();
  });
});
