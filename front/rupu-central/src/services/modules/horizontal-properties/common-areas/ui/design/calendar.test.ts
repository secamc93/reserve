import { describe, expect, it } from 'vitest';
import { addDays, closedBands, groupByDay, hourRange, layoutDay, reservationDay, startOfWeek, weekDays, weekLabel } from './calendar';

describe('semana', () => {
  it('empieza el lunes (también si el día es domingo)', () => {
    expect(startOfWeek('2026-10-15')).toBe('2026-10-12'); // jueves
    expect(startOfWeek('2026-10-18')).toBe('2026-10-12'); // domingo
    expect(startOfWeek('2026-10-12')).toBe('2026-10-12');
  });
  it('siete días y cruce de mes', () => {
    expect(weekDays('2026-09-28')).toEqual(['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('etiqueta de la semana', () => {
    expect(weekLabel('2026-10-12')).toBe('12 – 18 oct 2026');
    expect(weekLabel('2026-09-28')).toBe('28 sep – 4 oct 2026');
  });
  it('la fecha de la reserva no se corre por zona horaria', () => {
    expect(reservationDay('2026-10-20T00:00:00Z')).toBe('2026-10-20');
  });
});

describe('hourRange', () => {
  it('cubre horario y reservas', () => {
    const range = hourRange([{ dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isActive: true }], [{ startTime: '19:00', endTime: '21:30' }]);
    expect(range).toEqual({ start: 8, end: 22 });
  });
  it('sin datos: 08–22', () => {
    expect(hourRange([], [])).toEqual({ start: 8, end: 22 });
  });
});

describe('layoutDay', () => {
  const range = { start: 8, end: 18 }; // 10 h

  it('posiciona por hora', () => {
    const [p] = layoutDay([{ id: 1, startTime: '09:00', endTime: '11:00' }], range);
    expect(p.top).toBeCloseTo(10);
    expect(p.height).toBeCloseTo(20);
    expect(p.lanes).toBe(1);
  });

  it('reparte en carriles las que se solapan y libera el carril al terminar', () => {
    const placed = layoutDay(
      [
        { id: 1, startTime: '09:00', endTime: '12:00' },
        { id: 2, startTime: '10:00', endTime: '11:00' },
        { id: 3, startTime: '11:00', endTime: '13:00' },
        { id: 4, startTime: '14:00', endTime: '15:00' },
      ],
      range,
    );
    const byId = Object.fromEntries(placed.map((p) => [p.item.id, p]));
    expect(byId[1].lane).toBe(0);
    expect(byId[2].lane).toBe(1);
    expect(byId[3].lane).toBe(1);
    expect(byId[1].lanes).toBe(2);
    expect(byId[4]).toMatchObject({ lane: 0, lanes: 1 });
  });
});

describe('groupByDay / closedBands', () => {
  it('agrupa por día', () => {
    const map = groupByDay([
      { id: 1, reservationDate: '2026-10-12T00:00:00Z' },
      { id: 2, reservationDate: '2026-10-12T00:00:00Z' },
      { id: 3, reservationDate: '2026-10-13T00:00:00Z' },
    ]);
    expect(map.get('2026-10-12')?.length).toBe(2);
    expect(map.get('2026-10-13')?.length).toBe(1);
  });
  it('sombrea lo que queda fuera del horario; día cerrado completo', () => {
    const range = { start: 6, end: 22 };
    const bands = closedBands({ dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isActive: true }, range);
    expect(bands).toHaveLength(2);
    expect(bands[0].top).toBe(0);
    expect(bands[0].height).toBeCloseTo(12.5);
    expect(bands[1].top).toBeCloseTo(87.5);
    expect(bands[1].height).toBeCloseTo(12.5);
    expect(closedBands(undefined, range)).toEqual([{ top: 0, height: 100 }]);
  });
});
