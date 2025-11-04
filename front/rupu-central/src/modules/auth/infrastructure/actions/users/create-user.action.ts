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
      is_active: input.is_active,
      hasAvatar: !!input.avatarFile
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseCreateUser.execute(input);

    console.log('✅ Usuario creado:', result.email);

    return {
      success: true,
      data: {
        email: result.email,
        password: result.password,
        message: result.message,
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
