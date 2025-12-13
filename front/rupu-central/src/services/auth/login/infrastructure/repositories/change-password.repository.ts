/**
 * Repositorio de Cambio de Contraseña
 * Maneja el cambio de contraseña de usuarios autenticados
 * IMPORTANTE: Este archivo es server-only
 */

import { IChangePasswordRepository } from '../../domain/ports';
import { ChangePasswordRequest, ChangePasswordResponse } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendChangePasswordResponse {
  success: boolean;
  message: string;
}

interface BackendChangePasswordErrorResponse {
  error: string;
}

export class ChangePasswordRepository implements IChangePasswordRepository {
  constructor(private token: string) {}

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const url = `${env.API_BASE_URL}/auth/change-password`;
    const startTime = Date.now();

    if (!this.token) {
      throw new Error('No hay sesión activa');
    }

    logHttpRequest({
      method: 'POST',
      url,
      body: { current_password: '***', new_password: '***' },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          current_password: request.current_password,
          new_password: request.new_password,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = `Error al cambiar contraseña: ${response.status}`;
        
        try {
          const errorData: BackendChangePasswordErrorResponse = await response.json();
          errorMessage = errorData.error || errorMessage;
          
          logHttpError({
            status: response.status,
            statusText: response.statusText || 'Error',
            duration: responseTime,
            data: { error: errorMessage },
          });
        } catch {
          logHttpError({
            status: response.status,
            statusText: response.statusText || 'Error',
            duration: responseTime,
            data: { error: errorMessage },
          });
        }

        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      const backendResponse: BackendChangePasswordResponse = await response.json();

      const changePasswordResponse: ChangePasswordResponse = {
        success: backendResponse.success,
        message: backendResponse.message,
      };

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText || 'OK',
        duration: responseTime,
      });

      console.log('🔐 ChangePasswordRepository - Cambio de contraseña exitoso');

      return changePasswordResponse;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logHttpError({
        status: 0,
        statusText: 'Error',
        duration: responseTime,
        data: { error: error instanceof Error ? error.message : 'Error desconocido' },
      });

      throw error;
    }
  }
}

