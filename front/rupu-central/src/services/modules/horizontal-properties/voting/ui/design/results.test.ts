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

  it.each([
    ['fracción', 1],
    ['porcentaje', 100],
  ])('coeficientes como %s: da también el %% sobre el coeficiente de los votos emitidos', (_caso, scale) => {
    // Votaron 0,55 del coeficiente: Sí 0,35 / 0,55 y No 0,20 / 0,55.
    const r = computeCoefficientResults(options, units(scale));
    expect(r.segments[0].pctOfVoted).toBeCloseTo(63.64, 1);
    expect(r.segments[1].pctOfVoted).toBeCloseTo(36.36, 1);
    expect(r.segments[2].pctOfVoted).toBeCloseTo(0);
  });

  it('sin unidades no divide por cero', () => {
    const r = computeCoefficientResults(options, []);
    expect(r.participation).toBe(0);
    expect(r.segments.every((s) => s.pct === 0 && s.pctOfVoted === 0)).toBe(true);
  });

  it('sin votos emitidos el % sobre los votos es 0', () => {
    const r = computeCoefficientResults(options, units(1).map((u) => ({ ...u, hasVoted: false })));
    expect(r.segments.every((s) => s.pctOfVoted === 0)).toBe(true);
  });
});
