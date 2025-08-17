'use client';

import React from 'react';
import { Table } from '@/services/tables/domain/entities/Table';

interface TablesStatsProps {
  tables: Table[];
}

const TablesStats: React.FC<TablesStatsProps> = ({ tables }) => {
  const totalTables = tables.length;
  const activeTables = tables.filter(table => table.isActive !== false).length;
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  const averageCapacity = totalTables > 0 ? Math.round(totalCapacity / totalTables) : 0;

  const stats = [
    {
      label: 'Total Mesas',
      value: totalTables,
      icon: '🍽️',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Mesas Activas',
      value: activeTables,
      icon: '✅',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Capacidad Total',
      value: totalCapacity,
      icon: '👥',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Capacidad Promedio',
      value: averageCapacity,
      icon: '📊',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stats-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Header con gradiente personalizado */}
          <div 
            className="stats-header px-4 py-3 text-white"
            style={{
              background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-right">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            </div>
          </div>
          
          {/* Footer con información adicional */}
          <div className="stats-body px-4 py-3 bg-gray-50">
            <div className="text-xs text-gray-600">
              {stat.label === 'Total Mesas' && (
                <span>Gestión completa del restaurante</span>
              )}
              {stat.label === 'Mesas Activas' && (
                <span>Disponibles para reservas</span>
              )}
              {stat.label === 'Capacidad Total' && (
                <span>Personas que pueden sentarse</span>
              )}
              {stat.label === 'Capacidad Promedio' && (
                <span>Por mesa en el restaurante</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TablesStats; 