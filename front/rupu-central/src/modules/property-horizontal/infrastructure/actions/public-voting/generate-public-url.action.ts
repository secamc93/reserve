/**
 * Server Action: Generar URL pública para votación (Admin)
 */

'use server';

import { env } from '@shared/config';

export interface GeneratePublicUrlInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  durationHours: number;
  frontendUrl: string;
}

export interface GeneratePublicUrlResult {
  success: boolean;
  data?: {
    public_url: string;
    token: string;
    voting_id: number;
    hp_id: number;
    expires_in_hours: number;
  };
  error?: string;
  message?: string;
}

export async function generatePublicUrlAction(
  input: GeneratePublicUrlInput
): Promise<GeneratePublicUrlResult> {
  try {
    const response = await fetch(
      `${env.API_BASE_URL}/horizontal-properties/voting-groups/${input.groupId}/votings/${input.votingId}/generate-public-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${input.token}`
        },
        body: JSON.stringify({
          business_id: input.businessId,
          duration_hours: input.durationHours,
          frontend_url: input.frontendUrl
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || 'Error al generar URL pública',
        message: result.message
      };
    }

    return result;
  } catch (error) {
    console.error('Error en generatePublicUrlAction:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

