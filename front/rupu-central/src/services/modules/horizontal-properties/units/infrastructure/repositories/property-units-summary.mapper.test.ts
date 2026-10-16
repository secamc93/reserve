import { describe, expect, it, vi } from 'vitest';

vi.mock('@shared/config', () => ({ env: { API_BASE_URL: 'http://api' }, logHttpRequest: vi.fn(), logHttpSuccess: vi.fn(), logHttpError: vi.fn() }));

import { PropertyUnitsRepository, mapBackendPropertyUnitsSummary } from './property-units.repository';

describe('resumen de unidades (mapper y repositorio)', () => {
  it('convierte el resumen del back al dominio', () => {
    expect(
      mapBackendPropertyUnitsSummary({
        total: 194,
        active: 193,
        with_residents: 190,
        coefficient_sum: 100,
        commercial: 2,
        blocks: [{ block: 'Casa', total: 156, active: 156, coefficient_sum: 78.568 }],
      }),
    ).toEqual({ total: 194, active: 193, withResidents: 190, coefficientSum: 100, commercial: 2, blocks: [{ block: 'Casa', total: 156, active: 156, coefficientSum: 78.568 }] });
  });

  it('pide el resumen con el business_id y el token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: '', data: { total: 1, active: 1, with_residents: 0, coefficient_sum: 1, blocks: [] } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await new PropertyUnitsRepository().getPropertyUnitsSummary({ businessId: 7, token: 'T' });
    expect(fetchMock.mock.calls[0][0]).toBe('http://api/horizontal-properties/property-units/summary?business_id=7');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer T');
    expect(res.total).toBe(1);
    vi.unstubAllGlobals();
  });

  it('crear unidad envía participation_coefficient', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true, message: '', data: { id: 1, business_id: 7, number: '126', unit_type: 'house', is_active: true, created_at: '', updated_at: '' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await new PropertyUnitsRepository().createPropertyUnit({ businessId: 7, token: 'T', data: { number: '126', unitType: 'house', block: 'Casa', coefficient: 0.503 } });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ business_id: 7, number: '126', block: 'Casa', participation_coefficient: 0.503 });
    vi.unstubAllGlobals();
  });
});
