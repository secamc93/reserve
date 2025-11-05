'use server';

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface GetUnvotedUnitsInput {
  businessId: number;
  groupId: number;
  votingId: number;
  token: string; // Token de autenticación
  unitNumber?: string; // Filtro opcional por número de unidad
}

export interface UnvotedUnit {
  unit_id: number;
  unit_number: string;
  resident_id: number | null;
  resident_name: string | null;
}

export interface GetUnvotedUnitsResult {
  success: boolean;
  message?: string;
  data?: UnvotedUnit[];
  error?: string;
}

export async function getUnvotedUnitsAction(
  input: GetUnvotedUnitsInput
): Promise<GetUnvotedUnitsResult> {
  const { businessId, groupId, votingId, token, unitNumber } = input;
  const startTime = Date.now();

  // Construir URL: el group_id va en el path, no como query parameter
  const url = new URL(`${env.API_BASE_URL}/horizontal-properties/voting-groups/${groupId}/votings/${votingId}/unvoted-units`);
  if (businessId !== undefined) url.searchParams.append('business_id', String(businessId));
  
  if (unitNumber) {
    url.searchParams.append('unit_number', unitNumber);
  }

  // Log de la petición HTTP
  logHttpRequest({
    method: 'GET',
    url: url.toString(),
    token: token.substring(0, 20) + '...', // Solo mostrar parte del token por seguridad
  });

  try {
    if (!token) {
      console.error('❌ [UNVOTED UNITS] No se encontró el token');
      return {
        success: false,
        error: 'No se encontró el token de autenticación'
      };
    }

    console.log(`🏠 [UNVOTED UNITS] Consultando unidades sin votar:`, {
      businessId,
      groupId,
      votingId,
      unitNumber: unitNumber || 'todos',
      url: url.toString()
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    const duration = Date.now() - startTime;

    console.log(`📥 [UNVOTED UNITS] Respuesta del backend:`, {
      status: response.status,
      success: result.success,
      unitsCount: result.data?.length || 0,
      duration: `${duration}ms`,
      businessId,
      groupId,
      votingId,
      unitNumber: unitNumber || 'todos'
    });

    if (!response.ok) {
      console.error(`❌ [UNVOTED UNITS] Error del backend:`, {
        status: response.status,
        error: result.error || result.message,
        businessId,
        groupId,
        votingId
      });
      
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data: result,
      });

      return {
        success: false,
        error: result.error || result.message || 'Error al obtener unidades sin votar',
        message: result.message
      };
    }

    // Log de éxito HTTP
    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `${result.data?.length || 0} unidades sin votar obtenidas`,
      data: result,
    });

    console.log(`✅ [UNVOTED UNITS] Unidades sin votar obtenidas exitosamente:`, {
      count: result.data?.length || 0,
      businessId,
      groupId,
      votingId,
      unitNumber: unitNumber || 'todos',
      duration: `${duration}ms`
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ [UNVOTED UNITS] Exception:`, {
      error: error instanceof Error ? error.message : error,
      businessId,
      groupId,
      votingId,
      duration: `${duration}ms`
    });

    logHttpError({
      status: 0,
      statusText: 'Network Error',
      duration,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return {
      success: false,
      error: 'Error de conexión. Por favor, intente nuevamente.'
    };
  }
}
