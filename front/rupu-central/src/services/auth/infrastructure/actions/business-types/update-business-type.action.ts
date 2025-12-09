/**
 * Server Action: Update Business Type
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UpdateBusinessTypeUseCase } from '../../../application/business-types';
import { UpdateBusinessTypeRepository } from '../../repositories/business-types/update-business-type.repository';
import { UpdateBusinessTypeInput, UpdateBusinessTypeResult } from '../../../domain/entities';

export interface UpdateBusinessTypeActionInput extends UpdateBusinessTypeInput {
  token: string;
}

export async function updateBusinessTypeAction(input: UpdateBusinessTypeActionInput): Promise<UpdateBusinessTypeResult> {
  try {
    console.log('🔑 updateBusinessTypeAction - Actualizando tipo de negocio:', input.id);

    const updateBusinessTypeRepository = new UpdateBusinessTypeRepository();
    const updateBusinessTypeUseCase = new UpdateBusinessTypeUseCase(updateBusinessTypeRepository);

    const result = await updateBusinessTypeUseCase.execute(input);

    if (result.success) {
      console.log('✅ Tipo de negocio actualizado exitosamente:', result.data?.name);
    } else {
      console.log('❌ Error actualizando tipo de negocio:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en updateBusinessTypeAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
