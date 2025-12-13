/**
 * Página principal de usuarios
 * Integra todos los componentes y aplica estilos globales
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { TokenStorage } from '@shared/config';
import { useUsers } from '../hooks/use-users';
import { useUserModals } from '../hooks/use-user-modals';
import { UsersTable } from './users-table';
import { UserForm } from './user-form';
import { FilterOption, ActiveFilter } from '@shared/ui/dynamic-filters';
import { getRolesAction } from '../../../roles/infrastructure/actions';
import { getBusinessesAction } from '../../../businesses/infrastructure/actions';
import { useBusinessTypes } from '../../../business-types/ui/hooks';
import { UserDetailModal } from './user-detail-modal';
import { AssignRolesModal } from './assign-roles-modal';

export function UsersPage() {
  // Hooks
  const {
    users,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    filters,
    loadUsers,
    setPage,
    setPageSize,
    setFilters,
    refresh
  } = useUsers({
    initialPage: 1,
    pageSize: 10,
    autoLoad: false
  });

  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,
    isAssignRolesModalOpen,
    selectedUser,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,
    openAssignRolesModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeViewModal,
    closeAssignRolesModal,
    closeAllModals
  } = useUserModals();

  // Estado local
  const [token, setToken] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [businessOptions, setBusinessOptions] = useState<Array<{ value: string; label: string }>>([]);
  const { businessTypes } = useBusinessTypes();

  // Cargar token y opciones para filtros
  useEffect(() => {
    // Obtener token usando TokenStorage
    const authToken = TokenStorage.getBusinessToken();
    setToken(authToken);
    
    if (authToken) {
      loadUsers(authToken);
      
      // Cargar opciones de roles
      (async () => {
        try {
          const rolesRes = await getRolesAction(authToken);
          if (rolesRes.success && rolesRes.data) {
            setRoleOptions(
              rolesRes.data.roles.map((r: any) => ({ 
                value: r.id.toString(), 
                label: r.name 
              }))
            );
          }
        } catch (e) {
          console.error('Error cargando roles:', e);
        }
      })();

      // Cargar opciones de negocios
      (async () => {
        try {
          const bizRes = await getBusinessesAction({ token: authToken, page: 1, per_page: 100, name: '' });
          if (bizRes.success && bizRes.data) {
            setBusinessOptions(
              bizRes.data.businesses.map((b: any) => ({ 
                value: b.id.toString(), 
                label: b.name 
              }))
            );
          }
        } catch (e) {
          console.error('Error cargando negocios:', e);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convertir filtros de usuarios a ActiveFilter[]
  const activeFilters: ActiveFilter[] = [];
  if (filters.name) {
    activeFilters.push({
      key: 'name',
      label: 'Nombre',
      value: filters.name,
      type: 'text',
    });
  }
  if (filters.email) {
    activeFilters.push({
      key: 'email',
      label: 'Email',
      value: filters.email,
      type: 'text',
    });
  }
  if (filters.phone) {
    activeFilters.push({
      key: 'phone',
      label: 'Teléfono',
      value: filters.phone,
      type: 'text',
    });
  }
  if (filters.is_active !== undefined) {
    activeFilters.push({
      key: 'is_active',
      label: 'Estado',
      value: filters.is_active,
      type: 'boolean',
    });
  }
  if (filters.role_id) {
    activeFilters.push({
      key: 'role_id',
      label: 'Rol',
      value: filters.role_id.toString(),
      type: 'select',
    });
  }
  if (filters.business_id) {
    activeFilters.push({
      key: 'business_id',
      label: 'Negocio',
      value: filters.business_id.toString(),
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
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Buscar por email',
    },
    {
      key: 'phone',
      label: 'Teléfono',
      type: 'text',
      placeholder: 'Buscar por teléfono',
    },
    {
      key: 'is_active',
      label: 'Estado',
      type: 'boolean',
    },
    {
      key: 'role_id',
      label: 'Rol',
      type: 'select',
      options: roleOptions,
    },
    {
      key: 'business_id',
      label: 'Negocio',
      type: 'select',
      options: businessOptions,
    },
  ];

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'is_active') {
      newFilters.is_active = value === true;
    } else if (filterKey === 'role_id') {
      newFilters.role_id = parseInt(value);
    } else if (filterKey === 'business_id') {
      newFilters.business_id = parseInt(value);
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    
    // Recargar usuarios con los nuevos filtros
    if (token) {
      loadUsers(token, { ...newFilters, page: 1, page_size: pageSize });
    }
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    
    // Limpiar el filtro según su tipo
    if (filterKey === 'is_active') {
      delete newFilters.is_active;
    } else if (filterKey === 'role_id') {
      delete newFilters.role_id;
    } else if (filterKey === 'business_id') {
      delete newFilters.business_id;
    } else {
      delete (newFilters as any)[filterKey];
    }
    
    setFilters(newFilters);
    
    // Recargar usuarios con los nuevos filtros
    if (token) {
      loadUsers(token, { ...newFilters, page: currentPage, page_size: pageSize });
    }
  };

  // Manejar éxito de operaciones CRUD
  const handleCrudSuccess = () => {
    refresh();
    closeAllModals();
  };

  // Manejar error
  const handleError = (error: string) => {
    console.error('Error en operación de usuario:', error);
  };

  if (!token) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Token de autenticación requerido
          </h3>
          <p className="text-gray-600">
            Por favor, inicia sesión para acceder a la gestión de usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabla de usuarios con filtros y paginación integrada */}
      <UsersTable
        users={users}
        loading={loading}
        onRefresh={refresh}
        onEditUser={openEditModal}
        onViewUser={openViewModal}
        onDeleteUser={openDeleteModal}
        onAssignRoles={openAssignRolesModal}
        selectedUser={selectedUser}
        isDeleteModalOpen={isDeleteModalOpen}
        closeDeleteModal={closeDeleteModal}
        isViewModalOpen={isViewModalOpen}
        closeViewModal={closeViewModal}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        filters={{
          availableFilters,
          activeFilters,
          onAddFilter: handleAddFilter,
          onRemoveFilter: handleRemoveFilter,
          headerActions: (
            <Button
              variant="primary"
              onClick={openCreateModal}
              className="btn-primary"
              title="Nuevo Usuario"
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
          ),
        }}
      />

      {/* Error general */}
      {error && (
        <div className="alert alert-error">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <div>
            <h4 className="font-semibold">Error al cargar usuarios</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Modales */}
      <UserForm
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={handleCrudSuccess}
        mode="create"
      />

      <UserForm
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSuccess={handleCrudSuccess}
        user={selectedUser}
        mode="edit"
      />
      

      {/* Modal de detalles del usuario */}
      <UserDetailModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        user={selectedUser}
      />

      {/* Modal de asignar roles */}
      <AssignRolesModal
        isOpen={isAssignRolesModalOpen}
        onClose={closeAssignRolesModal}
        user={selectedUser}
        onSuccess={handleCrudSuccess}
      />
    </div>
  );
}
