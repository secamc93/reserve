/**
 * Server Action: Desactivar un recurso configurado
 */

'use server';

import { DeactivateResourceUseCase } from '../../../application/businesses';
import { BusinessConfiguredResourcesRepository } from '../../repositories/businesses';
import { IBusinessConfiguredResourcesRepository } from '../../../domain/ports';
import { DeactivateResourceParams } from '../../../domain/ports/businesses/configured-resources.repository';

export interface DeactivateResourceActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deactivateResourceAction(
  params: DeactivateResourceParams,
  repository?: IBusinessConfiguredResourcesRepository
): Promise<DeactivateResourceActionResult> {
  try {
    const configuredResourcesRepository = repository || new BusinessConfiguredResourcesRepository();
    const useCase = new DeactivateResourceUseCase(configuredResourcesRepository);
    
    await useCase.execute(params);

    return {
      success: true,
      message: 'Recurso desactivado exitosamente',
    };
  } catch (error) {
    console.error('Error en deactivateResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

