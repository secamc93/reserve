/**
 * Repositorio para Generar Contraseña
 * Maneja la generación de nuevas contraseñas para usuarios
 * IMPORTANTE: Este archivo es server-only
 */

import { GeneratePasswordParams, GeneratePasswordResponse } from '../../../domain/entities/generate-password.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export class GeneratePasswordRepository {
  async generatePassword(params: GeneratePasswordParams): Promise<GeneratePasswordResponse> {
    const { token, user_id } = params;

    const url = `${env.API_BASE_URL}/auth/generate-password`;
    const startTime = Date.now();

    const requestBody: { user_id?: number } = {};
    if (user_id !== undefined) {
      requestBody.user_id = user_id;
    }

    logHttpRequest({
      method: 'POST',
      url,
      token,
      body: requestBody,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.error || errorData.message || `Error generando contraseña: ${response.status}`);
      }

      const backendResponse: GeneratePasswordResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Contraseña generada para ${backendResponse.email}`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Error generando contraseña');
      }

      return backendResponse;
    } catch (error) {
      console.error('Error generando contraseña:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al generar contraseña del servidor'
      );
    }
  }
}

