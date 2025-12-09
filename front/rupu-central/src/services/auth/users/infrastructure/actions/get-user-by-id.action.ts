'use server';

import { UsersUseCases } from '../../application';
import { GetUserByIdInput } from './request/get-user-by-id.request';
import { GetUserByIdActionResult } from './response/get-user-by-id.response';
import { UsersRepository } from '../repositories';

export async function getUserByIdAction(input: GetUserByIdInput, authUseCases?: UsersUseCases): Promise<GetUserByIdActionResult> {
  try {
    console.log('👤 getUserByIdAction - ID:', input.id);

    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new UsersUseCases(
      new UsersRepository()
    );
    const result = await useCases.UseCaseGetUserById.execute(input);

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
