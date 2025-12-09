/**
 * Caso de uso: Crear permiso
 */

import { IPermissionsRepository } from '../domain/ports';
import { CreatePermissionParams, CreatePermissionResponse } from '../../domain/entities';

export class CreatePermissionUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: CreatePermissionParams): Promise<CreatePermissionResponse> {
    // Validaciones básicas
    if (!params.name.trim()) {
      return {
        success: false,
        error: 'El nombre del permiso es requerido',
      };
    }

    if (!params.resource_id) {
      return {
        success: false,
        error: 'El resource_id es requerido',
      };
    }

    if (!params.action_id) {
      return {
        success: false,
        error: 'El action_id es requerido',
      };
    }

    if (!params.scope_id) {
      return {
        success: false,
        error: 'El scope_id es requerido',
      };
    }

    return await this.permissionsRepository.createPermission(params);
  }
}
