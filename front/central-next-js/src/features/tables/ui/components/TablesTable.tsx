'use client';

import React from 'react';
import { Table } from '@/features/tables/domain/Table';

interface TablesTableProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  loading: boolean;
}

const TablesTable: React.FC<TablesTableProps> = ({
  tables,
  onEdit,
  onDelete,
  loading
}) => {
  if (loading) {
    return (
      <div className="tables-table-container bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="loading-state p-8 text-center">
          <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="tables-table-container bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="empty-state p-12 text-center">
          <div className="empty-state-icon text-6xl mb-4">🍽️</div>
          <h3 className="empty-state-title text-xl font-semibold text-gray-900 mb-2">No hay mesas registradas</h3>
          <p className="empty-state-description text-gray-600 mb-6">
            Comienza creando la primera mesa para tu restaurante
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tables-table-container bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="tables-table min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)'
                }}
              >
                Mesa
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)'
                }}
              >
                Capacidad
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)'
                }}
              >
                Estado
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)'
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table) => (
              <tr key={table.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)'
                      }}
                    >
                      {table.number}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Mesa #{table.number}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {table.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">👥</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {table.capacity} personas
                      </div>
                      <div className="text-xs text-gray-500">
                        {table.capacity === 1 ? 'Individual' : 
                         table.capacity <= 4 ? 'Pequeña' :
                         table.capacity <= 8 ? 'Mediana' : 'Grande'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    table.isActive !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {table.isActive !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(table)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Editar mesa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(table)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar mesa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablesTable; 