import { describe, expect, it } from 'vitest';
import { mapBackendPackageList, mapBackendPackagesSummary } from './package-list.mapper';

describe('mapper de la lista de paquetes', () => {
  it('trae bloque y descripción; null pasa a undefined', () => {
    const p = mapBackendPackageList({
      id: 3,
      tracking_number: 'SV-123',
      carrier: 'Servientrega',
      property_unit_number: '126',
      property_unit_block: 'Casa',
      resident_name: '',
      status_name: 'Recibido',
      status_code: 'received',
      description: 'Caja mediana',
      received_at: '2026-10-15T10:00:00Z',
      delivered_at: null,
      created_at: '2026-10-15T10:00:00Z',
    });
    expect(p).toMatchObject({ propertyUnitBlock: 'Casa', propertyUnitNumber: '126', description: 'Caja mediana', statusCode: 'received' });
    expect(p.deliveredAt).toBeUndefined();
  });

  it('resumen', () => {
    expect(mapBackendPackagesSummary({ pending: 12, pending_overdue: 3, delivered_today: 8, delivered: 40, closed: 2, total: 54 })).toEqual({
      pending: 12,
      pendingOverdue: 3,
      deliveredToday: 8,
      delivered: 40,
      closed: 2,
      total: 54,
    });
  });
});
