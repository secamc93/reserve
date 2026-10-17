import { describe, expect, it } from 'vitest';
import { formatClock, formatClockDate } from './live-clock';

describe('Reloj de la asistencia en vivo', () => {
  it('muestra la hora local en 12 horas con segundos', () => {
    expect(formatClock(new Date(2026, 9, 16, 20, 5, 9))).toEqual({ time: '08:05:09', period: 'p. m.' });
    expect(formatClock(new Date(2026, 9, 16, 9, 30, 0))).toEqual({ time: '09:30:00', period: 'a. m.' });
  });

  it('medianoche y mediodía son las 12', () => {
    expect(formatClock(new Date(2026, 9, 16, 0, 0, 1))).toEqual({ time: '12:00:01', period: 'a. m.' });
    expect(formatClock(new Date(2026, 9, 16, 12, 0, 0))).toEqual({ time: '12:00:00', period: 'p. m.' });
  });

  it('la fecha va en español', () => {
    expect(formatClockDate(new Date(2026, 9, 16, 12))).toMatch(/viernes.*16.*octubre.*2026/);
  });
});
