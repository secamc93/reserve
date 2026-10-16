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

export const VISIT_STATE_META: Record<VisitState, { label: string; chip: string; color: string }> = {
  inside: { label: 'Dentro', chip: 'Dentro', color: '#1f8a4c' },
  expected: { label: 'Esperada', chip: 'Esperadas', color: '#c8603f' },
  left: { label: 'Salió', chip: 'Salieron', color: '#8a8580' },
  cancelled: { label: 'Cancelada', chip: 'Canceladas', color: '#c8382d' },
};

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

/** "45 min", "2 h", "2 h 05 min". */
export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${String(rest).padStart(2, '0')} min`;
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
> & { entryGate?: string; exitGate?: string };

/** Pasos de la visita: registrada → programada → entrada → salida (o cancelada). */
export function visitTimeline(v: TimelineInput, now: Date = new Date()): TimelineStep[] {
  const state = visitStateOf(v);
  const scheduled = v.scheduledStartTime || v.scheduledDate;
  const steps: TimelineStep[] = [
    { key: 'created', label: 'Registrada', at: formatDateTime(v.createdAt), done: true, tone: 'muted' },
    {
      key: 'scheduled',
      label: 'Programada',
      at: [formatWallDay(v.scheduledDate), formatWallTime(scheduled)].filter(Boolean).join(', '),
      done: true,
      tone: 'muted',
    },
  ];
  if (state === 'cancelled') {
    steps.push({ key: 'cancelled', label: v.visitStatusName || 'Cancelada', at: '', done: true, tone: 'danger' });
    return steps;
  }
  steps.push({
    key: 'entry',
    label: 'Entrada',
    at: v.actualEntryTime ? formatDateTime(v.actualEntryTime) : '',
    detail: v.actualEntryTime && v.entryGate ? `Portería ${v.entryGate}` : undefined,
    done: !!v.actualEntryTime,
    tone: 'ok',
  });
  const stay = v.actualEntryTime ? formatDuration(minutesBetween(v.actualEntryTime, v.actualExitTime || now)) : '';
  steps.push({
    key: 'exit',
    label: 'Salida',
    at: v.actualExitTime ? formatDateTime(v.actualExitTime) : '',
    detail: v.actualExitTime ? `Estadía ${stay}` : v.actualEntryTime ? `Dentro hace ${stay}` : undefined,
    done: !!v.actualExitTime,
    tone: 'muted',
  });
  return steps;
}
