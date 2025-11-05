/**
 * Server Action: Obtener recursos configurados de un business
 */

'use server';

import { GetBusinessConfiguredResourcesUseCase } from '../../../application/businesses';
import { BusinessConfiguredResourcesRepository } from '../../repositories/businesses';
import { IBusinessConfiguredResourcesRepository } from '../../../domain/ports';
import { GetBusinessConfiguredResourcesParams } from '../../../domain/ports/businesses/configured-resources.repository';

export interface GetBusinessConfiguredResourcesActionResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    code: string;
    resources: Array<{
      resource_id: number;
      resource_name: string;
      is_active: boolean;
    }>;
    created_at: string;
    updated_at: string;
  };
  error?: string;
  message?: string;
}

export async function getBusinessConfiguredResourcesAction(
  params: GetBusinessConfiguredResourcesParams,
  repository?: IBusinessConfiguredResourcesRepository
): Promise<GetBusinessConfiguredResourcesActionResult> {
  try {
    const configuredResourcesRepository = repository || new BusinessConfiguredResourcesRepository();
    const useCase = new GetBusinessConfiguredResourcesUseCase(configuredResourcesRepository);
    
    const result = await useCase.execute(params);

    return {
      success: true,
      data: {
        id: result.id,
        name: result.name,
        code: result.code,
        resources: result.resources,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    };
  } catch (error) {
    console.error('Error en getBusinessConfiguredResourcesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

