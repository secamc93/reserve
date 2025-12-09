/**
 * Server Action: Generar Business Token
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GenerateBusinessTokenUseCase } from '../../application';
import { BusinessTokenRepository } from '../repositories';

export interface GenerateBusinessTokenInput {
  business_id: number;
  session_token: string;
}

export interface GenerateBusinessTokenActionResult {
  success: boolean;
  data?: {
    token: string;
  };
  error?: string;
}

export async function generateBusinessTokenAction(
  input: GenerateBusinessTokenInput
): Promise<GenerateBusinessTokenActionResult> {
  try {
    const businessTokenRepository = new BusinessTokenRepository();
    const generateBusinessTokenUseCase = new GenerateBusinessTokenUseCase(businessTokenRepository);

    const result = await generateBusinessTokenUseCase.execute({
      business_id: input.business_id,
      session_token: input.session_token,
    });

    return {
      success: true,
      data: {
        token: result.token,
      },
    };
  } catch (error) {
    console.error('❌ Error en generateBusinessTokenAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar business token',
    };
  }
}
