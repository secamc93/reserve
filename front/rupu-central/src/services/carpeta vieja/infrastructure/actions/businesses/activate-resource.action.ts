/**
 * Server Action: Activar un recurso configurado
 */

'use server';

import { ActivateResourceUseCase } from '../../../application/businesses';
import { BusinessConfiguredResourcesRepository } from '../../repositories/businesses';
import { IBusinessConfiguredResourcesRepository } from '../../../domain/ports';
import { ActivateResourceParams } from '../../../domain/ports/businesses/configured-resources.repository';

export interface ActivateResourceActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function activateResourceAction(
  params: ActivateResourceParams,
  repository?: IBusinessConfiguredResourcesRepository
): Promise<ActivateResourceActionResult> {
  try {
    const configuredResourcesRepository = repository || new BusinessConfiguredResourcesRepository();
    const useCase = new ActivateResourceUseCase(configuredResourcesRepository);
    
    await useCase.execute(params);

    return {
      success: true,
      message: 'Recurso activado exitosamente',
    };
  } catch (error) {
    console.error('Error en activateResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

