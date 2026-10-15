import { describe, expect, it } from 'vitest';
import {
  defaultOptions,
  draftFromVoting,
  emptyVotingDraft,
  hasDraftErrors,
  makeOptionDraft,
  planOptionChanges,
  suggestOptionCode,
  validateVotingDraft,
  type VotingDraft,
} from './voting-form';

const valid = (patch: Partial<VotingDraft> = {}): VotingDraft => ({
  ...emptyVotingDraft(),
  title: 'Reglamento de parqueaderos',
  description: 'Lo que verán los residentes',
  ...patch,
});

describe('suggestOptionCode', () => {
  it('usa SI / NO / ABS para las opciones estándar', () => {
    expect(['Sí', 'No', 'Abstención'].map(suggestOptionCode)).toEqual(['SI', 'NO', 'ABS']);
  });
  it('deriva el código del texto sin tildes y con máximo 20 caracteres', () => {
    expect(suggestOptionCode('Plancha Única del Consejo de Administración')).toBe('PLANCHA_UNICA_DEL_CO');
  });
});

describe('defaultOptions', () => {
  it('incluye Abstención solo si está permitida', () => {
    expect(defaultOptions(true).map((o) => o.text)).toEqual(['Sí', 'No', 'Abstención']);
    expect(defaultOptions(false).map((o) => o.text)).toEqual(['Sí', 'No']);
  });
  it('usa los colores semánticos del diseño', () => {
    expect(defaultOptions(true).map((o) => o.color)).toEqual(['#1f8a4c', '#c8382d', '#8a8580']);
  });
});

describe('validateVotingDraft', () => {
  it('un borrador completo no tiene errores', () => {
    expect(hasDraftErrors(validateVotingDraft(valid()))).toBe(false);
  });
  it('exige título de 3+ caracteres y descripción', () => {
    const errors = validateVotingDraft(valid({ title: 'ab', description: '  ' }));
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
  });
  it('el % requerido debe estar entre 1 y 100', () => {
    expect(validateVotingDraft(valid({ requiredPercentage: '0' })).requiredPercentage).toBeDefined();
    expect(validateVotingDraft(valid({ requiredPercentage: '101' })).requiredPercentage).toBeDefined();
    expect(validateVotingDraft(valid({ requiredPercentage: '66,7' })).requiredPercentage).toBeUndefined();
  });
  it('permite guardar sin opciones (queda como borrador) pero no con una sola', () => {
    expect(hasDraftErrors(validateVotingDraft(valid({ options: [] })))).toBe(false);
    expect(validateVotingDraft(valid({ options: [makeOptionDraft('Sí', 0)] })).options).toMatch(/al menos dos/);
  });
  it('marca códigos repetidos y opciones sin texto', () => {
    const [si, no] = defaultOptions(false);
    const errors = validateVotingDraft(valid({ options: [si, { ...no, code: 'si' }, { ...no, key: 'x', text: '' }] }));
    expect(errors.optionRows?.[no.key]).toMatch(/repetido/);
    expect(errors.optionRows?.x).toMatch(/texto/);
  });
  it('no deja una opción de abstención si la abstención no está permitida', () => {
    const options = defaultOptions(true);
    const errors = validateVotingDraft(valid({ allowAbstention: false, options }));
    expect(errors.optionRows?.[options[2].key]).toBe('Quita esta opción o marca "Permitir abstención"');
    expect(errors.optionRows?.[options[0].key]).toBeUndefined();
    expect(hasDraftErrors(validateVotingDraft(valid({ allowAbstention: true, options })))).toBe(false);
  });
  it('valida el color hexadecimal', () => {
    const [si, no] = defaultOptions(false);
    expect(validateVotingDraft(valid({ options: [si, { ...no, color: 'rojo' }] })).optionRows?.[no.key]).toMatch(/hexadecimal/);
  });
});

describe('planOptionChanges', () => {
  const existing = [
    { id: 1, optionText: 'Sí', optionCode: 'SI', color: '#1f8a4c', isActive: true },
    { id: 2, optionText: 'No', optionCode: 'NO', color: '#c8382d', isActive: true },
    { id: 3, optionText: 'Abstención', optionCode: 'ABS', color: '#8a8580', isActive: true },
  ];
  const draft = draftFromVoting(
    { title: 'Presupuesto', description: 'd', votingType: 'majority', requiredPercentage: 51, allowAbstention: true, isSecret: false },
    existing
  );

  it('sin cambios no pide nada al back', () => {
    expect(planOptionChanges(existing, draft.options)).toEqual({ create: [], remove: [], toggle: [] });
  });
  it('crea las nuevas con su orden, borra las quitadas y cambia el estado de las desactivadas', () => {
    const options = [
      draft.options[0],
      { ...draft.options[1], isActive: false },
      makeOptionDraft('En blanco', 2),
    ];
    const plan = planOptionChanges(existing, options);
    expect(plan.remove).toEqual([3]);
    expect(plan.toggle).toEqual([{ id: 2, isActive: false }]);
    expect(plan.create.map((o) => [o.text, o.displayOrder])).toEqual([['En blanco', 3]]);
  });
  it('conserva el tipo "majority" del back al editar', () => {
    expect(draft.votingType).toBe('majority');
  });
});
