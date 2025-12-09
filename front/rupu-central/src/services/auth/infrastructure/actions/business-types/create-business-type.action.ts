/**
 * Server Action: Create Business Type
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { CreateBusinessTypeUseCase } from '../../../application/business-types';
import { CreateBusinessTypeRepository } from '../../repositories/business-types/create-business-type.repository';
import { CreateBusinessTypeInput, CreateBusinessTypeResult } from '../../../domain/entities';

export interface CreateBusinessTypeActionInput extends CreateBusinessTypeInput {
  token: string;
}

export async function createBusinessTypeAction(input: CreateBusinessTypeActionInput): Promise<CreateBusinessTypeResult> {
  try {
    console.log('🔑 createBusinessTypeAction - Creando tipo de negocio:', input.name);

    const createBusinessTypeRepository = new CreateBusinessTypeRepository();
    const createBusinessTypeUseCase = new CreateBusinessTypeUseCase(createBusinessTypeRepository);

    const result = await createBusinessTypeUseCase.execute(input);

    if (result.success) {
      console.log('✅ Tipo de negocio creado exitosamente:', result.data?.name);
    } else {
      console.log('❌ Error creando tipo de negocio:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en createBusinessTypeAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
