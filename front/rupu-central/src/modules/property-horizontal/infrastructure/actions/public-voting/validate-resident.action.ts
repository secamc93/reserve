/**
 * Server Action: Validar residente para votación pública
 */

'use server';

import { env } from '@shared/config';

export interface ValidateResidentInput {
  publicToken: string;
  propertyUnitId: number;
  dni: string;
}

export interface ValidateResidentResult {
  success: boolean;
  data?: {
    resident_id: number;
    resident_name: string;
    property_unit_id: number;
    property_unit_number: string;
    voting_auth_token: string;
    voting_id: number;
    hp_id: number;
    group_id: number;
  };
  error?: string;
  message?: string;
}

export async function validateResidentAction(
  input: ValidateResidentInput
): Promise<ValidateResidentResult> {
  try {
    const url = `${env.API_BASE_URL}/public/validate-resident`;
    console.log('🔐 [ACTION] validateResident - Request:', {
      url,
      propertyUnitId: input.propertyUnitId,
      dni: input.dni
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.publicToken}`
      },
      body: JSON.stringify({
        property_unit_id: input.propertyUnitId,
        dni: input.dni
      })
    });

    const result = await response.json();
    
    console.log('📥 [ACTION] validateResident - Response:', {
      status: response.status,
      success: result.success,
      data: result.data
    });

    if (!response.ok) {
      console.error('❌ [ACTION] validateResident - Error:', result.error || result.message);
      return {
        success: false,
        error: result.error || result.message || 'Error al validar residente',
        message: result.message
      };
    }

    console.log('✅ [ACTION] validateResident - Residente validado exitosamente');
    return result;
  } catch (error) {
    console.error('❌ [ACTION] validateResident - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

