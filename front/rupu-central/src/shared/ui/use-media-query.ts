/**
 * Hook: `true` si la media query coincide. Se evalúa en el primer render del cliente (los layouts
 * del shell solo pintan después de montar), y se actualiza al cambiar el tamaño de la ventana.
 */

'use client';

import { useEffect, useState } from 'react';

/** Breakpoint `md` de Tailwind: desde aquí es escritorio (barra lateral); por debajo, teléfono. */
export const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
