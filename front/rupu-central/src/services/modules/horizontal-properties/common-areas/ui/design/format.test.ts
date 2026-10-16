import { describe, expect, it } from 'vitest';
import { formatClock, formatMoney, scheduleSummary, unitLabel } from './format';

describe('unitLabel', () => {
  it('muestra "Casa 126" con el bloque y el código de la unidad', () => {
    expect(unitLabel('126', 'Casa')).toBe('Casa 126');
    expect(unitLabel('7', 'Dúplex')).toBe('Dúplex 7');
  });
  it('sin bloque usa "Unidad"; sin número no inventa un id', () => {
    expect(unitLabel('301', '')).toBe('Unidad 301');
    expect(unitLabel('', '')).toBe('Sin unidad');
  });
});

describe('formatMoney / formatClock', () => {
  it('formatea pesos sin decimales', () => {
    expect(formatMoney(30000)).toMatch(/^\$ ?30\.000$/);
    expect(formatMoney(undefined)).toBe('—');
  });
  it('recorta las horas de Postgres', () => {
    expect(formatClock('08:00:00')).toBe('08:00');
    expect(formatClock('')).toBe('');
  });
});

describe('scheduleSummary', () => {
  const day = (d: number, s = '08:00', e = '22:00', isActive = true) => ({ dayOfWeek: d, startTime: s, endTime: e, isActive });

  it('agrupa días seguidos con el mismo horario', () => {
    const s = [1, 2, 3, 4, 5].map((d) => day(d)).concat([day(6, '09:00', '18:00')]);
    expect(scheduleSummary(s)).toBe('Lun–Vie 08:00–22:00 · Sáb 09:00–18:00');
  });
  it('todos los días igual', () => {
    expect(scheduleSummary([0, 1, 2, 3, 4, 5, 6].map((d) => day(d)))).toBe('Todos los días 08:00–22:00');
  });
  it('un día cerrado corta el grupo y los inactivos no cuentan', () => {
    const s = [day(1), day(2), day(3, '08:00', '22:00', false), day(4), day(0, '10:00', '14:00')];
    expect(scheduleSummary(s)).toBe('Lun–Mar 08:00–22:00 · Jue 08:00–22:00 · Dom 10:00–14:00');
  });
  it('sin días abiertos', () => {
    expect(scheduleSummary([])).toBe('Sin horario');
  });
});
