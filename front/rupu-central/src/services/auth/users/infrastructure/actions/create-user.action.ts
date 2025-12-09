/**
 * Server Action: Crear Usuario
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UsersUseCases } from '../../application';
import { CreateUserInput } from './request/create-user.request';
import { CreateUserResult } from './response/create-user.response';
import { UsersRepository } from '../repositories';

export async function createUserAction(input: CreateUserInput, authUseCases?: UsersUseCases): Promise<CreateUserResult> {
  try {
    console.log('👤 createUserAction - Datos:', {
      name: input.name,
      email: input.email,
      phone: input.phone,
      is_active: input.is_active,
      hasAvatar: !!input.avatarFile
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new UsersUseCases(
      new UsersRepository()
    );
    const result = await useCases.UseCaseCreateUser.execute(input);

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
