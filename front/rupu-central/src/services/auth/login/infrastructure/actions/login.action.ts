/**
 * Server Action: Login
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { LoginUseCase } from '../../application';
import { LoginRepository } from '../repositories';
import { LoginActionInput } from './request/login.request';
import { LoginActionResult } from './response/login.response';

export async function loginAction(input: LoginActionInput): Promise<LoginActionResult> {
  try {
    const loginRepository = new LoginRepository();
    const loginUseCase = new LoginUseCase(loginRepository);

    const result = await loginUseCase.execute({
      email: input.email.trim(),
      password: input.password,
    });

    // Mapear respuesta del dominio a formato de action
    return {
      success: true,
      data: {
        userId: String(result.user.id),
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatar_url,
        token: result.token,
        businesses: result.businesses.map(b => ({
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
        scope: result.scope,
        is_super_admin: result.is_super_admin,
        require_password_change: result.require_password_change,
      },
    };
  } catch (error) {
    console.error('❌ Error en loginAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al iniciar sesión',
    };
  }
}
