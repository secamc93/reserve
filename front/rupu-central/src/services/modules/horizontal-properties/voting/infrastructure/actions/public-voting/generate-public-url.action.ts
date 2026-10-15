/**
 * Server Action: Generar URL pública para votación (Admin)
 */

'use server';

import { headers } from 'next/headers';
import { env } from '@shared/config';
import { resolvePublicBaseUrl } from '../../http/public-base-url';

export interface GeneratePublicUrlInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  durationHours: number;
  /** Por defecto `<origen de la petición>/public/vote`. */
  frontendUrl?: string;
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
    const frontendUrl = input.frontendUrl || `${resolvePublicBaseUrl(await headers())}/public/vote`;
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
          frontend_url: frontendUrl
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

