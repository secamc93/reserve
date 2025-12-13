/**
 * Server Action: Obtener estadísticas del dashboard
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetDashboardStatsUseCase } from '../../application';
import { DashboardRepository } from '../repositories';

export interface GetDashboardStatsResult {
  success: boolean;
  data?: {
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
  error?: string;
}

export interface GetDashboardStatsParams {
  token: string;
  business_type_id?: number;
  business_id?: number;
}

export async function getDashboardStatsAction(
  params: GetDashboardStatsParams
): Promise<GetDashboardStatsResult> {
  try {
    console.log('📊 getDashboardStatsAction - Token recibido:', params.token ? 'Sí' : 'No');
    console.log('🔍 getDashboardStatsAction - Params:', params);

    const dashboardRepository = new DashboardRepository();
    const getDashboardStatsUseCase = new GetDashboardStatsUseCase(dashboardRepository);

    const result = await getDashboardStatsUseCase.execute(params);

    console.log('✅ Estadísticas del dashboard obtenidas');

    return {
      success: true,
      data: result.stats,
    };
  } catch (error) {
    console.error('❌ Error en getDashboardStatsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

