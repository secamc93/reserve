/**
 * Componente de estadísticas del dashboard
 */

'use client';

import { DashboardStats as DashboardStatsType } from '../domain/entities';

interface DashboardStatsProps {
  data: DashboardStatsType;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const { summary, voting_stats, attendance_stats } = data;

  const summaryStats = [
    { 
      label: 'Propiedades Horizontales', 
      value: summary.total_horizontal_properties, 
      color: 'bg-blue-500',
      icon: '🏢'
    },
    { 
      label: 'Unidades', 
      value: summary.total_units, 
      color: 'bg-green-500',
      icon: '🏠'
    },
    { 
      label: 'Residentes', 
      value: summary.total_residents, 
      color: 'bg-purple-500',
      icon: '👥'
    },
    { 
      label: 'Grupos de Votación', 
      value: summary.total_voting_groups, 
      color: 'bg-orange-500',
      icon: '🗳️'
    },
  ];

  const votingStats = [
    { 
      label: 'Votaciones Activas', 
      value: voting_stats.active_votings, 
      color: 'bg-green-500',
      icon: '✅'
    },
    { 
      label: 'Votaciones Completadas', 
      value: voting_stats.completed_votings, 
      color: 'bg-blue-500',
      icon: '✔️'
    },
    { 
      label: 'Votaciones Pendientes', 
      value: voting_stats.pending_votings, 
      color: 'bg-yellow-500',
      icon: '⏳'
    },
    { 
      label: 'Total de Votos', 
      value: voting_stats.total_votes, 
      color: 'bg-purple-500',
      icon: '📊'
    },
  ];

  const attendanceStats = [
    { 
      label: 'Listas Activas', 
      value: attendance_stats.active_lists, 
      color: 'bg-green-500',
      icon: '📋'
    },
    { 
      label: 'Total de Registros', 
      value: attendance_stats.total_records, 
      color: 'bg-blue-500',
      icon: '📝'
    },
    { 
      label: 'Asistencias Confirmadas', 
      value: attendance_stats.attended_records, 
      color: 'bg-green-600',
      icon: '✓'
    },
    { 
      label: 'Apoderados', 
      value: attendance_stats.total_proxies, 
      color: 'bg-indigo-500',
      icon: '👤'
    },
  ];

  // Combinar todas las estadísticas en un solo array
  const allStats = [...summaryStats, ...votingStats, ...attendanceStats];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {allStats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`${stat.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-sm">{stat.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-700 text-xs font-medium mb-0.5 truncate">{stat.label}</h3>
              <p className="text-lg font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

