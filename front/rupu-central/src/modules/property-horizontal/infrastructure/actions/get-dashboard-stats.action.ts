/**
 * Server Action: Obtener estadísticas del dashboard
 */

'use server';

import { GetDashboardStatsUseCase } from '../../application/get-dashboard-stats.use-case';
import { hasPermission, Permission, Role } from '@config/rbac';

export async function getDashboardStatsAction(userRole: Role) {
  try {
    // Verificar permisos
    if (!hasPermission(userRole, Permission.PH_VIEW_DASHBOARD)) {
      return {
        success: false,
        error: 'No tienes permisos para ver el dashboard',
      };
    }

    const useCase = new GetDashboardStatsUseCase();
    const stats = await useCase.execute();

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

