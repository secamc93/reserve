/**
 * Server Action: Obtener lista de Usuarios
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { AuthUseCasesInput } from '../../../application';
import { GetUsersInput } from './request/get-users.request';
import { GetUsersResult } from './response/get-users.response';

export async function getUsersAction(input: GetUsersInput, authUseCases?: AuthUseCasesInput): Promise<GetUsersResult> {
  try {
    console.log('👥 getUsersAction - Parámetros:', {
      page: input.page,
      page_size: input.page_size,
      name: input.name,
      email: input.email,
      token: input.token ? `Sí (${input.token.substring(0, 20)}...)` : 'No'
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseGetUsers.execute(input);

    console.log('✅ Usuarios obtenidos:', result.users.count);

    return {
      success: true,
      data: {
        users: result.users.users,
        count: result.users.count,
        page: result.users.page,
        page_size: result.users.page_size,
        total_pages: result.users.total_pages,
      },
    };
  } catch (error) {
    console.error('❌ Error en getUsersAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
