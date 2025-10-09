/**
 * Caso de uso: Obtener lista de Permisos
 */

import { IPermissionsListRepository } from '../domain/ports/permissions-list.repository';
import { PermissionsList } from '../domain/entities/permission.entity';

export interface GetPermissionsListInput {
  token: string;
}

export interface GetPermissionsListOutput {
  permissions: PermissionsList;
}

export class GetPermissionsListUseCase {
  constructor(private readonly permissionsListRepository: IPermissionsListRepository) {}

  async execute(input: GetPermissionsListInput): Promise<GetPermissionsListOutput> {
    const permissions = await this.permissionsListRepository.getPermissions(input.token);
    return {
      permissions,
    };
  }
}

