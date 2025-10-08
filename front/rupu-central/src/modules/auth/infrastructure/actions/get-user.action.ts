/**
 * Server Action: Obtener usuario
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetUserUseCase } from '../../application/get-user.use-case';
import { UserRepositoryImpl } from '../repositories/user.repository.impl';

export async function getUserAction(userId: string) {
  try {
    const userRepository = new UserRepositoryImpl();
    const getUserUseCase = new GetUserUseCase(userRepository);
    
    const user = await getUserUseCase.execute(userId);
    
    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }
    
    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

