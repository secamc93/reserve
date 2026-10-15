/**
 * Paginación de tablas (componente único del proyecto).
 *
 * - `Pagination`: lee y escribe `?page=` y `?page_size=` en la URL (conserva los demás
 *   parámetros). Es el modo normal de las tablas: la página pide los datos al servidor con
 *   los params de la URL (`usePaginationParams`).
 * - `PaginationControls`: la misma UI controlada por callbacks, para contextos sin URL propia
 *   (p. ej. una tabla dentro de un modal).
 *
 * Reglas: predeterminado 10 filas, máximo 200; ver `@shared/utils/pagination`.
 */

'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  PAGE_PARAM,
  PAGE_SIZE_PARAM,
  PAGE_SIZE_OPTIONS,
  buildPaginationQuery,
  formatShowing,
  getPageItems,
  getPageSizeOptions,
  getTotalPages,
  normalizePage,
  normalizePageSize,
  paginationFromSearchParams,
  parseGoToPage,
  type PaginationParams,
} from '../utils/pagination';

export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  /** Si no se pasa, se calcula con total y pageSize. */
  totalPages?: number;
  onPageChange: (page: number) => void;
  /** Al cambiar el tamaño, quien llama debe volver a la página 1 (Pagination ya lo hace). */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
  className?: string;
}

const btnBase =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] border px-2 text-sm transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-1 ' +
  'disabled:cursor-not-allowed disabled:opacity-40';
const btnIdle = 'border-[#d6d3cd] bg-white text-[#1a1a1a] hover:bg-[#f5f5f4] hover:border-[#8a8580]';
/** Primera/Última página: en teléfono (< md) se ocultan para que la barra quepa (quedan anterior/siguiente). */
const btnEdge = btnBase.replace('inline-flex', 'hidden md:inline-flex');
const btnCurrent = 'border-[#1a1a1a] bg-[#1a1a1a] text-white';

function Chevron({ dir, double = false }: { dir: 'left' | 'right'; double?: boolean }) {
  const d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
  const d2 = dir === 'left' ? 'M20 18l-6-6 6-6' : 'M4 18l6-6-6-6';
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
      {double && <path d={d2} />}
    </svg>
  );
}

export function PaginationControls({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  disabled = false,
  className = '',
}: PaginationControlsProps) {
  const size = normalizePageSize(pageSize);
  const pages = Math.max(1, totalPages ?? getTotalPages(total, size));
  const current = Math.min(normalizePage(page), pages);
  const items = getPageItems(current, pages);
  const options = getPageSizeOptions(size, pageSizeOptions);

  const sizeId = useId();
  const goId = useId();
  const [goTo, setGoTo] = useState('');
  const [goError, setGoError] = useState(false);

  const go = (target: number) => {
    if (disabled || target === current || target < 1 || target > pages) return;
    onPageChange(target);
  };

  const submitGoTo = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseGoToPage(goTo, pages);
    if (target === null) {
      setGoError(true);
      return;
    }
    setGoError(false);
    setGoTo('');
    go(target);
  };

  const atStart = current <= 1;
  const atEnd = current >= pages;

  return (
    <nav
      aria-label="Paginación"
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e2dd] bg-[#f5f5f4] px-3 md:px-4 py-3 text-sm text-[#1a1a1a] ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor={sizeId} className="text-[#8a8580]">
              Filas por página
            </label>
            <select
              id={sizeId}
              value={size}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(normalizePageSize(e.target.value))}
              className="h-8 rounded-[6px] border border-[#d6d3cd] bg-white px-2 [font-family:var(--font-geist-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)] text-sm tabular-nums text-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] disabled:opacity-40"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
        <span className="[font-family:var(--font-geist-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)] tabular-nums text-[#8a8580]" aria-live="polite">
          {formatShowing(current, size, total)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button type="button" className={`${btnEdge} ${btnIdle}`} onClick={() => go(1)} disabled={disabled || atStart} aria-label="Primera página">
          <Chevron dir="left" double />
        </button>
        <button type="button" className={`${btnBase} ${btnIdle}`} onClick={() => go(current - 1)} disabled={disabled || atStart} aria-label="Página anterior">
          <Chevron dir="left" />
        </button>

        <ul className="flex items-center gap-1">
          {items.map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  disabled={disabled}
                  aria-label={`Página ${item}`}
                  aria-current={item === current ? 'page' : undefined}
                  className={`${btnBase} [font-family:var(--font-geist-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)] tabular-nums ${item === current ? btnCurrent : btnIdle}`}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} aria-hidden="true" className="px-1 [font-family:var(--font-geist-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)] text-[#8a8580]">
                …
              </li>
            ),
          )}
        </ul>

        <button type="button" className={`${btnBase} ${btnIdle}`} onClick={() => go(current + 1)} disabled={disabled || atEnd} aria-label="Página siguiente">
          <Chevron dir="right" />
        </button>
        <button type="button" className={`${btnEdge} ${btnIdle}`} onClick={() => go(pages)} disabled={disabled || atEnd} aria-label="Última página">
          <Chevron dir="right" double />
        </button>

        {pages > 1 && (
          <form onSubmit={submitGoTo} className="ml-2 flex items-center gap-1" noValidate>
            <label htmlFor={goId} className="text-[#8a8580]">
              Ir a
            </label>
            <input
              id={goId}
              type="number"
              inputMode="numeric"
              min={1}
              max={pages}
              value={goTo}
              disabled={disabled}
              onChange={(e) => {
                setGoTo(e.target.value);
                setGoError(false);
              }}
              aria-label="Ir a la página"
              aria-invalid={goError || undefined}
              className={`h-8 w-16 rounded-[6px] border bg-white px-2 [font-family:var(--font-geist-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)] text-sm tabular-nums text-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] ${goError ? 'border-red-500' : 'border-[#d6d3cd]'}`}
            />
            <button type="submit" disabled={disabled} className={`${btnBase} ${btnIdle}`}>
              Ir
            </button>
            {goError && (
              <span role="alert" className="text-xs text-red-600">
                Página entre 1 y {pages}
              </span>
            )}
          </form>
        )}
      </div>
    </nav>
  );
}

