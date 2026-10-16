import { describe, expect, it } from 'vitest';
import { daysColor, deliveryNotes, formatDays, packageActions, packageDays, packageGroupOf, packageStatusLabel, packageTimeline, unitLabel } from './package-state';

// 15 de octubre, 10:00 en Colombia
const now = new Date('2026-10-15T15:00:00Z');

describe('grupo y acciones de un paquete', () => {
  it('agrupa por código: por entregar, entregado, devuelto', () => {
    for (const c of ['received', 'in_storage', 'notified']) expect(packageGroupOf({ statusCode: c })).toBe('pending');
    expect(packageGroupOf({ statusCode: 'delivered' })).toBe('delivered');
    expect(packageGroupOf({ statusCode: 'returned' })).toBe('closed');
    expect(packageStatusLabel({ statusCode: 'lost', statusName: '' })).toBe('Perdido');
  });

  it('se entrega si está recibido o en almacén (notificado no, como en el back); se devuelve si está por entregar', () => {
    expect(packageActions({ statusCode: 'received' })).toEqual({ canDeliver: true, canReturn: true });
    expect(packageActions({ statusCode: 'notified' })).toEqual({ canDeliver: false, canReturn: true });
    expect(packageActions({ statusCode: 'delivered', deliveredAt: '2026-10-15T10:00:00Z' })).toEqual({ canDeliver: false, canReturn: false });
  });
});

describe('días en portería (P1)', () => {
  it('cuenta días de calendario en Colombia: hoy, 1 día, 6 días', () => {
    expect(packageDays({ receivedAt: '2026-10-15T13:00:00Z', createdAt: '' }, now)).toBe(0);
    // 14 oct 23:00 en Colombia (15 oct 04:00 UTC) → ayer
    expect(packageDays({ receivedAt: '2026-10-15T04:00:00Z', createdAt: '' }, now)).toBe(1);
    expect(packageDays({ receivedAt: '2026-10-09T15:00:00Z', createdAt: '' }, now)).toBe(6);
    // entregado: cuenta hasta la entrega
    expect(packageDays({ receivedAt: '2026-10-09T15:00:00Z', createdAt: '', deliveredAt: '2026-10-11T15:00:00Z' }, now)).toBe(2);
    expect(formatDays(0)).toBe('hoy');
    expect(formatDays(1)).toBe('1 día');
    expect(formatDays(6)).toBe('6 días');
  });

  it('color: terracota desde 5 días, gris oscuro desde 2, gris claro antes', () => {
    expect(daysColor(6)).toBe('#c8603f');
    expect(daysColor(5)).toBe('#c8603f');
    expect(daysColor(2)).toBe('#4b4a46');
    expect(daysColor(1)).toBe('#8a8580');
  });
});

describe('unidad, entrega y línea de tiempo', () => {
  it('"Casa 126", nunca el id', () => {
    expect(unitLabel('Casa', '126')).toBe('Casa 126');
    expect(unitLabel('', '126')).toBe('Unidad 126');
  });

  it('la nota de la entrega dice a quién se entregó', () => {
    expect(deliveryNotes({ name: 'Ana Ruiz', doc: 'CC 123' }, 'Dejó firma')).toBe('Entregado a: Ana Ruiz (CC 123). Dejó firma');
    expect(deliveryNotes({ name: 'María López' }, '')).toBe('Entregado a: María López.');
    expect(deliveryNotes(null, ' ')).toBe('');
  });

  it('por entregar: recibido (con quién) y entrega pendiente', () => {
    const steps = packageTimeline({ statusCode: 'received', receivedAt: '2026-10-09T15:00:00Z', createdAt: '', notifyResident: true, receivedByName: 'Portería' }, now);
    expect(steps.map((s) => [s.key, s.done])).toEqual([
      ['received', true],
      ['notified', false],
      ['delivered', false],
    ]);
    expect(steps[0].detail).toBe('recibió Portería');
    expect(steps.at(-1)!.detail).toBe('6 días en portería');
  });

  it('entregado y devuelto', () => {
    const delivered = packageTimeline({ statusCode: 'delivered', receivedAt: '2026-10-14T15:00:00Z', createdAt: '', deliveredAt: '2026-10-15T15:00:00Z' }, now);
    expect(delivered.at(-1)).toMatchObject({ key: 'delivered', done: true, detail: 'estuvo 1 día en portería' });
    const returned = packageTimeline({ statusCode: 'returned', receivedAt: '2026-10-14T15:00:00Z', createdAt: '' }, now);
    expect(returned.at(-1)).toMatchObject({ key: 'closed', label: 'Devuelto al remitente', tone: 'danger' });
  });
});
