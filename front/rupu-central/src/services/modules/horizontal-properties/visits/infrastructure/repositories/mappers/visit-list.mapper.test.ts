import { describe, expect, it } from 'vitest';
import { mapBackendVisitList, mapBackendVisitsSummary } from './visit-list.mapper';

describe('mapper de la lista de visitas', () => {
  it('trae bloque, código de estado, horas y convierte null en undefined', () => {
    const v = mapBackendVisitList({
      id: 1,
      visitor_name: 'Laura Gómez',
      visitor_dni: '52123456',
      visitor_phone: '3001234567',
      property_unit_number: '126',
      property_unit_block: 'Casa',
      visit_type_name: 'Familiar',
      visit_status_name: 'En Curso',
      visit_status_code: 'in_progress',
      scheduled_date: '2026-10-15T00:00:00Z',
      scheduled_start_time: '2026-10-15T09:00:00Z',
      scheduled_end_time: null,
      actual_entry_time: '2026-10-15T14:02:00Z',
      actual_exit_time: null,
      purpose: '',
      number_of_visitors: 2,
      created_at: '2026-10-14T20:00:00Z',
      visitor_id: 55,
      property_unit_id: 40,
      visitor_vehicle_plate: 'KJM842',
      authorization_code: '7K2M',
      entry_gate: 'Principal',
      resident_name: 'María López',
      authorized_by_name: '',
      stay_limit_minutes: 480,
      exceeds_time: true,
    });
    expect(v).toMatchObject({ visitorId: 55, propertyUnitId: 40, visitorVehiclePlate: 'KJM842', authorizationCode: '7K2M', residentName: 'María López', stayLimitMinutes: 480, exceedsTime: true });
    expect(v.authorizedByName).toBeUndefined();
    expect(v).toMatchObject({
      propertyUnitBlock: 'Casa',
      propertyUnitNumber: '126',
      visitStatusCode: 'in_progress',
      visitorPhone: '3001234567',
      numberOfVisitors: 2,
      actualEntryTime: '2026-10-15T14:02:00Z',
    });
    expect(v.actualExitTime).toBeUndefined();
    expect(v.scheduledEndTime).toBeUndefined();
    expect(v.purpose).toBeUndefined();
  });

  it('resumen del día', () => {
    expect(mapBackendVisitsSummary({ date: '2026-10-15', inside: 3, expected: 5, left: 9, cancelled: 1, total: 18, inside_now: 4, exceeded: 1, next_expected_at: '2026-10-15T11:00:00Z', next_unit_number: '126', next_unit_block: 'Casa', avg_stay_minutes: null })).toEqual({
      date: '2026-10-15',
      inside: 3,
      expected: 5,
      left: 9,
      cancelled: 1,
      total: 18,
      insideNow: 4,
      exceeded: 1,
      nextExpectedAt: '2026-10-15T11:00:00Z',
      nextUnitNumber: '126',
      nextUnitBlock: 'Casa',
      avgStayMinutes: undefined,
    });
  });
});
