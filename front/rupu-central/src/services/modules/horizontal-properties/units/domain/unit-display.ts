/**
 * Presentación de unidades (lógica pura, sin efectos): etiqueta "Casa 126", formatos es-CO,
 * pestañas por bloque, agrupación de filas por bloque, suma de coeficientes y exportación CSV.
 */

import type { PropertyUnit, PropertyUnitsSummary, UnitImportRow } from './entities';
import { UNIT_TYPE_LABELS } from './entities';

/**
 * Etiqueta visible de una unidad: bloque + número ("Casa 126", "Dúplex 4", "Torre A 201").
 * Sin bloque, el número solo. Si el número ya trae el bloque ("A-201" en bloque "A") no se
 * repite. Nunca muestra el id.
 */
export function formatUnitLabel(number: string | null | undefined, block?: string | null): string {
  const n = (number ?? '').trim();
  const b = (block ?? '').trim();
  if (!b) return n || '—';
  if (!n) return b;
  if (n.toLocaleLowerCase('es').startsWith(b.toLocaleLowerCase('es'))) return n;
  return `${b} ${n}`;
}

const coefFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 3, maximumFractionDigits: 6 });
const sumFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
const pct3Formatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const pct2Formatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const areaFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

/** Coeficiente de una unidad (3 a 6 decimales, es-CO). Sin valor: "—". */
export function formatCoefficient(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? coefFormatter.format(value) : '—';
}

