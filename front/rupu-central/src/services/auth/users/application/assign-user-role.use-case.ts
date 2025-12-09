/**
 * Use Case: Asignar Roles a Usuario
 * Asigna roles a un usuario en sus negocios asociados
 */

import { AssignUserRoleParams, AssignUserRoleResponse } from '../../domain/entities/assign-user-role.entity';
import { IUsersRepository } from '../../domain/ports/users/users.repository';

export class AssignUserRoleUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: AssignUserRoleParams): Promise<AssignUserRoleResponse> {
    return this.usersRepository.assignUserRole(params);
  }
}

