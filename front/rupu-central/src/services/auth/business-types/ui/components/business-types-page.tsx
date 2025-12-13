'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { TokenStorage } from '@shared/config';
import { BusinessTypesTable } from './business-types-table';
import { useBusinessTypes } from '../hooks/use-business-types';
import { FilterOption, ActiveFilter } from '@shared/ui/dynamic-filters';

export default function BusinessTypesPage() {
  const {
    businessTypes,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    filters,
    loadBusinessTypes,
    setPage,
    setPageSize,
    setFilters,
    refresh
  } = useBusinessTypes({
    initialPage: 1,
    pageSize: 10,
    autoLoad: false
  });

  const [token, setToken] = useState<string | null>(null);

  // Cargar token y datos
  useEffect(() => {
    const authToken = TokenStorage.getBusinessToken();
    setToken(authToken);
    
    if (authToken) {
      loadBusinessTypes(authToken);
    }
  }, [loadBusinessTypes]);

  // Convertir filtros a ActiveFilter[]
  const activeFilters: ActiveFilter[] = [];
  if (filters.name) {
    activeFilters.push({
      key: 'name',
      label: 'Nombre',
      value: filters.name,
      type: 'text',
    });
  }
  if (filters.code) {
    activeFilters.push({
      key: 'code',
      label: 'Código',
      value: filters.code,
      type: 'text',
    });
  }
  if (filters.is_active !== undefined) {
    activeFilters.push({
      key: 'is_active',
      label: 'Estado',
      value: filters.is_active,
      type: 'boolean',
    });
  }

  // Definir filtros disponibles
  const availableFilters: FilterOption[] = [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre o código',
    },
    {
      key: 'is_active',
      label: 'Estado',
      type: 'boolean',
    },
  ];

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'is_active') {
      newFilters.is_active = value === true;
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'is_active') {
      delete newFilters.is_active;
    } else {
      delete (newFilters as any)[filterKey];
    }
    
    setFilters(newFilters);
  };

  if (!token) {
    return (
      <div className="p-8 w-full">
        <div className="card">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Token de autenticación requerido
            </h3>
            <p className="text-gray-600">
              Por favor, inicia sesión para acceder a la gestión de tipos de negocio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Tipos de Negocio
          </h1>
          <p className="mt-2 text-gray-600">
            Administra los tipos de negocio disponibles en el sistema.
          </p>
        </div>

        {/* Business Types Table con filtros y paginación */}
        <BusinessTypesTable 
          businessTypes={businessTypes} 
          loading={loading}
          onRefresh={refresh}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          filters={{
            availableFilters,
            activeFilters,
            onAddFilter: handleAddFilter,
            onRemoveFilter: handleRemoveFilter,
          }}
        />

        {/* Error general */}
        {error && (
          <div className="mt-6 alert alert-error">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <div>
              <h4 className="font-semibold">Error al cargar tipos de negocio</h4>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
