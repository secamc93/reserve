/**
 * Caso de uso: Remover Permiso de un Rol
 */

import { RemoveRolePermissionInput, RemoveRolePermissionResult } from '../../domain/entities';
import { IRemoveRolePermissionRepository } from '../../domain/ports/roles/remove-role-permission.repository';

export class RemoveRolePermissionUseCase {
  constructor(private removeRolePermissionRepository: IRemoveRolePermissionRepository) {}

  async execute(input: RemoveRolePermissionInput, token: string): Promise<RemoveRolePermissionResult> {
    try {
      if (!token) {
        return {
          success: false,
          error: 'Token de autenticación requerido',
        };
      }

      if (!input.role_id || !input.permission_id) {
        return {
          success: false,
          error: 'role_id y permission_id son requeridos',
        };
      }

      return await this.removeRolePermissionRepository.removePermission(input, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al remover permiso',
      };
    }
  }
}

