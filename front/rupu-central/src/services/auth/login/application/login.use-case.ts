/**
 * Caso de uso: Login
 * Lógica de negocio para autenticar usuarios
 */

import { ILoginRepository } from '../domain/ports';
import { LoginRequest, LoginResponse } from '../../domain/entities';

export class LoginUseCase {
  constructor(private readonly loginRepository: ILoginRepository) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Validar entrada
    if (!request.email || !request.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Ejecutar login
    const response = await this.loginRepository.login(request);

    return response;
  }
}
