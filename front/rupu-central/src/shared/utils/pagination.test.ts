import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  buildPaginationQuery,
  formatShowing,
  getPageItems,
  getPageSizeOptions,
  getShowingRange,
  getTotalPages,
  fetchAllPages,
  normalizePage,
  normalizePageSize,
  normalizePaginationParams,
  paginationFromSearchParams,
  parseGoToPage,
} from './pagination';

describe('constantes', () => {
  it('predeterminado 10, máximo 200 y opciones 10/20/50/100/200', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(10);
    expect(MAX_PAGE_SIZE).toBe(200);
    expect([...PAGE_SIZE_OPTIONS]).toEqual([10, 20, 50, 100, 200]);
  });
});

describe('normalizePageSize', () => {
  it.each([
    [undefined, 10],
    [null, 10],
    ['', 10],
    ['abc', 10],
    ['NaN', 10],
    [Number.NaN, 10],
    [Number.POSITIVE_INFINITY, 10],
    [0, 10],
    ['0', 10],
    [-5, 10],
    ['-1', 10],
    [1, 1],
    ['1', 1],
    [10, 10],
    ['20', 20],
    [15, 15],
    [199, 199],
    [200, 200],
    ['200', 200],
    [201, 200],
    ['201', 200],
    ['500', 200],
    [1_000_000, 200],
    ['12.5', 10],
    [12.9, 12],
    ['  50 ', 50],
    [['30', '40'], 30],
  ])('%j → %i', (raw, expected) => {
    expect(normalizePageSize(raw as never)).toBe(expected);
  });
});

describe('normalizePage', () => {
  it.each([
    [undefined, 1],
    [null, 1],
    ['abc', 1],
    [Number.NaN, 1],
    [0, 1],
    ['0', 1],
    [-3, 1],
    ['-3', 1],
    [1, 1],
    ['7', 7],
    [9999, 9999],
    ['1e3', 1],
  ])('%j → %i', (raw, expected) => {
    expect(normalizePage(raw as never)).toBe(expected);
  });
});

describe('normalizePaginationParams / paginationFromSearchParams', () => {
  it('sin params usa página 1 y 10 filas', () => {
    expect(normalizePaginationParams()).toEqual({ page: 1, pageSize: 10 });
    expect(paginationFromSearchParams(new URLSearchParams(''))).toEqual({ page: 1, pageSize: 10 });
    expect(paginationFromSearchParams(null)).toEqual({ page: 1, pageSize: 10 });
  });

  it('lee page y page_size de la URL y los normaliza', () => {
    expect(paginationFromSearchParams(new URLSearchParams('page=3&page_size=50'))).toEqual({ page: 3, pageSize: 50 });
    expect(paginationFromSearchParams(new URLSearchParams('page=-2&page_size=500'))).toEqual({ page: 1, pageSize: 200 });
    expect(normalizePaginationParams({ page: 'x', page_size: '0' })).toEqual({ page: 1, pageSize: 10 });
  });
});

describe('getTotalPages', () => {
  it.each([
    [0, 10, 1],
    [-4, 10, 1],
    [Number.NaN, 10, 1],
    [1, 10, 1],
    [10, 10, 1],
    [11, 10, 2],
    [137, 10, 14],
    [137, 200, 1],
    [400, 200, 2],
    [401, 200, 3],
    [25, 0, 3], // tamaño inválido → 10
    [500, 500, 3], // tamaño > 200 → 200
  ])('total %i, tamaño %i → %i páginas', (total, size, expected) => {
    expect(getTotalPages(total, size)).toBe(expected);
  });
});

