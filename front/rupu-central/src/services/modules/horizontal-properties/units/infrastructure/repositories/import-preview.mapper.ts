import type { UnitImportPreview, UnitImportRowStatus } from '../../domain';

export interface BackendImportPreview {
  columns: number;
  total_rows: number;
  ready: number;
  existing: number;
  errors: number;
  coefficient_total: number;
  rows: Array<{
    row: number;
    number: string;
    block: string;
    floor?: number | null;
    unit_type: string;
    coefficient?: number | null;
    status: string;
    message: string;
    duplicate_of?: number;
  }>;
}

/** Convierte la vista previa de importación del back al dominio. */
export function mapBackendImportPreview(data: BackendImportPreview): UnitImportPreview {
  return {
    columns: data.columns ?? 0,
    totalRows: data.total_rows ?? data.rows?.length ?? 0,
    ready: data.ready ?? 0,
    existing: data.existing ?? 0,
    errors: data.errors ?? 0,
    coefficientTotal: data.coefficient_total ?? 0,
    rows: (data.rows ?? []).map((r) => ({
      row: r.row,
      number: r.number ?? '',
      block: r.block ?? '',
      floor: r.floor ?? undefined,
      unitType: r.unit_type ?? '',
      coefficient: r.coefficient ?? undefined,
      status: r.status as UnitImportRowStatus,
      message: r.message ?? '',
      duplicateOf: r.duplicate_of || undefined,
    })),
  };
}
