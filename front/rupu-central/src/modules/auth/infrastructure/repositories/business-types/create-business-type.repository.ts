/**
 * Repositorio de Infraestructura: Create Business Type
 */

import { ICreateBusinessTypeRepository } from '../../../domain/ports/business-types/create-business-type.repository';
import { CreateBusinessTypeInput, CreateBusinessTypeResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendCreateBusinessTypeRequest {
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active?: boolean;
}

export interface BackendCreateBusinessTypeResponse {
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

export class CreateBusinessTypeRepository implements ICreateBusinessTypeRepository {
  async createBusinessType(input: CreateBusinessTypeInput, token: string): Promise<CreateBusinessTypeResult> {
    const url = `${env.API_BASE_URL}/business-types`;
    const startTime = Date.now();
    
    const requestBody: BackendCreateBusinessTypeRequest = {
      name: input.name,
      code: input.code,
      description: input.description,
      icon: input.icon,
      is_active: input.is_active ?? true,
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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendCreateBusinessTypeResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error creando tipo de negocio: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Tipo de negocio "${backendResponse.data?.name}" creado exitosamente`,
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
        error: error instanceof Error ? error.message : 'Error desconocido al crear tipo de negocio',
      };
    }
  }
}
