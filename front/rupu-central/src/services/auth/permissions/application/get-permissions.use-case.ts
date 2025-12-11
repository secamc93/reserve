/**
 * Caso de uso: Obtener Roles y Permisos del Usuario
 */

import { IPermissionsRepository } from '../domain/ports';
import { GetUserPermissionsParams, UserPermissions } from '../domain/entities';

export class GetPermissionsUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: GetUserPermissionsParams): Promise<UserPermissions> {
    return await this.permissionsRepository.getUserPermissions(params);
  }
}
