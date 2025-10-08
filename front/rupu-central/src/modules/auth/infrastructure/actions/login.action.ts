/**
 * Server Action: Login
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { LoginUseCase } from '../../application/login.use-case';
import { UserRepositoryImpl } from '../repositories/user.repository.impl';
import { hasPermission, Permission } from '@config/rbac';

interface LoginActionInput {
  email: string;
  password: string;
}

interface LoginActionResult {
  success: boolean;
  data?: {
    userId: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
  error?: string;
}

export async function loginAction(input: LoginActionInput): Promise<LoginActionResult> {
  try {
    // Validar permisos (todos pueden hacer login)
    // En una app real, aquí podrías validar rate limiting, captcha, etc.
    
    // Crear instancia del caso de uso con su repositorio
    const userRepository = new UserRepositoryImpl();
    const loginUseCase = new LoginUseCase(userRepository);
    
    // Ejecutar caso de uso
    const result = await loginUseCase.execute(input);
    
    // Verificar que el usuario tenga permiso de login
    if (!hasPermission(result.user.role, Permission.AUTH_LOGIN)) {
      return {
        success: false,
        error: 'Usuario sin permisos de acceso',
      };
    }
    
    return {
      success: true,
      data: {
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        token: result.token,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

