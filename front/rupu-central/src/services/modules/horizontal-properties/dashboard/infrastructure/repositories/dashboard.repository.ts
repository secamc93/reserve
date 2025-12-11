/**
 * Repository Implementation: Dashboard
 */

import { IDashboardRepository, GetDashboardParams } from '../../domain/ports';
import { DashboardStats } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendDashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export class DashboardRepository implements IDashboardRepository {
  async getDashboard(params: GetDashboardParams): Promise<DashboardStats> {
    const startTime = Date.now();
    const url = new URL(`${env.API_BASE_URL}/dashboard`);
    
    // Si se proporciona businessId, agregarlo como query param (para super admin)
    if (params.businessId) {
      url.searchParams.append('business_id', params.businessId.toString());
    }
    
    // Agregar parámetros de paginación (solo si no hay businessId, es decir, para super admin)
    if (!params.businessId) {
      if (params.page !== undefined) {
        url.searchParams.append('page', params.page.toString());
      }
      if (params.page_size !== undefined) {
        url.searchParams.append('page_size', params.page_size.toString());
      }
    }

    logHttpRequest({
      method: 'GET',
      url: url.toString(),
      token: params.token.substring(0, 20) + '...',
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: BackendDashboardResponse = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMessage = data.message || `Error ${response.status}`;
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(errorMessage);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Dashboard obtenido exitosamente',
        data: data.data,
      });

      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
