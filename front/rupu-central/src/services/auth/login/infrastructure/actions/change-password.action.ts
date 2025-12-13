/**
 * Server Action: Cambio de Contraseña
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { ChangePasswordUseCase } from '../../application';
import { ChangePasswordRepository } from '../repositories';
import { ChangePasswordActionInput } from './request/change-password.request';
import { ChangePasswordActionResult } from './response/change-password.response';

export async function changePasswordAction(input: ChangePasswordActionInput): Promise<ChangePasswordActionResult> {
  try {
    if (!input.session_token) {
      return {
        success: false,
        error: 'No hay sesión activa',
      };
    }

    const changePasswordRepository = new ChangePasswordRepository(input.session_token);
    const changePasswordUseCase = new ChangePasswordUseCase(changePasswordRepository);

    const result = await changePasswordUseCase.execute({
      current_password: input.current_password,
      new_password: input.new_password,
    });

    // Mapear respuesta del dominio a formato de action
    return {
      success: true,
      data: {
        message: result.message,
      },
    };
  } catch (error) {
    console.error('❌ Error en changePasswordAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al cambiar contraseña',
    };
  }
}

