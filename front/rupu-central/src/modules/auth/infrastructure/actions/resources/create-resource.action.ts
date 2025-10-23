/**
 * Server Action: Crear Resource
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { CreateResourceUseCase } from '../../../application/resources/create-resource.use-case';
import { ResourcesRepository } from '../../repositories/resources/resources.repository';

export interface CreateResourceInput {
  name: string;
  description: string;
  token: string;
}

export interface CreateResourceResult {
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

export async function createResourceAction(input: CreateResourceInput): Promise<CreateResourceResult> {
  try {
    console.log('🔑 createResourceAction - Datos:', {
      name: input.name,
      description: input.description,
      token: input.token ? 'Sí' : 'No'
    });
    
    const resourcesRepository = new ResourcesRepository();
    const createResourceUseCase = new CreateResourceUseCase(resourcesRepository);
    
    const result = await createResourceUseCase.execute(input);

    console.log('✅ Recurso creado:', result.resource.name);

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
    console.error('❌ Error en createResourceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

