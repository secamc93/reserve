/**
 * Server Action: Listar votaciones de un grupo (Público)
 */

'use server';

import { env } from '@shared/config';

export interface GetGroupVotingsInput {
  votingAuthToken: string;
}

export interface GroupVoting {
  id: number;
  voting_group_id: number;
  title: string;
  description: string;
  voting_type: string;
  is_secret: boolean;
  allow_abstention: boolean;
  is_active: boolean;
  display_order: number;
  required_percentage?: number;
  options_count: number;
  has_voted: boolean;
}

export interface GetGroupVotingsResult {
  success: boolean;
  message?: string;
  data?: {
    voting_group: {
      id: number;
      name: string;
      description: string;
      voting_start_date: string;
      voting_end_date: string;
      is_active: boolean;
      requires_quorum: boolean;
      quorum_percentage?: number;
    };
    votings: GroupVoting[];
    total_votings: number;
    active_votings: number;
    user_votes_count: number;
  };
  error?: string;
}

export async function getGroupVotingsAction(
  input: GetGroupVotingsInput
): Promise<GetGroupVotingsResult> {
  try {
    const url = `${env.API_BASE_URL}/public/voting-group/votings`;
    console.log('📊 [ACTION] getGroupVotings - Request:', { url });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${input.votingAuthToken}`
      },
      cache: 'no-store'
    });

    const result = await response.json();

    console.log('📥 [ACTION] getGroupVotings - Response:', {
      status: response.status,
      success: result.success,
      totalVotings: result.data?.total_votings,
      activeVotings: result.data?.active_votings,
      userVotesCount: result.data?.user_votes_count
    });

    if (!response.ok) {
      console.error('❌ [ACTION] getGroupVotings - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al obtener votaciones del grupo',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getGroupVotings - Votaciones obtenidas exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getGroupVotings - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}
