/**
 * Página principal de usuarios
 * Integra todos los componentes y aplica estilos globales
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { TokenStorage } from '@shared/config';
import { useUsers } from '../hooks/use-users';
import { useUserModals } from '../hooks/use-user-modals';
import { UsersTable } from './users-table';
import { UsersFilters } from './users-filters';
import { UsersPagination } from './users-pagination';
import { UserForm } from './user-form';
import { UserDetailModal } from './user-detail-modal';

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
    selectedUser,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeViewModal,
    closeAllModals
  } = useUserModals();

  // Estado local
  const [token, setToken] = useState<string | null>(null);

  // Cargar token (esto debería venir de un contexto de auth)
  useEffect(() => {
    // Obtener token usando TokenStorage como property-horizontal
    const authToken = TokenStorage.getToken();
    setToken(authToken);
    
    if (authToken) {
      loadUsers(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Manejar limpieza de filtros
  const handleClearFilters = () => {
    setFilters({});
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="btn-outline"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <UsersFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Tabla de usuarios */}
      <UsersTable
        users={users}
        loading={loading}
        onRefresh={refresh}
        onEditUser={openEditModal}
        onViewUser={openViewModal}
        onDeleteUser={openDeleteModal}
        selectedUser={selectedUser}
        isDeleteModalOpen={isDeleteModalOpen}
        closeDeleteModal={closeDeleteModal}
        isViewModalOpen={isViewModalOpen}
        closeViewModal={closeViewModal}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          loading={loading}
        />
      )}

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
    </div>
  );
}
