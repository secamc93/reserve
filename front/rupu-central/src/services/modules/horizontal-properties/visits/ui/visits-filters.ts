/**
 * Filtros de la lista de visitas en la URL (sin React ni red). Las pestañas del diseño V1
 * son los filtros: ?tab=today|inside|expected|left|week|all  &q=  &type=<id>
 * (+ page / page_size de la paginación).
 */

import type { GetVisitsParams } from '../domain';

export type VisitsTab = 'today' | 'inside' | 'expected' | 'left' | 'week' | 'all';

export const VISITS_TABS: VisitsTab[] = ['today', 'inside', 'expected', 'left', 'week', 'all'];

export interface VisitsUrlFilters {
  tab: VisitsTab;
  q: string;
  typeId?: number;
}

type Readable = { get(name: string): string | null } | null | undefined;

export function readVisitsFilters(sp: Readable): VisitsUrlFilters {
  const tab = (sp?.get('tab') ?? '') as VisitsTab;
  const type = Number.parseInt(sp?.get('type') ?? '', 10);
  return {
    tab: VISITS_TABS.includes(tab) ? tab : 'today',
    q: sp?.get('q') ?? '',
    typeId: Number.isFinite(type) && type > 0 ? type : undefined,
  };
}

/** Lunes y domingo (YYYY-MM-DD) de la semana de `day`. */
export function weekRange(day: string): { start: string; end: string } {
  const d = new Date(`${day}T00:00:00Z`);
  const offset = (d.getUTCDay() + 6) % 7; // lunes = 0
  const start = new Date(d.getTime() - offset * 86_400_000);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

/** Parámetros de la consulta al back (sin token ni paginación). */
export function visitsQueryFor(
  f: VisitsUrlFilters,
  today: string,
): Pick<GetVisitsParams, 'state' | 'search' | 'startDate' | 'endDate' | 'visitTypeId'> {
  const common = { search: f.q.trim() || undefined, visitTypeId: f.typeId };
  switch (f.tab) {
    case 'inside':
      // Dentro ahora, sin importar el día programado
      return { ...common, state: 'inside' };
    case 'expected':
      return { ...common, state: 'expected', startDate: today, endDate: today };
    case 'left':
      return { ...common, state: 'left', startDate: today, endDate: today };
    case 'week': {
      const { start, end } = weekRange(today);
      return { ...common, startDate: start, endDate: end };
    }
    case 'all':
      return common;
    default:
      return { ...common, startDate: today, endDate: today };
  }
}

/**
 * Query string con los cambios aplicados (un valor vacío o undefined borra el parámetro).
 * Cualquier cambio de filtro vuelve a la página 1 (se conserva page_size).
 */
export function patchQuery(current: string | { toString(): string } | null | undefined, patch: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams(current ? current.toString() : '');
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null || v === '') params.delete(k);
    else params.set(k, String(v));
  }
  params.delete('page');
  return params.toString();
}
