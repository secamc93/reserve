import { describe, expect, it } from 'vitest';
import type { Visit } from '../domain';
import { emptyVisitForm, formToCreateDTO, formToUpdateDTO, nextQuarterHour, validateVisitForm, visitToForm } from './visit-form';

const ok = { ...emptyVisitForm('2026-10-15', new Date(2026, 9, 15, 9, 5)), propertyUnitId: 12, visitTypeId: 3 };

describe('formulario de visita', () => {
  it('propone la hora al siguiente cuarto de hora', () => {
    expect(nextQuarterHour(new Date(2026, 9, 15, 9, 5))).toBe('09:15');
    expect(nextQuarterHour(new Date(2026, 9, 15, 9, 45))).toBe('09:45');
    expect(nextQuarterHour(new Date(2026, 9, 15, 9, 50))).toBe('10:00');
  });

  it('pide visitante: buscarlo o, si no existe, nombre y teléfono', () => {
    expect(validateVisitForm(ok, { hasVisitor: false, needsNewVisitor: false })).toMatch(/Busca al visitante/);
    expect(validateVisitForm(ok, { hasVisitor: false, needsNewVisitor: true, visitor: { dni: '1', fullName: '', phone: '', email: '' } })).toMatch(/nombre/);
    expect(validateVisitForm(ok, { hasVisitor: false, needsNewVisitor: true, visitor: { dni: '1', fullName: 'Ana', phone: '', email: '' } })).toMatch(/teléfono/);
    expect(validateVisitForm(ok, { hasVisitor: false, needsNewVisitor: true, visitor: { dni: '1', fullName: 'Ana', phone: '300', email: '' } })).toBeNull();
  });

  it('pide unidad, tipo y hora de salida posterior a la llegada', () => {
    const v = { hasVisitor: true, needsNewVisitor: false };
    expect(validateVisitForm({ ...ok, propertyUnitId: undefined }, v)).toMatch(/unidad/);
    expect(validateVisitForm({ ...ok, visitTypeId: undefined }, v)).toMatch(/tipo/);
    expect(validateVisitForm({ ...ok, startTime: '10:00', endTime: '09:00' }, v)).toMatch(/después/);
    expect(validateVisitForm({ ...ok, startTime: '10:00', endTime: '11:30' }, v)).toBeNull();
  });

  it('convierte a DTO con horas de pared en UTC', () => {
    const dto = formToCreateDTO({ ...ok, startTime: '10:00', endTime: '11:30', purpose: '  Almuerzo ' }, 99);
    expect(dto).toMatchObject({
      visitorId: 99,
      propertyUnitId: 12,
      visitTypeId: 3,
      scheduledDate: '2026-10-15T00:00:00Z',
      scheduledStartTime: '2026-10-15T10:00:00Z',
      scheduledEndTime: '2026-10-15T11:30:00Z',
      purpose: 'Almuerzo',
      numberOfVisitors: 1,
      notifyResident: true,
    });
  });

  it('editar: carga la visita y la vuelve a enviar igual', () => {
    const visit = {
      id: 5,
      propertyUnitId: 12,
      visitTypeId: 3,
      scheduledDate: '2026-10-20T00:00:00Z',
      scheduledStartTime: '2026-10-20T16:15:00Z',
      scheduledEndTime: '2026-10-20T18:00:00Z',
      purpose: 'Cumpleaños',
      numberOfVisitors: 4,
      hasCompanions: true,
      hasAssets: false,
      notes: '',
      notifyResident: true,
      notifySecurity: false,
    } as unknown as Visit;
    const f = visitToForm(visit);
    expect(f).toMatchObject({ date: '2026-10-20', startTime: '16:15', endTime: '18:00', numberOfVisitors: 4, purpose: 'Cumpleaños' });
    expect(formToUpdateDTO(f)).toMatchObject({
      scheduledDate: '2026-10-20T00:00:00Z',
      scheduledStartTime: '2026-10-20T16:15:00Z',
      scheduledEndTime: '2026-10-20T18:00:00Z',
      numberOfVisitors: 4,
    });
  });
});
