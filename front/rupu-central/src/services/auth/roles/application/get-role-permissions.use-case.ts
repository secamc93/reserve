/**
 * Caso de uso: Obtener Permisos de un Rol
 */

import { GetRolePermissionsInput, GetRolePermissionsResult } from '../../domain/entities';
import { IGetRolePermissionsRepository } from '../../domain/ports/roles/get-role-permissions.repository';

export class GetRolePermissionsUseCase {
  constructor(private getRolePermissionsRepository: IGetRolePermissionsRepository) {}

  async execute(input: GetRolePermissionsInput, token: string): Promise<GetRolePermissionsResult> {
    try {
      if (!token) {
        return {
          success: false,
          error: 'Token de autenticación requerido',
        };
      }

      if (!input.role_id) {
        return {
          success: false,
          error: 'ID de rol requerido',
        };
      }

      return await this.getRolePermissionsRepository.getRolePermissions(input, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener permisos del rol',
      };
    }
  }
}

