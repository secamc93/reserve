/**
 * Repositorio para obtener business token
 */

import { IBusinessTokenRepository } from '../../../domain/ports/users/business-token.repository';
import { BusinessTokenParams, BusinessTokenResult } from '../../../domain/entities/business-token.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendBusinessTokenRequest {
  business_id: number;
}

interface BackendBusinessTokenResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
  };
  error?: string;
}

export class BusinessTokenRepository implements IBusinessTokenRepository {
  async getBusinessToken(params: BusinessTokenParams): Promise<BusinessTokenResult> {
    const { business_id, token } = params;
    const url = `${env.API_BASE_URL}/auth/business-token`;
    const startTime = Date.now();
    
    const requestBody: BackendBusinessTokenRequest = {
      business_id,
    };
    
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
          'Authorization': token, // Token principal de sesión
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendBusinessTokenResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.error || `Error obteniendo business token: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Business token obtenido exitosamente para business_id: ${business_id}`,
        data: backendResponse,
      });

      if (!backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        success: true,
        data: {
          token: backendResponse.data.token,
        },
      };
    } catch (error) {
      console.error('Error obteniendo business token:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener business token en el servidor'
      );
    }
  }
}
