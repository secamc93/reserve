/**
 * Componente Table genérico reutilizable
 * Usa clases globales y colores dinámicos del negocio.
 *
 * Teléfono (< md): la tabla conserva sus columnas y se desplaza horizontalmente DENTRO de su
 * tarjeta (`overflow-x-auto`), nunca la página; las celdas se compactan (globals.css). Se eligió
 * sobre la vista apilada por fila porque las columnas con `render` (acciones, badges) siguen
 * funcionando igual y no cambia el DOM que usan las pruebas.
 */

'use client';

import React, { ReactNode } from 'react';
import { DynamicFilters, FilterOption, ActiveFilter } from './dynamic-filters';
import { RupuLoader } from './rupu-loader';
import { Pagination, PaginationControls } from './pagination';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Paginación con estado en la URL (`?page=&page_size=`): la tabla solo informa el total;
 * page/page_size se leen con `usePaginationParams()` y se envían al back.
 */
export interface TableUrlPagination {
  total: number;
  totalPages?: number;
  pageSizeOptions?: readonly number[];
}

/** Paginación controlada por callbacks (contextos sin URL propia, p. ej. modales). */
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
  pagination?: PaginationProps | TableUrlPagination;
  filters?: TableFiltersProps;
}

function isLegacyPagination(p: PaginationProps | TableUrlPagination): p is PaginationProps {
  return 'onPageChange' in p;
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

    if (isLegacyPagination(pagination)) {
      const {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        onPageChange,
        onItemsPerPageChange,
        showItemsPerPageSelector = true,
        itemsPerPageOptions,
      } = pagination;
      return (
        <PaginationControls
          page={currentPage}
          pageSize={itemsPerPage}
          total={totalItems}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={
            showItemsPerPageSelector && onItemsPerPageChange
              ? (size) => {
                  onItemsPerPageChange(size);
                  onPageChange(1);
                }
              : undefined
          }
          pageSizeOptions={itemsPerPageOptions}
          disabled={loading}
        />
      );
    }

    return (
      <Pagination
        total={pagination.total}
        totalPages={pagination.totalPages}
        disabled={loading}
        pageSizeOptions={pagination.pageSizeOptions}
      />
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
        <div className="overflow-x-auto overscroll-x-contain w-full max-w-full">
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
                    <RupuLoader size={64} />
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

