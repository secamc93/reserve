/**
 * Application Layer - Use Case para obtener un usuario por ID
 */

import { IUsersRepository } from '../../domain/ports/users/users.repository';
import { GetUserByIdParams, GetUserByIdResponse } from '../../domain/entities/get-user-by-id.entity';

export interface GetUserByIdInput extends GetUserByIdParams {}

export interface GetUserByIdOutput extends GetUserByIdResponse {}

export class GetUserByIdUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const result = await this.usersRepository.getUserById(input);
    return result;
  }
}
