/**
 * Filtros de la lista de paquetes en la URL (sin React ni red). Las pestañas del diseño P1 son
 * los filtros: ?tab=pending|today|all  &q=  (+ page / page_size).
 *   pending (por defecto): por entregar, del más antiguo al más reciente.
 *   today: entregados hoy.  all: todos (por entregar primero).
 */

import type { GetPackagesParams } from '../domain';

export type PackagesTab = 'pending' | 'today' | 'all';
export const PACKAGES_TABS: PackagesTab[] = ['pending', 'today', 'all'];

export interface PackagesUrlFilters {
  tab: PackagesTab;
  q: string;
}

type Readable = { get(name: string): string | null } | null | undefined;

export function readPackagesFilters(sp: Readable): PackagesUrlFilters {
  const tab = (sp?.get('tab') ?? '') as PackagesTab;
  return { tab: PACKAGES_TABS.includes(tab) ? tab : 'pending', q: sp?.get('q') ?? '' };
}

export function packagesQueryFor(f: PackagesUrlFilters): Pick<GetPackagesParams, 'statusGroup' | 'search' | 'deliveredToday'> {
  const search = f.q.trim() || undefined;
  if (f.tab === 'pending') return { statusGroup: 'pending', search };
  if (f.tab === 'today') return { statusGroup: 'delivered', deliveredToday: true, search };
  return { search };
}

/** Query string con los cambios aplicados; un cambio de filtro vuelve a la página 1. */
export function patchQuery(current: string | { toString(): string } | null | undefined, patch: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams(current ? current.toString() : '');
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null || v === '') params.delete(k);
    else params.set(k, String(v));
  }
  params.delete('page');
  return params.toString();
}
