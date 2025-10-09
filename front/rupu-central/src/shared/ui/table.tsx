/**
 * Componente Table genérico reutilizable
 * Usa clases globales y colores dinámicos del negocio
 */

'use client';

import { ReactNode } from 'react';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
}

export function Table<T = any>({ 
  columns, 
  data, 
  keyExtractor = (_, i) => i,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
  onRowClick,
}: TableProps<T>) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'white' 
            }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-sm font-semibold ${alignClass[column.align || 'left']}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-3">
                    <div className="spinner"></div>
                    <span>Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-700 ${alignClass[column.align || 'left']}`}
                    >
                      {column.render 
                        ? column.render(row[column.key as keyof T], row, rowIndex)
                        : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

