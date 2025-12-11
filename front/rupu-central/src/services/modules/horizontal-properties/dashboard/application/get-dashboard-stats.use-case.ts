/**
 * Caso de uso: Obtener estadísticas del dashboard
 */

import { DashboardStats } from '../domain';
import { IDashboardRepository, GetDashboardParams } from '../domain/ports';

export class GetDashboardStatsUseCase {
  constructor(private repository: IDashboardRepository) {}

  async execute(params: GetDashboardParams): Promise<DashboardStats> {
    return await this.repository.getDashboard(params);
  }
}
