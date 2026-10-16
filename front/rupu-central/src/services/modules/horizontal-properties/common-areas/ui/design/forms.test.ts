import { describe, expect, it } from 'vitest';
import {
  applyAreaType,
  basicSchedule,
  basicScheduleToRows,
  toggleDay,
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
  it('valida obligatorios y el horario', () => {
    const form = { ...emptyAreaForm(), maxCapacity: '0', scheduleStart: '22:00', scheduleEnd: '08:00' };
    expect(Object.keys(validateAreaForm(form)).sort()).toEqual(['commonAreaTypeId', 'maxCapacity', 'name', 'scheduleEnd']);
  });

  it('el tipo propone capacidad y reglas; por defecto abre los 7 días 08:00–22:00', () => {
    const form = applyAreaType(emptyAreaForm(), type);
    expect(form).toMatchObject({ commonAreaTypeId: 3, maxCapacity: '15', requiresApproval: true, scheduleStart: '08:00', scheduleEnd: '22:00' });
    expect(form.openDays).toHaveLength(7);
  });

  it('DTO: depósito > 0 implica requiresDeposit, equipamiento opcional, pesos con punto de miles', () => {
    const dto = areaFormToDTO({ ...applyAreaType(emptyAreaForm(), type), name: '  BBQ Norte ', hourlyRate: '30.000', areaSqm: '120,5', depositAmount: '100.000', equipmentDescription: '' });
    expect(dto).toMatchObject({ name: 'BBQ Norte', hourlyRate: 30000, areaSqm: 120.5, requiresDeposit: true, depositAmount: 100000, hasEquipment: false, equipmentDescription: undefined });
    expect(areaFormToDTO({ ...applyAreaType(emptyAreaForm(), type), name: 'X', depositAmount: '' })).toMatchObject({ requiresDeposit: false, depositAmount: undefined });
    expect(validateAreaForm({ ...applyAreaType(emptyAreaForm(), type), name: 'X', hourlyRate: 'abc' }).hourlyRate).toBeTruthy();
  });

  it('días L–D y horario básico a 7 filas', () => {
    let form = { ...emptyAreaForm(), scheduleStart: '09:00', scheduleEnd: '18:00' };
    form = toggleDay(toggleDay(form, 0), 6); // cierra domingo y sábado
    const rows = basicScheduleToRows(form);
    expect(rows).toHaveLength(7);
    expect(rows.filter((r) => r.isActive).map((r) => r.dayOfWeek)).toEqual([1, 2, 3, 4, 5]);
    expect(rows[0]).toEqual({ dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true });
  });

  it('al editar toma el horario más repetido y no lo reescribe si no se toca', () => {
    const area = {
      id: 1, businessId: 1, commonAreaTypeId: 3, name: 'Salón', maxCapacity: 40, hasEquipment: true, equipmentDescription: 'Sonido',
      requiresApproval: false, requiresDeposit: true, depositAmount: 200000, allowsRecurring: false, isActive: false, createdAt: '', updatedAt: '',
    };
    const form = areaFormFrom(area, [
      { dayOfWeek: 1, startTime: '08:00', endTime: '22:00', isActive: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '22:00', isActive: true },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isActive: true },
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isActive: false },
    ]);
    expect(form).toMatchObject({ maxCapacity: '40', depositAmount: '200000', isActive: false, equipmentDescription: 'Sonido', scheduleStart: '08:00', scheduleEnd: '22:00', scheduleDirty: false, customSchedule: true });
    expect(form.openDays.sort()).toEqual([1, 2, 6]);
    expect(basicSchedule([]).openDays).toEqual([]);
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
