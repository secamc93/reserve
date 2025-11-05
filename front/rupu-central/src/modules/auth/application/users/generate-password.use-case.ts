/**
 * Use Case: Generar Contraseña
 * Genera una nueva contraseña aleatoria para un usuario
 */

import { GeneratePasswordParams, GeneratePasswordResponse } from '../../domain/entities/generate-password.entity';
import { IUsersRepository } from '../../domain/ports/users/users.repository';

export class GeneratePasswordUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: GeneratePasswordParams): Promise<GeneratePasswordResponse> {
    return this.usersRepository.generatePassword(params);
  }
}

