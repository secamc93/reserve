'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  X,
  Slash,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Filter
} from 'lucide-react';
import { PropertyUnit, UNIT_TYPE_LABELS } from '../domain';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface PropertyUnitFilter {
  id: string;
  key: string;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'orange';
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface PropertyUnitsDataTableProps {
  data: PropertyUnit[];
  filters?: PropertyUnitFilter[];
  availableFilters?: FilterOption[];
  onAdd?: () => void;
  onImport?: () => void;
  onEdit?: (unit: PropertyUnit) => void;
  onDelete?: (unit: PropertyUnit) => void;
  onFilterRemove?: (filterId: string) => void;
  onClearAllFilters?: () => void;
  onAddFilter?: (filterKey: string, value: any) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PropertyUnitsDataTable: React.FC<PropertyUnitsDataTableProps> = ({
  data,
  filters = [],
  availableFilters = [],
  onAdd,
  onImport,
  onEdit,
  onDelete,
  onFilterRemove,
  onClearAllFilters,
  onAddFilter,
  currentPage = 1,
  totalPages = 10,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  loading = false
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilterKey, setSelectedFilterKey] = useState<string>('');
  const [filterValue, setFilterValue] = useState<any>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
        setSelectedFilterKey('');
        setFilterValue('');
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Filtros disponibles que no están aplicados
  const unusedFilters = availableFilters.filter(
    (availableFilter) => !filters.some((f) => f.key === availableFilter.key)
  );

  const handleFilterSelect = (filterKey: string) => {
    setSelectedFilterKey(filterKey);
    setFilterValue('');
  };

  const handleApplyFilter = () => {
    if (selectedFilterKey && filterValue !== '') {
      onAddFilter?.(selectedFilterKey, filterValue);
      setIsFilterDropdownOpen(false);
      setSelectedFilterKey('');
      setFilterValue('');
    }
  };

  const selectedFilter = availableFilters.find((f) => f.key === selectedFilterKey);

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

  // Renderizar páginas para paginación
  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange?.(i)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium font-['Geist'] transition-colors ${
              currentPage === i
                ? 'bg-[#42A5F5] text-white'
                : 'bg-white border border-[#E0E0E0] text-[#757575] hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange?.(1)}
          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium font-['Geist'] transition-colors ${
            currentPage === 1
              ? 'bg-[#42A5F5] text-white'
              : 'bg-white border border-[#E0E0E0] text-[#757575] hover:bg-gray-50'
          }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(
          <div key="dots1" className="px-2 text-[#757575]">
            ...
          </div>
        );
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange?.(i)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium font-['Geist'] transition-colors ${
              currentPage === i
                ? 'bg-[#42A5F5] text-white'
                : 'bg-white border border-[#E0E0E0] text-[#757575] hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <div key="dots2" className="px-2 text-[#757575]">
            ...
          </div>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange?.(totalPages)}
          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium font-['Geist'] transition-colors ${
            currentPage === totalPages
              ? 'bg-[#42A5F5] text-white'
              : 'bg-white border border-[#E0E0E0] text-[#757575] hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#90CAF9] p-8 flex items-center justify-center">
        <div className="text-[#757575] text-sm font-['Geist']">Cargando unidades...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-[#90CAF9]">
      {/* ============== HEADER ============== */}
      <div className="bg-[#1E88E5] rounded-t-xl px-6 py-4 flex items-center justify-between gap-4">
        {/* Filtros */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-white text-sm font-semibold font-['Geist']">
            Filtros:
          </span>

          {/* Dropdown de filtros */}
          {unusedFilters.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="w-[180px] h-10 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] px-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="text-[#757575] text-sm font-['Geist']">
                  Agregar filtro
                </span>
                <ChevronDown className="w-4 h-4 text-[#757575]" />
              </button>

              {/* Dropdown menu */}
              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#E0E0E0] z-50">
                  {!selectedFilterKey ? (
                    /* Lista de filtros disponibles */
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {unusedFilters.map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => handleFilterSelect(filter.key)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-[#E3F2FD] transition-colors flex items-center gap-2"
                        >
                          <Filter className="w-4 h-4 text-[#42A5F5]" />
                          <span className="text-sm font-['Geist'] text-[#1565C0]">
                            {filter.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Formulario para ingresar valor del filtro */
                    <div className="p-4">
                      <div className="mb-3">
                        <label className="text-sm font-semibold font-['Geist'] text-[#1565C0] mb-2 block">
                          {selectedFilter?.label}
                        </label>

                        {selectedFilter?.type === 'text' && (
                          <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder={selectedFilter.placeholder}
                            className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#42A5F5] font-['Geist'] text-sm"
                            autoFocus
                          />
                        )}

                        {selectedFilter?.type === 'select' && (
                          <select
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#42A5F5] font-['Geist'] text-sm"
                            autoFocus
                          >
                            <option value="">Seleccionar...</option>
                            {selectedFilter.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {selectedFilter?.type === 'boolean' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFilterValue(true)}
                              className={`flex-1 px-3 py-2 rounded-lg font-['Geist'] text-sm transition-colors ${
                                filterValue === true
                                  ? 'bg-[#81C784] text-white'
                                  : 'bg-[#F5F5F5] text-[#757575] hover:bg-[#E8F5E9]'
                              }`}
                            >
                              Activa
                            </button>
                            <button
                              onClick={() => setFilterValue(false)}
                              className={`flex-1 px-3 py-2 rounded-lg font-['Geist'] text-sm transition-colors ${
                                filterValue === false
                                  ? 'bg-[#E57373] text-white'
                                  : 'bg-[#F5F5F5] text-[#757575] hover:bg-[#FFEBEE]'
                              }`}
                            >
                              Inactiva
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedFilterKey('');
                            setFilterValue('');
                          }}
                          className="flex-1 px-3 py-2 bg-[#F5F5F5] text-[#757575] rounded-lg hover:bg-[#E0E0E0] transition-colors font-['Geist'] text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleApplyFilter}
                          disabled={filterValue === ''}
                          className="flex-1 px-3 py-2 bg-[#42A5F5] text-white rounded-lg hover:bg-[#1E88E5] transition-colors font-['Geist'] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Chips de filtros aplicados */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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
                      onClick={() => onFilterRemove?.(filter.key)}
                      className={`${colors.closeBg} w-[18px] h-[18px] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                );
              })}

              {/* Botón limpiar todo */}
              <button
                onClick={onClearAllFilters}
                className="h-8 px-3 rounded-md flex items-center gap-1.5 hover:bg-white/10 transition-colors"
              >
                <Slash className="w-4 h-4 text-[#E57373]" />
                <span className="text-[#E57373] text-[13px] font-medium font-['Geist']">
                  Limpiar todo
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {onImport && (
            <button
              onClick={onImport}
              className="h-9 bg-[#42A5F5] rounded-lg px-4 flex items-center gap-1.5 hover:bg-[#1E88E5] transition-colors"
            >
              <Upload className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium font-['Geist']">
                Importar
              </span>
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="h-9 bg-[#42A5F5] rounded-lg px-4 flex items-center gap-1.5 hover:bg-[#1E88E5] transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium font-['Geist']">
                Agregar
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ============== TABLA ============== */}
      <div className="bg-white">
        {/* Header de la tabla */}
        <div className="bg-[#64B5F6] h-12 px-6 flex items-center">
          <div className="w-24 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Número</span>
          </div>
          <div className="w-32 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Tipo</span>
          </div>
          <div className="w-20 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Piso</span>
          </div>
          <div className="w-24 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Bloque</span>
          </div>
          <div className="w-28 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Área (m²)</span>
          </div>
          <div className="w-28 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Habitaciones</span>
          </div>
          <div className="w-32 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Coeficiente</span>
          </div>
          <div className="w-24 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Estado</span>
          </div>
          <div className="w-28 flex items-center">
            <span className="text-white text-sm font-semibold font-['Geist']">Acciones</span>
          </div>
        </div>

        {/* Filas de datos */}
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <span className="text-[#757575] text-sm font-['Geist']">
              No hay unidades disponibles
            </span>
          </div>
        ) : (
          data.map((unit, index) => (
            <div
              key={unit.id}
              className={`h-14 px-6 flex items-center ${
                index % 2 === 0 ? 'bg-[#E3F2FD]' : 'bg-white'
              }`}
            >
              {/* Número */}
              <div className="w-24 flex items-center">
                <span className="text-[#0D47A1] text-sm font-['Geist']">
                  {unit.number}
                </span>
              </div>

              {/* Tipo */}
              <div className="w-32 flex items-center">
                <span className="text-[#1565C0] text-sm font-['Geist']">
                  {UNIT_TYPE_LABELS[unit.unitType] || unit.unitType}
                </span>
              </div>

              {/* Piso */}
              <div className="w-20 flex items-center">
                <span className="text-[#1976D2] text-sm font-['Geist']">
                  {unit.floor ?? '-'}
                </span>
              </div>

              {/* Bloque */}
              <div className="w-24 flex items-center">
                <span className="text-[#1976D2] text-sm font-['Geist']">
                  {unit.block || '-'}
                </span>
              </div>

              {/* Área */}
              <div className="w-28 flex items-center">
                <span className="text-[#1976D2] text-sm font-['Geist']">
                  {unit.area ? `${unit.area} m²` : '-'}
                </span>
              </div>

              {/* Habitaciones */}
              <div className="w-28 flex items-center">
                <span className="text-[#1976D2] text-sm font-['Geist']">
                  {unit.bedrooms ?? '-'}
                </span>
              </div>

              {/* Coeficiente */}
              <div className="w-32 flex items-center">
                <span className="text-[#1976D2] text-sm font-['Geist']">
                  {unit.coefficient ? unit.coefficient.toFixed(6) : '-'}
                </span>
              </div>

              {/* Estado */}
              <div className="w-24 flex items-center">
                <div
                  className={`${
                    unit.isActive ? 'bg-[#81C784]' : 'bg-[#E57373]'
                  } px-3 h-7 rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-xs font-medium font-['Geist']">
                    {unit.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="w-28 flex items-center gap-2">
                <button
                  onClick={() => onEdit?.(unit)}
                  className="w-8 h-8 bg-[#E3F2FD] rounded-full flex items-center justify-center hover:bg-[#BBDEFB] transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4 text-[#42A5F5]" />
                </button>
                <button
                  onClick={() => onDelete?.(unit)}
                  className="w-8 h-8 bg-[#FFEBEE] rounded-full flex items-center justify-center hover:bg-[#FFCDD2] transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-[#E57373]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============== FOOTER / PAGINACIÓN ============== */}
      <div className="bg-[#F5F5F5] h-16 px-6 rounded-b-xl border-t border-[#E0E0E0] flex items-center justify-between">
        {/* Texto de resultados */}
        <div className="text-[#757575] text-sm font-['Geist']">
          Mostrando {data.length} de {totalItems} unidades
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
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
            {renderPageNumbers()}

            {/* Botón siguiente */}
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 bg-white rounded border border-[#E0E0E0] flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-[#757575]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyUnitsDataTable;
