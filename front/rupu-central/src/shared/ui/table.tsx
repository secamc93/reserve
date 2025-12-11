/**
 * Componente Table genérico reutilizable
 * Usa clases globales y colores dinámicos del negocio
 */

'use client';

import React, { ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { DynamicFilters, FilterOption, ActiveFilter } from './dynamic-filters';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPageSelector?: boolean;
  itemsPerPageOptions?: number[];
}

export interface TableFiltersProps {
  availableFilters: FilterOption[];
  activeFilters: ActiveFilter[];
  onAddFilter: (filterKey: string, value: any) => void;
  onRemoveFilter: (filterKey: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  sortOptions?: Array<{ value: string; label: string }>;
  headerActions?: React.ReactNode;
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  pagination?: PaginationProps;
  filters?: TableFiltersProps;
}

export function Table<T = Record<string, unknown>>({ 
  columns, 
  data, 
  keyExtractor = (_, i) => i,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
  onRowClick,
  pagination,
  filters,
}: TableProps<T>) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      onPageChange,
      onItemsPerPageChange,
      showItemsPerPageSelector = true,
      itemsPerPageOptions = [10, 20, 50, 100],
    } = pagination;

    // Solo mostrar paginación si hay más de una página o hay items
    if (totalPages <= 1 && totalItems === 0) return null;

    // Calcular rango de páginas a mostrar
    const getPageNumbers = () => {
      const delta = 2; // Número de páginas a mostrar a cada lado de la actual
      const range = [];
      const rangeWithDots = [];

      // Calcular el rango
      let start = Math.max(1, currentPage - delta);
      let end = Math.min(totalPages, currentPage + delta);

      // Ajustar si estamos cerca del inicio
      if (currentPage - delta <= 1) {
        end = Math.min(totalPages, start + delta * 2);
      }

      // Ajustar si estamos cerca del final
      if (currentPage + delta >= totalPages) {
        start = Math.max(1, end - delta * 2);
      }

      // Generar números de página
      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      // Agregar puntos suspensivos si es necesario
      if (start > 1) {
        rangeWithDots.push(1);
        if (start > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(...range);
      if (end < totalPages) {
        if (end < totalPages - 1) {
          rangeWithDots.push('...');
        }
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Información izquierda */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {showItemsPerPageSelector && onItemsPerPageChange && (
              <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    onItemsPerPageChange(parseInt(e.target.value));
                    onPageChange(1);
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  disabled={loading}
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-gray-500">
              {totalItems > 0 
                ? `Mostrando ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)} de ${totalItems}`
                : 'Sin resultados'
              }
            </span>
          </div>

          {/* Navegación derecha con números de página */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center justify-center w-9 h-9 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105"
              style={{
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
              }}
              type="button"
              aria-label="Página anterior"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="px-2 py-1 text-sm text-gray-500"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    className={`inline-flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105`}
                    style={
                      isActive
                        ? {
                            color: '#ffffff',
                            backgroundColor: 'var(--color-primary, #0f172a)',
                            borderColor: 'var(--color-primary, #0f172a)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          }
                        : {
                            color: 'var(--color-primary, #0f172a)',
                            backgroundColor: 'transparent',
                            borderColor: 'var(--color-primary, #0f172a)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled && !isActive) {
                        e.currentTarget.style.borderColor = 'var(--color-primary, #0f172a)';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.borderColor = 'var(--color-primary, #0f172a)';
                      }
                    }}
                    type="button"
                    aria-label={`Ir a página ${pageNum}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center justify-center w-9 h-9 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105"
              style={{
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
              }}
              type="button"
              aria-label="Página siguiente"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Filtros dinámicos */}
      {filters && (
        <div className="mb-0">
          <DynamicFilters
            availableFilters={filters.availableFilters}
            activeFilters={filters.activeFilters}
            onAddFilter={filters.onAddFilter}
            onRemoveFilter={filters.onRemoveFilter}
            sortBy={filters.sortBy || 'created_at'}
            sortOrder={filters.sortOrder || 'desc'}
            onSortChange={filters.onSortChange}
            sortOptions={filters.sortOptions || [
              { value: 'created_at', label: 'Ordenar por fecha' },
              { value: 'updated_at', label: 'Ordenar por actualización' },
              { value: 'total_amount', label: 'Ordenar por monto' },
            ]}
            headerActions={filters.headerActions}
          />
        </div>
      )}

      {/* Tabla */}
      <div 
        className={`overflow-hidden p-0 w-full ${filters ? 'rounded-t-none rounded-b-lg border-l border-r border-b border-gray-200 bg-white' : 'rounded-lg border border-gray-200 bg-white'}`}
        style={filters ? {} : {}}
      >
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
        {/* Paginación integrada */}
        {renderPagination()}
      </div>
    </div>
  );
}

// Re-exportar tipos de filtros para facilitar el uso
export type { FilterOption, ActiveFilter } from './dynamic-filters';

