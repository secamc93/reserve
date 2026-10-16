/**
 * Presentación de unidades (lógica pura, sin efectos): etiqueta "Casa 126", formato del
 * coeficiente, estado de la suma de coeficientes y agrupación por bloque.
 */

import type { PropertyUnitBlockSummary, PropertyUnitsSummary } from './entities';

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
const pctFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Coeficiente de una unidad (3 a 6 decimales, es-CO). Sin valor: "—". */
export function formatCoefficient(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? coefFormatter.format(value) : '—';
}

/** Suma de coeficientes (2 a 3 decimales, es-CO). */
export function formatCoefficientSum(value: number): string {
  return sumFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Porcentaje con un decimal (es-CO). */
export function formatPercent(value: number): string {
  return `${pctFormatter.format(Number.isFinite(value) ? value : 0)} %`;
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
  const tolerance = scale === 100 ? 0.01 : 0.0001;
  const ok = Math.abs(diff) <= tolerance;
  const target = scale === 100 ? '100' : '1';
  if (value === 0) return { ok: false, scale, diff, label: 'Sin coeficientes' };
  if (ok) return { ok, scale, diff, label: `Suman ${target}` };
  return {
    ok,
    scale,
    diff,
    label: diff > 0 ? `Sobran ${formatCoefficientSum(diff)}` : `Faltan ${formatCoefficientSum(-diff)}`,
  };
}

/** Participación de un valor sobre el total, en porcentaje (0 si el total es 0). */
export function shareOf(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}

/** Nombre visible de un bloque (sin bloque → "Sin bloque"). */
export function blockLabel(block: string): string {
  return block.trim() || 'Sin bloque';
}

/** Valor del chip "Todas" (sin filtro de bloque). */
export const ALL_BLOCKS = 'all';

export interface BlockChip {
  id: string;
  label: string;
  count: number;
}

/**
 * Chips de filtro por bloque a partir del resumen: "Todas" primero y luego los bloques
 * ordenados por cantidad de unidades (desc) y nombre. Los bloques vacíos ("") no generan
 * chip porque el back no filtra por bloque vacío.
 */
export function buildBlockChips(summary: PropertyUnitsSummary | null): BlockChip[] {
  const blocks = (summary?.blocks ?? []).filter((b) => b.block.trim() !== '');
  const sorted = [...blocks].sort((a, b) => b.total - a.total || a.block.localeCompare(b.block, 'es'));
  return [
    { id: ALL_BLOCKS, label: 'Todas', count: summary?.total ?? 0 },
    ...sorted.map((b) => ({ id: b.block, label: b.block, count: b.total })),
  ];
}

export interface BlockRow extends PropertyUnitBlockSummary {
  /** Participación del bloque en la suma total de coeficientes (%). */
  share: number;
}

/** Filas de la vista "Por bloque": cada bloque con su participación en el coeficiente total. */
export function buildBlockRows(summary: PropertyUnitsSummary | null): BlockRow[] {
  if (!summary) return [];
  const total = summary.coefficientSum;
  return [...summary.blocks]
    .sort((a, b) => b.coefficientSum - a.coefficientSum || a.block.localeCompare(b.block, 'es'))
    .map((b) => ({ ...b, share: shareOf(b.coefficientSum, total) }));
}

/** Texto de ocupación de una unidad: "Ana Pérez", "Ana Pérez +2" o "Sin residentes". */
export function formatOccupancy(count: number | undefined, mainName: string | undefined): string {
  const c = count ?? 0;
  if (c <= 0) return 'Sin residentes';
  const name = (mainName ?? '').trim() || `${c} residente${c === 1 ? '' : 's'}`;
  return c > 1 && mainName ? `${name} +${c - 1}` : name;
}
