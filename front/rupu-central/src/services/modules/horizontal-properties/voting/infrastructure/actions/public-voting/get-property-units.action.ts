/**
 * Server Action: Obtener unidades de propiedad para validación pública
 */

'use server';

import { env } from '@shared/config';

export interface GetPropertyUnitsInput {
  publicToken: string;
}

export interface PropertyUnit {
  id: number;
  number: string;
}

export interface GetPropertyUnitsResult {
  success: boolean;
  data?: {
    units: PropertyUnit[];
  };
  error?: string;
  message?: string;
}

export async function getPropertyUnitsForPublicVotingAction(
  input: GetPropertyUnitsInput
): Promise<GetPropertyUnitsResult> {
  try {
    const url = `${env.API_BASE_URL}/public/property-units`;
    console.log('📦 [ACTION] getPropertyUnits - Request:', { url });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${input.publicToken}`
      }
    });

    const result = await response.json();

    console.log('📥 [ACTION] getPropertyUnits - Response:', {
      status: response.status,
      success: result.success,
      unitsCount: result.data?.units?.length
    });

    if (!response.ok) {
      console.error('❌ [ACTION] getPropertyUnits - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al cargar unidades',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getPropertyUnits - Unidades cargadas exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getPropertyUnits - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

