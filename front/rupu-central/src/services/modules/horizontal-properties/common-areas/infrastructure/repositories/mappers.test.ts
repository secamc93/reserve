import { describe, expect, it } from 'vitest';
import { mapCommonAreaList, mapReservation, mapReservationList, mapRestriction, toBackendArea } from './mappers';

describe('mappers de zonas comunes', () => {
  it('zona del listado: null → undefined y horario en HH:MM', () => {
    const area = mapCommonAreaList({
      id: 1, name: 'Piscina', type_name: 'Piscina', location: 'Zona sur', max_capacity: 30, is_active: true, requires_approval: false,
      hourly_rate: null, deposit_amount: 50000, requires_deposit: true,
      schedules: [{ id: 4, day_of_week: 2, start_time: '06:00:00', end_time: '20:00:00', is_active: true }],
    });
    expect(area.hourlyRate).toBeUndefined();
    expect(area.depositAmount).toBe(50000);
    expect(area.schedules[0]).toEqual({ id: 4, dayOfWeek: 2, startTime: '06:00', endTime: '20:00', isActive: true });
    expect(mapCommonAreaList({ id: 2, name: 'X', type_name: 'X', location: '', max_capacity: 1, is_active: true, requires_approval: true }).schedules).toEqual([]);
  });

  it('reserva: unidad con bloque, estado y horas', () => {
    const r = mapReservationList({
      id: 5, common_area_id: 2, common_area_name: 'BBQ', property_unit_id: 9, property_unit_number: '126', property_unit_block: 'Casa',
      resident_name: '', status_code: 'pending', status_name: 'Pendiente', reservation_date: '2026-10-20T00:00:00Z',
      start_time: '14:00:00', end_time: '18:00:00', number_of_guests: 8, created_at: '2026-10-10T00:00:00Z', checked_in_at: null,
    });
    expect(r).toMatchObject({ propertyUnitNumber: '126', propertyUnitBlock: 'Casa', statusCode: 'pending', startTime: '14:00', checkedInAt: undefined });

    const full = mapReservation({
      id: 5, business_id: 1, common_area_id: 2, property_unit_id: 9, reservation_status_id: 1, reservation_date: '2026-10-20T00:00:00Z',
      start_time: '14:00:00', end_time: '18:00:00', duration_hours: 4, requires_approval: true, number_of_guests: 8, is_recurring: false,
      deposit_paid: true, deposit_paid_at: '2026-10-11T00:00:00Z', full_payment_paid: false, approved_at: null, access_code: '', created_at: 'x',
    });
    expect(full).toMatchObject({ depositPaid: true, depositPaidAt: '2026-10-11T00:00:00Z', approvedAt: undefined, accessCode: undefined });
  });

  it('bloqueo: fechas y horas recortadas', () => {
    expect(mapRestriction({ id: 1, common_area_id: 2, restriction_type: 'maintenance', start_date: '2026-10-20T00:00:00Z', end_date: '2026-10-21', start_time: '08:00:00', end_time: null })).toMatchObject({
      startDate: '2026-10-20',
      endDate: '2026-10-21',
      startTime: '08:00',
      endTime: undefined,
    });
  });

  it('el cuerpo de la zona va en snake_case (el back no acepta camelCase)', () => {
    expect(toBackendArea({ commonAreaTypeId: 3, maxCapacity: 10, requiresDeposit: false, depositAmount: undefined, isActive: true })).toEqual({
      common_area_type_id: 3,
      max_capacity: 10,
      requires_deposit: false,
      is_active: true,
    });
  });
});
