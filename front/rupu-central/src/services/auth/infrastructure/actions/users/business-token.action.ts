/**
 * Server Action: Obtener business token
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { BusinessTokenUseCase } from '../../../application/users/business-token.use-case';
import { BusinessTokenRepository } from '../../repositories/users/business-token.repository';

export interface BusinessTokenInput {
  business_id: number;
}

export interface BusinessTokenResult {
  success: boolean;
  data?: {
    token: string;
  };
  error?: string;
}

export async function businessTokenAction(
  input: BusinessTokenInput,
  sessionToken: string
): Promise<BusinessTokenResult> {
  try {
    console.log('🔑 businessTokenAction - Obteniendo business token para business_id:', input.business_id);

    const businessTokenRepository = new BusinessTokenRepository();
    const businessTokenUseCase = new BusinessTokenUseCase(businessTokenRepository);

    const result = await businessTokenUseCase.execute({
      business_id: input.business_id,
      token: sessionToken,
    });

    if (result.success) {
      console.log('✅ Business token obtenido exitosamente');
    } else {
      console.log('❌ Error obteniendo business token:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en businessTokenAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
