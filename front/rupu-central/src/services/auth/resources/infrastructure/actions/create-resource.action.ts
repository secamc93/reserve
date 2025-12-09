/**
 * Server Action: Crear Resource
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { CreateResourceUseCase } from '../../application';
import { ResourcesRepository } from '../repositories';
import { CreateResourceParams } from '../../domain/entities';

export interface CreateResourceResult {
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

export async function createResourceAction(params: CreateResourceParams): Promise<CreateResourceResult> {
  try {
    const resourcesRepository = new ResourcesRepository();
    const createResourceUseCase = new CreateResourceUseCase(resourcesRepository);

    const result = await createResourceUseCase.execute(params);

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
    console.error('Error en createResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
