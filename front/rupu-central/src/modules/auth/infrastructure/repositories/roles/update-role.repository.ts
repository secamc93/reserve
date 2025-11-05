/**
 * Repositorio de Infraestructura: Actualizar Rol
 */

import { IUpdateRoleRepository } from '../../../domain/ports/roles/update-role.repository';
import { UpdateRoleInput, UpdateRoleResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendUpdateRoleRequest {
  name?: string;
  description?: string;
  level?: number;
  is_system?: boolean;
  scope_id?: number;
  business_type_id?: number;
}

export interface BackendUpdateRoleResponse {
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

export class UpdateRoleRepository implements IUpdateRoleRepository {
  async updateRole(input: UpdateRoleInput, token: string): Promise<UpdateRoleResult> {
    const url = `${env.API_BASE_URL}/roles/${input.id}`;
    const startTime = Date.now();
    
    const requestBody: BackendUpdateRoleRequest = {};
    if (input.name !== undefined) requestBody.name = input.name;
    if (input.description !== undefined) requestBody.description = input.description;
    if (input.level !== undefined) requestBody.level = input.level;
    if (input.is_system !== undefined) requestBody.is_system = input.is_system;
    if (input.scope_id !== undefined) requestBody.scope_id = input.scope_id;
    if (input.business_type_id !== undefined) requestBody.business_type_id = input.business_type_id;
    
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
      const backendResponse: BackendUpdateRoleResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error actualizando rol: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Rol "${backendResponse.data?.name}" actualizado exitosamente`,
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
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar rol',
      };
    }
  }
}

