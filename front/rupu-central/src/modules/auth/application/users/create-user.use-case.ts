/**
 * Use Case: Crear Usuario
 */

import { IUsersRepository, CreateUserParams } from '../../domain/ports/users/users.repository';
import { CreateUserResponse } from '../../domain/entities/create-user.entity';

export interface CreateUserInput extends CreateUserParams {}

export interface CreateUserOutput {
  user: CreateUserResponse;
}

export class CreateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const user = await this.usersRepository.createUser(input);
    return { user };
  }
}
