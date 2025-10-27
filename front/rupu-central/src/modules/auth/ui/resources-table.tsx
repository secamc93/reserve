'use client';

import { useState, useEffect } from 'react';
import { getResourcesAction, deleteResourceAction } from '@modules/auth/infrastructure/actions';
import { Table, TableColumn, Spinner, Badge, Button, Input, ConfirmModal, Filters, FilterField } from '@shared/ui';
import { PencilIcon, TrashIcon, EyeIcon, CubeTransparentIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '@modules/auth/ui/hooks/use-business-types';
import { EditResourceModal } from './components/edit-resource-modal';

interface ResourcesTableProps {
  token: string;
}

interface Resource {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  business_type_name?: string;
  createdAt: string;
  updatedAt: string;
}

export function ResourcesTable({ token }: ResourcesTableProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Obtener tipos de negocio para el filtro
  const { businessTypes } = useBusinessTypes();

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getResourcesAction({ 
        token,
        page,
        pageSize,
        name: filters.name || undefined,
        description: filters.description || undefined,
        business_type_id: filters.business_type_id ? parseInt(filters.business_type_id) : undefined,
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc',
      });
      
      if (result.success && result.data) {
        setResources(result.data.resources);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.error || 'Error al cargar recursos');
      }
    } catch (err) {
      setError('Error inesperado al cargar recursos');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Definir campos de filtros
  const filterFields: FilterField[] = [
    {
      key: 'name',
      label: 'Buscar por nombre',
      type: 'text',
      placeholder: 'Nombre del recurso',
    },
    {
      key: 'description',
      label: 'Buscar por descripción',
      type: 'text',
      placeholder: 'Descripción del recurso',
      advanced: true,
    },
    {
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        ...(businessTypes?.map((bt) => ({
          value: bt.id.toString(),
          label: `${bt.icon} ${bt.name}`
        })) || [])
      ],
      advanced: true,
    },
    {
      key: 'sortBy',
      label: 'Ordenar por',
      type: 'select',
      options: [
        { value: 'created_at', label: 'Fecha de creación' },
        { value: 'updated_at', label: 'Fecha de actualización' },
        { value: 'name', label: 'Nombre' },
      ],
      advanced: true,
    },
    {
      key: 'sortOrder',
      label: 'Orden',
      type: 'select',
      options: [
        { value: 'desc', label: 'Descendente' },
        { value: 'asc', label: 'Ascendente' },
      ],
      advanced: true,
    },
  ];

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // Reset a la primera página cuando cambian los filtros
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  useEffect(() => {
    loadResources();
  }, [token, page, filters]);

  const handleEditClick = (resource: Resource) => {
    setEditResource(resource);
  };

  const handleEditSuccess = () => {
    setEditResource(null);
    loadResources();
  };

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;

    setDeletingId(resourceToDelete.id);
    try {
      const result = await deleteResourceAction({ id: resourceToDelete.id, token });
      
      if (result.success) {
        // Recargar la lista de recursos
        await loadResources();
        setShowDeleteModal(false);
        setResourceToDelete(null);
      } else {
        setError(result.error || 'Error al eliminar el recurso');
      }
    } catch (err) {
      setError('Error inesperado al eliminar el recurso');
      console.error('Error deleting resource:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setResourceToDelete(null);
  };

  // Ya no filtramos en el frontend, el backend se encarga
  const filteredResources = resources;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Resource>[] = [
    {
      key: 'resource',
      label: 'Recurso',
      render: (_, resource) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <CubeTransparentIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{resource.name}</div>
            <div className="text-sm text-gray-500">ID: {resource.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (description) => (
        <div className="text-sm text-gray-900 max-w-xs">
          {description as string}
        </div>
      ),
    },
    {
      key: 'business_type_name',
      label: 'Tipo de Negocio',
      render: (_, resource) => (
        <div className="text-sm text-gray-900">
          {resource.business_type_name || '-'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (createdAt) => (
        <div className="text-sm text-gray-900">
          {formatDate(createdAt as string)}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Actualizado',
      render: (updatedAt) => (
        <div className="text-sm text-gray-900">
          {formatDate(updatedAt as string)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, resource) => (
        <div className="flex gap-2">
          <Button 
            className="btn-outline btn-sm"
            onClick={() => handleEditClick(resource)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button 
            className="btn-outline btn-sm"
            onClick={() => handleDeleteClick(resource)}
            disabled={deletingId === resource.id}
            loading={deletingId === resource.id}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
        <Button onClick={() => loadResources()} className="btn-primary btn-sm">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Filtros */}
      <Filters
        fields={filterFields}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />


      {/* Tabla de recursos */}
      <Table
        columns={columns}
        data={filteredResources}
        loading={loading}
        keyExtractor={(resource) => resource.id}
        emptyMessage={filters.name || filters.description ? "No se encontraron recursos con los criterios de búsqueda." : "No hay recursos disponibles. Comienza creando tu primer recurso del sistema."}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} de {total} recursos
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-outline btn-sm"
            >
              ← Anterior
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn-outline btn-sm"
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      <EditResourceModal
        isOpen={!!editResource}
        onClose={() => setEditResource(null)}
        onSuccess={handleEditSuccess}
        resource={editResource}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Recurso"
        message={`¿Estás seguro de que quieres eliminar el recurso "${resourceToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}