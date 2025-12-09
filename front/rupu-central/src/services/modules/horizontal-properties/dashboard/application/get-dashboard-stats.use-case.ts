/**
 * Caso de uso: Obtener estadísticas del dashboard
 */

import { DashboardStats } from '../domain';

export class GetDashboardStatsUseCase {
  async execute(): Promise<DashboardStats> {
    // Aquí iría la lógica real consultando repositorios
    return {
      totalUnits: 24,
      occupiedUnits: 20,
      pendingFees: 8,
      totalRevenue: 125000,
    };
  }
}

