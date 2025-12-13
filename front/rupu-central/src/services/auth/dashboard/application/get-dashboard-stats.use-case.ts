/**
 * Caso de uso: Obtener estadísticas del dashboard
 */

import { IDashboardRepository, GetDashboardStatsParams } from '../domain/ports';
import { DashboardStats } from '../domain/entities';

export interface GetDashboardStatsInput {
  token: string;
  business_type_id?: number;
  business_id?: number;
}

export interface GetDashboardStatsOutput {
  stats: DashboardStats;
}

export class GetDashboardStatsUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(input: GetDashboardStatsInput): Promise<GetDashboardStatsOutput> {
    const stats = await this.dashboardRepository.getDashboardStats({
      token: input.token,
      business_type_id: input.business_type_id,
      business_id: input.business_id,
    });

    return {
      stats,
    };
  }
}

