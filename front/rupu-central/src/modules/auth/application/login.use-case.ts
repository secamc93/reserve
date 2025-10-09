/**
 * Caso de uso: Login
 * Lógica de negocio para autenticar usuarios
 */

import { ILoginRepository } from '../domain/ports/login.repository';
import { User, BusinessInfo } from '../domain/entities/user.entity';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: User;
  token: string;
  businesses: BusinessInfo[];
}

export class LoginUseCase {
  constructor(private readonly loginRepository: ILoginRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Llamar al backend para autenticar
    const result = await this.loginRepository.login(input.email, input.password);
    
    return {
      user: result.user,
      token: result.token,
      businesses: result.businesses,
    };
  }
}

