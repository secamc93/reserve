/**
 * Repositorio de Infraestructura: Business Types
 */

import { IBusinessTypesRepository } from '../../../domain/ports/business-types/business-types.repository';
import { GetBusinessTypesResult, BusinessType, BusinessTypesList } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendBusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendBusinessTypesResponse {
  success: boolean;
  message: string;
  data: BackendBusinessType[];
}

export class BusinessTypesRepository implements IBusinessTypesRepository {
  async getBusinessTypes(token: string): Promise<GetBusinessTypesResult> {
    const url = `${env.API_BASE_URL}/business-types`;
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendBusinessTypesResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error obteniendo tipos de negocio: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.length} tipos de negocio obtenidos`,
        data: backendResponse,
      });

      if (!backendResponse.data || !Array.isArray(backendResponse.data)) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear business types del backend a entidad del dominio
      const businessTypes: BusinessType[] = backendResponse.data.map(bt => ({
        id: bt.id,
        name: bt.name,
        code: bt.code,
        description: bt.description,
        icon: bt.icon,
        is_active: bt.is_active,
        created_at: bt.created_at,
        updated_at: bt.updated_at,
      }));

      return {
        success: true,
        data: {
          businessTypes,
          count: businessTypes.length,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Error desconocido' },
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener tipos de negocio',
      };
    }
  }
}
