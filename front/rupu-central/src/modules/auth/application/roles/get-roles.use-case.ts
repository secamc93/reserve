/**
 * Caso de uso: Obtener Roles
 * Lógica de negocio para obtener la lista de roles del sistema
 */

import { IRolesRepository, GetRolesParams } from '../../domain/ports/roles/roles.repository';
import { RolesList } from '../../domain/entities/role.entity';

export interface GetRolesInput {
  token: string;
  params?: GetRolesParams;
}

export interface GetRolesOutput {
  roles: RolesList;
}

export class GetRolesUseCase {
  constructor(private readonly rolesRepository: IRolesRepository) {}

  async execute(input: GetRolesInput): Promise<GetRolesOutput> {
    // Obtener roles del backend
    const roles = await this.rolesRepository.getRoles(input.token, input.params);
    
    return {
      roles,
    };
  }
}

