import { describe, expect, it } from 'vitest';
import { getGroupStatus, getVerdict, getVotingStatus, toBackendVotingType, formatDateRange } from './status';
import type { ResultSegment } from './tokens';

const now = new Date('2026-10-14T20:00:00-05:00');
const group = (start: string, end: string, isActive = true) => ({ isActive, votingStartDate: start, votingEndDate: end });

describe('getGroupStatus', () => {
  it('está Activa dentro del periodo', () => {
    expect(getGroupStatus(group('2026-10-14T18:00:00-05:00', '2026-10-15T22:00:00-05:00'), now).label).toBe('Activa');
  });
  it('está Cerrada cuando pasó la fecha de fin, aunque siga activa', () => {
    expect(getGroupStatus(group('2026-03-22T08:00:00-05:00', '2026-03-22T18:00:00-05:00'), now).key).toBe('closed');
  });
  it('está Programada si aún no empieza', () => {
    expect(getGroupStatus(group('2026-10-20T08:00:00-05:00', '2026-10-21T08:00:00-05:00'), now).label).toBe('Programada');
  });
  it('está Inactiva si el grupo se desactivó dentro del periodo', () => {
    expect(getGroupStatus(group('2026-10-14T18:00:00-05:00', '2026-10-15T22:00:00-05:00', false), now).label).toBe('Inactiva');
  });
});

describe('getVotingStatus', () => {
  it('abierta -> Activa con botón "En vivo"', () => {
    const s = getVotingStatus({ isActive: true, optionsCount: 3, votedUnits: 10 });
    expect([s.label, s.action, s.primary]).toEqual(['Activa', 'En vivo', true]);
  });
  it('cerrada sin opciones -> Borrador / Configurar', () => {
    const s = getVotingStatus({ isActive: false, optionsCount: 0, votedUnits: 0 });
    expect([s.label, s.action]).toEqual(['Borrador', 'Configurar']);
  });
  it('cerrada con votos -> Cerrada / Ver acta', () => {
    const s = getVotingStatus({ isActive: false, optionsCount: 3, votedUnits: 4 });
    expect([s.label, s.action]).toEqual(['Cerrada', 'Ver acta']);
  });
  it('cerrada con opciones y sin votos -> Lista / Iniciar', () => {
    const s = getVotingStatus({ isActive: false, optionsCount: 3, votedUnits: 0 });
    expect([s.label, s.action]).toEqual(['Lista', 'Iniciar']);
  });
  it('mientras cargan las opciones no la marca como borrador', () => {
    expect(getVotingStatus({ isActive: false, optionsCount: null, votedUnits: null }).key).toBe('ready');
  });
});

const seg = (label: string, pct: number, votes: number, color = '#000'): ResultSegment => ({ key: label, label, pct, votes, coef: pct, color });

describe('getVerdict', () => {
  it('sin votos', () => {
    expect(getVerdict([seg('Sí', 0, 0), seg('No', 0, 0)], 0, 51).label).toBe('SIN VOTOS');
  });
  it('gana Sí con quórum -> APROBADA', () => {
    const v = getVerdict([seg('Sí', 40, 48), seg('No', 18, 22), seg('Abstención', 7, 8)], 65, 51);
    expect([v.label, v.approved]).toEqual(['APROBADA', true]);
  });
  it('gana No -> NO APROBADA', () => {
    expect(getVerdict([seg('Sí', 20, 2), seg('No', 40, 5)], 60, 51).label).toBe('NO APROBADA');
  });
  it('participación bajo el quórum -> SIN QUÓRUM aunque gane Sí', () => {
    const v = getVerdict([seg('Sí', 30, 3), seg('No', 10, 1)], 40, 51);
    expect([v.label, v.approved]).toEqual(['SIN QUÓRUM', false]);
  });
  it('opción personalizada ganadora -> GANA: <opción>', () => {
    expect(getVerdict([seg('Plancha A', 55, 6), seg('Plancha B', 20, 2)], 75, 51).label).toBe('GANA: PLANCHA A');
  });
});

describe('tipos y fechas', () => {
  it('solo propone tipos que acepta el back', () => {
    expect(toBackendVotingType('majority')).toBe('majority');
    expect(toBackendVotingType('multiple')).toBe('simple');
    expect(toBackendVotingType(undefined)).toBe('simple');
  });
  it('rango de fechas compacto', () => {
    expect(formatDateRange('2026-10-14T18:00:00-05:00', '2026-10-15T22:00:00-05:00')).toMatch(/14 oct 2026 → 15 oct 2026/);
  });
});
