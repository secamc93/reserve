/**
 * Server Action: Obtener lista de Actions
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetActionsUseCase } from '../../../application/actions/get-actions.use-case';
import { ActionsRepository } from '../../repositories/actions';
import { GetActionsParams } from '../../../domain/entities/action.entity';

export interface GetActionsResult {
  success: boolean;
  data?: {
    actions: Array<{
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    }>;
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  error?: string;
  message?: string;
}

export async function getActionsAction(params: GetActionsParams): Promise<GetActionsResult> {
  try {
    const actionsRepository = new ActionsRepository();
    const getActionsUseCase = new GetActionsUseCase(actionsRepository);
    
    const result = await getActionsUseCase.execute(params);

    return {
      success: true,
      data: {
        actions: result.actions,
        total: result.total,
        page: result.page,
        page_size: result.page_size,
        total_pages: result.total_pages,
      },
    };
  } catch (error) {
    console.error('Error en getActionsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

