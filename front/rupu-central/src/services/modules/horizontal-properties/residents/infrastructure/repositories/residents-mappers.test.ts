import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/config', () => ({ env: { API_BASE_URL: 'http://api' }, logHttpRequest: vi.fn(), logHttpSuccess: vi.fn(), logHttpError: vi.fn() }));

import { ResidentsRepository, mapBackendResidentListItem, mapBackendResidentsSummary } from './residents.repository';

describe('mappers de residentes', () => {
  it('el listado trae bloque y documento', () => {
    const r = mapBackendResidentListItem({
      id: 1, property_unit_number: '126', property_unit_block: 'Casa', dni: '123', resident_type_name: 'Propietario',
      name: 'Ana', email: 'a@b.co', is_main_resident: true, is_active: true,
    });
    expect(r).toMatchObject({ propertyUnitNumber: '126', propertyUnitBlock: 'Casa', dni: '123', residentTypeName: 'Propietario' });
  });

  it('el resumen conserva los ids reales del catálogo', () => {
    expect(
      mapBackendResidentsSummary({ total: 3, active: 2, inactive: 1, main: 2, types: [{ resident_type_id: 5, name: 'Propietario', code: 'owner', total: 3 }] }),
    ).toEqual({ total: 3, active: 2, inactive: 1, main: 2, types: [{ id: 5, name: 'Propietario', code: 'owner', total: 3 }] });
  });

  it('el listado envía el filtro de documento', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: '', data: { residents: [], total: 0, page: 1, page_size: 10, total_pages: 0 } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await new ResidentsRepository().getResidents({ businessId: 7, token: 'T', dni: '123', page: 1, pageSize: 10 });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('dni')).toBe('123');
    expect(url.searchParams.get('business_id')).toBe('7');
    vi.unstubAllGlobals();
  });
});
