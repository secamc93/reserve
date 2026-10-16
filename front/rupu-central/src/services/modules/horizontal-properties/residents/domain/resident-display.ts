/**
 * Presentación de residentes (lógica pura, sin efectos): pestañas, tipos, fechas en español,
 * subtítulo del detalle y cambios de la edición masiva.
 */

import type { Resident, ResidentsSummary, ResidentTypeCount, UpdateResidentDTO } from './entities';
import { RESIDENT_TYPE_LABELS } from './entities';

// ===================== Pestañas =====================

export const RESIDENT_TAB_ALL = 'todos';
export const RESIDENT_TAB_NO_EMAIL = 'sin-correo';
export const RESIDENT_TAB_INACTIVE = 'inactivos';
const TYPE_PREFIX = 'tipo:';

/** Plural en español de un tipo ("Propietario" → "Propietarios", "Familiar" → "Familiares"). */
export function pluralizeType(name: string): string {
  const n = name.trim();
  if (!n) return n;
  return /[aeiouáéíóú]$/i.test(n) ? `${n}s` : `${n}es`;
}

export interface ResidentTab {
  id: string;
  label: string;
  count: number;
}

/** Pestañas: Todos, una por tipo del catálogo (ids reales), Sin correo e Inactivos. */
export function buildResidentTabs(summary: ResidentsSummary | null): ResidentTab[] {
  return [
    { id: RESIDENT_TAB_ALL, label: 'Todos', count: summary?.total ?? 0 },
    ...(summary?.types ?? []).map((t) => ({ id: `${TYPE_PREFIX}${t.id}`, label: pluralizeType(t.name), count: t.total })),
    { id: RESIDENT_TAB_NO_EMAIL, label: 'Sin correo', count: summary?.withoutEmail ?? 0 },
    { id: RESIDENT_TAB_INACTIVE, label: 'Inactivos', count: summary?.inactive ?? 0 },
  ];
}

export interface ResidentTabFilters {
  residentTypeId?: number;
  withoutEmail?: boolean;
  isActive?: boolean;
}

/** Filtros del listado según la pestaña (id inválido o vacío → Todos). */
export function residentTabToFilters(tab: string | null | undefined): ResidentTabFilters {
  if (!tab || tab === RESIDENT_TAB_ALL) return {};
  if (tab.startsWith(TYPE_PREFIX)) {
    const id = Number(tab.slice(TYPE_PREFIX.length));
    return Number.isFinite(id) && id > 0 ? { residentTypeId: id } : {};
  }
  if (tab === RESIDENT_TAB_NO_EMAIL) return { withoutEmail: true };
  if (tab === RESIDENT_TAB_INACTIVE) return { isActive: false };
  return {};
}

// ===================== Tipos =====================

export interface ResidentTypeOption {
  id: number;
  name: string;
  code: string;
}

const DEFAULT_TYPE_CODES: Record<number, string> = { 1: 'owner', 2: 'tenant', 3: 'family', 4: 'guest' };

/**
 * Tipos para el formulario: los del catálogo del back (resumen) o, si no hay resumen, los
 * conocidos por defecto.
 */
export function residentTypeOptions(types: ResidentTypeCount[] | undefined): ResidentTypeOption[] {
  if (types && types.length > 0) return types.map((t) => ({ id: t.id, name: t.name, code: t.code }));
  return Object.entries(RESIDENT_TYPE_LABELS).map(([id, name]) => ({ id: Number(id), name, code: DEFAULT_TYPE_CODES[Number(id)] ?? '' }));
}

/** El tipo es arrendatario (muestra el contrato de arrendamiento). */
export function isTenantType(type: { code?: string; name?: string } | undefined): boolean {
  if (!type) return false;
  return type.code === 'tenant' || /arrend/i.test(type.name ?? '');
}

// ===================== Fechas y dinero =====================

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime()) || d.getUTCFullYear() < 1900) return null;
  return d;
}

/** "2021-03-01T00:00:00Z" → "mar 2021". Vacía o inválida → "". */
export function formatMonthYear(value: string | null | undefined): string {
  const d = parseDate(value);
  return d ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : '';
}

/** Fecha corta en español ("15 ene 2024"); vacía o inválida → "". */
export function formatShortDate(value: string | null | undefined): string {
  const d = parseDate(value);
  return d ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : '';
}

/** Fecha de actividad: "12 oct" si es del año de `now`, si no "12 oct 2024". */
export function formatActivityDate(value: string | null | undefined, now: Date = new Date()): string {
  const d = parseDate(value);
  if (!d) return '';
  const base = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return d.getUTCFullYear() === now.getUTCFullYear() ? base : `${base} ${d.getUTCFullYear()}`;
}

const moneyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** Canon mensual en pesos ("$ 1.500.000"). */
export function formatMoney(value: number | undefined | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? moneyFormatter.format(value).replace(/ /g, ' ') : '—';
}

/** Subtítulo del detalle: "Propietario · CC 123 · desde mar 2021" (omite lo que falte). */
export function residentSubtitle(r: Pick<Resident, 'residentTypeName' | 'dni' | 'since' | 'moveInDate' | 'createdAt'>): string {
  const since = formatMonthYear(r.since || r.moveInDate || r.createdAt);
  return [r.residentTypeName, r.dni ? `CC ${r.dni}` : '', since ? `desde ${since}` : ''].filter(Boolean).join(' · ');
}

// ===================== Edición masiva =====================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Correo válido o vacío (el correo es opcional al editar). */
export function isValidOptionalEmail(email: string): boolean {
  const e = email.trim();
  return e === '' || EMAIL_RE.test(e);
}

export interface BulkRow {
  id: number;
  /** Clave de la unidad para agrupar el residente principal. */
  unitKey: string;
  unitLabel: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
}

export type BulkField = 'name' | 'dni' | 'email' | 'phone' | 'isMain' | 'isActive';
const BULK_FIELDS: BulkField[] = ['name', 'dni', 'email', 'phone', 'isMain', 'isActive'];

export function bulkRowFromResident(r: Resident, unitLabel: string): BulkRow {
  return {
    id: r.id,
    unitKey: `${r.propertyUnitBlock ?? ''}|${r.propertyUnitNumber ?? ''}`,
    unitLabel,
    name: r.name ?? '',
    dni: r.dni ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
    isMain: r.isMainResident,
    isActive: r.isActive,
  };
}

/** Campos cambiados de una fila (comparando sin espacios en los extremos). */
export function changedFields(original: BulkRow, edited: BulkRow): BulkField[] {
  return BULK_FIELDS.filter((f) => {
    const a = original[f];
    const b = edited[f];
    return typeof a === 'string' ? a.trim() !== String(b).trim() : a !== b;
  });
}

/** DTO de actualización con solo lo cambiado (null si no cambió nada). */
export function bulkRowToUpdate(original: BulkRow, edited: BulkRow): UpdateResidentDTO | null {
  const fields = changedFields(original, edited);
  if (fields.length === 0) return null;
  const dto: UpdateResidentDTO = {};
  for (const f of fields) {
    if (f === 'isMain') dto.isMainResident = edited.isMain;
    else if (f === 'isActive') dto.isActive = edited.isActive;
    else dto[f] = edited[f].trim();
  }
  return dto;
}

/** Marca a `id` como principal de su unidad y desmarca a los demás de esa unidad. */
export function setMainInUnit(rows: BulkRow[], id: number): BulkRow[] {
  const target = rows.find((r) => r.id === id);
  if (!target) return rows;
  return rows.map((r) => (r.unitKey === target.unitKey ? { ...r, isMain: r.id === id } : r));
}
