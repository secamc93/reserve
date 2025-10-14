/**
 * Componente: Tabla de Propiedades Horizontales
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Badge, Spinner, Alert, ConfirmModal, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getHorizontalPropertiesAction, deleteHorizontalPropertyAction } from '../../infrastructure/actions';
import { CreatePropertyModal } from './create-property-modal';

interface HorizontalProperty {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  isActive: boolean;
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
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
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

    const token = TokenStorage.getToken();
    if (!token) {
      setDeleteError('No se encontró el token de autenticación');
      return;
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

      <Table
        columns={columns}
        data={properties}
        loading={loading}
        emptyMessage="No hay propiedades disponibles"
        keyExtractor={(row) => row.id}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Página {page} de {totalPages} ({total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline btn-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline btn-sm"
            >
              Siguiente
            </button>
          </div>
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

