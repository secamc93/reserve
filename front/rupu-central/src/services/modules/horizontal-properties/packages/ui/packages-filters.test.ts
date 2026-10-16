import { describe, expect, it } from 'vitest';
import { packagesQueryFor, patchQuery, readPackagesFilters } from './packages-filters';

describe('pestañas de paquetes en la URL', () => {
  it('por defecto "Por entregar"; ignora pestañas inválidas', () => {
    expect(readPackagesFilters(new URLSearchParams(''))).toEqual({ tab: 'pending', q: '' });
    expect(readPackagesFilters(new URLSearchParams('tab=raro&q=126'))).toEqual({ tab: 'pending', q: '126' });
  });

  it('arma la consulta del back por pestaña', () => {
    expect(packagesQueryFor({ tab: 'pending', q: ' casa 126 ' })).toEqual({ statusGroup: 'pending', search: 'casa 126' });
    expect(packagesQueryFor({ tab: 'today', q: '' })).toEqual({ statusGroup: 'delivered', deliveredToday: true, search: undefined });
    expect(packagesQueryFor({ tab: 'all', q: '' })).toEqual({ search: undefined });
  });

  it('cambiar un filtro vuelve a la página 1', () => {
    const qs = new URLSearchParams(patchQuery('page=4&page_size=20', { tab: 'today' }));
    expect(qs.get('page')).toBeNull();
    expect(qs.get('page_size')).toBe('20');
    expect(qs.get('tab')).toBe('today');
  });
});
