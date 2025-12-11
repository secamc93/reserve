/**
 * Caso de uso: Actualizar Rol
 */

import { UpdateRoleInput, UpdateRoleResult } from '../domain/entities';
import { IUpdateRoleRepository } from '../domain/ports/update-role.repository';

export class UpdateRoleUseCase {
  constructor(private updateRoleRepository: IUpdateRoleRepository) {}

  async execute(input: UpdateRoleInput, token: string): Promise<UpdateRoleResult> {
    try {
      if (!token) {
        return {
          success: false,
          error: 'Token de autenticación requerido',
        };
      }

      if (!input.id) {
        return {
          success: false,
          error: 'ID de rol requerido',
        };
      }

      return await this.updateRoleRepository.updateRole(input, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar rol',
      };
    }
  }
}

