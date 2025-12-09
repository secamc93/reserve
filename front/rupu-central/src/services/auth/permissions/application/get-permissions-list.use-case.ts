/**
 * Caso de uso: Obtener lista de Permisos
 */

import { IPermissionsRepository } from '../domain/ports';
import { GetPermissionsParams, PermissionsList } from '../../domain/entities';

export class GetPermissionsListUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: GetPermissionsParams): Promise<PermissionsList> {
    return await this.permissionsRepository.getPermissions(params);
  }
}