/** Suma de coeficientes (2 a 3 decimales, es-CO). */
export function formatCoefficientSum(value: number): string {
  return sumFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Coeficiente acumulado en porcentaje con 3 decimales ("79,410 %"). */
export function formatCoefficientPct(value: number): string {
  return `${pct3Formatter.format(Number.isFinite(value) ? value : 0)} %`;
}

/** Área en metros cuadrados ("72,5 m²"). Sin valor: "—". */
export function formatArea(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${areaFormatter.format(value)} m²` : '—';
}

/** Habitaciones / baños ("3 / 2"). Sin ninguno: "—". */
export function formatRoomsBaths(bedrooms?: number | null, bathrooms?: number | null): string {
  if ((bedrooms ?? null) === null && (bathrooms ?? null) === null) return '—';
  return `${bedrooms ?? '—'} / ${bathrooms ?? '—'}`;
}

export interface CoefficientStatus {
  /** La suma cuadra con la escala usada (100 % o 1). */
  ok: boolean;
  /** Escala detectada: 100 (porcentaje) o 1 (fracción). */
  scale: 100 | 1;
  /** Diferencia contra la escala (positivo = sobra, negativo = falta). */
  diff: number;
  label: string;
}

/**
 * Estado de la suma de coeficientes de la propiedad. Los coeficientes pueden venir en
 * porcentaje (suman 100) o en fracción (suman 1); se toma la escala más cercana.
 */
export function getCoefficientStatus(sum: number): CoefficientStatus {
  const value = Number.isFinite(sum) ? sum : 0;
  const scale: 100 | 1 = Math.abs(value - 1) < Math.abs(value - 100) && value < 10 ? 1 : 100;
  const diff = value - scale;
  const tolerance = scale === 100 ? 0.0005 : 0.000005;
  const ok = Math.abs(diff) <= tolerance;
  const target = scale === 100 ? '100' : '1';
  if (value === 0) return { ok: false, scale, diff, label: 'Sin coeficientes' };
  if (ok) return { ok, scale, diff, label: `Suman ${target}` };
  const amount = scale === 100 ? pct2Formatter.format(Math.abs(diff)) : formatCoefficient(Math.abs(diff));
  return { ok, scale, diff, label: diff > 0 ? `sobran ${amount}` : `faltan ${amount}` };
}

/** Suma de la propiedad si la unidad pasa de `previous` a `next` (coeficientes). */
export function projectCoefficientSum(total: number, previous: number | undefined, next: number | undefined): number {
  return (Number.isFinite(total) ? total : 0) - (previous ?? 0) + (next ?? 0);
}

/** Texto de ocupación de una unidad: "Ana Pérez", "Ana Pérez +2" o "Sin residente". */
export function formatOccupancy(count: number | undefined, mainName: string | undefined): string {
  const c = count ?? 0;
  if (c <= 0) return 'Sin residente';
  const name = (mainName ?? '').trim() || `${c} residente${c === 1 ? '' : 's'}`;
  return c > 1 && mainName ? `${name} +${c - 1}` : name;
}

// ===================== Pestañas =====================

export const UNIT_TAB_ALL = 'todas';
export const UNIT_TAB_NO_RESIDENT = 'sin-residente';
export const UNIT_TAB_COMMERCIAL = 'locales';
export const UNIT_TAB_INACTIVE = 'inactivas';
const BLOCK_PREFIX = 'bloque:';

export interface UnitTab {
  id: string;
  label: string;
  count: number;
}

/**
 * Pestañas de Unidades: "Todas", una por bloque/torre (de más a menos unidades), "Sin
 * residente", "Locales" (si hay locales comerciales y no hay ya un bloque de locales) e
 * "Inactivas" (si hay). Los bloques vacíos no generan pestaña (el back no filtra por vacío).
 */
export function buildUnitTabs(summary: PropertyUnitsSummary | null): UnitTab[] {
  if (!summary) return [{ id: UNIT_TAB_ALL, label: 'Todas', count: 0 }];
  const blocks = summary.blocks
    .filter((b) => b.block.trim() !== '')
    .sort((a, b) => b.total - a.total || a.block.localeCompare(b.block, 'es'));
  const tabs: UnitTab[] = [
    { id: UNIT_TAB_ALL, label: 'Todas', count: summary.total },
    ...blocks.map((b) => ({ id: `${BLOCK_PREFIX}${b.block}`, label: b.block, count: b.total })),
    { id: UNIT_TAB_NO_RESIDENT, label: 'Sin residente', count: Math.max(0, summary.total - summary.withResidents) },
  ];
  const hasLocalBlock = blocks.some((b) => /^local(es)?$/i.test(b.block.trim()));
  if (summary.commercial > 0 && !hasLocalBlock) tabs.push({ id: UNIT_TAB_COMMERCIAL, label: 'Locales', count: summary.commercial });
  if (summary.total > summary.active) tabs.push({ id: UNIT_TAB_INACTIVE, label: 'Inactivas', count: summary.total - summary.active });
  return tabs;
}

export interface UnitTabFilters {
  block?: string;
  withoutResidents?: boolean;
  unitType?: string;
  isActive?: boolean;
}

/** Filtros del listado según la pestaña activa (id inválido o vacío → "Todas"). */
export function unitTabToFilters(tab: string | null | undefined): UnitTabFilters {
  if (!tab || tab === UNIT_TAB_ALL) return {};
  if (tab.startsWith(BLOCK_PREFIX)) return { block: tab.slice(BLOCK_PREFIX.length) };
  if (tab === UNIT_TAB_NO_RESIDENT) return { withoutResidents: true };
  if (tab === UNIT_TAB_COMMERCIAL) return { unitType: 'commercial' };
  if (tab === UNIT_TAB_INACTIVE) return { isActive: false };
  return {};
}

// ===================== Agrupación por bloque =====================

export interface UnitGroup {
  block: string;
  units: PropertyUnit[];
}

/** Agrupa filas consecutivas del mismo bloque (el back las entrega ordenadas por bloque). */
export function groupUnitsByBlock(units: PropertyUnit[]): UnitGroup[] {
  const groups: UnitGroup[] = [];
  for (const u of units) {
    const block = (u.block ?? '').trim();
    const last = groups[groups.length - 1];
    if (last && last.block === block) last.units.push(u);
    else groups.push({ block, units: [u] });
  }
  return groups;
}

/** Totales de un bloque según el resumen (unidades y coeficiente acumulado). */
export function blockTotals(summary: PropertyUnitsSummary | null, block: string): { total: number; coefficientSum: number } | null {
  const b = summary?.blocks.find((x) => x.block.trim() === block.trim());
  return b ? { total: b.total, coefficientSum: b.coefficientSum } : null;
}

/** Nombre visible de un bloque (sin bloque → "Sin bloque"). */
export function blockLabel(block: string): string {
  return block.trim() || 'Sin bloque';
}

// ===================== Tipos =====================

/** Tipos en el orden del formulario (chips). */
export const UNIT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Local' },
  { value: 'office', label: 'Oficina' },
  { value: 'storage', label: 'Depósito' },
  { value: 'parking', label: 'Parqueadero' },
];

export function unitTypeLabel(type: string): string {
  return UNIT_TYPE_LABELS[type] ?? type ?? '—';
}

// ===================== Importación =====================

/** Texto del estado de una fila del archivo de importación. */
export function importRowStatusLabel(row: UnitImportRow, updateExisting: boolean): string {
  if (row.status === 'ready') return 'Lista';
  if (row.status === 'exists') return updateExisting ? 'Ya existe · se actualizará' : 'Ya existe · se omitirá';
  return row.message || 'Con error';
}

export function isImportRowError(row: UnitImportRow): boolean {
  return row.status !== 'ready' && row.status !== 'exists';
}

/** Cuántas unidades se importarán (nuevas + existentes si se actualizan). */
export function importCount(ready: number, existing: number, updateExisting: boolean): number {
  return ready + (updateExisting ? existing : 0);
}

// ===================== Exportación =====================

function csvCell(value: string | number | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * CSV de unidades (separador ";" y coma decimal, como lo abre Excel en es-CO), con BOM para
 * que respete tildes.
 */
export function unitsToCsv(units: PropertyUnit[]): string {
  const dec = (n: number | undefined) => (typeof n === 'number' && Number.isFinite(n) ? String(n).replace('.', ',') : '');
  const header = ['Unidad', 'Bloque', 'Número', 'Tipo', 'Piso', 'Área m²', 'Habitaciones', 'Baños', 'Coeficiente', 'Residente principal', 'Residentes', 'Activa'];
  const lines = units.map((u) =>
    [
      formatUnitLabel(u.number, u.block),
      u.block ?? '',
      u.number,
      unitTypeLabel(u.unitType),
      u.floor ?? '',
      dec(u.area),
      u.bedrooms ?? '',
      u.bathrooms ?? '',
      dec(u.coefficient),
      u.mainResidentName ?? '',
      u.residentsCount ?? 0,
      u.isActive ? 'Sí' : 'No',
    ]
      .map(csvCell)
      .join(';'),
  );
  return '﻿' + [header.join(';'), ...lines].join('\n');
}
