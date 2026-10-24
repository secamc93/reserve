'use server';

import { PropertyUnitsRepository } from '../repositories';
import { CreatePropertyUnitUseCase } from '../../application';
import { CreatePropertyUnitParams, PropertyUnit } from '../../domain';

export type CreatePropertyUnitResult = { success: true; data: PropertyUnit } | { success: false; error: string };

/**
 * Devuelve el error en vez de lanzarlo: en producción Next oculta el mensaje de los errores
 * lanzados desde una server action y el formulario no podría decir qué falló.
 */
export async function createPropertyUnitAction(params: CreatePropertyUnitParams): Promise<CreatePropertyUnitResult> {
  try {
    const repository = new PropertyUnitsRepository();
    const useCase = new CreatePropertyUnitUseCase(repository);
    return { success: true, data: await useCase.execute(params) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
