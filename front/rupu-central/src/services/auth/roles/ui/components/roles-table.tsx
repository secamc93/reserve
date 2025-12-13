'use client';

import { useState, useEffect } from 'react';
import { getRolesAction, GetRolesActionParams, assignRolePermissionsAction, removeRolePermissionAction, updateRoleAction } from '../../infrastructure/actions';
import { Table, TableColumn, PaginationProps, TableFiltersProps } from '@shared/ui/table';
import { Badge, Button } from '@shared/ui';
import { FilterOption, ActiveFilter } from '@shared/ui/dynamic-filters';
import { PencilIcon, TrashIcon, ShieldCheckIcon, KeyIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CreateRoleModal } from './create-role-modal';
import { UpdateRoleModal } from './update-role-modal';
import { AssignPermissionsModal } from './assign-permissions-modal';
import { useBusinessTypes } from '../../../business-types/ui/hooks';
import { TokenStorage } from '@shared/config';
import Link from 'next/link';

interface RolesTableProps {
  token: string;
}

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
  businessTypeId?: number;
  businessTypeName?: string;
}

export function RolesTable({ token }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignPermissionsModal, setShowAssignPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Obtener tipos de negocio para el filtro
  const { businessTypes } = useBusinessTypes();

  // Filtros
  const [filters, setFilters] = useState<GetRolesActionParams>({});

  const handleCreateRole = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadRoles(); // Recargar la lista
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowUpdateModal(true);
  };

  const handleUpdateRole = async (formData: any) => {
    setUpdateLoading(true);
    try {
      const result = await updateRoleAction(formData, token);

      if (result.success) {
        setShowUpdateModal(false);
        setSelectedRole(null);
        loadRoles(); // Recargar la lista
      } else {
        console.error('Error actualizando rol:', result.error);
        alert(`Error al actualizar el rol: ${result.error}`);
      }
    } catch (err) {
      console.error('Error actualizando rol:', err);
      alert('Error inesperado al actualizar el rol');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedRole(null);
  };

  const handleOpenAssignPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setShowAssignPermissionsModal(true);
  };

  const handleCloseAssignPermissionsModal = () => {
    setShowAssignPermissionsModal(false);
    setSelectedRole(null);
  };

  const handleAssignPermissions = async (roleId: number, permissionIds: number[]) => {
    setAssignLoading(true);
    try {
      const result = await assignRolePermissionsAction(
        { role_id: roleId, permission_ids: permissionIds },
        token
      );

      if (result.success) {
        setShowAssignPermissionsModal(false);
        setSelectedRole(null);
        loadRoles(filters); // Recargar la lista
      } else {
        console.error('Error asignando permisos:', result.error);
        alert(`Error al asignar permisos: ${result.error}`);
      }
    } catch (err) {
      console.error('Error asignando permisos:', err);
      alert('Error inesperado al asignar permisos');
    } finally {
      setAssignLoading(false);
    }
  };

  const loadRoles = async (params?: GetRolesActionParams, page: number = 1, size: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRolesAction(token, {
        ...params,
        page,
        page_size: size,
      });

      if (result.success && result.data) {
        setRoles(result.data.roles);
        setTotalCount(result.data.total || result.data.count || 0);
        setTotalPages(result.data.total_pages || Math.ceil((result.data.total || result.data.count || 0) / size));
      } else {
        setError(result.error || 'Error al cargar roles');
      }
    } catch (err) {
      setError('Error inesperado al cargar roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadRoles(filters, currentPage, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage, pageSize]);

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
  if (filters.scope_id) {
    activeFilters.push({
      key: 'scope_id',
      label: 'Scope',
      value: filters.scope_id.toString(),
      type: 'select',
    });
  }
  if (filters.is_system !== undefined) {
    activeFilters.push({
      key: 'is_system',
      label: 'Tipo',
      value: filters.is_system,
      type: 'boolean',
    });
  }
  if (filters.level) {
    activeFilters.push({
      key: 'level',
      label: 'Nivel',
      value: filters.level.toString(),
      type: 'text',
    });
  }
  if (filters.business_type_id) {
    activeFilters.push({
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      value: filters.business_type_id.toString(),
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
      key: 'scope_id',
      label: 'Scope',
      type: 'select',
      options: [
        { value: '1', label: 'Plataforma' },
        { value: '2', label: 'Negocio' },
      ],
    },
    {
      key: 'is_system',
      label: 'Tipo',
      type: 'boolean',
    },
    {
      key: 'level',
      label: 'Nivel',
      type: 'text',
      placeholder: '1-10',
    },
    {
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      type: 'select',
      options: businessTypes?.map((bt: { id: number; name: string; icon: string }) => ({
        value: bt.id.toString(),
        label: `${bt.icon} ${bt.name}`
      })) || [],
    },
  ];

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters: GetRolesActionParams = { ...filters };
    
    if (filterKey === 'scope_id') {
      newFilters.scope_id = parseInt(value);
    } else if (filterKey === 'is_system') {
      newFilters.is_system = value === true;
    } else if (filterKey === 'level') {
      newFilters.level = parseInt(value);
    } else if (filterKey === 'business_type_id') {
      newFilters.business_type_id = parseInt(value);
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    setCurrentPage(1); // Reset a página 1 cuando se filtran
    // Recargar con los nuevos filtros
    loadRoles(newFilters, 1, pageSize);
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters: GetRolesActionParams = { ...filters };
    
    if (filterKey === 'scope_id') {
      delete newFilters.scope_id;
    } else if (filterKey === 'is_system') {
      delete newFilters.is_system;
    } else if (filterKey === 'level') {
      delete newFilters.level;
    } else if (filterKey === 'business_type_id') {
      delete newFilters.business_type_id;
    } else {
      delete (newFilters as any)[filterKey];
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
    // Recargar con los filtros actualizados
    loadRoles(newFilters, 1, pageSize);
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Role>[] = [
    {
      key: 'role',
      label: 'Rol',
      render: (_, role) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{role.name}</div>
            <div className="text-sm text-gray-500">ID: {role.id}</div>
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
      key: 'level',
      label: 'Nivel',
      render: (level) => (
        <Badge className="badge-primary">
          Nivel {level as number}
        </Badge>
      ),
    },
    {
      key: 'isSystem',
      label: 'Tipo',
      render: (isSystem) => (
        <Badge className={isSystem ? 'badge-warning' : 'badge-success'}>
          {isSystem ? 'Sistema' : 'Personalizado'}
        </Badge>
      ),
    },
    {
      key: 'scopeId',
      label: 'Scope ID',
      render: (scopeId) => (
        <div className="text-sm text-gray-900">
          {scopeId as number}
        </div>
      ),
    },
    {
      key: 'scopeName',
      label: 'Scope',
      render: (scopeName) => (
        <div className="text-sm text-gray-900">
          {scopeName as string}
        </div>
      ),
    },
    {
      key: 'businessTypeName',
      label: 'Tipo de Negocio',
      render: (_, role) => (
        <div className="text-sm text-gray-900">
          {role.businessTypeName || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, role) => (
        <div className="flex gap-2">
          <Button className="btn-outline btn-sm" onClick={() => handleOpenAssignPermissionsModal(role)}>
            <KeyIcon className="w-4 h-4" />
          </Button>
          <Button className="btn-outline btn-sm" onClick={() => handleEditRole(role)}>
            <PencilIcon className="w-4 h-4" />
          </Button>
          {!role.isSystem && (
            <Button className="btn-outline btn-sm">
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pagination: PaginationProps = {
    currentPage,
    totalPages,
    totalItems: totalCount,
    itemsPerPage: pageSize,
    onPageChange: (page) => {
      setCurrentPage(page);
      loadRoles(filters, page, pageSize);
    },
    onItemsPerPageChange: (size) => {
      setPageSize(size);
      setCurrentPage(1);
      loadRoles(filters, 1, size);
    },
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  };

  const tableFilters: TableFiltersProps = {
    availableFilters,
    activeFilters,
    onAddFilter: handleAddFilter,
    onRemoveFilter: handleRemoveFilter,
    headerActions: (
      <Link href="/iam/roles/create" className="btn btn-primary" title="Crear Rol">
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
        <Button onClick={() => loadRoles(filters, currentPage, pageSize)} className="btn-primary btn-sm">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Tabla de roles con filtros y paginación integrada */}
      <Table
        columns={columns}
        data={roles}
        loading={loading}
        keyExtractor={(role) => role.id.toString()}
        emptyMessage="No hay roles disponibles. Comienza creando tu primer rol del sistema."
        pagination={pagination}
        filters={tableFilters}
      />

      {/* Modal para crear rol */}
      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal para editar rol */}
      <UpdateRoleModal
        isOpen={showUpdateModal}
        onClose={handleCloseUpdateModal}
        role={selectedRole}
        onSubmit={handleUpdateRole}
        loading={updateLoading}
      />

      {/* Modal para asignar permisos */}
      <AssignPermissionsModal
        isOpen={showAssignPermissionsModal}
        onClose={handleCloseAssignPermissionsModal}
        roleId={selectedRole?.id || null}
        roleName={selectedRole?.name}
        onAssign={handleAssignPermissions}
        onRemove={async (roleId: number, permissionId: number) => {
          setAssignLoading(true);
          try {
            const token = TokenStorage.getBusinessToken();
            if (!token) {
              console.error('No hay token disponible');
              return;
            }

            const result = await removeRolePermissionAction(
              { role_id: roleId, permission_id: permissionId },
              token
            );

            if (result.success) {
              // Recargar los permisos del rol para actualizar la vista
              console.log('Permiso removido exitosamente');
            } else {
              console.error('Error removiendo permiso:', result.error);
              alert(`Error al remover permiso: ${result.error}`);
            }
          } catch (err) {
            console.error('Error removiendo permiso:', err);
            alert('Error inesperado al remover permiso');
          } finally {
            setAssignLoading(false);
          }
        }}
        loading={assignLoading}
      />
    </div>
  );
}
