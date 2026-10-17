import { describe, expect, it } from 'vitest';
import { canViewPublicResult, closedVotingLabel, initialsOf, publicVoteErrorMessage, publicVotingRowState, resultsFromBackend, sortPublicVotings, unitFloor } from './public-flow';

describe('publicVoteErrorMessage', () => {
  it('403 sin asistencia', () => {
    expect(publicVoteErrorMessage(403, 'Tu unidad no tiene asistencia registrada para esta votación')).toMatch(/no tiene asistencia/);
  });
  it('403 votación cerrada', () => {
    expect(publicVoteErrorMessage(403, 'Votación inactiva')).toMatch(/ya no está abierta/);
  });
  it('409 ya votó', () => {
    expect(publicVoteErrorMessage(409, 'Ya has emitido tu voto')).toMatch(/ya votó/);
  });
  it('400 unidad u opción ajena', () => {
    expect(publicVoteErrorMessage(400, 'La opción o la unidad no corresponden a esta votación')).toMatch(/no corresponden/);
  });
  it('otros: usa el mensaje del back o uno genérico', () => {
    expect(publicVoteErrorMessage(500, 'Falla X')).toBe('Falla X');
    expect(publicVoteErrorMessage(undefined, null)).toMatch(/No se pudo registrar/);
  });
});

describe('resultsFromBackend', () => {
  const options = [
    { id: 191, text: 'Sí' },
    { id: 192, text: 'No' },
    { id: 193, text: 'Abstención' },
  ];
  it('usa percentage_by_coefficient del back y calcula pendiente y participación', () => {
    const r = resultsFromBackend(
      options,
      [
        { voting_option_id: 191, option_text: 'Sí', vote_count: 2, percentage_by_coefficient: 35 },
        { voting_option_id: 192, option_text: 'No', vote_count: 1, percentage_by_coefficient: 20 },
      ],
      6
    );
    expect(r.segments.map((s) => [s.label, s.pct, s.votes])).toEqual([['Sí', 35, 2], ['No', 20, 1], ['Abstención', 0, 0]]);
    expect(r.participation).toBe(55);
    expect(r.pending).toEqual({ pct: 45, votes: 3, coef: 45 });
    expect(r.segments[0].color).toBe('#1f8a4c');
  });
  it('sin resultados todo queda pendiente', () => {
    const r = resultsFromBackend(options, null, 4);
    expect([r.participation, r.pending.pct, r.pending.votes]).toEqual([0, 100, 4]);
  });
});

describe('lista pública (R2)', () => {
  const v = (id: number, is_active: boolean, has_voted: boolean, display_order: number) => ({ id, is_active, has_voted, display_order });
  it('estado de cada fila', () => {
    expect(publicVotingRowState(v(1, true, false, 1))).toBe('open');
    expect(publicVotingRowState(v(1, true, true, 1))).toBe('voted');
    expect(publicVotingRowState(v(1, false, false, 1))).toBe('closed');
  });
  it('la abierta sin votar va primero', () => {
    expect(sortPublicVotings([v(1, false, false, 1), v(2, true, true, 2), v(3, true, false, 3)]).map((x) => x.id)).toEqual([3, 1, 2]);
  });
});

describe('ayudas de la identificación (R1)', () => {
  it('deduce el piso del número de unidad', () => {
    expect(unitFloor('T2-804')).toBe(8);
    expect(unitFloor('1203')).toBe(12);
    expect(unitFloor('T1-12')).toBeNull();
    expect(unitFloor('Casa A')).toBeNull();
  });
  it('iniciales del residente', () => {
    expect(initialsOf('María Fernanda Ruiz')).toBe('MF');
    expect(initialsOf('')).toBe('');
  });
});

describe('ver resultado de una votación (R2)', () => {
  const row = (is_active: boolean, has_voted: boolean, votes_count: number) => ({ id: 1, is_active, has_voted, display_order: 1, votes_count });

  it('si la unidad ya votó se puede ver, abierta o cerrada', () => {
    expect(canViewPublicResult(row(true, true, 3))).toBe(true);
    expect(canViewPublicResult(row(false, true, 3))).toBe(true);
  });

  it('cerrada con votos se puede ver aunque la unidad no haya votado', () => {
    expect(canViewPublicResult(row(false, false, 5))).toBe(true);
  });

  it('abierta sin votar, o cerrada sin votos, no', () => {
    expect(canViewPublicResult(row(true, false, 5))).toBe(false);
    expect(canViewPublicResult(row(false, false, 0))).toBe(false);
    expect(canViewPublicResult({ id: 1, is_active: false, has_voted: false, display_order: 1 })).toBe(false);
  });

  it('la etiqueta de una no abierta dice "Cerrada" si ya tuvo votos', () => {
    expect(closedVotingLabel(row(false, false, 2))).toBe('Cerrada');
    expect(closedVotingLabel(row(false, false, 0))).toBe('No abierta');
  });
});