describe('getShowingRange / formatShowing', () => {
  it('página intermedia', () => {
    expect(getShowingRange(2, 10, 137)).toEqual({ from: 11, to: 20, total: 137 });
    expect(formatShowing(2, 10, 137)).toBe('Mostrando 11–20 de 137');
  });

  it('primera página', () => {
    expect(formatShowing(1, 10, 137)).toBe('Mostrando 1–10 de 137');
  });

  it('última página incompleta', () => {
    expect(getShowingRange(14, 10, 137)).toEqual({ from: 131, to: 137, total: 137 });
    expect(formatShowing(14, 10, 137)).toBe('Mostrando 131–137 de 137');
  });

  it('un solo registro', () => {
    expect(formatShowing(1, 10, 1)).toBe('Mostrando 1–1 de 1');
  });

  it('total 0 → sin resultados', () => {
    expect(getShowingRange(1, 10, 0)).toEqual({ from: 0, to: 0, total: 0 });
    expect(formatShowing(1, 10, 0)).toBe('Sin resultados');
    expect(formatShowing(1, 10, -3)).toBe('Sin resultados');
  });

  it('página fuera de rango no inventa registros', () => {
    expect(getShowingRange(5, 10, 20)).toEqual({ from: 0, to: 0, total: 20 });
    expect(formatShowing(5, 10, 20)).toBe('Mostrando 0 de 20');
  });

  it('normaliza page y tamaño antes de calcular', () => {
    expect(formatShowing(0, 0, 25)).toBe('Mostrando 1–10 de 25');
    expect(formatShowing(1, 500, 450)).toBe('Mostrando 1–200 de 450');
    expect(formatShowing(3, 200, 450)).toBe('Mostrando 401–450 de 450');
  });
});

