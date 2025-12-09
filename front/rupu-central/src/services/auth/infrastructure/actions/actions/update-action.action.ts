/**
 * Server Action: Actualizar Action
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { UpdateActionUseCase } from '../../../application/actions/update-action.use-case';
import { ActionsRepository } from '../../repositories/actions';
import { UpdateActionParams } from '../../../domain/entities/action.entity';

export interface UpdateActionResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
  message?: string;
}

export async function updateActionAction(params: UpdateActionParams): Promise<UpdateActionResult> {
  try {
    const actionsRepository = new ActionsRepository();
    const updateActionUseCase = new UpdateActionUseCase(actionsRepository);
    
    const result = await updateActionUseCase.execute(params);

    return {
      success: true,
      message: 'Action actualizado exitosamente',
      data: {
        id: result.id,
        name: result.name,
        description: result.description,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    };
  } catch (error) {
    console.error('Error en updateActionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

