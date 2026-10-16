import { describe, expect, it } from 'vitest';
import {
  ALL_BLOCKS,
  buildBlockChips,
  buildBlockRows,
  formatCoefficient,
  formatOccupancy,
  formatUnitLabel,
  getCoefficientStatus,
  shareOf,
} from './unit-display';
import type { PropertyUnitsSummary } from './entities';

const tayazal: PropertyUnitsSummary = {
  total: 194,
  active: 194,
  withResidents: 194,
  coefficientSum: 100,
  blocks: [
    { block: 'Casa', total: 156, active: 156, coefficientSum: 78.568 },
    { block: 'Dúplex', total: 12, active: 12, coefficientSum: 6.101 },
    { block: 'Jardín', total: 1, active: 1, coefficientSum: 0 },
    { block: 'Local', total: 25, active: 25, coefficientSum: 15.331 },
  ],
};

describe('formatUnitLabel', () => {
  it('antepone el bloque al número ("Casa 126")', () => {
    expect(formatUnitLabel('126', 'Casa')).toBe('Casa 126');
    expect(formatUnitLabel('4', 'Dúplex')).toBe('Dúplex 4');
  });
  it('sin bloque muestra el número', () => {
    expect(formatUnitLabel('101', '')).toBe('101');
    expect(formatUnitLabel('101', undefined)).toBe('101');
  });
  it('no repite el bloque si el número ya lo trae', () => {
    expect(formatUnitLabel('A-201', 'A')).toBe('A-201');
  });
  it('sin número ni bloque muestra un guion', () => {
    expect(formatUnitLabel('', '')).toBe('—');
  });
});

describe('formatCoefficient', () => {
  it('usa coma decimal y al menos 3 decimales', () => {
    expect(formatCoefficient(0.503)).toBe('0,503');
    expect(formatCoefficient(0.0083333)).toBe('0,008333');
  });
  it('sin valor muestra un guion', () => {
    expect(formatCoefficient(undefined)).toBe('—');
  });
});

describe('getCoefficientStatus', () => {
  it('reconoce la escala 100 cuando la suma cuadra', () => {
    const s = getCoefficientStatus(100.004);
    expect(s).toMatchObject({ ok: true, scale: 100, label: 'Suman 100' });
  });
  it('reconoce la escala 1 (fracciones)', () => {
    expect(getCoefficientStatus(1)).toMatchObject({ ok: true, scale: 1 });
  });
  it('indica cuánto falta o sobra', () => {
    expect(getCoefficientStatus(84.669)).toMatchObject({ ok: false, label: 'Faltan 15,331' });
    expect(getCoefficientStatus(101.5)).toMatchObject({ ok: false, label: 'Sobran 1,50' });
  });
  it('sin coeficientes no cuadra', () => {
    expect(getCoefficientStatus(0)).toMatchObject({ ok: false, label: 'Sin coeficientes' });
  });
});

describe('agrupación por bloque', () => {
  it('chips: "Todas" con el total y bloques por cantidad', () => {
    const chips = buildBlockChips(tayazal);
    expect(chips[0]).toEqual({ id: ALL_BLOCKS, label: 'Todas', count: 194 });
    expect(chips.map((c) => c.label)).toEqual(['Todas', 'Casa', 'Local', 'Dúplex', 'Jardín']);
  });
  it('chips: omite el bloque vacío (no se puede filtrar)', () => {
    const chips = buildBlockChips({ ...tayazal, blocks: [{ block: '', total: 6, active: 6, coefficientSum: 0 }] });
    expect(chips).toHaveLength(1);
  });
  it('chips sin resumen: solo "Todas" en 0', () => {
    expect(buildBlockChips(null)).toEqual([{ id: ALL_BLOCKS, label: 'Todas', count: 0 }]);
  });
  it('filas: participación de cada bloque en el coeficiente total', () => {
    const rows = buildBlockRows(tayazal);
    expect(rows[0].block).toBe('Casa');
    expect(rows[0].share).toBeCloseTo(78.568, 3);
    expect(rows.reduce((acc, r) => acc + r.share, 0)).toBeCloseTo(100, 6);
  });
  it('shareOf con total 0 devuelve 0', () => {
    expect(shareOf(5, 0)).toBe(0);
  });
});

describe('formatOccupancy', () => {
  it('sin residentes', () => {
    expect(formatOccupancy(0, '')).toBe('Sin residentes');
    expect(formatOccupancy(undefined, undefined)).toBe('Sin residentes');
  });
  it('residente principal y los demás', () => {
    expect(formatOccupancy(1, 'Ana Pérez')).toBe('Ana Pérez');
    expect(formatOccupancy(3, 'Ana Pérez')).toBe('Ana Pérez +2');
  });
});
