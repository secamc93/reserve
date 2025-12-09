/**
 * Caso de uso: Eliminar Permiso
 */

import { IPermissionsRepository } from '../domain/ports';
import { DeletePermissionParams } from '../../domain/entities';

export class DeletePermissionUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: DeletePermissionParams): Promise<void> {
    await this.permissionsRepository.deletePermission(params);
  }
}
