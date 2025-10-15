'use server';

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface VotingDetailsResult {
  success: boolean;
  data?: {
    units: Array<{
      property_unit_number: string;
      participation_coefficient: number;
      resident_name: string | null;
      resident_id: number | null; // ✅ NUEVO: ID del residente para mapeo correcto
      has_voted: boolean;
      option_text: string | null;
      option_code: string | null;
      option_color: string | null; // Color del voto decidido
      voted_at: string | null;
    }>;
    total_units: number;
    units_voted: number;
    units_pending: number;
  };
  error?: string;
}

interface GetVotingDetailsParams {
  hpId: number;
  votingGroupId: number;
  votingId: number;
  token: string;
}

export async function getVotingDetailsAction(
  params: GetVotingDetailsParams
): Promise<VotingDetailsResult> {
  const { hpId, votingGroupId, votingId, token } = params;
  const url = `${env.API_BASE_URL}/horizontal-properties/${hpId}/voting-groups/${votingGroupId}/votings/${votingId}/voting-details`;
  const startTime = Date.now();

  logHttpRequest({
    method: 'GET',
    url,
    token,
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;
    const backendResponse = await response.json();

    if (!response.ok || !backendResponse.success) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data: backendResponse,
      });
      return { success: false, error: backendResponse.message || `Error obteniendo detalles de votación: ${response.status}` };
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Detalles de votación obtenidos: ${backendResponse.data.total_units} unidades, ${backendResponse.data.units_voted} votadas`,
      data: backendResponse,
    });

    return {
      success: true,
      data: backendResponse.data,
    };
    } catch (error: unknown) {
      console.error('Error en getVotingDetailsAction:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error inesperado al obtener detalles de votación' };
    }
}
