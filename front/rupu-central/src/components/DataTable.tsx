'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  X,
  Slash,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface DataTableRow {
  id: string;
  nombre: string;
  email: string;
  estado: 'Activo' | 'Pendiente' | 'Inactivo';
}

export interface FilterChip {
  id: string;
  label: string;
  color: 'blue' | 'green' | 'orange';
}

export interface DataTableProps {
  data: DataTableRow[];
  filters?: FilterChip[];
  onAdd?: () => void;
  onEdit?: (row: DataTableRow) => void;
  onDelete?: (row: DataTableRow) => void;
  onFilterRemove?: (filterId: string) => void;
  onClearAllFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const DataTable: React.FC<DataTableProps> = ({
  data,
  filters = [],
  onAdd,
  onEdit,
  onDelete,
  onFilterRemove,
  onClearAllFilters,
  currentPage = 1,
  totalPages = 10,
  onPageChange
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Colores para chips de filtro
  const chipColors = {
    blue: {
      bg: 'bg-[#E3F2FD]',
      text: 'text-[#1565C0]',
      closeBg: 'bg-[#1976D2]'
    },
    green: {
      bg: 'bg-[#E8F5E9]',
      text: 'text-[#2E7D32]',
      closeBg: 'bg-[#4CAF50]'
    },
    orange: {
      bg: 'bg-[#FFF3E0]',
      text: 'text-[#E65100]',
      closeBg: 'bg-[#FF9800]'
    }
  };

  // Colores para badges de estado
  const statusColors = {
    Activo: 'bg-[#81C784]',
    Pendiente: 'bg-[#FFB74D]',
    Inactivo: 'bg-[#E57373]'
  };

  return (
    <div className="w-full max-w-[1000px] bg-white rounded-xl border border-[#90CAF9]">
      {/* ============== HEADER ============== */}
      <div className="bg-[#1E88E5] rounded-t-xl px-6 py-4 flex items-center justify-between gap-4">
        {/* Filtros */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-white text-sm font-semibold font-['Geist']">
            Filtros:
          </span>

          {/* Dropdown de filtros */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="w-[180px] h-10 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] px-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="text-[#757575] text-sm font-['Geist']">
                Seleccionar filtro
              </span>
              <ChevronDown className="w-4 h-4 text-[#757575]" />
            </button>
          </div>

          {/* Chips de filtros aplicados */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.map((filter) => {
                const colors = chipColors[filter.color];
                return (
                  <div
                    key={filter.id}
                    className={`${colors.bg} h-8 rounded-full px-3 flex items-center gap-2`}
                  >
                    <span className={`${colors.text} text-[13px] font-medium font-['Geist']`}>
                      {filter.label}
                    </span>
                    <button
                      onClick={() => onFilterRemove?.(filter.id)}
                      className={`${colors.closeBg} w-[18px] h-[18px] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Botón limpiar todo */}
          {filters.length > 0 && (
            <button
              onClick={onClearAllFilters}
              className="h-8 px-3 rounded-md flex items-center gap-1.5 hover:bg-white/10 transition-colors"
            >
              <Slash className="w-4 h-4 text-[#E57373]" />
              <span className="text-[#E57373] text-[13px] font-medium font-['Geist']">
                Limpiar todo
              </span>
            </button>
          )}
        </div>

        {/* Botón Agregar */}
        <button
          onClick={onAdd}
          className="w-[120px] h-9 bg-[#42A5F5] rounded-lg px-4 flex items-center justify-center gap-1.5 hover:bg-[#1E88E5] transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium font-['Geist']">
            Agregar
          </span>
        </button>
      </div>

      {/* ============== TABLA ============== */}
      <div className="bg-white">
        {/* Header de la tabla */}
        <div className="bg-[#64B5F6] h-12 px-6 flex items-center">
          <div className="flex-1 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">ID</span>
          </div>
          <div className="flex-1 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Nombre</span>
          </div>
          <div className="flex-1 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Email</span>
          </div>
          <div className="flex-1 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Estado</span>
          </div>
          <div className="flex-1 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Acciones</span>
          </div>
        </div>

        {/* Filas de datos */}
        {data.map((row, index) => (
          <div
            key={row.id}
            className={`h-14 px-6 flex items-center ${
              index % 2 === 0 ? 'bg-[#E3F2FD]' : 'bg-white'
            }`}
          >
            {/* ID */}
            <div className="flex-1 flex items-center">
              <span className="text-[#0D47A1] text-sm font-['Geist']">
                {row.id}
              </span>
            </div>

            {/* Nombre */}
            <div className="flex-1 flex items-center">
              <span className="text-[#1565C0] text-sm font-['Geist']">
                {row.nombre}
              </span>
            </div>

            {/* Email */}
            <div className="flex-1 flex items-center">
              <span className="text-[#1976D2] text-sm font-['Geist']">
                {row.email}
              </span>
            </div>

            {/* Estado */}
            <div className="flex-1 flex items-center">
              <div
                className={`${statusColors[row.estado]} w-20 h-7 rounded-full flex items-center justify-center`}
              >
                <span className="text-white text-xs font-medium font-['Geist']">
                  {row.estado}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex-1 flex items-center gap-2">
              <button
                onClick={() => onEdit?.(row)}
                className="w-8 h-8 bg-[#E3F2FD] rounded-full flex items-center justify-center hover:bg-[#BBDEFB] transition-colors"
              >
                <Pencil className="w-4 h-4 text-[#42A5F5]" />
              </button>
              <button
                onClick={() => onDelete?.(row)}
                className="w-8 h-8 bg-[#FFEBEE] rounded-full flex items-center justify-center hover:bg-[#FFCDD2] transition-colors"
              >
                <Trash2 className="w-4 h-4 text-[#E57373]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============== FOOTER / PAGINACIÓN ============== */}
      <div className="bg-[#F5F5F5] h-16 px-6 rounded-b-xl border-t border-[#E0E0E0] flex items-center justify-between">
        {/* Texto de resultados */}
        <div className="text-[#757575] text-sm font-['Geist']">
          Mostrando {data.length} resultados
        </div>

        {/* Paginación */}
        <div className="flex items-center gap-2">
          {/* Botón anterior */}
          <button
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 bg-white rounded border border-[#E0E0E0] flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-[#757575]" />
          </button>

          {/* Números de página */}
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium font-['Geist'] transition-colors ${
                currentPage === page
                  ? 'bg-[#42A5F5] text-white'
                  : 'bg-white border border-[#E0E0E0] text-[#757575] hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Dots */}
          <div className="px-2 text-[#757575]">...</div>

          {/* Última página */}
          <button
            onClick={() => onPageChange?.(totalPages)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium font-['Geist'] transition-colors ${
              currentPage === totalPages
                ? 'bg-[#42A5F5] text-white'
                : 'bg-white border border-[#E0E0E0] text-[#757575] hover:bg-gray-50'
            }`}
          >
            {totalPages}
          </button>

          {/* Botón siguiente */}
          <button
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 bg-white rounded border border-[#E0E0E0] flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-[#757575]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
