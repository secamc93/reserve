/**
 * Server Action: Obtener estadísticas del dashboard
 */

'use server';

import { GetDashboardStatsUseCase } from '../../../application';

export async function getDashboardStatsAction() {
  try {
    // TODO: Implementar validación de permisos dinámicos del backend
    // Por ahora, todos los usuarios autenticados pueden ver el dashboard
    
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

