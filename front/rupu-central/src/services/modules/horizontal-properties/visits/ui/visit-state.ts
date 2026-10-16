/**
 * Lógica pura de presentación de visitas ("PH - Visitas y Paquetes", V1–V4): estado de
 * portería, acciones permitidas, etiquetas de unidad, horas y línea de tiempo.
 *
 * Convención de horas del back:
 *  - scheduled_date / scheduled_start_time / scheduled_end_time guardan la hora de pared
 *    tal cual se escribió, marcada como UTC ("2026-10-15T09:00:00Z" = 9:00 a. m. en la
 *    portería). Se muestran en UTC.
 *  - actual_entry_time / actual_exit_time / created_at son instantes reales: se muestran en
 *    hora de Colombia.
 */

import type { VisitListDTO, VisitState } from '../domain';

export const PROPERTY_TZ = 'America/Bogota';

// ===================== Estado de portería =====================

export const VISIT_STATE_ORDER: VisitState[] = ['inside', 'expected', 'left', 'cancelled'];

/** Color del texto y del punto de cada estado (diseño V1). */
export const VISIT_STATE_META: Record<VisitState, { label: string; chip: string; color: string; dot: string }> = {
  inside: { label: 'Dentro', chip: 'Dentro', color: '#1f8a4c', dot: '#1f8a4c' },
  expected: { label: 'Esperada', chip: 'Esperadas', color: '#4b4a46', dot: '#c9c6c0' },
  left: { label: 'Salió', chip: 'Salieron', color: '#8a8580', dot: '#8a8580' },
  cancelled: { label: 'Cancelada', chip: 'Canceladas', color: '#c8382d', dot: '#c8382d' },
};

/** Terracota de "excede tiempo". */
export const EXCEEDS_COLOR = '#c8603f';

const CODE_TO_STATE: Record<string, VisitState> = {
  in_progress: 'inside',
  pending: 'expected',
  authorized: 'expected',
  completed: 'left',
  cancelled: 'cancelled',
  rejected: 'cancelled',
  expired: 'cancelled',
};

type StateInput = Pick<VisitListDTO, 'visitStatusCode' | 'visitStatusName' | 'actualEntryTime' | 'actualExitTime'>;

/** Estado de portería de una visita (por código; si no llega, por nombre y horas reales). */
export function visitStateOf(v: StateInput): VisitState {
  const byCode = v.visitStatusCode ? CODE_TO_STATE[v.visitStatusCode] : undefined;
  if (byCode) return byCode;
  const name = (v.visitStatusName || '').toLowerCase();
  if (/cancel|rechaz|reject|expir|venc/.test(name)) return 'cancelled';
  if (v.actualExitTime || /complet/.test(name)) return 'left';
  if (v.actualEntryTime || /curso|progress/.test(name)) return 'inside';
  return 'expected';
}

/** Estado a mostrar: "Excede tiempo" (terracota) gana sobre "Dentro". */
export function visitStatusDisplay(v: StateInput & Partial<Pick<VisitListDTO, 'exceedsTime'>>): { label: string; color: string; dot: string; exceeds: boolean } {
  const state = visitStateOf(v);
  if (state === 'inside' && v.exceedsTime) return { label: 'Excede tiempo', color: EXCEEDS_COLOR, dot: EXCEEDS_COLOR, exceeds: true };
  const m = VISIT_STATE_META[state];
  return { label: m.label, color: m.color, dot: m.dot, exceeds: false };
}

export interface VisitActions {
  canEnter: boolean;
  canExit: boolean;
  canCancel: boolean;
  canEdit: boolean;
}

/** Acciones de portería permitidas según el estado. */
export function visitActions(v: StateInput): VisitActions {
  const state = visitStateOf(v);
  return {
    canEnter: state === 'expected',
    canExit: state === 'inside',
    canCancel: state === 'expected',
    canEdit: state === 'expected',
  };
}

// ===================== Unidad =====================

/** "Casa 126" (bloque + número); sin bloque, "Unidad 126". Nunca el id. */
export function unitLabel(block: string | null | undefined, number: string | null | undefined): string {
  const n = (number ?? '').trim();
  const b = (block ?? '').trim();
  if (!n) return b || 'Sin unidad';
  return b ? `${b} ${n}` : `Unidad ${n}`;
}

// ===================== Fechas y horas =====================

function valid(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Hora de pared programada ("09:00"), leída en UTC. */
export function formatWallTime(iso?: string | null): string {
  const d = valid(iso);
  if (!d) return '';
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
}

/** Día programado ("jue 15 oct"), leído en UTC. */
export function formatWallDay(iso?: string | null): string {
  const d = valid(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(/\./g, '');
}

/** Hora real en Colombia ("14:32"). */
export function formatClock(iso?: string | null): string {
  const d = valid(iso);
  if (!d) return '';
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: PROPERTY_TZ });
}

/** Fecha y hora real en Colombia ("15 oct, 14:32"). */
export function formatDateTime(iso?: string | null): string {
  const d = valid(iso);
  if (!d) return '';
  const day = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: PROPERTY_TZ }).replace(/\./g, '');
  return `${day}, ${formatClock(iso)}`;
}

