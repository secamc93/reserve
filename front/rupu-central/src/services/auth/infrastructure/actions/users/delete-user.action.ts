'use server';

import { AuthUseCasesInput } from '../../../application';
import { DeleteUserInput } from './request/delete-user.request';
import { DeleteUserActionResult } from './response/delete-user.response';

export async function deleteUserAction(input: DeleteUserInput, authUseCases?: AuthUseCasesInput): Promise<DeleteUserActionResult> {
  try {
    console.log('🗑️ deleteUserAction - ID:', input.id);

    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseDeleteUser.execute(input);

    console.log('✅ Usuario eliminado:', input.id);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Error en deleteUserAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
