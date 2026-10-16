import { describe, expect, it } from 'vitest';
import { availableActions, calendarTone, isInactiveStatus, reservationTimeline, statusCodesFor, statusMeta } from './status';

describe('estados de reserva', () => {
  it('las acciones siguen la máquina de estados del back', () => {
    expect(availableActions('pending')).toEqual(['approve', 'reject', 'cancel']);
    expect(availableActions('approved')).toEqual(['confirm', 'cancel']);
    expect(availableActions('confirmed')).toEqual(['checkIn', 'cancel']);
    expect(availableActions('checked_in')).toEqual(['checkOut']);
    expect(availableActions('cancelled')).toEqual([]);
    expect(availableActions(undefined)).toEqual([]);
  });

  it('etiquetas en español y respaldo con el nombre del back', () => {
    expect(statusMeta('pending').label).toBe('Pendiente');
    expect(statusMeta('checked_in').label).toBe('En uso');
    expect(statusMeta('raro', 'Otro').label).toBe('Otro');
  });

  it('rechazadas, canceladas y vencidas no ocupan la zona', () => {
    expect(isInactiveStatus('cancelled')).toBe(true);
    expect(isInactiveStatus('approved')).toBe(false);
  });

  it('filtros de la lista', () => {
    expect(statusCodesFor('upcoming')).toEqual(['approved', 'confirmed']);
    expect(statusCodesFor('all')).toEqual([]);
    expect(statusCodesFor('nada')).toEqual([]);
  });
});

describe('reservationTimeline', () => {
  it('ordena los eventos ocurridos por fecha', () => {
    const events = reservationTimeline({
      createdAt: '2026-10-10T10:00:00Z',
      checkedInAt: '2026-10-12T15:00:00Z',
      approvedAt: '2026-10-11T09:00:00Z',
      depositPaidAt: '2026-10-11T12:00:00Z',
      statusCode: 'checked_in',
    });
    expect(events.map((e) => e.label)).toEqual(['Solicitada', 'Aprobada', 'Depósito pagado', 'Ingreso']);
  });

  it('rechazo con motivo y confirmación como último paso', () => {
    expect(reservationTimeline({ createdAt: '2026-10-10T10:00:00Z', rejectedAt: '2026-10-10T11:00:00Z', rejectionReason: 'Mantenimiento' })[1]).toMatchObject({
      label: 'Rechazada',
      detail: 'Mantenimiento',
      tone: 'danger',
    });
    const confirmed = reservationTimeline({ createdAt: '2026-10-10T10:00:00Z', approvedAt: '2026-10-10T11:00:00Z', statusCode: 'confirmed' });
    expect(confirmed[confirmed.length - 1].label).toMatch(/^Confirmada/);
  });
});

describe('calendarTone', () => {
  const now = new Date(2026, 9, 15, 15, 0);
  it('aprobada negro, pendiente terracota, pasada gris', () => {
    expect(calendarTone({ statusCode: 'approved', reservationDate: '2026-10-16T00:00:00Z', endTime: '12:00' }, now)).toBe('approved');
    expect(calendarTone({ statusCode: 'confirmed', reservationDate: '2026-10-15T00:00:00Z', endTime: '18:00' }, now)).toBe('approved');
    expect(calendarTone({ statusCode: 'pending', reservationDate: '2026-10-15T00:00:00Z', endTime: '18:00' }, now)).toBe('pending');
    expect(calendarTone({ statusCode: 'approved', reservationDate: '2026-10-15T00:00:00Z', endTime: '14:00' }, now)).toBe('past');
    expect(calendarTone({ statusCode: 'pending', reservationDate: '2026-10-13T00:00:00Z', endTime: '18:00' }, now)).toBe('past');
    expect(calendarTone({ statusCode: 'checked_out', reservationDate: '2026-10-20T00:00:00Z', endTime: '18:00' }, now)).toBe('past');
  });
});
