import { describe, expect, it } from 'vitest';
import { ruleTags, typeAndLocation, weekCells, weekSummary, zonePill } from './zone-week';
import { weekDays } from './calendar';
import type { CommonAreaListDTO, ReservationListDTO } from '../../domain';

const area: CommonAreaListDTO = {
  id: 4, name: 'BBQ', typeName: 'BBQ', location: 'Terraza', maxCapacity: 15, hasEquipment: false, hourlyRate: 20000,
  requiresDeposit: true, depositAmount: 100000, allowsRecurring: false, isActive: true, requiresApproval: false,
  schedules: [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '22:00', isActive: true })),
  restrictions: [],
};
const res = (id: number, date: string, statusCode: string, commonAreaId = 4) =>
  ({ id, commonAreaId, reservationDate: `${date}T00:00:00Z`, statusCode, startTime: '10:00', endTime: '12:00' }) as ReservationListDTO;
const days = weekDays('2026-10-12');

describe('tarjeta de zona: reglas, estado y semana', () => {
  it('etiquetas cortas de reglas', () => {
    expect(ruleTags(area)).toEqual(['15 pers.', '20.000/h', 'depósito 100.000', 'sin aprobación']);
    expect(ruleTags({ ...area, hourlyRate: undefined, requiresDeposit: false, requiresApproval: true })).toEqual(['15 pers.', 'aprobación']);
    expect(typeAndLocation({ ...area, location: '' })).toBe('BBQ');
  });

  it('pill: activa, mantenimiento vigente o inactiva', () => {
    expect(zonePill(area, '2026-10-15').label).toBe('Activa');
    const maint = { ...area, restrictions: [{ id: 1, commonAreaId: 4, restrictionType: 'maintenance' as const, startDate: '2026-10-14', endDate: '2026-10-20' }] };
    expect(zonePill(maint, '2026-10-15').label).toBe('Mantenimiento');
    expect(zonePill(maint, '2026-10-21').label).toBe('Activa');
    expect(zonePill({ ...area, isActive: false }, '2026-10-15').label).toBe('Inactiva');
  });

  it('mini barra: pendiente > reservada > cerrada > libre; ignora otras zonas y canceladas', () => {
    const cells = weekCells(area, days, [
      res(1, '2026-10-12', 'approved'),
      res(2, '2026-10-14', 'approved'),
      res(3, '2026-10-14', 'pending'),
      res(4, '2026-10-13', 'cancelled'),
      res(5, '2026-10-15', 'approved', 9),
    ]);
    // lun reservada, mar libre (cancelada), mié pendiente, jue libre, vie libre, sáb y dom cerrados (sin horario)
    expect(cells).toEqual(['reserved', 'free', 'pending', 'free', 'free', 'closed', 'closed']);
  });

  it('resumen de la semana', () => {
    expect(weekSummary(area, [res(1, '2026-10-12', 'approved'), res(2, '2026-10-13', 'pending'), res(3, '2026-10-13', 'rejected')], '2026-10-15')).toBe('2 reservas');
    expect(weekSummary(area, [res(1, '2026-10-12', 'approved')], '2026-10-15')).toBe('1 reserva');
    expect(weekSummary(area, [], '2026-10-15')).toBe('sin reservas');
    const closed = { ...area, restrictions: [{ id: 1, commonAreaId: 4, restrictionType: 'blocked' as const, startDate: '2026-10-14', endDate: '2026-10-20' }] };
    expect(weekSummary(closed, [], '2026-10-15')).toBe('cerrada hasta 20 oct');
    // un bloqueo con horas no cierra el día
    const partial = { ...area, restrictions: [{ id: 1, commonAreaId: 4, restrictionType: 'event' as const, startDate: '2026-10-15', endDate: '2026-10-15', startTime: '08:00', endTime: '10:00' }] };
    expect(weekSummary(partial, [], '2026-10-15')).toBe('sin reservas');
  });
});
