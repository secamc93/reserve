/**
 * Server Action: Obtener lista de Resources
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetResourcesUseCase } from '../../application';
import { ResourcesRepository } from '../repositories';
import { GetResourcesParams } from '../../domain/entities';

export interface GetResourcesResult {
  success: boolean;
  data?: {
    resources: Array<{
      id: number;
      name: string;
      description: string;
      business_type_id?: number;
      business_type_name?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

export async function getResourcesAction(params: GetResourcesParams): Promise<GetResourcesResult> {
  try {
    const resourcesRepository = new ResourcesRepository();
    const getResourcesUseCase = new GetResourcesUseCase(resourcesRepository);

    const result = await getResourcesUseCase.execute(params);

    return {
      success: true,
      data: {
        resources: result.resources.map((resource) => ({
          ...resource,
          createdAt: resource.createdAt.toISOString(),
          updatedAt: resource.updatedAt.toISOString(),
        })),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error('Error en getResourcesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
