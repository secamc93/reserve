'use server';

import { AuthUseCasesInput } from '../../../application';
import { UpdateUserInput } from './request/update-user.request';
import { UpdateUserActionResult } from './response/update-user.response';

export async function updateUserAction(input: UpdateUserInput, authUseCases?: AuthUseCasesInput): Promise<UpdateUserActionResult> {
  try {
    console.log('✏️ updateUserAction - ID:', input.id, 'Datos:', { 
      ...input, 
      avatarFile: input.avatarFile ? '[File]' : 'null' 
    });

    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseUpdateUser.execute(input);

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
