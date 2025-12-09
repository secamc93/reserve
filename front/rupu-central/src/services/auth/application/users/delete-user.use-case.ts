/**
 * Application Layer - Use Case para eliminar un usuario
 */

import { IUsersRepository } from '../../domain/ports/users/users.repository';
import { DeleteUserParams, DeleteUserResponse } from '../../domain/entities/delete-user.entity';

export interface DeleteUserInput extends DeleteUserParams {}

export interface DeleteUserOutput extends DeleteUserResponse {}

export class DeleteUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    const result = await this.usersRepository.deleteUser(input);
    return result;
  }
}
