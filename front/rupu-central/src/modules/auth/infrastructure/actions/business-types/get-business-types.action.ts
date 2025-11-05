/**
 * Server Action: Obtener Business Types
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetBusinessTypesUseCase } from '../../../application/business-types/get-business-types.use-case';
import { BusinessTypesRepository } from '../../../infrastructure/repositories/business-types/business-types.repository';
import { GetBusinessTypesResult } from '../../../domain/entities';

export interface GetBusinessTypesActionInput {
  token: string;
}

export async function getBusinessTypesAction(input: GetBusinessTypesActionInput): Promise<GetBusinessTypesResult> {
  try {
    console.log('🔑 getBusinessTypesAction - Obteniendo tipos de negocio');
    
    const businessTypesRepository = new BusinessTypesRepository();
    const getBusinessTypesUseCase = new GetBusinessTypesUseCase(businessTypesRepository);
    
    const result = await getBusinessTypesUseCase.execute(input);

    if (result.success) {
      console.log('✅ Tipos de negocio obtenidos:', result.data?.count);
    } else {
      console.log('❌ Error obteniendo tipos de negocio:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en getBusinessTypesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
