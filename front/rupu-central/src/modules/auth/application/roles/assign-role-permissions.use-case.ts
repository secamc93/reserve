/**
 * Caso de uso: Asignar Permisos a Rol
 */

import { AssignRolePermissionsInput, AssignRolePermissionsResult } from '../../domain/entities';
import { IAssignRolePermissionsRepository } from '../../domain/ports/roles/assign-role-permissions.repository';

export class AssignRolePermissionsUseCase {
  constructor(private assignRolePermissionsRepository: IAssignRolePermissionsRepository) {}

  async execute(input: AssignRolePermissionsInput, token: string): Promise<AssignRolePermissionsResult> {
    try {
      if (!token) {
        return {
          success: false,
          error: 'Token de autenticación requerido',
        };
      }

      if (!input.role_id || !input.permission_ids || input.permission_ids.length === 0) {
        return {
          success: false,
          error: 'role_id y permission_ids son requeridos',
        };
      }

      return await this.assignRolePermissionsRepository.assignPermissions(input, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al asignar permisos',
      };
    }
  }
}

