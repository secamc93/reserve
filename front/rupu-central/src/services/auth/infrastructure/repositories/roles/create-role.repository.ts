/**
 * Repositorio de Infraestructura: Crear Rol
 */

import { ICreateRoleRepository } from '../../../domain/ports/roles/create-role.repository';
import { CreateRoleInput, CreateRoleResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendCreateRoleRequest {
  name: string;
  description: string;
  level: number;
  is_system?: boolean;
  scope_id: number;
  business_type_id: number;
}

export interface BackendCreateRoleResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    description: string;
    level: number;
    is_system: boolean;
    scope_id: number;
    business_type_id: number;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export class CreateRoleRepository implements ICreateRoleRepository {
  async createRole(input: CreateRoleInput, token: string): Promise<CreateRoleResult> {
    const url = `${env.API_BASE_URL}/roles`;
    const startTime = Date.now();
    
    const requestBody: BackendCreateRoleRequest = {
      name: input.name,
      description: input.description,
      level: input.level,
      is_system: input.is_system || false,
      scope_id: input.scope_id,
      business_type_id: input.business_type_id,
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
      const backendResponse: BackendCreateRoleResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error creando rol: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Rol "${backendResponse.data?.name}" creado exitosamente`,
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
          description: backendResponse.data.description,
          level: backendResponse.data.level,
          is_system: backendResponse.data.is_system,
          scope_id: backendResponse.data.scope_id,
          business_type_id: backendResponse.data.business_type_id,
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
        error: error instanceof Error ? error.message : 'Error desconocido al crear rol',
      };
    }
  }
}
