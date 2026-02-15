/**
 * Server Action: Obtener información completa de votación pública
 */

'use server';

import { env } from '@shared/config';

export interface GetVotingInfoInput {
  votingAuthToken: string;
  votingId?: number; // Opcional - requerido solo para tokens de grupo
}

export interface VotingOption {
  id: number;
  voting_id: number;
  option_text: string;
  option_code: string;
  display_order: number;
  is_active: boolean;
}

export interface GetVotingInfoResult {
  success: boolean;
  data?: {
    voting: {
      id: number;
      voting_group_id: number;
      title: string;
      description: string;
      voting_type: string;
      is_secret: boolean;
      allow_abstention: boolean;
      is_active: boolean;
      display_order: number;
      required_percentage: number;
    };
    options: VotingOption[];
    has_voted: boolean;
    my_vote?: {                    // ✅ NUEVO
      id: number;
      voting_option_id: number;
      option_text: string;
      option_code: string;
      voted_at: string;
    };
    results?: Array<{              // ✅ NUEVO
      voting_option_id: number;
      option_text: string;
      vote_count: number;
      percentage: number;
    }>;
    hp_id: number;
    voting_group_id: number;
    resident_id: number;
  };
  error?: string;
  message?: string;
}

export async function getVotingInfoAction(
  input: GetVotingInfoInput
): Promise<GetVotingInfoResult> {
  try {
    // Construir URL con query param si voting_id está presente (tokens de grupo)
    let url = `${env.API_BASE_URL}/public/voting-info`;
    if (input.votingId) {
      url += `?voting_id=${input.votingId}`;
    }

    console.log('📊 [ACTION] getVotingInfo - Request:', {
      url,
      votingId: input.votingId
    });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${input.votingAuthToken}`
      }
    });

    const result = await response.json();

    console.log('📥 [ACTION] getVotingInfo - Response:', {
      status: response.status,
      success: result.success,
      hasVoting: !!result.data?.voting,
      optionsCount: result.data?.options?.length,
      fullData: result.data
    });

    if (!response.ok) {
      console.error('❌ [ACTION] getVotingInfo - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al cargar información de votación',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getVotingInfo - Información cargada exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getVotingInfo - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

