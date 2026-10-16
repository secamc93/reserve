import { describe, expect, it } from 'vitest';
import {
  RESIDENT_TAB_ALL,
  bulkRowFromResident,
  bulkRowToUpdate,
  buildResidentTabs,
  changedFields,
  formatActivityDate,
  formatMonthYear,
  formatShortDate,
  isTenantType,
  isValidOptionalEmail,
  pluralizeType,
  residentSubtitle,
  residentTabToFilters,
  residentTypeOptions,
  setMainInUnit,
} from './resident-display';
import type { Resident, ResidentsSummary } from './entities';

const summary: ResidentsSummary = {
  total: 214,
  active: 210,
  inactive: 4,
  main: 194,
  withoutEmail: 31,
  types: [
    { id: 7, name: 'Propietario', code: 'owner', total: 150 },
    { id: 8, name: 'Arrendatario', code: 'tenant', total: 50 },
    { id: 9, name: 'Familiar', code: 'family', total: 14 },
  ],
};

const resident = (id: number, extra: Partial<Resident> = {}): Resident => ({
  id, businessId: 1, propertyUnitId: 0, propertyUnitNumber: '126', propertyUnitBlock: 'Casa', residentTypeId: 0,
  residentTypeName: 'Propietario', residentTypeCode: '', name: 'Ana Pérez', email: 'ana@correo.co', phone: '300',
  dni: '123', isMainResident: true, isActive: true, createdAt: '', updatedAt: '', ...extra,
});

describe('pestañas', () => {
  it('Todos, tipos del catálogo, Sin correo e Inactivos', () => {
    expect(buildResidentTabs(summary).map((t) => `${t.label} · ${t.count}`)).toEqual([
      'Todos · 214', 'Propietarios · 150', 'Arrendatarios · 50', 'Familiares · 14', 'Sin correo · 31', 'Inactivos · 4',
    ]);
  });
  it('filtros por pestaña', () => {
    expect(residentTabToFilters(RESIDENT_TAB_ALL)).toEqual({});
    expect(residentTabToFilters('tipo:8')).toEqual({ residentTypeId: 8 });
    expect(residentTabToFilters('tipo:x')).toEqual({});
    expect(residentTabToFilters('sin-correo')).toEqual({ withoutEmail: true });
    expect(residentTabToFilters('inactivos')).toEqual({ isActive: false });
  });
  it('plural y tipos', () => {
    expect(pluralizeType('Invitado')).toBe('Invitados');
    expect(residentTypeOptions(summary.types)[1]).toEqual({ id: 8, name: 'Arrendatario', code: 'tenant' });
    expect(residentTypeOptions([]).find((t) => t.name === 'Arrendatario')?.code).toBe('tenant');
    expect(isTenantType({ code: 'tenant' })).toBe(true);
    expect(isTenantType({ name: 'Arrendataria' })).toBe(true);
    expect(isTenantType({ code: 'owner', name: 'Propietario' })).toBe(false);
  });
});

describe('fechas', () => {
  it('mes y año, fecha corta y fecha de actividad', () => {
    expect(formatMonthYear('2021-03-01T00:00:00Z')).toBe('mar 2021');
    expect(formatMonthYear('0001-01-01T00:00:00Z')).toBe('');
    expect(formatShortDate('2024-01-15T00:00:00Z')).toBe('15 ene 2024');
    const now = new Date('2026-10-15T00:00:00Z');
    expect(formatActivityDate('2026-10-12T10:00:00Z', now)).toBe('12 oct');
    expect(formatActivityDate('2025-12-01T10:00:00Z', now)).toBe('1 dic 2025');
  });
  it('subtítulo del detalle', () => {
    expect(residentSubtitle({ residentTypeName: 'Propietaria', dni: '52', since: '2021-03-01T00:00:00Z', createdAt: '' })).toBe('Propietaria · CC 52 · desde mar 2021');
    expect(residentSubtitle({ residentTypeName: 'Familiar', dni: '', createdAt: '' })).toBe('Familiar');
  });
});

describe('edición masiva', () => {
  const a = bulkRowFromResident(resident(1), 'Casa 126');
  const b = bulkRowFromResident(resident(2, { name: 'Luis', isMainResident: false }), 'Casa 126');
  const c = bulkRowFromResident(resident(3, { propertyUnitNumber: '7', name: 'Eva' }), 'Casa 7');

  it('detecta solo los campos cambiados', () => {
    expect(changedFields(a, { ...a, name: ' Ana Pérez ' })).toEqual([]);
    expect(changedFields(a, { ...a, email: 'nuevo@correo.co', isActive: false })).toEqual(['email', 'isActive']);
    expect(bulkRowToUpdate(a, a)).toBeNull();
    expect(bulkRowToUpdate(a, { ...a, phone: ' 311 ', isMain: false })).toEqual({ phone: '311', isMainResident: false });
  });
  it('el principal es único por unidad', () => {
    const rows = setMainInUnit([a, b, c], 2);
    expect(rows.map((r) => [r.id, r.isMain])).toEqual([[1, false], [2, true], [3, true]]);
  });
  it('correo opcional', () => {
    expect(isValidOptionalEmail('')).toBe(true);
    expect(isValidOptionalEmail('ana@correo.co')).toBe(true);
    expect(isValidOptionalEmail('ana@')).toBe(false);
  });
});
