import { describe, expect, it } from 'vitest';
import { patchQuery, readVisitsFilters, visitsQueryFor, weekRange } from './visits-filters';

const sp = (q: string) => new URLSearchParams(q);
const TODAY = '2026-10-15'; // jueves

describe('pestañas de visitas en la URL', () => {
  it('por defecto: Hoy', () => {
    expect(readVisitsFilters(sp(''))).toEqual({ tab: 'today', q: '', typeId: undefined });
    expect(readVisitsFilters(sp('tab=otra&type=-3'))).toEqual({ tab: 'today', q: '', typeId: undefined });
  });

  it('Hoy, Esperadas y Salieron consultan solo hoy; Dentro, cualquier día', () => {
    expect(visitsQueryFor(readVisitsFilters(sp('')), TODAY)).toMatchObject({ startDate: TODAY, endDate: TODAY });
    expect(visitsQueryFor(readVisitsFilters(sp('')), TODAY).state).toBeUndefined();
    expect(visitsQueryFor(readVisitsFilters(sp('tab=expected')), TODAY)).toMatchObject({ state: 'expected', startDate: TODAY, endDate: TODAY });
    expect(visitsQueryFor(readVisitsFilters(sp('tab=left')), TODAY)).toMatchObject({ state: 'left', startDate: TODAY });
    const inside = visitsQueryFor(readVisitsFilters(sp('tab=inside')), TODAY);
    expect(inside).toMatchObject({ state: 'inside' });
    expect(inside.startDate).toBeUndefined();
  });

  it('Semana va de lunes a domingo; Todas sin fechas; tipo y búsqueda en todas', () => {
    expect(weekRange(TODAY)).toEqual({ start: '2026-10-12', end: '2026-10-18' });
    expect(weekRange('2026-10-18')).toEqual({ start: '2026-10-12', end: '2026-10-18' });
    expect(visitsQueryFor(readVisitsFilters(sp('tab=week&type=4&q=kjm')), TODAY)).toEqual({
      search: 'kjm',
      visitTypeId: 4,
      startDate: '2026-10-12',
      endDate: '2026-10-18',
    });
    expect(visitsQueryFor(readVisitsFilters(sp('tab=all')), TODAY)).toEqual({ search: undefined, visitTypeId: undefined });
  });

  it('cambiar un filtro vuelve a la página 1 y conserva el tamaño de página', () => {
    const qs = new URLSearchParams(patchQuery('page=3&page_size=50&q=ana', { tab: 'left', q: undefined }));
    expect(qs.get('page')).toBeNull();
    expect(qs.get('page_size')).toBe('50');
    expect(qs.get('tab')).toBe('left');
    expect(qs.get('q')).toBeNull();
  });
});
