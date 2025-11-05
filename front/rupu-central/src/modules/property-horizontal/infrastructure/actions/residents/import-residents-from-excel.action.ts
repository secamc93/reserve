/**
 * Server Action: Importar Residentes desde Excel
 */

'use server';

import { env } from '@shared/config';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/utils';

export interface ImportResidentsFromExcelInput {
  token: string;
  businessId: number;
  file: File;
}

export interface ImportResidentsResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    created: number;
    errors: string[];
  };
  error?: string;
  details?: string[];
}

export async function importResidentsFromExcelAction(
  input: ImportResidentsFromExcelInput
): Promise<ImportResidentsResponse> {
  try {
    const { token, businessId, file } = input;
    const url = `${env.API_BASE_URL}/horizontal-properties/residents/import-excel?business_id=${businessId}`;
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
        message: backendResponse.message || 'Error importando residentes desde Excel',
        error: backendResponse.error,
        details: backendResponse.details,
      };
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Importación completada: ${backendResponse.data?.created || 0} de ${backendResponse.data?.total || 0} residentes creados`,
      data: backendResponse,
    });

    return {
      success: true,
      message: backendResponse.message,
      data: backendResponse.data,
    };
  } catch (error) {
    console.error('Error en importResidentsFromExcelAction:', error);
    return {
      success: false,
      message: 'Error inesperado al importar residentes desde Excel',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

