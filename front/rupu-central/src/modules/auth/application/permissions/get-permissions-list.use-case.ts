/**
 * Caso de uso: Obtener lista de Permisos
 */

import { IPermissionsRepository } from '../../domain/ports/permissions/permissions.repository';
import { PermissionsList } from '../../domain/entities/permission.entity';

export interface GetPermissionsListInput {
  token: string;
}

export interface GetPermissionsListOutput {
  permissions: PermissionsList;
}

export class GetPermissionsListUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(input: GetPermissionsListInput): Promise<GetPermissionsListOutput> {
    const permissions = await this.permissionsRepository.getPermissions(input.token);
    return {
      permissions,
    };
  }
}

