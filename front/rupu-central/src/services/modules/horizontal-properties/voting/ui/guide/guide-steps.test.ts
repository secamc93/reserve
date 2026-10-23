import { describe, expect, it } from 'vitest';
import { guideSteps, nextStep, type GuideFacts } from './guide-steps';

const facts = (over: Partial<GuideFacts> = {}): GuideFacts => ({ groups: 0, votings: 0, presentUnits: 0, dayCovered: false, closedVotings: 0, ...over });

describe('guideSteps', () => {
  it('sin asambleas el siguiente paso es crear la asamblea', () => {
    expect(nextStep(guideSteps(facts()))?.key).toBe('create-group');
  });

  it('marca los pasos hechos según los datos y avanza al primero pendiente', () => {
    const steps = guideSteps(facts({ groups: 1, votings: 2, presentUnits: 0, dayCovered: true }));
    expect(steps.filter((s) => s.done).map((s) => s.key)).toEqual(['create-group', 'add-voting', 'cover-day']);
    expect(nextStep(steps)?.key).toBe('attendance');
  });

  it('con todo hecho no hay siguiente paso', () => {
    expect(nextStep(guideSteps(facts({ groups: 1, votings: 1, presentUnits: 3, dayCovered: true, closedVotings: 1 })))).toBeNull();
  });

  it('cada paso tiene su video', () => {
    expect(guideSteps(facts()).map((s) => s.video)).toEqual(['crear-asamblea', 'agregar-votaciones', 'asistencia-y-qr', 'dias-de-votacion', 'votacion-en-vivo']);
  });
});
