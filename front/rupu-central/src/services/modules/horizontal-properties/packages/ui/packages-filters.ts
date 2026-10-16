/**
 * Filtros de la lista de paquetes en la URL (sin React ni red):
 *   ?group=pending|delivered|closed  &q=  (+ page / page_size)
 * Sin grupo se ven todos, con los por entregar primero (orden del back).
 */

import type { GetPackagesParams, PackageStatusGroup } from '../domain';
import { PACKAGE_GROUP_ORDER } from './package-state';

export interface PackagesUrlFilters {
  group?: PackageStatusGroup;
  q: string;
}

type Readable = { get(name: string): string | null } | null | undefined;

export function readPackagesFilters(sp: Readable): PackagesUrlFilters {
  const group = (sp?.get('group') ?? '') as PackageStatusGroup;
  return { group: PACKAGE_GROUP_ORDER.includes(group) ? group : undefined, q: sp?.get('q') ?? '' };
}

export function packagesQueryFor(f: PackagesUrlFilters): Pick<GetPackagesParams, 'statusGroup' | 'search'> {
  return { statusGroup: f.group, search: f.q.trim() || undefined };
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
