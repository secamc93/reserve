'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getResourcesAction, deleteResourceAction } from '../../infrastructure/actions';
import { Table, TableColumn, Button, ConfirmModal, PaginationProps, TableFiltersProps } from '@shared/ui';
import { FilterOption, ActiveFilter } from '@shared/ui/dynamic-filters';
import { PencilIcon, TrashIcon, CubeTransparentIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '../../../business-types/ui/hooks';
import { EditResourceModal } from './edit-resource-modal';
import type { Resource } from '../../domain/entities';

interface ResourcesTableProps {
  token: string;
}

interface ResourceUI {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  business_type_name?: string;
  createdAt: string;
  updatedAt: string;
}

export function ResourcesTable({ token }: ResourcesTableProps) {
  const [resources, setResources] = useState<ResourceUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceUI | null>(null);
  const [editResource, setEditResource] = useState<ResourceUI | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        sortBy: sortBy,
        sortOrder: sortOrder,
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

  useEffect(() => {
    loadResources();
  }, [token, page, pageSize, filters, sortBy, sortOrder]);

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
  if (filters.description) {
    activeFilters.push({
      key: 'description',
      label: 'Descripción',
      value: filters.description,
      type: 'text',
    });
  }
  if (filters.business_type_id) {
    const businessType = businessTypes?.find(bt => bt.id === parseInt(filters.business_type_id));
    activeFilters.push({
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      value: businessType ? `${businessType.icon} ${businessType.name}` : filters.business_type_id,
      type: 'select',
    });
  }

  // Definir filtros disponibles
  const availableFilters: FilterOption[] = [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre',
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Buscar por descripción',
    },
    {
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      type: 'select',
      options: businessTypes?.map((bt) => ({
        value: bt.id.toString(),
        label: `${bt.icon} ${bt.name}`
      })) || [],
    },
  ];

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'business_type_id') {
      newFilters.business_type_id = value;
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    setPage(1); // Reset a la primera página cuando cambian los filtros
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    delete (newFilters as any)[filterKey];
    setFilters(newFilters);
    setPage(1);
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleEditClick = (resource: ResourceUI) => {
    setEditResource(resource);
  };

  const handleEditSuccess = () => {
    setEditResource(null);
    loadResources();
  };

  const handleDeleteClick = (resource: ResourceUI) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<ResourceUI>[] = [
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

  // Configurar paginación
  const pagination: PaginationProps = {
    currentPage: page,
    totalPages: totalPages,
    totalItems: total,
    itemsPerPage: pageSize,
    onPageChange: setPage,
    onItemsPerPageChange: setPageSize,
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  };

  // Configurar filtros
  const tableFilters: TableFiltersProps = {
    availableFilters,
    activeFilters,
    onAddFilter: handleAddFilter,
    onRemoveFilter: handleRemoveFilter,
    sortBy: sortBy,
    sortOrder: sortOrder,
    onSortChange: handleSortChange,
    sortOptions: [
      { value: 'created_at', label: 'Fecha de creación' },
      { value: 'updated_at', label: 'Fecha de actualización' },
      { value: 'name', label: 'Nombre' },
    ],
    headerActions: (
      <Link href="/iam/resources/create" className="btn btn-primary" title="Crear Recurso">
        <PlusIcon className="w-5 h-5" />
      </Link>
    ),
  };

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
    <div className="w-full">
      {/* Tabla de recursos con filtros y paginación integrada */}
      <Table
        columns={columns}
        data={resources}
        loading={loading}
        keyExtractor={(resource) => resource.id.toString()}
        emptyMessage={filters.name || filters.description ? "No se encontraron recursos con los criterios de búsqueda." : "No hay recursos disponibles. Comienza creando tu primer recurso del sistema."}
        pagination={pagination}
        filters={tableFilters}
      />

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
