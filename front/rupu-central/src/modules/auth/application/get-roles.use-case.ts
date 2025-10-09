/**
 * Caso de uso: Obtener Roles
 * Lógica de negocio para obtener la lista de roles del sistema
 */

import { IRolesRepository } from '../domain/ports/roles.repository';
import { RolesList } from '../domain/entities/role.entity';

export interface GetRolesInput {
  token: string;
}

export interface GetRolesOutput {
  roles: RolesList;
}

export class GetRolesUseCase {
  constructor(private readonly rolesRepository: IRolesRepository) {}

  async execute(input: GetRolesInput): Promise<GetRolesOutput> {
    // Obtener roles del backend
    const roles = await this.rolesRepository.getRoles(input.token);
    
    return {
      roles,
    };
  }
}

