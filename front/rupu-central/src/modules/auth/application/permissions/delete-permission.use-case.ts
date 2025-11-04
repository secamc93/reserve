/**
 * Caso de uso: Eliminar Permiso
 */

import { IPermissionsRepository } from '../../domain/ports/permissions/permissions.repository';
import { DeletePermissionParams } from '../../domain/entities/delete-permission.entity';

export type DeletePermissionInput = DeletePermissionParams;

export class DeletePermissionUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(input: DeletePermissionInput): Promise<void> {
    await this.permissionsRepository.deletePermission(input);
  }
}

