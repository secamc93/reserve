/**
 * Componente principal del dashboard IAM
 */

'use client';

import { 
  UsersIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  CubeTransparentIcon,
  BuildingOfficeIcon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useDashboard } from '../hooks/use-dashboard';
import { Button } from '@shared/ui/button';
import { Spinner } from '@shared/ui';

export function DashboardPage() {
  const { stats, loading, error, refresh } = useDashboard({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" color="primary" text="Cargando estadísticas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refresh} className="btn-primary">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Contenido principal */}
      <div className="w-full">
        <div className="container mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8 lg:py-12 max-w-7xl">
          {/* Tabla de Resumen */}
          <div className="mb-6 sm:mb-8">
            {/* Teléfono: métricas en bloques de 2 columnas */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {[
                { label: 'Usuarios', Icon: UsersIcon, total: stats.users.total, detail: [`${stats.users.active} activos`, `${stats.users.inactive} inactivos`] },
                { label: 'Roles', Icon: ShieldCheckIcon, total: stats.roles.total, detail: [`${stats.roles.system} sistema`, `${stats.roles.custom} personalizados`] },
                { label: 'Permisos', Icon: KeyIcon, total: stats.permissions.total, detail: [`${stats.permissions.assigned} asignados`, `${stats.permissions.unassigned} sin asignar`] },
                { label: 'Recursos', Icon: CubeTransparentIcon, total: stats.resources.total, detail: [`${stats.resources.active} activos`, `${stats.resources.inactive} inactivos`] },
                { label: 'Negocios', Icon: BuildingOfficeIcon, total: stats.businesses.total, detail: [`${stats.businesses.active} activos`, `${stats.businesses.inactive} inactivos`] },
                { label: 'Tipos de Negocio', Icon: TagIcon, total: stats.business_types.total, detail: [] as string[] },
              ].map(({ label, Icon, total, detail }) => (
                <div key={label} className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium truncate" title={label}>{label}</span>
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{total}</div>
                  {detail.map((d) => (
                    <div key={d} className="text-xs text-gray-500 truncate" title={d}>{d}</div>
                  ))}
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="table table-compact w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Módulo</th>
                      <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Total</th>
                      <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Usuarios</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900">{stats.users.total}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="text-green-600 font-medium">{stats.users.active} activos</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-red-600 font-medium">{stats.users.inactive} inactivos</span>
                          {stats.users.super_users > 0 && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="text-purple-600 font-medium">{stats.users.super_users} super admins</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Roles</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900">{stats.roles.total}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="text-yellow-600 font-medium">{stats.roles.system} sistema</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-blue-600 font-medium">{stats.roles.custom} personalizados</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <KeyIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Permisos</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900">{stats.permissions.total}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="text-green-600 font-medium">{stats.permissions.assigned} asignados</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-600 font-medium">{stats.permissions.unassigned} sin asignar</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <CubeTransparentIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Recursos</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900">{stats.resources.total}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="text-green-600 font-medium">{stats.resources.active} activos</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-red-600 font-medium">{stats.resources.inactive} inactivos</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Negocios</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900">{stats.businesses.total}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="text-green-600 font-medium">{stats.businesses.active} activos</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-red-600 font-medium">{stats.businesses.inactive} inactivos</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">Tipos de Negocio</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900">{stats.business_types.total}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="text-xs text-gray-500">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


