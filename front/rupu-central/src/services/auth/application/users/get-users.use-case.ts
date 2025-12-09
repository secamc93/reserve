/**
 * Caso de uso: Obtener lista de Usuarios
 */

import { IUsersRepository, GetUsersParams } from '../../domain/ports/users/users.repository';
import { UsersList } from '../../domain/entities/user-list.entity';

export interface GetUsersInput extends GetUsersParams {}

export interface GetUsersOutput {
  users: UsersList;
}

export class GetUsersUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: GetUsersInput): Promise<GetUsersOutput> {
    const users = await this.usersRepository.getUsers(input);
    return {
      users,
    };
  }
}