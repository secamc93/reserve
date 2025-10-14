/**
 * Server Action: Importar Unidades desde Excel
 */

'use server';

import { env } from '@shared/config';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/utils';

export interface ImportUnitsFromExcelInput {
  token: string;
  hpId: number;
  file: File;
}

export interface ImportUnitsResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    created: number;
    skipped: number;
    errors: string[];
  };
  error?: string;
}

export async function importUnitsFromExcelAction(
  input: ImportUnitsFromExcelInput
): Promise<ImportUnitsResponse> {
  try {
    const { token, hpId, file } = input;
    const url = `${env.API_BASE_URL}/horizontal-properties/${hpId}/property-units/import-excel`;
    const startTime = Date.now();

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);

    logHttpRequest({
      method: 'POST',
      url,
      token,
      body: `FormData con archivo Excel: ${file.name}`,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO incluir Content-Type, el browser lo establecerá automáticamente con el boundary para multipart/form-data
      },
      body: formData,
    });

    const duration = Date.now() - startTime;
    const backendResponse = await response.json();

    if (!response.ok || !backendResponse.success) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data: backendResponse,
      });
      
      return {
        success: false,
        message: backendResponse.message || 'Error importando unidades desde Excel',
        error: backendResponse.error,
      };
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Importación completada: ${backendResponse.data?.created || 0} de ${backendResponse.data?.total || 0} unidades creadas`,
      data: backendResponse,
    });

    return {
      success: true,
      message: backendResponse.message,
      data: backendResponse.data,
    };
  } catch (error) {
    console.error('Error en importUnitsFromExcelAction:', error);
    return {
      success: false,
      message: 'Error inesperado al importar unidades desde Excel',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
