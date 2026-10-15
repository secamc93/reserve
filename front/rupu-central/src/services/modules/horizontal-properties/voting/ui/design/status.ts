/**
 * Estados del flujo de votaciones (diseño "Votaciones - Flujo completo").
 * Lógica pura: deriva el estado visible de un grupo y de una votación a
 * partir de los campos que ya trae la API (no hay campo "estado" en el back).
 */

import { VT, getOptionKind, getWinner, type ResultSegment } from './tokens';

/** Gris neutro para estados sin énfasis (Lista, Cerrada, Inactiva). */
export const NEUTRAL_BADGE = { bg: '#efedea', fg: VT.inkSoft } as const;

export interface StatusBadge {
  key: string;
  label: string;
  bg: string;
  fg: string;
}

// ===================== Grupo =====================

export type GroupStatusKey = 'active' | 'scheduled' | 'closed' | 'inactive';

export interface GroupStatusInput {
  isActive: boolean;
  votingStartDate: string;
  votingEndDate: string;
}

export interface GroupStatus extends StatusBadge {
  key: GroupStatusKey;
}

/**
 * Estado del grupo:
 *  - Cerrada: ya pasó la fecha de fin.
 *  - Inactiva: el grupo está desactivado.
 *  - Programada: aún no empieza.
 *  - Activa: dentro del periodo y activo.
 */
export function getGroupStatus(group: GroupStatusInput, now: Date = new Date()): GroupStatus {
  const start = new Date(group.votingStartDate);
  const end = new Date(group.votingEndDate);
  if (!Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
    return { key: 'closed', label: 'Cerrada', ...NEUTRAL_BADGE };
  }
  if (!group.isActive) {
    return { key: 'inactive', label: 'Inactiva', ...NEUTRAL_BADGE };
  }
  if (!Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) {
    return { key: 'scheduled', label: 'Programada', bg: VT.missingBg, fg: VT.missingFg };
  }
  return { key: 'active', label: 'Activa', bg: VT.reachedBg, fg: VT.reachedFg };
}

// ===================== Votación =====================

export type VotingStatusKey = 'live' | 'draft' | 'ready' | 'closed';

export interface VotingStatusInput {
  isActive: boolean;
  /** Opciones configuradas; null/undefined mientras cargan. */
  optionsCount?: number | null;
  /** Unidades que ya votaron; null/undefined mientras cargan. */
  votedUnits?: number | null;
}

export interface VotingStatus extends StatusBadge {
  key: VotingStatusKey;
  /** Texto del botón principal de la fila. */
  action: string;
  /** El botón principal va relleno (tinta) y con el punto pulsante. */
  primary: boolean;
}

/**
 * Estado de una votación dentro del grupo:
 *  - Activa (En vivo): está abierta.
 *  - Borrador (Configurar): cerrada y sin opciones.
 *  - Cerrada (Ver acta): cerrada y con votos; abre el resultado final (A8).
 *  - Lista (Iniciar): cerrada, con opciones y sin votos.
 */
export function getVotingStatus(voting: VotingStatusInput): VotingStatus {
  if (voting.isActive) {
    return { key: 'live', label: 'Activa', action: 'En vivo', primary: true, bg: VT.reachedBg, fg: VT.reachedFg };
  }
  if (voting.optionsCount === 0) {
    return { key: 'draft', label: 'Borrador', action: 'Configurar', primary: false, bg: VT.missingBg, fg: VT.missingFg };
  }
  if ((voting.votedUnits ?? 0) > 0) {
    return { key: 'closed', label: 'Cerrada', action: 'Ver acta', primary: false, ...NEUTRAL_BADGE };
  }
  return { key: 'ready', label: 'Lista', action: 'Iniciar', primary: false, ...NEUTRAL_BADGE };
}

// ===================== Veredicto (A8) =====================

export interface Verdict {
  label: string;
  color: string;
  /** true aprobada, false no aprobada, null sin decisión (sin votos). */
  approved: boolean | null;
}

/**
 * Veredicto de una votación cerrada:
 *  - sin votos: "SIN VOTOS";
 *  - participación por coeficiente bajo el quórum: "SIN QUÓRUM";
 *  - gana Sí: "APROBADA"; gana No/Abstención: "NO APROBADA";
 *  - otras opciones (p. ej. elecciones): "GANA: <opción>".
 */
export function getVerdict(segments: ResultSegment[], participation: number, quorum: number): Verdict {
  const winner = getWinner(segments);
  if (!winner) return { label: 'SIN VOTOS', color: VT.muted, approved: null };
  if (participation < quorum) return { label: 'SIN QUÓRUM', color: VT.missingFg, approved: false };
  const kind = getOptionKind(winner.label);
  if (kind === 'yes') return { label: 'APROBADA', color: VT.yes, approved: true };
  if (kind === 'no' || kind === 'abstain') return { label: 'NO APROBADA', color: VT.no, approved: false };
  return { label: `GANA: ${winner.label.toUpperCase()}`, color: winner.color, approved: true };
}

// ===================== Tipos de votación =====================

/** Tipos que acepta el back (`oneof=simple majority unanimity`). */
export const VOTING_TYPE_OPTIONS = [
  { value: 'simple', label: 'Simple' },
  { value: 'majority', label: 'Mayoría' },
  { value: 'unanimity', label: 'Unanimidad' },
] as const;

export type BackendVotingType = (typeof VOTING_TYPE_OPTIONS)[number]['value'];

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple',
  majority: 'Mayoría',
  unanimity: 'Unanimidad',
  multiple: 'Múltiple',
  weighted: 'Ponderada',
};

export const votingTypeLabel = (type?: string | null) => (type ? TYPE_LABELS[type] ?? type : '—');

/** Tipo editable: si la votación trae uno que el back ya no acepta, se propone "simple". */
export const toBackendVotingType = (type?: string | null): BackendVotingType =>
  VOTING_TYPE_OPTIONS.some((o) => o.value === type) ? (type as BackendVotingType) : 'simple';

// ===================== Fechas =====================

const dayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
const shortDayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

const clean = (value: string) => value.replace(/\./g, '').replace(/\s+de\s+/g, ' ');

/** "14 oct 2026" */
export function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : clean(dayFormatter.format(date));
}

/** "15 oct 22:00" */
export function formatDayTime(date: Date): string {
  if (Number.isNaN(date.getTime())) return '—';
  return `${clean(shortDayFormatter.format(date))} ${timeFormatter.format(date)}`;
}

/** "14 oct 2026 → 15 oct 2026" (un solo día si coinciden). */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = formatDay(startIso);
  const end = formatDay(endIso);
  return start === end ? start : `${start} → ${end}`;
}
