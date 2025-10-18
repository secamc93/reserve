/**
 * Server Action: Eliminar un voto
 */

'use server';

import { env } from '@shared/config';

export interface DeleteVoteInput {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
  voteId: number;
}

export interface DeleteVoteResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteVoteAction(
  input: DeleteVoteInput
): Promise<DeleteVoteResult> {
  try {
    const { token, hpId, groupId, votingId, voteId } = input;
    
    const url = `${env.API_BASE_URL}/horizontal-properties/${hpId}/voting-groups/${groupId}/votings/${votingId}/votes/${voteId}`;
    
    console.log('🗑️ [DELETE VOTE] Eliminando voto:', { url, voteId });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    console.log('📥 [DELETE VOTE] Respuesta:', {
      status: response.status,
      success: result.success,
      message: result.message
    });

    if (!response.ok) {
      console.error('❌ [DELETE VOTE] Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al eliminar voto',
        message: result.message
      };
    }

    console.log('✅ [DELETE VOTE] Voto eliminado exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [DELETE VOTE] Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