/** page/page_size normalizados de la URL y funciones para cambiarlos (conservan los demás params). */
export function usePaginationParams(): PaginationParams & {
  setPage: (page: number, opts?: { replace?: boolean }) => void;
  setPageSize: (pageSize: number) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize } = useMemo(() => paginationFromSearchParams(searchParams), [searchParams]);

  const navigate = useCallback(
    (update: { page?: number; pageSize?: number }, replace = false) => {
      const qs = buildPaginationQuery(searchParams, update);
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setPage = useCallback(
    (p: number, opts?: { replace?: boolean }) => {
      if (p === page) return;
      navigate({ page: p }, opts?.replace);
    },
    [navigate, page],
  );
  const setPageSize = useCallback((s: number) => navigate({ pageSize: s }), [navigate]);

  return { page, pageSize, setPage, setPageSize };
}

export interface UrlPaginationProps {
  /** Total de registros que reporta el back. */
  total: number;
  /** Total de páginas del back; si no viene se calcula. */
  totalPages?: number;
  disabled?: boolean;
  pageSizeOptions?: readonly number[];
  className?: string;
}

/**
 * Paginación con estado en la URL. Normaliza la URL si trae valores fuera de rango
 * (p. ej. `?page_size=500` → 200, o una página mayor que la última).
 */
export function Pagination({ total, totalPages, disabled, pageSizeOptions, className }: UrlPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const pages = Math.max(1, totalPages ?? getTotalPages(total, pageSize));

  useEffect(() => {
    const rawPage = searchParams?.get(PAGE_PARAM);
    const rawSize = searchParams?.get(PAGE_SIZE_PARAM);
    const fixPage = rawPage !== null && rawPage !== undefined && rawPage !== String(page);
    const fixSize = rawSize !== null && rawSize !== undefined && rawSize !== String(pageSize);
    const overflow = !disabled && total > 0 && page > pages;
    if (!fixPage && !fixSize && !overflow) return;

    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (fixSize) params.set(PAGE_SIZE_PARAM, String(pageSize));
    if (fixPage || overflow) params.set(PAGE_PARAM, String(overflow ? pages : page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, page, pageSize, pages, total, disabled, router, pathname]);

  return (
    <PaginationControls
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={pages}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      pageSizeOptions={pageSizeOptions}
      disabled={disabled}
      className={className}
    />
  );
}
