/**
 * Server Action: Delete Business Type
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { DeleteBusinessTypeUseCase } from '../../../application/business-types';
import { DeleteBusinessTypeRepository } from '../../../infrastructure/repositories/business-types/delete-business-type.repository';
import { DeleteBusinessTypeInput, DeleteBusinessTypeResult } from '../../../domain/entities';

export interface DeleteBusinessTypeActionInput extends DeleteBusinessTypeInput {
  token: string;
}

export async function deleteBusinessTypeAction(input: DeleteBusinessTypeActionInput): Promise<DeleteBusinessTypeResult> {
  try {
    console.log('🔑 deleteBusinessTypeAction - Eliminando tipo de negocio:', input.id);
    
    const deleteBusinessTypeRepository = new DeleteBusinessTypeRepository();
    const deleteBusinessTypeUseCase = new DeleteBusinessTypeUseCase(deleteBusinessTypeRepository);
    
    const result = await deleteBusinessTypeUseCase.execute(input);

    if (result.success) {
      console.log('✅ Tipo de negocio eliminado exitosamente');
    } else {
      console.log('❌ Error eliminando tipo de negocio:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en deleteBusinessTypeAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
