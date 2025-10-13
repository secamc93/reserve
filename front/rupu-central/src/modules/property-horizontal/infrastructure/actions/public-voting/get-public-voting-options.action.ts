'use server';

import { env } from '@shared/config';

export interface GetPublicVotingOptionsInput {
  publicToken: string;
}

export interface VotingOption {
  id: number;
  option_text: string;
  option_code: string;
}

export interface GetPublicVotingOptionsResult {
  success: boolean;
  data?: {
    options: VotingOption[];
  };
  error?: string;
  message?: string;
}

export async function getPublicVotingOptionsAction(
  input: GetPublicVotingOptionsInput
): Promise<GetPublicVotingOptionsResult> {
  try {
    const url = `${env.API_BASE_URL}/public/voting-info`;
    console.log('📊 [ACTION] getPublicVotingOptions - Request:', { url });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${input.publicToken}`
      }
    });

    const result = await response.json();

    console.log('📥 [ACTION] getPublicVotingOptions - Response:', {
      status: response.status,
      success: result.success,
      optionsCount: result.data?.options?.length
    });

    if (!response.ok) {
      console.error('❌ [ACTION] getPublicVotingOptions - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al obtener opciones de votación',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getPublicVotingOptions - Opciones obtenidas exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getPublicVotingOptions - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}
