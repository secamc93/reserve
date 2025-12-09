/**
 * Server Action: Eliminar Resource
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { DeleteResourceUseCase } from '../../application';
import { ResourcesRepository } from '../repositories';
import { DeleteResourceParams } from '../../domain/entities';

export interface DeleteResourceResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function deleteResourceAction(params: DeleteResourceParams): Promise<DeleteResourceResult> {
  try {
    const resourcesRepository = new ResourcesRepository();
    const deleteResourceUseCase = new DeleteResourceUseCase(resourcesRepository);

    await deleteResourceUseCase.execute(params);

    return {
      success: true,
      message: 'Recurso eliminado exitosamente',
    };
  } catch (error) {
    console.error('Error en deleteResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
