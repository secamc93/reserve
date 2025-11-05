/**
 * Server Action: Eliminar Action
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { DeleteActionUseCase } from '../../../application/actions/delete-action.use-case';
import { ActionsRepository } from '../../repositories/actions';
import { DeleteActionParams } from '../../../domain/entities/action.entity';

export interface DeleteActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteActionAction(params: DeleteActionParams): Promise<DeleteActionResult> {
  try {
    const actionsRepository = new ActionsRepository();
    const deleteActionUseCase = new DeleteActionUseCase(actionsRepository);
    
    const result = await deleteActionUseCase.execute(params);

    return {
      success: true,
      message: result.message || 'Action eliminado exitosamente',
    };
  } catch (error) {
    console.error('Error en deleteActionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

