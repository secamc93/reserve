"use client";

import React from "react";
import { Table } from '@/services/tables/domain/entities/Table';
import DataTable, { DataTableColumn, DataTableRowAction } from '@/shared/ui/components/DataTable/DataTable';

interface TablesManagementProps {
  tables: Table[];
  loading: boolean;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
}

const TablesManagement: React.FC<TablesManagementProps> = ({ tables, loading, onEdit, onDelete }) => {
  const columns: Array<DataTableColumn<Table>> = [
    {
      key: 'number',
      header: 'Mesa',
      render: (row) => (
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
            style={{ background: 'linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #8b5cf6) 100%)' }}
          >
            {row.number}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Mesa #{row.number}</div>
            <div className="text-xs text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      header: 'Capacidad',
      render: (row) => (
        <div className="flex items-center">
          <span className="text-2xl mr-2">👥</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{row.capacity} personas</div>
            <div className="text-xs text-gray-500">
              {row.capacity === 1 ? 'Individual' : row.capacity <= 4 ? 'Pequeña' : row.capacity <= 8 ? 'Mediana' : 'Grande'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive !== false ? 'Activa' : 'Inactiva'}
        </span>
      )
    }
  ];

  const actions: Array<DataTableRowAction<Table>> = [
    {
      label: 'Editar',
      title: 'Editar mesa',
      onClick: onEdit,
      className: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      label: 'Eliminar',
      title: 'Eliminar mesa',
      onClick: onDelete,
      className: 'text-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  ];

  return (
    <DataTable<Table>
      data={tables}
      columns={columns}
      rowKey={(r) => r.id}
      loading={loading}
      actions={actions}
    />
  );
};

export default TablesManagement; 