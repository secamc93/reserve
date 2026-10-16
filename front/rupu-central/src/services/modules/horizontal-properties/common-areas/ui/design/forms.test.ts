import { describe, expect, it } from 'vitest';
import {
  applyAreaType,
  areaFormFrom,
  areaFormToDTO,
  emptyAreaForm,
  reservationToDTO,
  restrictionToDTO,
  scheduleRows,
  validateAreaForm,
  validateReservation,
  validateRestriction,
  validateScheduleRows,
} from './forms';

const type = { id: 3, name: 'BBQ', code: 'bbq', defaultMaxCapacity: 15, requiresApproval: true, allowsRecurring: false, isActive: true };

describe('formulario de zona', () => {
  it('valida obligatorios y depósito', () => {
    const form = { ...emptyAreaForm(), maxCapacity: '0', requiresDeposit: true };
    const errors = validateAreaForm(form);
    expect(Object.keys(errors).sort()).toEqual(['commonAreaTypeId', 'depositAmount', 'maxCapacity', 'name']);
  });

  it('el tipo propone capacidad y reglas', () => {
    const form = applyAreaType(emptyAreaForm(), type);
    expect(form).toMatchObject({ commonAreaTypeId: 3, maxCapacity: '15', requiresApproval: true });
  });

  it('convierte a DTO: pesos con punto de miles, área decimal y depósito solo si aplica', () => {
    const dto = areaFormToDTO({
      ...applyAreaType(emptyAreaForm(), type),
      name: '  BBQ Norte ',
      hourlyRate: '30.000',
      areaSqm: '120,5',
      requiresDeposit: false,
      depositAmount: '50000',
    });
    expect(dto).toMatchObject({ name: 'BBQ Norte', hourlyRate: 30000, areaSqm: 120.5, depositAmount: undefined, isActive: true });
    expect(validateAreaForm({ ...applyAreaType(emptyAreaForm(), type), name: 'X', hourlyRate: 'abc' }).hourlyRate).toBeTruthy();
  });

  it('carga una zona existente para editar', () => {
    const form = areaFormFrom({
      id: 1, businessId: 1, commonAreaTypeId: 3, name: 'Salón', maxCapacity: 40, hasEquipment: true, equipmentDescription: 'Sonido',
      requiresApproval: false, requiresDeposit: true, depositAmount: 200000, allowsRecurring: false, isActive: false, createdAt: '', updatedAt: '',
    });
    expect(form).toMatchObject({ maxCapacity: '40', depositAmount: '200000', isActive: false, equipmentDescription: 'Sonido' });
  });
});

describe('horario semanal', () => {
  it('siete filas lunes a domingo; los días sin registro quedan cerrados', () => {
    const rows = scheduleRows([{ dayOfWeek: 0, startTime: '10:00:00', endTime: '14:00:00', isActive: true }]);
    expect(rows.map((r) => r.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(rows[6]).toEqual({ dayOfWeek: 0, isActive: true, startTime: '10:00', endTime: '14:00' });
    expect(rows[0].isActive).toBe(false);
  });
  it('valida apertura < cierre solo en días abiertos', () => {
    expect(validateScheduleRows([{ dayOfWeek: 1, isActive: true, startTime: '20:00', endTime: '08:00' }])).toMatch(/anterior/);
    expect(validateScheduleRows([{ dayOfWeek: 1, isActive: false, startTime: '20:00', endTime: '08:00' }])).toBeNull();
  });
});

describe('bloqueos', () => {
  const base = { restrictionType: 'maintenance' as const, startDate: '2026-10-20', endDate: '2026-10-21', allDay: true, startTime: '08:00', endTime: '12:00', reason: ' Pintura ' };
  it('todo el día no envía horas', () => {
    expect(restrictionToDTO(base)).toEqual({ restrictionType: 'maintenance', startDate: '2026-10-20', endDate: '2026-10-21', startTime: undefined, endTime: undefined, reason: 'Pintura' });
  });
  it('fechas invertidas', () => {
    expect(validateRestriction({ ...base, endDate: '2026-10-19' })).toMatch(/anterior/);
    expect(validateRestriction(base)).toBeNull();
  });
});

describe('nueva reserva', () => {
  const form = { commonAreaId: 2, propertyUnitId: 9, date: '2026-10-20', startTime: '14:00', endTime: '18:00', numberOfGuests: '12', purpose: 'Cumpleaños', specialRequests: '' };
  it('respeta la capacidad de la zona', () => {
    expect(validateReservation(form, 10).numberOfGuests).toBe('La capacidad máxima es 10');
    expect(validateReservation(form, 20)).toEqual({});
  });
  it('exige unidad y horas en orden', () => {
    const errors = validateReservation({ ...form, propertyUnitId: 0, endTime: '13:00' });
    expect(errors.propertyUnitId).toBeTruthy();
    expect(errors.endTime).toBeTruthy();
  });
  it('envía la fecha a medianoche UTC', () => {
    expect(reservationToDTO(form)).toMatchObject({ reservationDate: '2026-10-20T00:00:00Z', numberOfGuests: 12, specialRequests: undefined });
  });
});
