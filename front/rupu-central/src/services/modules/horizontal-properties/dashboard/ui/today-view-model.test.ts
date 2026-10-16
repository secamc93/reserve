import { describe, expect, it } from 'vitest';
import { buildKpis, elapsedSince, pct, todayEyebrow } from './today-view-model';
import type { TodaySummary } from '../domain/entities';

const base: TodaySummary = {
  visitsInside: [],
  visitsInsideCount: 7,
  visitsExceededCount: 1,
  packagesPending: 12,
  packagesOld: 3,
  reservationsToday: [{ startTime: '08:00', endTime: '12:00', areaName: 'Salón social', unitNumber: '126', unitBlock: 'Casa', approved: false }],
  reservationsPending: 1,
  activeVoting: { groupId: 2, groupName: 'Asamblea', votingId: 5, title: 'Presupuesto', votedUnits: 78, totalUnits: 120, quorumPercentage: 51, attendanceByCoef: 71.4 },
  occupancy: { units: 120, unitsWithResident: 112, parkingSlots: 160, parkingAssigned: 138, residents: 214, residentsWithEmail: 171 },
};

describe('Resumen de hoy', () => {
  it('fichas con valores, alertas y enlaces al módulo', () => {
    const k = buildKpis(base, '/properties/1');
    expect(k.map((x) => x.value)).toEqual([7, 12, 1, '71%']);
    expect(k[0].sub).toBe('1 excede su tiempo');
    expect(k[1].sub).toBe('3 llevan más de 5 días');
    expect(k[2].sub).toBe('1 pendiente de aprobar');
    expect(k[3].sub).toBe('quórum alcanzado');
    expect(k[0].href).toBe('/properties/1/visits');
  });
  it('sin votación activa', () => {
    const k = buildKpis({ ...base, activeVoting: null }, '/p');
    expect(k[3]).toMatchObject({ value: '—', sub: 'sin votación activa' });
  });
  it('tiempo dentro', () => {
    const now = new Date('2026-10-15T15:00:00Z');
    expect(elapsedSince('2026-10-15T14:48:00Z', now)).toBe('12 min');
    expect(elapsedSince('2026-10-15T13:40:00Z', now)).toBe('1 h 20');
  });
  it('fecha y porcentaje', () => {
    expect(todayEyebrow(new Date(2026, 9, 15, 10, 42))).toBe('JUEVES 15 OCT 2026 · 10:42');
    expect(pct(138, 160)).toBe(86);
    expect(pct(1, 0)).toBe(0);
  });
});
