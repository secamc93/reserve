/**
 * Repositorio de Infraestructura: Update Business Type
 */

import { IUpdateBusinessTypeRepository } from '../../../domain/ports/business-types/update-business-type.repository';
import { UpdateBusinessTypeInput, UpdateBusinessTypeResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendUpdateBusinessTypeRequest {
  name?: string;
  code?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

export interface BackendUpdateBusinessTypeResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    code: string;
    description: string;
    icon: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export class UpdateBusinessTypeRepository implements IUpdateBusinessTypeRepository {
  async updateBusinessType(input: UpdateBusinessTypeInput, token: string): Promise<UpdateBusinessTypeResult> {
    const url = `${env.API_BASE_URL}/business-types/${input.id}`;
    const startTime = Date.now();
    
    const requestBody: BackendUpdateBusinessTypeRequest = {
      name: input.name,
      code: input.code,
      description: input.description,
      icon: input.icon,
      is_active: input.is_active,
    };
    
    logHttpRequest({
      method: 'PUT',
      url,
      token,
      body: requestBody,
    });
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendUpdateBusinessTypeResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error actualizando tipo de negocio: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Tipo de negocio "${backendResponse.data?.name}" actualizado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        success: true,
        data: {
          id: backendResponse.data.id,
          name: backendResponse.data.name,
          code: backendResponse.data.code,
          description: backendResponse.data.description,
          icon: backendResponse.data.icon,
          is_active: backendResponse.data.is_active,
          created_at: backendResponse.data.created_at,
          updated_at: backendResponse.data.updated_at,
        },
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
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar tipo de negocio',
      };
    }
  }
}
