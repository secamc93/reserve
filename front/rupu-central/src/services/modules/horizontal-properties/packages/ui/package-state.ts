/**
 * Lógica pura de presentación de paquetería ("PH - Visitas y Paquetes", P1–P4): grupo de
 * estado, antigüedad (por entregar primero y más de 3 días en alerta), acciones permitidas,
 * etiqueta de unidad y línea de tiempo.
 */

import type { Package, PackageListDTO, PackageStatusGroup } from '../domain';

export const PROPERTY_TZ = 'America/Bogota';

// ===================== Grupo de estado =====================

export const PACKAGE_GROUP_ORDER: PackageStatusGroup[] = ['pending', 'delivered', 'closed'];

export const PACKAGE_GROUP_META: Record<PackageStatusGroup, { label: string; chip: string; color: string }> = {
  pending: { label: 'Por entregar', chip: 'Por entregar', color: '#c8603f' },
  delivered: { label: 'Entregado', chip: 'Entregados', color: '#1f8a4c' },
  closed: { label: 'Devuelto', chip: 'Devueltos', color: '#8a8580' },
};

/** Paquetes que llevan más de esto se marcan como viejos en la lista. */
export const OLD_DAYS = 5;

const CODE_TO_GROUP: Record<string, PackageStatusGroup> = {
  received: 'pending',
  in_storage: 'pending',
  notified: 'pending',
  delivered: 'delivered',
  returned: 'closed',
  lost: 'closed',
};

export function packageGroupOf(p: Pick<PackageListDTO, 'statusCode' | 'deliveredAt'>): PackageStatusGroup {
  const g = CODE_TO_GROUP[p.statusCode ?? ''];
  if (g) return g;
  return p.deliveredAt ? 'delivered' : 'pending';
}

/** Etiqueta del estado: "Perdido" para lost; si no, la del grupo. */
export function packageStatusLabel(p: Pick<PackageListDTO, 'statusCode' | 'deliveredAt' | 'statusName'>): string {
  if (p.statusCode === 'lost') return 'Perdido';
  if (p.statusCode === 'notified') return 'Notificado';
  return PACKAGE_GROUP_META[packageGroupOf(p)].label;
}

export interface PackageActions {
  canDeliver: boolean;
  canReturn: boolean;
}

/**
 * Entregar: recibido o en almacén (regla del back: "notificado" no se entrega directo).
 * Devolver: cualquiera aún por entregar.
 */
export function packageActions(p: Pick<PackageListDTO, 'statusCode' | 'deliveredAt'>): PackageActions {
  const pending = packageGroupOf(p) === 'pending';
  const deliverable = p.statusCode === 'received' || p.statusCode === 'in_storage';
  return { canDeliver: pending && deliverable && !p.deliveredAt, canReturn: pending };
}

// ===================== Antigüedad =====================

function valid(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fecha YYYY-MM-DD en Colombia. */
function dayInProperty(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: PROPERTY_TZ });
}

/**
 * Días en portería (calendario de Colombia): desde que llegó hasta que se entregó, o hasta hoy.
 * 0 = llegó hoy.
 */
export function packageDays(p: Pick<PackageListDTO, 'receivedAt' | 'createdAt' | 'deliveredAt'>, now: Date = new Date()): number {
  const from = valid(p.receivedAt) ?? valid(p.createdAt);
  if (!from) return 0;
  const to = valid(p.deliveredAt) ?? now;
  const a = Date.parse(`${dayInProperty(from)}T00:00:00Z`);
  const b = Date.parse(`${dayInProperty(to)}T00:00:00Z`);
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** "hoy", "1 día", "6 días". */
export function formatDays(days: number): string {
  if (days <= 0) return 'hoy';
  return days === 1 ? '1 día' : `${days} días`;
}

/** Color de la antigüedad: terracota desde 5 días, gris oscuro desde 2, gris claro antes. */
export function daysColor(days: number): string {
  if (days >= 5) return '#c8603f';
  if (days >= 2) return '#4b4a46';
  return '#8a8580';
}

// ===================== Unidad y fechas =====================

/** "Casa 126" (bloque + número); sin bloque, "Unidad 126". Nunca el id. */
export function unitLabel(block: string | null | undefined, number: string | null | undefined): string {
  const n = (number ?? '').trim();
  const b = (block ?? '').trim();
  if (!n) return b || 'Sin unidad';
  return b ? `${b} ${n}` : `Unidad ${n}`;
}

export function formatClock(iso?: string | null): string {
  const d = valid(iso);
  if (!d) return '';
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: PROPERTY_TZ });
}

/** "15 oct, 14:32" en hora de Colombia. */
export function formatDateTime(iso?: string | null): string {
  const d = valid(iso);
  if (!d) return '';
  const day = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: PROPERTY_TZ }).replace(/\./g, '');
  return `${day}, ${formatClock(iso)}`;
}

// ===================== Línea de tiempo =====================

export interface TimelineStep {
  key: string;
  label: string;
  at: string;
  detail?: string;
  done: boolean;
  tone?: 'ok' | 'danger' | 'muted';
}

type TimelineInput = Pick<PackageListDTO, 'statusCode' | 'receivedAt' | 'createdAt' | 'deliveredAt'> &
  Partial<Pick<Package, 'notificationSentAt' | 'notifyResident' | 'receivedByName' | 'deliveredByName'>>;

/** Recibido → notificado (si aplica) → entregado (o devuelto / perdido). */
export function packageTimeline(p: TimelineInput, now: Date = new Date()): TimelineStep[] {
  const group = packageGroupOf(p);
  const steps: TimelineStep[] = [
    {
      key: 'received',
      label: 'Recibido en portería',
      at: formatDateTime(p.receivedAt || p.createdAt),
      detail: p.receivedByName ? `recibió ${p.receivedByName}` : undefined,
      done: true,
      tone: 'muted',
    },
  ];
  if (p.notificationSentAt || p.statusCode === 'notified') {
    steps.push({ key: 'notified', label: 'Residente notificado', at: formatDateTime(p.notificationSentAt), done: true, tone: 'muted' });
  } else if (p.notifyResident && group === 'pending') {
    steps.push({ key: 'notified', label: 'Aviso al residente', at: '', done: false });
  }
  if (group === 'closed') {
    steps.push({ key: 'closed', label: p.statusCode === 'lost' ? 'Marcado como perdido' : 'Devuelto al remitente', at: '', done: true, tone: 'danger' });
    return steps;
  }
  const days = packageDays(p, now);
  steps.push({
    key: 'delivered',
    label: 'Entregado',
    at: formatDateTime(p.deliveredAt),
    detail: p.deliveredAt ? (days === 0 ? 'entregado el mismo día' : `estuvo ${formatDays(days)} en portería`) : days === 0 ? 'llegó hoy' : `${formatDays(days)} en portería`,
    done: group === 'delivered',
    tone: 'ok',
  });
  return steps;
}

// ===================== Entrega =====================

/**
 * Nota de la entrega con quién recibió (el back guarda solo notas): "Entregado a: Ana Ruiz
 * (CC 123). Recibió en la portería".
 */
export function deliveryNotes(recipient: { name: string; doc?: string } | null, note: string): string {
  const parts: string[] = [];
  const name = recipient?.name.trim();
  if (name) parts.push(`Entregado a: ${name}${recipient?.doc?.trim() ? ` (${recipient.doc.trim()})` : ''}.`);
  if (note.trim()) parts.push(note.trim());
  return parts.join(' ');
}
