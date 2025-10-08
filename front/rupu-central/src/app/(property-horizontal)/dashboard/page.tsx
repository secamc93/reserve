/**
 * Página del Dashboard de Property Horizontal
 * Server Component que obtiene datos y renderiza componentes del módulo
 */

import { DashboardStats } from '@modules/property-horizontal';
import { getDashboardStatsAction } from '@modules/property-horizontal/infrastructure/actions';
import { Role } from '@config/rbac';

export default async function DashboardPage() {
  // En una app real, obtendrías el rol del usuario desde la sesión
  const userRole = Role.ADMIN;
  
  // Llamar a la action desde el Server Component
  const result = await getDashboardStatsAction(userRole);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {result.success && result.data ? (
          <DashboardStats {...result.data} />
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {result.error || 'Error al cargar estadísticas'}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
            <p className="text-gray-600">Sin actividad reciente</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
            <p className="text-gray-600">No hay notificaciones nuevas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

