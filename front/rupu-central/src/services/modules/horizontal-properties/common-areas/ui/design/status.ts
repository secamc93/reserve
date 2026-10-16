/**
 * Estados de reserva: etiqueta, color y acciones permitidas. Las transiciones replican la
 * máquina de estados del back (reservation_state_machine.go).
 */

import { DS } from '@/shared/ui/ds/tokens';

export interface StatusMeta {
  label: string;
  /** Color del punto / texto. */
  color: string;
  /** Fondo y texto del bloque en el calendario. */
  bg: string;
  fg: string;
  border: string;
}

const META: Record<string, StatusMeta> = {
  pending: { label: 'Pendiente', color: DS.accent, bg: '#fbe9e4', fg: '#9c3a22', border: DS.accent },
  approved: { label: 'Aprobada', color: DS.yes, bg: DS.reachedBg, fg: '#17673a', border: DS.yes },
  confirmed: { label: 'Confirmada', color: DS.ink, bg: '#ecebe8', fg: DS.ink, border: DS.ink },
  checked_in: { label: 'En uso', color: '#2d5bd7', bg: '#e6edfb', fg: '#21449f', border: '#2d5bd7' },
  checked_out: { label: 'Finalizada', color: DS.muted, bg: '#f2f1ee', fg: DS.inkSoft, border: DS.borderStrong },
  completed: { label: 'Completada', color: DS.muted, bg: '#f2f1ee', fg: DS.inkSoft, border: DS.borderStrong },
  rejected: { label: 'Rechazada', color: DS.no, bg: '#f7f6f4', fg: DS.muted, border: DS.border },
  cancelled: { label: 'Cancelada', color: DS.muted, bg: '#f7f6f4', fg: DS.muted, border: DS.border },
  expired: { label: 'Vencida', color: DS.muted, bg: '#f7f6f4', fg: DS.muted, border: DS.border },
};

export function statusMeta(code?: string | null, fallbackName?: string | null): StatusMeta {
  const meta = code ? META[code] : undefined;
  if (meta) return meta;
  return { label: fallbackName || 'Sin estado', color: DS.muted, bg: '#f7f6f4', fg: DS.muted, border: DS.border };
}

/** Estados que ya no ocupan la zona (no se pintan como ocupación activa). */
export function isInactiveStatus(code?: string | null): boolean {
  return code === 'rejected' || code === 'cancelled' || code === 'expired';
}

export type ReservationAction = 'approve' | 'reject' | 'confirm' | 'checkIn' | 'checkOut' | 'cancel';

const ACTIONS: Record<string, ReservationAction[]> = {
  pending: ['approve', 'reject', 'cancel'],
  approved: ['confirm', 'cancel'],
  confirmed: ['checkIn', 'cancel'],
  checked_in: ['checkOut'],
};

/** Acciones disponibles para una reserva según su estado. */
export function availableActions(code?: string | null): ReservationAction[] {
  return (code && ACTIONS[code]) || [];
}

export const ACTION_LABEL: Record<ReservationAction, string> = {
  approve: 'Aprobar',
  reject: 'Rechazar',
  confirm: 'Confirmar',
  checkIn: 'Registrar ingreso',
  checkOut: 'Registrar salida',
  cancel: 'Cancelar reserva',
};

/** Chips de filtro de la lista de reservas. */
export const STATUS_FILTERS = [
  { id: 'all', label: 'Todas', codes: [] as string[] },
  { id: 'pending', label: 'Pendientes', codes: ['pending'] },
  { id: 'upcoming', label: 'Aprobadas', codes: ['approved', 'confirmed'] },
  { id: 'in_use', label: 'En uso', codes: ['checked_in'] },
  { id: 'closed', label: 'Cerradas', codes: ['checked_out', 'completed', 'rejected', 'cancelled', 'expired'] },
] as const;

export type StatusFilterId = (typeof STATUS_FILTERS)[number]['id'];

export function statusCodesFor(filter: string | null | undefined): string[] {
  return [...(STATUS_FILTERS.find((f) => f.id === filter)?.codes ?? [])];
}

export interface TimelineEvent {
  label: string;
  at?: string;
  detail?: string;
  tone: 'ok' | 'danger' | 'neutral';
}

/** Línea de tiempo de la reserva (solo eventos ocurridos), en orden. */
export function reservationTimeline(r: {
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  depositPaidAt?: string;
  fullPaymentPaidAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  statusCode?: string;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [{ label: 'Solicitada', at: r.createdAt, tone: 'neutral' }];
  if (r.approvedAt) events.push({ label: 'Aprobada', at: r.approvedAt, tone: 'ok' });
  if (r.rejectedAt) events.push({ label: 'Rechazada', at: r.rejectedAt, detail: r.rejectionReason, tone: 'danger' });
  if (r.depositPaidAt) events.push({ label: 'Depósito pagado', at: r.depositPaidAt, tone: 'ok' });
  if (r.fullPaymentPaidAt) events.push({ label: 'Pago completo', at: r.fullPaymentPaidAt, tone: 'ok' });
  if (r.checkedInAt) events.push({ label: 'Ingreso', at: r.checkedInAt, tone: 'ok' });
  if (r.checkedOutAt) events.push({ label: 'Salida', at: r.checkedOutAt, tone: 'neutral' });
  if (r.cancelledAt) events.push({ label: 'Cancelada', at: r.cancelledAt, detail: r.cancellationReason, tone: 'danger' });
  events.sort((a, b) => new Date(a.at ?? 0).getTime() - new Date(b.at ?? 0).getTime());
  // La confirmación no guarda fecha: se muestra como el último paso mientras no haya ingreso.
  if (r.statusCode === 'confirmed') events.push({ label: 'Confirmada · lista para ingresar', tone: 'ok' });
  return events;
}

export type CalendarTone = 'approved' | 'pending' | 'past';

/**
 * Tono del bloque en el calendario: pasada (terminada o ya ocurrida) en gris, pendiente en
 * terracota y el resto (aprobada, confirmada, en uso) en negro.
 */
export function calendarTone(r: { statusCode?: string; reservationDate: string; endTime: string }, now: Date = new Date()): CalendarTone {
  if (r.statusCode === 'checked_out' || r.statusCode === 'completed') return 'past';
  const day = r.reservationDate.slice(0, 10);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowClock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (day < today || (day === today && r.endTime.slice(0, 5) <= nowClock)) return 'past';
  return r.statusCode === 'pending' ? 'pending' : 'approved';
}
