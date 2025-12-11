/**
 * Caso de uso: Cambio de Contraseña
 * Lógica de negocio para cambiar la contraseña del usuario autenticado
 */

import { IChangePasswordRepository } from '../domain/ports';
import { ChangePasswordRequest, ChangePasswordResponse } from '../domain/entities';

export class ChangePasswordUseCase {
  constructor(private readonly changePasswordRepository: IChangePasswordRepository) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    // Validar entrada
    if (!request.current_password || !request.new_password) {
      throw new Error('La contraseña actual y la nueva contraseña son requeridas');
    }

    if (request.new_password.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    if (request.new_password.length > 100) {
      throw new Error('La nueva contraseña no puede tener más de 100 caracteres');
    }

    if (request.current_password === request.new_password) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    // Ejecutar cambio de contraseña
    const response = await this.changePasswordRepository.changePassword(request);

    return response;
  }
}
