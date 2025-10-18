'use server';

import { env } from '@shared/config';

export interface SubmitVoteInput {
  hpId: number;
  groupId: number;
  votingId: number;
  propertyUnitId: number;
  votingOptionId: number;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SubmitVoteResult {
  success: boolean;
  data?: {
    id: number;
    voting_id: number;
    property_unit_id: number;
    voting_option_id: number;
    voted_at: string;
    ip_address?: string;
    user_agent?: string;
  };
  error?: string;
  message?: string;
}

export async function submitVoteAction(
  input: SubmitVoteInput
): Promise<SubmitVoteResult> {
  try {
    const url = `${env.API_BASE_URL}/horizontal-properties/${input.hpId}/voting-groups/${input.groupId}/votings/${input.votingId}/vote`;
    
    console.log('🗳️ [ACTION] submitVote - Request:', {
      url,
      propertyUnitId: input.propertyUnitId,
      votingOptionId: input.votingOptionId,
      hpId: input.hpId,
      groupId: input.groupId,
      votingId: input.votingId
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.token}`
      },
      body: JSON.stringify({
        property_unit_id: input.propertyUnitId,
        voting_option_id: input.votingOptionId,
        ip_address: input.ipAddress,
        user_agent: input.userAgent
      })
    });

    const result = await response.json();

    console.log('📥 [ACTION] submitVote - Response:', {
      status: response.status,
      success: result.success,
      voteId: result.data?.id
    });

    if (!response.ok) {
      console.error('❌ [ACTION] submitVote - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al registrar voto',
        message: result.message
      };
    }

    console.log('✅ [ACTION] submitVote - Voto registrado exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] submitVote - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

