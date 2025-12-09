'use server';

import { UsersUseCases } from '../../application';
import { UpdateUserInput } from './request/update-user.request';
import { UpdateUserActionResult } from './response/update-user.response';
import { UsersRepository } from '../repositories';

export async function updateUserAction(input: UpdateUserInput, authUseCases?: UsersUseCases): Promise<UpdateUserActionResult> {
  try {
    console.log('✏️ updateUserAction - ID:', input.id, 'Datos:', { 
      ...input, 
      avatarFile: input.avatarFile ? '[File]' : 'null' 
    });

    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new UsersUseCases(
      new UsersRepository()
    );
    const result = await useCases.UseCaseUpdateUser.execute(input);

    console.log('✅ Usuario actualizado:', result.name);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Error en updateUserAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
