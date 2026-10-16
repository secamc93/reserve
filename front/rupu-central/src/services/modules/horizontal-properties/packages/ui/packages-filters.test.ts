import { describe, expect, it } from 'vitest';
import { packagesQueryFor, patchQuery, readPackagesFilters } from './packages-filters';

describe('filtros de paquetes en la URL', () => {
  it('lee grupo y búsqueda; ignora grupos inválidos', () => {
    expect(readPackagesFilters(new URLSearchParams('group=pending&q=126'))).toEqual({ group: 'pending', q: '126' });
    expect(readPackagesFilters(new URLSearchParams('group=raro'))).toEqual({ group: undefined, q: '' });
  });

  it('arma la consulta del back', () => {
    expect(packagesQueryFor({ group: 'delivered', q: ' casa 126 ' })).toEqual({ statusGroup: 'delivered', search: 'casa 126' });
    expect(packagesQueryFor({ q: '' })).toEqual({ statusGroup: undefined, search: undefined });
  });

  it('cambiar un filtro vuelve a la página 1', () => {
    const qs = new URLSearchParams(patchQuery('page=4&page_size=20', { group: 'closed' }));
    expect(qs.get('page')).toBeNull();
    expect(qs.get('page_size')).toBe('20');
    expect(qs.get('group')).toBe('closed');
  });
});
