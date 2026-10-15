/**
 * Server Action: Validar residente para votación pública
 */

'use server';

import { env } from '@shared/config';

export interface ValidateResidentInput {
  publicToken: string;
  propertyUnitId: number;
  /** Solo si el grupo exige documento (`require_document_validation`). */
  dni?: string;
}

export interface ValidateResidentResult {
  success: boolean;
  data?: {
    resident_id: number;
    resident_name: string;
    property_unit_id: number;
    property_unit_number: string;
    voting_auth_token: string;
    /** Solo con token de una votación individual. */
    voting_id?: number;
    hp_id: number;
    voting_group_id?: number;
    /** Nombre anterior de `voting_group_id`. */
    group_id?: number;
    is_group_token?: boolean;
    require_document_validation?: boolean;
  };
  error?: string;
  message?: string;
  /** Código HTTP (400 documento requerido, 404 no coincide, 403 inactivo, 401 enlace vencido). */
  status?: number;
}

export async function validateResidentAction(
  input: ValidateResidentInput
): Promise<ValidateResidentResult> {
  try {
    const url = `${env.API_BASE_URL}/public/validate-resident`;
    const dni = input.dni?.trim();
    console.log('🔐 [ACTION] validateResident - Request:', {
      url,
      propertyUnitId: input.propertyUnitId,
      withDocument: !!dni
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${input.publicToken}`
      },
      body: JSON.stringify(dni ? { property_unit_id: input.propertyUnitId, dni } : { property_unit_id: input.propertyUnitId })
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
        message: result.message,
        status: response.status
      };
    }

    console.log('✅ [ACTION] validateResident - Residente validado exitosamente');
    return { ...result, status: response.status };
  } catch (error) {
    console.error('❌ [ACTION] validateResident - Exception:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}

