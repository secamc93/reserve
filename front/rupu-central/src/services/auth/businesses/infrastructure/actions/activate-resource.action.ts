/**
 * Server Action: Activar un recurso configurado
 */

'use server';

import { BusinessesUseCases } from '../../application';
import { ActivateResourceParams } from '../../domain/ports';
import { BusinessesRepository, BusinessConfiguredResourcesRepository } from '../repositories';

export interface ActivateResourceActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function activateResourceAction(
  params: ActivateResourceParams,
  authUseCases?: BusinessesUseCases
): Promise<ActivateResourceActionResult> {
  try {
    const useCases = authUseCases || new BusinessesUseCases(
      new BusinessesRepository(),
      new BusinessConfiguredResourcesRepository()
    );

    await useCases.UseCaseActivateResource.execute(params);

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

