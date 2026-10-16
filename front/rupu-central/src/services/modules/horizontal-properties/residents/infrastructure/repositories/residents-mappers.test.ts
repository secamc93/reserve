import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/config', () => ({ env: { API_BASE_URL: 'http://api' }, logHttpRequest: vi.fn(), logHttpSuccess: vi.fn(), logHttpError: vi.fn() }));

import { ResidentsRepository, mapBackendResidentListItem, mapBackendResidentOverview, mapBackendResidentsSummary } from './residents.repository';

describe('mappers de residentes', () => {
  it('el listado trae bloque y documento', () => {
    const r = mapBackendResidentListItem({
      id: 1, property_unit_number: '126', property_unit_block: 'Casa', dni: '123', resident_type_name: 'Propietario',
      name: 'Ana', email: 'a@b.co', is_main_resident: true, is_active: true, since: '2021-03-01T00:00:00Z',
    });
    expect(r).toMatchObject({ propertyUnitNumber: '126', propertyUnitBlock: 'Casa', dni: '123', residentTypeName: 'Propietario', since: '2021-03-01T00:00:00Z' });
  });

  it('el resumen conserva los ids reales del catálogo', () => {
    expect(
      mapBackendResidentsSummary({ total: 3, active: 2, inactive: 1, main: 2, without_email: 1, types: [{ resident_type_id: 5, name: 'Propietario', code: 'owner', total: 3 }] }),
    ).toEqual({ total: 3, active: 2, inactive: 1, main: 2, withoutEmail: 1, types: [{ id: 5, name: 'Propietario', code: 'owner', total: 3 }] });
  });

  it('el resumen del residente (panel de detalle)', () => {
    expect(
      mapBackendResidentOverview({
        stats: { visits_30d: 3, packages_pending: 1, reservations: 0, votes_cast: 4, votes_total: 4 },
        housemates: [{ id: 2, name: 'Luis', type_name: 'Familiar', is_main: false }],
        activity: [{ kind: 'package', title: 'Paquete recibido', subtitle: 'DHL', at: '2026-10-12T10:00:00Z' }],
      }),
    ).toEqual({
      stats: { visits30d: 3, packagesPending: 1, reservations: 0, votesCast: 4, votesTotal: 4 },
      housemates: [{ id: 2, name: 'Luis', typeName: 'Familiar', isMain: false }],
      activity: [{ kind: 'package', title: 'Paquete recibido', subtitle: 'DHL', at: '2026-10-12T10:00:00Z' }],
    });
  });

  it('el listado envía la búsqueda general, la torre y "sin correo"', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: '', data: { residents: [], total: 0, page: 1, page_size: 10, total_pages: 0 } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await new ResidentsRepository().getResidents({ businessId: 7, token: 'T', query: 'ana', block: 'Casa', withoutEmail: true });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('q')).toBe('ana');
    expect(url.searchParams.get('property_unit_block')).toBe('Casa');
    expect(url.searchParams.get('without_email')).toBe('true');
    vi.unstubAllGlobals();
  });

  it('el resumen del residente se pide con su id y la propiedad', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: '', data: { stats: {}, housemates: [], activity: [] } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await new ResidentsRepository().getResidentOverview({ businessId: 7, residentId: 5, token: 'T' });
    expect(fetchMock.mock.calls[0][0]).toBe('http://api/horizontal-properties/residents/5/overview?business_id=7');
    vi.unstubAllGlobals();
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
