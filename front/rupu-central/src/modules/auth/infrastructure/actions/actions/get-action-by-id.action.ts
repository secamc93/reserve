/**
 * Server Action: Obtener Action por ID
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetActionByIdUseCase } from '../../../application/actions/get-action-by-id.use-case';
import { ActionsRepository } from '../../repositories/actions';
import { GetActionByIdParams } from '../../../domain/entities/action.entity';

export interface GetActionByIdResult {
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

export async function getActionByIdAction(params: GetActionByIdParams): Promise<GetActionByIdResult> {
  try {
    const actionsRepository = new ActionsRepository();
    const getActionByIdUseCase = new GetActionByIdUseCase(actionsRepository);
    
    const result = await getActionByIdUseCase.execute(params);

    return {
      success: true,
      data: {
        id: result.id,
        name: result.name,
        description: result.description,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    };
  } catch (error) {
    console.error('Error en getActionByIdAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

