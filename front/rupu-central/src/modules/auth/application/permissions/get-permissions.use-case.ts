/**
 * Caso de uso: Obtener Roles y Permisos
 * Lógica de negocio para obtener permisos del usuario por negocio
 */

import { IPermissionsRepository } from '../../domain/ports/permissions/permissions.repository';
import { UserPermissions } from '../../domain/entities/permissions.entity';

export interface GetPermissionsInput {
  businessId: number;
  token: string;
}

export interface GetPermissionsOutput {
  permissions: UserPermissions;
}

export class GetPermissionsUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(input: GetPermissionsInput): Promise<GetPermissionsOutput> {
    // Obtener permisos del backend
    const permissions = await this.permissionsRepository.getRolesAndPermissions(input.businessId, input.token);
    
    return {
      permissions,
    };
  }
}

