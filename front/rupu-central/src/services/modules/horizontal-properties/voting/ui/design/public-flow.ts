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
  /** Votos registrados en la votación (todas las unidades). */
  votes_count?: number;
}

export type PublicVotingRowState = 'open' | 'voted' | 'closed';

/**
 * ¿La fila muestra "ver resultado"? Si la unidad ya votó, o si la votación está cerrada y tiene
 * votos. Abierta y sin votar no: primero se vota (ver resultados antes podría sesgar el voto).
 */
export function canViewPublicResult(voting: PublicGroupVotingLike): boolean {
  if (voting.has_voted) return true;
  return !voting.is_active && (voting.votes_count ?? 0) > 0;
}

/** Etiqueta de una votación que no está abierta: "Cerrada" si ya tuvo votos, si no "No abierta". */
export function closedVotingLabel(voting: PublicGroupVotingLike): string {
  return (voting.votes_count ?? 0) > 0 ? 'Cerrada' : 'No abierta';
}

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

// ===================== R1 · Identificación =====================

/** Contexto público (voting-context) con la bandera del grupo, donde sea que venga. */
export interface DocumentRequirementSource {
  require_document_validation?: boolean | null;
  voting_group?: { require_document_validation?: boolean | null } | null;
}

/**
 * ¿El grupo exige el documento (cédula) para votar? Es una configuración del grupo
 * (`require_document_validation`). Si el back no la manda (versión anterior), es false.
 */
export function requiresDocument(context: DocumentRequirementSource | null | undefined): boolean {
  return context?.require_document_validation === true || context?.voting_group?.require_document_validation === true;
}

/**
 * ¿El grupo exige la contraseña de la credencial impresa? El back la exige desde que se generan
 * contraseñas para el grupo (`require_password` en voting-context).
 */
export function requiresPassword(context: { require_password?: boolean | null } | null | undefined): boolean {
  return context?.require_password === true;
}

/** Contraseña como se guarda: sin espacios y en mayúsculas. */
export const normalizePassword = (password: string) => password.replace(/\s+/g, '').toUpperCase();

/** Validación local de R1 antes de llamar al back; null si se puede continuar. */
export function identificationError(input: {
  hasUnit: boolean;
  dni: string;
  requireDocument: boolean;
  password?: string;
  requirePassword?: boolean;
}): string | null {
  if (!input.hasUnit) return 'Elige tu unidad de la lista';
  if (input.requireDocument && !input.dni.trim()) return 'Escribe tu documento de identidad';
  if (input.requirePassword && !normalizePassword(input.password ?? '')) return 'Escribe la contraseña de tu credencial';
  return null;
}

/**
 * Cuerpo de `POST /public/validate-resident`: el documento y la contraseña solo viajan si el
 * grupo los exige.
 */
export function validateResidentPayload(input: {
  propertyUnitId: number;
  dni: string;
  requireDocument: boolean;
  password?: string;
  requirePassword?: boolean;
}): {
  propertyUnitId: number;
  dni?: string;
  password?: string;
} {
  const payload: { propertyUnitId: number; dni?: string; password?: string } = { propertyUnitId: input.propertyUnitId };
  const dni = input.dni.trim();
  if (input.requireDocument && dni) payload.dni = dni;
  const password = normalizePassword(input.password ?? '');
  if (input.requirePassword && password) payload.password = password;
  return payload;
}

/**
 * Qué mostrar cuando `validate-resident` falla:
 *  - 400 "Documento requerido" sin documento enviado: el grupo lo exige (o se activó después
 *    de abrir R1) -> se muestra el campo de documento; 400 "Unidad inactiva";
 *  - 404 "Residente no encontrado": la unidad y el documento no coinciden;
 *    404 "Unidad no encontrada": la unidad no es de la propiedad;
 *  - 403: residente inactivo; 401: el enlace venció.
 */
export function validateResidentFailure(
  status: number | undefined,
  backendMessage: string | null | undefined,
  sentDocument: boolean
): { message: string; requireDocument: boolean; requirePassword?: boolean } {
  const message = (backendMessage || '').toLowerCase();
  if (message.includes('contraseña')) {
    if (status === 400) {
      return { message: 'Escribe la contraseña de tu credencial impresa.', requireDocument: sentDocument, requirePassword: true };
    }
    return {
      message: 'La contraseña no coincide con la de tu unidad. Revisa tu credencial impresa.',
      requireDocument: sentDocument,
      requirePassword: true,
    };
  }
  if (status === 400 && !sentDocument && message.includes('documento')) {
    return { message: 'Este grupo exige tu documento de identidad. Escríbelo para continuar.', requireDocument: true };
  }
  switch (status) {
    case 400:
      if (message.includes('inactiva')) {
        return { message: 'Tu unidad está inactiva. Acércate a la mesa de registro.', requireDocument: sentDocument };
      }
      break;
    case 404:
      if (message.includes('unidad')) {
        return { message: 'No encontramos esa unidad en la propiedad. Elígela de la lista.', requireDocument: sentDocument };
      }
      return {
        message: sentDocument
          ? 'No encontramos un residente con ese documento en la unidad. Revisa que la unidad y el documento coincidan con los registrados.'
          : 'No encontramos residentes registrados en esa unidad. Acércate a la mesa de registro.',
        requireDocument: sentDocument,
      };
    case 403:
      return { message: 'El residente de esa unidad está inactivo. Acércate a la mesa de registro.', requireDocument: sentDocument };
    case 401:
      return { message: 'El enlace de votación venció o no es válido. Escanea el código QR de nuevo.', requireDocument: sentDocument };
  }
  switch (status) {
    default:
      return {
        message: `${backendMessage || 'No pudimos validar tus datos'}. ${
          sentDocument ? 'Revisa que la unidad y el documento coincidan con los registrados.' : 'Revisa la unidad elegida.'
        }`,
        requireDocument: sentDocument,
      };
  }
}
