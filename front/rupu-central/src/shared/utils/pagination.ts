/**
 * Paginación de tablas: funciones puras (sin React ni red).
 *
 * Reglas (decisión del usuario, 2026-10-14):
 * - Página por defecto 1; cualquier valor inválido o < 1 vuelve a 1.
 * - Tamaño de página por defecto 10, máximo 200. Inválido o < 1 → 10; > 200 → 200.
 * - El estado vive en la URL: `?page=` y `?page_size=`.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;
export const PAGE_SIZE_OPTIONS: readonly number[] = [10, 20, 50, 100, 200];

export const PAGE_PARAM = 'page';
export const PAGE_SIZE_PARAM = 'page_size';

/** Valor crudo de un parámetro (searchParams de Next, URLSearchParams, número o nada). */
export type RawParam = string | string[] | number | null | undefined;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Entero a partir de un parámetro crudo; null si no es un número finito. */
function toInteger(raw: RawParam): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : null;
  }
  const trimmed = value.trim();
  if (!/^[-+]?\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizePage(raw: RawParam): number {
  const n = toInteger(raw);
  return n === null || n < 1 ? DEFAULT_PAGE : n;
}

export function normalizePageSize(raw: RawParam): number {
  const n = toInteger(raw);
  if (n === null || n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(n, MAX_PAGE_SIZE);
}

/** Normaliza `page` y `page_size` (de searchParams o de cualquier origen). */
export function normalizePaginationParams(raw: { page?: RawParam; page_size?: RawParam } = {}): PaginationParams {
  return { page: normalizePage(raw.page), pageSize: normalizePageSize(raw.page_size) };
}

/** Lee page/page_size de un URLSearchParams (o similar con get). */
export function paginationFromSearchParams(params: { get(name: string): string | null } | null | undefined): PaginationParams {
  return normalizePaginationParams({
    page: params?.get(PAGE_PARAM),
    page_size: params?.get(PAGE_SIZE_PARAM),
  });
}

/** Total de páginas; con 0 registros hay 1 página (vacía). */
export function getTotalPages(total: number, pageSize: number): number {
  const size = normalizePageSize(pageSize);
  if (!Number.isFinite(total) || total <= 0) return 1;
  return Math.ceil(total / size);
}

export interface ShowingRange {
  from: number;
  to: number;
  total: number;
}

/** Rango de registros visibles (1-based). Sin registros en la página: from = to = 0. */
export function getShowingRange(page: number, pageSize: number, total: number): ShowingRange {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const size = normalizePageSize(pageSize);
  const p = normalizePage(page);
  const from = (p - 1) * size + 1;
  if (safeTotal === 0 || from > safeTotal) return { from: 0, to: 0, total: safeTotal };
  return { from, to: Math.min(p * size, safeTotal), total: safeTotal };
}

/** Texto "Mostrando 11–20 de 137" (o "Sin resultados"). */
export function formatShowing(page: number, pageSize: number, total: number): string {
  const { from, to, total: t } = getShowingRange(page, pageSize, total);
  if (t === 0) return 'Sin resultados';
  if (from === 0) return `Mostrando 0 de ${t}`;
  return `Mostrando ${from}–${to} de ${t}`;
}

export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Lista de páginas con elipsis: 1 … 4 5 6 … 20.
 * Siempre muestra la primera, la última, la actual y `siblings` a cada lado; la longitud es
 * constante (siblings * 2 + 5) cuando hay suficientes páginas, para que los botones no salten.
 */
export function getPageItems(current: number, totalPages: number, siblings = 1): PageItem[] {
  const total = Math.max(1, Math.floor(Number.isFinite(totalPages) ? totalPages : 1));
  const page = Math.min(Math.max(1, Math.floor(Number.isFinite(current) ? current : 1)), total);
  const slots = siblings * 2 + 5;

  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  if (total <= slots) return range(1, total);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, total);
  const showLeftDots = left > 3;
  const showRightDots = right < total - 2;
  const edgeCount = siblings * 2 + 3;

  if (!showLeftDots) return [...range(1, edgeCount), 'ellipsis-end', total];
  if (!showRightDots) return [1, 'ellipsis-start', ...range(total - edgeCount + 1, total)];
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', total];
}

/** Valida el texto de "ir a página": entero entre 1 y totalPages, o null. */
export function parseGoToPage(input: string, totalPages: number): number | null {
  const n = toInteger(input);
  if (n === null || n < 1 || n > Math.max(1, totalPages)) return null;
  return n;
}

/**
 * Query string con la paginación actualizada, conservando los demás parámetros.
 * Cambiar el tamaño de página vuelve a la página 1.
 */
export function buildPaginationQuery(
  current: string | URLSearchParams | { toString(): string } | null | undefined,
  update: { page?: number; pageSize?: number },
): string {
  const params = new URLSearchParams(current ? current.toString() : '');
  if (update.pageSize !== undefined) {
    params.set(PAGE_SIZE_PARAM, String(normalizePageSize(update.pageSize)));
    params.set(PAGE_PARAM, '1');
  }
  if (update.page !== undefined && update.pageSize === undefined) {
    params.set(PAGE_PARAM, String(normalizePage(update.page)));
  }
  return params.toString();
}

/** Opciones del selector; incluye el tamaño actual si llegó uno válido fuera de la lista (p. ej. 15). */
export function getPageSizeOptions(current: number, options: readonly number[] = PAGE_SIZE_OPTIONS): number[] {
  const set = new Set(options.map(normalizePageSize));
  set.add(normalizePageSize(current));
  return [...set].sort((a, b) => a - b);
}

export interface PageChunk<T> {
  items: T[];
  /** Total de registros (si el back lo informa). */
  total?: number;
  /** Total de páginas (si el back lo informa). */
  totalPages?: number;
}

/** Tope de "traer todo": 50 páginas de 200 = 10.000 registros. */
/**
 * Página `page` (desde 1) de una lista que ya está completa en memoria, para tablas que
 * necesitan todos los datos (p. ej. resúmenes por coeficiente) pero muestran solo una página.
 */
export function pageSlice<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const size = normalizePageSize(String(pageSize));
  const last = getTotalPages(items.length, size);
  const current = Math.min(Math.max(1, Math.floor(page) || 1), Math.max(1, last));
  return items.slice((current - 1) * size, current * size);
}

export const FETCH_ALL_MAX_PAGES = 50;

/**
 * Recorre páginas de `pageSize` (máximo 200) hasta traer todos los registros. Solo para pantallas
 * que de verdad necesitan el conjunto completo (cruces, exportes); las tablas paginan en el servidor.
 * Se detiene con la última página, una página incompleta o vacía, o al llegar a `maxPages`.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PageChunk<T>>,
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<T[]> {
  const pageSize = normalizePageSize(options.pageSize ?? MAX_PAGE_SIZE);
  const maxPages = Math.max(1, Math.floor(options.maxPages ?? FETCH_ALL_MAX_PAGES));
  const all: T[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const { items, total, totalPages } = await fetchPage(page, pageSize);
    all.push(...items);
    const lastPage =
      totalPages !== undefined && Number.isFinite(totalPages)
        ? totalPages
        : total !== undefined && Number.isFinite(total)
          ? getTotalPages(total, pageSize)
          : undefined;
    if (items.length === 0 || items.length < pageSize) break;
    if (lastPage !== undefined && page >= lastPage) break;
  }
  return all;
}
