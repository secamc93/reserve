/**
 * Server Action: Obtener unidades que votaron en la votación anterior
 */

'use server';

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import type { PreviousVotingVotedUnits } from '../../domain/entities/vote.entity';

export interface GetPreviousVotedUnitsInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface GetPreviousVotedUnitsResult {
  success: boolean;
  data?: PreviousVotingVotedUnits;
  error?: string;
}

export async function getPreviousVotedUnitsAction(input: GetPreviousVotedUnitsInput): Promise<GetPreviousVotedUnitsResult> {
  const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${input.groupId}/votings/${input.votingId}/votes/previous-voted-units`;
  const startTime = Date.now();

  logHttpRequest({ method: 'GET', url });

  try {
    const response = await fetch(url, {
      method: 'GET',
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
      summary: `${data.data?.total_voted || 0} unidades votaron en la votación anterior`,
      data,
    });

    return {
      success: true,
      data: {
        previousVotingId: data.data.previous_voting_id,
        previousVotingTitle: data.data.previous_voting_title,
        votedUnitIds: data.data.voted_unit_ids,
        totalVoted: data.data.total_voted,
      },
    };
  } catch (error) {
    console.error('Error en getPreviousVotedUnitsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
