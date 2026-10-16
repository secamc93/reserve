import { describe, expect, it } from 'vitest';
import {
  ALL_TYPES,
  buildResidentTimeline,
  buildResidentTypeChips,
  formatShortDate,
  parseSearchField,
  parseStatusFilter,
  pluralizeType,
  residentTypeOptions,
  resolveResidentSearch,
  statusToIsActive,
} from './resident-display';
import type { Resident, ResidentsSummary } from './entities';

const summary: ResidentsSummary = {
  total: 194,
  active: 190,
  inactive: 4,
  main: 194,
  types: [
    { id: 7, name: 'Propietario', code: 'owner', total: 150 },
    { id: 8, name: 'Arrendatario', code: 'tenant', total: 40 },
    { id: 9, name: 'Familiar', code: 'family', total: 4 },
  ],
};

const base: Resident = {
  id: 1,
  businessId: 1,
  propertyUnitId: 10,
  propertyUnitNumber: '126',
  residentTypeId: 8,
  residentTypeName: 'Arrendatario',
  residentTypeCode: 'tenant',
  name: 'Ana Pérez',
  email: 'ana@correo.co',
  dni: '123',
  isMainResident: true,
  isActive: true,
  createdAt: '2024-01-10T15:00:00Z',
  updatedAt: '2024-01-10T15:00:00Z',
};

describe('chips por tipo', () => {
  it('usa los ids reales del catálogo y el plural del nombre', () => {
    const chips = buildResidentTypeChips(summary);
    expect(chips[0]).toEqual({ id: ALL_TYPES, label: 'Todos', count: 194 });
    expect(chips.slice(1)).toEqual([
      { id: '7', label: 'Propietarios', count: 150 },
      { id: '8', label: 'Arrendatarios', count: 40 },
      { id: '9', label: 'Familiares', count: 4 },
    ]);
  });
  it('sin resumen solo "Todos"', () => {
    expect(buildResidentTypeChips(null)).toHaveLength(1);
  });
  it('pluralizeType', () => {
    expect(pluralizeType('Invitado')).toBe('Invitados');
    expect(pluralizeType('Familiar')).toBe('Familiares');
  });
  it('opciones del formulario: catálogo o los tipos por defecto', () => {
    expect(residentTypeOptions(summary.types)[0]).toEqual({ id: 7, name: 'Propietario' });
    expect(residentTypeOptions([]).map((t) => t.name)).toContain('Propietario');
  });
});

describe('búsqueda y estado', () => {
  it('traduce el campo de búsqueda al filtro del back', () => {
    expect(resolveResidentSearch('name', ' Ana ')).toEqual({ name: 'Ana' });
    expect(resolveResidentSearch('unit', '126')).toEqual({ propertyUnitNumber: '126' });
    expect(resolveResidentSearch('dni', '123')).toEqual({ dni: '123' });
    expect(resolveResidentSearch('name', '  ')).toEqual({});
  });
  it('campo y estado por defecto', () => {
    expect(parseSearchField(null)).toBe('name');
    expect(parseSearchField('dni')).toBe('dni');
    expect(parseStatusFilter('')).toBe('todos');
    expect(parseStatusFilter('activos')).toBe('activos');
    expect(statusToIsActive('activos')).toBe(true);
    expect(statusToIsActive('inactivos')).toBe(false);
    expect(statusToIsActive('todos')).toBeUndefined();
  });
});

describe('línea de tiempo', () => {
  it('formatea fechas cortas en español', () => {
    expect(formatShortDate('2024-01-15T00:00:00Z')).toBe('15 ene 2024');
    expect(formatShortDate('')).toBe('');
    expect(formatShortDate('0001-01-01T00:00:00Z')).toBe('');
  });

  it('ordena los eventos y marca los futuros', () => {
    const events = buildResidentTimeline(
      {
        ...base,
        moveInDate: '2024-02-01T00:00:00Z',
        leaseStartDate: '2024-02-01T00:00:00Z',
        leaseEndDate: '2027-02-01T00:00:00Z',
        monthlyRent: 1500000,
        updatedAt: '2025-03-01T10:00:00Z',
      },
      new Date('2026-10-15T00:00:00Z'),
    );
    expect(events.map((e) => e.key)).toEqual(['created', 'move-in', 'lease-start', 'updated', 'lease-end']);
    expect(events.find((e) => e.key === 'lease-end')?.upcoming).toBe(true);
    expect(events.find((e) => e.key === 'lease-start')?.detail).toContain('1.500.000');
  });

  it('no repite la actualización si coincide con el registro', () => {
    expect(buildResidentTimeline(base).map((e) => e.key)).toEqual(['created']);
  });
});
