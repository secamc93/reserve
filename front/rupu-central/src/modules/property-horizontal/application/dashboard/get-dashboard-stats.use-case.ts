/**
 * Caso de uso: Obtener estadísticas del dashboard
 */

export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  pendingFees: number;
  totalRevenue: number;
}

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

