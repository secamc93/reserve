/**
 * Route Handler: GET /api/property-horizontal/dashboard
 * Endpoint REST para obtener estadísticas del dashboard
 */

import { NextResponse } from 'next/server';
import { getDashboardStatsAction } from '@modules/property-horizontal/infrastructure/actions';
import { Role } from '@config/rbac';
import { Logger } from '@shared/infrastructure';

export async function GET() {
  try {
    // En una app real, extraerías el rol del token/sesión
    const userRole = Role.ADMIN;

    Logger.info('Dashboard stats request', { role: userRole });

    const result = await getDashboardStatsAction(userRole);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    Logger.error('Dashboard stats error', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

