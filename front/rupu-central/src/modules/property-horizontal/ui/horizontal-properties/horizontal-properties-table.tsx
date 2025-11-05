/**
 * Componente: Tabla de Propiedades Horizontales
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Badge, Spinner, Alert, ConfirmModal, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getHorizontalPropertiesAction, deleteHorizontalPropertyAction } from '../../infrastructure/actions';
import { businessTokenAction } from '@modules/auth/infrastructure/actions';
import { CreatePropertyModal } from './create-property-modal';

interface HorizontalProperty {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  isActive: boolean;
  logoUrl?: string;
  createdAt: string;
}

export function HorizontalPropertiesTable() {
  const router = useRouter();
  const [properties, setProperties] = useState<HorizontalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, [page]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      let token = TokenStorage.getBusinessToken();
      if (!token) {
        // Intento automático para super admin: obtener business token con business_id = 0 usando el token principal
        const sessionToken = TokenStorage.getMainToken();
        if (sessionToken) {
          try {
            const bt = await businessTokenAction({ business_id: 0 }, sessionToken);
            if (bt.success && bt.data?.token) {
              TokenStorage.setToken(bt.data.token);
              token = bt.data.token;
            }
          } catch (_) {}
        }

        if (!token) {
          console.error('❌ No hay business token disponible. Debe seleccionar un negocio primero.');
          setLoading(false);
          return;
        }
      }

      const result = await getHorizontalPropertiesAction({
        token,
        page,
        pageSize,
      });

      if (result.success && result.data) {
        setProperties(result.data.data);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar propiedades:', error);
    }
    setLoading(false);
  };

  const handleDeleteClick = (property: HorizontalProperty) => {
    setPropertyToDelete({ id: property.id, name: property.name });
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    let token = TokenStorage.getBusinessToken();
    if (!token) {
      const sessionToken = TokenStorage.getMainToken();
      if (sessionToken) {
        try {
          const bt = await businessTokenAction({ business_id: 0 }, sessionToken);
          if (bt.success && bt.data?.token) {
            TokenStorage.setToken(bt.data.token);
            token = bt.data.token;
          }
        } catch (_) {}
      }
      if (!token) {
        setDeleteError('No se encontró el business token. Debe seleccionar un negocio primero.');
        return;
      }
    }

    setLoading(true);
    setShowDeleteConfirm(false);

    try {
      const result = await deleteHorizontalPropertyAction({
        token,
        id: propertyToDelete.id,
      });

      if (result.success) {
        setDeleteSuccess(`Propiedad "${propertyToDelete.name}" eliminada correctamente`);
        setPropertyToDelete(null);
        // Recargar la lista
        await loadProperties();
      } else {
        setDeleteError(result.message || 'Error al eliminar la propiedad');
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Error al eliminar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<HorizontalProperty>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      width: '80px', 
      align: 'center' 
    },
    {
      key: 'logo',
      label: 'Logo',
      width: '80px',
      align: 'center',
      render: (value, row) => (
        <div className="flex justify-center">
          {row.logoUrl ? (
            <img 
              src={row.logoUrl} 
              alt={`Logo de ${row.name}`}
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium ${row.logoUrl ? 'hidden' : ''}`}>
            {row.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )
    },
    { 
      key: 'name', 
      label: 'Nombre', 
      width: '250px' 
    },
    { 
      key: 'address', 
      label: 'Dirección',
      render: (value) => (
        <span className="text-sm text-gray-600">{String(value)}</span>
      )
    },
    { 
      key: 'totalUnits', 
      label: 'Unidades', 
      width: '100px',
      align: 'center',
      render: (value) => (
        <span className="font-semibold text-gray-800">{String(value)}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '100px',
      align: 'center',
      render: (value) => (
        <Badge type={value ? 'success' : 'error'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha Creación',
      width: '140px',
      render: (value) => new Date(String(value)).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '120px',
      align: 'center',
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleViewDetails(row)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => handleEditProperty(row)}
            className="w-8 h-8 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
            title="Editar propiedad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )
    },
  ];

  const handleViewDetails = (property: HorizontalProperty) => {
    router.push(`/properties/${property.id}`);
  };

  const handleEditProperty = (property: HorizontalProperty) => {
    console.log('Editar propiedad:', property);
  };

  const handleCreateProperty = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setPage(1);
    loadProperties();
  };

  // Renderizar tarjetas de propiedades en lugar de tabla tradicional
  const renderPropertyCards = () => {
    console.log('🔍 Propiedades para renderizar:', properties);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          console.log(`🏢 Propiedad ${property.name}:`, {
            id: property.id,
            name: property.name,
            logoUrl: property.logoUrl
          });
          return (
          <div 
            key={property.id}
            className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Logo como fondo */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
              {property.logoUrl ? (
                <>
                  <img 
                    src={property.logoUrl} 
                    alt={`Logo de ${property.name}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      console.log('❌ Error cargando imagen:', property.logoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Imagen cargada correctamente:', property.logoUrl);
                    }}
                  />
                  {/* Overlay sutil solo para el badge */}
                  <div className="absolute top-0 right-0 w-20 h-8 bg-black bg-opacity-30 rounded-bl-lg"></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-white text-5xl font-bold block mb-2">
                      {property.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-white text-xs opacity-80">
                      {property.name}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Estado activo/inactivo */}
              <div className="absolute top-3 right-3 z-10">
                <Badge type={property.isActive ? 'success' : 'error'}>
                  {property.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {property.address}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">{property.totalUnits}</span>
                    unidades
                  </span>
                  <span>
                    ID: {property.id}
                  </span>
                </div>
              </div>

              {/* Fecha de creación */}
              <div className="mb-4">
                <p className="text-xs text-gray-500">
                  Creado: {new Date(property.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className="flex-1 btn btn-sm btn-outline"
                >
                  Ver Detalles
                </button>
                <button 
                  onClick={() => handleDeleteClick(property)}
                  className="btn btn-sm btn-error"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" text="Cargando propiedades..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Propiedades Horizontales ({total})
        </h3>
        <button 
          onClick={handleCreateProperty}
          className="btn btn-primary btn-sm"
        >
          + Agregar Propiedad
        </button>
      </div>

      {properties.length > 0 ? (
        renderPropertyCards()
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades disponibles</h3>
          <p className="text-gray-500 mb-4">Comienza agregando tu primera propiedad horizontal</p>
          <button 
            onClick={handleCreateProperty}
            className="btn btn-primary"
          >
            + Agregar Primera Propiedad
          </button>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-alt">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-button"
          >
            ← Anterior
          </button>
          <span className="pagination-info">
            Página {page} de {totalPages} ({total} total)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-button"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal de creación */}
      <CreatePropertyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar la propiedad "${propertyToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Alert de éxito */}
      {deleteSuccess && (
        <Alert type="success" onClose={() => setDeleteSuccess(null)}>
          {deleteSuccess}
        </Alert>
      )}

      {/* Alert de error */}
      {deleteError && (
        <Alert type="error" onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}
    </div>
  );
}

