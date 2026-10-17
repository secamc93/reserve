/**
 * Cálculo de resultados por coeficiente para las vistas del rediseño.
 * Solo transforma datos que ya trae la UI (no hace peticiones).
 */

import { buildOptionPalette, type PaletteOption, type ResultSegment } from './tokens';

export interface ResultUnitInput {
  hasVoted: boolean;
  /** Coeficiente de participación de la unidad (fracción o porcentaje: se normaliza por el total). */
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
 * Suma coeficientes por opción y los expresa como % del total de coeficientes del conjunto.
 * Los coeficientes pueden venir como fracción (suman 1, como documenta la API) o como
 * porcentaje (suman 100): se normaliza por el total real, así el resultado es el % legal en
 * ambos casos.
 */
export function computeCoefficientResults(options: PaletteOption[], units: ResultUnitInput[]): CoefficientResults {
  const palette = buildOptionPalette(options);
  const segments: ResultSegment[] = options.map((option) => ({
    key: String(option.id),
    label: option.text,
    color: palette.byId(option.id) || palette.forText(option.text, option.color),
    pct: 0,
    pctOfVoted: 0,
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

  const totalCoef = segments.reduce((sum, s) => sum + s.coef, 0) + pendingCoef;
  const toPct = (coef: number) => (totalCoef > 0 ? Math.max(0, (coef / totalCoef) * 100) : 0);

  // % sobre lo votado: el coeficiente de cada opción sobre el de las unidades que ya votaron.
  const votedCoef = totalCoef - pendingCoef;
  segments.forEach((s) => {
    s.pct = toPct(s.coef);
    s.pctOfVoted = votedCoef > 0 ? Math.max(0, (s.coef / votedCoef) * 100) : 0;
  });

  const pendingPct = toPct(pendingCoef);
  const participation = totalCoef > 0 ? Math.max(0, Math.min(100, 100 - pendingPct)) : 0;

  return {
    segments,
    pending: { pct: pendingPct, votes: pendingVotes, coef: pendingCoef },
    participation,
    votedUnits,
    totalUnits: units.length,
  };
}
