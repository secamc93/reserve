/**
 * Formulario "Nueva votación con sus opciones" (A3): borrador, validación y
 * plan de cambios de opciones. Lógica pura (sin red) para poder probarla.
 */

import { getOptionKind, resolveOptionColor } from './tokens';
import { toBackendVotingType, type BackendVotingType } from './status';

export interface OptionDraft {
  /** Clave estable en la UI (no es el id del back). */
  key: string;
  /** Id del back si la opción ya existe. */
  id?: number;
  text: string;
  code: string;
  color: string;
  isActive?: boolean;
}

export interface VotingDraft {
  title: string;
  description: string;
  votingType: BackendVotingType;
  requiredPercentage: string;
  allowAbstention: boolean;
  isSecret: boolean;
  options: OptionDraft[];
}

export type VotingDraftErrors = Partial<Record<'title' | 'description' | 'requiredPercentage' | 'options', string>> & {
  /** Errores por opción, indexados por `key`. */
  optionRows?: Record<string, string>;
};

const HEX = /^#[0-9A-Fa-f]{6}$/;

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();

let keySeq = 0;
/** Clave única para una fila nueva del formulario. */
export const newOptionKey = () => `opt-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;

/** Código sugerido para una opción a partir de su texto (máx. 20 caracteres, sin tildes). */
export function suggestOptionCode(text: string): string {
  const kind = getOptionKind(text);
  if (kind === 'yes') return 'SI';
  if (kind === 'no') return 'NO';
  if (kind === 'abstain') return 'ABS';
  return normalize(text).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20);
}

/** Opción nueva con código y color sugeridos. */
export function makeOptionDraft(text: string, index: number): OptionDraft {
  return {
    key: newOptionKey(),
    text,
    code: suggestOptionCode(text),
    color: resolveOptionColor(text, null, null, index),
    isActive: true,
  };
}

/** Opciones por defecto de una votación nueva: Sí / No (/ Abstención). */
export function defaultOptions(allowAbstention: boolean): OptionDraft[] {
  const texts = allowAbstention ? ['Sí', 'No', 'Abstención'] : ['Sí', 'No'];
  return texts.map((text, i) => makeOptionDraft(text, i));
}

/** Borrador vacío para "Nueva votación". */
export function emptyVotingDraft(): VotingDraft {
  return {
    title: '',
    description: '',
    votingType: 'simple',
    requiredPercentage: '51',
    allowAbstention: true,
    isSecret: false,
    options: defaultOptions(true),
  };
}

/** Borrador a partir de una votación existente y sus opciones. */
export function draftFromVoting(
  voting: {
    title: string;
    description?: string | null;
    votingType?: string | null;
    requiredPercentage?: number | null;
    allowAbstention: boolean;
    isSecret: boolean;
  },
  options: { id: number; optionText: string; optionCode: string; color?: string | null; isActive?: boolean }[]
): VotingDraft {
  return {
    title: voting.title,
    description: voting.description ?? '',
    votingType: toBackendVotingType(voting.votingType),
    requiredPercentage: String(voting.requiredPercentage ?? 51),
    allowAbstention: voting.allowAbstention,
    isSecret: voting.isSecret,
    options: options.map((o, i) => ({
      key: `existing-${o.id}`,
      id: o.id,
      text: o.optionText,
      code: o.optionCode,
      color: o.color && HEX.test(o.color) ? o.color : resolveOptionColor(o.optionText, o.optionCode, null, i),
      isActive: o.isActive ?? true,
    })),
  };
}

/**
 * Valida el borrador con las mismas reglas del back:
 * título 3–200, descripción 1–2000, % requerido en (0, 100], y por opción
 * texto 1–100, código 1–20, color hexadecimal; códigos y textos sin repetir.
 * Si no se permite abstención, no puede haber una opción de abstención.
 * Una votación puede guardarse sin opciones (queda como Borrador).
 */
export function validateVotingDraft(draft: VotingDraft): VotingDraftErrors {
  const errors: VotingDraftErrors = {};
  const title = draft.title.trim();
  if (title.length < 3) errors.title = 'El título debe tener al menos 3 caracteres';
  else if (title.length > 200) errors.title = 'El título no puede exceder 200 caracteres';

  const description = draft.description.trim();
  if (!description) errors.description = 'La descripción es obligatoria (la verán los residentes al votar)';
  else if (description.length > 2000) errors.description = 'La descripción no puede exceder 2000 caracteres';

  const pct = Number(draft.requiredPercentage.replace(',', '.'));
  if (!draft.requiredPercentage.trim() || !Number.isFinite(pct) || pct <= 0 || pct > 100) {
    errors.requiredPercentage = 'El % requerido debe estar entre 1 y 100';
  }

  const rowErrors: Record<string, string> = {};
  const codes = new Map<string, string>();
  const texts = new Map<string, string>();
  draft.options.forEach((option) => {
    const text = option.text.trim();
    const code = option.code.trim();
    if (!text) rowErrors[option.key] = 'Escribe el texto de la opción';
    else if (text.length > 100) rowErrors[option.key] = 'El texto no puede exceder 100 caracteres';
    else if (!code) rowErrors[option.key] = 'Escribe el código de la opción';
    else if (code.length > 20) rowErrors[option.key] = 'El código no puede exceder 20 caracteres';
    else if (!HEX.test(option.color)) rowErrors[option.key] = 'El color debe ser hexadecimal (#1f8a4c)';
    else if (codes.has(normalize(code))) rowErrors[option.key] = `El código ${code.toUpperCase()} está repetido`;
    else if (texts.has(normalize(text))) rowErrors[option.key] = `La opción "${text}" está repetida`;
    else if (!draft.allowAbstention && getOptionKind(text, code) === 'abstain') {
      rowErrors[option.key] = 'Quita esta opción o marca "Permitir abstención"';
    }
    if (code) codes.set(normalize(code), option.key);
    if (text) texts.set(normalize(text), option.key);
  });
  if (Object.keys(rowErrors).length > 0) {
    errors.optionRows = rowErrors;
    errors.options = 'Revisa las opciones marcadas';
  } else if (draft.options.length === 1) {
    errors.options = 'Agrega al menos dos opciones (o ninguna para dejarla como borrador)';
  }
  return errors;
}

export const hasDraftErrors = (errors: VotingDraftErrors) =>
  Object.entries(errors).some(([, value]) => (typeof value === 'string' ? !!value : !!value && Object.keys(value).length > 0));

export interface OptionChangePlan {
  /** Opciones nuevas, con su orden de visualización (1..n según el borrador). */
  create: (OptionDraft & { displayOrder: number })[];
  /** Ids de opciones existentes que se quitaron. */
  remove: number[];
  /** Opciones existentes cuyo estado activo cambió. */
  toggle: { id: number; isActive: boolean }[];
}

/**
 * Qué hay que pedirle al back para que las opciones queden como el borrador.
 * El back no permite editar el texto/código/color de una opción existente:
 * solo crear, borrar o cambiar su estado activo.
 */
export function planOptionChanges(
  existing: { id: number; isActive?: boolean }[],
  drafts: OptionDraft[]
): OptionChangePlan {
  const keptIds = new Set(drafts.filter((d) => d.id != null).map((d) => d.id as number));
  const remove = existing.filter((o) => !keptIds.has(o.id)).map((o) => o.id);
  const toggle = drafts
    .filter((d) => d.id != null)
    .flatMap((d) => {
      const before = existing.find((o) => o.id === d.id);
      const now = d.isActive ?? true;
      return before && (before.isActive ?? true) !== now ? [{ id: d.id as number, isActive: now }] : [];
    });
  const create = drafts
    .map((d, index) => ({ ...d, displayOrder: index + 1 }))
    .filter((d) => d.id == null);
  return { create, remove, toggle };
}
