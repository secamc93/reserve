'use server';

import { env } from '@shared/config';

export interface GetUnitsWithResidentsInput {
  publicToken: string;
}

export interface UnitWithResident {
  property_unit_id: number;
  property_unit_number: string;
  resident_id: number | null;
  resident_name: string | null;
}

export interface GetUnitsWithResidentsResult {
  success: boolean;
  message?: string;
  data?: UnitWithResident[];
  error?: string;
}

export async function getUnitsWithResidentsAction(
  input: GetUnitsWithResidentsInput
): Promise<GetUnitsWithResidentsResult> {
  try {
    const url = `${env.API_BASE_URL}/public/units-with-residents`;
    console.log('🏠 [ACTION] getUnitsWithResidents - Request:', { url });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${input.publicToken}`
      }
    });

    const result = await response.json();

        console.log('📥 [ACTION] getUnitsWithResidents - Response:', {
          status: response.status,
          success: result.success,
          unitsCount: result.data?.length,
          fullData: result.data // Agregar datos completos para debug
        });

    if (!response.ok) {
      console.error('❌ [ACTION] getUnitsWithResidents - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al obtener unidades con residentes',
        message: result.message
      };
    }

    console.log('✅ [ACTION] getUnitsWithResidents - Unidades obtenidas exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] getUnitsWithResidents - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}
