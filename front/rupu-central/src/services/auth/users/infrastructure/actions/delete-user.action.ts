'use server';

import { UsersUseCases } from '../../application';
import { DeleteUserInput } from './request/delete-user.request';
import { DeleteUserActionResult } from './response/delete-user.response';
import { UsersRepository } from '../repositories';

export async function deleteUserAction(input: DeleteUserInput, authUseCases?: UsersUseCases): Promise<DeleteUserActionResult> {
  try {
    console.log('🗑️ deleteUserAction - ID:', input.id);

    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new UsersUseCases(
      new UsersRepository()
    );
    const result = await useCases.UseCaseDeleteUser.execute(input);

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
