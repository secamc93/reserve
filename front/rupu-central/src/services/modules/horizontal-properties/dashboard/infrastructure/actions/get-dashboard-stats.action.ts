/**
 * Server Action: Obtener estadísticas del dashboard
 */

'use server';

import { GetDashboardStatsUseCase } from '../../application';
import { DashboardRepository } from '../repositories';
import { DashboardStats } from '../../domain';

export interface GetDashboardStatsInput {
  token: string;
  businessId?: number; // Opcional para super admin
  page?: number;
  page_size?: number;
}

export interface GetDashboardStatsResult {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export async function getDashboardStatsAction(
  input: GetDashboardStatsInput
): Promise<GetDashboardStatsResult> {
  try {
    const repository = new DashboardRepository();
    const useCase = new GetDashboardStatsUseCase(repository);
    const data = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      page: input.page,
      page_size: input.page_size,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error en getDashboardStatsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
