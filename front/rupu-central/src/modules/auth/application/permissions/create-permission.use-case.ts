/**
 * Caso de uso: Crear permiso
 */

import { ICreatePermissionRepository } from '../../domain/ports/permissions/create-permission.repository';
import { CreatePermissionInput, CreatePermissionResult } from '../../domain/entities/create-permission.entity';

export class CreatePermissionUseCase {
  constructor(private readonly createPermissionRepository: ICreatePermissionRepository) {}

  async execute(input: CreatePermissionInput, token: string): Promise<CreatePermissionResult> {
    try {
      // Validaciones básicas
      if (!input.name.trim()) {
        return {
          success: false,
          error: 'El nombre del permiso es requerido',
        };
      }

      if (!input.resource_id) {
        return {
          success: false,
          error: 'El resource_id es requerido',
        };
      }

      if (!input.action_id) {
        return {
          success: false,
          error: 'El action_id es requerido',
        };
      }

      if (!input.scope_id) {
        return {
          success: false,
          error: 'El scope_id es requerido',
        };
      }

      return await this.createPermissionRepository.createPermission(input, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al crear permiso',
      };
    }
  }
}

