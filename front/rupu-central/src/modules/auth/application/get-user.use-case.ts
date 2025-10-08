/**
 * Caso de uso: Obtener usuario
 */

import { IUserRepository } from '../domain/ports/user.repository';
import { User } from '../domain/entities/user.entity';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}

