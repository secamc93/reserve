/**
 * Server Action: Actualizar Resource
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { UpdateResourceUseCase } from '../../application';
import { ResourcesRepository } from '../repositories';
import { UpdateResourceParams } from '../../domain/entities';

export interface UpdateResourceResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    business_type_id?: number;
    business_type_name?: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  message?: string;
}

export async function updateResourceAction(params: UpdateResourceParams): Promise<UpdateResourceResult> {
  try {
    const resourcesRepository = new ResourcesRepository();
    const updateResourceUseCase = new UpdateResourceUseCase(resourcesRepository);

    const result = await updateResourceUseCase.execute(params);

    return {
      success: true,
      data: {
        id: result.id,
        name: result.name,
        description: result.description,
        business_type_id: result.business_type_id,
        business_type_name: result.business_type_name,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error en updateResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
