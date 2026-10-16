import { describe, expect, it } from 'vitest';
import { ageLevel, formatAge, packageActions, packageAgeHours, packageGroupOf, packageStatusLabel, packageTimeline, unitLabel } from './package-state';

const now = new Date('2026-10-15T15:00:00Z');

describe('grupo y acciones de un paquete', () => {
  it('agrupa por código: por entregar, entregado, devuelto', () => {
    for (const c of ['received', 'in_storage', 'notified']) expect(packageGroupOf({ statusCode: c })).toBe('pending');
    expect(packageGroupOf({ statusCode: 'delivered' })).toBe('delivered');
    expect(packageGroupOf({ statusCode: 'returned' })).toBe('closed');
    expect(packageGroupOf({ statusCode: 'lost' })).toBe('closed');
    expect(packageStatusLabel({ statusCode: 'lost', statusName: '' })).toBe('Perdido');
    expect(packageStatusLabel({ statusCode: 'in_storage', statusName: '' })).toBe('Por entregar');
  });

  it('se entrega si está recibido o en almacén (notificado no, como en el back); se devuelve si está por entregar', () => {
    expect(packageActions({ statusCode: 'received' })).toEqual({ canDeliver: true, canReturn: true });
    expect(packageActions({ statusCode: 'in_storage' })).toEqual({ canDeliver: true, canReturn: true });
    expect(packageActions({ statusCode: 'notified' })).toEqual({ canDeliver: false, canReturn: true });
    expect(packageActions({ statusCode: 'delivered', deliveredAt: '2026-10-15T10:00:00Z' })).toEqual({ canDeliver: false, canReturn: false });
    expect(packageActions({ statusCode: 'returned' })).toEqual({ canDeliver: false, canReturn: false });
  });
});

describe('antigüedad', () => {
  it('cuenta desde que llegó hasta ahora, o hasta la entrega', () => {
    expect(packageAgeHours({ receivedAt: '2026-10-15T10:00:00Z', createdAt: '2026-10-15T10:00:00Z' }, now)).toBe(5);
    expect(packageAgeHours({ receivedAt: '2026-10-13T15:00:00Z', createdAt: '', deliveredAt: '2026-10-14T15:00:00Z' }, now)).toBe(24);
    // sin received_at usa created_at
    expect(packageAgeHours({ createdAt: '2026-10-15T14:00:00Z' }, now)).toBe(1);
  });

  it('formato y alerta desde 3 días', () => {
    expect(formatAge(0.5)).toBe('< 1 h');
    expect(formatAge(5.9)).toBe('5 h');
    expect(formatAge(49)).toBe('2 d');
    expect(ageLevel(5)).toBe('fresh');
    expect(ageLevel(30)).toBe('aging');
    expect(ageLevel(72)).toBe('overdue');
  });
});

describe('unidad y línea de tiempo', () => {
  it('"Casa 126", nunca el id', () => {
    expect(unitLabel('Casa', '126')).toBe('Casa 126');
    expect(unitLabel('', '126')).toBe('Unidad 126');
  });

  it('por entregar: recibido hecho y entrega pendiente con el tiempo en portería', () => {
    const steps = packageTimeline({ statusCode: 'received', receivedAt: '2026-10-15T10:00:00Z', createdAt: '2026-10-15T10:00:00Z', notifyResident: true }, now);
    expect(steps.map((s) => [s.key, s.done])).toEqual([
      ['received', true],
      ['notified', false],
      ['delivered', false],
    ]);
    expect(steps.at(-1)!.detail).toBe('En portería hace 5 h');
  });

  it('entregado y devuelto', () => {
    const delivered = packageTimeline({ statusCode: 'delivered', receivedAt: '2026-10-14T15:00:00Z', createdAt: '', deliveredAt: '2026-10-15T15:00:00Z' }, now);
    expect(delivered.at(-1)).toMatchObject({ key: 'delivered', done: true, detail: 'Estuvo 1 d en portería' });
    const returned = packageTimeline({ statusCode: 'returned', receivedAt: '2026-10-14T15:00:00Z', createdAt: '' }, now);
    expect(returned.at(-1)).toMatchObject({ key: 'closed', label: 'Devuelto al remitente', tone: 'danger' });
  });
});
