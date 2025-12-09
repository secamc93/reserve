/**
 * Repositorio para Asignar Roles a Usuario
 * Maneja la asignación de roles a usuarios en negocios
 * IMPORTANTE: Este archivo es server-only
 */

import { AssignUserRoleParams, AssignUserRoleResponse } from '../../../domain/entities/assign-user-role.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export class AssignUserRoleRepository {
  async assignUserRole(params: AssignUserRoleParams): Promise<AssignUserRoleResponse> {
    const { token, user_id, assignments } = params;

    const url = `${env.API_BASE_URL}/users/${user_id}/assign-role`;
    const startTime = Date.now();

    const requestBody = {
      assignments: assignments.map(a => ({
        business_id: a.business_id,
        role_id: a.role_id,
      })),
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.error || errorData.message || `Error asignando roles: ${response.status}`);
      }

      const backendResponse: AssignUserRoleResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Roles asignados exitosamente para usuario ${user_id}`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Error asignando roles');
      }

      return backendResponse;
    } catch (error) {
      console.error('Error asignando roles:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al asignar roles del servidor'
      );
    }
  }
}

