/**
 * Server Action: Resetear votación
 */

'use server';

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface ResetVotingInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface ResetVotingResult {
  success: boolean;
  data?: { votingId: number; deletedCount: number };
  error?: string;
}

export async function resetVotingAction(input: ResetVotingInput): Promise<ResetVotingResult> {
  const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${input.groupId}/votings/${input.votingId}/votes/reset`;
  const startTime = Date.now();

  logHttpRequest({ method: 'DELETE', url });

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.token}`,
      },
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      return {
        success: false,
        error: data.error || data.message || `Error ${response.status}`,
      };
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Votación reseteada: ${data.data?.deleted_count || 0} votos eliminados`,
      data,
    });

    return {
      success: true,
      data: {
        votingId: data.data.voting_id,
        deletedCount: data.data.deleted_count,
      },
    };
  } catch (error) {
    console.error('Error en resetVotingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
