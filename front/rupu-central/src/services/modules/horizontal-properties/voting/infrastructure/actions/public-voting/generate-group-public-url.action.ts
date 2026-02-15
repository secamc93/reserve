/**
 * Server Action: Generar URL pública para grupo de votación (Admin)
 */

'use server';

import { headers } from 'next/headers';
import { env } from '@shared/config';

export interface GenerateGroupPublicUrlInput {
  token: string;
  businessId: number;
  groupId: number;
  durationHours?: number;
  frontendUrl?: string;
}

export interface GenerateGroupPublicUrlResult {
  success: boolean;
  data?: {
    public_url: string;
    token: string;
    voting_group_id: number;
    hp_id: number;
    expires_in_hours: number;
    votings_count: number;
    group_name: string;
  };
  error?: string;
  message?: string;
}

export async function generateGroupPublicUrlAction(
  input: GenerateGroupPublicUrlInput
): Promise<GenerateGroupPublicUrlResult> {
  try {
    // Obtener host dinámicamente desde headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(
      `${env.API_BASE_URL}/horizontal-properties/voting-groups/${input.groupId}/generate-public-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${input.token}`
        },
        body: JSON.stringify({
          business_id: input.businessId,
          duration_hours: input.durationHours || 24,
          frontend_url: input.frontendUrl || `${baseUrl}/public/vote`
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || 'Error al generar URL pública de grupo',
        message: result.message
      };
    }

    return result;
  } catch (error) {
    console.error('Error en generateGroupPublicUrlAction:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}
