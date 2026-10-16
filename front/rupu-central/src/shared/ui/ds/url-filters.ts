/**
 * Filtros de lista en la URL (?block=Casa&q=12&estado=activas): sobreviven a recargas y se
 * comparten por enlace, igual que la paginación (?page=&page_size=).
 *
 * Candidato a subir a shared/ui/ds (lo usan Unidades y Residentes).
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Aplica cambios de filtros a una query string. Un valor vacío o null borra el parámetro.
 * Cualquier cambio de filtro vuelve a la página 1 (borra `page`); conserva los demás params.
 */
export function applyFilterPatch(search: string, patch: Record<string, string | null | undefined>): string {
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === '') params.delete(key);
    else params.set(key, value);
  }
  params.delete('page');
  return params.toString();
}

/** Lee los filtros `keys` de la URL y devuelve una función para cambiarlos. */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';

  const values = useMemo(() => {
    const params = new URLSearchParams(search);
    return Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ''])) as Record<K, string>;
    // keys es una constante del módulo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setFilters = useCallback(
    (patch: Partial<Record<K, string | null>>) => {
      const qs = applyFilterPatch(search, patch);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, search],
  );

  return { values, setFilters };
}

/**
 * Texto de búsqueda con espera (300 ms) antes de aplicarlo: el input responde al instante y
 * la URL (y la petición al back) cambian cuando el usuario deja de escribir.
 */
export function useDebouncedValue(value: string, onCommit: (value: string) => void, delay = 300) {
  const [draft, setDraft] = useState(value);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  const lastCommitted = useRef(value);

  // Si el valor externo cambia (p. ej. al limpiar filtros), refleja el cambio en el input.
  useEffect(() => {
    if (value !== lastCommitted.current) {
      lastCommitted.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === lastCommitted.current) return;
    const t = setTimeout(() => {
      lastCommitted.current = draft;
      commitRef.current(draft);
    }, delay);
    return () => clearTimeout(t);
  }, [draft, delay]);

  return [draft, setDraft] as const;
}
