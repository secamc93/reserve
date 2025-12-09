/**
 * Server Action: Desactivar un recurso configurado
 */

'use server';

import { BusinessesUseCases } from '../../application';
import { DeactivateResourceParams } from '../../domain/ports';
import { BusinessesRepository, BusinessConfiguredResourcesRepository } from '../repositories';

export interface DeactivateResourceActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deactivateResourceAction(
  params: DeactivateResourceParams,
  authUseCases?: BusinessesUseCases
): Promise<DeactivateResourceActionResult> {
  try {
    const useCases = authUseCases || new BusinessesUseCases(
      new BusinessesRepository(),
      new BusinessConfiguredResourcesRepository()
    );

    await useCases.UseCaseDeactivateResource.execute(params);

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

