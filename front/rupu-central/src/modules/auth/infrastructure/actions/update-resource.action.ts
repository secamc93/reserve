/**
 * Server Action: Actualizar Resource
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UpdateResourceUseCase } from '../../application/update-resource.use-case';
import { ResourcesRepository } from '../repositories/resources.repository';

export interface UpdateResourceInput {
  id: number;
  name: string;
  description: string;
  token: string;
}

export interface UpdateResourceResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export async function updateResourceAction(input: UpdateResourceInput): Promise<UpdateResourceResult> {
  try {
    console.log('✏️  updateResourceAction - ID:', input.id, 'Nombre:', input.name);
    
    const resourcesRepository = new ResourcesRepository();
    const updateResourceUseCase = new UpdateResourceUseCase(resourcesRepository);
    
    const result = await updateResourceUseCase.execute(input);

    console.log('✅ Recurso actualizado:', result.resource.name);

    return {
      success: true,
      data: {
        id: result.resource.id,
        name: result.resource.name,
        description: result.resource.description,
        createdAt: result.resource.createdAt.toISOString(),
        updatedAt: result.resource.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Error en updateResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

