/**
 * Componente: Tabla de Businesses (Negocios)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Badge, Spinner, Alert, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getBusinessesAction } from '../../infrastructure/actions/businesses';
import { useBusinessTypes } from '@modules/auth/ui/hooks/use-business-types';
import { BusinessConfiguredResourcesModal } from './business-configured-resources-modal';

interface Business {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  navbar_image_url?: string;
  is_active: boolean;
  business_type_id: number;
  business_type?: string;
  created_at: string;
  updated_at: string;
}

export function BusinessesTable() {
  const router = useRouter();
  const { businessTypes, loading: loadingTypes } = useBusinessTypes();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [businessTypeIdFilter, setBusinessTypeIdFilter] = useState<number | undefined>(undefined);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, [page, perPage, nameFilter, businessTypeIdFilter]);

  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

      const result = await getBusinessesAction({
        token,
        page,
        per_page: perPage,
        name: nameFilter || undefined,
        business_type_id: businessTypeIdFilter,
      });

      if (result.success && result.data) {
        setBusinesses(result.data.businesses);
        setTotal(result.data.pagination.total);
        setTotalPages(result.data.pagination.last_page);
      } else {
        setError(result.error || 'Error al cargar businesses');
      }
    } catch (err) {
      console.error('❌ Error al cargar businesses:', err);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (business: Business) => {
    // Redirigir a la propiedad si es tipo horizontal_property
    if (business.business_type_id === 11) {
      router.push(`/properties/${business.id}`);
    }
  };

  const columns: TableColumn<Business>[] = [
    {
      key: 'logo',
      label: 'Logo',
      render: (_, business) => (
        <div className="flex items-center">
          {business?.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name || 'Business'}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center ${business?.logo_url ? 'hidden' : ''}`}>
            <span className="text-gray-400 text-xs">Sin logo</span>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (_, business) => (
        <div>
          <div className="font-semibold text-gray-900">{business?.name || 'Sin nombre'}</div>
          {business?.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {business.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (_, business) => (
        <div className="text-sm text-gray-600">{business?.address || 'Sin dirección'}</div>
      ),
    },
    {
      key: 'business_type_id',
      label: 'Tipo',
      render: (_, business) => {
        // Mostrar solo el nombre del tipo si está disponible, nunca mostrar el ID
        const businessTypeName = business?.business_type?.trim() || 'Sin tipo';
        return (
          <Badge type={business?.business_type_id === 11 ? 'primary' : 'secondary'}>
            {businessTypeName}
          </Badge>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (_, business) => (
        <Badge type={business?.is_active ? 'success' : 'error'}>
          {business?.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Creado',
      render: (_, business) => (
        <div className="text-sm text-gray-500">
          {business?.created_at ? new Date(business.created_at).toLocaleDateString('es-ES') : 'N/A'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, business) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBusiness({ id: business.id, name: business.name });
              setShowResourcesModal(true);
            }}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Configurar recursos"
          >
            ⚙️ Recursos
          </button>
        </div>
      ),
    },
  ];

  if (loading && businesses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="xl" text="Cargando businesses..." />
      </div>
    );
  }

  if (error && businesses.length === 0) {
    return (
      <Alert type="error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tipo de Business
            </label>
            <select
              value={businessTypeIdFilter || ''}
              onChange={(e) => setBusinessTypeIdFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={loadingTypes}
            >
              <option value="">Todos los tipos</option>
              {businessTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setNameFilter('');
                setBusinessTypeIdFilter(undefined);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table
          data={businesses}
          columns={columns}
          onRowClick={handleRowClick}
          loading={loading}
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: perPage,
            onPageChange: setPage,
            onItemsPerPageChange: (newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            },
            showItemsPerPageSelector: true,
            itemsPerPageOptions: [10, 20, 50, 100],
          }}
        />
      </div>

      {/* Modal de Configuración de Recursos */}
      {selectedBusiness && (
        <BusinessConfiguredResourcesModal
          isOpen={showResourcesModal}
          onClose={() => {
            setShowResourcesModal(false);
            setSelectedBusiness(null);
          }}
          businessId={selectedBusiness.id}
          businessName={selectedBusiness.name}
        />
      )}
    </div>
  );
}

