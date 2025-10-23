/**
 * Application Layer - Use Case para actualizar un usuario
 */

import { IUsersRepository } from '../../domain/ports/users/users.repository';
import { UpdateUserParams, UpdateUserResponse } from '../../domain/entities/update-user.entity';

export interface UpdateUserInput extends UpdateUserParams {}

export interface UpdateUserOutput extends UpdateUserResponse {}

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const result = await this.usersRepository.updateUser(input);
    return result;
  }
}
