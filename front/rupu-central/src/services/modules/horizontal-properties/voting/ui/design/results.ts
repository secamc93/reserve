/**
 * Cálculo de resultados por coeficiente para las vistas del rediseño.
 * Solo transforma datos que ya trae la UI (no hace peticiones).
 */

import { buildOptionPalette, type PaletteOption, type ResultSegment } from './tokens';

export interface ResultUnitInput {
  hasVoted: boolean;
  /** Coeficiente de participación de la unidad (sobre 100). */
  coef: number;
  optionId?: number | null;
  optionText?: string | null;
}

export interface CoefficientResults {
  /** Un segmento por opción, en el orden recibido. */
  segments: ResultSegment[];
  pending: { pct: number; votes: number; coef: number };
  /** Participación por coeficiente (100 - pendiente). */
  participation: number;
  votedUnits: number;
  totalUnits: number;
}

const norm = (value?: string | null) =>
  (value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();

/**
 * Suma coeficientes por opción. El total de coeficientes del conjunto es 100,
 * por lo que la suma de coeficientes es directamente el % legal.
 */
export function computeCoefficientResults(options: PaletteOption[], units: ResultUnitInput[]): CoefficientResults {
  const palette = buildOptionPalette(options);
  const segments: ResultSegment[] = options.map((option) => ({
    key: String(option.id),
    label: option.text,
    color: palette.byId(option.id) || palette.forText(option.text, option.color),
    pct: 0,
    votes: 0,
    coef: 0,
  }));

  let pendingCoef = 0;
  let pendingVotes = 0;
  let votedUnits = 0;

  units.forEach((unit) => {
    const coef = Number.isFinite(unit.coef) ? unit.coef : 0;
    if (!unit.hasVoted) {
      pendingCoef += coef;
      pendingVotes += 1;
      return;
    }
    votedUnits += 1;
    const index =
      unit.optionId != null
        ? options.findIndex((o) => o.id === unit.optionId)
        : options.findIndex((o) => norm(o.text) === norm(unit.optionText));
    if (index === -1) return;
    segments[index].votes += 1;
    segments[index].coef += coef;
  });

  segments.forEach((s) => {
    s.pct = Math.max(0, s.coef);
  });

  const pendingPct = Math.max(0, pendingCoef);
  const participation = Math.max(0, Math.min(100, 100 - pendingPct));

  return {
    segments,
    pending: { pct: pendingPct, votes: pendingVotes, coef: pendingCoef },
    participation,
    votedUnits,
    totalUnits: units.length,
  };
}