describe('getPageItems', () => {
  it('pocas páginas: todas, sin elipsis', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(1, 0)).toEqual([1]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('en medio: 1 … 4 5 6 … 20', () => {
    expect(getPageItems(5, 20)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 20]);
  });

  it('cerca del inicio: solo elipsis final', () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
    expect(getPageItems(4, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
  });

  it('cerca del final: solo elipsis inicial', () => {
    expect(getPageItems(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20]);
    expect(getPageItems(17, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20]);
  });

  it('longitud constante con muchas páginas', () => {
    for (let p = 1; p <= 50; p++) expect(getPageItems(p, 50)).toHaveLength(7);
  });

  it('acota la página actual al rango', () => {
    expect(getPageItems(99, 20)).toEqual(getPageItems(20, 20));
    expect(getPageItems(-1, 20)).toEqual(getPageItems(1, 20));
    expect(getPageItems(Number.NaN, 20)).toEqual(getPageItems(1, 20));
  });

  it('más vecinos amplían la ventana', () => {
    expect(getPageItems(10, 20, 2)).toEqual([1, 'ellipsis-start', 8, 9, 10, 11, 12, 'ellipsis-end', 20]);
  });
});

describe('parseGoToPage', () => {
  it.each([
    ['1', 14, 1],
    ['14', 14, 14],
    [' 7 ', 14, 7],
    ['15', 14, null],
    ['0', 14, null],
    ['-1', 14, null],
    ['', 14, null],
    ['abc', 14, null],
    ['2.5', 14, null],
    ['1', 0, 1],
    ['2', 1, null],
  ])('"%s" con %i páginas → %j', (input, total, expected) => {
    expect(parseGoToPage(input, total)).toBe(expected);
  });
});

describe('buildPaginationQuery', () => {
  it('cambia la página y conserva los demás filtros', () => {
    const qs = new URLSearchParams(buildPaginationQuery('status=open&page=1&page_size=20', { page: 3 }));
    expect(qs.get('page')).toBe('3');
    expect(qs.get('page_size')).toBe('20');
    expect(qs.get('status')).toBe('open');
  });

  it('cambiar el tamaño vuelve a la página 1', () => {
    const qs = new URLSearchParams(buildPaginationQuery('q=a&page=7&page_size=10', { pageSize: 50 }));
    expect(qs.get('page')).toBe('1');
    expect(qs.get('page_size')).toBe('50');
    expect(qs.get('q')).toBe('a');
  });

  it('normaliza los valores que escribe', () => {
    expect(new URLSearchParams(buildPaginationQuery('', { pageSize: 999 })).get('page_size')).toBe('200');
    expect(new URLSearchParams(buildPaginationQuery(null, { page: 0 })).get('page')).toBe('1');
  });

  it('acepta un URLSearchParams', () => {
    expect(buildPaginationQuery(new URLSearchParams('a=1'), { page: 2 })).toBe('a=1&page=2');
  });
});

describe('getPageSizeOptions', () => {
  it('opciones estándar', () => {
    expect(getPageSizeOptions(10)).toEqual([10, 20, 50, 100, 200]);
  });

  it('agrega el tamaño actual si llegó uno válido fuera de la lista', () => {
    expect(getPageSizeOptions(15)).toEqual([10, 15, 20, 50, 100, 200]);
  });

  it('nunca ofrece más de 200', () => {
    expect(getPageSizeOptions(500)).toEqual([10, 20, 50, 100, 200]);
  });
});

describe('fetchAllPages', () => {
  /** Back simulado con `n` registros que responde páginas como el real. */
  function fakeBack(n: number, report: 'total' | 'totalPages' | 'none' = 'totalPages') {
    const calls: Array<[number, number]> = [];
    const data = Array.from({ length: n }, (_, i) => i + 1);
    const fetchPage = async (page: number, pageSize: number) => {
      calls.push([page, pageSize]);
      const items = data.slice((page - 1) * pageSize, page * pageSize);
      if (report === 'total') return { items, total: n };
      if (report === 'totalPages') return { items, totalPages: Math.max(1, Math.ceil(n / pageSize)) };
      return { items };
    };
    return { calls, fetchPage };
  }

  it('recorre páginas de 200 hasta traer todo', async () => {
    const { calls, fetchPage } = fakeBack(450);
    const all = await fetchAllPages(fetchPage);
    expect(all).toHaveLength(450);
    expect(all[449]).toBe(450);
    expect(calls).toEqual([[1, 200], [2, 200], [3, 200]]);
  });

  it('total exacto múltiplo de 200 no pide una página de más (con total o totalPages)', async () => {
    for (const report of ['total', 'totalPages'] as const) {
      const { calls, fetchPage } = fakeBack(400, report);
      expect(await fetchAllPages(fetchPage)).toHaveLength(400);
      expect(calls).toHaveLength(2);
    }
  });

  it('sin metadatos para en la primera página incompleta o vacía', async () => {
    const a = fakeBack(250, 'none');
    expect(await fetchAllPages(a.fetchPage)).toHaveLength(250);
    expect(a.calls).toHaveLength(2);
    const b = fakeBack(400, 'none');
    expect(await fetchAllPages(b.fetchPage)).toHaveLength(400);
    expect(b.calls).toHaveLength(3); // la tercera llega vacía
  });

  it('cero registros: una sola llamada', async () => {
    const { calls, fetchPage } = fakeBack(0);
    expect(await fetchAllPages(fetchPage)).toEqual([]);
    expect(calls).toHaveLength(1);
  });

  it('nunca pide más de 200 por página y respeta el tope de páginas', async () => {
    const { calls, fetchPage } = fakeBack(100_000);
    const all = await fetchAllPages(fetchPage, { pageSize: 1000, maxPages: 3 });
    expect(all).toHaveLength(600);
    expect(calls.every(([, size]) => size === 200)).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it('tope por defecto: 50 páginas', async () => {
    const { calls, fetchPage } = fakeBack(100_000);
    expect(await fetchAllPages(fetchPage)).toHaveLength(10_000);
    expect(calls).toHaveLength(50);
  });

  it('propaga el error del back', async () => {
    await expect(fetchAllPages(async () => { throw new Error('400 page_size'); })).rejects.toThrow('400 page_size');
  });
});
