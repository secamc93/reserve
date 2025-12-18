'use client';

import { useState, useMemo } from 'react';
import { useBusinesses } from '../hooks';
import { Table, TableColumn, PaginationProps, TableFiltersProps, FilterOption, ActiveFilter } from '@shared/ui/table';
import { Badge, Button } from '@shared/ui';
import { BuildingOfficeIcon, EyeIcon } from '@heroicons/react/24/outline';
import { TokenStorage } from '@shared/config';
import { useBusinessTypes } from '../../../business-types/ui/hooks';

interface BusinessesTableProps {
  token?: string;
}

interface Business {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  business_type_id: number;
  business_type?: string;
  created_at: string;
  updated_at: string;
}

interface Filters {
  name?: string;
  business_type_id?: number;
}

export function BusinessesTable({ token }: BusinessesTableProps) {
  const businessToken = token || TokenStorage.getBusinessToken() || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Filters>({});

  const { businessTypes } = useBusinessTypes();
  const { businesses, loading, error, total, totalPages, refetch } = useBusinesses({
    token: businessToken,
    page: currentPage,
    pageSize,
    name: filters.name || undefined,
    businessTypeId: filters.business_type_id,
  });

  // Convertir businessTypes a opciones de filtro
  const businessTypeOptions = useMemo(() => {
    return businessTypes?.map(bt => ({
      value: bt.id.toString(),
      label: `${bt.icon || ''} ${bt.name}`.trim(),
    })) || [];
  }, [businessTypes]);

  // Definir filtros disponibles
  const availableFilters: FilterOption[] = useMemo(() => [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre',
    },
    {
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      type: 'select',
      options: businessTypeOptions,
    },
  ], [businessTypeOptions]);

  // Convertir filtros activos a ActiveFilter[]
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const active: ActiveFilter[] = [];
    if (filters.name) {
      active.push({
        key: 'name',
        label: 'Nombre',
        value: filters.name,
        type: 'text',
      });
    }
    if (filters.business_type_id) {
      active.push({
        key: 'business_type_id',
        label: 'Tipo de Negocio',
        value: filters.business_type_id.toString(),
        type: 'select',
      });
    }
    return active;
  }, [filters]);

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'business_type_id') {
      newFilters.business_type_id = parseInt(value);
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página al agregar filtro
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    delete (newFilters as any)[filterKey];
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página al remover filtro
  };

  const columns: TableColumn<Business>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (value, business) => {
        if (!business) return null;
        return (
          <div className="flex items-center space-x-3">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{business.name || 'N/A'}</div>
              {business.description && (
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {business.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'business_type',
      label: 'Tipo de Negocio',
      render: (value, business) => {
        if (!business) return null;
        const businessType = businessTypes?.find(bt => bt.id === business.business_type_id);
        return (
          <div className="flex items-center space-x-2">
            {businessType?.icon && <span>{businessType.icon}</span>}
            <span className="text-gray-700">
              {business.business_type || businessType?.name || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (value, business) => {
        if (!business) return null;
        return (
          <div className="text-gray-700 max-w-xs truncate" title={business.address || ''}>
            {business.address || 'N/A'}
          </div>
        );
      },
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (value, business) => {
        if (!business) return null;
        return (
          <div className="space-y-1">
            {business.email && (
              <div className="text-sm text-gray-600">{business.email}</div>
            )}
            {business.phone && (
              <div className="text-sm text-gray-600">{business.phone}</div>
            )}
            {!business.email && !business.phone && (
              <div className="text-sm text-gray-400">N/A</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (value, business) => {
        if (!business) return null;
        return (
          <Badge
            type={business.is_active ? 'success' : 'error'}
          >
            {business.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value, business) => {
        if (!business) return null;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implementar vista de detalle
                console.log('Ver detalles de negocio:', business.id);
              }}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Ver
            </Button>
          </div>
        );
      },
    },
  ];

  const pagination: PaginationProps = {
    currentPage,
    totalPages,
    totalItems: total,
    itemsPerPage: pageSize,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: setPageSize,
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  };

  const tableFilters: TableFiltersProps = {
    availableFilters,
    activeFilters,
    onAddFilter: handleAddFilter,
    onRemoveFilter: handleRemoveFilter,
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      data={businesses.filter(b => b != null)} // Filtrar elementos undefined/null
      loading={loading}
      pagination={pagination}
      filters={tableFilters}
      emptyMessage="No hay negocios disponibles"
      keyExtractor={(business) => business?.id?.toString() || Math.random().toString()}
    />
  );
}


