/**
 * Server Action: Obtener propiedad horizontal por ID
 */

'use server';

import { GetHorizontalPropertyByIdUseCase } from '../../application/get-horizontal-property-by-id.use-case';
import { HorizontalPropertiesRepository } from '../repositories/horizontal-properties.repository';
import { HorizontalProperty } from '../../domain/entities/horizontal-property.entity';

export interface GetHorizontalPropertyByIdInput {
  token: string;
  id: number;
}

export interface GetHorizontalPropertyByIdResult {
  success: boolean;
  data?: HorizontalProperty;
  error?: string;
}

export async function getHorizontalPropertyByIdAction(
  input: GetHorizontalPropertyByIdInput
): Promise<GetHorizontalPropertyByIdResult> {
  try {
    const repository = new HorizontalPropertiesRepository();
    const useCase = new GetHorizontalPropertyByIdUseCase(repository);
    const result = await useCase.execute(input);

    return {
      success: true,
      data: result.property,
    };
  } catch (error) {
    console.error('Error en getHorizontalPropertyByIdAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

