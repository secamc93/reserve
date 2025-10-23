/**
 * Server Action: Crear Usuario
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { AuthUseCasesInput } from '../../../application';
import { CreateUserInput } from './request/create-user.request';
import { CreateUserResult } from './response/create-user.response';

export async function createUserAction(input: CreateUserInput, authUseCases?: AuthUseCasesInput): Promise<CreateUserResult> {
  try {
    console.log('👤 createUserAction - Datos:', {
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      business_ids: input.business_ids,
      hasAvatar: !!input.avatarFile
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseCreateUser.execute(input);

    console.log('✅ Usuario creado:', result.user.id);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  } catch (error) {
    console.error('❌ Error en createUserAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
