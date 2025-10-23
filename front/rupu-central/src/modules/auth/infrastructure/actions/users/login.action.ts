/**
 * Server Action: Login
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { AuthUseCasesInput } from '../../../application';
import { LoginActionInput } from './request/login.request';
import { LoginActionResult, BusinessData } from './response/login.response';

export async function loginAction(input: LoginActionInput, authUseCases?: AuthUseCasesInput): Promise<LoginActionResult> {
  try {
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    
    // Ejecutar caso de uso
    const result = await useCases.users.UseCaseLogin.execute(input);

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

