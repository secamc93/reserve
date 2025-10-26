/**
 * Repositorio de Infraestructura: Delete Business Type
 */

import { IDeleteBusinessTypeRepository } from '../../../domain/ports/business-types/delete-business-type.repository';
import { DeleteBusinessTypeInput, DeleteBusinessTypeResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendDeleteBusinessTypeResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class DeleteBusinessTypeRepository implements IDeleteBusinessTypeRepository {
  async deleteBusinessType(input: DeleteBusinessTypeInput, token: string): Promise<DeleteBusinessTypeResult> {
    const url = `${env.API_BASE_URL}/business-types/${input.id}`;
    const startTime = Date.now();
    
    logHttpRequest({
      method: 'DELETE',
      url,
      token,
    });
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendDeleteBusinessTypeResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error eliminando tipo de negocio: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Tipo de negocio eliminado exitosamente`,
        data: backendResponse,
      });

      return {
        success: true,
        message: backendResponse.message || 'Tipo de negocio eliminado exitosamente',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Error desconocido' },
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar tipo de negocio',
      };
    }
  }
}
