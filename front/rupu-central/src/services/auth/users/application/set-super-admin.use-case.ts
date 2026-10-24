/**
 * Use Case: Dar o quitar el rol de super admin a un usuario
 */

import { SetSuperAdminParams, SetSuperAdminResponse } from '../domain/entities/set-super-admin.entity';
import { IUsersRepository } from '../domain/ports/users.repository';

export class SetSuperAdminUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: SetSuperAdminParams): Promise<SetSuperAdminResponse> {
    return this.usersRepository.setSuperAdmin(params);
  }
}
