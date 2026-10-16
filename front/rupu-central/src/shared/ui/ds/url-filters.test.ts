import { describe, expect, it } from 'vitest';
import { applyFilterPatch } from './url-filters';

describe('applyFilterPatch', () => {
  it('agrega el filtro, vuelve a la página 1 y conserva page_size y otros params', () => {
    const qs = new URLSearchParams(applyFilterPatch('page=3&page_size=50&vista=bloques', { bloque: 'Casa' }));
    expect(qs.get('bloque')).toBe('Casa');
    expect(qs.get('page')).toBeNull();
    expect(qs.get('page_size')).toBe('50');
    expect(qs.get('vista')).toBe('bloques');
  });

  it('un valor vacío o null borra el parámetro', () => {
    expect(applyFilterPatch('q=12&bloque=Casa', { q: '', bloque: null })).toBe('');
  });
});
