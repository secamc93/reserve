/**
 * Repositorio para crear permisos
 */

import { ICreatePermissionRepository } from '../../../domain/ports/permissions/create-permission.repository';
import { CreatePermissionInput, CreatePermissionResult } from '../../../domain/entities/create-permission.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendCreatePermissionRequest {
  name: string;
  description?: string;
  resource_id: number;
  action_id: number;
  scope_id: number;
  business_type_id?: number;
}

interface BackendCreatePermissionResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    description: string;
    resource_id: number;
    action_id: number;
    scope_id: number;
    business_type_id?: number;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export class CreatePermissionRepository implements ICreatePermissionRepository {
  async createPermission(input: CreatePermissionInput, token: string): Promise<CreatePermissionResult> {
    const url = `${env.API_BASE_URL}/permissions`;
    const startTime = Date.now();
    
    // No enviar code, el backend lo genera automáticamente
    const requestBody: BackendCreatePermissionRequest = {
      name: input.name.trim(), // Asegurar que el nombre no tenga espacios extras
      description: input.description?.trim(),
      resource_id: input.resource_id,
      action_id: input.action_id,
      scope_id: input.scope_id,
      business_type_id: input.business_type_id,
    };

    // Validar que el nombre no esté vacío
    if (!requestBody.name) {
      throw new Error('El nombre del permiso es requerido');
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
      const backendResponse: BackendCreatePermissionResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || backendResponse.error || `Error creando permiso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso "${backendResponse.data?.name || input.name}" creado exitosamente`,
        data: backendResponse,
      });

      // El backend puede devolver solo success y message sin data
      // En ese caso, construimos el objeto de respuesta con los datos que enviamos
      if (!backendResponse.data) {
        // Intentar extraer el ID del mensaje si está disponible
        // El mensaje suele ser: "Permiso creado con ID: 26"
        let permissionId = 0;
        const idMatch = backendResponse.message?.match(/ID:\s*(\d+)/);
        if (idMatch) {
          permissionId = parseInt(idMatch[1], 10);
        }

        return {
          success: true,
          data: {
            id: permissionId,
            name: input.name,
            description: input.description || '',
            resource_id: input.resource_id,
            action_id: input.action_id,
            scope_id: input.scope_id,
            business_type_id: input.business_type_id,
          },
        };
      }

      return {
        success: true,
        data: {
          id: backendResponse.data.id,
          name: backendResponse.data.name,
          description: backendResponse.data.description,
          resource_id: backendResponse.data.resource_id,
          action_id: backendResponse.data.action_id,
          scope_id: backendResponse.data.scope_id,
          business_type_id: backendResponse.data.business_type_id,
        },
      };
    } catch (error) {
      console.error('Error creando permiso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear permiso en el servidor'
      );
    }
  }
}

