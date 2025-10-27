'use client';

import { useState, useEffect } from 'react';
import { getRolesAction, GetRolesActionParams, assignRolePermissionsAction, removeRolePermissionAction } from '@modules/auth/infrastructure/actions';
import { Table, TableColumn, Spinner, Badge, Button, Filters, FilterField } from '@shared/ui';
import { PencilIcon, TrashIcon, EyeIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { CreateRoleModal } from './roles/create-role-modal';
import { UpdateRoleModal } from './roles/update-role-modal';
import { AssignPermissionsModal } from './roles/assign-permissions-modal';
import { updateRoleAction } from '@modules/auth/infrastructure/actions';
import { useBusinessTypes } from '@modules/auth/ui/hooks/use-business-types';
import { TokenStorage } from '@shared/config';

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
  
  // Obtener tipos de negocio para el filtro
  const { businessTypes } = useBusinessTypes();
  
  // Filtros
  const [filters, setFilters] = useState<GetRolesActionParams>({});
  
  // Definir campos de filtros
  const filterFields: FilterField[] = [
    {
      key: 'name',
      label: 'Buscar por nombre',
      type: 'text',
      placeholder: 'Nombre del rol',
    },
    {
      key: 'scope_id',
      label: 'Scope',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: '1', label: 'Plataforma' },
        { value: '2', label: 'Negocio' },
      ],
      advanced: true,
    },
    {
      key: 'is_system',
      label: 'Tipo',
      type: 'boolean',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Sistema' },
        { value: 'false', label: 'Personalizado' },
      ],
      advanced: true,
    },
    {
      key: 'level',
      label: 'Nivel',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
      advanced: true,
    },
    {
      key: 'business_type_id',
      label: 'Tipo de Negocio',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        ...(businessTypes?.map((bt: { id: number; name: string; icon: string }) => ({
          value: bt.id.toString(),
          label: `${bt.icon} ${bt.name}`
        })) || [])
      ],
      advanced: true,
    },
  ];

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

  const loadRoles = async (params?: GetRolesActionParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRolesAction(token, params);
      
      if (result.success && result.data) {
        setRoles(result.data.roles);
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
    loadRoles(filters);
  }, [token, filters]);
  
  const handleFiltersChange = (newFilters: any) => {
    // Convertir filtros del componente Filters al formato esperado por la acción
    const convertedFilters: GetRolesActionParams = {
      name: newFilters.name,
      scope_id: newFilters.scope_id ? parseInt(newFilters.scope_id) : undefined,
      is_system: newFilters.is_system !== undefined ? newFilters.is_system : undefined,
      level: newFilters.level ? parseInt(newFilters.level) : undefined,
      business_type_id: newFilters.business_type_id ? parseInt(newFilters.business_type_id) : undefined,
    };
    setFilters(convertedFilters);
  };
  
  const clearFilters = () => {
    setFilters({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
        <Button onClick={() => loadRoles()} className="btn-primary btn-sm">
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
        onClearFilters={clearFilters}
      />

      {/* Tabla de roles */}
      <Table
        columns={columns}
        data={roles}
        loading={loading}
        keyExtractor={(role) => role.id}
        emptyMessage="No hay roles disponibles. Comienza creando tu primer rol del sistema."
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
            const token = TokenStorage.getToken();
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