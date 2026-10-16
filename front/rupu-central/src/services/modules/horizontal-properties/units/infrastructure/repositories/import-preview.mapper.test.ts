import { describe, expect, it } from 'vitest';
import { mapBackendImportPreview } from './import-preview.mapper';

describe('vista previa de importación', () => {
  it('convierte filas y totales del back', () => {
    const p = mapBackendImportPreview({
      columns: 5,
      total_rows: 2,
      ready: 1,
      existing: 0,
      errors: 1,
      coefficient_total: 99.91,
      rows: [
        { row: 2, number: '126', block: 'Casa', floor: null, unit_type: 'house', coefficient: 0.503, status: 'ready', message: '' },
        { row: 3, number: '126', block: 'Casa', floor: 2, unit_type: '', coefficient: null, status: 'duplicate', message: 'Número duplicado (fila 2)', duplicate_of: 2 },
      ],
    });
    expect(p).toMatchObject({ columns: 5, totalRows: 2, ready: 1, errors: 1, coefficientTotal: 99.91 });
    expect(p.rows[0]).toEqual({ row: 2, number: '126', block: 'Casa', floor: undefined, unitType: 'house', coefficient: 0.503, status: 'ready', message: '', duplicateOf: undefined });
    expect(p.rows[1]).toMatchObject({ floor: 2, coefficient: undefined, status: 'duplicate', duplicateOf: 2 });
  });
});
