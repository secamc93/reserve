/**
 * Server Action: Crear Action
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { CreateActionUseCase } from '../../../application/actions/create-action.use-case';
import { ActionsRepository } from '../../repositories/actions';
import { CreateActionParams } from '../../../domain/entities/action.entity';

export interface CreateActionResult {
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

export async function createActionAction(params: CreateActionParams): Promise<CreateActionResult> {
  try {
    const actionsRepository = new ActionsRepository();
    const createActionUseCase = new CreateActionUseCase(actionsRepository);
    
    const result = await createActionUseCase.execute(params);

    return {
      success: true,
      message: 'Action creado exitosamente',
      data: {
        id: result.id,
        name: result.name,
        description: result.description,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    };
  } catch (error) {
    console.error('Error en createActionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

