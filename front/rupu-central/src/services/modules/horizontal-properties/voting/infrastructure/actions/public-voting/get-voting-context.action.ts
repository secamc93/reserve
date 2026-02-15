'use server';

import { env } from '@shared/config';

export interface GetVotingContextInput {
  publicToken: string;
}

export interface VotingContextData {
  property: {
    id: number;
    name: string;
    address: string;
  };
  voting: {
    id: number;
    title: string;
    description: string;
  };
  voting_group: {
    id: number;
    name: string;
    description: string;
  };
  is_group_token?: boolean;
}

export interface GetVotingContextResult {
  success: boolean;
  message?: string;
  data?: VotingContextData;
  error?: string;
}

export async function getVotingContextAction(
  input: GetVotingContextInput
): Promise<GetVotingContextResult> {
  try {
    const url = `${env.API_BASE_URL}/public/voting-context`;
    console.log('🏢 [ACTION] getVotingContext - Request:', { url });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${input.publicToken}`
      }
    });

    const result = await response.json();

    console.log('📥 [ACTION] getVotingContext - Response:', {
      status: response.status,
      success: result.success,
      hasProperty: !!result.data?.property,
      hasVoting: !!result.data?.voting,
      hasGroup: !!result.data?.voting_group
    });

    if (!response.ok) {
      console.error('❌ [ACTION] getVotingContext - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al obtener contexto de votación',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getVotingContext - Contexto obtenido exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getVotingContext - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

