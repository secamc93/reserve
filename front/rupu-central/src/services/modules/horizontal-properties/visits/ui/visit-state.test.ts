import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  formatWallTime,
  minutesBetween,
  todayInProperty,
  toWallClockISO,
  unitLabel,
  visitActions,
  visitStateOf,
  visitTimeline,
  wallClockParts,
} from './visit-state';

describe('estado de portería de una visita', () => {
  it('se deriva del código del back: dentro, esperada, salió, cancelada', () => {
    expect(visitStateOf({ visitStatusCode: 'in_progress', visitStatusName: 'En Curso' })).toBe('inside');
    expect(visitStateOf({ visitStatusCode: 'pending', visitStatusName: 'Pendiente' })).toBe('expected');
    expect(visitStateOf({ visitStatusCode: 'authorized', visitStatusName: 'Autorizada' })).toBe('expected');
    expect(visitStateOf({ visitStatusCode: 'completed', visitStatusName: 'Completada' })).toBe('left');
    for (const code of ['cancelled', 'rejected', 'expired']) {
      expect(visitStateOf({ visitStatusCode: code, visitStatusName: '' })).toBe('cancelled');
    }
  });

  it('sin código usa el nombre y las horas reales', () => {
    expect(visitStateOf({ visitStatusName: 'Cancelada' })).toBe('cancelled');
    expect(visitStateOf({ visitStatusName: 'x', actualEntryTime: '2026-10-15T14:00:00Z' })).toBe('inside');
    expect(visitStateOf({ visitStatusName: 'x', actualEntryTime: '2026-10-15T14:00:00Z', actualExitTime: '2026-10-15T15:00:00Z' })).toBe('left');
    expect(visitStateOf({ visitStatusName: 'Pendiente' })).toBe('expected');
  });

  it('acciones: esperada entra, edita y cancela; dentro solo sale; las demás nada', () => {
    expect(visitActions({ visitStatusCode: 'authorized', visitStatusName: '' })).toEqual({ canEnter: true, canExit: false, canCancel: true, canEdit: true });
    expect(visitActions({ visitStatusCode: 'in_progress', visitStatusName: '' })).toEqual({ canEnter: false, canExit: true, canCancel: false, canEdit: false });
    expect(visitActions({ visitStatusCode: 'completed', visitStatusName: '' })).toEqual({ canEnter: false, canExit: false, canCancel: false, canEdit: false });
    expect(visitActions({ visitStatusCode: 'cancelled', visitStatusName: '' })).toEqual({ canEnter: false, canExit: false, canCancel: false, canEdit: false });
  });
});

describe('unidad', () => {
  it('muestra "Casa 126" con el bloque, "Unidad 126" sin él, nunca el id', () => {
    expect(unitLabel('Casa', '126')).toBe('Casa 126');
    expect(unitLabel('Dúplex', '8')).toBe('Dúplex 8');
    expect(unitLabel('', '126')).toBe('Unidad 126');
    expect(unitLabel(undefined, ' 7 ')).toBe('Unidad 7');
  });
});

describe('horas', () => {
  it('la hora programada es hora de pared guardada como UTC', () => {
    expect(formatWallTime('2026-10-15T09:30:00Z')).toBe('09:30');
    expect(toWallClockISO('2026-10-15', '09:30')).toBe('2026-10-15T09:30:00Z');
    expect(toWallClockISO('2026-10-15')).toBe('2026-10-15T00:00:00Z');
    expect(wallClockParts('2026-10-15T09:30:00Z')).toEqual({ date: '2026-10-15', time: '09:30' });
  });

  it('"hoy" es el día en Colombia aunque en UTC ya sea mañana', () => {
    // 23:30 del 15 en Bogotá = 04:30 UTC del 16
    expect(todayInProperty(new Date('2026-10-16T04:30:00Z'))).toBe('2026-10-15');
  });

  it('duración legible', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(formatDuration(125)).toBe('2 h 05 min');
    expect(minutesBetween('2026-10-15T14:00:00Z', new Date('2026-10-15T14:47:30Z'))).toBe(47);
    expect(minutesBetween(undefined)).toBe(0);
  });
});

describe('línea de tiempo', () => {
  const base = {
    createdAt: '2026-10-14T20:00:00Z',
    scheduledDate: '2026-10-15T00:00:00Z',
    scheduledStartTime: '2026-10-15T09:00:00Z',
    visitStatusName: '',
  };

  it('esperada: entrada y salida pendientes', () => {
    const steps = visitTimeline({ ...base, visitStatusCode: 'authorized' });
    expect(steps.map((s) => s.key)).toEqual(['created', 'scheduled', 'entry', 'exit']);
    expect(steps.find((s) => s.key === 'entry')!.done).toBe(false);
    expect(steps.find((s) => s.key === 'scheduled')!.at).toContain('09:00');
  });

  it('dentro: entrada hecha con la portería y "dentro hace"', () => {
    const steps = visitTimeline(
      { ...base, visitStatusCode: 'in_progress', actualEntryTime: '2026-10-15T14:00:00Z', entryGate: 'Principal' },
      new Date('2026-10-15T14:45:00Z'),
    );
    const entry = steps.find((s) => s.key === 'entry')!;
    expect(entry.done).toBe(true);
    expect(entry.detail).toBe('Portería Principal');
    expect(steps.find((s) => s.key === 'exit')!.detail).toBe('Dentro hace 45 min');
  });

  it('salió: estadía calculada', () => {
    const steps = visitTimeline({ ...base, visitStatusCode: 'completed', actualEntryTime: '2026-10-15T14:00:00Z', actualExitTime: '2026-10-15T16:10:00Z' });
    expect(steps.find((s) => s.key === 'exit')!.detail).toBe('Estadía 2 h 10 min');
  });

  it('cancelada: termina en la cancelación, sin entrada ni salida', () => {
    const steps = visitTimeline({ ...base, visitStatusCode: 'cancelled', visitStatusName: 'Cancelada' });
    expect(steps.map((s) => s.key)).toEqual(['created', 'scheduled', 'cancelled']);
    expect(steps.at(-1)!.tone).toBe('danger');
  });
});
