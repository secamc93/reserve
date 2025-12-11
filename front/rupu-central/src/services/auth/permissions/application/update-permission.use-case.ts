/**
 * Caso de uso: Actualizar permiso
 */

import { IPermissionsRepository } from '../domain/ports';
import { UpdatePermissionParams, UpdatePermissionResponse } from '../domain/entities';

export class UpdatePermissionUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: UpdatePermissionParams): Promise<UpdatePermissionResponse> {
    if (!params.name.trim()) {
      return {
        success: false,
        message: 'El nombre del permiso es requerido',
      };
    }

    if (!params.resource_id) {
      return {
        success: false,
        message: 'El recurso es requerido',
      };
    }

    if (!params.action_id) {
      return {
        success: false,
        message: 'La acción es requerida',
      };
    }

    if (!params.scope_id) {
      return {
        success: false,
        message: 'El scope es requerido',
      };
    }

    return await this.permissionsRepository.updatePermission(params);
  }
}
