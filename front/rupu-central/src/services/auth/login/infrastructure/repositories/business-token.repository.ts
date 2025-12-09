/**
 * Repositorio de Business Token
 * Maneja la obtención del token de business
 * IMPORTANTE: Este archivo es server-only
 */

import { IBusinessTokenRepository } from '../../domain/ports';
import { BusinessTokenParams, BusinessTokenResponse } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendBusinessTokenRequest {
  business_id: number;
}

interface BackendBusinessTokenResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
  };
  error?: string;
}

export class BusinessTokenRepository implements IBusinessTokenRepository {
  async getBusinessToken(params: BusinessTokenParams): Promise<BusinessTokenResponse> {
    const { business_id, token } = params;
    const url = `${env.API_BASE_URL}/auth/business-token`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'POST',
      url,
      token,
      body: { business_id },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Token de sesión
        },
        body: JSON.stringify({
          business_id,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = `Error obteniendo business token: ${response.status}`;
        
        try {
          const errorData: BackendBusinessTokenResponse = await response.json();
          errorMessage = errorData.error || errorMessage;
          
          logHttpError({
            method: 'POST',
            url,
            status: response.status,
            error: errorMessage,
            responseTime,
          });
        } catch {
          logHttpError({
            method: 'POST',
            url,
            status: response.status,
            error: errorMessage,
            responseTime,
          });
        }

        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      const backendResponse: BackendBusinessTokenResponse = await response.json();

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error(backendResponse.error || 'Respuesta inválida del servidor');
      }

      logHttpSuccess({
        method: 'POST',
        url,
        status: response.status,
        responseTime,
      });

      console.log('🔑 BusinessTokenRepository - Business token obtenido exitosamente:', {
        business_id,
      });

      return {
        token: backendResponse.data.token,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logHttpError({
        method: 'POST',
        url,
        status: 0,
        error: error instanceof Error ? error.message : 'Error desconocido',
        responseTime,
      });

      throw error;
    }
  }
}
