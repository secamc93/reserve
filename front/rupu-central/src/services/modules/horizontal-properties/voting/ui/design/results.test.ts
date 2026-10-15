import { describe, expect, it } from 'vitest';
import { computeCoefficientResults } from './results';

const options = [
  { id: 1, text: 'Sí', color: '#1f8a4c' },
  { id: 2, text: 'No', color: '#c8382d' },
  { id: 3, text: 'Abstención', color: '#8a8580' },
];

// Demo de Tayazal: T1-101 (0,20) y T2-101 (0,15) votan Sí; T1-102 (0,20) vota No; el resto pendiente.
const units = (scale: number) => [
  { hasVoted: true, coef: 0.2 * scale, optionId: 1 },
  { hasVoted: true, coef: 0.15 * scale, optionId: 1 },
  { hasVoted: true, coef: 0.2 * scale, optionId: 2 },
  { hasVoted: false, coef: 0.15 * scale },
  { hasVoted: false, coef: 0.15 * scale },
  { hasVoted: false, coef: 0.15 * scale },
];

describe('computeCoefficientResults', () => {
  it.each([
    ['coeficientes como fracción (suman 1)', 1],
    ['coeficientes como porcentaje (suman 100)', 100],
  ])('%s: da el %% legal sobre el total del conjunto', (_caso, scale) => {
    const r = computeCoefficientResults(options, units(scale));
    expect(r.segments[0].pct).toBeCloseTo(35);
    expect(r.segments[1].pct).toBeCloseTo(20);
    expect(r.segments[2].pct).toBeCloseTo(0);
    expect(r.pending.pct).toBeCloseTo(45);
    expect(r.participation).toBeCloseTo(55);
    expect(r.segments[0].votes).toBe(2);
    expect(r.votedUnits).toBe(3);
  });

  it('sin unidades no divide por cero', () => {
    const r = computeCoefficientResults(options, []);
    expect(r.participation).toBe(0);
    expect(r.segments.every((s) => s.pct === 0)).toBe(true);
  });
});
