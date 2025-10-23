/**
 * Componente Table genérico reutilizable
 * Usa clases globales y colores dinámicos del negocio
 */

'use client';

import React, { ReactNode } from 'react';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
}

export function Table<T = Record<string, unknown>>({ 
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
    <div className="card overflow-hidden p-0 w-full">
      <div className="overflow-x-auto w-full">
        <table className="table w-full">
          {/* Header */}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={alignClass[column.align || 'left']}
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
                  className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={alignClass[column.align || 'left']}
                    >
                      {column.render 
                        ? column.render(row[column.key as keyof T], row, rowIndex)
                        : (() => {
                            const value = row[column.key as keyof T];
                            // Si es un elemento React (JSX), lo renderizamos directamente
                            if (React.isValidElement(value)) {
                              return value;
                            }
                            // Si es null/undefined, mostramos string vacío
                            if (value == null) {
                              return '';
                            }
                            // Para otros valores, los convertimos a string
                            return String(value);
                          })()}
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

