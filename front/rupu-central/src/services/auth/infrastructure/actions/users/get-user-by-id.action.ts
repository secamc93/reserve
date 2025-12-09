'use server';

import { AuthUseCasesInput } from '../../../application';
import { GetUserByIdInput } from './request/get-user-by-id.request';
import { GetUserByIdActionResult } from './response/get-user-by-id.response';

export async function getUserByIdAction(input: GetUserByIdInput, authUseCases?: AuthUseCasesInput): Promise<GetUserByIdActionResult> {
  try {
    console.log('👤 getUserByIdAction - ID:', input.id);

    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseGetUserById.execute(input);

    console.log('✅ Usuario obtenido:', result.name);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Error en getUserByIdAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
