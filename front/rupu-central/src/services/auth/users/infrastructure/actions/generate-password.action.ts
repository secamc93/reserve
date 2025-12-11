/**
 * Server Action: Generar Contraseña
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UsersUseCases } from '../../application';
import { GeneratePasswordParams } from '../../domain/entities/generate-password.entity';
import { UsersRepository } from '../repositories';

export interface GeneratePasswordResult {
  success: boolean;
  data?: {
    email: string;
    password: string;
    message?: string;
  };
  error?: string;
}

export async function generatePasswordAction(
  params: GeneratePasswordParams,
  authUseCases?: UsersUseCases
): Promise<GeneratePasswordResult> {
  try {
    console.log('🔑 generatePasswordAction - Generando contraseña:', {
      hasUserId: !!params.user_id,
      userId: params.user_id,
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new UsersUseCases(
      new UsersRepository()
    );
    const result = await useCases.UseCaseGeneratePassword.execute(params);

    console.log('✅ Contraseña generada para:', result.email);

    return {
      success: true,
      data: {
        email: result.email,
        password: result.password,
        message: result.message,
      },
    };
  } catch (error) {
    console.error('❌ Error en generatePasswordAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

