/**
 * Caso de Uso: Crear Rol
 */

import { CreateRoleInput, CreateRoleResult } from '../../domain/entities';
import { ICreateRoleRepository } from '../../domain/ports/roles/create-role.repository';

export interface CreateRoleUseCaseInput {
  token: string;
}

export class CreateRoleUseCase {
  constructor(private createRoleRepository: ICreateRoleRepository) {}

  async execute(input: CreateRoleInput & CreateRoleUseCaseInput): Promise<CreateRoleResult> {
    try {
      const { token, ...roleData } = input;
      
      // Validaciones básicas
      if (!roleData.name.trim()) {
        return {
          success: false,
          error: 'El nombre del rol es requerido',
        };
      }

      if (!roleData.description.trim()) {
        return {
          success: false,
          error: 'La descripción del rol es requerida',
        };
      }

      if (roleData.level < 1 || roleData.level > 10) {
        return {
          success: false,
          error: 'El nivel debe estar entre 1 y 10',
        };
      }

      if (!roleData.scope_id) {
        return {
          success: false,
          error: 'El scope_id es requerido',
        };
      }

      if (!roleData.business_type_id) {
        return {
          success: false,
          error: 'El business_type_id es requerido',
        };
      }

      return await this.createRoleRepository.createRole(roleData, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al crear rol',
      };
    }
  }
}
