'use client';

import { useState } from 'react';
import { useBusinesses } from '../hooks';
import { Table, TableColumn, PaginationProps } from '@shared/ui/table';
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

export function BusinessesTable({ token }: BusinessesTableProps) {
  const businessToken = token || TokenStorage.getBusinessToken() || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<number | undefined>(undefined);

  const { businessTypes } = useBusinessTypes();
  const { businesses, loading, error, total, totalPages, refetch } = useBusinesses({
    token: businessToken,
    page: currentPage,
    pageSize,
    name: nameFilter || undefined,
    businessTypeId: businessTypeFilter,
  });

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
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Nombre del negocio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Negocio
            </label>
            <select
              value={businessTypeFilter || ''}
              onChange={(e) => {
                setBusinessTypeFilter(e.target.value ? parseInt(e.target.value) : undefined);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {businessTypes?.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.icon} {bt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setNameFilter('');
                setBusinessTypeFilter(undefined);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={businesses.filter(b => b != null)} // Filtrar elementos undefined/null
        loading={loading}
        pagination={pagination}
        emptyMessage="No hay negocios disponibles"
        keyExtractor={(business) => business?.id?.toString() || Math.random().toString()}
      />
    </div>
  );
}
