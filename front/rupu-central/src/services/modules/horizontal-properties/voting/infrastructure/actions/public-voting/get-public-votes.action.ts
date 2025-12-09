'use server';

import { env } from '@shared/config';

export interface GetPublicVotesInput {
  publicToken: string;
}

export interface PublicVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
}

export interface GetPublicVotesResult {
  success: boolean;
  message?: string;
  data?: PublicVote[];
  error?: string;
}

export async function getPublicVotesAction(
  input: GetPublicVotesInput
): Promise<GetPublicVotesResult> {
  try {
    const url = `${env.API_BASE_URL}/public/votes`;
    console.log('🗳️ [ACTION] getPublicVotes - Request:', { url });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${input.publicToken}`
      }
    });

    const result = await response.json();

        console.log('📥 [ACTION] getPublicVotes - Response:', {
          status: response.status,
          success: result.success,
          votesCount: result.data?.length,
          fullData: result.data // Agregar datos completos para debug
        });

    if (!response.ok) {
      console.error('❌ [ACTION] getPublicVotes - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al obtener votos emitidos',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getPublicVotes - Votos obtenidos exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getPublicVotes - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}
