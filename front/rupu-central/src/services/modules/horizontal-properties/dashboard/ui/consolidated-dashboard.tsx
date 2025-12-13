/**
 * Dashboard consolidado para múltiples propiedades horizontales
 * Muestra resumen general y estadísticas por propiedad
 */

'use client';

import { DashboardStats, BusinessSummary } from '../domain/entities';
import { useRouter } from 'next/navigation';
import { Table } from '@shared/ui/table';
import { 
  BuildingOfficeIcon, 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ListBulletIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface ConsolidatedDashboardProps {
  data: DashboardStats;
  loading?: boolean;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function ConsolidatedDashboard({ 
  data, 
  loading,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: ConsolidatedDashboardProps) {
  const router = useRouter();
  const { summary, voting_stats, attendance_stats, business_summaries = [], pagination } = data;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Todas las estadísticas en un solo array
  const allStats = [
    {
      label: 'Propiedades',
      value: summary.total_horizontal_properties,
      icon: BuildingOfficeIcon,
      color: 'bg-gray-100',
    },
    {
      label: 'Unidades',
      value: summary.total_units,
      icon: HomeIcon,
      color: 'bg-gray-100',
    },
    {
      label: 'Residentes',
      value: summary.total_residents,
      icon: UsersIcon,
      color: 'bg-gray-100',
    },
    {
      label: 'Votaciones Activas',
      value: voting_stats.active_votings,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-gray-100',
    },
    {
      label: 'Votaciones Completadas',
      value: voting_stats.completed_votings,
      icon: CheckCircleIcon,
      color: 'bg-gray-100',
    },
    {
      label: 'Listas Activas',
      value: attendance_stats.active_lists,
      icon: ListBulletIcon,
      color: 'bg-gray-100',
    },
    {
      label: 'Total de Votos',
      value: voting_stats.total_votes,
      icon: ChartBarIcon,
      color: 'bg-gray-100',
    },
  ];

  // Formatear fecha
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Sin actividad';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      // Validar que la fecha sea válida (no 1970-01-01 o antes)
      if (isNaN(date.getTime()) || date.getTime() <= 0 || date.getFullYear() < 1971) {
        return 'Sin actividad';
      }
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Sin actividad';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen General - Todas las estadísticas en una sola fila */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen General</h2>
        <div className="flex flex-wrap gap-3">
          {allStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 flex-1 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <div className={`${stat.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5 leading-tight">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Propiedades por Propiedad */}
      {business_summaries.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Propiedades</h2>
          <Table
            columns={[
              {
                key: 'property',
                label: 'Propiedad',
                render: (_, business: BusinessSummary) => (
                  <div className="flex items-center gap-3">
                    {/* Logo/Imagen de la propiedad */}
                    {business.logo_url ? (
                      <div className="flex-shrink-0">
                        <img
                          src={business.logo_url}
                          alt={`Logo de ${business.business_name}`}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-gray-200"
                          style={{ display: 'none' }}
                        >
                          {business.business_name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-gray-200 flex-shrink-0">
                        {business.business_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{business.business_name}</div>
                      <div className="text-xs text-gray-500">ID: {business.business_id}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'units',
                label: 'Unidades',
                align: 'center',
                render: (_, business: BusinessSummary) => (
                  <span className="text-sm text-gray-900 font-semibold">
                    {business.total_units.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'residents',
                label: 'Residentes',
                align: 'center',
                render: (_, business: BusinessSummary) => (
                  <span className="text-sm text-gray-900 font-semibold">
                    {business.total_residents.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'active_votings',
                label: 'Votaciones Activas',
                align: 'center',
                render: (_, business: BusinessSummary) => (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {business.active_votings}
                  </span>
                ),
              },
              {
                key: 'active_lists',
                label: 'Listas Activas',
                align: 'center',
                render: (_, business: BusinessSummary) => (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {business.active_attendance_lists}
                  </span>
                ),
              },
              {
                key: 'last_activity',
                label: 'Última Actividad',
                render: (_, business: BusinessSummary) => (
                  <span className="text-sm text-gray-500">
                    {business.last_activity && new Date(business.last_activity).getTime() > 0 
                      ? formatDate(business.last_activity)
                      : 'Sin actividad'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Acciones',
                render: (_, business: BusinessSummary) => (
                  <button
                    onClick={() => router.push(`/properties/${business.business_id}`)}
                    className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                  >
                    Ver Detalle
                  </button>
                ),
              },
            ]}
            data={business_summaries}
            keyExtractor={(business) => business.business_id.toString()}
            emptyMessage="No hay propiedades horizontales disponibles"
            loading={loading}
            pagination={
              pagination && onPageChange && onPageSizeChange
                ? {
                    currentPage: pagination.page,
                    totalPages: pagination.total_pages,
                    totalItems: pagination.total,
                    itemsPerPage: pagination.page_size,
                    onPageChange: onPageChange,
                    onItemsPerPageChange: onPageSizeChange,
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Secciones Futuras - Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quejas - Pendiente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-100 rounded-lg p-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quejas</h3>
              <p className="text-sm text-gray-500">Sistema de gestión de quejas</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 italic">Funcionalidad pendiente de implementar</p>
            <p className="text-xs text-gray-400 mt-2">Aquí se mostrarán las quejas y reclamos de las propiedades</p>
          </div>
        </div>

        {/* Reuniones y Asambleas - Pendiente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-100 rounded-lg p-2">
              <CalendarIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reuniones y Asambleas</h3>
              <p className="text-sm text-gray-500">Calendario de eventos</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 italic">Funcionalidad pendiente de implementar</p>
            <p className="text-xs text-gray-400 mt-2">Aquí se mostrarán las reuniones, asambleas y fechas importantes</p>
          </div>
        </div>

        {/* Comunicaciones - Pendiente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-100 rounded-lg p-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Comunicaciones</h3>
              <p className="text-sm text-gray-500">Mensajes y anuncios</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 italic">Funcionalidad pendiente de implementar</p>
            <p className="text-xs text-gray-400 mt-2">Aquí se mostrarán los comunicados y anuncios importantes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

