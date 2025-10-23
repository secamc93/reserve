/**
 * Repositorio de Usuarios - Eliminar Usuario
 * Maneja la eliminación de usuarios del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { DeleteUserParams, DeleteUserResponse } from '../../../domain/entities/delete-user.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendDeleteUserResponse } from '../response/users.response';

export class DeleteUserRepository {
  async deleteUser(params: DeleteUserParams): Promise<DeleteUserResponse> {
    const { id, token } = params;

    const url = `${env.API_BASE_URL}/users/${id}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error eliminando usuario: ${response.status}`);
      }

      const backendResponse: BackendDeleteUserResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Usuario con ID ${id} eliminado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Respuesta inválida del servidor al eliminar usuario');
      }

      return {
        success: backendResponse.success,
        message: backendResponse.message,
      };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al eliminar usuario del servidor'
      );
    }
  }
}
