/**
 * Filtros de la lista de visitas en la URL (sin React ni red):
 *   ?tab=today|history  &state=inside|expected|left|cancelled  &q=  &date=YYYY-MM-DD
 *   &from=&to=&type=<id>  (+ page / page_size de la paginación)
 */

import type { GetVisitsParams, VisitState } from '../domain';
import { VISIT_STATE_ORDER } from './visit-state';

export type VisitsTab = 'today' | 'history';

export interface VisitsUrlFilters {
  tab: VisitsTab;
  state?: VisitState;
  q: string;
  /** Día de la pestaña "Hoy" (por defecto hoy). */
  date: string;
  from: string;
  to: string;
  typeId?: number;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Readable = { get(name: string): string | null } | null | undefined;

export function readVisitsFilters(sp: Readable, today: string): VisitsUrlFilters {
  const get = (k: string) => sp?.get(k) ?? '';
  const state = get('state') as VisitState;
  const type = Number.parseInt(get('type'), 10);
  const date = get('date');
  return {
    tab: get('tab') === 'history' ? 'history' : 'today',
    state: VISIT_STATE_ORDER.includes(state) ? state : undefined,
    q: get('q'),
    date: DATE_RE.test(date) ? date : today,
    from: DATE_RE.test(get('from')) ? get('from') : '',
    to: DATE_RE.test(get('to')) ? get('to') : '',
    typeId: Number.isFinite(type) && type > 0 ? type : undefined,
  };
}

/** Parámetros de la consulta al back (sin token ni paginación). */
export function visitsQueryFor(f: VisitsUrlFilters): Pick<GetVisitsParams, 'state' | 'search' | 'startDate' | 'endDate' | 'visitTypeId'> {
  if (f.tab === 'today') {
    return { state: f.state, search: f.q || undefined, startDate: f.date, endDate: f.date };
  }
  return {
    state: f.state,
    search: f.q || undefined,
    startDate: f.from || undefined,
    endDate: f.to || undefined,
    visitTypeId: f.typeId,
  };
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
