/**
 * Componente principal del dashboard IAM
 */

'use client';

import Link from 'next/link';
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
          {/* Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link 
                href="/iam/users/create" 
                className="btn btn-primary w-full sm:w-auto justify-center"
              >
                Crear Nuevo Usuario
              </Link>
              <Link 
                href="/iam/roles/create" 
                className="btn w-full sm:w-auto justify-center"
                style={{ backgroundColor: '#10b981', color: '#ffffff' }}
              >
                Crear Nuevo Rol
              </Link>
              <Link 
                href="/iam/resources/create" 
                className="btn w-full sm:w-auto justify-center"
                style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
              >
                Crear Nuevo Recurso
              </Link>
            </div>
          </div>

          {/* Tabla de Resumen */}
          <div className="mb-6 sm:mb-8">
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
                          <UsersIcon className="h-4 w-4 text-blue-500" />
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
                          <ShieldCheckIcon className="h-4 w-4 text-green-500" />
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
                          <KeyIcon className="h-4 w-4 text-purple-500" />
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
                          <CubeTransparentIcon className="h-4 w-4 text-orange-500" />
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
                          <BuildingOfficeIcon className="h-4 w-4 text-indigo-500" />
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
                          <TagIcon className="h-4 w-4 text-cyan-500" />
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

