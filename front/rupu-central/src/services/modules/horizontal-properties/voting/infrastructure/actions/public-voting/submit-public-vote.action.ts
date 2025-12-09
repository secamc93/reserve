/**
 * Server Action: Registrar voto público
 */

'use server';

import { env } from '@shared/config';

export interface SubmitPublicVoteInput {
  votingAuthToken: string;
  votingOptionId: number;
}

export interface SubmitPublicVoteResult {
  success: boolean;
  data?: {
    id: number;
    voting_id: number;
    resident_id: number;
    voting_option_id: number;
    voted_at: string;
    ip_address?: string;
    user_agent?: string;
  };
  error?: string;
  message?: string;
}

export async function submitPublicVoteAction(
  input: SubmitPublicVoteInput
): Promise<SubmitPublicVoteResult> {
  try {
    const url = `${env.API_BASE_URL}/public/vote`;
    console.log('🗳️ [ACTION] submitPublicVote - Request:', {
      url,
      votingOptionId: input.votingOptionId
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.votingAuthToken}`
      },
      body: JSON.stringify({
        voting_option_id: input.votingOptionId
      })
    });

    const result = await response.json();

    console.log('📥 [ACTION] submitPublicVote - Response:', {
      status: response.status,
      success: result.success,
      voteId: result.data?.id
    });

    if (!response.ok) {
      console.error('❌ [ACTION] submitPublicVote - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al registrar voto',
        message: result.message
      };
    }

    console.log('✅ [ACTION] submitPublicVote - Voto registrado exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] submitPublicVote - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