/** Minutos enteros entre dos instantes (0 si falta alguno o es negativo). */
export function minutesBetween(fromIso?: string | null, to: Date | string = new Date()): number {
  const a = valid(fromIso);
  const b = typeof to === 'string' ? valid(to) : to;
  if (!a || !b) return 0;
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 60000));
}

/** "45 min", "2 h", "1 h 12" (diseño: "promedio 1 h 12"). */
export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${String(rest).padStart(2, '0')}`;
}

/** Documento con separador de miles: "79456123" → "CC 79.456.123"; otro formato, tal cual. */
export function formatDoc(dni?: string | null): string {
  const d = (dni ?? '').trim();
  if (!d) return '';
  if (/^\d+$/.test(d)) return `CC ${d.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  return d;
}

/** Iniciales para el avatar ("Laura Gómez Ruiz" → "LG"). */
export function initials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** Hora límite de salida: entrada + minutos permitidos por el tipo. */
export function stayLimitAt(v: Partial<Pick<VisitListDTO, 'actualEntryTime' | 'stayLimitMinutes'>>): string | undefined {
  const entry = valid(v.actualEntryTime);
  if (!entry || !v.stayLimitMinutes) return undefined;
  return new Date(entry.getTime() + v.stayLimitMinutes * 60000).toISOString();
}

/** Columna ENTRADA / SALIDA: "entró 09:54 · 48 min", "09:02 → 09:10" o "". */
export function entryExitText(v: Pick<VisitListDTO, 'actualEntryTime' | 'actualExitTime'>, now: Date = new Date()): string {
  if (!v.actualEntryTime) return '';
  if (v.actualExitTime) return `${formatClock(v.actualEntryTime)} → ${formatClock(v.actualExitTime)}`;
  return `entró ${formatClock(v.actualEntryTime)} · ${formatDuration(minutesBetween(v.actualEntryTime, now))}`;
}

/** Fecha de hoy en Colombia (YYYY-MM-DD). */
export function todayInProperty(now: Date = new Date()): string {
  // en-CA formatea como YYYY-MM-DD
  return now.toLocaleDateString('en-CA', { timeZone: PROPERTY_TZ });
}

/** Fecha y hora de pared → ISO que guarda el back ("2026-10-15", "09:30" → "2026-10-15T09:30:00Z"). */
export function toWallClockISO(date: string, time?: string): string {
  return `${date}T${time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'}:00Z`;
}

/** ISO de hora de pared → { date: "2026-10-15", time: "09:30" }. */
export function wallClockParts(iso?: string | null): { date: string; time: string } {
  const d = valid(iso);
  if (!d) return { date: '', time: '' };
  const s = d.toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

// ===================== Línea de tiempo =====================

export interface TimelineStep {
  key: string;
  label: string;
  /** Texto de la hora (vacío si aún no ocurre). */
  at: string;
  detail?: string;
  done: boolean;
  tone?: 'ok' | 'danger' | 'muted';
}

type TimelineInput = Pick<
  VisitListDTO,
  'createdAt' | 'scheduledDate' | 'scheduledStartTime' | 'actualEntryTime' | 'actualExitTime' | 'visitStatusCode' | 'visitStatusName'
> &
  Partial<Pick<VisitListDTO, 'stayLimitMinutes' | 'authorizedByName'>> & { entryGate?: string; exitGate?: string };

/**
 * Pasos de la visita (V3): registrada → programada → entrada → salida (o cancelada).
 * La salida pendiente muestra el límite según el tipo de visita.
 */
export function visitTimeline(v: TimelineInput, now: Date = new Date()): TimelineStep[] {
  const state = visitStateOf(v);
  const scheduled = v.scheduledStartTime || v.scheduledDate;
  const steps: TimelineStep[] = [
    {
      key: 'created',
      label: 'Registrada',
      at: formatClock(v.createdAt),
      detail: v.authorizedByName ? `autorizó ${v.authorizedByName}` : formatDateTime(v.createdAt),
      done: true,
      tone: 'muted',
    },
    { key: 'scheduled', label: 'Programada', at: formatWallTime(scheduled), detail: formatWallDay(v.scheduledDate), done: true, tone: 'muted' },
  ];
  if (state === 'cancelled') {
    steps.push({ key: 'cancelled', label: v.visitStatusName || 'Cancelada', at: '', done: true, tone: 'danger' });
    return steps;
  }
  steps.push({
    key: 'entry',
    label: 'Entrada',
    at: v.actualEntryTime ? formatClock(v.actualEntryTime) : '',
    detail: v.actualEntryTime ? (v.entryGate ? `puerta ${v.entryGate}` : 'registrada en portería') : 'pendiente',
    done: !!v.actualEntryTime,
    tone: 'ok',
  });
  const stay = v.actualEntryTime ? formatDuration(minutesBetween(v.actualEntryTime, v.actualExitTime || now)) : '';
  const limit = stayLimitAt(v);
  steps.push({
    key: 'exit',
    label: 'Salida',
    at: v.actualExitTime ? formatClock(v.actualExitTime) : '',
    detail: v.actualExitTime ? `estadía ${stay}` : limit ? `pendiente · límite ${formatClock(limit)}` : 'pendiente',
    done: !!v.actualExitTime,
    tone: 'muted',
  });
  return steps;
}
