/**
 * Server Action: Obtener Resources
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetResourcesUseCase } from '../../../application/resources/get-resources.use-case';
import { ResourcesRepository } from '../../repositories/resources/resources.repository';

interface ResourceData {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetResourcesInput {
  page?: number;
  pageSize?: number;
  name?: string;
  description?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  token: string;
}

export interface GetResourcesResult {
  success: boolean;
  data?: {
    resources: ResourceData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

export async function getResourcesAction(input: GetResourcesInput): Promise<GetResourcesResult> {
  try {
    console.log('🔑 getResourcesAction - Parámetros:', {
      page: input.page,
      pageSize: input.pageSize,
      token: input.token ? 'Sí' : 'No'
    });
    
    const resourcesRepository = new ResourcesRepository();
    const getResourcesUseCase = new GetResourcesUseCase(resourcesRepository);
    
    const result = await getResourcesUseCase.execute(input);

    console.log('✅ Resources obtenidos:', result.resources.total);

    return {
      success: true,
      data: {
        resources: result.resources.resources.map((r: any) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
        total: result.resources.total,
        page: result.resources.page,
        pageSize: result.resources.pageSize,
        totalPages: result.resources.totalPages,
      },
    };
  } catch (error) {
    console.error('❌ Error en getResourcesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

