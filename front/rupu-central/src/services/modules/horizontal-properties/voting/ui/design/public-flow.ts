/**
 * Flujo del residente desde el QR (R1–R4): mensajes de error del voto
 * público y resultados a partir de lo que devuelve el back. Lógica pura.
 */

import { buildOptionPalette, type PaletteOption, type ResultSegment } from './tokens';
import type { CoefficientResults } from './results';

/**
 * Mensaje claro para el residente según la respuesta de `POST /public/vote`:
 *  - 403: la unidad no tiene asistencia (o la votación ya no está abierta);
 *  - 409: la unidad ya votó;
 *  - 400: la unidad o la opción no corresponden a la votación;
 *  - 401: el enlace/sesión de votación expiró.
 */
export function publicVoteErrorMessage(status?: number, backendMessage?: string | null): string {
  const message = (backendMessage || '').toLowerCase();
  switch (status) {
    case 403:
      if (message.includes('inactiva')) return 'Esta votación ya no está abierta. Vuelve a la lista de puntos.';
      if (message.includes('no válida') || message.includes('no pertenece')) {
        return 'Esta votación no pertenece a tu asamblea. Vuelve a la lista de puntos.';
      }
      return 'Tu unidad no tiene asistencia registrada. Acércate a la mesa de registro para que la marquen y vuelve a intentarlo.';
    case 409:
      return 'Tu unidad ya votó en este punto. El voto es definitivo.';
    case 400:
      return 'La opción o la unidad no corresponden a esta votación. Recarga la página e inténtalo de nuevo.';
    case 401:
      return 'Tu sesión de votación expiró. Escanea el código QR de nuevo.';
    default:
      return backendMessage || 'No se pudo registrar el voto. Intenta de nuevo.';
  }
}

/** Resultado por opción tal como lo devuelve el back (voting-info / SSE). */
export interface BackendOptionResult {
  voting_option_id: number;
  option_text: string;
  vote_count: number;
  /** % sobre el total de coeficientes de la propiedad (el % legal). */
  percentage_by_coefficient?: number | null;
}

/**
 * Convierte los resultados del back en el formato de las vistas (barra, filas).
 * Usa `percentage_by_coefficient` del back (no recalcula en el front).
 * `totalUnits` es el número de unidades de la propiedad (para "pendiente · N un.").
 */
export function resultsFromBackend(
  options: PaletteOption[],
  results: BackendOptionResult[] | null | undefined,
  totalUnits: number
): CoefficientResults {
  const palette = buildOptionPalette(options);
  const byOption = new Map((results || []).map((r) => [r.voting_option_id, r]));
  const segments: ResultSegment[] = options.map((option) => {
    const r = byOption.get(option.id);
    const pct = Math.max(0, Number(r?.percentage_by_coefficient ?? 0) || 0);
    return {
      key: String(option.id),
      label: option.text,
      color: palette.byId(option.id) || palette.forText(option.text, option.color),
      pct,
      votes: r?.vote_count ?? 0,
      coef: pct,
    };
  });
  const votedPct = Math.min(100, segments.reduce((sum, s) => sum + s.pct, 0));
  const votedUnits = segments.reduce((sum, s) => sum + s.votes, 0);
  const pendingVotes = Math.max(0, totalUnits - votedUnits);
  return {
    segments,
    pending: { pct: Math.max(0, 100 - votedPct), votes: pendingVotes, coef: Math.max(0, 100 - votedPct) },
    participation: votedPct,
    votedUnits,
    totalUnits: Math.max(totalUnits, votedUnits),
  };
}

/** Votación del grupo como la lista el back público (R2). */
export interface PublicGroupVotingLike {
  id: number;
  is_active: boolean;
  has_voted: boolean;
  display_order: number;
}

export type PublicVotingRowState = 'open' | 'voted' | 'closed';

/** Estado de una fila de R2: abierta (se puede votar), ya votada o no abierta. */
export function publicVotingRowState(voting: PublicGroupVotingLike): PublicVotingRowState {
  if (voting.has_voted) return 'voted';
  return voting.is_active ? 'open' : 'closed';
}

/** Votaciones ordenadas: primero las abiertas sin votar, luego por orden del día. */
export function sortPublicVotings<T extends PublicGroupVotingLike>(votings: T[]): T[] {
  const rank = (v: T) => (publicVotingRowState(v) === 'open' ? 0 : 1);
  return [...votings].sort((a, b) => rank(a) - rank(b) || a.display_order - b.display_order);
}

/**
 * Piso de una unidad a partir de su número ("T2-804" -> 8, "1203" -> 12).
 * Solo si el número tiene 3 o más dígitos al final; si no, null.
 */
export function unitFloor(unitNumber: string): number | null {
  const match = (unitNumber || '').match(/(\d{3,})\s*$/);
  if (!match) return null;
  const floor = Math.floor(Number(match[1]) / 100);
  return floor > 0 ? floor : null;
}

/** Iniciales para el avatar del residente ("María Fernanda Ruiz" -> "MF"). */
export const initialsOf = (name: string) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
