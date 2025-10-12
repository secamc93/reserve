/**
 * Server Action: Crear propiedad horizontal
 */

'use server';

import { CreateHorizontalPropertyUseCase } from '../../../application';
import { HorizontalPropertiesRepository } from '../../repositories/horizontal-properties.repository';
import { HorizontalProperty, CreateHorizontalPropertyDTO } from '../../../domain/entities';

export interface CreateHorizontalPropertyInput {
  token: string;
  data: CreateHorizontalPropertyDTO;
}

export interface CreateHorizontalPropertyResult {
  success: boolean;
  data?: HorizontalProperty;
  error?: string;
}

export async function createHorizontalPropertyAction(
  input: CreateHorizontalPropertyInput
): Promise<CreateHorizontalPropertyResult> {
  try {
    const repository = new HorizontalPropertiesRepository();
    const useCase = new CreateHorizontalPropertyUseCase(repository);
    const result = await useCase.execute(input);

    return {
      success: true,
      data: result.property,
    };
  } catch (error) {
    console.error('Error en createHorizontalPropertyAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

