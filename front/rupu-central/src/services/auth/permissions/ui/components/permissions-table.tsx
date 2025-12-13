'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPermissionsListAction, deletePermissionAction } from '../../infrastructure/actions';
import { Table, TableColumn, Badge, Button, ConfirmModal, PaginationProps, TableFiltersProps, FilterOption, ActiveFilter } from '@shared/ui';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { EditPermissionModal } from './edit-permission-modal';
import Link from 'next/link';

interface PermissionsTableProps {
  token: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  resourceId: number;
  action: string;
  actionId: number;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
  businessTypeId?: number;
  businessTypeName?: string;
}

export function PermissionsTable({ token }: PermissionsTableProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionToEdit, setPermissionToEdit] = useState<Permission | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Estado de filtros
  const [filters, setFilters] = useState<{
    name?: string;
    resource?: string;
    action?: string;
    scopeName?: string;
    businessTypeName?: string;
  }>({});

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPermissionsListAction(token);

      if (result.success && result.data) {
        setPermissions(result.data.permissions);
      } else {
        setError(result.error || 'Error al cargar permisos');
      }
    } catch (err) {
      setError('Error inesperado al cargar permisos');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [token]);

  // Filtrar permisos según los filtros activos
  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      if (filters.name && !permission.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.resource && !permission.resource.toLowerCase().includes(filters.resource.toLowerCase())) {
        return false;
      }
      if (filters.action && !permission.action.toLowerCase().includes(filters.action.toLowerCase())) {
        return false;
      }
      if (filters.scopeName && !permission.scopeName.toLowerCase().includes(filters.scopeName.toLowerCase())) {
        return false;
      }
      if (filters.businessTypeName && !permission.businessTypeName?.toLowerCase().includes(filters.businessTypeName.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [permissions, filters]);

  // Calcular paginación
  const totalItems = filteredPermissions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

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
  if (filters.resource) {
    activeFilters.push({
      key: 'resource',
      label: 'Recurso',
      value: filters.resource,
      type: 'text',
    });
  }
  if (filters.action) {
    activeFilters.push({
      key: 'action',
      label: 'Acción',
      value: filters.action,
      type: 'text',
    });
  }
  if (filters.scopeName) {
    activeFilters.push({
      key: 'scopeName',
      label: 'Scope',
      value: filters.scopeName,
      type: 'text',
    });
  }
  if (filters.businessTypeName) {
    activeFilters.push({
      key: 'businessTypeName',
      label: 'Tipo de Negocio',
      value: filters.businessTypeName,
      type: 'text',
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
      key: 'resource',
      label: 'Recurso',
      type: 'text',
      placeholder: 'Buscar por recurso',
    },
    {
      key: 'action',
      label: 'Acción',
      type: 'text',
      placeholder: 'Buscar por acción',
    },
    {
      key: 'scopeName',
      label: 'Scope',
      type: 'text',
      placeholder: 'Buscar por scope',
    },
    {
      key: 'businessTypeName',
      label: 'Tipo de Negocio',
      type: 'text',
      placeholder: 'Buscar por tipo de negocio',
    },
  ];

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1); // Resetear a la primera página al agregar un filtro
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey as keyof typeof newFilters];
      return newFilters;
    });
    setCurrentPage(1); // Resetear a la primera página al remover un filtro
  };

  const handleDeleteClick = (permission: Permission) => {
    setPermissionToDelete(permission);
  };

  const handleEditClick = (permission: Permission) => {
    setPermissionToEdit(permission);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadPermissions();
  };

  const handleDeleteConfirm = async () => {
    if (!permissionToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deletePermissionAction({
        id: permissionToDelete.id,
        token,
      });

      if (result.success) {
        // Remover el permiso de la lista
        const updatedPermissions = permissions.filter(p => p.id !== permissionToDelete.id);
        setPermissions(updatedPermissions);
        setPermissionToDelete(null);
        
        // Ajustar la página si es necesario
        const filteredCount = updatedPermissions.filter(p => {
          if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
          if (filters.resource && !p.resource.toLowerCase().includes(filters.resource.toLowerCase())) return false;
          if (filters.action && !p.action.toLowerCase().includes(filters.action.toLowerCase())) return false;
          if (filters.scopeName && !p.scopeName.toLowerCase().includes(filters.scopeName.toLowerCase())) return false;
          if (filters.businessTypeName && !p.businessTypeName?.toLowerCase().includes(filters.businessTypeName.toLowerCase())) return false;
          return true;
        }).length;
        
        const newTotalPages = Math.ceil(filteredCount / pageSize);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        setError(result.error || 'Error al eliminar permiso');
      }
    } catch (err) {
      setError('Error inesperado al eliminar permiso');
      console.error('Error deleting permission:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Permission>[] = [
    {
      key: 'name',
      label: 'Nombre del Permiso',
      render: (_, permission) => (
        <div className="font-medium text-gray-900">{permission.name || 'Sin nombre'}</div>
      ),
    },
    {
      key: 'resource',
      label: 'Recurso',
      render: (resource) => (
        <div className="text-sm text-gray-900">
          {resource as string}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Acción',
      render: (action) => (
        <Badge className="badge-primary">
          {action as string}
        </Badge>
      ),
    },
    {
      key: 'scope',
      label: 'Scope',
      render: (_, permission) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{permission.scopeName}</div>
          <div className="text-gray-500">{permission.scopeCode}</div>
        </div>
      ),
    },
    {
      key: 'businessTypeName',
      label: 'Tipo de Negocio',
      render: (_, permission) => (
        <div className="text-sm text-gray-900">
          {permission.businessTypeName || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, permission) => (
        <div className="flex gap-2">
          <Button className="btn-outline btn-sm">
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            className="btn-outline btn-sm"
            onClick={() => handleEditClick(permission)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            className="btn-outline btn-sm hover:bg-red-50 hover:text-red-600"
            onClick={() => handleDeleteClick(permission)}
            disabled={isDeleting}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Configurar paginación
  const pagination: PaginationProps = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: pageSize,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: (size) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  };

  // Configurar filtros
  const tableFilters: TableFiltersProps = {
    availableFilters,
    activeFilters,
    onAddFilter: handleAddFilter,
    onRemoveFilter: handleRemoveFilter,
    headerActions: (
      <Link href="/iam/permissions/create" className="btn btn-primary" title="Crear Permiso">
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
        <Button onClick={() => loadPermissions()} className="btn-primary btn-sm">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Tabla de permisos con filtros y paginación integrada */}
      <Table
        columns={columns}
        data={paginatedPermissions}
        loading={loading}
        keyExtractor={(permission) => permission.id.toString()}
        emptyMessage={activeFilters.length > 0 ? "No se encontraron permisos con los criterios de búsqueda." : "No hay permisos disponibles. Comienza creando tu primer permiso del sistema."}
        pagination={pagination}
        filters={tableFilters}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!permissionToDelete}
        onClose={() => setPermissionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Permiso"
        message={`¿Estás seguro de que quieres eliminar el permiso "${permissionToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <EditPermissionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPermissionToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        token={token}
        permission={
          permissionToEdit
            ? {
              id: permissionToEdit.id,
              name: permissionToEdit.name,
              resourceId: permissionToEdit.resourceId,
              actionId: permissionToEdit.actionId,
              description: permissionToEdit.description,
              resource: permissionToEdit.resource,
              action: permissionToEdit.action,
              scopeId: permissionToEdit.scopeId,
              businessTypeId: permissionToEdit.businessTypeId,
              businessTypeName: permissionToEdit.businessTypeName,
            }
            : null
        }
      />
    </>
  );
}
