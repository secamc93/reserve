'use server';

import { PropertyUnitsRepository } from '../repositories';
import { UpdatePropertyUnitUseCase } from '../../application';
import { UpdatePropertyUnitParams, PropertyUnit } from '../../domain';

export type UpdatePropertyUnitResult = { success: true; data: PropertyUnit } | { success: false; error: string };

/**
 * Devuelve el error en vez de lanzarlo: en producción Next oculta el mensaje de los errores
 * lanzados desde una server action y el formulario no podría decir qué falló.
 */
export async function updatePropertyUnitAction(params: UpdatePropertyUnitParams): Promise<UpdatePropertyUnitResult> {
  try {
    const repository = new PropertyUnitsRepository();
    const useCase = new UpdatePropertyUnitUseCase(repository);
    return { success: true, data: await useCase.execute(params) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
