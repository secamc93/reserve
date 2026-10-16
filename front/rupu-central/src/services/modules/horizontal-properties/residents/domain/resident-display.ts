/**
 * Presentación de residentes (lógica pura, sin efectos): chips por tipo, búsqueda por campo,
 * filtro de estado y línea de tiempo del detalle.
 */

import type { GetResidentsParams } from './ports/residents.repository';
import type { Resident, ResidentsSummary, ResidentTypeCount } from './entities';
import { RESIDENT_TYPE_LABELS } from './entities';

/** Valor del chip "Todos" (sin filtro de tipo). */
export const ALL_TYPES = 'all';

/** Plural en español de un tipo ("Propietario" → "Propietarios", "Familiar" → "Familiares"). */
export function pluralizeType(name: string): string {
  const n = name.trim();
  if (!n) return n;
  return /[aeiouáéíóú]$/i.test(n) ? `${n}s` : `${n}es`;
}

export interface TypeChip {
  id: string;
  label: string;
  count: number;
}

/** Chips de tipo: "Todos" con el total y un chip por tipo del catálogo (ids reales del back). */
export function buildResidentTypeChips(summary: ResidentsSummary | null): TypeChip[] {
  return [
    { id: ALL_TYPES, label: 'Todos', count: summary?.total ?? 0 },
    ...(summary?.types ?? []).map((t) => ({ id: String(t.id), label: pluralizeType(t.name), count: t.total })),
  ];
}

/**
 * Tipos para el formulario: los del catálogo del back (resumen) o, si no hay resumen, los
 * conocidos por defecto.
 */
export function residentTypeOptions(types: ResidentTypeCount[] | undefined): Array<{ id: number; name: string }> {
  if (types && types.length > 0) return types.map((t) => ({ id: t.id, name: t.name }));
  return Object.entries(RESIDENT_TYPE_LABELS).map(([id, name]) => ({ id: Number(id), name }));
}

export type ResidentSearchField = 'name' | 'unit' | 'dni';

export const RESIDENT_SEARCH_FIELDS: Array<{ id: ResidentSearchField; label: string; placeholder: string }> = [
  { id: 'name', label: 'Nombre', placeholder: 'Buscar por nombre' },
  { id: 'unit', label: 'Unidad', placeholder: 'Buscar por unidad (126)' },
  { id: 'dni', label: 'Documento', placeholder: 'Buscar por documento' },
];

export function parseSearchField(value: string | null | undefined): ResidentSearchField {
  return value === 'unit' || value === 'dni' ? value : 'name';
}

/** Convierte la búsqueda (campo + texto) en el filtro que entiende el back. */
export function resolveResidentSearch(
  field: ResidentSearchField,
  query: string,
): Pick<GetResidentsParams, 'name' | 'propertyUnitNumber' | 'dni'> {
  const q = query.trim();
  if (!q) return {};
  if (field === 'unit') return { propertyUnitNumber: q };
  if (field === 'dni') return { dni: q };
  return { name: q };
}

export type ResidentStatusFilter = 'activos' | 'inactivos' | 'todos';

/** Estado del filtro (pestañas). Por defecto: todos. */
export function parseStatusFilter(value: string | null | undefined): ResidentStatusFilter {
  return value === 'activos' || value === 'inactivos' ? value : 'todos';
}

export function statusToIsActive(status: ResidentStatusFilter): boolean | undefined {
  return status === 'activos' ? true : status === 'inactivos' ? false : undefined;
}

// ===================== Línea de tiempo =====================

const dateFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Fecha corta en español ("15 ene 2024"); vacía o inválida → "". */
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime()) || d.getUTCFullYear() < 1900) return '';
  const parts = Object.fromEntries(dateFormatter.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.day} ${String(parts.month).replace(/\./g, '')} ${parts.year}`;
}

export interface ResidentTimelineEvent {
  key: string;
  label: string;
  date: string;
  /** Fecha ISO para ordenar. */
  at: number;
  upcoming: boolean;
  detail?: string;
}

const moneyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** Canon mensual en pesos ("$ 1.500.000"). */
export function formatMoney(value: number | undefined | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? moneyFormatter.format(value).replace(/ /g, ' ') : '—';
}

/**
 * Eventos del residente en orden cronológico: registro, ingreso, inicio y fin de arriendo,
 * salida y última actualización (si es distinta del registro). Los eventos posteriores a
 * `now` se marcan como próximos.
 */
export function buildResidentTimeline(resident: Resident, now: Date = new Date()): ResidentTimelineEvent[] {
  const candidates: Array<{ key: string; label: string; value?: string; detail?: string }> = [
    { key: 'created', label: 'Registrado en Rupü', value: resident.createdAt },
    { key: 'move-in', label: 'Ingreso a la unidad', value: resident.moveInDate },
    {
      key: 'lease-start',
      label: 'Inicio del arriendo',
      value: resident.leaseStartDate,
      detail: resident.monthlyRent ? `Canon ${formatMoney(resident.monthlyRent)}` : undefined,
    },
    { key: 'lease-end', label: 'Fin del arriendo', value: resident.leaseEndDate },
    { key: 'move-out', label: 'Salida de la unidad', value: resident.moveOutDate },
  ];
  const events: ResidentTimelineEvent[] = [];
  for (const c of candidates) {
    const date = formatShortDate(c.value);
    if (!date || !c.value) continue;
    const at = new Date(c.value).getTime();
    events.push({ key: c.key, label: c.label, date, at, upcoming: at > now.getTime(), detail: c.detail });
  }
  const created = resident.createdAt ? new Date(resident.createdAt).getTime() : NaN;
  const updated = resident.updatedAt ? new Date(resident.updatedAt).getTime() : NaN;
  if (Number.isFinite(updated) && (!Number.isFinite(created) || updated - created > 60_000)) {
    const date = formatShortDate(resident.updatedAt);
    if (date) events.push({ key: 'updated', label: 'Última actualización', date, at: updated, upcoming: false });
  }
  return events.sort((a, b) => a.at - b.at);
}
