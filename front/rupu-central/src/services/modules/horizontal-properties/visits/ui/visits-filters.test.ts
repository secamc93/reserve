import { describe, expect, it } from 'vitest';
import { patchQuery, readVisitsFilters, visitsQueryFor } from './visits-filters';

const sp = (q: string) => new URLSearchParams(q);

describe('filtros de visitas en la URL', () => {
  it('por defecto: pestaña Hoy con el día de hoy y sin estado', () => {
    expect(readVisitsFilters(sp(''), '2026-10-15')).toEqual({ tab: 'today', state: undefined, q: '', date: '2026-10-15', from: '', to: '', typeId: undefined });
  });

  it('ignora valores inválidos', () => {
    const f = readVisitsFilters(sp('tab=otra&state=volando&date=ayer&type=-3'), '2026-10-15');
    expect(f).toMatchObject({ tab: 'today', state: undefined, date: '2026-10-15', typeId: undefined });
  });

  it('Hoy consulta solo ese día, con estado y búsqueda', () => {
    const f = readVisitsFilters(sp('state=inside&q=casa%20126&date=2026-10-14'), '2026-10-15');
    expect(visitsQueryFor(f)).toEqual({ state: 'inside', search: 'casa 126', startDate: '2026-10-14', endDate: '2026-10-14' });
  });

  it('Historial usa el rango y el tipo', () => {
    const f = readVisitsFilters(sp('tab=history&from=2026-10-01&to=2026-10-10&type=4'), '2026-10-15');
    expect(visitsQueryFor(f)).toEqual({ state: undefined, search: undefined, startDate: '2026-10-01', endDate: '2026-10-10', visitTypeId: 4 });
  });

  it('cambiar un filtro vuelve a la página 1 y conserva el tamaño de página', () => {
    const qs = new URLSearchParams(patchQuery('page=3&page_size=50&q=ana', { state: 'left', q: undefined }));
    expect(qs.get('page')).toBeNull();
    expect(qs.get('page_size')).toBe('50');
    expect(qs.get('state')).toBe('left');
    expect(qs.get('q')).toBeNull();
  });
});
