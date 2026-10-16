import { describe, expect, it } from 'vitest';
import {
  entryExitText,
  formatDoc,
  initials,
  stayLimitAt,
  visitStatusDisplay,
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
    expect(formatDuration(125)).toBe('2 h 05');
    expect(formatDuration(72)).toBe('1 h 12');
    expect(minutesBetween('2026-10-15T14:00:00Z', new Date('2026-10-15T14:47:30Z'))).toBe(47);
    expect(minutesBetween(undefined)).toBe(0);
  });
});

describe('presentación de la fila (V1)', () => {
  it('"Excede tiempo" en terracota gana sobre "Dentro"; esperada en gris oscuro con punto claro', () => {
    expect(visitStatusDisplay({ visitStatusCode: 'in_progress', visitStatusName: '', exceedsTime: true })).toMatchObject({ label: 'Excede tiempo', color: '#c8603f', exceeds: true });
    expect(visitStatusDisplay({ visitStatusCode: 'in_progress', visitStatusName: '' })).toMatchObject({ label: 'Dentro', color: '#1f8a4c' });
    expect(visitStatusDisplay({ visitStatusCode: 'authorized', visitStatusName: '' })).toMatchObject({ label: 'Esperada', color: '#4b4a46', dot: '#c9c6c0' });
    expect(visitStatusDisplay({ visitStatusCode: 'completed', visitStatusName: '' })).toMatchObject({ label: 'Salió' });
  });

  it('documento con puntos, iniciales y texto de entrada/salida', () => {
    expect(formatDoc('79456123')).toBe('CC 79.456.123');
    expect(formatDoc('PA-123')).toBe('PA-123');
    expect(initials('Laura Gómez Ruiz')).toBe('LG');
    expect(initials('')).toBe('?');
    expect(entryExitText({ actualEntryTime: '2026-10-15T14:54:00Z' }, new Date('2026-10-15T15:42:00Z'))).toBe('entró 09:54 · 48 min');
    expect(entryExitText({ actualEntryTime: '2026-10-15T14:02:00Z', actualExitTime: '2026-10-15T14:10:00Z' })).toBe('09:02 → 09:10');
    expect(entryExitText({})).toBe('');
  });

  it('límite de salida = entrada + minutos del tipo', () => {
    expect(stayLimitAt({ actualEntryTime: '2026-10-15T14:54:00Z', stayLimitMinutes: 480 })).toBe('2026-10-15T22:54:00.000Z');
    expect(stayLimitAt({ actualEntryTime: '2026-10-15T14:54:00Z' })).toBeUndefined();
  });
});

describe('línea de tiempo', () => {
  const base = {
    createdAt: '2026-10-14T20:00:00Z',
    scheduledDate: '2026-10-15T00:00:00Z',
    scheduledStartTime: '2026-10-15T09:00:00Z',
    visitStatusName: '',
  };

  it('esperada: entrada y salida pendientes; registrada muestra quién autorizó', () => {
    const steps = visitTimeline({ ...base, visitStatusCode: 'authorized', authorizedByName: 'María López' });
    expect(steps.map((s) => s.key)).toEqual(['created', 'scheduled', 'entry', 'exit']);
    expect(steps[0].detail).toBe('autorizó María López');
    expect(steps.find((s) => s.key === 'scheduled')!.at).toBe('09:00');
    expect(steps.find((s) => s.key === 'entry')).toMatchObject({ done: false, detail: 'pendiente' });
  });

  it('dentro: entrada con la puerta y salida "pendiente · límite HH:MM"', () => {
    const steps = visitTimeline(
      { ...base, visitStatusCode: 'in_progress', actualEntryTime: '2026-10-15T14:54:00Z', entryGate: 'Principal', stayLimitMinutes: 480 },
      new Date('2026-10-15T15:42:00Z'),
    );
    expect(steps.find((s) => s.key === 'entry')).toMatchObject({ done: true, at: '09:54', detail: 'puerta Principal' });
    expect(steps.find((s) => s.key === 'exit')).toMatchObject({ done: false, detail: 'pendiente · límite 17:54' });
  });

  it('salió: estadía calculada', () => {
    const steps = visitTimeline({ ...base, visitStatusCode: 'completed', actualEntryTime: '2026-10-15T14:00:00Z', actualExitTime: '2026-10-15T16:10:00Z' });
    expect(steps.find((s) => s.key === 'exit')!.detail).toBe('estadía 2 h 10');
  });

  it('cancelada: termina en la cancelación, sin entrada ni salida', () => {
    const steps = visitTimeline({ ...base, visitStatusCode: 'cancelled', visitStatusName: 'Cancelada' });
    expect(steps.map((s) => s.key)).toEqual(['created', 'scheduled', 'cancelled']);
    expect(steps.at(-1)!.tone).toBe('danger');
  });
});
