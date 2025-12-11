/**
 * Repositorio de Dashboard
 * IMPORTANTE: Este archivo es server-only
 */

import { IDashboardRepository, GetDashboardStatsParams } from '../../domain/ports';
import { DashboardStats } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendDashboardStatsResponse {
  success: boolean;
  data: {
    users: {
      total: number;
      active: number;
      inactive: number;
      super_users: number;
    };
    roles: {
      total: number;
      system: number;
      custom: number;
    };
    permissions: {
      total: number;
      assigned: number;
      unassigned: number;
    };
    resources: {
      total: number;
      active: number;
      inactive: number;
    };
    businesses: {
      total: number;
      active: number;
      inactive: number;
    };
    business_types: {
      total: number;
    };
  };
}

export class DashboardRepository implements IDashboardRepository {
  async getDashboardStats(params: GetDashboardStatsParams): Promise<DashboardStats> {
    // Construir URL con query params
    const url = new URL(`${env.API_BASE_URL}/dashboard/stats`);

    if (params.business_type_id !== undefined) {
      url.searchParams.append('business_type_id', params.business_type_id.toString());
    }
    if (params.business_id !== undefined) {
      url.searchParams.append('business_id', params.business_id.toString());
    }

    const startTime = Date.now();

    logHttpRequest({
      method: 'GET',
      url: url.toString(),
      token: params.token,
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.token}`,
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.error || `Error obteniendo estadísticas: ${response.status}`);
      }

      const backendResponse: BackendDashboardStatsResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Estadísticas del dashboard obtenidas',
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear respuesta del backend a entidad del dominio
      return {
        users: backendResponse.data.users,
        roles: backendResponse.data.roles,
        permissions: backendResponse.data.permissions,
        resources: backendResponse.data.resources,
        businesses: backendResponse.data.businesses,
        business_types: backendResponse.data.business_types,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener estadísticas del servidor'
      );
    }
  }
}
