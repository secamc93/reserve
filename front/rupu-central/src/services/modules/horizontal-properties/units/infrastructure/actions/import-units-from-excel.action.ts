/**
 * Server Actions: importar unidades desde Excel (vista previa y carga).
 */

'use server';

import { env } from '@shared/config';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/utils';
import type { UnitImportPreview } from '../../domain';
import { mapBackendImportPreview, type BackendImportPreview } from '../repositories/import-preview.mapper';

export interface ImportUnitsFromExcelInput {
  token: string;
  businessId: number;
  file: File;
  /** Actualizar las unidades que ya existen con el mismo número (si no, se omiten). */
  updateExisting?: boolean;
}

export interface ImportUnitsResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    created: number;
    updated?: number;
    skipped: number;
    errors: string[];
  };
  error?: string;
}

export interface PreviewUnitsImportResponse {
  success: boolean;
  message?: string;
  data?: UnitImportPreview;
  error?: string;
}

/** POST multipart al endpoint de importación (business_id en query y formulario). */
async function postImport(input: ImportUnitsFromExcelInput, extra: Record<string, string>) {
  const { token, businessId, file } = input;
  const url = `${env.API_BASE_URL}/horizontal-properties/property-units/import-excel?business_id=${businessId}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('business_id', String(businessId));
  for (const [k, v] of Object.entries(extra)) formData.append(k, v);

  const startTime = Date.now();
  logHttpRequest({ method: 'POST', url, token, body: `FormData con archivo Excel: ${file.name} ${JSON.stringify(extra)}` });
  // Sin Content-Type: fetch pone el boundary del multipart.
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
  const duration = Date.now() - startTime;
  const body = await response.json();
  if (!response.ok || !body.success) {
    logHttpError({ status: response.status, statusText: response.statusText, duration, data: body });
  } else {
    logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: body });
  }
  return { ok: response.ok && body.success, body };
}

/** Vista previa (dry_run): valida el archivo sin guardar y devuelve el estado por fila. */
export async function previewUnitsImportAction(input: ImportUnitsFromExcelInput): Promise<PreviewUnitsImportResponse> {
  try {
    const { ok, body } = await postImport(input, { dry_run: 'true' });
    if (!ok) return { success: false, message: body.message || 'No se pudo revisar el archivo', error: body.error };
    return { success: true, message: body.message, data: mapBackendImportPreview(body.data as BackendImportPreview) };
  } catch (error) {
    return { success: false, message: 'Error inesperado al revisar el archivo', error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/** Importa las unidades del archivo. */
export async function importUnitsFromExcelAction(input: ImportUnitsFromExcelInput): Promise<ImportUnitsResponse> {
  try {
    const { ok, body } = await postImport(input, input.updateExisting ? { update_existing: 'true' } : {});
    if (!ok) return { success: false, message: body.message || 'Error importando unidades desde Excel', error: body.error };
    return { success: true, message: body.message, data: body.data };
  } catch (error) {
    return { success: false, message: 'Error inesperado al importar unidades desde Excel', error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
