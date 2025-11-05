/**
 * Server Action: Eliminar Propiedad Horizontal
 */

'use server';

import { DeleteHorizontalPropertyUseCase } from '../../../application/horizontal-properties';
import { HorizontalPropertiesRepository } from '../../repositories/horizontal-properties';

export interface DeleteHorizontalPropertyInput {
  token: string;
  id: number;
}

export interface DeleteHorizontalPropertyResult {
  success: boolean;
  message?: string;
}

export async function deleteHorizontalPropertyAction(
  input: DeleteHorizontalPropertyInput
): Promise<DeleteHorizontalPropertyResult> {
  try {
    const repository = new HorizontalPropertiesRepository();
    const useCase = new DeleteHorizontalPropertyUseCase(repository);

    await useCase.execute({
      token: input.token,
      id: input.id,
    });

    return {
      success: true,
      message: 'Propiedad horizontal eliminada correctamente',
    };
  } catch (error) {
    console.error('Error en deleteHorizontalPropertyAction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar propiedad horizontal',
    };
  }
}


