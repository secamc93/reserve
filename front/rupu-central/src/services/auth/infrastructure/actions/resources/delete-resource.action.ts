/**
 * Server Action: Eliminar Resource
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { DeleteResourceUseCase } from '../../../application/resources/delete-resource.use-case';
import { ResourcesRepository } from '../../repositories/resources/resources.repository';

export interface DeleteResourceInput {
  id: number;
  token: string;
}

export interface DeleteResourceResult {
  success: boolean;
  error?: string;
}

export async function deleteResourceAction(input: DeleteResourceInput): Promise<DeleteResourceResult> {
  try {
    console.log('🗑️  deleteResourceAction - ID:', input.id);
    
    const resourcesRepository = new ResourcesRepository();
    const deleteResourceUseCase = new DeleteResourceUseCase(resourcesRepository);
    
    await deleteResourceUseCase.execute(input);

    console.log('✅ Recurso eliminado:', input.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error en deleteResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

