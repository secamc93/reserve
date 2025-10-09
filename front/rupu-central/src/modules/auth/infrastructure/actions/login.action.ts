/**
 * Server Action: Login
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { LoginUseCase } from '../../application/login.use-case';
import { LoginRepository } from '../repositories/login.repository';

interface LoginActionInput {
  email: string;
  password: string;
}

export interface BusinessData {
  id: number;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
}

export interface LoginActionResult {
  success: boolean;
  data?: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    token: string;
    businesses: BusinessData[];
  };
  error?: string;
}

export async function loginAction(input: LoginActionInput): Promise<LoginActionResult> {
  try {
    // Crear instancia del caso de uso con su repositorio
    const loginRepository = new LoginRepository();
    const loginUseCase = new LoginUseCase(loginRepository);
    
    // Ejecutar caso de uso
    const result = await loginUseCase.execute(input);

    // Obtener businesses del resultado (si están disponibles)
    const businesses = result.businesses || [];
    
    return {
      success: true,
      data: {
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        avatarUrl: result.user.avatarUrl,
        token: result.token,
        businesses: businesses.map(b => ({
          id: b.id,
          name: b.name,
          code: b.code,
          logo_url: b.logo_url,
          is_active: b.is_active,
          primary_color: b.primary_color,
          secondary_color: b.secondary_color,
          tertiary_color: b.tertiary_color,
          quaternary_color: b.quaternary_color,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

