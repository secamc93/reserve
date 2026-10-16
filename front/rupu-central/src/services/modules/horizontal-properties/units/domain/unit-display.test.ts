import { describe, expect, it } from 'vitest';
import {
  UNIT_TAB_ALL,
  blockTotals,
  buildUnitTabs,
  formatArea,
  formatCoefficient,
  formatCoefficientPct,
  formatOccupancy,
  formatRoomsBaths,
  formatUnitLabel,
  getCoefficientStatus,
  groupUnitsByBlock,
  importCount,
  importRowStatusLabel,
  projectCoefficientSum,
  unitTabToFilters,
  unitsToCsv,
} from './unit-display';
import type { PropertyUnit, PropertyUnitsSummary } from './entities';

const tayazal: PropertyUnitsSummary = {
  total: 194,
  active: 194,
  withResidents: 190,
  coefficientSum: 100,
  commercial: 0,
  blocks: [
    { block: 'Casa', total: 156, active: 156, coefficientSum: 79.41 },
    { block: 'Dúplex', total: 12, active: 12, coefficientSum: 6.101 },
    { block: 'Jardín', total: 1, active: 1, coefficientSum: 0 },
    { block: 'Local', total: 25, active: 25, coefficientSum: 14.489 },
  ],
};

const unit = (id: number, number: string, block: string, extra: Partial<PropertyUnit> = {}): PropertyUnit => ({
  id, businessId: 1, number, block, unitType: 'house', isActive: true, createdAt: '', updatedAt: '', ...extra,
});

describe('formatos', () => {
  it('etiqueta "Casa 126", sin repetir el bloque y sin id', () => {
    expect(formatUnitLabel('126', 'Casa')).toBe('Casa 126');
    expect(formatUnitLabel('101', '')).toBe('101');
    expect(formatUnitLabel('A-201', 'A')).toBe('A-201');
    expect(formatUnitLabel('', '')).toBe('—');
  });
  it('coeficiente, porcentaje, área y habitaciones en es-CO', () => {
    expect(formatCoefficient(0.842)).toBe('0,842');
    expect(formatCoefficient(undefined)).toBe('—');
    expect(formatCoefficientPct(79.41)).toBe('79,410 %');
    expect(formatArea(72.5)).toBe('72,5 m²');
    expect(formatArea(undefined)).toBe('—');
    expect(formatRoomsBaths(3, 2)).toBe('3 / 2');
    expect(formatRoomsBaths(undefined, undefined)).toBe('—');
  });
  it('ocupación', () => {
    expect(formatOccupancy(0, '')).toBe('Sin residente');
    expect(formatOccupancy(3, 'Ana Pérez')).toBe('Ana Pérez +2');
  });
});

describe('suma de coeficientes', () => {
  it('cuadra en 100 y dice cuánto falta o sobra', () => {
    expect(getCoefficientStatus(100)).toMatchObject({ ok: true, label: 'Suman 100' });
    expect(getCoefficientStatus(99.91)).toMatchObject({ ok: false, label: 'faltan 0,09' });
    expect(getCoefficientStatus(100.5)).toMatchObject({ ok: false, label: 'sobran 0,50' });
    expect(getCoefficientStatus(1)).toMatchObject({ ok: true, scale: 1 });
    expect(getCoefficientStatus(0)).toMatchObject({ ok: false, label: 'Sin coeficientes' });
  });
  it('proyecta la suma al cambiar el coeficiente de una unidad', () => {
    expect(projectCoefficientSum(100, 0.842, 0.9)).toBeCloseTo(100.058, 6);
    expect(projectCoefficientSum(99.5, undefined, 0.5)).toBeCloseTo(100, 6);
  });
});

describe('pestañas', () => {
  it('Todas, bloques por cantidad y Sin residente', () => {
    const tabs = buildUnitTabs(tayazal);
    expect(tabs.map((t) => `${t.label} · ${t.count}`)).toEqual([
      'Todas · 194', 'Casa · 156', 'Local · 25', 'Dúplex · 12', 'Jardín · 1', 'Sin residente · 4',
    ]);
  });
  it('Locales solo si hay locales comerciales sin bloque de locales; Inactivas si hay', () => {
    const tabs = buildUnitTabs({ ...tayazal, commercial: 3, active: 190, blocks: [{ block: 'Torre A', total: 194, active: 190, coefficientSum: 100 }] });
    expect(tabs.map((t) => t.id)).toEqual(['todas', 'bloque:Torre A', 'sin-residente', 'locales', 'inactivas']);
    expect(buildUnitTabs({ ...tayazal, commercial: 25 }).some((t) => t.id === 'locales')).toBe(false);
  });
  it('filtros por pestaña', () => {
    expect(unitTabToFilters(UNIT_TAB_ALL)).toEqual({});
    expect(unitTabToFilters('bloque:Casa')).toEqual({ block: 'Casa' });
    expect(unitTabToFilters('sin-residente')).toEqual({ withoutResidents: true });
    expect(unitTabToFilters('locales')).toEqual({ unitType: 'commercial' });
    expect(unitTabToFilters('inactivas')).toEqual({ isActive: false });
    expect(unitTabToFilters('otra')).toEqual({});
  });
});

describe('agrupación por bloque', () => {
  it('agrupa filas consecutivas y toma el coeficiente del bloque del resumen', () => {
    const groups = groupUnitsByBlock([unit(1, '1', 'Casa'), unit(2, '2', 'Casa'), unit(3, '1', 'Dúplex')]);
    expect(groups.map((g) => [g.block, g.units.length])).toEqual([['Casa', 2], ['Dúplex', 1]]);
    expect(blockTotals(tayazal, 'Casa')).toEqual({ total: 156, coefficientSum: 79.41 });
    expect(blockTotals(tayazal, 'Otro')).toBeNull();
  });
});

describe('importación', () => {
  it('etiquetas de estado y cantidad a importar', () => {
    const exists = { row: 3, number: '127', block: 'Casa', unitType: 'house', status: 'exists' as const, message: 'Ya existe' };
    expect(importRowStatusLabel(exists, true)).toBe('Ya existe · se actualizará');
    expect(importRowStatusLabel(exists, false)).toBe('Ya existe · se omitirá');
    expect(importRowStatusLabel({ ...exists, status: 'duplicate', message: 'Número duplicado (fila 90)' }, true)).toBe('Número duplicado (fila 90)');
    expect(importCount(117, 3, true)).toBe(120);
    expect(importCount(117, 3, false)).toBe(117);
  });
});

describe('exportación CSV', () => {
  it('separador ";", coma decimal, comillas cuando hace falta y BOM', () => {
    const csv = unitsToCsv([unit(1, '126', 'Casa', { coefficient: 0.842, area: 72.5, mainResidentName: 'Pérez; Ana', residentsCount: 2 })]);
    expect(csv.startsWith('﻿Unidad;Bloque;Número')).toBe(true);
    expect(csv.split('\n')[1]).toBe('Casa 126;Casa;126;Casa;;72,5;;;0,842;"Pérez; Ana";2;Sí');
  });
});
