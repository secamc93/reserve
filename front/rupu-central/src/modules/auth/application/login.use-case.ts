/**
 * Caso de uso: Login
 * Lógica de negocio para autenticar usuarios
 */

import { IUserRepository } from '../domain/ports/user.repository';
import { User } from '../domain/entities/user.entity';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: User;
  token: string;
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(input.email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // 2. Verificar contraseña (aquí iría la lógica de bcrypt)
    // const isValidPassword = await bcrypt.compare(input.password, user.password);
    // if (!isValidPassword) throw new Error('Credenciales inválidas');

    // 3. Generar token (aquí iría la lógica de JWT)
    const token = 'jwt-token-here';

    return {
      user,
      token,
    };
  }
}

